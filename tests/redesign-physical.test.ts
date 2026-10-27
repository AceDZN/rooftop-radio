import {describe,it,expect} from 'vitest';
import {Simulation,SPEED,type Input} from '../src/sim';

const frame=1/60;
const released:Input={x:0,forward:0,yaw:0,jump:false,glide:false,interact:false,dash:false};
const clamp=(n:number)=>Math.max(-1,Math.min(1,n));
function tick(s:Simulation,count=1,input:Partial<Input>={}){for(let i=0;i<count;i++)s.update(frame,{...released,...input});}
// Only ordinary analog controls are supplied. The controller never writes state.
function steer(s:Simulation,x:number,z:number,glide=false){
  for(let i=0;i<1200;i++){
    const dx=x-s.p.x,dz=s.p.z-z;
    if(Math.hypot(dx,dz)<.08){tick(s,18);return;}
    tick(s,1,{x:clamp(dx*3/SPEED),forward:clamp(dz*3/SPEED),glide});
    if(s.mode!=='play')throw Error('Unexpected mode while steering: '+s.text());
  }
  throw Error(`Could not steer to (${x},${z}): ${s.text()}`);
}
function settle(s:Simulation){for(let i=0;i<600&&!s.onGround;i++)tick(s);expect(s.onGround).toBe(true);tick(s,2);}
function tune(s:Simulation){tick(s,1,{interact:true});tick(s);}
function greenhouse(s:Simulation){
  if(s.mode==='planning')s.start();steer(s,0,31.4);tick(s,1,{forward:1,jump:true});steer(s,2,20,true);settle(s);steer(s,1,22);
}
function bell(s:Simulation){
  steer(s,0,13.6);tick(s,1,{forward:1,jump:true});steer(s,0,3,true);settle(s);steer(s,-2.4,-1.8);
}
function parcelJob(){
  const s=new Simulation(1);greenhouse(s);tune(s);expect(s.mode).toBe('success');
  s.next();greenhouse(s);tune(s);expect(s.evidence.progress).toBe(1);bell(s);tune(s);expect(s.mode).toBe('success');
  s.next();s.start();steer(s,0,0);steer(s,0,3.3);steer(s,-14,3.3);steer(s,-19.8,-4.4);tune(s);expect(s.mode).toBe('success');
  s.next();expect(s.job.id).toBe(4);return s;
}

