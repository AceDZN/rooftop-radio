import {describe,it,expect} from 'vitest';
import {contracts} from '../src/content';
import {freshEvidence,observe,complete,turn,beyondGreenhouse} from '../src/rules';
describe('contract evidence',()=>{
  it('requires ordered relay transmission and supports correction',()=>{
    const job=contracts()[1];let e=freshEvidence();
    e=observe(job,e,{type:'tune',site:'bell'});expect(e.progress).toBe(0);
    e=observe(job,e,{type:'tune',site:'greenhouse'});
    e=observe(job,e,{type:'past'});e=observe(job,e,{type:'tune',site:'bell'});
    expect(complete(job,e)).toBe(true);expect(e.mistakes).toBe(1);
  });
  it('keeps a near-side approach distinct from past',()=>{expect(beyondGreenhouse(11.51)).toBe(false);expect(beyondGreenhouse(11.49)).toBe(true);});
  it('right from reversed approaches changes the compass direction',()=>{expect(turn('north','right')).toBe('east');expect(turn('south','right')).toBe('west');});
  it('new-context transfer requires a new order and a right turn towards the static café',()=>{
    const job=contracts()[4];let e=freshEvidence();
    e=observe(job,e,{type:'tune',site:'greenhouse'});expect(e.progress).toBe(0);
    for(const event of [{type:'tune',site:'bell'},{type:'tune',site:'greenhouse'},{type:'past'},{type:'junction',approach:'north'},{type:'depart',direction:'east'},{type:'tune',site:'east'}] as const)e=observe(job,e,event);
    expect(complete(job,e)).toBe(true);
  });
});
