import './style.css';
import {Simulation,type Mode,type Input} from './sim';
import {World} from './scene';
import {siteName} from './content';
import {RadioAudio} from './audio';
import {COURIER_URL} from './asset-config';

const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<canvas id="game" aria-label="שכונת הגגות — מרחב משחק תלת ממדי" tabindex="0"></canvas>
<div class="vignette"></div>
<header class="hud"><div class="brand" dir="ltr">ROOFTOP<span>RADIO</span><i>98.7 FM</i></div><div class="toolbar"><button id="pause" title="השהיה / קריאה (P)">Ⅱ</button><button id="vocab" title="מילון — הזמן נעצר">א / A</button><button id="sound" title="צליל">♪</button><button id="motion" title="הפחתת תנועה">≈</button><button id="fullscreen" title="מסך מלא (F)">⛶</button></div></header>
<section class="radio" id="radio"><span class="radio-icon" aria-hidden="true">▥</span><div><small dir="ltr">RADIO JOB <span id="job-number">01 / 05</span></small><p lang="en" dir="ltr" id="active-brief"></p></div><button id="read" title="הודעה מלאה — הזמן נעצר">קריאה</button></section>
<div id="status" class="status"><span id="task-title"></span><span id="progress"></span></div>
<div id="compass" class="compass" lang="en" dir="ltr"></div>
<div class="flight"><span>דאון</span><div><i id="stamina"></i></div><b id="flight-mode">על הגג</b></div>
<div class="time" id="timer" dir="ltr">00:00</div>
<div id="feedback" class="feedback" role="status"></div>
<button id="interact" class="interact" hidden><kbd>E</kbd> כיוון ממסר</button>
<div id="controls" class="controls">תנועה <b dir="ltr">WASD / ↑↓←→</b> · קפיצה ודאייה <b>רווח</b> · מצלמה <b>גרירה</b></div>
<div id="asset-status" class="asset-status">גרסת פיתוח · דמות Tripo ממתינה לריג ולהורדה</div>
<div class="touch" id="touch"><div class="dpad"><button data-key="ArrowUp" class="up" aria-label="קדימה">↑</button><button data-key="ArrowLeft" class="left" aria-label="שמאלה">←</button><button data-key="ArrowDown" class="down" aria-label="אחורה">↓</button><button data-key="ArrowRight" class="right" aria-label="ימינה">→</button></div><div class="touch-actions"><button data-key="Space" id="touch-jump">קפיצה<br><small>החזיקו לדאייה</small></button></div></div>
<div id="overlay" class="overlay"></div><div id="load-error" class="error" hidden></div>`;
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=$<HTMLCanvasElement>('game');
const sim=new Simulation();const audio=new RadioAudio();let world:World;
let reduced=localStorage.getItem('rr-reduced')==='true'||matchMedia('(prefers-reduced-motion: reduce)').matches;
audio.muted=localStorage.getItem('rr-muted')==='true';
let yaw=sim.yaw;const keys=new Set<string>();let drag:{id:number;x:number}|null=null;let lastMode:Mode|null=null;let audioIndex=0;let uiFrame=0;
try{await document.fonts.load('500 20px Rubik');world=new World(canvas);if(COURIER_URL)await world.loadCourier(COURIER_URL);}catch(e){$('load-error').hidden=false;$('load-error').textContent='לא הצלחנו לפתוח WebGL. נסו דפדפן עם האצת חומרה. '+String(e);throw e;}
function clearInput(){keys.clear();drag=null;}
function storage(){try{localStorage.setItem('rooftop-radio-events',JSON.stringify(sim.events));}catch{/* Local-only telemetry is optional. */}}
function time(t:number){return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
function start(){audio.unlock();sim.start();clearInput();canvas.focus();updateUI();}
function pause(){sim.pause();clearInput();updateUI();}
function resume(){sim.resume();clearInput();canvas.focus();updateUI();}
function restart(){sim.restart();yaw=sim.yaw;world.snapCamera();clearInput();lastMode=null;updateUI();}
function campaign(){sim.level=0;sim.totalTime=0;sim.totals={recoveries:0,mistakes:0,assisted:false};sim.variant=1-sim.variant;sim.resetJob();yaw=sim.yaw;world.snapCamera();clearInput();lastMode=null;updateUI();}
function showHelp(){sim.pause('help');clearInput();updateUI();}
function fullscreen(){if(document.fullscreenElement)void document.exitFullscreen();else void document.documentElement.requestFullscreen().catch(()=>{});}
$('pause').onclick=()=>sim.mode==='play'?pause():resume();$('read').onclick=pause;$('vocab').onclick=()=>{sim.vocabulary();clearInput();updateUI();};
$('sound').onclick=()=>{audio.unlock();audio.muted=!audio.muted;localStorage.setItem('rr-muted',String(audio.muted));lastMode=null;updateUI();};
$('motion').onclick=()=>{reduced=!reduced;localStorage.setItem('rr-reduced',String(reduced));lastMode=null;updateUI();};$('fullscreen').onclick=fullscreen;
window.addEventListener('resize',()=>world.resize());document.addEventListener('fullscreenchange',()=>world.resize());
window.addEventListener('blur',()=>{if(sim.mode==='play')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&sim.mode==='play')pause();});
window.addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyF','KeyP'].includes(e.code))e.preventDefault();
  if(e.repeat)return;
  if(e.code==='KeyP'||e.code==='Escape'){if(sim.mode==='play')pause();else if(['paused','vocabulary','help'].includes(sim.mode))resume();return;}
  if(e.code==='KeyF'){fullscreen();return;}if(e.code==='KeyM')$('sound').click();if(e.code==='KeyH'){showHelp();return;}
  if(e.code==='Enter'&&sim.mode==='planning'){start();return;}if(e.code==='KeyC'){yaw=sim.job.facing==='south'?Math.PI:0;world.snapCamera();}
  keys.add(e.code);
});window.addEventListener('keyup',e=>keys.delete(e.code));
canvas.addEventListener('pointerdown',e=>{if(sim.mode!=='play')return;drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;yaw-=(e.clientX-drag.x)*.006;drag.x=e.clientX;});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-key]')){
  b.onpointerdown=e=>{e.preventDefault();audio.unlock();keys.add(b.dataset.key!);b.classList.add('held');b.setPointerCapture(e.pointerId);};
  const release=()=>{keys.delete(b.dataset.key!);b.classList.remove('held');};b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;
}
$('interact').onpointerdown=e=>{e.preventDefault();audio.unlock();keys.add('KeyE');};$('interact').onpointerup=()=>keys.delete('KeyE');$('interact').onpointercancel=()=>keys.delete('KeyE');
function activeBrief(){const p=sim.evidence.progress;switch(sim.level){case 1:return p===0?'First, tune the relay beside the greenhouse.':'Go past the greenhouse. Then tune the relay at the bell tower.';case 3:return 'Take the wider awning route to the receiver opposite the café.';case 4:return p===0?'From the water tower, face the clock. First, tune the bell-tower relay.':p===1?'Next, tune the greenhouse relay.':'Go past the greenhouse, turn right at the bell tower and tune the receiver opposite the café.';default:return sim.job.english;}}
const close=`<button class="primary" data-action="resume">חזרה לגגות <span>←</span></button>`;
function updateOverlay(){
  const mode=sim.mode;document.body.dataset.mode=mode;document.body.classList.toggle('reduced',reduced);
  $('sound').classList.toggle('selected',audio.muted);$('sound').setAttribute('aria-label',audio.muted?'הפעלת צליל':'השתקת צליל');$('motion').classList.toggle('selected',reduced);
  $('overlay').hidden=mode==='play';
  if(mode==='play')return;
  const heading=`<div class="eyebrow"><span lang="en" dir="ltr">${String(sim.level+1).padStart(2,'0')} / 05</span> · הזמן נעצר לקריאה</div>`;
  const briefing=`<p class="english" lang="en" dir="ltr">${sim.job.english}</p>`;
  const hint=sim.hintOpen?`<p class="hint">${sim.job.hint}</p>`:'';
  const utilities=`<div class="text-actions"><button data-action="vocabulary">מילון</button><button data-action="help">איך משחקים</button>${sim.job.hint?'<button data-action="hint">רמז למסלול</button>':'<span>ללא רמז פתרון במשימת ההעברה</span>'}</div>${hint}`;
  let html='';
  if(mode==='planning')html=`<div class="sheet planning">${heading}<h1>${sim.job.title}</h1>${sim.level===0?'<p class="intro">קפצו. תפסו את הרוח. העבירו את האות.</p>':''}${sim.job.transfer?'<p class="notice" lang="en" dir="ltr">The café has moved to the west roof.</p>':''}${briefing}<div class="launch-row"><button class="primary" id="start-btn" data-action="start">יוצאים לגגות <span>←</span></button><small>קפיצה: רווח<br>החזיקו באוויר לפתיחת דאון</small></div>${utilities}<div class="keyline"><span><b dir="ltr">WASD / ↑↓←→</b> תנועה</span><span><b>E</b> ממסר</span><span>גרירה לסיבוב מצלמה</span></div></div>`;
  if(mode==='paused')html=`<div class="sheet">${heading}<h1>ההודעה בקצב שלכם</h1>${briefing}${close}${utilities}<button class="subtle" data-action="restart">התחלת המשימה מחדש</button></div>`;
  if(mode==='vocabulary')html=`<div class="sheet vocabulary">${heading}<h1>מילים לדרך</h1><p>אפשר לקרוא ולתרגם בלי לאבד זמן. שימוש במילון נרשם בנפרד מהתנועה.</p><dl>${sim.job.vocabulary.map(([en,he])=>`<div><dt lang="en" dir="ltr">${en}</dt><dd>${he}</dd></div>`).join('')}</dl>${close}</div>`;
  if(mode==='help')html=`<div class="sheet">${heading}<h1>איך תופסים את הרוח</h1><ul class="help-list"><li><b>תנועה:</b> <bdi>WASD</bdi> או חצים. גררו על הנוף כדי לסובב מצלמה; גם <bdi>J / L</bdi>. <bdi>C</bdi> מחזיר את כיוון המצלמה.</li><li><b>קפיצה ודאייה:</b> רווח לקפיצה; החזיקו באוויר לפתיחת הדאון. <bdi>G</bdi> גם פותח דאון. הסוכך מתחת למעבר הראשון מקפיץ.</li><li><b>ממסר:</b> התקרבו לרדיו ולחצו <bdi>E</bdi>. כל הממסרים פועלים — קראו כדי לדעת איזה דרוש.</li><li><b>נפילה:</b> משטח התאוששות מחזיר לגג האחרון. אפשר לתקן בחירת ממסר בלי לאתחל.</li><li><b>קריאה:</b> <bdi>P</bdi> להשהיה, מילון בכל עת. הזמן נעצר. מהירות התנועה ומידת העזרה מוצגות בנפרד.</li><li><b>מגע:</b> חצי תנועה משמאל, קפיצה מימין. החזיקו לדאייה וגררו על הנוף למצלמה.</li></ul>${close}<button class="subtle" data-action="restart">התחלת המשימה מחדש</button></div>`;
  if(mode==='success'||mode==='won'){
    const trace=sim.evidence.visits.map(id=>siteName(id,sim.job.transfer)).join(' → ');
    html=`<div class="sheet completion"><div class="eyebrow" lang="en" dir="ltr">${mode==='won'?'DISTRICT ON AIR':'SIGNAL RECEIVED'}</div><div class="signal-glyph">◉</div><h1>${mode==='won'?'כל השכונה משדרת':'האות הגיע!'}</h1><p>${mode==='won'?'חמש משימות, כמה כיווני רוח, ושכונה מחוברת.':'הממסרים כוונו בסדר המתאים להודעה.'}</p><div class="results"><div><strong dir="ltr">${time(mode==='won'?sim.totalTime:sim.elapsed)}</strong><span>זמן תנועה</span></div><div><strong>${mode==='won'?sim.totals.recoveries:sim.recoveries}</strong><span>התאוששויות</span></div><div><strong>${(mode==='won'?sim.totals.assisted:sim.assisted)?'עם עזרה':'ללא עזרה'}</strong><span>קריאת המשימה</span></div></div><p class="route-trace" dir="ltr" lang="en">${trace||siteName(sim.job.start,sim.job.transfer)}</p><p class="english small" dir="ltr" lang="en">${activeBrief()}</p><button class="primary" data-action="${mode==='won'?'campaign':'next'}">${mode==='won'?'סיבוב חדש':'לתדר הבא'} <span>←</span></button><button class="subtle" data-action="restart">שוב, בשביל הנחיתה המושלמת</button></div>`;
  }
  $('overlay').innerHTML=html;
  for(const button of $('overlay').querySelectorAll<HTMLButtonElement>('[data-action]'))button.onclick=()=>{
    const a=button.dataset.action;audio.unlock();
    if(a==='start')start();if(a==='resume')resume();if(a==='restart')restart();if(a==='campaign')campaign();
    if(a==='next'){sim.next();yaw=sim.yaw;world.snapCamera();clearInput();}
    if(a==='help'){if(sim.mode==='planning'){sim.returnMode='planning';sim.mode='help';}else sim.mode='help';}
    if(a==='vocabulary')sim.vocabulary();if(a==='hint'){sim.hint();lastMode=null;}updateUI();
  };
}
function updateUI(){
  if(lastMode!==sim.mode){lastMode=sim.mode;updateOverlay();storage();}
  $('active-brief').textContent=activeBrief();$('job-number').textContent=`${String(sim.level+1).padStart(2,'0')} / 05`;
  $('task-title').textContent=sim.job.title;$('progress').innerHTML=`<bdi dir="ltr">${sim.evidence.progress} / ${sim.job.order.length}</bdi> ממסרים`;
  $('stamina').style.transform=`scaleX(${sim.stamina})`;$('flight-mode').textContent=sim.gliding?'דאייה':sim.onGround?'על הגג':'באוויר';$('timer').textContent=time(sim.elapsed);
  const compass=['N','NE','E','SE','S','SW','W','NW'];const angle=((yaw%(Math.PI*2))+Math.PI*2)%(Math.PI*2);$('compass').textContent=`${compass[Math.round(angle/(Math.PI/4))%8]} · ${Math.round(angle*180/Math.PI)}°`;
  $('feedback').textContent=sim.toastTime>0?sim.toast:'';$('feedback').classList.toggle('visible',sim.toastTime>0);
  $('interact').hidden=!sim.nearest||sim.mode!=='play';$('controls').hidden=sim.elapsed>20||sim.mode!=='play';$('asset-status').hidden=world.rigLoaded;
  if(uiFrame++%90===0)storage();
}
function input():Input{if(keys.has('KeyJ'))yaw-=1/60*1.7;if(keys.has('KeyL'))yaw+=1/60*1.7;return {x:Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),forward:Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),jump:keys.has('Space'),glide:keys.has('KeyG'),interact:keys.has('KeyE'),yaw};}
function step(dt:number){sim.update(dt,input());audio.flight(sim.mode==='play'&&sim.gliding);for(;audioIndex<sim.events.length;audioIndex++){const e=sim.events[audioIndex];if(e.type==='jump')audio.tone('jump');if(e.type==='correct-tune')audio.tone('tune');if(e.type==='complete')audio.tone('success');if(e.type==='recovery'){audio.tone('recover');clearInput();}}updateUI();}
let previous=performance.now(),accumulator=0;let manualStepping=false;
let manualDrawTimer:number|undefined,lastManualDraw=0;
function manualDraw(){if(manualDrawTimer!==undefined)window.clearTimeout(manualDrawTimer);manualDrawTimer=undefined;world.render(sim,0,reduced);lastManualDraw=performance.now();}
function requestManualDraw(){const delay=50-(performance.now()-lastManualDraw);if(delay<=0)manualDraw();else if(manualDrawTimer===undefined)manualDrawTimer=window.setTimeout(manualDraw,delay);}

function frame(now:number){const dt=Math.max(0,Math.min(.05,(now-previous)/1000));previous=now;if(!manualStepping){accumulator+=dt;while(accumulator>=1/60){step(1/60);accumulator-=1/60;}world.render(sim,dt,reduced);}requestAnimationFrame(frame);}
Object.assign(window,{render_game_to_text:()=>{const base=JSON.parse(sim.text());base.campaign={movementSeconds:sim.totalTime,...sim.totals};base.assets=world.rigLoaded?'Local Tripo courier loaded':'Tripo rig/download pending; explicit development capsule';base.performance={fps:manualStepping?null:Math.round(world.fps),clock:manualStepping?'deterministic':'realtime',drawCalls:world.renderer.info.render.calls,triangles:world.renderer.info.render.triangles};return JSON.stringify(base);},advanceTime:(ms:number,draw=true)=>{manualStepping=true;const frames=Math.max(1,Math.round(ms/(1000/60)));for(let i=0;i<frames;i++){step(1/60);world.render(sim,1/60,reduced,false);}if(draw)requestManualDraw();},drawGame:manualDraw,resumeRealtime:()=>{if(manualDrawTimer!==undefined)window.clearTimeout(manualDrawTimer);manualDrawTimer=undefined;manualStepping=false;previous=performance.now();accumulator=0;}});
updateUI();requestAnimationFrame(frame);
