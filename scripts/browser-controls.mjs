import {chromium} from 'playwright';
import fs from 'node:fs/promises';

const out=process.env.RR_CONTROLS_OUT||'docs/gameplay-captures';
const url=process.env.RR_URL||'http://localhost:5231';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:process.env.RR_GPU==='metal'?['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
const page=await context.newPage();
page.setDefaultTimeout(120000);
const errors=[],checks={};
page.on('pageerror',e=>{errors.push(String(e));console.error(String(e));});
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const cdp=await context.newCDPSession(page);
let touchId=1;
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const advance=frames=>page.evaluate(ms=>{window.advanceTime(ms,false);return JSON.parse(window.render_game_to_text());},frames*1000/60);
const center=async selector=>{
  const b=await page.locator(selector).boundingBox();
  if(!b)throw Error('No touch target '+selector);
  return{x:b.x+b.width/2,y:b.y+b.height/2,id:touchId++};
};
async function tap(selector){const p=await center(selector);await page.touchscreen.tap(p.x,p.y);}
async function hold(selectors,frames){
  const pts=await Promise.all(selectors.map(center));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts});
  const s=await advance(frames);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  return s;
}
async function shot(name){
  await page.evaluate(()=>window.drawGame());
  await page.screenshot({path:`${out}/${name}.png`,animations:'disabled'});
  await fs.writeFile(`${out}/${name}.json`,JSON.stringify(await state(),null,2));
  console.log('Saved',name);
}
function check(ok,msg){if(!ok)throw Error(msg);}
async function ready(){
  await page.waitForSelector('#start-btn');
  await page.waitForFunction(()=>typeof window.render_game_to_text==='function');
  const s=await advance(1);
  check(s.art?.courier&&s.art?.glider,'Required local courier/glider did not load: '+JSON.stringify(s.art));
  check(!s.art?.error,'Asset error: '+s.art.error);
  return s;
}
async function musicReady(){
  await page.waitForFunction(()=>{
    if(typeof window.render_game_to_text!=='function')return false;
    const a=JSON.parse(window.render_game_to_text()).audio;
    return a?.ready||a?.error;
  },null,{timeout:60000});
  const a=(await state()).audio;
  check(a.ready&&!a.error&&a.context==='running','Music was not decoded/running after a gesture: '+JSON.stringify(a));
  return a;
}
async function setSlider(channel,ratio){
  const slider=page.locator(`[data-volume="${channel}"]`),box=await slider.boundingBox();
  check(box,'Missing '+channel+' volume slider');
  const direction=await slider.evaluate(e=>getComputedStyle(e).direction);
  const fraction=direction==='rtl'?1-ratio:ratio;
  await page.touchscreen.tap(box.x+8+(box.width-16)*fraction,box.y+box.height/2);
  const value=await slider.evaluate(e=>Number(e.value)/100);
  check(Math.abs(value-ratio)<.06,channel+' slider did not respond to touch: '+value);
  check(Math.abs((await state()).audio[`${channel}Volume`]-value)<1e-8,channel+' slider did not update the audio mix');
  return value;
}

