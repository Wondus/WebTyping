import type { BlockKind, TextBlock } from '../typing/types';

const BLOCKS = 'h1,h2,h3,h4,h5,h6,p,li,blockquote';
const IGNORE = 'nav,aside,form,button,input,textarea,select,script,style,noscript,svg,canvas,template,[aria-hidden="true"],[hidden],[class*="cookie" i],[class*="advert" i]';

export class ContentExtractor {
  extract(element: HTMLElement): TextBlock[] {
    const nodes = [...element.querySelectorAll<HTMLElement>(BLOCKS)].filter((node) => !node.closest(IGNORE));
    if (element.matches(BLOCKS)) nodes.unshift(element);
    const blocks = nodes.map((node) => this.toBlock(node)).filter((block): block is TextBlock => block !== null);
    if (blocks.length) return blocks;
    const text = (element.innerText || element.textContent || '').replace(/\s+/gu, ' ').trim();
    return text ? [{ kind: 'paragraph', text }] : [];
  }

  private toBlock(node: HTMLElement): TextBlock | null {
    const clone = node.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(IGNORE).forEach((child) => child.remove());
    const text = (clone.innerText || clone.textContent || '').replace(/\s+/gu, ' ').trim();
    if (!text) return null;
    const tag = node.tagName.toLowerCase();
    const kind: BlockKind = tag.startsWith('h') ? 'heading' : tag === 'li' ? 'list-item' : tag === 'blockquote' ? 'quote' : 'paragraph';
    return { kind, text, level: kind === 'heading' ? Number(tag.slice(1)) : undefined };
  }
}
