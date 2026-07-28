import { visibleText } from './content-detector';

export class ElementPicker {
  private highlight: HTMLDivElement | null = null;
  private tooltip: HTMLDivElement | null = null;
  private hovered: HTMLElement | null = null;
  private resolve: ((value: HTMLElement | null) => void) | null = null;

  pick(): Promise<HTMLElement | null> {
    this.cleanup();
    this.highlight = document.createElement('div');
    this.tooltip = document.createElement('div');
    Object.assign(this.highlight.style, { position: 'fixed', pointerEvents: 'none', zIndex: '2147483645', border: '2px solid #7c5cff', background: 'rgba(124,92,255,.12)', boxSizing: 'border-box' });
    Object.assign(this.tooltip.style, { position: 'fixed', pointerEvents: 'none', zIndex: '2147483646', color: '#fff', background: '#17151f', padding: '5px 8px', borderRadius: '5px', font: '12px system-ui' });
    document.documentElement.append(this.highlight, this.tooltip);
    document.addEventListener('mousemove', this.onMove, true);
    document.addEventListener('click', this.onClick, true);
    document.addEventListener('keydown', this.onKeyDown, true);
    return new Promise((resolve) => { this.resolve = resolve; });
  }

  cleanup(): void {
    document.removeEventListener('mousemove', this.onMove, true);
    document.removeEventListener('click', this.onClick, true);
    document.removeEventListener('keydown', this.onKeyDown, true);
    this.highlight?.remove(); this.tooltip?.remove();
    this.highlight = null; this.tooltip = null; this.hovered = null;
  }

  private readonly onMove = (event: MouseEvent): void => {
    const target = event.composedPath()[0];
    if (!(target instanceof HTMLElement) || target.closest('#webtyping-extension-root')) return;
    this.hovered = target;
    const rect = target.getBoundingClientRect();
    Object.assign(this.highlight?.style ?? {}, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    if (this.tooltip) {
      const words = visibleText(target).match(/\S+/gu)?.length ?? 0;
      this.tooltip.textContent = `${target.tagName.toLowerCase()}${target.id ? `#${target.id}` : ''} · ${words} words`;
      Object.assign(this.tooltip.style, { left: `${Math.max(8, rect.left)}px`, top: `${Math.max(8, rect.top - 30)}px` });
    }
  };

  private readonly onClick = (event: MouseEvent): void => {
    if (!this.hovered) return;
    event.preventDefault(); event.stopImmediatePropagation();
    let selected = this.hovered;
    while (selected.parentElement && (visibleText(selected).match(/\S+/gu)?.length ?? 0) < 20) selected = selected.parentElement;
    const resolve = this.resolve; this.resolve = null; this.cleanup(); resolve?.(selected);
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    event.preventDefault(); event.stopImmediatePropagation();
    const resolve = this.resolve; this.resolve = null; this.cleanup(); resolve?.(null);
  };
}
