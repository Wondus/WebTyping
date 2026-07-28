import type { TextBlock, WordToken } from './types';

const WORD_PATTERN = /\S+/gu;
interface WordSpan { text: string; index: number }
export interface TokenizerOptions { skipEmojis?: boolean; skipPunctuation?: boolean }
const EMOJI_SEQUENCE = /(?:\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?)*)/gu;

export class Tokenizer {
  tokenize(input: string | readonly TextBlock[], options: TokenizerOptions = {}): WordToken[] {
    const blocks: readonly TextBlock[] = typeof input === 'string'
      ? input.split(/\n+/u).map((text) => ({ kind: 'paragraph' as const, text }))
      : input;
    const tokens: WordToken[] = [];
    blocks.forEach((block, blockIndex) => {
      let source = options.skipEmojis ? block.text.replace(EMOJI_SEQUENCE, '') : block.text;
      if (options.skipPunctuation) source = source.replace(/\p{P}+/gu, '');
      const normalized = source.replace(/\s+/gu, ' ').trim();
      const matches = wordSpans(normalized);
      matches.forEach((match, wordIndexInBlock) => {
        const next = matches[wordIndexInBlock + 1];
        const end = match.index + match.text.length;
        const separator = next ? normalized.slice(end, next.index) : '';
        tokens.push({ id: tokens.length, text: match.text, separator, blockIndex, wordIndexInBlock });
      });
    });
    return tokens;
  }
}

function wordSpans(text: string): WordSpan[] {
  if (typeof Intl.Segmenter !== 'function') return [...text.matchAll(WORD_PATTERN)].map((match) => ({ text: match[0], index: match.index ?? 0 }));
  const spans: WordSpan[] = []; let start: number | null = null; let end = 0;
  const flush = (): void => { if (start !== null) spans.push({ text: text.slice(start, end), index: start }); start = null; };
  for (const part of new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text)) {
    if (/^\s+$/u.test(part.segment)) flush();
    else { if (start === null) start = part.index; end = part.index + part.segment.length; }
  }
  flush(); return spans;
}

export function comparableText(text: string, options: Pick<import('./types').TypingOptions, 'caseSensitive' | 'skipPunctuation'>): string {
  let value = text.normalize('NFC');
  if (options.skipPunctuation) value = value.replace(/\p{P}+/gu, '');
  return options.caseSensitive ? value : value.toLocaleLowerCase();
}
