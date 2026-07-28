import styles from './styles.css?inline';
import type { Settings } from '../settings/settings-types';
import type { TextBlock, WpmSnapshot, WordToken } from '../typing/types';
import type { TypingEngine } from '../typing/typing-engine';
import type { SessionSummary } from '../typing/session-stats';
import { TopBar } from '../ui/top-bar';
import { TypingView } from '../ui/typing-view';
import { SettingsPanel } from '../ui/settings-panel';
import { createResultView } from '../ui/result-view';

export interface OverlayActions { start():void; pick():void; detect():void; restart():void; close():void; saveSettings(settings:Settings):void }
export class OverlayApp {
  readonly host=document.createElement('div');
  private readonly shadow:ShadowRoot; private readonly shell=document.createElement('div'); private readonly live=document.createElement('div');
  private readonly topBar:TopBar; private typingView:TypingView|null=null; private settingsPanel:HTMLElement|null=null; private modal:HTMLElement|null=null;
  constructor(private settings:Settings,private readonly actions:OverlayActions){
    this.host.id='webtyping-extension-root';this.shadow=this.host.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent=styles;this.shell.className='shell';this.live.className='sr-only';this.live.setAttribute('aria-live','polite');this.topBar=new TopBar(()=>this.toggleSettings(),actions.pick,actions.close);this.shell.append(this.topBar.element,this.live);this.shadow.append(style,this.shell);document.documentElement.append(this.host);this.applySettings();
  }
  preview(wordCount:number,confidence:'high'|'low'):void{this.clearContent();this.shell.style.background='transparent';const backdrop=this.dialog('Content detected',`Found ${wordCount} words. ${confidence==='low'?'Please check the selected area before starting.':'This area looks like the main page content.'}`,[['Start typing',this.actions.start,'primary'],['Select different content',this.actions.pick,''],['Cancel',this.actions.close,'']]);this.modal=backdrop;this.shell.append(backdrop)}
  showTyping(tokens:readonly WordToken[],blocks:readonly TextBlock[],engine:TypingEngine):void{this.clearContent();this.shell.style.background='';this.typingView=new TypingView(tokens,blocks);this.shell.append(this.typingView.reader);this.updateTyping(engine);}
  updateTyping(engine:TypingEngine):HTMLElement|null{if(!this.typingView)return null;return this.typingView.update(engine,this.typingOptions(),this.settings.highlightedNextWords)}
  updateStats(snapshot:WpmSnapshot):void{this.topBar.update(snapshot);this.shell.classList.toggle('idle',snapshot.status==='idle');if(snapshot.status==='idle')this.live.textContent='Typing paused due to inactivity.'}
  setCapsLock(active:boolean):void{this.topBar.setCapsLock(active)}
  showResults(summary:SessionSummary):void{this.modal?.remove();this.modal=createResultView(summary,this.actions.restart,this.actions.pick,this.actions.close);this.shell.append(this.modal);this.live.textContent='Text completed.'}
  setVisible(visible:boolean):void{this.host.style.display=visible?'':'none'}
  updateSettings(settings:Settings):void{this.settings=settings;this.applySettings();this.settingsPanel?.remove();this.settingsPanel=null}
  announce(message:string):void{this.live.textContent=message}
  destroy():void{this.host.remove()}
  private toggleSettings():void{if(this.settingsPanel){this.settingsPanel.remove();this.settingsPanel=null;return}const panel=new SettingsPanel(this.settings,{save:(s)=>this.actions.saveSettings(s),pick:this.actions.pick,detect:this.actions.detect,restart:this.actions.restart,close:this.actions.close});this.settingsPanel=panel.element;this.shell.append(panel.element)}
  private clearContent():void{this.typingView?.destroy();this.typingView?.reader.remove();this.typingView=null;this.modal?.remove();this.modal=null;this.settingsPanel?.remove();this.settingsPanel=null}
  private applySettings():void{this.shell.style.setProperty('--font-size',`${this.settings.fontSize}px`);this.shell.style.setProperty('--column-width',`${this.settings.columnWidth}px`)}
  private typingOptions(){return{caseSensitive:this.settings.caseSensitive,skipPunctuation:this.settings.skipPunctuation}}
  private dialog(title:string,text:string,buttons:readonly (readonly [string,()=>void,string])[]):HTMLElement{const backdrop=document.createElement('div');backdrop.className='modal-backdrop';const card=document.createElement('section');card.className='card';card.setAttribute('role','dialog');const heading=document.createElement('h2');heading.textContent=title;const paragraph=document.createElement('p');paragraph.textContent=text;const actions=document.createElement('div');actions.className='actions';for(const [label,click,className] of buttons){const button=document.createElement('button');button.textContent=label;button.className=className;button.addEventListener('click',click);actions.append(button)}card.append(heading,paragraph,actions);backdrop.append(card);return backdrop}
}
