"use client";

import type { SentenceAnalysis, WordNode } from "@/types/analysis";
import { type JSX, useEffect, useRef, useState } from "react";
import ParticleModal from "./ParticleModal";

interface SentenceVisualizationProps {
  analysis: SentenceAnalysis;
}

interface WordPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function SentenceVisualization({
  analysis,
}: SentenceVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wordPositions, setWordPositions] = useState<WordPosition[]>([]);
  const [selectedParticle, setSelectedParticle] = useState<string | null>(null);
  const [particleDescription, setParticleDescription] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleParticleClick = (particle: string, description: string) => {
    setSelectedParticle(particle);
    setParticleDescription(description);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedParticle(null);
    setParticleDescription(null);
  };

  useEffect(() => {
    // Calculate positions after render
    if (containerRef.current) {
      const positions: WordPosition[] = [];
      const wordElements = containerRef.current.querySelectorAll("[data-word-id]");

      wordElements.forEach((element) => {
        const id = element.getAttribute("data-word-id");
        if (id) {
          const rect = element.getBoundingClientRect();
          const containerRect = containerRef.current!.getBoundingClientRect();
          positions.push({
            id,
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
          });
        }
      });

      setWordPositions(positions);
    }
  }, [analysis]);

  const getWordPosition = (id: string) => {
    return wordPositions.find((pos) => pos.id === id);
  };

  const renderArrows = () => {
    if (!containerRef.current || wordPositions.length === 0) return null;

    const arrows: JSX.Element[] = [];

    for (const word of analysis.words) {
      // Skip arrows for topics - they don't modify other words
      if (word.isTopic) continue;

      if (word.modifies && word.modifies.length > 0) {
        const fromPos = getWordPosition(word.id);
        if (!fromPos) continue;

        for (const targetId of word.modifies) {
          const toPos = getWordPosition(targetId);
          if (!toPos) continue;

          // Calculate arrow path with a curve
          const startX = fromPos.x;
          const startY = fromPos.y - fromPos.height / 2; // Start from top of box
          const endX = toPos.x;
          const endY = toPos.y - toPos.height / 2; // End at top of box

          // Create a curved path that arcs upward
          const midX = (startX + endX) / 2;
          const distance = Math.abs(endX - startX);
          const curveHeight = Math.min(60, distance * 0.3); // Adaptive curve height
          const midY = Math.min(startY, endY) - curveHeight;

          const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

          // Calculate arrow head angle based on the curve
          const angle = Math.atan2(endY - midY, endX - midX);
          const arrowSize = 8;

          arrows.push(
            <g key={`${word.id}-${targetId}`}>
              <path
                d={path}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              <polygon
                points={`0,-${arrowSize / 2} ${arrowSize},0 0,${arrowSize / 2}`}
                fill="#3b82f6"
                transform={`translate(${endX},${endY}) rotate(${(angle * 180) / Math.PI})`}
              />
            </g>,
          );
        }
      }
    }

    return arrows;
  };

  const topicWords = analysis.words.filter((word) => word.isTopic);
  const mainSentenceWords = analysis.words.filter((word) => !word.isTopic);

  const renderWord = (word: WordNode) => (
    <div key={word.id} className="relative flex items-start gap-0">
      {/* Main word box */}
      <div
        data-word-id={word.id}
        className={`border-2 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow ${
          word.isTopic
            ? "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700"
            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
        }`}
        style={{ maxWidth: "150px" }}
      >
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 text-center">
          {word.text}
        </div>
        {word.reading && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
            {word.reading}
          </div>
        )}
        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center">
          {word.partOfSpeech}
        </div>
      </div>

      {/* Attached particle (if any) */}
      {word.attachedParticle && (
        <button
          type="button"
          onClick={() => handleParticleClick(word.attachedParticle!.text, word.attachedParticle!.description)}
          className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 border-2 border-orange-600 dark:border-orange-700 rounded-md px-2 py-1 shadow-md hover:shadow-lg -ml-2 mt-1 transition-all cursor-pointer transform hover:scale-110"
          style={{
            maxWidth: "60px",
            fontSize: "0.75rem",
            transform: "translateY(10px)",
          }}
          title="Click to learn about this particle"
        >
          <div className="text-sm font-bold text-white text-center">
            {word.attachedParticle.text}
          </div>
          {word.attachedParticle.reading && word.attachedParticle.reading !== word.attachedParticle.text && (
            <div className="text-xs text-orange-100 text-center">
              {word.attachedParticle.reading}
            </div>
          )}
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Sentence Structure
        </h3>

        {/* Fragment Warning */}
        {analysis.isFragment && (
          <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-yellow-800 dark:text-yellow-300">
                Sentence Fragment
              </span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1 ml-7">
              This appears to be an incomplete sentence or fragment. It may be missing key components like a verb or not express a complete thought.
            </p>
          </div>
        )}

        {/* Topic Section */}
        {topicWords.length > 0 && (
          <div className="mb-6 pb-4 border-b-2 border-dashed border-purple-300 dark:border-purple-700">
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
              Topic (Context)
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {topicWords.sort((a, b) => a.position - b.position).map(renderWord)}
            </div>
          </div>
        )}

        {/* Main Sentence Section */}
        <div
          ref={containerRef}
          className="relative min-h-[400px] bg-gray-50 dark:bg-gray-900 rounded-lg p-8 overflow-hidden"
        >
          {/* SVG for arrows */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
              </marker>
            </defs>
            {renderArrows()}
          </svg>

          {/* Word boxes */}
          <div className="relative flex flex-wrap gap-4 justify-center pt-16 pb-8" style={{ zIndex: 2 }}>
            {mainSentenceWords.sort((a, b) => a.position - b.position).map(renderWord)}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Purple boxes:</strong> Topic - provides context but doesn't modify the sentence
          </p>
          <p className="mt-1">
            <strong>Arrows:</strong> Show which words modify or relate to other words
          </p>
          <p className="mt-1">
            <strong>Orange boxes:</strong> Particles (は, を, に, etc.) - <span className="text-orange-600 dark:text-orange-400 font-semibold">Click to learn what they do!</span>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Explanation
        </h3>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: analysis.explanation }}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Word Details
        </h3>
        <div className="space-y-2">
          {analysis.words
            .sort((a, b) => a.position - b.position)
            .map((word) => (
              <div
                key={word.id}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded"
              >
                <div className="flex-1">
                  {word.isTopic && (
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 mr-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                      TOPIC
                    </span>
                  )}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {word.text}
                  </span>
                  {word.attachedParticle && (
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 ml-1">
                      {word.attachedParticle.text}
                    </span>
                  )}
                  {word.reading && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      ({word.reading}
                      {word.attachedParticle?.reading && ` + ${word.attachedParticle.reading}`})
                    </span>
                  )}
                  <span className="text-sm text-blue-600 dark:text-blue-400 ml-2">
                    - {word.partOfSpeech}
                  </span>
                </div>
                {word.modifies && word.modifies.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Modifies:{" "}
                    {word.modifies
                      .map(
                        (id) =>
                          analysis.words.find((w) => w.id === id)?.text || id,
                      )
                      .join(", ")}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Particle Description Modal */}
      <ParticleModal
        particle={selectedParticle}
        description={particleDescription}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

