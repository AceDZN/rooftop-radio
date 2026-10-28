import {describe,expect,it} from 'vitest';
import {CAMPAIGN_LENGTH,DISTRICTS,contracts,districtSiteName,stageRequirement,type Heading,type SiteId} from '../src/content';
import {complete,freshEvidence,observe,type RouteEvent} from '../src/rules';

// Independent editorial oracle. W=water G=greenhouse B=bell C=clock R=west E=east
// L=laundry A=antenna M=mural. Stage: target/action/ordered-proof/forbidden/cargo.
// Actions d=deliver c=collect i=inspect t=tune. Proof p=pass greenhouse;
// nr/sl/etc=approach compass initial + turn side; ww/we/bw/be=wide/beam west/east.
// These fifty rows are deliberately authored separately from the production factories.
const fixtures=[
'W/n G/d/-/-/-',
'W/n G/t/-/-/- B/t/p/-/-',
'C/s R/d/sr/-/-',
'B/w R/d/ww/-/f',
'W/n B/t/-/-/- G/t/-/-/- E/d/p,nr/-/-',
'C/s E/t/sl/-/- G/t/wl/-/- R/d/nl/-/-',
'B/s G/c/-/-/- W/t/A/B/- B/d/G,p/-/-',
'W/w L/i/A/-/- C/i/M/G/- E/i/sl/R/-',
'W/n B/c/G,p/-/- R/d/ww/-/f C/i/M/-/- W/t/A/G/-',
'B/e E/c/-/-/- M/t/C/G/- G/t/L/C/- B/d/p/-/-',
'W/w A/t/-/G/- L/i/-/-/- B/t/G,p/-/- E/d/C,sl/-/-',
'C/w M/c/-/B/- R/t/C,sr,ww/-/- G/t/L/B/- W/d/A/B/-',
'E/w C/i/wr/-/- M/i/-/B/- L/i/R/G/- B/i/G,p/R/-',
'C/w B/c/M,we/-/- R/t/ww/-/f E/d/we/-/f C/i/wr/-/-',
'W/n G/c/-/-/- C/i/p,B/-/- E/t/sl/-/- W/d/bw,L,A/G/-',
'M/e C/i/-/B/- R/t/sr,bw/-/- L/t/A/G/- G/i/-/W/- B/d/p/-/-',
'C/s R/c/sr,ww/-/- A/t/L/G/- W/i/-/G/- G/i/-/B/- E/d/p,nr/-/-',
'E/w G/i/wl/-/- L/i/-/W/- M/i/R/B/- C/i/-/B/- B/i/G,p/R/-',
'A/e W/c/-/G/- G/t/L/B/f B/t/p/-/f R/t/ww/-/f E/d/we/-/f',
'E/w B/c/-/G/- C/i/E,wr/-/- M/i/-/B/- L/t/R/G/- E/d/G,p,nr/C/-',
'W/w A/t/-/G/- L/i/-/W/- R/t/M/G/- C/t/be,el/-/- E/d/sl/G/-',
'C/w M/c/-/B/- R/t/C,sr,ww/-/- L/i/-/G/- G/t/A,W/B/- B/d/p/R/-',
'B/w R/i/bw/G/- M/i/-/L/- C/i/-/B/- G/i/R,be,er/E/- E/i/p,nr/C/-',
'E/w B/c/G,p/-/- R/t/ww/M/f C/t/we,el/-/f M/i/-/B/f R/d/-/BL/f',
'W/n E/c/G,p,nr/-/- C/i/wr/G/- M/i/-/BR/- L/t/R/G/- W/d/A/G/-',
'C/s R/t/sr,bw/-/- L/i/-/GM/- A/i/-/W/- W/t/-/G/- G/t/L/B/- E/d/p,nr/-/-',
'E/w G/c/wl/-/- L/i/-/W/- M/t/R/B/- C/i/-/B/- R/t/sr,ww/-/- E/d/be/G/-',
'W/w A/i/-/G/- L/i/-/W/- R/i/M/B/- M/i/-/CL/- C/i/-/B/- B/i/G,p/R/-',
'M/e C/c/-/B/- B/t/G,p/-/f R/t/ww/M/f G/t/L/B/f E/t/p,nr/-/f W/d/A/G/f',
'B/w R/c/bw/-/- M/i/-/LB/- C/i/-/B/- E/t/sl/G/- G/t/wl/R/- B/d/W,G,p/-/-',
'W/w G/i/A,L/B/- E/t/p,nr/C/- C/i/wr/R/- M/i/-/BR/- R/t/L/C/- L/d/A/G/-',
'C/s R/c/sr,ww/-/- A/t/L/MG/- W/i/-/GL/- G/i/L/B/- B/i/p/R/- C/d/M/G/-',
'E/w B/i/G,p/R/- M/i/bw/C/- R/i/-/CL/- L/i/A/G/- G/i/W/B/- W/i/A/B/-',
'A/e W/c/G/B/- G/t/L/B/f B/t/p/R/f R/t/ww/M/f M/i/-/BL/f C/d/R,we,el/-/f',
'M/s C/c/R/B/- E/i/sl/G/- G/t/wl/R/- L/i/A/W/- A/t/W/G/- M/d/R/GC/-',
'W/n A/t/G,L/B/- L/i/R/G/- G/i/W/B/- B/t/p/R/- E/i/C,sl/-/- C/t/wr/G/- R/d/M,sr,bw/-/-',
'C/w M/c/-/BR/- R/t/C,sr,ww/-/- L/i/A/G/- A/i/W/G/- W/t/L/G/- G/i/L/B/- E/d/p,nr/C/-',
'E/w G/i/wl/R/- W/i/A/B/- A/i/L/G/- L/i/R/G/- R/i/we,er,G,p,nl,ww/-/- M/i/-/BC/- C/i/R,be,el/L/-',
'M/s C/c/R/B/- B/t/G,p/-/f R/t/ww/M/f L/t/M/B/f G/t/A,W/B/f E/t/p,nr/-/f W/d/ww,A/G/f',
'B/n R/c/C,sr,ww/-/- M/i/-/BL/- C/i/R/B/- E/t/sl/G/- G/i/wl/R/- W/t/A/B/- B/d/A,L,G,p/-/-',
'W/w G/i/A,L/B/- L/t/W,A/B/- A/i/R/GM/- M/t/L,R/GB/- C/i/R,we,el/-/- R/t/M,sr,ww/-/- E/d/be,er,G,p,nr/-/-',
'C/w R/c/M,C,sr,ww/-/- L/i/-/GC/- G/t/A,W/B/- W/i/A/B/- A/i/L/G/- M/t/R/GC/- C/d/R,be,el/L/-',
'E/w B/i/G,p/R/- C/i/E,wr/G/- M/i/R/B/- R/i/C,sr,bw/-/- L/i/A/G/- G/i/W,A,L/B/- W/i/L,A/B/-',
'A/e W/c/G/B/- G/t/L/B/f B/t/W,G,p/-/f R/t/C,sr,ww/-/f M/i/L/B/f C/t/R,we,el/-/f E/d/sl/GR/f',
'M/s C/c/R/B/- E/i/M,sl/G/- B/t/G,p/R/- G/t/R,be,er/E/- W/t/L,A/B/- A/i/L/G/- M/d/R/GC/-',
'W/n A/t/G,L/B/- L/i/R/G/- R/t/M,C,sr,ww/-/- B/t/M,be/G/- C/i/R,be,el/-/- E/t/G,p,nr/R/- G/d/C,sr,ww,L/W/-',
'C/w M/c/R/B/- R/t/C,sr,ww/-/- A/i/L,W,L/G/- W/t/L,A/G/- G/i/L/B/- B/t/W,G,p/R/- E/d/C,sl/G/-',
'E/w G/i/C,sr,bw,L/W/- L/i/A,W,A/B/- R/i/M,C,sr,ww/-/- M/i/L/BC/- C/i/R,we,el/L/- B/i/G,W,G,p/R/- W/i/ww,L,A/EC/-',
'M/s C/c/R/B/- B/t/G,p/R/f R/t/C,sr,ww/-/f G/t/L,A,W/B/f E/t/p,nr/C/f W/t/ww,L,A/G/f M/d/A,L,R/GC/f',
'B/s E/c/G,p,nr/-/- C/i/wr,M/G/- M/i/R,we,el,C/-/- R/t/C,sr,ww/G/- L/i/A,W,A/G/- G/t/W,A,L/B/- B/d/W,A,L,G,p/RC/-',
];
const sites:Record<string,SiteId>={W:'water',G:'greenhouse',B:'bell',C:'clock',R:'west',E:'east',L:'laundry',A:'antenna',M:'mural'};
const headings:Record<string,Heading>={n:'north',e:'east',s:'south',w:'west'};
const actions={t:'tune',d:'deliver',c:'collect',i:'inspect'} as const;
const split=(s:string)=>s==='-'?[]:s.split(',');
const oracle=fixtures.map((row,index)=>{
  const [pose,...legs]=row.split(' '),[start,facing]=pose.split('/');
  return {id:index+1,start:sites[start],facing:headings[facing],legs:legs.map(leg=>{
    const [target,action,route,avoid,fragile]=leg.split('/');
    return {site:sites[target],action:actions[action as keyof typeof actions],route:split(route),avoid:avoid==='-'?[]:[...avoid].map(id=>sites[id]),fragile:fragile==='f'};
  })};
});
const departures:Record<string,Heading>={nr:'east',nl:'west',sr:'west',sl:'east',er:'south',el:'north',wr:'north',wl:'south'};
const events=(token:string):RouteEvent[]=>{
  if(sites[token])return [{type:'visit',site:sites[token]}];
  if(token==='p')return [{type:'past'}];
  if(departures[token])return [{type:'junction',approach:headings[token[0]]},{type:'depart',direction:departures[token]}];
  return [{type:'crossing',bridge:token[0]==='w'?'wide':'beam',direction:token[1]==='w'?'west':'east'}];
};
const all=contracts();
const normalize=(token:NonNullable<ReturnType<typeof stageRequirement>['route']>[number])=>{
 if(token.kind==='visit')return Object.keys(sites).find(key=>sites[key]===token.site)!;
 if(token.kind==='past')return 'p';
 if(token.kind==='turn')return token.approach[0]+token.side[0];
 return token.bridge[0]+token.direction[0];
};

