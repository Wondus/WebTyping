import type { WpmSnapshot } from '../typing/types';

const icon = (path: string) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
export class TopBar {
  readonly element = document.createElement('header');
  private readonly current = document.createElement('strong');
  private readonly average = document.createElement('strong');
  private readonly accuracy = document.createElement('strong');
  private readonly status = document.createElement('span');
  private readonly capsLock = document.createElement('strong');
  private readonly progressFill = document.createElement('i');
  private readonly progress = document.createElement('div');

  constructor(onSettings: () => void, onPick: () => void, onClose: () => void) {
    this.element.className = 'topbar'; this.element.setAttribute('role', 'toolbar'); this.element.setAttribute('aria-label', 'Typing statistics');
    this.element.append(this.metric('WPM', this.current), this.metric('Average', this.average), this.metric('Accuracy', this.accuracy));
    this.status.className = 'status'; this.element.append(this.status);
    this.capsLock.className = 'caps-warning'; this.capsLock.textContent = 'CAPS LOCK ON'; this.capsLock.hidden = true; this.capsLock.setAttribute('role', 'status'); this.capsLock.setAttribute('aria-live', 'assertive'); this.element.append(this.capsLock);
    const progressWrap = document.createElement('div'); progressWrap.className = 'progress-wrap';
    this.progress.className = 'progress'; this.progress.setAttribute('role', 'progressbar'); this.progress.append(this.progressFill);
    progressWrap.append(this.progress); this.element.append(progressWrap);
    const grow = document.createElement('span'); grow.className = 'grow'; this.element.append(grow);
    this.element.append(this.button('Select different content', icon('M4 4h6M4 4v6M20 4h-6m6 0v6M4 20h6m-6 0v-6m16 6h-6m6 0v-6'), onPick), this.button('Settings', icon('M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.3 7.3 0 0 0-1.69-.98L14.5 2.42A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.49.49 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.32-.08.66-.08.98s.03.66.08.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.12.22.38.31.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.08.49 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z'), onSettings), this.button('Exit', icon('M6 6l12 12M18 6 6 18'), onClose));
  }

  update(snapshot: WpmSnapshot): void {
    this.current.textContent = snapshot.currentWpm.toFixed(0); this.average.textContent = snapshot.averageWpm.toFixed(0); this.accuracy.textContent = `${snapshot.accuracy.toFixed(0)} %`;
    this.status.textContent = snapshot.status === 'typing' ? 'Typing' : snapshot.status === 'idle' ? 'Idle' : 'Inactive';
    const percent = snapshot.segmentProgress / snapshot.segmentSize * 100; this.progressFill.style.width = `${percent}%`;
    this.progress.setAttribute('aria-valuemin', '0'); this.progress.setAttribute('aria-valuemax', String(snapshot.segmentSize)); this.progress.setAttribute('aria-valuenow', String(snapshot.segmentProgress));
  }

  setCapsLock(active: boolean): void { this.capsLock.hidden = !active; }

  private metric(label: string, value: HTMLElement): HTMLElement { const box = document.createElement('div'); box.className = 'metric'; const text = document.createElement('span'); text.textContent = `${label} `; box.append(text, value); return box; }
  private button(label: string, content: string, callback: () => void): HTMLButtonElement { const button = document.createElement('button'); button.className = 'icon-button'; button.type = 'button'; button.setAttribute('aria-label', label); button.innerHTML = content; button.addEventListener('click', callback); return button; }
}
