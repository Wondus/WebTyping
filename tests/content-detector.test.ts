import { beforeEach,describe,expect,it } from 'vitest';
import { ContentDetector } from '../src/content/content-detector';

const prose='Toto je dostatečně dlouhá věta článku, která obsahuje mnoho užitečných slov pro spolehlivou detekci hlavního textového obsahu stránky. '.repeat(8);
describe('ContentDetector',()=>{
  beforeEach(()=>{document.body.innerHTML=''});
  it('prefers an article over navigation',()=>{document.body.innerHTML=`<nav>${'<a>Menu item</a>'.repeat(80)}</nav><article><h1>Heading</h1><p>${prose}</p><p>${prose}</p></article>`;expect(new ContentDetector().detect().element?.tagName).toBe('ARTICLE')});
  it('finds the main element',()=>{document.body.innerHTML=`<main><p>${prose}</p><p>${prose}</p></main>`;expect(new ContentDetector().detect().element?.tagName).toBe('MAIN')});
  it('finds a non-semantic text container',()=>{document.body.innerHTML=`<div class="story"><p>${prose}</p><p>${prose}</p></div>`;expect(new ContentDetector().detect().element?.className).toBe('story')});
  it('ignores sidebars, cookie banners, and hidden content',()=>{document.body.innerHTML=`<aside><p>${prose.repeat(3)}</p></aside><div class="cookie-banner"><p>${prose.repeat(3)}</p></div><div style="display:none"><p>${prose.repeat(4)}</p></div><article><p>${prose}</p></article>`;expect(new ContentDetector().detect().element?.tagName).toBe('ARTICLE')});
  it('penalizes controls inside candidate content',()=>{document.body.innerHTML=`<div class="controls"><p>${prose}</p>${'<button>Action</button>'.repeat(80)}</div><article><p>${prose}</p></article>`;expect(new ContentDetector().detect().element?.tagName).toBe('ARTICLE')});
  it('returns none without a suitable candidate',()=>{document.body.innerHTML='<nav><a>Home</a></nav><p>Short.</p>';expect(new ContentDetector().detect().confidence).toBe('none')});
});
