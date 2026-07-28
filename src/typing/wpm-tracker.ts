import type { WpmSegment, WpmSnapshot } from './types';

export class WpmTracker {
  private startedAt: number | null = null;
  private lastActivityAt: number | null = null;
  private accountedUntil: number | null = null;
  private activeMs = 0;
  private segmentActiveMs = 0;
  private totalCorrect = 0;
  private totalRelevant = 0;
  private segmentCorrect = 0;
  private segmentProgress = 0;
  private currentWpm = 0;
  private readonly segments: WpmSegment[] = [];

  constructor(private segmentSize = 10, private idleLimitMs = 3000) {}

  recordKeystroke(correct: boolean, now: number): void {
    this.recordActivity(now);
    this.totalRelevant += 1;
    if (correct) { this.totalCorrect += 1; this.segmentCorrect += 1; }
  }

  recordSkippedCharacters(count: number, now: number): void {
    this.recordActivity(now);
    this.totalRelevant += Math.max(0, count);
  }

  completeWord(now: number): WpmSegment | null {
    this.recordActivity(now);
    this.segmentProgress += 1;
    if (this.segmentProgress < this.segmentSize) return null;
    const segment: WpmSegment = { wpm: calculateWpm(this.segmentCorrect, this.segmentActiveMs), correctCharacters: this.segmentCorrect, activeMs: this.segmentActiveMs, completedWords: this.segmentProgress };
    this.currentWpm = segment.wpm;
    this.segments.push(segment);
    this.segmentProgress = 0;
    this.segmentCorrect = 0;
    this.segmentActiveMs = 0;
    return segment;
  }

  finishPartialSegment(now: number): WpmSegment | null {
    this.accountTime(now);
    if (!this.segmentProgress) return null;
    const segment: WpmSegment = { wpm: calculateWpm(this.segmentCorrect, this.segmentActiveMs), correctCharacters: this.segmentCorrect, activeMs: this.segmentActiveMs, completedWords: this.segmentProgress };
    this.currentWpm = segment.wpm;
    this.segments.push(segment);
    this.segmentProgress = 0;
    return segment;
  }

  getSnapshot(now: number): WpmSnapshot {
    this.accountTime(now);
    const status = this.startedAt === null ? 'not-started' : this.lastActivityAt !== null && now - this.lastActivityAt >= this.idleLimitMs ? 'idle' : 'typing';
    const elapsed = this.startedAt === null ? 0 : Math.max(0, now - this.startedAt);
    return { currentWpm: this.currentWpm, averageWpm: calculateWpm(this.totalCorrect, this.activeMs), accuracy: this.totalRelevant ? this.totalCorrect / this.totalRelevant * 100 : 100, segmentProgress: this.segmentProgress, segmentSize: this.segmentSize, activeMs: this.activeMs, idleMs: Math.max(0, elapsed - this.activeMs), status, segments: this.segments.map((segment) => ({ ...segment })) };
  }

  setSegmentSize(value: number): void { this.segmentSize = Math.max(1, Math.round(value)); }
  setIdleLimit(seconds: number): void { this.idleLimitMs = Math.max(100, seconds * 1000); }
  pause(now: number): void { this.accountTime(now); this.lastActivityAt = null; this.accountedUntil = null; }

  private recordActivity(now: number): void {
    if (this.startedAt === null) { this.startedAt = now; this.lastActivityAt = now; this.accountedUntil = now; return; }
    if (this.lastActivityAt === null) { this.lastActivityAt = now; this.accountedUntil = now; return; }
    this.accountTime(now);
    this.lastActivityAt = now;
    this.accountedUntil = now;
  }

  private accountTime(now: number): void {
    if (this.lastActivityAt === null || this.accountedUntil === null) return;
    const activeEnd = Math.min(now, this.lastActivityAt + this.idleLimitMs);
    const delta = Math.max(0, activeEnd - this.accountedUntil);
    this.activeMs += delta;
    this.segmentActiveMs += delta;
    this.accountedUntil = Math.max(this.accountedUntil, activeEnd);
  }
}

function calculateWpm(correctCharacters: number, activeMs: number): number {
  return activeMs > 0 ? Math.round(((correctCharacters / 5) / (activeMs / 60000)) * 10) / 10 : 0;
}