describe('independent fifty-level authored campaign oracle',()=>{
 it('contains exactly fifty numbered contracts in five districts without grade gates',()=>{
  expect(CAMPAIGN_LENGTH).toBe(50);expect(all.map(j=>j.id)).toEqual(Array.from({length:50},(_,i)=>i+1));
  expect(DISTRICTS.map(d=>d.id)).toEqual(['old-town','canals','market','gardens','observatory']);
  DISTRICTS.forEach((district,i)=>{
   expect(all.slice(i*10,i*10+10).every(j=>j.district===district.id)).toBe(true);
   expect(new Set(Object.values(district.siteNames)).size).toBe(9);
   Object.values(sites).forEach(site=>expect(districtSiteName(site,district.id)).toBe(district.siteNames[site]));
  });
  expect(all.every(j=>!('grade' in j)&&!('minGrade' in j))).toBe(true);
 });
 it.each(oracle)('level $id matches an independent itinerary and per-leg constraints',fixture=>{
  const job=all[fixture.id-1];expect(job.start).toBe(fixture.start);expect(job.facing).toBe(fixture.facing);
  expect(job.order).toEqual(fixture.legs.map(leg=>leg.site));
  fixture.legs.forEach((leg,index)=>{
   const requirement=stageRequirement(job,index);
   expect(requirement.action).toBe(leg.action);expect(requirement.fragile).toBe(leg.fragile);
   expect(requirement.avoid??[]).toEqual(leg.avoid);
   expect((requirement.route??[]).map(normalize)).toEqual(leg.route);
  });
 });
 it.each(oracle)('level $id accepts the separately authored semantic proof',fixture=>{
  const job=all[fixture.id-1];let evidence=freshEvidence(job);
  fixture.legs.forEach((leg,index)=>{
   for(const token of leg.route)for(const event of events(token))evidence=observe(job,evidence,event);
   evidence=observe(job,evidence,{type:'visit',site:leg.site});
   evidence=observe(job,evidence,{type:'tune',site:leg.site});
   expect(evidence.progress,`level ${fixture.id}, leg ${index+1}: ${evidence.last}`).toBe(index+1);
  });
  expect(evidence.mistakes).toBe(0);expect(complete(job,evidence)).toBe(true);
 });
 it('sustains route demand at district boundaries and uses distinct task structures',()=>{
  const minimum=(id:number)=>id<=5?1:id<=8?3:id<=15?4:id<=25?5:id<=35?6:7;
  for(const job of all){expect(job.order.length).toBeGreaterThanOrEqual(minimum(job.id));expect(job.order.length).toBeLessThanOrEqual(7);expect(job.stages.length).toBe(job.order.length);}
  expect(new Set(all.map(j=>JSON.stringify([j.start,j.order,j.requirements]))).size).toBe(50);
  expect(new Set(all.map(j=>j.task))).toEqual(new Set(['signal','parcel','inspection','collection','return']));
  for(const job of all.filter(j=>j.task==='return')){expect(job.order.at(-1)).toBe(job.start);expect(job.requirements?.[0].action).toBe('collect');expect(job.requirements?.at(-1)?.action).toBe('deliver');}
  for(const job of all.filter(j=>j.task==='parcel'&&j.id!==4)){expect(job.requirements?.[0].action).toBe('collect');expect(job.requirements?.[0].fragile).toBe(false);expect(job.requirements?.some(r=>r.fragile)).toBe(true);}
 });
 it('states every forbidden roof and every turn approach in the active English',()=>{
  for(const fixture of oracle.slice(5)){
   const job=all[fixture.id-1];
   fixture.legs.forEach((leg,index)=>{
    const text=job.stages[index].toLowerCase();
    for(const forbidden of leg.avoid)expect(text,`L${job.id}.${index+1}: unstated forbidden roof`).toContain(districtSiteName(forbidden,job.district!).toLowerCase());
    for(const token of leg.route.filter(token=>departures[token]))expect(text,`L${job.id}.${index+1}: unstated approach`).toContain(`from ${districtSiteName(approach[token[0]],job.district!).toLowerCase()}`);
   });
  }
 });
 it('rejects every missing mandatory proof in the independent oracle',()=>{
  for(const fixture of oracle){
   const job=all[fixture.id-1];let prior=freshEvidence(job);
   fixture.legs.forEach((leg,index)=>{
    for(let omitted=0;omitted<leg.route.length;omitted++){
     // A destination landing can itself satisfy a visit to that same destination.
     if(sites[leg.route[omitted]]===leg.site)continue;
     let attempt=prior;
     leg.route.forEach((token,tokenIndex)=>{if(tokenIndex!==omitted)for(const event of events(token))attempt=observe(job,attempt,event);});
     attempt=observe(job,attempt,{type:'visit',site:leg.site});attempt=observe(job,attempt,{type:'tune',site:leg.site});
     expect(attempt.progress,`L${job.id}.${index+1}: omitted ${leg.route[omitted]}`).toBe(index);
    }
    for(const token of leg.route)for(const event of events(token))prior=observe(job,prior,event);
    prior=observe(job,prior,{type:'visit',site:leg.site});prior=observe(job,prior,{type:'tune',site:leg.site});
   });
  }
 });
 it('uses advanced relationships with physical consequences in every final-band job',()=>{
  for(const job of all.slice(40))expect(job.english).toMatch(/\b(?:before|after|until|that has|which has|if|without)\b/i);
  expect(all[43].english).toContain('If you damage the glass parcel');
  expect(all[48].english).toContain('If you damage the glass parcel');
  expect(stageRequirement(all[43],3).fragile).toBe(true);expect(stageRequirement(all[48],2).fragile).toBe(true);
  expect(all[49].stages[6]).toContain('in that order');
 });
});

