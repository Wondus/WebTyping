export class ScrollController {
  keepVisible(element: HTMLElement, container: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const top = innerHeight * 0.3;
    const bottom = innerHeight * 0.7;
    if (rect.top >= top && rect.bottom <= bottom) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.scrollBy({ top: rect.top - innerHeight * 0.45, behavior: reduced ? 'auto' : 'smooth' });
  }
}
