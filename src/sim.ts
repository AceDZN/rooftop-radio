import {SITES,SITE,CONNECTIONS,contracts,siteName,type Contract,type SiteId,type Heading} from './content';
import {CROSSINGS,WIND_LIFTS,SIGNAL_NOTES,HEADING_YAW,COURSE_SOLIDS,CITY_BLOCKS,RADIO_SPOTS} from './course';
import {LANDMARK_SOLIDS} from './landmark-layout';
import {freshEvidence,observe,complete,beyondGreenhouse,type Evidence,type RouteEvent} from './rules';
export interface Vec {x:number;y:number;z:number}
export interface Surface {id:string;x:number;z:number;w:number;d:number;y:number;site?:SiteId;ramp?:{ax:number;az:number;ay:number;bx:number;bz:number;by:number};kind:'roof'|'bridge'|'awning'|'narrow'|'deck'}
export interface Obstacle {x:number;z:number;w:number;d:number;y:number;h:number;kind:'wall'|'landmark';shape?:'box'|'cylinder';r?:number;id?:string}
export const SURFACES: Surface[] = SITES.map(s=>({...s,site:s.id,kind:'roof'}));
for(const c of CONNECTIONS) {
  if(c.kind==='gap'||c.a==='bell'&&c.b==='west')continue;
  const a=SITE[c.a],b=SITE[c.b],horizontal=a.x!==b.x;
  const dx=Math.sign(b.x-a.x),dz=Math.sign(b.z-a.z);
  SURFACES.push({id:`${c.a}-${c.b}`,x:(a.x+b.x)/2,z:(a.z+b.z)/2,w:horizontal?7:c.width,d:horizontal?c.width:7,y:Math.min(a.y,b.y),ramp:{ax:a.x+dx*5.8,az:a.z+dz*5.8,ay:a.y,bx:b.x-dx*5.8,bz:b.z-dz*5.8,by:b.y},kind:c.kind==='awning'?'awning':c.kind==='narrow'?'narrow':'bridge'});
}
SURFACES.push({...CROSSINGS.beam,kind:'narrow'},{...CROSSINGS.wide,kind:'awning'});
SURFACES.push({id:'spring',x:-4,z:27,w:4,d:5,y:8.3,kind:'awning'});
SURFACES.push({id:'spring-bell',x:-3.8,z:9,w:3.8,d:4.8,y:7.7,kind:'awning'});
SURFACES.push({id:'first-catch',x:0,z:27,w:5,d:5,y:2.5,kind:'deck'});
SURFACES.push({id:'junction-catch',x:-9,z:0,w:7,d:5,y:2.5,kind:'deck'});
SURFACES.push({id:'recovery',x:-3,z:9,w:55,d:74,y:.15,kind:'deck'});
export const OBSTACLES:Obstacle[]=[
  ...LANDMARK_SOLIDS.map(o=>({...o,kind:'landmark' as const})),
  ...COURSE_SOLIDS.map(o=>({...o,kind:'landmark' as const})),
  ...CITY_BLOCKS.map((o,i)=>({id:`city-${i}`,x:o.x,z:o.z,w:o.w,d:o.d,h:o.h,y:0,kind:'landmark' as const})),
  {id:'vault-wall',x:4.5,z:33,w:3,d:.5,y:10,h:.65,kind:'wall'},
];
const PHYSICAL_SOLIDS:Obstacle[]=[...OBSTACLES,...Object.entries(RADIO_SPOTS).filter(([site])=>site!=='west'&&site!=='east').map(([site,pos])=>({id:`radio-${site}`,x:pos.x,z:pos.z,w:.8,d:.55,y:pos.y,h:.9,kind:'landmark' as const}))];
const PHYSICAL_TOPS:Surface[]=PHYSICAL_SOLIDS.map((o,i)=>({id:`solid-${i}`,x:o.x,z:o.z,w:o.w,d:o.d,y:o.y+o.h,kind:'bridge' as const}));
export const SPEED=7.8, JUMP=8.8, GRAVITY=22, RADIUS=.38;
export function surfaceHeight(s:Surface,x:number,z:number):number {if(!s.ramp)return s.y;const r=s.ramp;const t=Math.max(0,Math.min(1,((x-r.ax)*(r.bx-r.ax)+(z-r.az)*(r.bz-r.az))/((r.bx-r.ax)**2+(r.bz-r.az)**2)));return r.ay+(r.by-r.ay)*t;}
export type Mode='planning'|'play'|'paused'|'help'|'vocabulary'|'audio'|'success'|'won';
export interface Input {x:number;forward:number;jump:boolean;glide:boolean;interact:boolean;yaw:number;dash?:boolean}
export interface LocalEvent {sequence:number;job:number;attempt:number;type:string;value?:string;time:number;assisted:boolean;transfer:boolean;firstDecision?:boolean}
export class Simulation {
  mode:Mode='planning';level=0;variant:number;jobs:Contract[];evidence:Evidence=freshEvidence();
  p:Vec={x:0,y:10,z:39};v:Vec={x:0,y:0,z:0};yaw=0;onGround=true;gliding=false;stamina=1;
  checkpoint:Vec={x:0,y:10,z:39};currentSite:SiteId|null='water';lastSite:SiteId|null='water';
  notes=new Set<number>();flow=0;bestFlow=0;dashCharge=1;dashPulse=0;windLift=false;private dashTime=0;private dashDirection={x:0,z:-1};private lastDash=false;
  elapsed=0;totalTime=0;totals={recoveries:0,mistakes:0,assisted:false,notes:0,bestFlow:0};recoveries=0;landings=0;airtime=0;glideSeconds=0;stunts=0;vaults=0;assisted=false;retries=0;
  toast='';toastTime=0;landingPulse=0;bouncePulse=0;signalPulse=0;nearest:SiteId|null=null;
  events:LocalEvent[]=[];returnMode:Mode='play';hintOpen=false;
  private coyote=.14;private buffer=0;private lastJump=false;private lastInteract=false;private recoverTime=0;private lastZ=39;private junctionInside=false;private wideEntry=false;private vaultTime=0;private eventSequence=0;private decisions=0;private attempt=1;
  constructor(variant=Math.floor(Math.random()*2)){this.variant=variant;this.jobs=contracts(variant);this.resetJob();}
  get job(){return this.jobs[this.level];}
  get relays():{site:SiteId;pos:Vec;name:string}[]{return (Object.entries(RADIO_SPOTS) as [keyof typeof RADIO_SPOTS,Vec][]).map(([site,pos])=>({site,pos:{...pos},name:siteName(site)}));}
  log(type:string,value?:string){const decision=['correct-tune','wrong-tune','wide-route','parcel-drop'].includes(type);const firstDecision=decision?this.decisions++===0:undefined;this.events.push({sequence:++this.eventSequence,job:this.level+1,attempt:this.attempt,type,value,time:Math.round(this.elapsed*10)/10,assisted:this.assisted,transfer:this.job.transfer,firstDecision});if(this.events.length>250)this.events.shift();}
  say(text:string,time=3.5){this.toast=text;this.toastTime=time;}
  emit(e:RouteEvent){this.evidence=observe(this.job,this.evidence,e);}
  resetJob(retry=false){
    const s=SITE[this.job.start],heading=HEADING_YAW[this.job.facing];this.p={x:s.x-Math.sin(heading)*3,y:s.y,z:s.z+Math.cos(heading)*3};this.v={x:0,y:0,z:0};
    this.yaw=heading;this.checkpoint={...this.p};this.onGround=true;this.gliding=false;this.stamina=1;
    this.evidence=freshEvidence();this.currentSite=s.id;this.lastSite=s.id;this.lastZ=this.p.z;this.elapsed=0;this.recoveries=0;this.landings=0;this.airtime=0;this.glideSeconds=0;this.stunts=0;this.vaults=0;this.vaultTime=0;
    this.notes.clear();this.flow=0;this.bestFlow=0;this.dashCharge=1;this.dashPulse=0;this.dashTime=0;this.lastDash=false;this.windLift=false;
    this.assisted=false;this.hintOpen=false;this.junctionInside=false;this.wideEntry=false;this.recoverTime=0;this.mode='planning';this.toast='';
    this.buffer=0;this.coyote=.14;this.lastJump=false;this.lastInteract=false;this.nearest=null;this.decisions=0;this.attempt=retry?this.attempt+1:1;
    if(retry){this.retries++;this.log('retry');}else this.log('contract');
  }
  start(){this.mode='play';this.log('launch');}
  pause(mode:Mode='paused'){if(this.mode==='play'||this.mode==='planning'){this.returnMode=this.mode;this.mode=mode;this.log(mode);}}
  resume(){if(['paused','help','vocabulary','audio'].includes(this.mode))this.mode=this.returnMode;}
  vocabulary(){if(['play','planning','paused','help'].includes(this.mode)){this.assisted=true;if(this.mode==='play'||this.mode==='planning')this.returnMode=this.mode;this.mode='vocabulary';this.log('vocabulary');}}
  hint(){if(this.job.hint){this.assisted=true;this.hintOpen=true;this.log('hint');}}
  next(){if(this.mode!=='success')return;this.totalTime+=this.elapsed;this.totals.recoveries+=this.recoveries;this.totals.mistakes+=this.evidence.mistakes;this.totals.assisted ||=this.assisted;this.totals.notes+=this.notes.size;this.totals.bestFlow=Math.max(this.totals.bestFlow,this.bestFlow);if(this.level===4){this.mode='won';return;}this.level++;this.resetJob();}
  restart(){this.resetJob(true);}
  recover(reason='נחיתה רכה. חזרנו לגג האחרון.'){
    this.p={...this.checkpoint};this.v={x:0,y:0,z:0};this.onGround=true;this.gliding=false;this.stamina=1;this.flow=0;this.dashCharge=1;this.dashTime=0;this.recoveries++;this.recoverTime=0;this.lastZ=this.p.z;this.coyote=.14;this.junctionInside=false;this.wideEntry=false;
    if(this.job.fragile){this.evidence.wide=false;this.evidence.damaged=false;}this.say(reason);this.log('recovery');
  }
  update(dt:number,input:Input){
    if(this.mode!=='play'){this.lastJump=input.jump;this.lastInteract=input.interact;this.lastDash=!!input.dash;return;}
    this.elapsed+=dt;this.toastTime=Math.max(0,this.toastTime-dt);this.landingPulse=Math.max(0,this.landingPulse-dt*2.5);this.bouncePulse=Math.max(0,this.bouncePulse-dt*2);this.signalPulse=Math.max(0,this.signalPulse-dt);this.vaultTime=Math.max(0,this.vaultTime-dt);
    this.yaw=input.yaw;this.dashPulse=Math.max(0,this.dashPulse-dt*3);this.dashTime=Math.max(0,this.dashTime-dt);this.windLift=false;
    if(input.jump&&!this.lastJump)this.buffer=.18;this.lastJump=input.jump;this.buffer=Math.max(0,this.buffer-dt);
    this.coyote=this.onGround?.14:Math.max(0,this.coyote-dt);
    if(this.buffer>0&&this.coyote>0){
      const dx=Math.sin(input.yaw)*input.forward+Math.cos(input.yaw)*input.x,dz=-Math.cos(input.yaw)*input.forward+Math.sin(input.yaw)*input.x;
      const wall=OBSTACLES.find(o=>{if(o.kind!=='wall'||Math.abs(this.p.y-o.y)>.15)return false;const nx=Math.max(o.x-o.w/2,Math.min(o.x+o.w/2,this.p.x)),nz=Math.max(o.z-o.d/2,Math.min(o.z+o.d/2,this.p.z));const ox=nx-this.p.x,oz=nz-this.p.z;return Math.hypot(ox,oz)<.95&&dx*ox+dz*oz>.2;});
      this.v.y=wall?JUMP*.8:JUMP;this.onGround=false;this.coyote=0;this.buffer=0;this.stunts++;
      if(wall){this.vaults++;this.vaultTime=.38;this.log('vault');this.say('\u2066VAULT\u2069 · קפיצה זורמת',1.4);}else this.log('jump');
    }
    this.gliding=!this.onGround&&this.vaultTime<=0&&(input.glide||input.jump)&&this.v.y<4.8&&this.stamina>.02;
    const ix=input.x,iz=input.forward,l=Math.hypot(ix,iz),norm=Math.max(1,l);
    const dx=(Math.sin(input.yaw)*iz+Math.cos(input.yaw)*ix)/norm,dz=(-Math.cos(input.yaw)*iz+Math.sin(input.yaw)*ix)/norm;
    if(input.dash&&!this.lastDash&&this.dashCharge>0&&!this.onGround){this.dashCharge=0;this.dashTime=.24;this.dashPulse=1;this.dashDirection={x:l>.1?dx:Math.sin(input.yaw),z:l>.1?dz:-Math.cos(input.yaw)};this.v.y=Math.max(this.v.y,1.8);this.flow+=2;this.bestFlow=Math.max(this.bestFlow,this.flow);this.log('air-burst');this.say('AIR BURST · דחיפה באוויר',1.1);}this.lastDash=!!input.dash;
    const target=this.gliding?9.2:SPEED,accel=this.onGround?27:16;
    const approach=(n:number,t:number)=>n+Math.max(-accel*dt,Math.min(accel*dt,t-n));
    if(this.dashTime>0){this.v.x=this.dashDirection.x*17;this.v.z=this.dashDirection.z*17;}else{this.v.x=approach(this.v.x,dx*target);this.v.z=approach(this.v.z,dz*target);}
    if(this.gliding){this.stamina=Math.max(0,this.stamina-dt*.23);this.v.y=Math.max(-2.2,this.v.y-5*dt);this.glideSeconds+=dt;}
    else this.v.y-=GRAVITY*dt;
    if(!this.onGround){this.airtime+=dt;for(const wind of WIND_LIFTS)if(Math.hypot(this.p.x-wind.x,this.p.z-wind.z)<wind.r&&this.p.y>wind.y&&this.p.y<wind.y+wind.h&&this.gliding){this.v.y=Math.min(4.3,this.v.y+13*dt);this.stamina=Math.min(1,this.stamina+dt*.35);this.windLift=true;}}else{this.stamina=Math.min(1,this.stamina+dt*.8);this.dashCharge=1;}
    const old={...this.p};this.p.x+=this.v.x*dt;this.p.z+=this.v.z*dt;this.p.y+=this.v.y*dt;
    // Solid building sides stop a missed jump from passing through a façade.
    // Leave the shallow top band to the authored ramps and landing solver.
    for(const roof of SITES){
      if(old.y>=roof.y-.3||this.p.y>=roof.y-.3)continue;
      const left=roof.x-roof.w/2-RADIUS,right=roof.x+roof.w/2+RADIUS,north=roof.z-roof.d/2-RADIUS,south=roof.z+roof.d/2+RADIUS;
      if(this.p.x>left&&this.p.x<right&&this.p.z>north&&this.p.z<south){
        const distances=[this.p.x-left,right-this.p.x,this.p.z-north,south-this.p.z];const side=distances.indexOf(Math.min(...distances));
        if(side===0){this.p.x=left;this.v.x=0;}if(side===1){this.p.x=right;this.v.x=0;}if(side===2){this.p.z=north;this.v.z=0;}if(side===3){this.p.z=south;this.v.z=0;}
      }
    }
    const solids=PHYSICAL_SOLIDS;
    for(const o of solids){
      if(this.onGround&&o.w>3&&o.d>3&&o.h<=.24&&this.p.y>=o.y-.02&&o.y+o.h-this.p.y<=.19)continue;
      if(this.p.y>=o.y+o.h-.05||old.y>=o.y+o.h-.08&&this.v.y<=0||this.p.y+1.72<=o.y)continue;
      const inFootprint=o.shape==='cylinder'?Math.hypot(this.p.x-o.x,this.p.z-o.z)<(o.r??o.w/2)+RADIUS:Math.abs(this.p.x-o.x)<o.w/2+RADIUS&&Math.abs(this.p.z-o.z)<o.d/2+RADIUS;
      if(inFootprint&&old.y+1.72<=o.y&&this.p.y+1.72>=o.y){this.p.y=o.y-1.72;this.v.y=Math.min(0,this.v.y);continue;}
      if(o.shape==='cylinder'){
        const ox=this.p.x-o.x,oz=this.p.z-o.z,dist=Math.hypot(ox,oz),radius=(o.r??o.w/2)+RADIUS;
        if(dist<radius){const nx=dist>.0001?ox/dist:1,nz=dist>.0001?oz/dist:0;this.p.x=o.x+nx*radius;this.p.z=o.z+nz*radius;const into=this.v.x*nx+this.v.z*nz;if(into<0){this.v.x-=into*nx;this.v.z-=into*nz;}}
      }else{
        const left=o.x-o.w/2-RADIUS,right=o.x+o.w/2+RADIUS,north=o.z-o.d/2-RADIUS,south=o.z+o.d/2+RADIUS;
        if(this.p.x>left&&this.p.x<right&&this.p.z>north&&this.p.z<south){
          const distances=[Math.abs(old.x-left),Math.abs(right-old.x),Math.abs(old.z-north),Math.abs(south-old.z)];const side=distances.indexOf(Math.min(...distances));
          if(side===0){this.p.x=left;this.v.x=Math.min(0,this.v.x);}if(side===1){this.p.x=right;this.v.x=Math.max(0,this.v.x);}if(side===2){this.p.z=north;this.v.z=Math.min(0,this.v.z);}if(side===3){this.p.z=south;this.v.z=Math.max(0,this.v.z);}
        }
      }
    }
    let landing:Surface|undefined;
    const solidTops=PHYSICAL_TOPS;
    if(this.v.y<=0)for(const s of [...SURFACES,...solidTops]){
      const h=surfaceHeight(s,this.p.x,this.p.z);
      if(Math.abs(this.p.x-s.x)<=s.w/2-RADIUS*.2&&Math.abs(this.p.z-s.z)<=s.d/2-RADIUS*.2&&old.y>=h-.18&&this.p.y<=h+.04&&(!landing||h>surfaceHeight(landing,this.p.x,this.p.z)))landing=s;
    }
    this.onGround=false;
    if(landing){
      this.p.y=surfaceHeight(landing,this.p.x,this.p.z);
      if(landing.kind==='deck'){this.recoverTime+=dt;if(this.recoverTime>.35)this.recover();}
      else if(landing.id.startsWith('spring')&&this.v.y<-1){this.v.y=11.8;this.bouncePulse=1;this.stunts+=2;this.log('awning-bounce');this.say('\u2066AWNING BOUNCE\u2069 · קפיץ של בד',1.8);}
      else {
        if(this.v.y<-2){this.landingPulse=1;this.landings++;this.flow++;this.bestFlow=Math.max(this.bestFlow,this.flow);this.log('landing',this.gliding?'glide':'jump');if(this.gliding)this.say('\u2066SOFT LANDING\u2069 · נחיתה חלקה',1.5);}
        this.v.y=0;this.onGround=true;this.gliding=false;
        if(landing.site){this.currentSite=landing.site;if(this.lastSite!==landing.site){this.emit({type:'visit',site:landing.site});this.lastSite=landing.site;this.log('roof',landing.site);}
          if(Math.abs(this.p.x-landing.x)<landing.w/2-1.2&&Math.abs(this.p.z-landing.z)<landing.d/2-1.2)this.checkpoint={x:this.p.x,y:landing.y,z:this.p.z};}
        if(landing.kind==='narrow'&&this.job.fragile&&!this.evidence.damaged){this.emit({type:'damage'});this.log('parcel-drop','narrow crossing');this.say(this.evidence.last);this.recover('המטען החליק. נסו מסלול שיש בו יותר מקום.');}
      }
    }else this.currentSite=null;
    // Compare the two crossings of THIS gap, with the same start and destination.
    const bridge=CROSSINGS.wide,entryX=-6.5,exitX=-11.5;
    const inWideCorridor=Math.abs(this.p.z-bridge.z)<=bridge.d/2-RADIUS&&Math.abs(this.p.y-bridge.y)<.4;
    if(this.job.fragile&&this.lastSite==='bell'&&old.x>entryX&&this.p.x<=entryX&&inWideCorridor)this.wideEntry=true;
    if(this.wideEntry){if(!inWideCorridor||this.p.x>entryX+.3)this.wideEntry=false;else if(old.x>exitX&&this.p.x<=exitX){this.emit({type:'wide'});this.log('wide-route','bell to Radio Station striped bridge');this.wideEntry=false;}}
    for(const [i,note] of SIGNAL_NOTES.entries())if(!this.notes.has(i)&&Math.hypot(this.p.x-note.x,this.p.y+.9-note.y,this.p.z-note.z)<1.15){this.notes.add(i);this.flow++;this.bestFlow=Math.max(this.bestFlow,this.flow);this.log('signal-note',String(i));}
    if(this.p.y<5||Math.abs(this.p.x)>90||this.p.z>100||this.p.z<-90)this.recover();
    if(this.lastZ>=11.5&&beyondGreenhouse(this.p.z)&&Math.abs(this.p.x)<6.5&&this.p.y>=8.7)this.emit({type:'past'});
    this.lastZ=this.p.z;
    const junction=Math.abs(this.p.x)<4.9&&Math.abs(this.p.z)<4.9&&this.p.y>=8.7;
    if(junction&&!this.junctionInside){
      const approach:Heading=Math.abs(this.v.z)>=Math.abs(this.v.x)?(this.v.z<0?'north':'south'):(this.v.x>0?'east':'west');
      this.emit({type:'junction',approach});
    }
    if(!junction&&this.junctionInside){
      const direction:Heading=Math.abs(this.p.x)>=Math.abs(this.p.z)?(this.p.x>0?'east':'west'):(this.p.z<0?'north':'south');
      this.emit({type:'depart',direction});
    }this.junctionInside=junction;
    const near=this.relays.filter(r=>Math.hypot(r.pos.x-this.p.x,r.pos.z-this.p.z)<2.3&&Math.abs(r.pos.y-this.p.y)<1.1).sort((a,b)=>Math.hypot(a.pos.x-this.p.x,a.pos.z-this.p.z)-Math.hypot(b.pos.x-this.p.x,b.pos.z-this.p.z))[0];
    this.nearest=near?.site??null;
    if(input.interact&&!this.lastInteract&&this.nearest){
      const before=this.evidence.progress;this.emit({type:'tune',site:this.nearest});this.log(before<this.evidence.progress?'correct-tune':'wrong-tune',this.nearest);this.say(this.evidence.last);this.signalPulse=before<this.evidence.progress?1:0;
      if(complete(this.job,this.evidence)){this.mode='success';this.log('complete',this.assisted?'assisted':'unaided');}
    }this.lastInteract=input.interact;
  }
  text(){return JSON.stringify({mode:this.mode,coordinateSystem:'meters; x east, y up, z south; north is -z',job:{number:this.level+1,title:this.job.title,english:this.job.english,transfer:this.job.transfer,startingHeading:this.job.facing},player:{position:this.p,velocity:this.v,facingYaw:this.yaw,grounded:this.onGround,gliding:this.gliding,stamina:this.stamina},currentRoof:this.currentSite,checkpoint:this.checkpoint,nearestRelay:this.nearest,relays:this.relays,route:{tuned:this.evidence.progress,required:this.job.order.length,past:this.evidence.past,rightTurn:this.evidence.junction,wide:this.evidence.wide,trace:this.evidence.visits},movement:{vaults:this.vaults,landings:this.landings,glideSeconds:this.glideSeconds,stunts:this.stunts,notes:this.notes.size,notesAvailable:SIGNAL_NOTES.length,flow:this.flow,bestFlow:this.bestFlow,airBurstReady:this.dashCharge>0,windLift:this.windLift},time:this.elapsed,recoveries:this.recoveries,assisted:this.assisted,mistakes:this.evidence.mistakes,feedback:this.toastTime>0?this.toast:'',assets:'Pure simulation; rendering reports local model state'});}
}
