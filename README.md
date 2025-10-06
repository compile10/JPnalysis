# 日本語 Sentence Analyzer (JPnalysis)

A Next.js application that analyzes Japanese sentence structure using Claude AI. This tool visualizes how words and phrases relate to each other, showing grammatical relationships with interactive diagrams.

## Features

- 🎯 AI-powered Japanese sentence analysis using Claude 3.5 Sonnet
- 📊 Visual representation of sentence structure with arrows showing modification relationships
- 🇯🇵 Support for any Japanese sentence
- 🎨 Beautiful, modern UI with dark mode support
- ⚡ Real-time analysis with structured JSON output

## Prerequisites

- Node.js 18+ 
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com/))

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual Anthropic API key.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How It Works

1. **Input**: Enter a Japanese sentence in the input field
2. **Analysis**: The sentence is sent to Claude API which analyzes:
   - Individual words and their readings (hiragana)
   - Part of speech for each word
   - Sentence topic (marked with は particle)
   - Particles attached to their respective words
   - Grammatical relationships (which words modify which)
3. **Visualization**: The results are displayed as:
   - **Topic section** (purple box) - separated from main sentence as it provides context only
   - Interactive word boxes arranged in sentence order
   - **Small orange boxes** showing particles attached to words (click any particle to see what it does!)
   - Curved arrows showing modification relationships (topics don't have arrows since they don't modify the sentence)
   - Detailed explanation of sentence structure
   - Complete word breakdown with readings and parts of speech

## Example Sentences

Try these examples:

- `私は美しい花を見ました。` (I saw beautiful flowers.)
- `猫が静かに部屋に入った。` (The cat quietly entered the room.)
- `彼女は新しい本を読んでいる。` (She is reading a new book.)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # API endpoint for sentence analysis
│   ├── page.tsx                   # Main page component
│   └── globals.css                # Global styles
├── components/
│   ├── SentenceInput.tsx          # Input form component
│   └── SentenceVisualization.tsx  # Visualization component with arrows
└── types/
    └── analysis.ts                # TypeScript types for analysis data
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **UI**: React 19

## API Endpoint

### POST `/api/analyze`

Analyzes a Japanese sentence and returns structured data.

**Request Body:**
```json
{
  "sentence": "私は美しい花を見ました。"
}
```

**Response:**
```json
{
  "originalSentence": "私は美しい花を見ました。",
  "words": [
    {
      "id": "1",
      "text": "私",
      "reading": "わたし",
      "partOfSpeech": "pronoun",
      "position": 0,
      "modifies": []
    },
    // ... more words
  ],
  "explanation": "This sentence describes..."
}
```

## Development

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## License

MIT

## Acknowledgments

- Powered by [Claude AI](https://www.anthropic.com/) from Anthropic
- Built with [Next.js](https://nextjs.org/)
