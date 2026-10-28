import {describe,it,expect} from 'vitest';
import {Simulation,type Input} from '../src/sim';
import {contracts} from '../src/content';
// @ts-expect-error the shared browser driver intentionally stays executable JS
import {CampaignDriver,planContract} from '../scripts/campaign-driver.mjs';
describe('all50 authored deliveries are physically solvable through movement inputs',()=>{
  it.each(contracts())('completes level$id $title in $district',async job=>{
    const sim=new Simulation(0);expect(sim.selectLevel(job.id-1)).toBe(true);sim.start();
    const snapshot=()=>({mode:sim.mode,job:{number:sim.level+1,district:sim.district},player:{position:{...sim.p},velocity:{...sim.v},facingYaw:sim.yaw,grounded:sim.onGround},route:{tuned:sim.evidence.progress},feedback:sim.toast});
    const adapter={read:snapshot,tick:(input:Partial<Input>,frames:number)=>{for(let i=0;i<frames;i++)sim.update(1/60,{x:0,forward:0,jump:false,glide:false,interact:false,yaw:sim.yaw,...input});return snapshot();}};
    const driver=new CampaignDriver(adapter);const final=await driver.complete(job);
    expect(planContract(job)).toHaveLength(job.order.length);expect(final.mode).toBe('success');expect(sim.events.some(e=>e.type==='complete'&&e.job===job.id)).toBe(true);expect(sim.evidence.mistakes).toBe(0);expect(sim.recoveries).toBe(0);
  },60_000);
});
