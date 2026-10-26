import {describe,expect,it} from 'vitest';
import {Simulation,SPEED,type Input} from '../src/sim';
const dt=1/60;
const idle:Input={x:0,forward:0,jump:false,glide:false,interact:false,yaw:0};
function ticks(s:Simulation,n:number,input:Partial<Input>={}){for(let i=0;i<n;i++)s.update(dt,{...idle,...input});}
// A steering controller supplies ordinary analog movement; it never writes position,
// evidence, level, checkpoint or completion state.
function walk(s:Simulation,x:number,z:number,glide=false){
  for(let i=0;i<900;i++){
    const dx=x-s.p.x,dz=s.p.z-z;
    if(Math.hypot(dx,dz)<.12){ticks(s,18);return;}
    s.update(dt,{...idle,x:Math.max(-1,Math.min(1,dx*3/SPEED)),forward:Math.max(-1,Math.min(1,dz*3/SPEED)),glide});
    if(s.mode!=='play')throw Error(`Movement left play: ${s.text()}`);
  }
  throw Error(`Could not reach (${x},${z}): ${s.text()}`);
}
function tune(s:Simulation){ticks(s,1,{interact:true});ticks(s,1);}
function firstGlide(s:Simulation){
  s.start();walk(s,0,31.5);ticks(s,1,{forward:1,jump:true});walk(s,3.5,19.5,true);ticks(s,160);tune(s);
  expect(s.mode).toBe('success');expect(s.glideSeconds).toBeGreaterThan(.1);
}
function greenhouseToBell(s:Simulation){walk(s,0,10);walk(s,0,0);walk(s,2.5,1.5);tune(s);}
function broadToGreen(s:Simulation){walk(s,0,36);walk(s,-18,36);walk(s,-18,18);walk(s,-6,18);walk(s,-6,22);walk(s,3.5,22);walk(s,3.5,19.5);}
function toThird(s:Simulation){
  firstGlide(s);s.next();s.start();broadToGreen(s);tune(s);
  expect(s.evidence.progress).toBe(1);expect(s.evidence.past).toBe(false);
  greenhouseToBell(s);expect(s.mode).toBe('success');s.next();s.start();
}

