import {it,expect} from 'vitest';
import {Simulation,SPEED,type Input} from '../src/sim';
const free:Input={x:0,forward:0,jump:false,glide:false,interact:false,yaw:0};
const tick=(s:Simulation,input:Partial<Input>={})=>s.update(1/60,{...free,...input});
function walk(s:Simulation,x:number,z:number){for(let n=0;n<900;n++){const dx=x-s.p.x,dz=s.p.z-z;if(Math.hypot(dx,dz)<.07){for(let k=0;k<18;k++)tick(s);return;}tick(s,{x:Math.max(-1,Math.min(1,dx*3/SPEED)),forward:Math.max(-1,Math.min(1,dz*3/SPEED))});}throw Error('Cannot reach doorway: '+s.text());}
it('walks through the open greenhouse doorway while the interior benches remain solid',()=>{
  const s=new Simulation(1);s.start();walk(s,0,36);walk(s,-18,36);walk(s,-18,18);walk(s,-6,18);walk(s,-3.65,19.6);
  walk(s,-3.65,22.3);expect(s.p.y).toBeCloseTo(9.18);expect(s.recoveries).toBe(0);
  for(let i=0;i<60;i++)tick(s,{x:-1});expect(s.p.x).toBeGreaterThanOrEqual(-4.061);
  walk(s,-3.65,22.3);walk(s,-3.65,19.6);expect(s.p.y).toBe(9);expect(s.recoveries).toBe(0);expect(s.stunts).toBe(0);
});
