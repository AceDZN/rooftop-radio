// Real keyboard/pointer/touch input only. Observable text is read; state is never assigned.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const out='docs/gameplay-captures';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1600,height:900}});page.setDefaultTimeout(120000);
console.log('Browser launched');
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const held=new Set();const read=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
async function press(keys,frames=1){for(const k of held)if(!keys.includes(k)){await page.keyboard.up(k);held.delete(k);}for(const k of keys)if(!held.has(k)){await page.keyboard.down(k);held.add(k);}return page.evaluate(ms=>{window.advanceTime(ms,false);return JSON.parse(window.render_game_to_text());},frames*1000/60);}
async function shot(name){console.log('Capture',name);await page.evaluate(()=>window.drawGame());await page.screenshot({path:`${out}/${name}.png`,animations:"disabled"});await fs.writeFile(`${out}/${name}.json`,JSON.stringify(await read(),null,2));console.log('Saved',name);}
async function walk(x,z){let s=await read();for(let i=0;i<700;i++){const p=s.player.position,v=s.player.velocity,dx=x-p.x,dz=z-p.z,yaw=s.player.facingYaw;
  if(Math.hypot(dx,dz)<.28&&Math.hypot(v.x,v.z)<.5){await press([],8);return;}
  if(s.mode!=='play')throw Error(`Walk left play at ${x},${z}: ${JSON.stringify(s)}`);
  const tx=Math.max(-7.8,Math.min(7.8,dx*3)),tz=Math.max(-7.8,Math.min(7.8,dz*3));
  const localX=Math.cos(yaw)*tx+Math.sin(yaw)*tz,localF=Math.sin(yaw)*tx-Math.cos(yaw)*tz;
  const vx=Math.cos(yaw)*v.x+Math.sin(yaw)*v.z,vf=Math.sin(yaw)*v.x-Math.cos(yaw)*v.z;
  const keys=[];if(Math.abs(localX)>.35&&(Math.abs(vx)<Math.abs(localX)+.25||vx*localX<0))keys.push(localX>0?'ArrowRight':'ArrowLeft');
  if(Math.abs(localF)>.35&&(Math.abs(vf)<Math.abs(localF)+.25||vf*localF<0))keys.push(localF>0?'ArrowUp':'ArrowDown');
  s=await press(keys,Math.hypot(dx,dz)>3?10:2);
}throw Error(`Unreachable waypoint ${x},${z}: ${JSON.stringify(await read())}`);}
async function tune(){await press(['KeyE'],1);await press([],2);}
async function relay(site){const r=(await read()).relays.find(r=>r.site===site);await walk(r.pos.x,r.pos.z);await tune();}
async function next(){const s=await read();if(s.mode!=='success')throw Error('Expected success: '+JSON.stringify(s));await page.click('[data-action="next"]');if((await read()).job.transfer){const notice=await page.locator('.notice').innerText();if(notice!=='The café has moved to the west roof.')throw Error('Transfer context gives away receiver: '+notice);}await page.click('#start-btn');await press([],1);}
async function broadGreen(){await walk(0,36);await walk(-18,36);await walk(-18,18);await walk(-6,18);await walk(-6,22);await walk(3.5,22);await relay('greenhouse');}
async function toBell(tuneIt=true){await walk(0,22);await walk(0,10);await walk(0,0);if(tuneIt)await relay('bell');}
try{
  await page.goto(process.env.RR_URL||'http://localhost:4231',{waitUntil:'domcontentloaded',timeout:120000});console.log('Page navigated');await page.waitForSelector('#start-btn');console.log('Game ready');await page.evaluate(()=>window.advanceTime(0));await shot('01-planning');
  await page.click('#start-btn',{force:true});await press([],1);
  // A deliberately wrong but interactable relay, corrected through traversal.
  await relay('water');if((await read()).mistakes!==1)throw Error('Wrong relay did not remain recoverable');
  await walk(0,31.5);await press(['ArrowUp','Space'],40);await shot('02-first-glide');await press(['ArrowUp','Space'],22);await press(['KeyG'],100);await walk(3.5,22);await relay('greenhouse');await shot('03-first-signal');
  if(process.argv.includes('--first')){console.log(JSON.stringify({scenario:'first',state:await read(),errors}));}
  else {
    await next();await broadGreen();await toBell();await shot('04-past-greenhouse');
    await next();await walk(0,0);await shot('05-junction-southbound');await walk(-8,0);await walk(-14,0);await relay('west');await shot('06-right-turn');
    await next();await walk(0,0);await press(['KeyL'],55);await press([],1);await shot('07-width-choice');await press(['KeyJ'],55);await press([],1);
    const before=(await read()).recoveries;for(let i=0;i<40&&(await read()).recoveries===before;i++)await press(['ArrowRight'],3);await press([],15);if((await read()).recoveries===before)throw Error('Narrow beam did not drop parcel');await shot('08-parcel-recovery');
    await walk(0,0);await walk(0,18);await walk(0,22);await walk(-6,22);await walk(-6,18);await walk(-18,18);await walk(-18,0);await relay('west');await shot('09-wide-route');
    await next();await broadGreen();await toBell();if((await read()).route.tuned!==1)throw Error('Transfer first stage wrong');
    await walk(0,0);await walk(0,18);await relay('greenhouse');await walk(0,22);await walk(0,10);await walk(0,0);await shot('10-transfer-junction');await walk(8,0);await walk(18,0);await relay('east');await shot('11-transfer-success');
    await page.click('[data-action="next"]');await shot('12-campaign-complete');
    console.log(JSON.stringify({scenario:'campaign',state:await read(),errors}));
  }
  await fs.writeFile(`${out}/browser-errors.json`,JSON.stringify(errors,null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
