import {activeBrief,siteName,type Contract,type Heading,type SiteId} from './content';
const ltr=(text:string)=>`\u2066${text}\u2069`;
export function turn(heading: Heading, side: 'left'|'right'): Heading {
  const compass: Heading[] = ['north','east','south','west'];
  return compass[(compass.indexOf(heading)+(side === 'right' ? 1 : 3))%4];
}
export type RouteEvent = {type:'visit';site:SiteId} | {type:'tune';site:SiteId} | {type:'past'} | {type:'junction';approach:Heading} | {type:'depart';direction:Heading} | {type:'wide'} | {type:'damage'};
export interface Evidence {progress:number; past:boolean; junction:boolean; approach:Heading|null; wide:boolean; damaged:boolean; visits:SiteId[]; mistakes:number; last:string}
export const freshEvidence = (): Evidence => ({progress:0,past:false,junction:false,approach:null,wide:false,damaged:false,visits:[],mistakes:0,last:''});
export function observe(job: Contract, old: Evidence, event: RouteEvent): Evidence {
  const s = {...old,visits:[...old.visits]};
  if(event.type === 'visit') {if(s.visits.at(-1)!==event.site)s.visits.push(event.site);return s;}
  if(event.type === 'past') {if(!job.past || s.progress >= job.order.indexOf('greenhouse')+1)s.past=true;return s;}
  if(event.type === 'junction') {s.approach=event.approach;s.junction=false;return s;}
  if(event.type === 'depart') {s.junction=s.approach===job.facing && turn(s.approach,'right')===event.direction;s.approach=null;return s;}
  if(event.type === 'wide') {s.wide=true;return s;}
  if(event.type === 'damage') {s.damaged=true;s.last='המטען החליק על קורת העץ. חזרנו לגג עם מטען חדש.';return s;}
  const expected=job.order[s.progress];
  if (event.site !== expected) {s.mistakes++;s.last=`זה הרדיו של ${ltr(siteName(event.site))}. בדקו את השלב הנוכחי: ${ltr(activeBrief(job,s.progress))}`;return s;}
  const isLast=s.progress === job.order.length-1;
  if (isLast && job.past && !s.past) {s.mistakes++;s.last=`עדיין צריך לחלוף על פני החממה מאז השידור האחרון. ${ltr('Go past the greenhouse.')}`;return s;}
  if (isLast && job.turn && !s.junction) {s.mistakes++;s.last=`הגעתם לרדיו, אבל הפנייה בצומת חסרה. גשו למגדל הפעמון מהכיוון שבהודעה: ${ltr('Turn right at the bell tower.')}`;return s;}
  if (isLast && job.fragile && (!s.wide || s.damaged)) {s.mistakes++;s.last=`המסירה דורשת חצייה בגשר שמתואר בהודעה. חזרו לשני המעברים בגג הפעמון: ${ltr('Take the wider striped bridge.')}`;return s;}
  s.progress++;
  if(event.site==='greenhouse') {s.past=false;s.junction=false;s.approach=null;}
  s.last=isLast?`המסירה הגיעה ל־${ltr(siteName(event.site))}!`:`הרדיו כוון. ${ltr(activeBrief(job,s.progress))}`;
  return s;
}
export function complete(job: Contract, evidence: Evidence): boolean {return evidence.progress === job.order.length;}
export function beyondGreenhouse(z:number):boolean {return z < 11.5;}
