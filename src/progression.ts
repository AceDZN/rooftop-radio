/** Local campaign progress. Level access never depends on a school grade. */
export const PROGRESS_KEY='rooftop-radio-campaign-v1';
export interface Result {durationMs:number;recoveries:number;mistakes:number;assisted:boolean;notes:number;bestFlow:number}
export interface LevelRecord {completions:number;bestTimeMs:number;fewestRecoveries:number;fewestMistakes:number;unaided:boolean;mostNotes:number;bestFlow:number}
export interface CampaignProgress {version:1;currentLevel:number;levels:Record<string,LevelRecord>}
export interface LocalStoragePort {getItem(key:string):string|null;setItem(key:string,value:string):void}
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
const integer=(n:unknown):n is number=>finite(n)&&Number.isInteger(n);
const validLevel=(n:number,count:number)=>Number.isInteger(n)&&n>=1&&n<=count;
export const emptyProgress=():CampaignProgress=>({version:1,currentLevel:1,levels:{}});
export function readProgress(raw:string|null,count:number):CampaignProgress {
  const clean=emptyProgress();if(!raw)return clean;
  try {
    const data=JSON.parse(raw);if(!data||data.version!==1||!data.levels||typeof data.levels!=='object')return clean;
    if(validLevel(data.currentLevel,count))clean.currentLevel=data.currentLevel;
    for(let level=1;level<=count;level++){
      const r=data.levels[String(level)];
      if(!r||!integer(r.completions)||r.completions<1||!finite(r.bestTimeMs)||!integer(r.fewestRecoveries)||!integer(r.fewestMistakes)||typeof r.unaided!=='boolean'||!integer(r.mostNotes)||!integer(r.bestFlow))continue;
      clean.levels[String(level)]={completions:r.completions,bestTimeMs:r.bestTimeMs,fewestRecoveries:r.fewestRecoveries,fewestMistakes:r.fewestMistakes,unaided:r.unaided,mostNotes:r.mostNotes,bestFlow:r.bestFlow};
    }
  }catch{/* Corrupt or unavailable local storage must not block playing. */}
  return clean;
}
export function completedCount(progress:CampaignProgress,count:number):number{return Array.from({length:count},(_,i)=>i+1).filter(level=>!!progress.levels[String(level)]).length;}
export function recommendedLevel(progress:CampaignProgress,count:number):number {for(let n=1;n<=count;n++)if(!progress.levels[String(n)])return n;return count;}
export function selectProgressLevel(progress:CampaignProgress,level:number,count:number):CampaignProgress {return validLevel(level,count)?{...progress,currentLevel:level}:progress;}
export function finishProgressLevel(progress:CampaignProgress,level:number,result:Result,count:number):CampaignProgress {
  if(!validLevel(level,count)||!finite(result.durationMs)||![result.recoveries,result.mistakes,result.notes,result.bestFlow].every(integer))return progress;
  const old=progress.levels[String(level)];
  const record:LevelRecord={completions:(old?.completions??0)+1,bestTimeMs:Math.min(old?.bestTimeMs??Infinity,Math.round(result.durationMs)),fewestRecoveries:Math.min(old?.fewestRecoveries??Infinity,result.recoveries),fewestMistakes:Math.min(old?.fewestMistakes??Infinity,result.mistakes),unaided:!!old?.unaided||!result.assisted,mostNotes:Math.max(old?.mostNotes??0,result.notes),bestFlow:Math.max(old?.bestFlow??0,result.bestFlow)};
  const next={...progress,levels:{...progress.levels,[String(level)]:record}};
  return {...next,currentLevel:recommendedLevel(next,count)};
}
export class ProgressStore {
  value:CampaignProgress;
  constructor(private storage:LocalStoragePort|null,readonly levelCount:number){let raw=null;try{raw=storage?.getItem(PROGRESS_KEY)??null;}catch{}this.value=readProgress(raw,levelCount);}
  private save(){try{this.storage?.setItem(PROGRESS_KEY,JSON.stringify(this.value));}catch{}}
  select(level:number){this.value=selectProgressLevel(this.value,level,this.levelCount);this.save();}
  complete(level:number,result:Result){this.value=finishProgressLevel(this.value,level,result,this.levelCount);this.save();}
}
