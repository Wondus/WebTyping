import type { TextBlock, TypingOptions, WordToken } from '../typing/types';
import { comparableText } from '../typing/tokenizer';
import type { TypingEngine } from '../typing/typing-engine';

export class TypingView {
  readonly reader = document.createElement('main');
  readonly copy = document.createElement('div');
  private readonly words: HTMLElement[] = [];
  private readonly caret = document.createElement('i');
  private lastCurrent = -1;
  private lastNextCount = 0;
  private caretX = 0;
  private caretY = 0;
  private caretTargetX = 0;
  private caretTargetY = 0;
  private caretInitialized = false;
  private caretFrame: number | null = null;
  private caretLastFrameAt = 0;
  constructor(private readonly tokens: readonly WordToken[], blocks: readonly TextBlock[]) {
    this.reader.className = 'reader'; this.copy.className = 'copy'; this.caret.className = 'caret'; this.reader.append(this.copy);
    const fragment = document.createDocumentFragment();
    const byBlock = new Map<number, WordToken[]>(); for (const token of tokens) { const list = byBlock.get(token.blockIndex) ?? []; list.push(token); byBlock.set(token.blockIndex, list); }
    blocks.forEach((block, blockIndex) => { const container = document.createElement(block.kind === 'heading' ? `h${Math.min(6, block.level ?? 2)}` : 'p'); container.className = `block ${block.kind}`; for (const token of byBlock.get(blockIndex) ?? []) { const word = document.createElement('span'); word.className = 'word pending'; word.dataset.index = String(token.id); word.textContent = token.text; this.words[token.id] = word; container.append(word); } fragment.append(container); });
    this.copy.append(fragment, this.caret);
  }

  update(engine: TypingEngine, options: TypingOptions, nextCount: number): HTMLElement {
    const snapshot = engine.getSnapshot();
    const affected = new Set<number>();
    if (this.lastCurrent < 0) affected.add(snapshot.currentIndex);
    for (let offset = 0; offset <= this.lastNextCount; offset += 1) affected.add(this.lastCurrent + offset);
    for (let offset = 0; offset <= nextCount; offset += 1) affected.add(snapshot.currentIndex + offset);
    affected.add(this.lastCurrent - 1); affected.add(snapshot.currentIndex - 1);
    for (const index of affected) {
      const word = this.words[index]; if (!word) continue;
      const state = snapshot.words[index]!;
      word.className = `word ${state.status}${index === snapshot.currentIndex && !snapshot.completed ? ' current' : ''}${index < snapshot.currentIndex ? ' done' : ''}${index > snapshot.currentIndex && index <= snapshot.currentIndex + nextCount ? ' next' : ''}`;
      if (index === snapshot.currentIndex && !snapshot.completed) this.renderCurrent(word, this.tokens[index]!.text, state.typed, options);
      else { word.textContent = this.tokens[index]!.text; if (state.status === 'skipped') word.setAttribute('aria-label', `${this.tokens[index]!.text}, skipped`); else if (state.status === 'incorrect') word.setAttribute('aria-label', `${this.tokens[index]!.text}, incorrect`); else word.removeAttribute('aria-label'); }
    }
    this.lastCurrent = snapshot.currentIndex; this.lastNextCount = nextCount;
    if (!snapshot.completed) this.positionCaret(this.words[snapshot.currentIndex]!, snapshot.words[snapshot.currentIndex]!.typed);
    this.caret.hidden = snapshot.completed;
    return this.words[Math.min(snapshot.currentIndex, this.words.length - 1)]!;
  }

  destroy(): void {
    if (this.caretFrame !== null) cancelAnimationFrame(this.caretFrame);
    this.caretFrame = null;
  }

  private renderCurrent(word: HTMLElement, target: string, typed: string, options: TypingOptions): void {
    word.replaceChildren(); const targetChars = [...target]; const typedChars = [...typed];
    targetChars.forEach((character, index) => { const span = document.createElement('span'); span.className = 'char'; span.textContent = character; const actual = typedChars[index]; if (actual !== undefined) span.classList.add(comparableText(actual, options) === comparableText(character, options) ? 'correct' : 'error'); word.append(span); });
    typedChars.slice(targetChars.length).forEach((character) => { const extra = document.createElement('span'); extra.className = 'char extra'; extra.textContent = character; word.append(extra); });
  }

  private positionCaret(word: HTMLElement, typed: string): void {
    const position = Math.min([...typed].length, [...this.tokens[Number(word.dataset.index)]!.text].length);
    const anchor = word.children[position] as HTMLElement | undefined;
    const copyRect = this.copy.getBoundingClientRect();
    const wordRect = word.getBoundingClientRect();
    const anchorRect = anchor?.getBoundingClientRect();
    const x = (anchorRect?.left ?? wordRect.right) - copyRect.left;
    const fontSize = Number.parseFloat(getComputedStyle(word).fontSize) || 26;
    const y = wordRect.top - copyRect.top + Math.max(1, fontSize * 0.12);
    this.caret.style.height = `${fontSize * 1.25}px`;
    this.moveCaret(x, y);
  }

  private moveCaret(targetX: number, targetY: number): void {
    if (!this.caretInitialized || typeof requestAnimationFrame !== 'function') {
      this.caretInitialized = true;
      this.caretX = targetX;
      this.caretY = targetY;
      this.caretTargetX = targetX;
      this.caretTargetY = targetY;
      this.applyCaretPosition();
      return;
    }
    this.caretTargetX = targetX;
    this.caretTargetY = targetY;
    if (this.caretFrame !== null) return;
    this.caretLastFrameAt = performance.now();
    const animate = (now: number): void => {
      const elapsed = Math.min(34, Math.max(1, now - this.caretLastFrameAt));
      this.caretLastFrameAt = now;
      const blend = 1 - Math.exp(-elapsed / 42);
      this.caretX += (this.caretTargetX - this.caretX) * blend;
      this.caretY += (this.caretTargetY - this.caretY) * blend;
      this.applyCaretPosition();
      const remainingX = Math.abs(this.caretTargetX - this.caretX);
      const remainingY = Math.abs(this.caretTargetY - this.caretY);
      if (remainingX > 0.08 || remainingY > 0.08) this.caretFrame = requestAnimationFrame(animate);
      else {
        this.caretX = this.caretTargetX;
        this.caretY = this.caretTargetY;
        this.applyCaretPosition();
        this.caretFrame = null;
      }
    };
    this.caretFrame = requestAnimationFrame(animate);
  }

  private applyCaretPosition(): void {
    this.caret.style.transform = `translate3d(${this.caretX.toFixed(2)}px, ${this.caretY.toFixed(2)}px, 0)`;
  }
}
