import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {contracts} from '../src/content.ts';
import {CampaignDriver} from './campaign-driver.mjs';
const url=process.env.RR_URL||'http://localhost:4231',out=process.env.RR_CAMPAIGN_OUT||'work/campaign-browser';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const errors=[],httpFailures=[],checks=[];
const check=(value,message)=>{if(!value)throw Error(message)};
try{
  const context=await browser.newContext({viewport:{width:1600,height:900}}),page=await context.newPage();page.setDefaultTimeout(120000);
  page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(url))httpFailures.push({url:r.url(),status:r.status()})});
  const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
  const ready=()=>page.waitForSelector('#start-btn');
  const shot=async name=>{await page.evaluate(()=>window.drawGame());await page.screenshot({path:`${out}/${name}.png`,animations:'disabled'});await fs.writeFile(`${out}/${name}.json`,JSON.stringify(await state(),null,2));};
  const held=new Set();
  const tick=async(input,frames)=>{const wanted=[];if(input.x)wanted.push(input.x>0?'ArrowRight':'ArrowLeft');if(input.forward)wanted.push(input.forward>0?'ArrowUp':'ArrowDown');if(input.jump)wanted.push('Space');if(input.glide)wanted.push('KeyG');if(input.interact)wanted.push('KeyE');
    for(const code of held)if(!wanted.includes(code)){await page.keyboard.up(code);held.delete(code);}for(const code of wanted)if(!held.has(code)){await page.keyboard.down(code);held.add(code);}
    return page.evaluate(ms=>{window.advanceTime(ms,false);return JSON.parse(window.render_game_to_text());},frames*1000/60);
  };
  await page.goto(`${url}/?level=1&grade=7`,{waitUntil:'domcontentloaded'});await ready();await page.evaluate(()=>window.advanceTime(0));
  await page.click('#levels');check((await state()).mode==='levels','Map did not open');check(await page.locator('[data-level]').count()===50,'Not50 selectable levels');check(await page.locator('select').count()===0,'Unexpected grade selector');await shot('level-map-desktop');
  await page.click('[data-level="1"]');await page.click('#start-btn');
  const driver=new CampaignDriver({read:state,tick});const first=await driver.complete(contracts()[0]);
  check(first.campaign.completedLevels.join(',')==='1','Completion did not save exactly level1');await shot('first-completion');
  await page.click('[data-action="next"]');check((await state()).job.number===2&&(await state()).mode==='planning','Next did not advance to2');
  await page.goto(url,{waitUntil:'domcontentloaded'});await ready();check((await state()).job.number===2,'Reload did not resume saved progress');checks.push({firstDelivery:true,resume:2});
  await page.click('[data-action="audio"]');await page.click('#levels');await page.click('[data-action="resume"]');check((await state()).mode==='audio','Closing map lost the audio panel');await page.click('[data-action="resume"]');check((await state()).mode==='planning','Audio return did not restore planning');
  for(const level of [11,21,31,41]){await page.click('#levels');await page.click(`[data-level="${level}"]`);await page.click('#start-btn');await tick({},1);const s=await state();check(s.art.districtId===['old-town','canals','market','gardens','observatory'][Math.floor((level-1)/10)],'District did not switch');await shot(`district-${s.art.districtId}`);checks.push({level,district:s.art.districtId,windCount:s.art.windCount,hiddenCrossings:s.art.hiddenCrossings});await page.click('#pause');}
  await page.goto(`${url}/?level=50&grade=7`,{waitUntil:'domcontentloaded'});await ready();const lastPlan=await state();check(lastPlan.job.number===50&&lastPlan.mode==='planning','Grade query limited level50');
  await page.click('#start-btn');const finalDriver=new CampaignDriver({read:state,tick});const final=await finalDriver.complete(contracts()[49],async(_s,n)=>console.log('PASS final stage',n+1));
  check(final.campaign.completedLevels.length===2&&final.campaign.completedLevels.includes(50),'Late link fabricated earlier completions');await shot('level-50-complete');
  await page.click('[data-action="next"]');check((await state()).mode==='won','Final summary missing');check(await page.getByText('השלב האחרון הושלם',{exact:true}).isVisible(),'Direct50 falsely claimed campaign completion');
  await page.goto(url,{waitUntil:'domcontentloaded'});await ready();check((await state()).job.number===2,'Final summary overwrote first unfinished resume');checks.push({lastDelivery:true,onlyEarnedCompletions:[1,50],resume:2});await context.close();
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),phone=await mobile.newPage();phone.setDefaultTimeout(120000);phone.on('pageerror',e=>errors.push(String(e)));
  await phone.goto(`${url}/?level=41&grade=7`,{waitUntil:'domcontentloaded'});await phone.waitForSelector('#start-btn');await phone.locator('#levels').tap();check(await phone.locator('[data-level]').count()===50,'Phone lost levels');await phone.screenshot({path:`${out}/level-map-phone.png`,animations:'disabled'});
  await phone.locator('[data-level="50"]').tap();check(await phone.evaluate(()=>JSON.parse(window.render_game_to_text()).job.number)===50,'Phone could not select50');await phone.locator('#start-btn').tap();await phone.evaluate(()=>window.drawGame());check(await phone.locator('#touch').isVisible(),'Phone controls hidden');check(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Phone overflows');
  const toolbar=await phone.locator('.toolbar').boundingBox();check(toolbar.x>=0&&toolbar.x+toolbar.width<=390,'Phone toolbar clipped');await phone.screenshot({path:`${out}/level-50-phone.png`,animations:'disabled'});checks.push({phoneLevel50:true,all50Selectable:true});await mobile.close();
  check(!errors.length,errors.join('\n'));check(!httpFailures.length,JSON.stringify(httpFailures));await fs.writeFile(`${out}/results.json`,JSON.stringify({checks,errors,httpFailures},null,2));console.log(JSON.stringify({passed:true,checks,errors,httpFailures}));
}finally{await browser.close();}
