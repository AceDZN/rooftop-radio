// Input-only route driver shared by physical solvability and browser checks.
// It never writes a position, checkpoint, route proof or completion state.
const edges=[['water','greenhouse'],['greenhouse','bell'],['bell','clock'],['bell','west'],['bell','east'],['greenhouse','laundry'],['laundry','west'],['water','antenna'],['antenna','laundry'],['clock','mural'],['mural','west']];
const positions={water:[0,36],greenhouse:[3.5,18],bell:[0,0],clock:[0,-18],west:[-14,3.3],east:[12,3.5],laundry:[-18,18],antenna:[-18,36],mural:[-18,-18]};
const radioApproach={water:[1,37.5],greenhouse:[1,22.2],bell:[-2.4,-1.8],clock:[1,-16.5],west:[-19.8,-4.4],east:[14.65,.4],laundry:[-18.4,16],antenna:[-17.7,34],mural:[-17.5,-16]};
const directions=['north','east','south','west'];
const incoming={north:'greenhouse',south:'clock',east:'west',west:'east'};
const outgoing={north:'clock',south:'greenhouse',east:'east',west:'west'};
function path(a,b,avoid=[]){
  if(a===b)return [a];const queue=[[a]],seen=new Set([a]);
  while(queue.length){const route=queue.shift(),at=route.at(-1);for(const edge of edges){if(!edge.includes(at))continue;const next=edge.find(n=>n!==at);if(avoid.includes(next)||seen.has(next))continue;const full=[...route,next];if(next===b)return full;seen.add(next);queue.push(full);}}
  throw Error(`No route ${a}->${b} avoiding ${avoid}`);
}
export function planContract(job){
  let at=job.start;const stages=[];
  for(let stage=0;stage<job.order.length;stage++){
    const r=job.requirements?.[stage]??{},steps=[],avoid=r.avoid??[];
    const go=site=>{const route=path(at,site,avoid);for(let i=1;i<route.length;i++)steps.push({from:route[i-1],to:route[i]});at=site;};
    for(const requirement of r.route??[]){
      if(requirement.kind==='visit')go(requirement.site);
      if(requirement.kind==='past'){go('greenhouse');steps.push({from:'greenhouse',to:'bell'});at='bell';}
      if(requirement.kind==='turn'){
        go(incoming[requirement.approach]);const index=directions.indexOf(requirement.approach),direction=directions[(index+(requirement.side==='right'?1:3))%4];
        steps.push({from:at,to:'bell'},{from:'bell',to:outgoing[direction]});at=outgoing[direction];
      }
      if(requirement.kind==='crossing'){
        const start=requirement.direction==='west'?'bell':'west',end=requirement.direction==='west'?'west':'bell';go(start);steps.push({from:start,to:end,bridge:requirement.bridge});at=end;
      }
    }
    go(job.order[stage]);stages.push({steps,target:at,action:r.action??'tune'});
  }
  return stages;
}
export class CampaignDriver {
  constructor(adapter){this.adapter=adapter;this.moves=0;}
  async read(){return this.adapter.read();}
  async tick(input={},frames=1){return this.adapter.tick({x:0,forward:0,jump:false,glide:false,interact:false,...input},frames);}
  async settle(){let s=await this.read();for(let i=0;i<45;i++){if(s.player.grounded&&Math.hypot(s.player.velocity.x,s.player.velocity.z)<.3)return;s=await this.tick({},8);}throw Error('Could not settle '+JSON.stringify(s.player));}
  async walk(x,z,air=false){
    let s=await this.read();this.moves++;
    for(let i=0;i<320;i++){
      const p=s.player.position,v=s.player.velocity,dx=x-p.x,dz=z-p.z;
      if(Math.hypot(dx,dz)<.16&&Math.hypot(v.x,v.z)<.65){await this.tick({},10);return;}
      if(s.mode!=='play')throw Error('Movement left play '+JSON.stringify({mode:s.mode,job:s.job}));
      const yaw=s.player.facingYaw,tx=Math.max(-7.8,Math.min(7.8,dx*3)),tz=Math.max(-7.8,Math.min(7.8,dz*3));
      const lx=tx*Math.cos(yaw)+tz*Math.sin(yaw),lf=tx*Math.sin(yaw)-tz*Math.cos(yaw),vx=v.x*Math.cos(yaw)+v.z*Math.sin(yaw),vf=v.x*Math.sin(yaw)-v.z*Math.cos(yaw);
      const axis=(target,current)=>Math.abs(target)>.18&&(Math.abs(current)<Math.abs(target)+.25||current*target<0)?Math.sign(target):0;
      s=await this.tick({x:axis(lx,vx),forward:axis(lf,vf),jump:air&&!s.player.grounded},Math.hypot(dx,dz)>2?8:2);
    }
    throw Error(`Walk (${x},${z}) stuck: `+JSON.stringify({player:s.player,job:s.job,route:s.route,feedback:s.feedback}));
  }
  async hub(site){
    const s=await this.read(),p=s.player.position;
    if(site==='greenhouse'&&p.z>20){await this.walk(3.5,22);await this.walk(3.5,18);}
    if(site==='east'){await this.walk(14.65,3.5);await this.walk(12,3.5);}
    await this.walk(...positions[site]);
  }
  async jump(from,to){
    await this.walk(...from);const s=await this.read(),yaw=s.player.facingYaw,dx=to[0]-from[0],dz=to[1]-from[1];
    const x=Math.sign(dx*Math.cos(yaw)+dz*Math.sin(yaw)),forward=Math.sign(dx*Math.sin(yaw)-dz*Math.cos(yaw));
    await this.tick({x,forward,jump:true},1);await this.walk(...to,true);await this.settle();
  }
  async travel(from,to,bridge='wide'){
    await this.hub(from);const s=await this.read(),district=s.job.district;
    if((from==='bell'&&to==='west')||(from==='west'&&to==='bell')){
      const z=bridge==='beam'?-2:3.3;if(from==='bell'){await this.walk(0,z);await this.walk(-14,z);}else{await this.walk(-14,z);await this.walk(0,z);}
    }else if((from==='bell'&&to==='east')||(from==='east'&&to==='bell')){
      if(from==='bell'){await this.walk(0,0);await this.walk(12,0);await this.walk(12,3.5);}else{await this.walk(12,3.5);await this.walk(12,0);await this.walk(0,0);}
    }else if(from==='water'&&to==='greenhouse')await this.jump([0,31.5],[2,22]);
    else if(from==='greenhouse'&&to==='water'){await this.walk(3.5,23);await this.jump([1.2,23],[0,32]);}
    else if(from==='greenhouse'&&to==='bell')await this.jump([0,13.6],[0,3]);
    else if(from==='bell'&&to==='greenhouse')await this.jump([0,4.5],[0,14.2]);
    else if((from==='antenna'&&to==='laundry')||(from==='laundry'&&to==='antenna')){
      if(district!=='old-town')await this.jump(from==='antenna'?[-18,31.4]:[-18,22.6],from==='antenna'?[-18,22.6]:[-18,31.4]);
      else await this.walk(-18,to==='antenna'?36:18);
    }else if((from==='clock'&&to==='mural')||(from==='mural'&&to==='clock')){
      if(['market','gardens','observatory'].includes(district))await this.jump(from==='clock'?[-4.6,-18]:[-13.4,-18],from==='clock'?[-13.4,-18]:[-4.6,-18]);
      else await this.walk(to==='clock'?0:-18,-18);
    }else if((from==='laundry'&&to==='west')||(from==='west'&&to==='laundry')){
      if(from==='west'){await this.walk(-14,5);await this.walk(-18,4.6);}
      if(['gardens','observatory'].includes(district))await this.jump(from==='west'?[-18,4.6]:[-18,13.4],from==='west'?[-18,13.4]:[-18,4.6]);
      else await this.walk(-18,to==='west'?4.6:13.4);
      if(to==='west'){await this.walk(-14,4.6);await this.walk(-14,3.3);}
    }else if((from==='bell'&&to==='clock')||(from==='clock'&&to==='bell')){
      if(district==='observatory')await this.jump(from==='bell'?[0,-4.6]:[0,-13.4],from==='bell'?[0,-13.4]:[0,-4.6]);
      else await this.walk(0,to==='bell'?0:-18);
    }else if((from==='west'&&to==='mural')||(from==='mural'&&to==='west')){
      if(from==='west'){await this.walk(-14,-5);await this.walk(-18,-5);await this.walk(-18,-18);}
      else{await this.walk(-18,-5);await this.walk(-14,-5);await this.walk(-14,3.3);}
    }else if((from==='greenhouse'&&to==='laundry')||(from==='laundry'&&to==='greenhouse')){
      await this.walk(-6,18);await this.walk(...positions[to]);
    }else await this.walk(...positions[to]);
    await this.hub(to);await this.settle();
  }
  async interact(site){
    if(site==='greenhouse')await this.walk(3.5,22);
    if(site==='east')await this.walk(14.65,3.5);
    await this.walk(...radioApproach[site]);await this.settle();await this.tick({interact:true},1);return this.tick({},2);
  }
  async complete(job,onStage){
    const plan=planContract(job);
    for(let n=0;n<plan.length;n++){
      const leg=plan[n];for(const step of leg.steps)await this.travel(step.from,step.to,step.bridge);
      const result=await this.interact(leg.target);
      if(result.route.tuned!==n+1)throw Error(`Level${job.id} stage${n+1} rejected: `+JSON.stringify({route:result.route,feedback:result.feedback,player:result.player}));
      if(onStage)await onStage(result,n);
    }
    const final=await this.read();if(final.mode!=='success')throw Error('No success '+JSON.stringify(final));return final;
  }
}
