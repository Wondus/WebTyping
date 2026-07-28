import { describe,expect,it } from 'vitest';
import { Tokenizer } from '../src/typing/tokenizer';
import { TypingEngine } from '../src/typing/typing-engine';

const make=(text:string,overrides:Partial<ConstructorParameters<typeof TypingEngine>[1]>={})=>new TypingEngine(new Tokenizer().tokenize(text),{caseSensitive:true,skipPunctuation:false,...overrides});
describe('TypingEngine',()=>{
  it('completes a correct word',()=>{const e=make('hello world');e.type('hello');expect(e.completeWord().accepted).toBe(true);expect(e.getSnapshot().words[0]?.status).toBe('correct')});
  it('keeps an incorrect keystroke after correction',()=>{const e=make('browser');e.type('browz');e.backspace();e.type('s');expect(e.getSnapshot().metrics).toMatchObject({correctKeystrokes:5,incorrectKeystrokes:1,corrections:1});});
  it('marks an extra character',()=>{const e=make('text');e.type('textt');expect(e.getSnapshot().metrics).toMatchObject({extraKeystrokes:1,incorrectKeystrokes:1})});
  it('skips an empty word',()=>{const e=make('one two');e.completeWord();expect(e.getSnapshot().words[0]?.status).toBe('skipped');expect(e.getSnapshot().metrics.skippedWords).toBe(1)});
  it('allows an incorrect word in tolerant mode',()=>{const e=make('abc next');e.type('abd');expect(e.completeWord().accepted).toBe(true);expect(e.getSnapshot().metrics.incorrectCompletedWords).toBe(1)});
  it('returns to the previous word only from an untouched empty word',()=>{const e=make('first second');e.type('first');e.completeWord();expect(e.backspace().movedBack).toBe(true);expect(e.getSnapshot().currentIndex).toBe(0)});
  it('does not return after typing and deleting a character in the next word',()=>{const e=make('a b');e.type('a');e.completeWord();e.type('b');expect(e.backspace().movedBack).not.toBe(true);expect(e.backspace().accepted).toBe(false)});
  it('completes the final word',()=>{const e=make('done');e.type('done');expect(e.completeWord().sessionCompleted).toBe(true);expect(e.getSnapshot().completed).toBe(true)});
  it('supports case-insensitive matching',()=>{const e=make('English',{caseSensitive:false});e.type('english');e.completeWord();expect(e.getSnapshot().words[0]?.status).toBe('correct')});
  it('supports punctuation-insensitive matching',()=>{const e=make('Hello, world!',{skipPunctuation:true});e.type('Hello');e.completeWord();expect(e.getSnapshot().words[0]?.status).toBe('correct')});
  it('clears the current input with Ctrl+Backspace',()=>{const e=make('word');e.type('wor');e.backspace(true);expect(e.getSnapshot().words[0]?.typed).toBe('')});
});
