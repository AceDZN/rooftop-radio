import {describe, expect, it} from 'vitest';
import {CONNECTIONS, SITE, contracts, activeBrief, siteName, type SiteId} from '../src/content';
import {beyondGreenhouse, complete, freshEvidence, observe, turn, type RouteEvent} from '../src/rules';

// Expected compass truth is specified independently of production turn math.
const turns = [
  ['north','right','east'], ['east','right','south'],
  ['south','right','west'], ['west','right','north'],
  ['north','left','west'], ['east','left','north'],
  ['south','left','east'], ['west','left','south'],
] as const;
const run=(index:number,events:RouteEvent[])=>events.reduce((s,e)=>observe(contracts()[index],s,e),freshEvidence());

describe('independent English truth fixtures',()=>{
  it('authors one current stage for each ordered radio decision',()=>{
    const jobs=contracts();
    expect(jobs.slice(0,5).map(j=>j.order)).toEqual([['greenhouse'],['greenhouse','bell'],['west'],['west'],['bell','greenhouse','east']]);
    expect(jobs[0].english).toBe('Deliver the signal to the radio next to the greenhouse.');
    expect(activeBrief(jobs[1],0)).toBe('First, tune the greenhouse radio.');
    expect(activeBrief(jobs[1],1)).toBe('Go past the greenhouse. Tune the bell-tower radio.');
    expect(activeBrief(jobs[4],0)).toBe('First, tune the bell-tower radio.');
    expect(activeBrief(jobs[4],1)).toBe('Next, tune the greenhouse radio.');
    expect(activeBrief(jobs[4],2)).toBe('Face the bell tower. Go past the greenhouse, turn right at the bell tower and deliver to the café.');
    expect(activeBrief(jobs[4],3)).toBe(activeBrief(jobs[4],2));
    for(const job of jobs){
      expect(job.stages.length).toBe(job.order.length);
      expect(job.english).not.toMatch(/opposite|receiver|moved/i);
    }
  });
  it.each(turns)('%s then %s means %s irrespective of camera',(heading,side,expected)=>{
    expect(turn(heading,side)).toBe(expected);
  });
  it('distinguishes approaching the greenhouse and its edge from moving beyond it',()=>{
    for(const z of [30,18,11.501,11.5])expect(beyondGreenhouse(z)).toBe(false);
    expect(beyondGreenhouse(11.499)).toBe(true);expect(beyondGreenhouse(0)).toBe(true);
  });
  it('keeps a wrong first radio recoverable and different from the greenhouse destination',()=>{
    const wrong=run(0,[{type:'tune',site:'east'}]);
    expect(wrong.progress).toBe(0);expect(wrong.mistakes).toBe(1);
    expect(wrong.last).toContain('Café');expect(wrong.last).toContain('Deliver the signal to the radio next to the greenhouse.');
    const recovered=observe(contracts()[0],wrong,{type:'tune',site:'greenhouse'});
    expect(complete(contracts()[0],recovered)).toBe(true);
  });
  it('requires first radio, actual passage, then second radio and permits correction',()=>{
    expect(run(1,[{type:'tune',site:'bell'}]).progress).toBe(0);
    const towards=run(1,[{type:'tune',site:'greenhouse'},{type:'tune',site:'bell'}]);
    expect(complete(contracts()[1],towards)).toBe(false);expect(towards.last).toContain('Go past the greenhouse.');
    const corrected=observe(contracts()[1],observe(contracts()[1],towards,{type:'past'}),{type:'tune',site:'bell'});
    expect(complete(contracts()[1],corrected)).toBe(true);
  });
  it('does not bank a passage before the ordered greenhouse tune',()=>{
    const stale=run(1,[{type:'past'},{type:'tune',site:'greenhouse'},{type:'tune',site:'bell'}]);
    expect(complete(contracts()[1],stale)).toBe(false);
  });
  it('requires southbound approach and westward right departure for Radio Station',()=>{
    const wrong=run(2,[{type:'junction',approach:'north'},{type:'depart',direction:'west'},{type:'tune',site:'west'}]);
    expect(complete(contracts()[2],wrong)).toBe(false);
    expect(wrong.last).toContain('Turn right at the bell tower.');
    const right=run(2,[{type:'junction',approach:'south'},{type:'depart',direction:'west'},{type:'tune',site:'west'}]);
    expect(complete(contracts()[2],right)).toBe(true);
  });
  it('rejects an approach with no departure, a left departure or a straight departure',()=>{
    for(const events of [
      [{type:'junction',approach:'south'},{type:'tune',site:'west'}],
      [{type:'junction',approach:'south'},{type:'depart',direction:'east'},{type:'tune',site:'west'}],
      [{type:'junction',approach:'south'},{type:'depart',direction:'south'},{type:'tune',site:'west'}],
    ] as RouteEvent[][])expect(complete(contracts()[2],run(2,events))).toBe(false);
  });
  it('requires the completed wider striped crossing and an intact parcel',()=>{
    const direct=run(3,[{type:'tune',site:'west'}]);
    expect(complete(contracts()[3],direct)).toBe(false);expect(direct.last).toContain('Take the wider striped bridge.');
    expect(complete(contracts()[3],run(3,[{type:'wide'},{type:'tune',site:'west'}]))).toBe(true);
    expect(complete(contracts()[3],run(3,[{type:'damage'},{type:'wide'},{type:'tune',site:'west'}]))).toBe(false);
  });
  it('keeps landmark identities fixed while transferring order and approach',()=>{
    const transfer=contracts()[4];
    expect(transfer.start).toBe('water');expect(transfer.facing).toBe('north');
    expect(contracts()[2].facing).toBe('south');expect(transfer.order).toEqual(['bell','greenhouse','east']);
    expect(siteName('west',false)).toBe('Radio Station');expect(siteName('west',true)).toBe('Radio Station');
    expect(siteName('east',false)).toBe('Café');expect(siteName('east',true)).toBe('Café');
    expect(transfer.hint).toBeNull();expect(transfer.vocabulary.length).toBeGreaterThan(0);
    const previousDestination=run(4,[{type:'tune',site:'bell'},{type:'tune',site:'greenhouse'},{type:'past'},{type:'junction',approach:'north'},{type:'depart',direction:'east'},{type:'tune',site:'west'}]);
    expect(complete(transfer,previousDestination)).toBe(false);
    expect(complete(transfer,observe(transfer,previousDestination,{type:'tune',site:'east'}))).toBe(true);
  });
  it('requires fresh passage after returning to the greenhouse in transfer',()=>{
    const stale=run(4,[{type:'past'},{type:'junction',approach:'north'},{type:'tune',site:'bell'},{type:'tune',site:'greenhouse'},{type:'tune',site:'east'}]);
    expect(complete(contracts()[4],stale)).toBe(false);
  });
});

