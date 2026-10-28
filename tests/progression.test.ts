import {describe,expect,it} from 'vitest';
import {ProgressStore,completedCount,emptyProgress,finishProgressLevel,readProgress,recommendedLevel,selectProgressLevel,PROGRESS_KEY,type Result} from '../src/progression';
const result:Result={durationMs:12500,recoveries:1,mistakes:2,assisted:true,notes:4,bestFlow:3};
describe('numbered campaign progress without grade gates',()=>{
  it('starts at1 and does not count a direct late-level link as earlier completions',()=>{
    const p=selectProgressLevel(emptyProgress(),50,50);expect(p.currentLevel).toBe(50);expect(completedCount(p,50)).toBe(0);expect(recommendedLevel(p,50)).toBe(1);
    const done=finishProgressLevel(p,50,result,50);expect(completedCount(done,50)).toBe(1);expect(done.currentLevel).toBe(1);expect(Object.keys(done.levels)).toEqual(['50']);
  });
  it('saves actual completions in order and reaches fifty once each is earned',()=>{
    let p=emptyProgress();for(let n=1;n<=50;n++){p=finishProgressLevel(p,n,result,50);expect(completedCount(p,50)).toBe(n);expect(p.currentLevel).toBe(Math.min(50,n+1));}
    expect(recommendedLevel(p,50)).toBe(50);expect(readProgress(JSON.stringify(p),50)).toEqual(p);
  });
  it('keeps the best independent replay measures and an unaided completion',()=>{
    let p=finishProgressLevel(emptyProgress(),4,result,50);p=finishProgressLevel(p,4,{...result,durationMs:15100,recoveries:0,mistakes:0,assisted:false,notes:7,bestFlow:6},50);
    expect(p.levels['4']).toEqual({completions:2,bestTimeMs:12500,fewestRecoveries:0,fewestMistakes:0,unaided:true,mostNotes:7,bestFlow:6});
    expect(completedCount(p,50)).toBe(1);
  });
  it.each([null,'{broken','null','[]','{"version":2,"levels":{}}','{"version":1,"levels":null}'])('recovers malformed saves %s',raw=>expect(readProgress(raw,50)).toEqual(emptyProgress()));
  it('filters out malformed results and out-of-range saved levels',()=>{
    const good=finishProgressLevel(emptyProgress(),2,result,50).levels['2'];
    const p=readProgress(JSON.stringify({version:1,currentLevel:51,levels:{2:good,3:{...good,bestTimeMs:-1},4:{...good,completions:1.5},51:good}}),50);
    expect(p.currentLevel).toBe(1);expect(Object.keys(p.levels)).toEqual(['2']);
  });
  it('rejects nonexistent levels and nonfinite times without changing existing progress',()=>{
    const p=emptyProgress();for(const n of [0,51,1.5,NaN])expect(finishProgressLevel(p,n,result,50)).toBe(p);
    for(const durationMs of [-1,NaN,Infinity])expect(finishProgressLevel(p,1,{...result,durationMs},50)).toBe(p);
    expect(selectProgressLevel(p,51,50)).toBe(p);
  });
  it('persists completion and selection through a new session',()=>{
    const values=new Map<string,string>();const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
    const first=new ProgressStore(storage,50);first.complete(1,result);first.select(31);
    expect(values.has(PROGRESS_KEY)).toBe(true);const second=new ProgressStore(storage,50);expect(second.value.currentLevel).toBe(31);expect(completedCount(second.value,50)).toBe(1);
  });
  it('continues playing when browser storage is disabled or full',()=>{
    const store=new ProgressStore({getItem:()=>{throw Error('disabled')},setItem:()=>{throw Error('full')}},50);store.complete(1,result);store.select(50);
    expect(store.value.currentLevel).toBe(50);expect(completedCount(store.value,50)).toBe(1);
  });
});
