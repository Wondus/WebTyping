import { comparableText } from './tokenizer';
import type { InputResult, TypingMetrics, TypingOptions, TypingSnapshot, WordState, WordToken } from './types';

export class TypingEngine {
  private readonly states: WordState[];
  private index = 0;
  private isCompleted = false;
  private readonly metrics: TypingMetrics = { correctKeystrokes: 0, incorrectKeystrokes: 0, extraKeystrokes: 0, corrections: 0, skippedWords: 0, incorrectCompletedWords: 0, completedWords: 0 };

  constructor(private readonly tokens: readonly WordToken[], private options: TypingOptions) {
    if (!tokens.length) throw new Error('TypingEngine requires at least one token.');
    this.states = tokens.map((_, index) => ({ typed: '', status: index === 0 ? 'active' : 'pending', hadError: false, touched: false }));
  }

  type(text: string): InputResult[] {
    return [...text.normalize('NFC')].map((character) => this.typeCharacter(character));
  }

  typeCharacter(character: string): InputResult {
    if (this.isCompleted || !character || /\s/u.test(character)) return { accepted: false };
    const state = this.currentState();
    const target = this.currentTarget();
    const position = [...state.typed].length;
    const targetCharacters = [...target];
    state.touched = true;
    state.typed += character;
    const expected = targetCharacters[position];
    const extra = expected === undefined;
    const correct = !extra && comparableText(character, this.options) === comparableText(expected, this.options);
    if (correct) this.metrics.correctKeystrokes += 1;
    else {
      this.metrics.incorrectKeystrokes += 1;
      if (extra) this.metrics.extraKeystrokes += 1;
      state.hadError = true;
    }
    return { accepted: true, correct, extra, wordChanged: this.index };
  }

  completeWord(explicitSkip = false): InputResult {
    if (this.isCompleted) return { accepted: false };
    const state = this.currentState();
    const target = this.currentTarget();
    const skipped = explicitSkip || state.typed.length === 0;
    const correct = !skipped && comparableText(state.typed, this.options) === comparableText(target, this.options);
    if (skipped) {
      state.status = 'skipped';
      state.hadError = true;
      this.metrics.skippedWords += 1;
      this.metrics.incorrectKeystrokes += [...target].length;
    } else if (correct) state.status = 'correct';
    else {
      state.status = 'incorrect';
      this.metrics.incorrectCompletedWords += 1;
    }
    this.metrics.completedWords += 1;
    if (this.index === this.tokens.length - 1) {
      this.isCompleted = true;
      return { accepted: true, completedWord: true, sessionCompleted: true, wordChanged: this.index };
    }
    this.index += 1;
    this.states[this.index]!.status = 'active';
    return { accepted: true, completedWord: true, wordChanged: this.index - 1 };
  }

  backspace(deleteWord = false): InputResult {
    if (this.isCompleted) return { accepted: false };
    const state = this.currentState();
    if (state.typed) {
      state.typed = deleteWord ? '' : [...state.typed].slice(0, -1).join('');
      this.metrics.corrections += 1;
      return { accepted: true, wordChanged: this.index };
    }
    if (this.index === 0 || state.touched) return { accepted: false };
    const previous = this.states[this.index - 1]!;
    if (previous.status === 'skipped') return { accepted: false };
    const previousStatus = previous.status;
    this.states[this.index]!.status = 'pending';
    this.index -= 1;
    previous.status = 'active';
    this.isCompleted = false;
    this.metrics.completedWords = Math.max(0, this.metrics.completedWords - 1);
    if (previousStatus === 'incorrect') this.metrics.incorrectCompletedWords = Math.max(0, this.metrics.incorrectCompletedWords - 1);
    return { accepted: true, wordChanged: this.index, movedBack: true };
  }

  updateOptions(options: TypingOptions): void { this.options = options; }
  getToken(index = this.index): WordToken { return this.tokens[index]!; }
  getSnapshot(): TypingSnapshot { return { currentIndex: this.index, completed: this.isCompleted, words: this.states.map((word) => ({ ...word })), metrics: { ...this.metrics } }; }
  private currentState(): WordState { return this.states[this.index]!; }
  private currentTarget(): string { return this.tokens[this.index]!.text; }
}
