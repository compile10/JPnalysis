import Anthropic from "@anthropic-ai/sdk";
import { type NextRequest, NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import type { SentenceAnalysis } from "@/types/analysis";

// Cache for memoizing API responses
interface CacheEntry {
  data: SentenceAnalysis;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// Clean up expired cache entries
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION_MS) {
      responseCache.delete(key);
    }
  }
}

// Get cached response if available and not expired
function getCachedResponse(sentence: string): SentenceAnalysis | null {
  const cached = responseCache.get(sentence);
  if (cached) {
    const now = Date.now();
    if (now - cached.timestamp <= CACHE_DURATION_MS) {
      return cached.data;
    }
    // Expired, remove it
    responseCache.delete(sentence);
  }
  return null;
}

// Store response in cache
function setCachedResponse(sentence: string, data: SentenceAnalysis) {
  responseCache.set(sentence, {
    data,
    timestamp: Date.now(),
  });
  
  // Periodically clean up expired entries
  if (responseCache.size > 100) {
    cleanExpiredCache();
  }
}

// Define the schema for structured output
const analysisSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object" as const,
  properties: {
    originalSentence: {
      type: "string" as const,
      description: "The original Japanese sentence",
    },
    words: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          id: {
            type: "string" as const,
            description: "Unique identifier for this word/phrase",
          },
          text: {
            type: "string" as const,
            description: "The actual text of the word/phrase in Japanese (NOT including particles - those go in attachedParticle)",
          },
          reading: {
            type: "string" as const,
            description: "Hiragana reading of the word (optional)",
          },
          partOfSpeech: {
            type: "string" as const,
            description:
              "Part of speech (e.g., noun, verb, adjective, particle, etc.)",
          },
          modifies: {
            type: "array" as const,
            items: {
              type: "string" as const,
            },
            description:
              "Array of IDs of words/phrases that this word modifies or relates to",
          },
          position: {
            type: "number",
            description: "Position in the sentence (0-indexed)",
          },
          attachedParticle: {
            type: "object" as const,
            properties: {
              text: {
                type: "string" as const,
                description: "The particle text (e.g., は, を, に, が, etc.)",
              },
              reading: {
                type: "string" as const,
                description: "Hiragana reading of the particle (optional)",
              },
              description: {
                type: "string" as const,
                description: "A brief explanation of what this particle does in this specific sentence context (1-2 sentences)",
              },
            },
            required: ["text", "description"],
            description: "Particle attached to this word (if any). Do NOT create separate word entries for particles.",
          },
          isTopic: {
            type: "boolean" as const,
            description: "True if this word is the sentence topic. Topics provide context but don't modify the main sentence.",
          },
        },
        required: ["id", "text", "partOfSpeech", "position"],
      },
    },
    explanation: {
      type: "string" as const,
      description: "Brief HTML-formatted explanation of the sentence structure. Use HTML tags like <p>, <strong>, <em>, <ul>, <li> for better formatting.",
    },
    isFragment: {
      type: "boolean" as const,
      description: "True if this is a sentence fragment or incomplete sentence (e.g., missing a verb, incomplete thought, or not a grammatically complete sentence). False if it's a complete sentence.",
    },
  },
  required: ["originalSentence", "words", "explanation", "isFragment"],
  additionalProperties: false,
};

export async function POST(request: NextRequest) {
  try {
    const { sentence } = await request.json();

    if (!sentence || typeof sentence !== "string") {
      return NextResponse.json(
        { error: "Invalid sentence provided" },
        { status: 400 },
      );
    }

    // Check cache first
    const cachedResponse = getCachedResponse(sentence);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 },
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `Analyze the following Japanese sentence and break it down into its constituent words and phrases. For each word/phrase, identify what it modifies or relates to in the sentence. This will be used to create a visual diagram showing the grammatical relationships.

Sentence: ${sentence}

First, determine whether this is a COMPLETE SENTENCE or a SENTENCE FRAGMENT:
- A complete sentence has a predicate (verb, adjective, or copula) and expresses a complete thought
- A fragment is missing key components (e.g., just a noun phrase, incomplete clause, etc.)
- Set "isFragment: true" if it's a fragment, "isFragment: false" if it's complete

IMPORTANT RULES:
1. Particles (は, を, に, が, の, etc.) should be ATTACHED to their corresponding words using the "attachedParticle" field. Do NOT create separate word entries for particles.
   Example: "私は" → { text: "私", attachedParticle: { text: "は", description: "Marks '私' as the topic of the sentence" } }

2. For EACH particle, provide a brief description (1-2 sentences) explaining its function in THIS specific sentence. Be contextual and practical.
   Examples:
   - は: "Marks the topic - what the sentence is about"
   - を: "Marks the direct object of the verb"
   - に: "Indicates the destination/direction of movement"

3. The TOPIC (marked with は or も) should be identified with "isTopic: true". Topics provide context but DO NOT modify other words in the sentence. Topics should have an EMPTY "modifies" array or no "modifies" field.
   Example: "私は" (I) is the topic → { text: "私", attachedParticle: { text: "は", description: "..." }, isTopic: true, modifies: [] }

3. For modification relationships:
   - Adjectives modify nouns
   - Adverbs modify verbs/adjectives
   - Objects (を) modify verbs
   - Topics (は) do NOT modify anything - they provide context only

Please provide:
1. Each word/phrase broken down with its reading and part of speech
2. Particles attached to their words (not as separate entries)
3. Mark the topic with "isTopic: true"
4. For each word, which other words it modifies (using word IDs) - EXCEPT topics which should not modify anything
5. A brief explanation of the sentence structure in HTML format

EXPLANATION FORMATTING:
- Use HTML tags for better readability: <p>, <strong>, <em>, <ul>, <li>
- Structure the explanation with clear sections
- Highlight important grammatical terms with <strong>
- Use lists for multiple points
Example: "<p>This sentence follows the <strong>SOV pattern</strong>. The topic <strong>私</strong> is marked with は.</p>"

Use the analyze_sentence tool to structure your response.`,
        },
      ],
      tools: [
        {
          name: "analyze_sentence",
          description: "Provide structured analysis of the Japanese sentence",
          input_schema: analysisSchema,
        },
      ],
      tool_choice: { type: "tool", name: "analyze_sentence" },
    });

    const toolUse = message.content.find(
      (content) => content.type === "tool_use" && content.name === "analyze_sentence"
    ) as { type: "tool_use"; input: unknown; name: string } | undefined;

    if (toolUse) {
      const analysis = toolUse.input as SentenceAnalysis;
      
      // Sanitize HTML content to prevent XSS attacks
      const sanitizedAnalysis: SentenceAnalysis = {
        ...analysis,
        explanation: sanitizeHtml(analysis.explanation, {
          allowedTags: ['p', 'strong', 'em', 'ul', 'li', 'ol', 'br', 'span'],
          allowedAttributes: {},
        }),
        words: analysis.words.map(word => ({
          ...word,
          attachedParticle: word.attachedParticle
            ? {
                ...word.attachedParticle,
                description: sanitizeHtml(word.attachedParticle.description, {
                  allowedTags: ['strong', 'em', 'br'],
                  allowedAttributes: {},
                }),
              }
            : undefined,
        })),
      };
      
      // Cache the successful response
      setCachedResponse(sentence, sanitizedAnalysis);
      
      return NextResponse.json(sanitizedAnalysis);
    } else {
      throw new Error("No structured analysis returned from Claude");
    }
  } catch (error) {
    console.error("Error analyzing sentence:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentence" },
      { status: 500 },
    );
  }
}

