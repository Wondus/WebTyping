import type { ExtensionMessage } from '../shared/messages';

async function toggle(tab: chrome.tabs.Tab): Promise<void> {
  if (!tab.id) return;
  const url = tab.url ?? '';
  if (!/^https?:|^file:/.test(url)) {
    await chrome.action.setBadgeText({ tabId: tab.id, text: '!' });
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#b42318' });
    return;
  }
  const message: ExtensionMessage = { type: 'WEBTYPING_TOGGLE' };
  try {
    await chrome.tabs.sendMessage(tab.id, message);
  } catch {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
  }
}

chrome.action.onClicked.addListener((tab) => void toggle(tab));
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-webtyping') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) await toggle(tab);
});
