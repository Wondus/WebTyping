export interface KeyboardCallbacks { text(value: string): void; space(): void; backspace(wholeWord: boolean): void; escape(): void; activity(): void; capsLock(active: boolean): void }

export class KeyboardInputController {
  readonly input = document.createElement('textarea');
  private composing = false;
  private active = true;
  constructor(private readonly callbacks: KeyboardCallbacks) {
    this.input.className = 'hidden-input'; this.input.setAttribute('aria-label','Typing input'); this.input.autocapitalize='off'; this.input.autocomplete='off'; this.input.spellcheck=false;
    this.input.addEventListener('beforeinput', this.onBeforeInput);
    this.input.addEventListener('compositionstart', () => { this.composing = true; });
    this.input.addEventListener('compositionend', this.onCompositionEnd);
    document.addEventListener('keydown', this.onKeyDown, true);
    document.addEventListener('visibilitychange', this.onVisibility);
  }
  focus(): void { if (this.active && document.visibilityState === 'visible') this.input.focus({ preventScroll:true }); }
  setActive(active:boolean):void{this.active=active;if(active)this.focus();else this.input.blur()}
  destroy():void{document.removeEventListener('keydown',this.onKeyDown,true);document.removeEventListener('visibilitychange',this.onVisibility);this.input.removeEventListener('beforeinput',this.onBeforeInput);this.input.removeEventListener('compositionend',this.onCompositionEnd);this.input.remove()}
  private readonly onBeforeInput=(event:InputEvent):void=>{if(!this.active||this.composing)return;if(event.inputType==='insertText'&&event.data){event.preventDefault();if(event.data===' ')this.callbacks.space();else this.callbacks.text(event.data);this.callbacks.activity();this.input.value=''}};
  private readonly onCompositionEnd=(event:CompositionEvent):void=>{this.composing=false;if(this.active&&event.data){this.callbacks.text(event.data);this.callbacks.activity()}this.input.value=''};
  private readonly onKeyDown=(event:KeyboardEvent):void=>{
    this.callbacks.capsLock(event.getModifierState('CapsLock'));
    if(!this.active)return;
    const systemShortcut=(event.ctrlKey||event.metaKey)&&['l','t','w','r','n','p','s','f','u','j','i'].includes(event.key.toLowerCase());
    if(systemShortcut||event.key==='F12'||event.altKey&&!event.shiftKey)return;
    if(event.key==='Backspace'){event.preventDefault();event.stopImmediatePropagation();this.callbacks.backspace(event.ctrlKey||event.metaKey);this.callbacks.activity();return}
    if(event.key===' '){event.preventDefault();event.stopImmediatePropagation();this.callbacks.space();this.callbacks.activity();return}
    if(event.key==='Enter'){event.preventDefault();event.stopImmediatePropagation();this.input.value='';return}
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();this.callbacks.escape();return}
    if(event.key.length===1&&!event.ctrlKey&&!event.metaKey){event.stopImmediatePropagation();queueMicrotask(()=>this.focus())}
  };
  private readonly onVisibility=():void=>{if(document.visibilityState==='visible')this.focus()};
}