// A separate roof graph verifies route existence, not jump timing or collision handling.
const graph:Record<SiteId,SiteId[]>={water:['greenhouse','antenna'],greenhouse:['water','bell','laundry'],bell:['greenhouse','clock','west','east'],clock:['bell','mural'],west:['bell','laundry','mural'],east:['bell'],laundry:['greenhouse','west','antenna'],antenna:['water','laundry'],mural:['clock','west']};
const approach:Record<string,SiteId>={n:'greenhouse',s:'clock',e:'west',w:'east'};
const exit:Record<Heading,SiteId>={north:'clock',south:'greenhouse',west:'west',east:'east'};
function connected(from:SiteId,to:SiteId,forbidden:SiteId[]){
 const pending=[from],seen=new Set<SiteId>();
 while(pending.length){const node=pending.shift()!;if(node===to)return !forbidden.includes(to);if(seen.has(node))continue;seen.add(node);for(const next of graph[node])if(!forbidden.includes(next)&&!seen.has(next))pending.push(next);}
 return false;
}
describe('independent topological reachability of every required leg',()=>{
 it.each(oracle)('level $id has a legal physical roof route for each stage',fixture=>{
  let current=fixture.start;
  fixture.legs.forEach((leg,index)=>{
   const move=(to:SiteId)=>{expect(connected(current,to,leg.avoid),`L${fixture.id}.${index+1}: ${current} → ${to}, avoid ${leg.avoid}`).toBe(true);current=to;};
   for(const token of leg.route){
    if(sites[token])move(sites[token]);
    else if(token==='p'){move('greenhouse');move('bell');}
    else if(departures[token]){move(approach[token[0]]);move('bell');move(exit[departures[token]]);}
    else{move(token[1]==='w'?'bell':'west');move(token[1]==='w'?'west':'bell');}
   }
   move(leg.site);
  });
 });
});

