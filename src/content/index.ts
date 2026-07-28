import { AppController } from './app-controller';
import type { ExtensionMessage } from '../shared/messages';

declare global { interface Window { __webTypingController?: AppController } }

window.__webTypingController?.close();
const controller=new AppController();window.__webTypingController=controller;
chrome.runtime.onMessage.addListener((message:ExtensionMessage)=>{if(message.type==='WEBTYPING_TOGGLE')void controller.activate()});
void controller.activate();
