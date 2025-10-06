export interface WordNode {
  id: string;
  text: string;
  reading?: string;
  partOfSpeech: string;
  modifies?: string[]; // IDs of words this word modifies
  position: number; // Position in the sentence
  attachedParticle?: {
    text: string;
    reading?: string;
    description: string; // Brief explanation of the particle's function in this context
  }; // Particle attached to this word (if any)
  isTopic?: boolean; // True if this is the sentence topic
}

export interface SentenceAnalysis {
  originalSentence: string;
  words: WordNode[];
  explanation: string;
  isFragment: boolean; // True if this is a sentence fragment/incomplete sentence
}

