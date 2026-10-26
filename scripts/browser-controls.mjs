import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const out='docs/gameplay-captures';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
const page=await context.newPage();page.setDefaultTimeout(120000);const errors=[];page.on('pageerror',e=>{errors.push(String(e));console.error(String(e));});page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const cdp=await context.newCDPSession(page);let touchId=1;
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const advance=frames=>page.evaluate(ms=>{window.advanceTime(ms,false);return JSON.parse(window.render_game_to_text());},frames*1000/60);
const center=async selector=>{const b=await page.locator(selector).boundingBox();if(!b)throw Error('No touch target '+selector);return{x:b.x+b.width/2,y:b.y+b.height/2,id:touchId++};};
async function hold(selectors,frames){const pts=await Promise.all(selectors.map(center));await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts});const s=await advance(frames);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});return s;}
async function shot(name){await page.evaluate(()=>window.drawGame());await page.screenshot({path:`${out}/${name}.png`,animations:"disabled"});await fs.writeFile(`${out}/${name}.json`,JSON.stringify(await state(),null,2));console.log('Saved',name);}
function check(ok,msg){if(!ok)throw Error(msg);}
try{
  await page.goto('http://localhost:4231',{waitUntil:'domcontentloaded',timeout:120000});await page.waitForSelector('#start-btn');await advance(1);console.log('Mobile ready');await shot('13-mobile-planning');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal mobile overflow');
  await page.touchscreen.tap(...Object.values(await center('#start-btn')).slice(0,2));await advance(1);
  await hold(['.dpad .right'],22);await hold(['.dpad .up'],60);const flight=await hold(['.dpad .up','#touch-jump'],40);check(flight.player.gliding,'Touch hold failed to open glider');await shot('14-mobile-glide');
  await hold(['.dpad .up','#touch-jump'],22);await advance(130);await hold(['.dpad .up'],24);await advance(30);
  const near=await state();check(near.nearestRelay==='greenhouse','Touch route failed to reach greenhouse: '+JSON.stringify(near));await hold(['#interact'],1);await advance(1);check((await state()).mode==='success','Touch tune failed');await shot('15-mobile-success');
  await page.click('[data-action="restart"]',{force:true});await page.click('[data-action="hint"]',{force:true});await advance(600);check((await state()).assisted&&(await state()).time===0,'Hint reading was not paused/recorded');await page.click('#start-btn',{force:true});await advance(1);
  await page.click('#pause',{force:true});const paused=await state();await advance(600);check((await state()).time===paused.time,'Pause spent medal time');
  await page.click('[data-action="help"]',{force:true});await advance(600);check((await state()).mode==='help'&&(await state()).time===paused.time,'Help reading spent time');await page.click('[data-action="resume"]',{force:true});await page.click('#pause',{force:true});await page.click('[data-action="vocabulary"]',{force:true});await advance(1);check((await state()).mode==='vocabulary','Vocabulary did not open from pause');await shot('16-mobile-vocabulary');await page.click('[data-action="resume"]',{force:true});await advance(1);
  const before=await state();const p={x:220,y:450,id:touchId++};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...p,x:280}]});await advance(1);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});const after=await state();check(Math.abs(after.player.facingYaw-before.player.facingYaw)>.1,'Touch camera drag did not turn');check(JSON.stringify(after.route)===JSON.stringify(before.route),'Camera changed semantic evidence');
  await page.click('#sound',{force:true});await page.click('#motion',{force:true});check(await page.locator('#sound').evaluate(e=>e.classList.contains('selected')),'Mute state missing');check(await page.locator('#motion').evaluate(e=>e.classList.contains('selected')),'Reduced motion missing');
  await page.click('#fullscreen',{force:true});await page.waitForTimeout(100);check(await page.evaluate(()=>!!document.fullscreenElement),'Fullscreen did not enter');await page.click('#fullscreen',{force:true});
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await advance(1);check((await state()).mode==='paused','Focus loss did not pause');await shot('17-mobile-paused');
  await page.click('[data-action="restart"]',{force:true});await advance(1);check((await state()).mode==='planning','Restart did not return to planning');
  await fs.writeFile(`${out}/controls-results.json`,JSON.stringify({mobile:'touch movement, glide, physical tune, camera, pause, vocabulary, restart, mute, reduced motion, fullscreen, focus loss',errors},null,2));console.log(JSON.stringify({passed:true,errors}));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
