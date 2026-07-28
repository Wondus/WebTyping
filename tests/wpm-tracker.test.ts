import { describe,expect,it } from 'vitest';
import { WpmTracker } from '../src/typing/wpm-tracker';

describe('WpmTracker',()=>{
  it('does not start before the first keystroke',()=>expect(new WpmTracker().getSnapshot(5000)).toMatchObject({status:'not-started',activeMs:0,averageWpm:0}));
  it('calculates standard WPM from active time',()=>{const t=new WpmTracker();t.recordKeystroke(true,0);t.recordKeystroke(true,1000);expect(t.getSnapshot(1000).averageWpm).toBe(24)});
  it('creates and resets a ten-word segment',()=>{const t=new WpmTracker(10);for(let i=0;i<10;i++){t.recordKeystroke(true,i*100);t.completeWord(i*100)}const s=t.getSnapshot(900);expect(s.segmentProgress).toBe(0);expect(s.segments).toHaveLength(1);expect(s.currentWpm).toBeGreaterThan(0)});
  it('calculates a weighted total average',()=>{const t=new WpmTracker(1);t.recordKeystroke(true,0);t.completeWord(1000);t.recordKeystroke(true,2000);t.completeWord(5000);expect(t.getSnapshot(5000).averageWpm).toBe(4.8)});
  it('stops active time at the idle limit and resumes cleanly',()=>{const t=new WpmTracker(10,3000);t.recordKeystroke(true,0);expect(t.getSnapshot(8000)).toMatchObject({status:'idle',activeMs:3000,idleMs:5000});t.recordKeystroke(true,8000);t.recordKeystroke(true,8200);expect(t.getSnapshot(8200).activeMs).toBe(3200)});
  it('changes the segment size',()=>{const t=new WpmTracker(10);t.setSegmentSize(2);t.recordKeystroke(true,0);t.completeWord(100);t.completeWord(200);expect(t.getSnapshot(200).segments).toHaveLength(1)});
  it('lets errors and skips reduce accuracy without adding WPM characters',()=>{const t=new WpmTracker(2);t.recordKeystroke(true,0);t.recordKeystroke(false,100);t.completeWord(200);t.recordSkippedCharacters(4,300);t.completeWord(400);const s=t.getSnapshot(400);expect(s.accuracy).toBeCloseTo(100/6);expect(s.segments[0]?.correctCharacters).toBe(1)});
  it('does not count paused time after resuming',()=>{const t=new WpmTracker();t.recordKeystroke(true,0);t.pause(500);t.recordKeystroke(true,10000);t.recordKeystroke(true,10100);expect(t.getSnapshot(10100).activeMs).toBe(600)});
});