describe('independent simulation input paths',()=>{
  it('vaults a low wall from the ground, clears it and lands with no early glider',()=>{
    const s=new Simulation(1);s.start();walk(s,0,35.2);walk(s,4.5,35.2);walk(s,4.5,34);
    expect(s.onGround).toBe(true);ticks(s,1,{forward:1,jump:true});
    expect(s.vaults).toBe(1);expect(s.events.filter(e=>e.type==='vault')).toHaveLength(1);
    ticks(s,18,{forward:1,jump:true});expect(s.gliding).toBe(false);
    walk(s,4.5,31.2);ticks(s,100);
    expect(s.p.z).toBeLessThan(32.37);expect(s.p.y).toBe(10);expect(s.onGround).toBe(true);
    expect(s.landings).toBeGreaterThan(0);expect(s.recoveries).toBe(0);
  });
  it('does not classify a jump away from the low wall as a vault',()=>{
    const s=new Simulation(1);s.start();walk(s,0,35.2);walk(s,4.5,35.2);walk(s,4.5,34);
    ticks(s,1,{forward:-1,jump:true});walk(s,4.5,36.5);ticks(s,100);
    expect(s.vaults).toBe(0);expect(s.events.some(e=>e.type==='vault')).toBe(false);
    expect(s.events.some(e=>e.type==='jump')).toBe(true);expect(s.onGround).toBe(true);expect(s.recoveries).toBe(0);
  });
  it('springs from the awning after a real drop and lands on the greenhouse roof',()=>{
    const s=new Simulation(1);s.start();walk(s,0,32);walk(s,-4,32);
    for(let i=0;i<240&&!s.events.some(e=>e.type==='awning-bounce');i++)ticks(s,1,{forward:1});
    expect(s.events.filter(e=>e.type==='awning-bounce')).toHaveLength(1);
    expect(s.p.y).toBe(8.3);expect(s.v.y).toBeGreaterThan(10);expect(s.onGround).toBe(false);
    expect(s.events.some(e=>e.type==='jump')).toBe(false);
    walk(s,0,22,true);ticks(s,160);walk(s,3.5,19.5);tune(s);
    expect(s.mode).toBe('success');expect(s.currentSite).toBe('greenhouse');expect(s.recoveries).toBe(0);
  });
  it('performs a satisfying first jump/glide and completes by physical tuning',()=>{
    const s=new Simulation(1);firstGlide(s);
    expect(s.events.some(e=>e.type==='jump')).toBe(true);
    expect(s.recoveries).toBe(0);
    expect(s.elapsed).toBeLessThan(30);
  });
  it('supports a broad alternate first path without precise jumping',()=>{
    const s=new Simulation(1);s.start();walk(s,0,36);walk(s,-18,36);walk(s,-18,18);walk(s,-6,18);walk(s,-6,22);walk(s,3.5,22);walk(s,3.5,19.5);tune(s);
    expect(s.mode).toBe('success');expect(s.recoveries).toBe(0);expect(s.stunts).toBe(0);
  });
  it('walks down and back up an edge-to-edge bridge ramp without jumping or recovery',()=>{
    const s=new Simulation(1);s.start();walk(s,0,36);walk(s,-18,36);
    expect(s.p.y).toBe(10);expect(s.currentSite).toBe('antenna');
    walk(s,-18,18);expect(s.p.y).toBe(9);expect(s.currentSite).toBe('laundry');expect(s.onGround).toBe(true);
    walk(s,-18,36);expect(s.p.y).toBe(10);expect(s.currentSite).toBe('antenna');expect(s.onGround).toBe(true);
    expect(s.recoveries).toBe(0);expect(s.stunts).toBe(0);
  });
  it('returns from planning help and vocabulary without launching or consuming time',()=>{
    const s=new Simulation(1);const start={...s.p};s.pause('help');expect(s.mode).toBe('help');
    s.vocabulary();expect(s.mode).toBe('vocabulary');ticks(s,600,{forward:1,jump:true});
    s.resume();expect(s.mode).toBe('planning');expect(s.p).toEqual(start);expect(s.elapsed).toBe(0);expect(s.assisted).toBe(true);
  });
  it('pauses movement and medal time for planning, help and vocabulary',()=>{
    const s=new Simulation(1);const start={...s.p};ticks(s,600,{forward:1,jump:true});expect(s.p).toEqual(start);expect(s.elapsed).toBe(0);
    s.start();ticks(s,60,{forward:1});s.vocabulary();const p={...s.p},time=s.elapsed;ticks(s,600,{forward:1});expect(s.p).toEqual(p);expect(s.elapsed).toBe(time);expect(s.assisted).toBe(true);
    s.resume();s.pause('help');ticks(s,600,{forward:1});expect(s.elapsed).toBe(time);expect(s.p).toEqual(p);s.resume();ticks(s,60);expect(s.elapsed).toBeGreaterThan(time);
  });
  it('recovers an unglided fall to a safe roof without advancing the job',()=>{
    const s=new Simulation(1);s.start();ticks(s,400,{forward:1});
    expect(s.recoveries).toBeGreaterThan(0);expect(s.evidence.progress).toBe(0);expect(s.mode).toBe('play');
    expect(s.checkpoint.y).toBeGreaterThan(8);
  });
  it('rejects a fragile delivery after only touching the first awning then gliding across the direct route',()=>{
    const s=new Simulation(1);toThird(s);walk(s,0,0);walk(s,-14,0);walk(s,-15.5,1.5);tune(s);expect(s.mode).toBe('success');
    s.next();s.start();expect(s.job.id).toBe(4);
    walk(s,0,18);walk(s,0,22);walk(s,-6,22);walk(s,-6,18);walk(s,-9,18);
    walk(s,-6,18);walk(s,-6,22);walk(s,0,22);walk(s,0,0);walk(s,-4.7,0);
    ticks(s,1,{x:-1,jump:true});walk(s,-14,0,true);ticks(s,160);walk(s,-15.5,1.5);tune(s);
    expect(s.recoveries).toBe(0);expect(s.mode).toBe('play');
  },30_000);
  it('plays all five contracts, emits actual route evidence and replaces a dropped parcel',()=>{
    const s=new Simulation(1);toThird(s);expect(s.job.id).toBe(3);
    walk(s,0,0);expect(s.evidence.junction).toBe(false);
    walk(s,-8,0);expect(s.evidence.junction).toBe(true);
    walk(s,-14,0);walk(s,-15.5,1.5);tune(s);expect(s.mode).toBe('success');
    s.next();s.start();expect(s.job.id).toBe(4);walk(s,0,0);
    for(let i=0;i<180&&s.recoveries===0;i++)ticks(s,1,{x:-1});
    ticks(s,30);expect(s.recoveries).toBe(1);expect(s.evidence.damaged).toBe(false);expect(s.evidence.wide).toBe(false);expect(s.evidence.progress).toBe(0);
    walk(s,0,0);walk(s,0,18);walk(s,0,22);walk(s,-6,22);walk(s,-6,18);walk(s,-18,18);walk(s,-18,0);walk(s,-15.5,1.5);tune(s);
    expect(s.mode).toBe('success');expect(s.evidence.wide).toBe(true);
    s.next();s.start();expect(s.job.id).toBe(5);expect(s.job.hint).toBeNull();s.hint();expect(s.assisted).toBe(false);
    broadToGreen(s);greenhouseToBell(s);expect(s.evidence.progress).toBe(1);
    walk(s,0,0);walk(s,0,18);walk(s,3.5,19.5);tune(s);expect(s.evidence.progress).toBe(2);expect(s.evidence.past).toBe(false);expect(s.evidence.junction).toBe(false);
    walk(s,0,10);walk(s,0,0);walk(s,8,0);expect(s.evidence.past).toBe(true);expect(s.evidence.junction).toBe(true);
    walk(s,18,0);walk(s,20.5,1.5);tune(s);expect(s.mode).toBe('success');s.next();expect(s.mode).toBe('won');
    // Parcel loss is tracked as recovery; mistakes currently counts rejected relay tunes.
    // The final job had zero recoveries, so this specifically checks campaign aggregation.
    expect(s.recoveries).toBe(0);expect(s.totals.recoveries).toBe(1);
    expect(s.totals.assisted).toBe(false);expect(s.totals.mistakes).toBe(0);
    expect(s.totalTime).toBeGreaterThan(s.elapsed);
    const finalTime=s.totalTime;s.next();expect(s.totalTime).toBe(finalTime);expect(s.totals.recoveries).toBe(1);
  },30_000);
});
