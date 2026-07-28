export type BlockKind = 'heading' | 'paragraph' | 'list-item' | 'quote';

export interface TextBlock { kind: BlockKind; text: string; level?: number }
export interface WordToken { id: number; text: string; separator: string; blockIndex: number; wordIndexInBlock: number }
export type WordStatus = 'pending' | 'active' | 'correct' | 'incorrect' | 'skipped';
export interface WordState { typed: string; status: WordStatus; hadError: boolean; touched: boolean }

export interface TypingOptions { caseSensitive: boolean; skipPunctuation: boolean }
export interface TypingMetrics {
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  extraKeystrokes: number;
  corrections: number;
  skippedWords: number;
  incorrectCompletedWords: number;
  completedWords: number;
}
export interface TypingSnapshot { currentIndex: number; completed: boolean; words: readonly WordState[]; metrics: Readonly<TypingMetrics> }
export interface InputResult { accepted: boolean; correct?: boolean; extra?: boolean; wordChanged?: number; completedWord?: boolean; sessionCompleted?: boolean; movedBack?: boolean }

export interface WpmSegment { wpm: number; correctCharacters: number; activeMs: number; completedWords: number }
export interface WpmSnapshot {
  currentWpm: number;
  averageWpm: number;
  accuracy: number;
  segmentProgress: number;
  segmentSize: number;
  activeMs: number;
  idleMs: number;
  status: 'not-started' | 'typing' | 'idle';
  segments: readonly WpmSegment[];
}
