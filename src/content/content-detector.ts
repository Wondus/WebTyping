export interface DetectionResult { element: HTMLElement | null; score: number; wordCount: number; confidence: 'high' | 'low' | 'none' }

const CANDIDATE_SELECTOR = 'article,main,[role="main"],[itemprop="articleBody"],[class*="article" i],[class*="content" i],[class*="post" i],section,div';
const EXCLUDED_SELECTOR = 'nav,header,footer,aside,form,[role="navigation"],[role="banner"],[role="complementary"],[class*="cookie" i],[class*="comment" i],[class*="advert" i],[class*="breadcrumb" i],[class*="toolbar" i]';

export class ContentDetector {
  detect(root: ParentNode = document): DetectionResult {
    let best: { element: HTMLElement; score: number; wordCount: number } | null = null;
    for (const element of root.querySelectorAll<HTMLElement>(CANDIDATE_SELECTOR)) {
      if (!this.isVisible(element) || element.matches(EXCLUDED_SELECTOR) || element.closest(EXCLUDED_SELECTOR)) continue;
      const text = visibleText(element);
      const words = text.match(/\S+/gu) ?? [];
      if (words.length < 20 || text.length < 100) continue;
      const linksText = [...element.querySelectorAll('a')].map((link) => link.textContent ?? '').join(' ').length;
      const paragraphLengths = [...element.querySelectorAll('p')].map((p) => (p.textContent ?? '').trim().length).filter(Boolean);
      const paragraphScore = paragraphLengths.length * 18 + paragraphLengths.filter((length) => length > 80).length * 28;
      const semantic = element.matches('article,[itemprop="articleBody"]') ? 220 : element.matches('main,[role="main"]') ? 140 : 0;
      const headingScore = Math.min(80, element.querySelectorAll('h1,h2,h3').length * 15);
      const linkPenalty = text.length ? (linksText / text.length) * 500 : 0;
      const controlsPenalty = element.querySelectorAll('button,input,textarea,select').length * 15;
      const nestingPenalty = Math.max(0, element.querySelectorAll(CANDIDATE_SELECTOR).length - 15) * 0.5;
      const score = Math.min(words.length, 1500) * 0.45 + paragraphScore + semantic + headingScore - linkPenalty - controlsPenalty - nestingPenalty;
      if (!best || score > best.score) best = { element, score, wordCount: words.length };
    }
    if (!best) return { element: null, score: 0, wordCount: 0, confidence: 'none' };
    const usable = best.wordCount >= 40 && visibleText(best.element).length >= 200;
    return { ...best, confidence: usable && best.score >= 150 ? 'high' : 'low' };
  }

  isVisible(element: HTMLElement): boolean {
    if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false;
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }
}

export function visibleText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script,style,noscript,svg,canvas,template,input,textarea,select,nav,aside,form,[aria-hidden="true"],[hidden]').forEach((node) => node.remove());
  return (clone.innerText || clone.textContent || '').replace(/\s+/gu, ' ').trim();
}
