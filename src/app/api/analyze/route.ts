import { MAX_SENTENCE_LENGTH } from "@common/api";
import {
  analyzeSentence,
  getCachedResponse,
  setCachedResponse,
} from "@/lib/analysis";
import { withAuth } from "@/lib/api-auth";
import { corsPreflightResponse, jsonResponse } from "@/lib/cors";
import { saveToHistory } from "@/lib/history";
import { RATE_LIMIT_POLICIES } from "@/lib/rate-limit";
import { resolveSettings } from "@/lib/settings";
import { sanitizeForLLM } from "@/lib/validation";

export async function OPTIONS() {
  return corsPreflightResponse();
}

export const POST = withAuth(
  {
    name: "analyze sentence",
    rateLimit: RATE_LIMIT_POLICIES.analyzeSentence,
  },
  async (request, session) => {
    const { sentence } = await request.json();

    if (!sentence || typeof sentence !== "string") {
      return jsonResponse({ error: "Invalid sentence provided" }, 400);
    }

    if (sentence.length > MAX_SENTENCE_LENGTH) {
      return jsonResponse(
        {
          error: `Sentence exceeds maximum length of ${MAX_SENTENCE_LENGTH} characters`,
        },
        400,
      );
    }

    const sanitizedSentence = sanitizeForLLM(sentence);

    if (!sanitizedSentence) {
      return jsonResponse({ error: "Invalid sentence provided" }, 400);
    }

    const { provider, model } = await resolveSettings(session);

    const cacheKey = `${provider}:${model}:${sanitizedSentence}`;
    const cachedResponse = getCachedResponse(cacheKey);

    const analysis =
      cachedResponse ??
      (await analyzeSentence(sanitizedSentence, provider, model));

    if (!cachedResponse) {
      setCachedResponse(cacheKey, analysis);
    }

    try {
      await saveToHistory(session.user.id, sanitizedSentence, provider, model);
    } catch (e) {
      console.error("Failed to save history:", e);
    }

    return jsonResponse(analysis);
  },
);
