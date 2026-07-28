import { describe,expect,it } from 'vitest';
import { Tokenizer } from '../src/typing/tokenizer';
import { TypingEngine } from '../src/typing/typing-engine';
import { TypingView } from '../src/ui/typing-view';

describe('long text',()=>{
  it('creates and incrementally updates 10,000 words',()=>{
    const text=Array.from({length:10_000},(_,index)=>`slovo${index}`).join(' ');
    const tokens=new Tokenizer().tokenize(text);const engine=new TypingEngine(tokens,{caseSensitive:true,skipPunctuation:false});
    const view=new TypingView(tokens,[{kind:'paragraph',text}]);view.update(engine,{caseSensitive:true,skipPunctuation:false},2);const caret=view.copy.querySelector('.caret');engine.type('s');view.update(engine,{caseSensitive:true,skipPunctuation:false},2);
    expect(tokens).toHaveLength(10_000);expect(view.copy.querySelectorAll('.word')).toHaveLength(10_000);expect(view.copy.querySelectorAll('.current')).toHaveLength(1);expect(view.copy.querySelector('.caret')).toBe(caret);
  });
});
