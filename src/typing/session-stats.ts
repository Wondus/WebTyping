import type { TypingMetrics, WpmSnapshot } from './types';

export interface SessionSummary extends TypingMetrics { url: string; title: string; startedAt: number; activeMs: number; idleMs: number; currentWpm: number; averageWpm: number; accuracy: number; bestWpm: number; segmentWpms: number[] }
export function createSessionSummary(metrics: TypingMetrics, wpm: WpmSnapshot, startedAt: number): SessionSummary {
  return { ...metrics, url: location.href, title: document.title, startedAt, activeMs: wpm.activeMs, idleMs: wpm.idleMs, currentWpm: wpm.currentWpm, averageWpm: wpm.averageWpm, accuracy: wpm.accuracy, bestWpm: Math.max(0, ...wpm.segments.map((segment) => segment.wpm)), segmentWpms: wpm.segments.map((segment) => segment.wpm) };
}
