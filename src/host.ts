/** Workbook's version-1 iframe bridge; standalone play sends nothing. */
export type HostMessage =
  | {type:'ready'}
  | {type:'level-start';level:number}
  | {type:'level-complete';level:number;durationMs:number}
  | {type:'error';message:string};

const PARENT_ORIGIN=/^(https:\/\/([a-z0-9-]+\.)*workbook\.co\.il|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/;
export function isWorkbookParentOrigin(origin:string):boolean{return PARENT_ORIGIN.test(origin);}
export function parseLevelParam(search:string,levelCount:number,key='level'):number|null{
  if(!Number.isInteger(levelCount)||levelCount<1)return null;
  const raw=new URLSearchParams(search).get(key);if(raw===null||!/^\d+$/.test(raw))return null;
  const n=Number(raw);return n>=1&&n<=levelCount?n-1:null;
}
function parentOrigin():string|null{
  if(typeof window==='undefined'||window.parent===window)return null;
  let origin=window.location.ancestorOrigins?.[0]??'';
  if(!origin&&document.referrer){try{origin=new URL(document.referrer).origin;}catch{origin='';}}
  return isWorkbookParentOrigin(origin)?origin:null;
}
let slug='',target:string|null=null;
export function initHost(gameSlug:string):void{
  slug=gameSlug;target=parentOrigin();if(!target)return;
  window.addEventListener('error',e=>postToHost({type:'error',message:String(e.message).slice(0,200)}));
  window.addEventListener('unhandledrejection',e=>postToHost({type:'error',message:String(e.reason).slice(0,200)}));
}
export function postToHost(message:HostMessage):void{
  if(!target)return;window.parent.postMessage({source:'workbook-game',version:1,slug,...message},target);
}

/** Starts mean real launches; pauses, planning and wrong radios do not complete a level. */
export class WorkbookSession{
  private ready=false;private active:number|null=null;private completed=false;private pending:HostMessage[]=[];
  constructor(private send:(message:HostMessage)=>void,private levelCount=50){}
  private emit(message:HostMessage){if(this.ready)this.send(message);else this.pending.push(message);}
  private valid(level:number){return Number.isInteger(level)&&level>=1&&level<=this.levelCount;}
  markReady(){if(this.ready)return;this.ready=true;this.send({type:'ready'});for(const message of this.pending)this.send(message);this.pending=[];}
  startLevel(level:number){if(!this.valid(level)||this.active===level)return;this.active=level;this.completed=false;this.emit({type:'level-start',level});}
  completeLevel(level:number,durationMs:number){
    if(!this.valid(level)||this.active!==level||this.completed||!Number.isFinite(durationMs)||durationMs<0)return;this.completed=true;
    this.emit({type:'level-complete',level,durationMs:Math.round(durationMs)});
  }
  resetLevel(){this.active=null;this.completed=false;}
}
