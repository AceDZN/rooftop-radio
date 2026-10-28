import './style.css';
import {Simulation,type Mode,type Input} from './sim';
import {World} from './scene';
import {districtSiteName,DISTRICTS,activeBrief as authoredBrief,type SiteId} from './content';
import {HEADING_YAW} from './course';
import {RadioAudio} from './audio';
import {COURIER_URL,GLIDER_URL} from './asset-config';
import {initHost,postToHost,parseLevelParam,WorkbookSession} from './host';
import {ProgressStore,completedCount,recommendedLevel} from './progression';

initHost('rooftop-radio');

const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<canvas id="game" aria-label="שכונת הגגות — מרחב משחק תלת ממדי" tabindex="0"></canvas>
<div class="vignette"></div>
<header class="hud"><div class="brand" dir="ltr">ROOFTOP<span>RADIO</span><i>98.7 FM</i></div><div class="toolbar"><button id="pause" title="השהיה / קריאה (P)">Ⅱ</button><button id="levels" title="מפת 50 השלבים" aria-label="מפת השלבים">▦</button><button id="vocab" title="מילון — הזמן נעצר">א / A</button><button id="sound" title="צליל">♪</button><button id="motion" title="הפחתת תנועה">≈</button><button id="fullscreen" title="מסך מלא (F)">⛶</button></div></header>
<section class="radio" id="radio"><span class="radio-icon" aria-hidden="true">▥</span><div><small dir="ltr">RADIO JOB <span id="job-number">01 / 50</span></small><p lang="en" dir="ltr" id="active-brief"></p></div><button id="read" title="הודעה מלאה — הזמן נעצר">קריאה</button></section>
<div id="status" class="status"><span id="task-title"></span><span id="progress"></span></div>
<div id="flow-score" class="flow-score" dir="ltr"></div><div id="burst-state" class="burst-state"></div>
<div id="compass" class="compass" lang="en" dir="ltr"></div>
<div class="flight"><span>דאון</span><div><i id="stamina"></i></div><b id="flight-mode">על הגג</b></div>
<div class="time" id="timer" dir="ltr">00:00</div>
<div id="feedback" class="feedback" role="status"></div>
<button id="interact" class="interact" hidden><kbd>E</kbd> כיוון ממסר</button>
<div id="controls" class="controls">תנועה <b dir="ltr">WASD / ↑↓←→</b> · קפיצה ודאייה <b>רווח</b> · פרץ אוויר <b>Shift</b> · מצלמה <b>גרירה</b></div>
<div id="asset-status" class="asset-status" hidden>טעינת הדמות לא הושלמה. נסו לרענן את הדף.</div>
<div class="touch" id="touch"><div class="dpad"><button data-key="ArrowUp" class="up" aria-label="קדימה">↑</button><button data-key="ArrowLeft" class="left" aria-label="שמאלה">←</button><button data-key="ArrowDown" class="down" aria-label="אחורה">↓</button><button data-key="ArrowRight" class="right" aria-label="ימינה">→</button></div><div class="touch-actions"><button data-key="ShiftLeft" id="touch-dash">פרץ אוויר<br><small>פעם בכל קפיצה</small></button><button data-key="Space" id="touch-jump">קפיצה<br><small>החזיקו לדאייה</small></button></div></div>
<div id="overlay" class="overlay"></div><div id="load-error" class="error" hidden></div>`;
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=$<HTMLCanvasElement>('game');
$('overlay').innerHTML='<div class="sheet"><div class="eyebrow" lang="en" dir="ltr">ROOFTOP RADIO</div><h1>פותחים תדר…</h1><p role="status">טוענים את השכונה והשליח.</p></div>';
const sim=new Simulation();let local:Storage|null=null;try{local=window.localStorage;}catch{}
const progressStore=new ProgressStore(local,sim.jobs.length);const hostSession=new WorkbookSession(postToHost,sim.jobs.length);
const requestedLevel=parseLevelParam(window.location.search,sim.jobs.length);sim.selectLevel(requestedLevel??progressStore.value.currentLevel-1);
const siteName=(id:SiteId)=>districtSiteName(id,sim.district);
const audio=new RadioAudio();let world:World;
let reduced=localStorage.getItem('rr-reduced')==='true'||matchMedia('(prefers-reduced-motion: reduce)').matches;
audio.muted=localStorage.getItem('rr-muted')==='true';
for(const channel of ['music','effects','wind'] as const){const saved=localStorage.getItem(`rr-${channel}-volume`);if(saved!==null)audio.setVolume(channel,Number(saved));}
let levelsReturn:Mode='planning';let yaw=sim.yaw;const keys=new Set<string>();let drag:{id:number;x:number;y:number}|null=null;let lastMode:Mode|null=null;let audioSequence=0;let uiFrame=0;let needsFrame=true;
try{await document.fonts.load('500 20px Rubik');world=new World(canvas);await Promise.all([COURIER_URL?world.loadCourier(COURIER_URL):Promise.resolve(),GLIDER_URL?world.loadGlider(GLIDER_URL):Promise.resolve(),world.loadArchitecture('./architecture/manifest.json')]);const art=world.artState();if(!art.courier||!art.glider||art.error||!art.buildings)throw Error(`Required game assets failed: ${art.error||'missing courier, glider or buildings'}`);}catch(e){$('load-error').hidden=false;$('load-error').textContent='לא הצלחנו לפתוח את המשחק. נסו לרענן את הדף בדפדפן עם האצת חומרה. '+String(e);throw e;}
function clearInput(){keys.clear();drag=null;}
function storage(){try{localStorage.setItem('rooftop-radio-events',JSON.stringify(sim.events));}catch{/* Local-only telemetry is optional. */}}
function time(t:number){return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
function start(){if(sim.mode!=='planning')return;audio.unlock();sim.start();hostSession.startLevel(sim.level+1);clearInput();canvas.focus();updateUI();}
function pause(){sim.pause();clearInput();updateUI();}
function resume(){if(sim.mode==='levels')sim.mode=levelsReturn;else sim.resume();clearInput();canvas.focus();updateUI();}
function restart(){hostSession.resetLevel();sim.restart();yaw=sim.yaw;world.snapCamera();clearInput();lastMode=null;updateUI();}
function selectLevel(level:number){if(!sim.selectLevel(level-1))return;hostSession.resetLevel();progressStore.select(level);yaw=sim.yaw;world.snapCamera();clearInput();lastMode=null;updateUI();}
function showLevels(){if(sim.mode!=='levels'){levelsReturn=sim.mode;sim.mode='levels';}clearInput();lastMode=null;updateUI();}
function campaign(){hostSession.resetLevel();sim.level=0;sim.totalTime=0;sim.totals={recoveries:0,mistakes:0,assisted:false,notes:0,bestFlow:0};sim.variant=1-sim.variant;sim.resetJob();yaw=sim.yaw;world.snapCamera();clearInput();lastMode=null;updateUI();}
function showHelp(){sim.pause('help');clearInput();updateUI();}
function fullscreen(){if(document.fullscreenElement)void document.exitFullscreen();else void document.documentElement.requestFullscreen().catch(()=>{});}
$('pause').onclick=()=>sim.mode==='play'?pause():resume();$('levels').onclick=showLevels;$('read').onclick=pause;$('vocab').onclick=()=>{sim.vocabulary();clearInput();updateUI();};
$('sound').onclick=()=>{audio.unlock();audio.muted=!audio.muted;localStorage.setItem('rr-muted',String(audio.muted));lastMode=null;updateUI();};
$('motion').onclick=()=>{reduced=!reduced;localStorage.setItem('rr-reduced',String(reduced));lastMode=null;updateUI();};$('fullscreen').onclick=fullscreen;
window.addEventListener('resize',()=>world.resize());document.addEventListener('fullscreenchange',()=>world.resize());
window.addEventListener('blur',()=>{if(sim.mode==='play')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&sim.mode==='play')pause();});
window.addEventListener('keydown',e=>{
  if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement)return;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyF','KeyP'].includes(e.code))e.preventDefault();
  if(e.repeat)return;
  if(e.code==='KeyP'||e.code==='Escape'){if(sim.mode==='play')pause();else if(['paused','vocabulary','help','audio','levels'].includes(sim.mode))resume();return;}
  if(e.code==='KeyF'){fullscreen();return;}if(e.code==='KeyM')$('sound').click();if(e.code==='KeyH'){showHelp();return;}
  if(e.code==='Enter'&&sim.mode==='planning'){start();return;}if(e.code==='KeyC'){yaw=HEADING_YAW[sim.job.facing];world.cameraPitch=.245;world.snapCamera();}
  keys.add(e.code);
});window.addEventListener('keyup',e=>keys.delete(e.code));
canvas.addEventListener('pointerdown',e=>{if(sim.mode!=='play')return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;yaw+=(e.clientX-drag.x)*.004;world.cameraPitch=Math.max(.02,Math.min(.65,world.cameraPitch+(e.clientY-drag.y)*.0025));drag.x=e.clientX;drag.y=e.clientY;});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-key]')){
  b.onpointerdown=e=>{e.preventDefault();audio.unlock();keys.add(b.dataset.key!);b.classList.add('held');b.setPointerCapture(e.pointerId);};
  const release=()=>{keys.delete(b.dataset.key!);b.classList.remove('held');};b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;
}
$('interact').onpointerdown=e=>{e.preventDefault();audio.unlock();keys.add('KeyE');};$('interact').onpointerup=()=>keys.delete('KeyE');$('interact').onpointercancel=()=>keys.delete('KeyE');
function activeBrief(){return authoredBrief(sim.job,sim.evidence.progress);}
const close=`<button class="primary" data-action="resume">חזרה לגגות <span>←</span></button>`;
function updateOverlay(){
  const mode=sim.mode;document.body.dataset.mode=mode;document.body.classList.toggle('reduced',reduced);
  $('sound').classList.toggle('selected',audio.muted);$('sound').setAttribute('aria-label',audio.muted?'הפעלת צליל':'השתקת צליל');$('motion').classList.toggle('selected',reduced);
  $('overlay').hidden=mode==='play';
  if(mode==='play')return;
  const district=DISTRICTS.find(d=>d.id===sim.district)!;
  const heading=`<div class="eyebrow"><span lang="en" dir="ltr">${String(sim.level+1).padStart(2,'0')} / ${sim.jobs.length}</span> · ${district.name} · הזמן נעצר לקריאה</div>`;
  const briefing=`<p class="english" lang="en" dir="ltr">${sim.job.english}</p>`;
  const launchBrief=`<p class="english" lang="en" dir="ltr">${authoredBrief(sim.job,0)}</p>${sim.job.order.length>1?`<details class="mission-brief"><summary>המסלול המלא · ${sim.job.order.length} תחנות</summary><p class="english small" lang="en" dir="ltr">${sim.job.english}</p></details>`:''}`;
  const hint=sim.hintOpen?`<p class="hint">${sim.job.hint}</p>`:'';
  const utilities=`<div class="text-actions"><button data-action="vocabulary">מילון</button><button data-action="help">איך משחקים</button><button data-action="audio">מוזיקה וצליל</button>${sim.job.hint?'<button data-action="hint">רמז למסלול</button>':'<span>ללא רמז פתרון במשימת ההעברה</span>'}</div>${hint}`;
  let html='';
  if(mode==='planning')html=`<div class="sheet planning">${heading}<h1>${sim.job.title}</h1>${sim.level===0?'<p class="intro">משלוח קצר. קפיצה טובה. עוד גג מחובר.</p>':''}<p class="campaign-position">${completedCount(progressStore.value,sim.jobs.length)} מתוך ${sim.jobs.length} שלבים הושלמו · ההתקדמות נשמרת במכשיר</p>${launchBrief}<div class="launch-row"><button class="primary" id="start-btn" data-action="start">יוצאים לגגות <span>←</span></button><small>החזיקו רווח לדאייה, שחררו לנחיתה<br>Shift לפרץ אוויר</small></div>${utilities}<button class="subtle" data-action="levels">בחירת שלב · כל ${sim.jobs.length} השלבים</button><div class="keyline"><span><b dir="ltr">WASD / ↑↓←→</b> תנועה</span><span><b>E</b> פעולה בתחנה</span><span>גרירה לסיבוב מצלמה</span></div></div>`;
  if(mode==='levels')html=`<div class="sheet level-menu"><div class="eyebrow" dir="ltr">ROOFTOP RADIO · ${sim.jobs.length} LEVELS</div><h1>כל הגגות מתחברים</h1><p>מתקדמים שלב אחר שלב, למסלולים ולהודעות מורכבים יותר. אפשר לחזור לכל שלב. ההתקדמות נשמרת במכשיר הזה.</p><div class="campaign-summary"><strong>${completedCount(progressStore.value,sim.jobs.length)} / ${sim.jobs.length}</strong><span>שלבים הושלמו</span><button class="primary" data-action="continue-campaign">ממשיכים לשלב ${recommendedLevel(progressStore.value,sim.jobs.length)} ←</button></div>${DISTRICTS.map((d,i)=>`<section class="district-levels" aria-label="${d.name}"><div class="district-heading"><span dir="ltr">${String(i+1).padStart(2,'0')}</span><div><h2>${d.name}</h2><p>${d.description}</p></div><small dir="ltr">${i*10+1}–${Math.min((i+1)*10,sim.jobs.length)}</small></div><div class="level-grid">${sim.jobs.filter(j=>j.district===d.id).map(job=>{const done=progressStore.value.levels[String(job.id)];return `<button data-level="${job.id}" class="level-node${done?' completed':''}${job.id===sim.level+1?' current':''}" aria-label="שלב ${job.id}: ${job.title}${done?' — הושלם':''}" ${job.id===sim.level+1?'aria-current="step"':''}><b>${job.id}</b><span>${job.title}</span>${done?'<i aria-hidden="true">✓</i>':''}</button>`;}).join('')}</div></section>`).join('')}<button class="subtle" data-action="resume">חזרה לשלב הנוכחי</button></div>`;
  if(mode==='paused')html=`<div class="sheet">${heading}<h1>ההודעה בקצב שלכם</h1>${briefing}${close}${utilities}<button class="subtle" data-action="restart">התחלת המשימה מחדש</button></div>`;
  if(mode==='vocabulary')html=`<div class="sheet vocabulary">${heading}<h1>מילים לדרך</h1><p>אפשר לקרוא ולתרגם בלי לאבד זמן. שימוש במילון נרשם בנפרד מהתנועה.</p><dl>${sim.job.vocabulary.map(([en,he])=>`<div><dt lang="en" dir="ltr">${en}</dt><dd>${he}</dd></div>`).join('')}</dl>${close}</div>`;
  if(mode==='audio')html=`<div class="sheet sound-settings">${heading}<h1>צלילים על הגגות</h1><p lang="en" dir="ltr">Rooftop Daylight · 104 BPM</p><p>קלידים, פריטה, בס וויברפון מלווים את המסלול. בזמן קריאה המוזיקה שקטה יותר.</p>${(['music','effects','wind'] as const).map((channel,i)=>`<label class="sound-slider"><span>${['מוזיקה','אפקטים','רוח בדאייה'][i]}</span><input type="range" min="0" max="100" value="${Math.round(audio[`${channel}Volume`]*100)}" data-volume="${channel}" aria-label="${['עוצמת מוזיקה','עוצמת אפקטים','עוצמת רוח'][i]}"></label>`).join('')}<button class="subtle" data-action="mute">${audio.muted?'הפעלת כל הצלילים':'השתקת כל הצלילים'}</button><br>${close}</div>`;
  if(mode==='help')html=`<div class="sheet">${heading}<h1>איך תופסים את הרוח</h1><ul class="help-list"><li><b>תנועה:</b> <bdi>WASD</bdi> או חצים. גררו על הנוף כדי לסובב מצלמה; גם <bdi>J / L</bdi>. <bdi>C</bdi> מחזיר את כיוון המצלמה.</li><li><b>קפיצה ודאייה:</b> רווח לקפיצה; החזיקו באוויר לפתיחת הדאון. <bdi>G</bdi> גם פותח דאון. פסי הרוח מרימים את הדאון. הסוכך הכתום מקפיץ. <bdi>Shift</bdi> נותן פרץ אחד בכל קפיצה; נחיתה מחדשת אותו. תווי הרדיו מוסיפים ניקוד תנועה.</li><li><b>ממסר:</b> התקרבו לרדיו ולחצו <bdi>E</bdi>. כל הממסרים פועלים — קראו כדי לדעת איזה דרוש.</li><li><b>נפילה:</b> נפילה מחזירה במהירות לגג האחרון. עציצים, רדיו וקירות חוסמים תנועה; אפשר לעבור מתחת לסוככים ולרגלי מגדל המים. אפשר לתקן בחירת ממסר בלי לאתחל.</li><li><b>קריאה:</b> <bdi>P</bdi> להשהיה, מילון בכל עת. הזמן נעצר. מהירות התנועה ומידת העזרה מוצגות בנפרד.</li><li><b>מגע:</b> חצי תנועה משמאל, קפיצה מימין. החזיקו לדאייה וגררו על הנוף למצלמה.</li></ul>${close}<button class="subtle" data-action="restart">התחלת המשימה מחדש</button></div>`;
  if(mode==='success'||mode==='won'){
    const trace=sim.evidence.visits.map(id=>siteName(id)).join(' → ');
    const allDone=completedCount(progressStore.value,sim.jobs.length)===sim.jobs.length;
    html=`<div class="sheet completion"><div class="eyebrow" lang="en" dir="ltr">${mode==='won'?'CITY ON AIR':'SIGNAL RECEIVED'}</div><div class="signal-glyph">◉</div><h1>${mode==='won'?(allDone?'כל העיר משדרת':'השלב האחרון הושלם'):'האות הגיע!'}</h1><p>${mode==='won'?(allDone?'50 שלבים, חמישה אזורים, ועיר מחוברת.':`השלמתם ${completedCount(progressStore.value,sim.jobs.length)} מתוך ${sim.jobs.length} שלבים. במפה אפשר להמשיך את השלבים שעוד מחכים.`):'המשימה הושלמה לפי סדר התחנות והמסלול שבהודעה.'}</p><div class="results"><div><strong dir="ltr">${time(mode==='won'?sim.totalTime:sim.elapsed)}</strong><span>זמן תנועה</span></div><div><strong>${mode==='won'?sim.totals.recoveries:sim.recoveries}</strong><span>התאוששויות</span></div><div><strong>${(mode==='won'?sim.totals.assisted:sim.assisted)?'עם עזרה':'ללא עזרה'}</strong><span>קריאת המשימה</span></div></div><p class="flow-result" dir="ltr">♫ ${mode==='won'?sim.totals.notes:sim.notes.size} signal notes · best flow ${mode==='won'?sim.totals.bestFlow:sim.bestFlow}</p><p class="route-trace" dir="ltr" lang="en">${trace||siteName(sim.job.start)}</p><p class="english small" dir="ltr" lang="en">${activeBrief()}</p><button class="primary" data-action="${mode==='won'?'levels':'next'}">${mode==='won'?'למפת השלבים':sim.level===sim.jobs.length-1?'סיכום המסע':'לשלב הבא'} <span>←</span></button><button class="subtle" data-action="levels">מפת ${sim.jobs.length} השלבים</button><button class="subtle" data-action="restart">שוב, בשביל הנחיתה המושלמת</button></div>`;
  }
  $('overlay').innerHTML=html;
  for(const button of $('overlay').querySelectorAll<HTMLButtonElement>('[data-action]'))button.onclick=()=>{
    const a=button.dataset.action;audio.unlock();
    if(a==='start')start();if(a==='resume')resume();if(a==='restart')restart();if(a==='campaign')campaign();
    if(a==='levels')showLevels();if(a==='continue-campaign')selectLevel(recommendedLevel(progressStore.value,sim.jobs.length));
    if(a==='next'){sim.next();progressStore.select(sim.mode==='planning'?sim.level+1:recommendedLevel(progressStore.value,sim.jobs.length));yaw=sim.yaw;world.snapCamera();clearInput();}
    if(a==='help'){if(sim.mode==='planning'){sim.returnMode='planning';sim.mode='help';}else sim.mode='help';}
    if(a==='vocabulary')sim.vocabulary();if(a==='hint'){sim.hint();lastMode=null;}
    if(a==='audio'){sim.returnMode=sim.mode==='planning'?'planning':'play';sim.mode='audio';clearInput();}
    if(a==='mute'){audio.muted=!audio.muted;localStorage.setItem('rr-muted',String(audio.muted));lastMode=null;}updateUI();
  };
  for(const button of $('overlay').querySelectorAll<HTMLButtonElement>('[data-level]'))button.onclick=()=>selectLevel(Number(button.dataset.level));
  for(const slider of $('overlay').querySelectorAll<HTMLInputElement>('[data-volume]'))slider.oninput=()=>{const channel=slider.dataset.volume as 'music'|'effects'|'wind';audio.setVolume(channel,Number(slider.value)/100);localStorage.setItem(`rr-${channel}-volume`,String(Number(slider.value)/100));};
}
function updateUI(){
  if(lastMode!==sim.mode){lastMode=sim.mode;needsFrame=true;updateOverlay();storage();}
  $('active-brief').textContent=activeBrief();$('job-number').textContent=`${String(sim.level+1).padStart(2,'0')} / ${sim.jobs.length}`;
  $('task-title').textContent=sim.job.title;$('progress').innerHTML=`<bdi dir="ltr">${sim.evidence.progress} / ${sim.job.order.length}</bdi> ממסרים`;
  $('flow-score').textContent=`♫ ${sim.notes.size}  ·  FLOW ${sim.flow}`;$('burst-state').textContent=sim.windLift?'רוח עולה ↑':sim.dashCharge?'Shift · פרץ מוכן':'נחיתה מחדשת פרץ';
  $('stamina').style.transform=`scaleX(${sim.stamina})`;$('flight-mode').textContent=sim.gliding?'דאייה':sim.onGround?'על הגג':'באוויר';$('timer').textContent=time(sim.elapsed);
  const compass=['N','NE','E','SE','S','SW','W','NW'];const angle=((yaw%(Math.PI*2))+Math.PI*2)%(Math.PI*2);$('compass').textContent=`${compass[Math.round(angle/(Math.PI/4))%8]} · ${Math.round(angle*180/Math.PI)}°`;
  $('feedback').textContent=sim.toastTime>0?sim.toast:'';$('feedback').classList.toggle('visible',sim.toastTime>0);
  $('interact').hidden=!sim.nearest||sim.mode!=='play';if(sim.nearest)$('interact').innerHTML=`<kbd>E</kbd> ${{tune:'שידור',collect:'איסוף',inspect:'בדיקה',deliver:'מסירה'}[sim.action]} · <bdi dir="ltr">${siteName(sim.nearest)}</bdi>`;$('controls').hidden=sim.elapsed>20||sim.mode!=='play';$('asset-status').hidden=world.rigLoaded;
  if(uiFrame++%90===0)storage();
}
function input():Input{if(keys.has('KeyJ'))yaw-=1/60*1.7;if(keys.has('KeyL'))yaw+=1/60*1.7;return {x:Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),forward:Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),jump:keys.has('Space'),glide:keys.has('KeyG'),dash:keys.has('ShiftLeft')||keys.has('ShiftRight'),interact:keys.has('KeyE'),yaw};}
function step(dt:number){sim.update(dt,input());audio.flight(sim.mode==='play'&&sim.gliding,sim.mode!=='play');for(const e of sim.events){if(e.sequence<=audioSequence)continue;audioSequence=e.sequence;if(e.type==='air-burst')audio.tone('burst');if(e.type==='signal-note')audio.tone('note');if(e.type==='jump'||e.type==='vault')audio.tone('jump');if(e.type==='awning-bounce')audio.tone('bounce');if(e.type==='landing')audio.tone('land');if(e.type==='correct-tune')audio.tone('tune');if(e.type==='complete'){audio.tone('success');hostSession.completeLevel(e.job,sim.elapsed*1000);progressStore.complete(e.job,{durationMs:sim.elapsed*1000,recoveries:sim.recoveries,mistakes:sim.evidence.mistakes,assisted:sim.assisted,notes:sim.notes.size,bestFlow:sim.bestFlow});lastMode=null;}if(e.type==='recovery'){audio.tone('recover');clearInput();}}updateUI();}
let previous=performance.now(),accumulator=0,lastCanvasDraw=0;let manualStepping=false;
let manualDrawTimer:number|undefined,lastManualDraw=0;
function manualDraw(){if(manualDrawTimer!==undefined)window.clearTimeout(manualDrawTimer);manualDrawTimer=undefined;world.render(sim,0,reduced);lastManualDraw=performance.now();}
function requestManualDraw(){const delay=50-(performance.now()-lastManualDraw);if(delay<=0)manualDraw();else if(manualDrawTimer===undefined)manualDrawTimer=window.setTimeout(manualDraw,delay);}

function frame(now:number){const elapsed=Math.max(0,(now-previous)/1000),dt=Math.min(.05,elapsed);previous=now;if(!manualStepping){if(sim.mode==='play'){world.recordFrame(elapsed);accumulator+=dt;while(accumulator>=1/60){step(1/60);accumulator-=1/60;}world.render(sim,dt,reduced);lastCanvasDraw=now;needsFrame=false;}else{accumulator=0;audio.flight(false,true);if(needsFrame||now-lastCanvasDraw>250){updateUI();world.render(sim,dt,reduced);lastCanvasDraw=now;needsFrame=false;}}}requestAnimationFrame(frame);}
Object.assign(window,{render_game_to_text:()=>{const base=JSON.parse(sim.text());base.campaign={levelCount:sim.jobs.length,completedLevels:Object.keys(progressStore.value.levels).map(Number),recommendedLevel:recommendedLevel(progressStore.value,sim.jobs.length),movementSeconds:sim.totalTime,...sim.totals};base.art=world.artState();base.camera={yaw,pitch:world.cameraPitch};base.audio=audio.diagnostics();base.assets=world.rigLoaded?'Local Tripo courier loaded':'Tripo rig/download pending; explicit development capsule';base.performance={fps:manualStepping?null:Math.round(world.fps),clock:manualStepping?'deterministic':'realtime',renderer:world.rendererName,drawCalls:world.renderer.info.render.calls,triangles:world.renderer.info.render.triangles};return JSON.stringify(base);},advanceTime:(ms:number,draw=true)=>{manualStepping=true;const frames=Math.max(1,Math.round(ms/(1000/60)));for(let i=0;i<frames;i++){step(1/60);world.render(sim,1/60,reduced,false);}if(draw)requestManualDraw();},drawGame:manualDraw,resumeRealtime:()=>{if(manualDrawTimer!==undefined)window.clearTimeout(manualDrawTimer);manualDrawTimer=undefined;manualStepping=false;previous=performance.now();accumulator=0;}});
updateUI();world.render(sim,0,reduced);requestAnimationFrame(()=>hostSession.markReady());requestAnimationFrame(frame);
