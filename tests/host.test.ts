import {describe,it,expect,afterEach,vi} from 'vitest';
import {WorkbookSession,isWorkbookParentOrigin,parseLevelParam,initHost,postToHost,type HostMessage} from '../src/host';

function fixture(levelCount=5){
  const messages:HostMessage[]=[];
  const session=new WorkbookSession(message=>messages.push(message),levelCount);
  return {session,messages};
}

describe('Workbook deep links and parent-origin boundary',()=>{
  it.each([1,2,3,4,5])('opens public level %i as its zero-based job index',level=>{
    expect(parseLevelParam(`?level=${level}`,5)).toBe(level-1);
  });
  it.each(['','?other=2','?level=','?level=0','?level=6','?level=-1','?level=1.5','?level=2.0','?level=1e0','?level=text','?level=NaN','?level=Infinity','?level=%202','?level=2%20'])('rejects absent or invalid deep link %s',search=>{
    expect(parseLevelParam(search,5)).toBeNull();
  });
  it('supports the requested parameter key and respects the provided level count',()=>{
    expect(parseLevelParam('?job=3',3,'job')).toBe(2);
    expect(parseLevelParam('?job=4',3,'job')).toBeNull();
    expect(parseLevelParam('?level=3',3,'job')).toBeNull();
  });
  it.each([
    'https://workbook.co.il','https://english.workbook.co.il','https://english-games.workbook.co.il',
    'https://preview.english-games.workbook.co.il','http://localhost','http://localhost:5231',
    'http://127.0.0.1','http://127.0.0.1:4231',
  ])('allows intended parent origin %s',origin=>expect(isWorkbookParentOrigin(origin)).toBe(true));
  it.each([
    'https://workbook.co.il.evil.test','https://notworkbook.co.il','https://evil-workbook.co.il',
    'https://evil.test/workbook.co.il','https://workbook.co.il@evil.test','http://workbook.co.il',
    'https://localhost:5231','http://localhost.evil.test:5231','http://127.0.0.1.evil.test',
    'https://english.workbook.co.il:444','https://workbook.co.il/path','https://workbook.co.il?next=evil',
    'null','*','about:blank','//workbook.co.il','',
  ])('rejects unrelated, deceptive or non-origin parent %s',origin=>expect(isWorkbookParentOrigin(origin)).toBe(false));
});

describe('Workbook actual-play lifecycle',()=>{
  it('sends ready once without pretending the planning screen started a level',()=>{
    const {session,messages}=fixture();
    expect(messages).toEqual([]);session.markReady();session.markReady();
    expect(messages).toEqual([{type:'ready'}]);
  });
  it('queues actual starts and completions before ready, then emits ready first',()=>{
    const {session,messages}=fixture();
    session.startLevel(3);session.completeLevel(3,1234.6);expect(messages).toEqual([]);
    session.markReady();
    expect(messages).toEqual([{type:'ready'},{type:'level-start',level:3},{type:'level-complete',level:3,durationMs:1235}]);
  });
  it('preserves the order of multiple actual plays queued before readiness',()=>{
    const {session,messages}=fixture();
    session.startLevel(1);session.completeLevel(1,1000);session.startLevel(2);session.completeLevel(2,2000);
    session.markReady();session.markReady();
    expect(messages).toEqual([
      {type:'ready'},{type:'level-start',level:1},{type:'level-complete',level:1,durationMs:1000},
      {type:'level-start',level:2},{type:'level-complete',level:2,durationMs:2000},
    ]);
  });
  it('deduplicates the active attempt and repeated success frames',()=>{
    const {session,messages}=fixture();session.markReady();
    session.startLevel(1);session.startLevel(1);session.completeLevel(1,10.2);session.completeLevel(1,30);session.startLevel(1);
    expect(messages).toEqual([{type:'ready'},{type:'level-start',level:1},{type:'level-complete',level:1,durationMs:10}]);
  });
  it('allows a real retry of the same level after reset without fabricating a completion',()=>{
    const {session,messages}=fixture();session.markReady();session.startLevel(2);session.resetLevel();
    expect(messages).toEqual([{type:'ready'},{type:'level-start',level:2}]);
    session.startLevel(2);session.completeLevel(2,800);
    expect(messages).toEqual([{type:'ready'},{type:'level-start',level:2},{type:'level-start',level:2},{type:'level-complete',level:2,durationMs:800}]);
  });
  it('retains retry ordering even before the initial ready message',()=>{
    const {session,messages}=fixture();session.startLevel(4);session.resetLevel();session.startLevel(4);session.completeLevel(4,500);session.markReady();
    expect(messages).toEqual([{type:'ready'},{type:'level-start',level:4},{type:'level-start',level:4},{type:'level-complete',level:4,durationMs:500}]);
  });
  it('ignores premature and mismatched completion while preserving the valid active attempt',()=>{
    const {session,messages}=fixture();session.completeLevel(1,10);session.markReady();session.completeLevel(1,10);
    session.startLevel(2);session.completeLevel(1,500);session.completeLevel(3,500);session.completeLevel(2,600);
    expect(messages).toEqual([{type:'ready'},{type:'level-start',level:2},{type:'level-complete',level:2,durationMs:600}]);
  });
  it('rejects invalid duration without consuming the level completion',()=>{
    const {session,messages}=fixture();session.markReady();session.startLevel(5);
    for(const duration of [NaN,Infinity,-Infinity,-1])session.completeLevel(5,duration);
    expect(messages).toEqual([{type:'ready'},{type:'level-start',level:5}]);
    session.completeLevel(5,0);
    expect(messages.at(-1)).toEqual({type:'level-complete',level:5,durationMs:0});
  });
  it('rejects invalid event levels without losing a valid start',()=>{
    const {session,messages}=fixture();session.markReady();session.startLevel(1);
    for(const level of [0,6,-1,1.5,NaN,Infinity]){session.startLevel(level);session.completeLevel(level,100);}
    session.completeLevel(1,101.5);
    expect(messages).toEqual([{type:'ready'},{type:'level-start',level:1},{type:'level-complete',level:1,durationMs:102}]);
  });
  it('honors a smaller catalog level count',()=>{
    const {session,messages}=fixture(3);session.markReady();session.startLevel(4);session.completeLevel(4,1);session.startLevel(3);session.completeLevel(3,1);
    expect(messages).toEqual([{type:'ready'},{type:'level-start',level:3},{type:'level-complete',level:3,durationMs:1}]);
  });
});


