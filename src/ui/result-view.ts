import type { SessionSummary } from '../typing/session-stats';

export function createResultView(summary: SessionSummary, retry: () => void, pick: () => void, close: () => void): HTMLElement {
  const backdrop = document.createElement('div'); backdrop.className = 'modal-backdrop';
  const card = document.createElement('section'); card.className = 'card'; card.setAttribute('role','dialog'); card.setAttribute('aria-modal','true'); card.innerHTML='<h2>Completed</h2><p>Results for this local session.</p>';
  const grid=document.createElement('div');grid.className='results-grid';
  const metrics: Array<readonly [string,string]>=[['Average WPM',summary.averageWpm.toFixed(0)],['Best segment',summary.bestWpm.toFixed(0)],['Accuracy',`${summary.accuracy.toFixed(1)} %`],['Active time',`${(summary.activeMs/1000).toFixed(1)} s`],['Words',String(summary.completedWords)],['Errors',String(summary.incorrectKeystrokes)],['Corrections',String(summary.corrections)],['Skipped',String(summary.skippedWords)]];
  for(const [label,value] of metrics){const item=document.createElement('div');item.className='result';const name=document.createElement('span');name.textContent=label;const strong=document.createElement('strong');strong.textContent=value;item.append(name,strong);grid.append(item)}card.append(grid);
  if(summary.segmentWpms.length){const chart=document.createElement('div');chart.className='chart';chart.setAttribute('aria-label',`WPM segments: ${summary.segmentWpms.join(', ')}`);const max=Math.max(...summary.segmentWpms,1);for(const value of summary.segmentWpms){const bar=document.createElement('i');bar.style.height=`${value/max*100}%`;bar.title=`${value.toFixed(0)} WPM`;chart.append(bar)}card.append(chart)}
  const actions=document.createElement('div');actions.className='actions';for(const [text,fn,klass] of [['Try again',retry,'primary'],['Select different text',pick,''],['Close',close,'']] as const){const button=document.createElement('button');button.textContent=text;button.className=klass;button.addEventListener('click',fn);actions.append(button)}card.append(actions);backdrop.append(card);return backdrop;
}
