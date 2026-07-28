import type { Settings } from '../settings/settings-types';

export interface SettingsActions { save(settings: Settings): void; pick(): void; detect(): void; restart(): void; close(): void }
export class SettingsPanel {
  readonly element = document.createElement('section');
  constructor(settings: Settings, actions: SettingsActions) {
    this.element.className = 'settings'; this.element.setAttribute('aria-label', 'Settings'); this.element.innerHTML = '<h2>Settings</h2>';
    const draft = { ...settings };
    this.number('Words per WPM segment', settings.segmentWords, 1, 50, (v) => draft.segmentWords = v);
    this.number('Idle timeout (seconds)', settings.idleSeconds, 1, 10, (v) => draft.idleSeconds = v);
    this.number('Highlighted next words', settings.highlightedNextWords, 0, 5, (v) => draft.highlightedNextWords = v);
    this.check('Case sensitive', settings.caseSensitive, (v) => draft.caseSensitive = v);
    this.check('Skip emojis', settings.skipEmojis, (v) => draft.skipEmojis = v);
    this.check('Skip punctuation', settings.skipPunctuation, (v) => draft.skipPunctuation = v);
    this.number('Font size', settings.fontSize, 16, 48, (v) => draft.fontSize = v);
    this.number('Text column width', settings.columnWidth, 560, 1100, (v) => draft.columnWidth = v);
    const save = this.button('Save', 'primary', () => actions.save(draft)); this.element.append(save, document.createElement('hr'));
    const controls = document.createElement('div'); controls.className = 'actions'; controls.append(this.button('Select content', '', actions.pick), this.button('Detect again', '', actions.detect), this.button('Restart', '', actions.restart), this.button('Exit', 'danger', actions.close)); this.element.append(controls);
    const version = document.createElement('p'); version.className = 'version'; version.textContent = 'WebTyping 1.5.0'; this.element.append(version);
  }
  private number(label: string, value: number, min: number, max: number, change: (value: number) => void): void { const input = document.createElement('input'); input.type='number'; input.value=String(value); input.min=String(min); input.max=String(max); input.addEventListener('change',()=>change(Math.min(max,Math.max(min,Number(input.value))))); this.field(label,input); }
  private check(label:string,value:boolean,change:(value:boolean)=>void):void{const input=document.createElement('input');input.type='checkbox';input.checked=value;input.addEventListener('change',()=>change(input.checked));this.field(label,input)}
  private field(label:string,input:HTMLElement):void{const row=document.createElement('label');row.className='field';const text=document.createElement('span');text.textContent=label;row.append(text,input);this.element.append(row)}
  private button(text:string,className:string,click:()=>void):HTMLButtonElement{const button=document.createElement('button');button.type='button';button.textContent=text;button.className=className;button.addEventListener('click',click);return button}
}
