import {activeBrief,districtSiteName,stageRequirement,type Contract,type Heading,type SiteId,type RouteRequirement} from './content';
const ltr=(text:string)=>`\u2066${text}\u2069`;
export function turn(heading:Heading,side:'left'|'right'):Heading{const compass:Heading[]=['north','east','south','west'];return compass[(compass.indexOf(heading)+(side==='right'?1:3))%4];}
export type RouteEvent=
  | {type:'visit';site:SiteId}|{type:'tune';site:SiteId}|{type:'past'}
  | {type:'junction';approach:Heading}|{type:'depart';direction:Heading}
  | {type:'wide'}|{type:'crossing';bridge:'wide'|'beam';direction:'east'|'west'}
  | {type:'damage'}|{type:'recover';at:SiteId|null};
export interface Evidence{
  progress:number;past:boolean;junction:boolean;approach:Heading|null;wide:boolean;damaged:boolean;
  visits:SiteId[];mistakes:number;last:string;routeIndex:number;stageVisits:SiteId[];violated:SiteId[];stageOrigin:SiteId|null;
}
export const freshEvidence=(job?:Contract):Evidence=>({progress:0,past:false,junction:false,approach:null,wide:false,damaged:false,visits:[],mistakes:0,last:'',routeIndex:0,stageVisits:[],violated:[],stageOrigin:job?.start??null});
function clearProof(s:Evidence){s.routeIndex=0;s.past=false;s.junction=false;s.approach=null;s.wide=false;s.damaged=false;s.stageVisits=[];}
const name=(job:Contract,site:SiteId)=>districtSiteName(site,job.district??'old-town');
function repair(job:Contract,s:Evidence){return `נחתתם בגג שאסור בשלב הזה. ${ltr(`Return to ${name(job,s.stageOrigin??job.start)} to retry this leg.`)}`;}
function needed(job:Contract,requirement:RouteRequirement):string{
  const old=!job.district||job.district==='old-town';
  if(requirement.kind==='visit')return `Land at ${name(job,requirement.site)} first.`;
  if(requirement.kind==='past')return `Go past ${old?'the greenhouse':name(job,'greenhouse')}.`;
  if(requirement.kind==='turn'){
    if(job.id<=5)return `Turn ${requirement.side} at ${old?'the bell tower':name(job,'bell')}.`;
    const origin:Record<Heading,SiteId>={north:'greenhouse',south:'clock',east:'west',west:'east'};
    return `Approach ${name(job,'bell')} from ${name(job,origin[requirement.approach])} and turn ${requirement.side}.`;
  }
  return requirement.bridge==='wide'&&old&&requirement.direction==='west'?'Take the wider striped bridge.':`Cross the ${requirement.bridge==='wide'?'striped bridge':'wooden beam'} ${requirement.direction}.`;
}
/** Evidence belongs to the current leg; matching an earlier leg cannot prepay a later one. */
export function observe(job:Contract,old:Evidence,event:RouteEvent):Evidence{
  const s:Evidence={...old,visits:[...old.visits],stageVisits:[...old.stageVisits],violated:[...old.violated],stageOrigin:old.stageOrigin??(old.progress?job.order[old.progress-1]:job.start)};
  if(complete(job,s))return s;
  const requirement=stageRequirement(job,s.progress),route=requirement.route??[];
  const advance=(predicate:(token:RouteRequirement)=>boolean)=>{const next=route[s.routeIndex];if(!s.violated.length&&!s.damaged&&next&&predicate(next)){s.routeIndex++;return true;}return false;};
  if(event.type==='recover'){
    const cargoDamaged=s.damaged;clearProof(s);
    if(cargoDamaged&&event.at!==s.stageOrigin)s.damaged=true;
    if(event.at===s.stageOrigin){s.violated=[];s.last='השלב מוכן לניסיון חדש. קראו שוב את ההודעה.';}
    else if(s.damaged)s.last=`המטען צריך החלפה. ${ltr(`Return to ${name(job,s.stageOrigin??job.start)} to replace it.`)}`;
    else if(s.violated.length)s.last=repair(job,s);
    return s;
  }
  if(event.type==='visit'){
    if(s.visits.at(-1)!==event.site)s.visits.push(event.site);
    if(s.violated.length&&event.site===s.stageOrigin){clearProof(s);s.violated=[];s.last='חזרתם לתחילת השלב. אפשר לנסות מסלול חדש.';}
    if(requirement.avoid?.includes(event.site)){
      if(!s.violated.includes(event.site))s.violated.push(event.site);
      clearProof(s);s.last=repair(job,s);return s;
    }
    if(s.stageVisits.at(-1)!==event.site)s.stageVisits.push(event.site);
    advance(token=>token.kind==='visit'&&token.site===event.site);return s;
  }
  if(event.type==='past'){if(advance(token=>token.kind==='past'))s.past=true;return s;}
  if(event.type==='junction'){s.approach=event.approach;return s;}
  if(event.type==='depart'){
    if(advance(token=>token.kind==='turn'&&token.approach===s.approach&&turn(token.approach,token.side)===event.direction))s.junction=true;
    s.approach=null;return s;
  }
  if(event.type==='wide'||event.type==='crossing'){
    const bridge=event.type==='wide'?'wide':event.bridge,direction=event.type==='wide'?'west':event.direction;
    if(advance(token=>token.kind==='crossing'&&token.bridge===bridge&&token.direction===direction)&&bridge==='wide')s.wide=true;
    return s;
  }
  if(event.type==='damage'){if(!requirement.fragile)return s;clearProof(s);s.damaged=true;s.last='המטען נפגע. חוזרים לתחילת השלב עם מטען חלופי; את המסלול הזה מבצעים מחדש.';return s;}
  const expected=job.order[s.progress];
  const reject=(message:string)=>{s.mistakes++;s.last=message;return s;};
  if(event.site!==expected)return reject(`זה הרדיו של ${ltr(name(job,event.site))}. בדקו את השלב הנוכחי: ${ltr(activeBrief(job,s.progress))}`);
  if(s.violated.length)return reject(repair(job,s));
  if(requirement.fragile&&s.damaged)return reject('המטען צריך החלפה לפני המסירה. חזרו לנקודת הבדיקה.');
  if(s.routeIndex<route.length)return reject(`המסלול של השלב עוד לא הושלם. ${ltr(needed(job,route[s.routeIndex]))}`);
  if(requirement.action==='inspect'&&!s.stageVisits.includes(expected))return reject(`בדיקה מחייבת נחיתה על הגג. ${ltr(`Land at ${name(job,expected)} before inspecting it.`)}`);
  s.progress++;
  if(s.progress<job.order.length){clearProof(s);s.violated=[];s.stageOrigin=expected;s.last=`השלב הושלם. ${ltr(activeBrief(job,s.progress))}`;}
  else s.last=job.task==='inspection'?`הבדיקות הושלמו ב־${ltr(name(job,expected))}!`:`המסירה הגיעה ל־${ltr(name(job,expected))}!`;
  return s;
}
export function complete(job:Contract,evidence:Evidence):boolean{return evidence.progress===job.order.length;}
export function beyondGreenhouse(z:number):boolean{return z<11.5;}
