"use client";

import { useState } from "react";

interface SentenceInputProps {
  onAnalyze: (sentence: string) => void;
  isLoading: boolean;
}

export default function SentenceInput({
  onAnalyze,
  isLoading,
}: SentenceInputProps) {
  const [sentence, setSentence] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sentence.trim()) {
      onAnalyze(sentence.trim());
    }
  };

  const exampleSentences = [
    "私は美しい花を見ました。",
    "猫が静かに部屋に入った。",
    "彼女は新しい本を読んでいる。",
  ];

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="sentence"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Enter a Japanese sentence:
          </label>
          <input
            type="text"
            id="sentence"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="例：私は美しい花を見ました。"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !sentence.trim()}
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Analyzing..." : "Analyze Sentence"}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Try these examples:
        </p>
        <div className="flex flex-wrap gap-2">
          {exampleSentences.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSentence(example)}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
