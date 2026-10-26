import {it,expect} from 'vitest';
import {Simulation} from '../src/sim';

it('a missed first gap hits the greenhouse façade and recovers instead of entering the building',()=>{
  const s=new Simulation(0);s.start();let belowRoof=false;
  for(let i=0;i<400;i++){
    s.update(1/60,{x:0,forward:1,jump:false,glide:false,interact:false,yaw:0});
    if(s.p.y<8.7){
      belowRoof=true;
      // Independent authored greenhouse footprint: x ±6.5, z 11.5..24.5.
      expect(Math.abs(s.p.x)>=6.5||s.p.z<=11.5||s.p.z>=24.5).toBe(true);
    }
  }
  expect(belowRoof).toBe(true);expect(s.recoveries).toBeGreaterThan(0);
  expect(s.evidence.progress).toBe(0);
});
