// Real iframe + real controls: no position/evidence/level assignment.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const origin=process.env.RR_HOST_ORIGIN||'http://localhost:4231';
const root=process.env.RR_HOST_PATH||'/';
const out=process.env.RR_HOST_OUT||'work/workbook-browser';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1600,height:900}});const checks=[],errors=[];
const html=`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%}iframe{width:100%;height:100%;border:0;display:block}</style></head><body><script>window.messages=[];addEventListener('message',e=>{if(e.origin===location.origin&&e.source===document.querySelector('iframe')?.contentWindow&&e.data?.source==='workbook-game')messages.push(e.data)});<\/script><iframe src="${root}${root.endsWith('/')?'':'/'}index.html?level=LEVEL" allow="autoplay;fullscreen"></iframe></body></html>`;
function check(ok,message){if(!ok)throw Error(message);}
const makePage=async(level)=>{const page=await context.newPage();page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(String(e)));await page.route('**/__rooftop-host-test*',r=>r.fulfill({contentType:'text/html',body:html.replace('LEVEL',String(level))}));await page.goto(`${origin}/__rooftop-host-test?level=${level}`,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>window.messages.some(m=>m.type==='ready'));const frame=page.frames().find(f=>f.parentFrame());check(frame,'Missing game iframe');return {page,frame};};
const state=frame=>frame.evaluate(()=>JSON.parse(window.render_game_to_text()));
const messages=page=>page.evaluate(()=>window.messages);
const waitMessages=(page,n)=>page.waitForFunction(n=>window.messages.length>=n,n,{timeout:5000});
try{
  for(let level=1;level<=5;level++){
    const {page,frame}=await makePage(level);const before=await state(frame),ready=await messages(page);
    check(before.job.number===level&&before.mode==='planning',`Wrong deep link ${level}: ${JSON.stringify(before)}`);
    check(ready.length===1&&ready[0].type==='ready'&&ready[0].slug==='rooftop-radio'&&ready[0].version===1,`Planning emitted fake play: ${JSON.stringify(ready)}`);
    check(before.art.courier&&before.art.glider&&before.art.buildings===67&&!before.art.error,'Required models absent');
    await frame.click('#start-btn',{force:true});await frame.evaluate(()=>window.advanceTime(1000,false));
    await waitMessages(page,2);const started=await messages(page);check(started.length===2&&started[1].type==='level-start'&&started[1].level===level,'Actual launch event mismatch');
    await frame.click('#pause',{force:true});const paused=await state(frame);await frame.evaluate(()=>window.advanceTime(10000,false));
    check((await state(frame)).time===paused.time,'Reading spent movement time');check((await messages(page)).length===2,'Reading emitted completion');
    if(level===1){
      await frame.click('[data-action=resume]',{force:true});const held=new Set();
      const press=async(keys,frames=1)=>{for(const k of held)if(!keys.includes(k)){await page.keyboard.up(k);held.delete(k);}for(const k of keys)if(!held.has(k)){await page.keyboard.down(k);held.add(k);}return frame.evaluate(ms=>{window.advanceTime(ms,false);return JSON.parse(window.render_game_to_text());},frames*1000/60);};
      async function walk(x,z){let s=await state(frame);for(let i=0;i<250;i++){const p=s.player.position,v=s.player.velocity,dx=x-p.x,dz=z-p.z;if(Math.hypot(dx,dz)<.3&&Math.hypot(v.x,v.z)<.7){await press([],12);return;}const tx=Math.max(-7.8,Math.min(7.8,dx*3)),tz=Math.max(-7.8,Math.min(7.8,dz*3));const keys=[];if(Math.abs(tx)>.35&&(Math.abs(v.x)<Math.abs(tx)+.25||v.x*tx<0))keys.push(tx>0?'ArrowRight':'ArrowLeft');if(Math.abs(tz)>.35&&(Math.abs(v.z)<Math.abs(tz)+.25||v.z*tz<0))keys.push(tz>0?'ArrowDown':'ArrowUp');s=await press(keys,Math.hypot(dx,dz)>2?8:2);}throw Error('Host walk failed '+JSON.stringify(s));}
      await walk(0,31.5);await press(['ArrowUp','Space'],40);await press(['ArrowUp','Space'],22);await press([],130);await walk(1,22.2);await press(['KeyE'],1);await press([],2);
      const done=await state(frame);check(done.mode==='success','Real host delivery failed: '+JSON.stringify(done));await frame.evaluate(()=>window.advanceTime(10000,false));
      await waitMessages(page,3);const complete=await messages(page);check(complete.length===3&&complete[2].type==='level-complete'&&complete[2].level===1&&complete[2].durationMs===Math.round(done.time*1000),'Duplicate/incorrect completion: '+JSON.stringify(complete));
      await page.screenshot({path:`${out}/host-first-delivery.png`});
      await frame.click('[data-action=next]',{force:true});check((await state(frame)).job.number===2,'Next level missing');check((await messages(page)).length===3,'Planning next emitted start');
      await frame.click('#start-btn',{force:true});await frame.evaluate(()=>window.advanceTime(100,false));
      await waitMessages(page,4);check((await messages(page)).at(-1)?.type==='level-start'&&(await messages(page)).at(-1)?.level===2,'Next launch missing');
      checks.push({level,planning:ready,started:started[1],completed:complete[2],next:(await messages(page)).at(-1),durationExcludesReading:true});
    }else{
      await frame.click('[data-action=restart]',{force:true});check((await state(frame)).mode==='planning','Restart did not open planning');
      check((await messages(page)).length===2,'Retry fabricated completion');await frame.click('#start-btn',{force:true});await frame.evaluate(()=>window.advanceTime(50,false));
      await waitMessages(page,3);const retry=await messages(page);check(retry.length===3&&retry[2].type==='level-start'&&retry[2].level===level,'Retry launch missing');
      if(level===4){await frame.evaluate(()=>window.drawGame());await page.screenshot({path:`${out}/host-parcel-start.png`});}
      checks.push({level,planning:ready,started:started[1],retry:retry[2],noFakeCompletion:true});
    }
    await page.close();console.log('PASS iframe level',level);
  }
  const broken=await context.newPage(),expectedErrors=[];broken.setDefaultTimeout(45000);broken.on('pageerror',e=>expectedErrors.push(String(e)));
  await broken.route('**/__rooftop-host-test*',r=>r.fulfill({contentType:'text/html',body:html.replace('LEVEL','1')}));
  await broken.route('**/models/courier.glb',r=>r.abort('failed'));
  await broken.goto(`${origin}/__rooftop-host-test?blocked=1`,{waitUntil:'domcontentloaded'});
  await broken.waitForFunction(()=>window.messages.some(m=>m.type==='error'));
  const failedMessages=await messages(broken);check(!failedMessages.some(m=>m.type==='ready'||m.type==='level-start'),'Failed required model reported playable');
  const failedFrame=broken.frames().find(f=>f.parentFrame());check(await failedFrame.locator('#load-error').isVisible(),'Failed asset has no visible error');
  checks.push({requiredAssetFailure:{messages:failedMessages,visibleError:true,expectedErrors}});await broken.close();
  check(errors.length===0,errors.join('\n'));
  const result={origin,root,checks,errors};await fs.writeFile(`${out}/results.json`,JSON.stringify(result,null,2));console.log(JSON.stringify({passed:true,levels:5,scenarios:checks.length,errors}));
}finally{await browser.close();}