describe('Workbook browser adapter without a real browser',()=>{
  afterEach(()=>{vi.unstubAllGlobals();initHost('rooftop-radio');});
  function parentFixture(origin:string|null,standalone=false,referrer=''){
    const post=vi.fn();
    const listeners=new Map<string,(event:{message?:unknown;reason?:unknown})=>void>();
    const browser:Record<string,unknown>={
      location:{ancestorOrigins:origin?[origin]:[]},
      addEventListener:(type:string,listener:(event:{message?:unknown;reason?:unknown})=>void)=>listeners.set(type,listener),
    };
    browser.parent=standalone?browser:{postMessage:post};
    browser.postMessage=post;
    vi.stubGlobal('window',browser);vi.stubGlobal('document',{referrer});
    return {post,listeners};
  }
  it('posts nothing in standalone play even with a Workbook referrer',()=>{
    const {post}=parentFixture('https://english-games.workbook.co.il',true,'https://english-games.workbook.co.il/rooftop-radio');
    initHost('rooftop-radio');postToHost({type:'ready'});postToHost({type:'level-start',level:1});
    expect(post).not.toHaveBeenCalled();
  });
  it('posts a versioned slug envelope only to the exact allowed iframe parent',()=>{
    const origin='https://english-games.workbook.co.il';const {post}=parentFixture(origin);
    initHost('rooftop-radio');postToHost({type:'ready'});
    expect(post).toHaveBeenCalledExactlyOnceWith({source:'workbook-game',version:1,slug:'rooftop-radio',type:'ready'},origin);
  });
  it('does not post to a deceptive parent',()=>{
    const {post,listeners}=parentFixture('https://workbook.co.il.evil.test');
    initHost('rooftop-radio');postToHost({type:'ready'});
    expect(post).not.toHaveBeenCalled();expect(listeners.size).toBe(0);
  });
  it('uses the parsed allowed referrer origin when ancestorOrigins is absent',()=>{
    const {post}=parentFixture(null,false,'http://localhost:3000/rooftop-radio?level=2');
    initHost('rooftop-radio');postToHost({type:'level-start',level:2});
    expect(post).toHaveBeenCalledExactlyOnceWith({source:'workbook-game',version:1,slug:'rooftop-radio',type:'level-start',level:2},'http://localhost:3000');
  });
  it('bounds error reports while preserving the trusted parent envelope',()=>{
    const origin='https://english-games.workbook.co.il';const {post,listeners}=parentFixture(origin);
    initHost('rooftop-radio');listeners.get('error')?.({message:'x'.repeat(220)});
    expect(post).toHaveBeenCalledExactlyOnceWith({source:'workbook-game',version:1,slug:'rooftop-radio',type:'error',message:'x'.repeat(200)},origin);
  });
});
