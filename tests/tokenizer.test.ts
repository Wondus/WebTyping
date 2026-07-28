import { describe, expect, it } from 'vitest';
import { Tokenizer } from '../src/typing/tokenizer';

const tokenizer=new Tokenizer();
describe('Tokenizer',()=>{
  it.each([
    ['Příliš žluťoučký kůň', ['Příliš','žluťoučký','kůň']],
    ['Hello, “world”!',['Hello,','“world”!']],
    ["don't re-enter 1,234.50",["don't",'re-enter','1,234.50']],
    ['  více   mezer\t i řádků ',['více','mezer','i','řádků']],
  ])('tokenizes %s', (text,expected)=>expect(tokenizer.tokenize(text).map((word)=>word.text)).toEqual(expected));
  it('preserves block and word order',()=>{const words=tokenizer.tokenize([{kind:'heading',text:'Heading'},{kind:'paragraph',text:'First paragraph.'},{kind:'paragraph',text:'Second.'}]);expect(words.map((w)=>w.blockIndex)).toEqual([0,1,1,2]);expect(words[1]?.wordIndexInBlock).toBe(0)});
  it('returns an empty list for empty content',()=>expect(tokenizer.tokenize(' \n ')).toEqual([]));
  it('skips complete and embedded emoji sequences when enabled',()=>{expect(tokenizer.tokenize('Hello 👋🏽 ready🚀 flag 🇨🇿 key 1️⃣', {skipEmojis:true}).map((word)=>word.text)).toEqual(['Hello','ready','flag','key'])});
  it('keeps emojis by default',()=>expect(tokenizer.tokenize('Hello 👋').map((word)=>word.text)).toEqual(['Hello','👋']));
  it('removes punctuation from displayed targets when enabled',()=>expect(tokenizer.tokenize('“Hello,” don\'t re-enter... fine!',{skipPunctuation:true}).map((word)=>word.text)).toEqual(['Hello','dont','reenter','fine']));
});