describe('stage-local counterexamples',()=>{
 it('requires new proof after every accepted intermediate action',()=>{
  const job=all[13];let e=freshEvidence(job);
  for(const event of [...events('M'),...events('we'),{type:'tune',site:'bell'}] as RouteEvent[])e=observe(job,e,event);
  expect(e.progress).toBe(1);expect(e.routeIndex).toBe(0);
  e=observe(job,e,{type:'tune',site:'west'});expect(e.progress).toBe(1);
  e=observe(job,e,{type:'crossing',bridge:'wide',direction:'east'});e=observe(job,e,{type:'tune',site:'west'});expect(e.progress).toBe(1);
  e=observe(job,e,{type:'crossing',bridge:'beam',direction:'west'});e=observe(job,e,{type:'tune',site:'west'});expect(e.progress).toBe(1);
  e=observe(job,e,{type:'crossing',bridge:'wide',direction:'west'});e=observe(job,e,{type:'tune',site:'west'});expect(e.progress).toBe(2);
 });
 it('rejects a forbidden landing until the player actually returns to the leg origin',()=>{
  const job=all[11];let e=freshEvidence(job);expect(e.stageOrigin).toBe('clock');
  e=observe(job,e,{type:'visit',site:'bell'});expect(e.violated).toEqual(['bell']);
  e=observe(job,e,{type:'tune',site:'mural'});expect(e.progress).toBe(0);
  e=observe(job,e,{type:'recover',at:'mural'});expect(e.violated).toEqual(['bell']);
  e=observe(job,e,{type:'visit',site:'clock'});expect(e.violated).toEqual([]);
  e=observe(job,e,{type:'tune',site:'mural'});expect(e.progress).toBe(1);
  expect(e.stageOrigin).toBe('mural');
 });
 it('does not accept ordered visits in the reverse order, or a flyby inspection',()=>{
  const job=all[30];let e=freshEvidence(job);
  for(const event of [...events('L'),...events('A'),{type:'tune',site:'greenhouse'}] as RouteEvent[])e=observe(job,e,event);
  expect(e.progress).toBe(0);expect(e.routeIndex).toBe(1);
  e=observe(job,e,{type:'visit',site:'laundry'});e=observe(job,e,{type:'tune',site:'greenhouse'});expect(e.progress).toBe(0);expect(e.last).toContain('Land at Palm house');
  e=observe(job,e,{type:'visit',site:'greenhouse'});e=observe(job,e,{type:'tune',site:'greenhouse'});expect(e.progress).toBe(1);
 });
 it('requires repeated return visits after intervening roofs, not a cached visited set',()=>{
  const job=all[46];let e=freshEvidence(job);
  const firstTwo=['R','M','C','sr','ww'];
  for(const token of firstTwo.slice(0,1))for(const event of events(token))e=observe(job,e,event);
  e=observe(job,e,{type:'tune',site:'mural'});
  for(const token of firstTwo.slice(2))for(const event of events(token))e=observe(job,e,event);
  e=observe(job,e,{type:'tune',site:'west'});expect(e.progress).toBe(2);
  for(const token of ['L','W'])for(const event of events(token))e=observe(job,e,event);
  e=observe(job,e,{type:'visit',site:'antenna'});e=observe(job,e,{type:'tune',site:'antenna'});expect(e.progress).toBe(2);
  e=observe(job,e,{type:'visit',site:'laundry'});e=observe(job,e,{type:'visit',site:'antenna'});e=observe(job,e,{type:'tune',site:'antenna'});expect(e.progress).toBe(3);
 });
 it('does not apply cargo damage to a non-cargo leg',()=>{
  const job=all[5];let e=freshEvidence(job);
  e=observe(job,e,{type:'damage'});expect(e.damaged).toBe(false);
  for(const event of events('sl'))e=observe(job,e,event);
  e=observe(job,e,{type:'tune',site:'east'});expect(e.progress).toBe(1);
 });
 it('damaged cargo cannot complete even with old bridge proof; repair requires a fresh crossing',()=>{
  const job=all[3];let e=freshEvidence(job);
  e=observe(job,e,{type:'crossing',bridge:'wide',direction:'west'});e=observe(job,e,{type:'damage'});
  e=observe(job,e,{type:'tune',site:'west'});expect(e.progress).toBe(0);
  e=observe(job,e,{type:'recover',at:'west'});expect(e.damaged).toBe(true);
  e=observe(job,e,{type:'crossing',bridge:'wide',direction:'west'});e=observe(job,e,{type:'tune',site:'west'});expect(e.progress).toBe(0);
  e=observe(job,e,{type:'recover',at:'bell'});e=observe(job,e,{type:'tune',site:'west'});expect(e.progress).toBe(0);
  e=observe(job,e,{type:'crossing',bridge:'wide',direction:'west'});e=observe(job,e,{type:'tune',site:'west'});expect(complete(job,e)).toBe(true);
 });
});
