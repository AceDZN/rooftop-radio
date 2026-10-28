// Real keyboard/pointer/touch input only. Observable text is read; state is never assigned.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const out=process.env.RR_CAPTURES||'docs/gameplay-captures';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:process.env.RR_GPU==='metal'?['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']:['--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1600,height:900}});page.setDefaultTimeout(120000);
console.log('Browser launched');
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const held=new Set();const read=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
async function press(keys,frames=1){for(const k of held)if(!keys.includes(k)){await page.keyboard.up(k);held.delete(k);}for(const k of keys)if(!held.has(k)){await page.keyboard.down(k);held.add(k);}return page.evaluate(ms=>{window.advanceTime(ms,false);return JSON.parse(window.render_game_to_text());},frames*1000/60);}
async function shot(name){if(process.argv.includes('--final-review')&&!['07-width-choice','12-campaign-complete'].includes(name))return;console.log('Capture',name);await page.evaluate(()=>window.drawGame());await page.screenshot({path:`${out}/${name}.png`,animations:"disabled"});await fs.writeFile(`${out}/${name}.json`,JSON.stringify(await read(),null,2));console.log('Saved',name);}
async function walk(x,z){let s=await read();if(s.relays.some(r=>Math.hypot(r.pos.x-x,r.pos.z-z)<.15)){if(Math.abs(s.player.position.x-x)>Math.abs(s.player.position.z-z))x+=Math.sign(s.player.position.x-x)*1.6;else z+=Math.sign(s.player.position.z-z||1)*1.6;}if(Math.abs(x)<.5&&Math.abs(z-10)<.2)z=3;for(let i=0;i<700;i++){const p=s.player.position,v=s.player.velocity,dx=x-p.x,dz=z-p.z,yaw=s.player.facingYaw;
  if(Math.hypot(dx,dz)<.28&&Math.hypot(v.x,v.z)<.5){await press([],8);return;}
  if(s.mode!=='play')throw Error(`Walk left play at ${x},${z}: ${JSON.stringify(s)}`);
  const tx=Math.max(-7.8,Math.min(7.8,dx*3)),tz=Math.max(-7.8,Math.min(7.8,dz*3));
  const localX=Math.cos(yaw)*tx+Math.sin(yaw)*tz,localF=Math.sin(yaw)*tx-Math.cos(yaw)*tz;
  const vx=Math.cos(yaw)*v.x+Math.sin(yaw)*v.z,vf=Math.sin(yaw)*v.x-Math.cos(yaw)*v.z;
  const keys=[];const crossing=Math.abs(p.x)<2&&((dz<0&&p.z<14.5&&p.z>11.5&&z<8)||(dz>0&&p.z>3.5&&p.z<6.5&&z>11));if(crossing&&s.player.grounded||!s.player.grounded&&Math.hypot(dx,dz)>2.5)keys.push('Space');if(Math.abs(localX)>.35&&(Math.abs(vx)<Math.abs(localX)+.25||vx*localX<0))keys.push(localX>0?'ArrowRight':'ArrowLeft');
  if(Math.abs(localF)>.35&&(Math.abs(vf)<Math.abs(localF)+.25||vf*localF<0))keys.push(localF>0?'ArrowUp':'ArrowDown');
  s=await press(keys,Math.hypot(dx,dz)>3?10:2);
}throw Error(`Unreachable waypoint ${x},${z}: ${JSON.stringify(await read())}`);}
async function tune(){await press(['KeyE'],1);await press([],2);}
async function relay(site){const r=(await read()).relays.find(r=>r.site===site);await walk(r.pos.x,r.pos.z);await press([],50);await tune();}
async function next(){const s=await read();if(s.mode!=='success')throw Error('Expected success: '+JSON.stringify(s));await page.click('[data-action="next"]');const next=await read();if(next.relays.find(r=>r.site==='west').name!=='Radio Station'||next.relays.find(r=>r.site==='east').name!=='Café')throw Error('Landmark identity changed');await page.click('#start-btn');await press([],1);}
async function broadGreen(){await walk(0,36);await walk(-18,36);await walk(-18,18);await walk(-6,18);await walk(3.5,18);await relay('greenhouse');}
async function toBell(tuneIt=true){await walk(1.2,20);await walk(0,10);await walk(0,0);if(tuneIt)await relay('bell');}
try{
  await page.goto(process.env.RR_URL||'http://localhost:4231',{waitUntil:'domcontentloaded',timeout:120000});console.log('Page navigated');await page.waitForSelector('#start-btn');console.log('Game ready');await page.evaluate(()=>window.advanceTime(0));await shot('01-planning');
  await page.click('#start-btn',{force:true});await press([],1);
  if(process.argv.includes('--pose-review')){await press(['ArrowUp'],20);await shot('19-running-pack');}
  await walk(0,31.5);await press(['ArrowUp','Space'],40);await shot('02-first-glide');if(process.argv.includes('--pose-review')){await page.mouse.move(800,500);await page.mouse.down();await page.mouse.move(1040,550,{steps:8});await page.mouse.up();await press(['KeyG'],4);await shot('20-side-grip');await page.keyboard.press('c');}
  await press(['ArrowUp','Space'],22);await press(['KeyG'],100);await walk(3.5,22);await relay('greenhouse');await shot('03-first-signal');
  if(process.argv.includes('--first')){console.log(JSON.stringify({scenario:'first',state:await read(),errors}));}
  else {
    await next();await relay('water');if((await read()).mistakes!==1)throw Error('Wrong relay did not remain recoverable');await broadGreen();await toBell();await shot('04-past-greenhouse');
    await next();await walk(0,0);await shot('05-junction-southbound');await walk(0,-2);await walk(-8,-2);await walk(-14,-2);await relay('west');await shot('06-right-turn');
    await next();await shot('07-width-spawn');await walk(0,0);await shot('07-width-choice');
    await walk(0,-2);await walk(-5.5,-2);const before=(await read()).recoveries;for(let i=0;i<40&&(await read()).recoveries===before;i++)await press(['ArrowUp'],3);await press([],15);if((await read()).recoveries===before)throw Error('Narrow beam did not drop parcel');await shot('08-parcel-recovery');
    await walk(0,3.3);await walk(-14,3.3);await relay('west');await shot('09-wide-route');
    await next();await broadGreen();await toBell();if((await read()).route.tuned!==1)throw Error('Transfer first stage wrong');
    await walk(0,0);await walk(0,18);await relay('greenhouse');await walk(1.2,20);await walk(0,10);await walk(0,0);await shot('10-transfer-junction');await walk(8,0);await walk(12,0);await walk(12,-1.3);await relay('east');await shot('11-transfer-success');
    await page.click('[data-action="next"]');await shot('12-first-five-complete');
    const final=await read();if(final.mode!=='planning'||final.job.number!==6)throw Error('First-five regression must continue to level6');if(final.campaign.recoveries!==1||final.campaign.mistakes!==2)throw Error('Campaign totals do not match observed incidents: '+JSON.stringify(final.campaign));
    const events=await page.evaluate(()=>JSON.parse(localStorage.getItem('rooftop-radio-events')||'[]'));if(!events.some(e=>e.type==='parcel-drop'&&e.value==='narrow crossing'))throw Error('Parcel route incident missing from local events');
    console.log(JSON.stringify({scenario:'first-five-baseline',state:await read(),errors}));
  }
  await fs.writeFile(`${out}/browser-errors.json`,JSON.stringify(errors,null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