try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
  await ready();console.log('Mobile ready');await shot('13-mobile-planning');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal mobile overflow');

  // The panel is exercised through ordinary touch and keyboard controls, never direct value writes.
  const planning=await state();await tap('[data-action="audio"]');
  check((await state()).mode==='audio','Audio settings did not open');
  await musicReady();
  const savedVolumes={music:await setSlider('music',.37),effects:await setSlider('effects',.58),wind:await setSlider('wind',.21)};
  const musicSlider=page.locator('[data-volume="music"]');
  await tap('[data-volume="music"]');
  for(let i=0;i<20&&!(await musicSlider.evaluate(e=>document.activeElement===e));i++)await page.keyboard.press('Tab');
  check(await musicSlider.evaluate(e=>document.activeElement===e),'Keyboard navigation could not focus the music range');
  const keyboardBefore=await musicSlider.evaluate(e=>Number(e.value));
  await page.keyboard.press('ArrowUp');
  const keyboardAfter=await musicSlider.evaluate(e=>Number(e.value));
  check(keyboardAfter===keyboardBefore+1,'Focused range ArrowUp was intercepted by game movement');
  savedVolumes.music=keyboardAfter/100;
  await advance(600);
  check((await state()).time===planning.time,'Audio settings spent medal time');
  await tap('[data-action="mute"]');check((await state()).audio.muted,'Panel mute did not apply');
  check(await page.evaluate(()=>localStorage.getItem('rr-muted')==='true'),'Panel mute did not persist');
  await tap('[data-action="mute"]');check(!(await state()).audio.muted,'Panel unmute did not apply');
  const stored=await page.evaluate(()=>Object.fromEntries(['music','effects','wind'].map(c=>[c,Number(localStorage.getItem(`rr-${c}-volume`))])));
  for(const channel of Object.keys(savedVolumes))check(Math.abs(stored[channel]-savedVolumes[channel])<1e-8,channel+' volume was not saved');
  await shot('18-mobile-audio');
  checks.audio={sliders:savedVolumes,keyboardRange:true,decodedMusic:await musicReady(),readingPaused:true};

  await page.reload({waitUntil:'domcontentloaded',timeout:120000});
  const reloaded=await ready();
  for(const channel of Object.keys(savedVolumes))check(Math.abs(reloaded.audio[`${channel}Volume`]-savedVolumes[channel])<1e-8,channel+' volume did not survive reload');
  check(!reloaded.audio.muted,'Unmuted preference did not survive reload');
  checks.audio.persistence=true;
  await tap('#start-btn');await advance(1);await musicReady();

  await hold(['.dpad .right'],22);await hold(['.dpad .up'],60);
  const flight=await hold(['.dpad .up','#touch-jump'],40);
  check(flight.player.gliding,'Touch hold failed to open glider');await shot('14-mobile-glide');
  await hold(['.dpad .up','#touch-jump'],22);await advance(130);await hold(['.dpad .up'],24);await advance(30);
  const near=await state();check(near.nearestRelay==='greenhouse','Touch route failed to reach greenhouse: '+JSON.stringify(near));
  await hold(['#interact'],1);await advance(1);check((await state()).mode==='success','Touch tune failed');await shot('15-mobile-success');
  checks.touchTraversal='physical movement, held glide, reachable relay and successful tuning';

  await page.click('[data-action="restart"]',{force:true});await page.click('[data-action="hint"]',{force:true});await advance(600);
  check((await state()).assisted&&(await state()).time===0,'Hint reading was not paused/recorded');
  await page.click('#start-btn',{force:true});await advance(1);
  await page.click('#pause',{force:true});const paused=await state();await advance(600);check((await state()).time===paused.time,'Pause spent medal time');
  await page.click('[data-action="help"]',{force:true});await advance(600);check((await state()).mode==='help'&&(await state()).time===paused.time,'Help reading spent time');
  await page.click('[data-action="resume"]',{force:true});await page.click('#pause',{force:true});await page.click('[data-action="vocabulary"]',{force:true});await advance(1);
  check((await state()).mode==='vocabulary','Vocabulary did not open from pause');await shot('16-mobile-vocabulary');
  await page.click('[data-action="resume"]',{force:true});await advance(1);

  // Mouse and touch must agree: dragging right increases world yaw; dragging down changes pitch.
  const beforeMouse=await state();
  await page.mouse.move(210,440);await page.mouse.down();await page.mouse.move(280,440,{steps:6});await page.mouse.up();await advance(1);
  const rightMouse=await state();
  check(rightMouse.camera.yaw-beforeMouse.camera.yaw>.2,'Mouse drag-right did not increase yaw');
  await page.mouse.move(280,440);await page.mouse.down();await page.mouse.move(280,500,{steps:6});await page.mouse.up();await advance(1);
  const downMouse=await state();
  check(downMouse.camera.pitch-rightMouse.camera.pitch>.1,'Mouse vertical drag did not change camera pitch');
  check(JSON.stringify(downMouse.route)===JSON.stringify(beforeMouse.route),'Mouse camera changed semantic evidence');
  const p={x:210,y:440,id:touchId++};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,x:270}]});await advance(1);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const afterTouch=await state();
  check(afterTouch.camera.yaw-downMouse.camera.yaw>.15,'Touch drag-right did not increase yaw');
  check(JSON.stringify(afterTouch.route)===JSON.stringify(beforeMouse.route),'Touch camera changed semantic evidence');
  await page.keyboard.press('c');await advance(1);const resetCamera=await state();
  check(Math.abs(resetCamera.camera.yaw)<1e-8&&Math.abs(resetCamera.camera.pitch-.245)<1e-8,'C did not reset camera yaw/pitch');
  checks.camera={mouseBefore:beforeMouse.camera,mouseRight:rightMouse.camera,mouseDown:downMouse.camera,touchRight:afterTouch.camera,reset:resetCamera.camera,routeUnchanged:true};

  await page.click('#sound',{force:true});await page.click('#motion',{force:true});
  check(await page.locator('#sound').evaluate(e=>e.classList.contains('selected')),'Mute state missing');
  check(await page.locator('#motion').evaluate(e=>e.classList.contains('selected')),'Reduced motion missing');
  await page.click('#fullscreen',{force:true});await page.waitForTimeout(100);check(await page.evaluate(()=>!!document.fullscreenElement),'Fullscreen did not enter');await page.click('#fullscreen',{force:true});
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await advance(1);check((await state()).mode==='paused','Focus loss did not pause');await shot('17-mobile-paused');
  await page.click('[data-action="restart"]',{force:true});await advance(1);check((await state()).mode==='planning','Restart did not return to planning');
  checks.other='pause, help, vocabulary, hint record, restart, mute, reduced motion, fullscreen, focus loss';
  check(errors.length===0,errors.join('\n'));
  await fs.writeFile(`${out}/controls-results.json`,JSON.stringify({passed:true,url,checks,errors},null,2));
  console.log(JSON.stringify({passed:true,checks,errors}));
}catch(error){
  const lastState=await state().catch(()=>null);
  await fs.writeFile(`${out}/controls-results.json`,JSON.stringify({passed:false,url,message:String(error),checks,lastState,errors},null,2));
  await page.screenshot({path:`${out}/controls-failure.png`,animations:'disabled',timeout:15000}).catch(()=>{});
  throw error;
}finally{await browser.close();}