// Expected poses and boundaries below are authored from the visible course design,
// not read back from the production collider/route helper arrays.
describe('redesigned physical choices and movement',()=>{
  it('starts facing the two west crossings, rejects the beam and a partial stripe, then accepts a full stripe crossing',()=>{
    for(const variant of [0,1]){
      const targets=new Simulation(variant).relays;
      expect(targets.map(r=>r.site).sort()).toEqual(['bell','clock','east','greenhouse','water','west']);
      expect(targets.find(r=>r.site==='greenhouse')?.pos).toEqual({x:-.5,y:9,z:22.2});
      expect(targets.find(r=>r.site==='bell')?.pos).toEqual({x:-2.4,y:9,z:-3.3});
      expect(targets.find(r=>r.site==='west')).toMatchObject({name:'Radio Station',pos:{x:-21.85,y:9,z:-4.4}});
      expect(targets.find(r=>r.site==='east')).toMatchObject({name:'Café',pos:{x:14.65,y:9,z:-1.3}});
    }
    const s=parcelJob();expect(s.p.x).toBeCloseTo(3);expect(s.p.z).toBeCloseTo(0);expect(s.yaw).toBe(-Math.PI/2);s.start();
    steer(s,0,-2);for(let i=0;i<180&&s.recoveries===0;i++)tick(s,1,{x:-1});tick(s,20);
    expect(s.recoveries).toBe(1);expect(s.evidence.progress).toBe(0);expect(s.evidence.wide).toBe(false);
    expect(s.events.some(e=>e.job===4&&e.type==='parcel-drop')).toBe(true);
    steer(s,0,-2);steer(s,0,3.3);steer(s,-8,3.3);expect(s.evidence.wide).toBe(false);
    steer(s,0,3.3);steer(s,0,-2);steer(s,-4.7,-2);tick(s,1,{x:-1,jump:true});steer(s,-14,-2,true);settle(s);steer(s,-19.8,-4.4);tune(s);
    expect(s.mode).toBe('play');expect(s.evidence.progress).toBe(0);expect(s.evidence.wide).toBe(false);
    steer(s,-14,3.3);steer(s,0,3.3);expect(s.evidence.wide).toBe(false);
    steer(s,-14,3.3);expect(s.evidence.wide).toBe(true);steer(s,-19.8,-4.4);tune(s);expect(s.mode).toBe('success');
  },30_000);

  it('walks through the hollow water-tower center while its separate cylindrical feet remain solid',()=>{
    const s=new Simulation(1);s.start();steer(s,0,37.4);steer(s,-4,37.4);steer(s,-4,41.5);
    expect(s.p.x).toBeCloseTo(-4,1);expect(s.p.z).toBeGreaterThan(41.3);expect(s.p.y).toBe(10);expect(s.recoveries).toBe(0);
    steer(s,-4,37.4);steer(s,-3.06,37.4);
    for(let i=0;i<180;i++){
      tick(s,1,{x:clamp((-3.06-s.p.x)*3/SPEED),forward:-1});
      expect(Math.hypot(s.p.x+3.06,s.p.z-38.86)).toBeGreaterThanOrEqual(.569);
    }
    expect(s.p.z).toBeLessThan(38.4);expect(s.recoveries).toBe(0);
  },30_000);

  it('allows the café center aisle under the canopy but blocks entry through the solid kiosk side',()=>{
    const s=new Simulation(1);greenhouse(s);bell(s);steer(s,12,0);steer(s,12,3.5);steer(s,18,3.5);steer(s,18,-1.5);
    expect(s.p.x).toBeCloseTo(18,1);expect(s.p.z).toBeLessThan(-1.3);expect(s.p.y).toBe(9);expect(s.recoveries).toBe(0);
    steer(s,18,3.5);steer(s,14.65,3.5);steer(s,14.65,-1.3);
    expect(s.nearest).toBe('east');expect(s.p.z).toBeLessThan(-1.2);expect(s.recoveries).toBe(0);
    steer(s,18,-1.3);steer(s,18,-3.8);const sideApproachZ=s.p.z;tick(s,180,{x:-1});
    expect(s.p.x).toBeGreaterThanOrEqual(16.929);expect(s.p.z).toBe(sideApproachZ);expect(s.p.y).toBe(9);expect(s.recoveries).toBe(0);
  },30_000);

  it('blocks the round clock plinth without replacing it with a pass-through decoration',()=>{
    const s=new Simulation(1);greenhouse(s);bell(s);steer(s,0,-18);steer(s,0,-22.35);
    for(let i=0;i<180;i++){
      tick(s,1,{x:-1,forward:clamp((s.p.z+22.35)*3/SPEED)});
      expect(Math.hypot(s.p.x+4.5,s.p.z+22.35)).toBeGreaterThanOrEqual(1.799);
    }
    expect(s.p.x).toBeGreaterThan(-3);expect(s.p.y).toBe(10);expect(s.recoveries).toBe(0);
  },30_000);

  it('uses one air burst per flight, freezes it while paused and recharges after a real landing',()=>{
    const s=new Simulation(1);s.start();steer(s,-2,40.5);tick(s,1,{dash:true});expect(s.events.some(e=>e.type==='air-burst')).toBe(false);expect(s.dashCharge).toBe(1);tick(s);
    tick(s,1,{jump:true});tick(s,1,{x:1,forward:1,dash:true});
    expect(s.dashCharge).toBe(0);expect(s.events.filter(e=>e.type==='air-burst')).toHaveLength(1);expect(Math.hypot(s.v.x,s.v.z)).toBeGreaterThan(10);
    s.pause('audio');const paused={p:{...s.p},v:{...s.v},time:s.elapsed,charge:s.dashCharge,flow:s.flow};tick(s,120,{x:1,forward:1,dash:true});
    expect({p:s.p,v:s.v,time:s.elapsed,charge:s.dashCharge,flow:s.flow}).toEqual(paused);
    s.resume();tick(s);tick(s,1,{dash:true});expect(s.events.filter(e=>e.type==='air-burst')).toHaveLength(1);
    settle(s);expect(s.dashCharge).toBe(1);expect(s.recoveries).toBe(0);
    tick(s,1,{jump:true});tick(s,1,{x:-1,dash:true});expect(s.events.filter(e=>e.type==='air-burst')).toHaveLength(2);
  },30_000);

  it('starts with no pickups and collects the first note only after physically reaching it',()=>{
    const s=new Simulation(1);expect(s.notes.size).toBe(0);tick(s,120);expect(s.notes.size).toBe(0);
    s.start();tick(s,120);expect(s.notes.size).toBe(0);steer(s,0,32);
    expect(s.notes.has(0)).toBe(true);expect(s.notes.size).toBe(1);expect(s.events.filter(e=>e.type==='signal-note'&&e.value==='0')).toHaveLength(1);
    tick(s,120);expect(s.notes.size).toBe(1);expect(s.mode).toBe('play');
  },30_000);
});
