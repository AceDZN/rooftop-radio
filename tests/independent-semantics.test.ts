import {describe, expect, it} from 'vitest';
import {CONNECTIONS, SITE, contracts, siteName, type SiteId} from '../src/content';
import {beyondGreenhouse, complete, freshEvidence, observe, turn, type RouteEvent} from '../src/rules';

// The expected compass table is specified here independently of production math.
const turns = [
  ['north','right','east'], ['east','right','south'],
  ['south','right','west'], ['west','right','north'],
  ['north','left','west'], ['east','left','north'],
  ['south','left','east'], ['west','left','south'],
] as const;
const run = (index:number, events:RouteEvent[]) => events.reduce((s,e)=>observe(contracts()[index],s,e),freshEvidence());

describe('independent English truth fixtures',()=>{
  it.each(turns)('%s then %s means %s irrespective of camera', (heading,side,expected)=>{
    expect(turn(heading,side)).toBe(expected);
  });
  it('treats approaching and reaching the greenhouse edge as distinct from beyond it',()=>{
    expect(beyondGreenhouse(30)).toBe(false);
    expect(beyondGreenhouse(18)).toBe(false);
    expect(beyondGreenhouse(11.501)).toBe(false);
    expect(beyondGreenhouse(11.5)).toBe(false);
    expect(beyondGreenhouse(11.499)).toBe(true);
    expect(beyondGreenhouse(0)).toBe(true);
  });
  it('keeps an unrelated first receiver recoverable and distinct from the greenhouse destination',()=>{
    const wrong=run(0,[{type:'tune',site:'east'}]);
    expect(wrong.progress).toBe(0);
    expect(wrong.mistakes).toBe(1);
    const recovered=observe(contracts()[0],wrong,{type:'tune',site:'greenhouse'});
    expect(complete(contracts()[0],recovered)).toBe(true);
  });
  it('requires first relay, actual passage, then second relay',()=>{
    const wrongOrder=run(1,[{type:'tune',site:'bell'}]);
    expect(wrongOrder.progress).toBe(0);
    const towardsOnly=run(1,[{type:'tune',site:'greenhouse'},{type:'tune',site:'bell'}]);
    expect(complete(contracts()[1],towardsOnly)).toBe(false);
    const recovered=observe(contracts()[1],observe(contracts()[1],towardsOnly,{type:'past'}),{type:'tune',site:'bell'});
    expect(complete(contracts()[1],recovered)).toBe(true);
  });
  it('does not bank a past event before the ordered greenhouse instruction',()=>{
    const stale=run(1,[{type:'past'},{type:'tune',site:'greenhouse'},{type:'tune',site:'bell'}]);
    expect(complete(contracts()[1],stale)).toBe(false);
  });
  it('requires a southbound junction approach in contract three',()=>{
    const wrongHeading=run(2,[{type:'junction',approach:'north'},{type:'depart',direction:'west'},{type:'tune',site:'west'}]);
    expect(complete(contracts()[2],wrongHeading)).toBe(false);
    const rightHeading=run(2,[{type:'junction',approach:'south'},{type:'depart',direction:'west'},{type:'tune',site:'west'}]);
    expect(complete(contracts()[2],rightHeading)).toBe(true);
  });
  it('rejects an approach without a departure, a left departure and a straight departure',()=>{
    for (const events of [
      [{type:'junction',approach:'south'},{type:'tune',site:'west'}],
      [{type:'junction',approach:'south'},{type:'depart',direction:'east'},{type:'tune',site:'west'}],
      [{type:'junction',approach:'south'},{type:'depart',direction:'south'},{type:'tune',site:'west'}],
    ] as RouteEvent[][]) expect(complete(contracts()[2],run(2,events))).toBe(false);
  });
  it('keeps a narrow direct delivery distinct from a wide-path parcel delivery',()=>{
    const narrow=run(3,[{type:'tune',site:'west'}]);
    expect(complete(contracts()[3],narrow)).toBe(false);
    const wide=run(3,[{type:'wide'},{type:'tune',site:'west'}]);
    expect(complete(contracts()[3],wide)).toBe(true);
    const damaged=run(3,[{type:'damage'},{type:'wide'},{type:'tune',site:'west'}]);
    expect(complete(contracts()[3],damaged)).toBe(false);
  });
  it('changes the physical transfer receiver and retains an explicit new order',()=>{
    const transfer=contracts()[4];
    expect(transfer.start).toBe('water');
    expect(transfer.facing).toBe('north');
    expect(transfer.order).toEqual(['bell','greenhouse','east']);
    expect(siteName('west',true)).toBe('Café');
    expect(siteName('east',true)).toBe('Receiver');
    expect(transfer.hint).toBeNull();
    expect(transfer.vocabulary.length).toBeGreaterThan(0);
    const memorizedOldReceiver=run(4,[{type:'tune',site:'bell'},{type:'tune',site:'greenhouse'},{type:'past'},{type:'junction',approach:'north'},{type:'depart',direction:'east'},{type:'tune',site:'west'}]);
    expect(complete(transfer,memorizedOldReceiver)).toBe(false);
    const corrected=observe(transfer,memorizedOldReceiver,{type:'tune',site:'east'});
    expect(complete(transfer,corrected)).toBe(true);
  });
  it('requires fresh passage after returning to the greenhouse in transfer',()=>{
    const stale=run(4,[{type:'past'},{type:'junction',approach:'north'},{type:'tune',site:'bell'},{type:'tune',site:'greenhouse'},{type:'tune',site:'east'}]);
    expect(complete(contracts()[4],stale)).toBe(false);
  });
});

