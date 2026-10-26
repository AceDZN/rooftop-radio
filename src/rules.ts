import type {Contract, Heading, SiteId} from './content';
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
  if(event.type === 'past') {if(!job.past || s.progress >= (job.transfer?2:1))s.past=true;return s;}
  if(event.type === 'junction') {s.approach=event.approach;s.junction=false;return s;}
  if(event.type === 'depart') {s.junction=s.approach===job.facing && turn(s.approach,'right')===event.direction;s.approach=null;return s;}
  if(event.type === 'wide') {s.wide=true;return s;}
  if(event.type === 'damage') {s.damaged=true;s.last='המטען החליק במעבר הצר. חזרנו לנקודת הבדיקה עם מטען חדש.';return s;}
  const expected=job.order[s.progress];
  if (event.site !== expected) {s.mistakes++;s.last=`זה לא הממסר הדרוש בשלב הזה. בדקו שוב את תיאור המקום או את סדר התחנות בהודעה.`;return s;}
  const isLast=s.progress === job.order.length-1;
  if (isLast && job.past && !s.past) {s.mistakes++;s.last='\u2066Go past\u2069 — צריך לעבור לצד הרחוק של החממה לפני השידור.';return s;}
  if (isLast && job.turn && !s.junction) {s.mistakes++;s.last='ההודעה מתחילה בכיוון נתון. עברו דרך צומת מגדל הפעמון בכיוון הזה.';return s;}
  if (isLast && job.fragile && (!s.wide || s.damaged)) {s.mistakes++;s.last='\u2066Take the wider awning route\u2069 — המטען זקוק למרחב של מסלול הסוככים.';return s;}
  s.progress++;
  if(event.site==='greenhouse') {s.past=false;s.junction=false;s.approach=null;}
  s.last=isLast?'האות הגיע. שידור נקי!':'הממסר כוון. המשיכו לפי ההודעה.';
  return s;
}
export function complete(job: Contract, evidence: Evidence): boolean {return evidence.progress === job.order.length;}
export function beyondGreenhouse(z:number):boolean {return z < 11.5;}
