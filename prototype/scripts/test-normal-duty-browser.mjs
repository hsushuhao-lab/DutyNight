import {chromium} from 'playwright';
import {preview} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.argv[2]||'../docs/normal-duty-qa/browser';
const external=process.argv[3];
await mkdir(out,{recursive:true});
const server=external?null:await preview({preview:{port:4173,strictPort:true}});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:.5});
const report={started:new Date().toISOString(),url:external||'http://localhost:4173/',method:'Continuous production route using controller movement inputs, E interactions and real dialogue/floor buttons. No direct loadZone, task completion or player-position writes. Normal player-facing save/resume is exercised.',errors:[],steps:[],screenshots:[]};
page.on('pageerror',e=>report.errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
const status=()=>page.evaluate(()=>window.dutyNightStatus());
async function stage(name){await page.waitForFunction(s=>window.dutyNightStatus().stage===s,name,{timeout:120000});}
async function choose(id){await page.locator(`[data-duty-action="${id}"]`).click();await page.waitForTimeout(150);}
async function shot(name){await page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:85});report.screenshots.push(`${name}.jpg`);}
async function record(label){const s=await status();report.steps.push({label,stage:s.stage,time:s.minutes,zone:s.zone});console.log('P1 STEP',JSON.stringify(report.steps.at(-1)));await writeFile(`${out}/progress.json`,JSON.stringify(report,null,2));}
async function walk(x,z){
 await page.evaluate(({x,z})=>new Promise((resolve,reject)=>{
  const r=window.worldRouter,c=r.controller,start=performance.now();let best=Infinity,last=start;
  const stop=()=>{c.keys.forward=false;c.cancelAutoMove();};
  function frame(){
   const d=Math.hypot(x-c.position.x,z-c.position.z),now=performance.now();
   if(d<.16){stop();resolve();return;}
   if(d<best-.025){best=d;last=now;}
   if(now-start>120000||now-last>15000){stop();reject(Error(`Walking blocked ${r.activeZoneId}: ${c.position.toArray()} -> ${x},${z}; enabled=${c.enabled}`));return;}
   c.yaw=Math.atan2(c.position.x-x,c.position.z-z);c.pitch=0;c.updateCameraRotation();c.keys.forward=d>1;
   if(d<=1){c.autoMoveTarget=c.position.clone();c.autoMoveTarget.x=x;c.autoMoveTarget.z=z;c.autoMoveStopDistance=.1;}
   requestAnimationFrame(frame);
  }frame();
 }),{x,z});await page.waitForTimeout(80);
}
async function path(points){for(const [x,z] of points)await walk(x,z);}
async function aim(id){
 await page.evaluate(id=>{const c=window.worldRouter.controller,o=window.worldRouter.activeZoneInstance.interactables.find(o=>o.userData.id===id);if(!o)throw Error(`Missing interaction ${id}`);const p=o.getWorldPosition(c.position.clone()),d=p.sub(c.camera.position);c.yaw=Math.atan2(-d.x,-d.z);c.pitch=Math.atan2(d.y,Math.hypot(d.x,d.z));c.updateCameraRotation();},id);
 await page.waitForFunction(id=>window.worldRouter.controller.currentInteractable?.id===id,id,{timeout:30000});await page.keyboard.press('KeyE');
}
async function travel(floor){
 const id=await page.evaluate(()=>window.worldRouter.activeZoneInstance.interactables.find(o=>o.userData.type==='elevator')?.userData.id);
 await aim(id);await page.locator(`[data-floor="${floor}"]`).click();
 await page.waitForFunction(f=>window.worldRouter.activeZoneId===f&&window.worldRouter.controller.enabled,floor);
 await page.waitForTimeout(250);
}
async function answer(){await page.keyboard.press('KeyP');await choose('answer');await choose('acknowledge');}
async function wardPoint(ward){return page.evaluate(ward=>window.worldRouter.activeZoneInstance.roomAreas.find(r=>r.id===ward),ward);}
async function enterWard(ward){const r=await wardPoint(ward);await path([[r.corridor[0],r.corridor[2]],[r.point[0],r.point[2]]]);return r;}
async function leaveWard(r){await walk(r.corridor[0],r.corridor[2]);}
async function assessment(id,method){await aim(id);await choose(method);await choose('assess');}
try{
 await page.goto(report.url,{timeout:600000});await page.waitForFunction(()=>window.dutyNightStatus,{timeout:600000});await choose('start');
 assert.equal((await status()).stage,'HANDOFF');await record('New normal night at 17:00');
 await path([[2.4,0],[2.4,3.5],[4,4.2],[5.6,5]]);await aim('KEY_PICKUP');await walk(6.4,5);await aim('DUTY_LOG');await page.locator('#btn-sign-log').click();await page.waitForTimeout(250);
 await walk(8.7,4.9);await aim('E_HANDOFF');await shot('01-his');await page.locator('#btn-sign-handoff').click();await stage('CHECKIN');
 await path([[8,4.2],[5,4.2],[2.4,3.5],[2.4,0],[-10.2,1]]);await travel('first_campus_4f');
 await path([[8.75,0],[8.75,1]]);await aim('DUTY_STATION');await shot('02-station-checkin');await choose('meal-vegetarian');await stage('ROOM');
 await path([[8.75,0],[5.4,0],[5.4,-3.8],[5.4,-5.5]]);await aim('DUTY_BAG');await choose('setup');
 await walk(6.2,-5.4);await aim('DUTY_PHONE');await choose('setup');await walk(5.4,-5.5);await aim('DUTY_BED');await shot('03-room-preparation');await choose('setup');await stage('ROUNDS');
 await path([[5.4,-3.8],[5.4,0],[12.7,0]]);assert(await page.evaluate(()=>window.worldRouter.activeZoneInstance.wardGateClosed));await aim('WARD_GATE_ACCESS');await walk(15.5,0);
 for(const ward of ['4A','4B','4C','4D']){const r=await enterWard(ward);await aim(`DUTY_ROUND_${ward}`);if(ward==='4A')await shot('04-routine-round');await choose('round');await leaveWard(r);}
 await stage('CALL1');await page.keyboard.press('KeyP');await choose('later');assert.equal((await status()).phone.status,'MISSED');
 // Journal is a real pause: neither the clock nor the missed-work record changes while reading.
 await page.keyboard.press('KeyJ');const paused=(await status()).minutes;await page.waitForTimeout(800);assert.equal((await status()).minutes,paused);await choose('close');
 await answer();await stage('ASSESS1');const first=await enterWard('4A');await assessment('DUTY_ROUND_4A','chart-first');await leaveWard(first);
 await path([[10.8,0],[10.8,1]]);await aim('DUTY_CHART');await shot('05-normal-documentation');await choose('document');await stage('CALL2');await answer();
 const secondary=(await status()).events.find(e=>e.id==='case2');await walk(10.8,0);const second=await enterWard(secondary.ward);await assessment(`DUTY_ROUND_${secondary.ward}`,'nurse-first');await leaveWard(second);
 await path([[10.8,0],[10.8,1]]);await aim('DUTY_CHART');await choose('document');await stage('DINNER');await record('Both ordinary ward calls documented, with a successful callback');
 // Resume uses only the game's own save UI, not a QA state injection.
 const before=await status();await page.reload({timeout:600000});await page.waitForFunction(()=>window.dutyNightStatus,{timeout:600000});await choose('resume');await stage('DINNER');
 const after=await status();assert.deepEqual(after.tasks,before.tasks);assert.equal(after.choices.meal,'vegetarian');assert.equal(after.events.filter(e=>e.status==='COMPLETED').length,2);await record('Production save/resume keeps current work');
 await path([[10.8,0],[6.4,1]]);await aim('DUTY_DINNER');await choose('dinner');await stage('REST');
 await path([[6.4,0],[5.4,0],[5.4,-3.8],[5.4,-5.5]]);await aim('DUTY_BED');await choose('sleep');await shot('06-short-rest');await stage('ER_CALL');
 assert((await status()).rest.interrupted);assert(await page.evaluate(()=>window.worldRouter.controller.enabled));await shot('07-interrupted-by-er');await answer();
 await path([[5.4,-3.8],[5.4,0],[-10.2,1]]);await travel('first_campus_2f');await walk(-1.1,0);assert(await page.evaluate(()=>window.worldRouter.activeZoneInstance.acuteGateClosed));await aim('2F_ACUTE_GATE');
 await path([[1,0],[10.5,0],[10.5,4.7]]);await aim('DUTY_ER_PATIENT');await shot('08-er-assessment');await choose('nurse-first');await choose('assess');
 await path([[10.5,0],[5.2,0],[5.2,2.2]]);await aim('DUTY_ER_CHART');await choose('document');await stage('RETURN');
 await path([[5.2,0],[-10.2,1]]);await travel('first_campus_4f');await path([[5.4,0],[5.4,-3.8],[5.4,-5.5]]);await aim('DUTY_BED');await choose('finish');await stage('COMPLETE');await shot('09-2100-complete');
 const final=await status();assert.equal(final.minutes,1260);assert(final.events.every(e=>e.status==='COMPLETED'));assert(final.tasks.includes('RETURN'));assert(final.rest.interrupted);assert(final.history.some(h=>h.type==='phone_missed'));assert.equal(report.errors.length,0,JSON.stringify(report.errors));
 report.final=final;report.verdict='PASS';await record('Normal Act 1 complete at 21:00, no pending work');
}catch(e){report.verdict='FAIL';report.failure=e.stack;report.last=await status().catch(()=>null);await page.screenshot({path:`${out}/failure.jpg`}).catch(()=>{});console.error(e.stack);process.exitCode=1;}
finally{report.ended=new Date().toISOString();await writeFile(`${out}/result.json`,JSON.stringify(report,null,2));console.log('NORMAL_DUTY_BROWSER_RESULT',JSON.stringify(report));await browser.close();await server?.httpServer.close();}