// Hand-authored roof traces do not derive expected adjacency or coordinates from helpers.
const edgeFor=(a:SiteId,b:SiteId)=>CONNECTIONS.find(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a));
const length=(path:SiteId[])=>path.slice(1).reduce((sum,b,i)=>sum+Math.hypot(SITE[b].x-SITE[path[i]].x,SITE[b].z-SITE[path[i]].z),0);
describe('independent authored geometry oracle',()=>{
  it.each([
    ['water','greenhouse'],['water','antenna','laundry','greenhouse'],
    ['bell','greenhouse','laundry','west'],['clock','mural','west'],
  ] as SiteId[][])('supports route %j through reachable roof connections',(...path)=>{
    path.slice(1).forEach((b,i)=>{
      const a=path[i];expect(edgeFor(a,b)).toBeDefined();
      const dx=Math.max(0,Math.abs(SITE[a].x-SITE[b].x)-(SITE[a].w+SITE[b].w)/2);
      const dz=Math.max(0,Math.abs(SITE[a].z-SITE[b].z)-(SITE[a].d+SITE[b].d)/2);
      expect(Math.hypot(dx,dz)).toBeLessThanOrEqual(5);
      expect(Math.abs(SITE[a].y-SITE[b].y)).toBeLessThanOrEqual(1);
    });
  });
  it('keeps the exploration loop separate from the two direct parcel crossings',()=>{
    expect(length(['bell','west'])).toBe(18);
    expect(length(['bell','greenhouse','laundry','west'])).toBe(54);
    const parcel=contracts()[3];expect(parcel.start).toBe('bell');expect(parcel.facing).toBe('west');expect(parcel.order).toEqual(['west']);
    expect(activeBrief(parcel,0)).toContain('Of the two crossings to Radio Station');
    expect(activeBrief(parcel,0)).toContain('wider striped bridge');
    expect(activeBrief(parcel,0)).not.toMatch(/laundry|awning/i);
  });
  it('makes the greenhouse-to-bell connection a real parkour gap',()=>{
    expect(edgeFor('greenhouse','bell')?.kind).toBe('gap');
  });
  it('keeps named landmarks at fixed coordinates across every job',()=>{
    expect(SITE.east.x).toBe(18);expect(SITE.west.x).toBe(-18);
    expect(SITE.east.z).toBe(0);expect(SITE.west.z).toBe(0);
    expect(SITE.clock.z).toBe(-18);expect(SITE.water.z).toBe(36);
    for(const id of Object.keys(SITE) as SiteId[])expect(siteName(id,true)).toBe(siteName(id,false));
  });
});