// These path traces are hand-authored route oracles, not generated from production adjacency.
const edgeFor=(a:SiteId,b:SiteId)=>CONNECTIONS.find(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a));
const length=(path:SiteId[])=>path.slice(1).reduce((sum,b,i)=>sum+Math.hypot(SITE[b].x-SITE[path[i]].x,SITE[b].z-SITE[path[i]].z),0);
describe('independent authored geometry oracle',()=>{
  it.each([
    ['water','greenhouse'],
    ['water','antenna','laundry','greenhouse'],
    ['bell','greenhouse','laundry','west'],
    ['clock','mural','west'],
  ] as SiteId[][])('supports route %j with reachable roof connections',(...path)=>{
    path.slice(1).forEach((b,i)=>{
      const a=path[i];
      expect(edgeFor(a,b)).toBeDefined();
      const dx=Math.max(0,Math.abs(SITE[a].x-SITE[b].x)-(SITE[a].w+SITE[b].w)/2);
      const dz=Math.max(0,Math.abs(SITE[a].z-SITE[b].z)-(SITE[a].d+SITE[b].d)/2);
      expect(Math.hypot(dx,dz)).toBeLessThanOrEqual(5);
      expect(Math.abs(SITE[a].y-SITE[b].y)).toBeLessThanOrEqual(1);
    });
  });
  it('makes the awning path wider and longer than the named direct crossing',()=>{
    const direct=edgeFor('bell','west')!;
    expect(direct.kind).toBe('narrow');
    expect(direct.width).toBe(1.15);
    const widePath:SiteId[]=['bell','greenhouse','laundry','west'];
    widePath.slice(1).forEach((b,i)=>expect(edgeFor(widePath[i],b)!.width).toBeGreaterThanOrEqual(3.4));
    expect(length(['bell','west'])).toBe(18);
    expect(length(widePath)).toBe(54);
  });
  it('places the regular café and receiver opposite one another across the bell junction',()=>{
    expect(SITE.east.x).toBe(18);
    expect(SITE.west.x).toBe(-18);
    expect(SITE.east.z).toBe(0);
    expect(SITE.west.z).toBe(0);
    expect(SITE.clock.z).toBe(-18);
    expect(SITE.water.z).toBe(36);
  });
});
