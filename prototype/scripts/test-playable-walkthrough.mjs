import {chromium} from 'playwright';
import {preview} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const output=process.argv[2]||'../docs/traversal-qa/local';
const baseUrl=process.argv[3]||'http://localhost:4173/';
await mkdir(output,{recursive:true});
const server=process.argv[3]?null:await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4173,strictPort:true}});
const browserSurface={viewport:{width:1280,height:800},deviceScaleFactor:process.env.CI ? .5 : 1};
const browser=process.env.DUTYNIGHT_QA_PROFILE
 ? await chromium.launchPersistentContext(process.env.DUTYNIGHT_QA_PROFILE,{channel:'chrome',headless:true,...browserSurface})
 : await chromium.launch({channel:'chrome',headless:true});
const report={url:baseUrl,started:new Date().toISOString(),method:'Continuous production route; controller movement inputs and camera aim are automated. No direct loadZone, teleport, or player-position writes. E interactions and floor buttons use browser keyboard/DOM.',zones:[],rooms:[],steps:[],screenshots:[],errors:[]};
let page;
async function state(){return page.evaluate(()=>({zone:window.worldRouter.activeZoneId,position:window.worldRouter.controller.position.toArray(),enabled:window.worldRouter.controller.enabled}));}
async function record(label){const s=await state();report.steps.push({label,...s});if(!report.zones.includes(s.zone))report.zones.push(s.zone);console.log(label,JSON.stringify(s));await writeFile(`${output}/progress.json`,JSON.stringify(report,null,2));}
async function walk(x,z,expected){
 await page.evaluate(({x,z,expected})=>new Promise((resolve,reject)=>{
  const r=window.worldRouter,c=r.controller,origin=r.activeZoneId,start=performance.now();let best=Infinity,lastProgress=start;
  function stop(){c.keys.forward=false;c.cancelAutoMove();}
  function tick(){
   if(r.activeZoneId!==origin){stop();return r.activeZoneId===expected?resolve():reject(Error(`Unexpected transition ${origin} -> ${r.activeZoneId}`));}
   const d=Math.hypot(x-c.position.x,z-c.position.z),now=performance.now();
   if(d<.16&&!expected){stop();return resolve();}
   if(d<best-.035){best=d;lastProgress=now;}
   if(now-start>90000||now-lastProgress>8000){stop();return reject(Error(`Walk stuck ${origin} ${c.position.toArray()} toward ${x},${z}; enabled=${c.enabled}`));}
   c.pitch=0;c.yaw=Math.atan2(c.position.x-x,c.position.z-z);c.updateCameraRotation();
   c.keys.forward=d>1;
   if(d<=1){c.autoMoveTarget=c.position.clone();c.autoMoveTarget.x=x;c.autoMoveTarget.z=z;c.autoMoveStopDistance=.10;}
   requestAnimationFrame(tick);
  }tick();
 }),{x,z,expected});
 await page.waitForTimeout(120);
}
async function path(points){for(const [x,z] of points)await walk(x,z);}
async function aim(id){
 await page.evaluate(id=>{const r=window.worldRouter,c=r.controller,o=r.activeZoneInstance.interactables.find(o=>o.userData.id===id);if(!o)throw Error(`Missing ${id}`);const p=o.getWorldPosition(c.position.clone()),d=p.sub(c.camera.position);c.yaw=Math.atan2(-d.x,-d.z);c.pitch=Math.atan2(d.y,Math.hypot(d.x,d.z));c.updateCameraRotation();},id);
 await page.waitForFunction(id=>window.worldRouter.controller.currentInteractable?.id===id,id,{timeout:30000});
 await page.keyboard.press('KeyE');
}
let travelCancellationChecked=false;
async function travel(floor,kind='elevator'){
 const id=await page.evaluate(kind=>window.worldRouter.activeZoneInstance.interactables.find(o=>o.userData.type===kind||(o.userData.type==='travel_selector'&&o.userData.kind===kind))?.userData.id,kind);
 await aim(id);await page.waitForSelector('#elevator-cutscene.active');
 const current=(await state()).zone;assert(await page.locator(`[data-floor="${current}"]`).isDisabled());
 if(!travelCancellationChecked){
  await page.locator('#btn-cancel-travel').click();
  await page.waitForFunction(()=>window.worldRouter.controller.enabled&&!document.querySelector('#elevator-cutscene').classList.contains('active'));
  assert.equal((await state()).zone,current);await record('Travel cancel button preserves zone and resumes controls');
  await aim(id);await page.waitForSelector('#elevator-cutscene.active');await page.keyboard.press('Escape');
  await page.waitForFunction(()=>window.worldRouter.controller.enabled&&!document.querySelector('#elevator-cutscene').classList.contains('active'));
  assert.equal((await state()).zone,current);await record('Travel Escape preserves zone and resumes controls');
  await aim(id);await page.waitForSelector('#elevator-cutscene.active');travelCancellationChecked=true;
 }

 await page.locator(`[data-floor="${floor}"]`).press('Enter');await page.waitForFunction(f=>window.worldRouter.activeZoneId===f&&window.worldRouter.controller.enabled,floor);await record(`travel ${kind} ${current} -> ${floor}`);
}
async function shot(name,yaw){if(yaw!==undefined)await page.evaluate(yaw=>{const c=window.worldRouter.controller;c.yaw=yaw;c.pitch=-.06;c.updateCameraRotation();},yaw);await page.waitForTimeout(200);const file=`${name}.jpg`;await page.screenshot({path:`${output}/${file}`,type:'jpeg',quality:85});report.screenshots.push(file);}
async function rooms(){
 const list=await page.evaluate(()=>window.worldRouter.activeZoneInstance.roomAreas||[]);
 for(const room of list){await walk(room.corridor[0],room.corridor[2]);await walk(room.point[0],room.point[2]);await shot(room.id,room.point[2]>room.corridor[2]?Math.PI:0);await walk(room.corridor[0],room.corridor[2]);report.rooms.push(room.id);await record(`room in/out ${room.id}`);}
}
try{
 page=await browser.newPage(browserSurface);report.browserSurface=browserSurface;report.persistentNetworkCache=!!process.env.DUTYNIGHT_QA_PROFILE;page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.goto(baseUrl,{timeout:600000});await page.waitForFunction(()=>window.worldRouter?.activeZoneInstance);report.initialLoadMs=Date.now()-Date.parse(report.started);assert.equal(await page.locator('#debug-zone-selector').count(),0);await record('Act1 production start');
 await walk(-10.2,1);await aim('ELEVATOR_BUTTON');assert.equal(await page.locator('#elevator-cutscene').evaluate(n=>n.classList.contains('active')),false);await record('3F lift locked before handoff');
 await path([[2.4,0],[2.4,3.5],[4,4.2],[5.6,5]]);await aim('KEY_PICKUP');await walk(6.4,5);await aim('DUTY_LOG');await page.locator('#btn-sign-log').click();await page.keyboard.press('Escape');await page.waitForTimeout(200);
 await walk(8.7,4.9);await aim('E_HANDOFF');await shot('316-his');await page.locator('#btn-sign-handoff').click();await page.keyboard.press('Escape');await page.waitForTimeout(200);await record('316 key log HIS completed');
 const tasks=await page.locator('#task-key,#task-log,#task-handoff').evaluateAll(ns=>ns.map(n=>({id:n.id,completed:n.classList.contains('completed')})));assert(tasks.every(t=>t.completed));report.tasks=tasks;
 await path([[8,4.2],[5,4.2],[2.4,3.5],[2.4,0],[16.8,0]]);await rooms();await shot('first_campus_3f',Math.PI/2);
 await path([[19,0],[19,5.5]]);await travel('first_campus_4f','stairs');assert(await page.locator('#task-elevator').evaluate(n=>n.classList.contains('completed')),'4F arrival completes elevator task UI');await path([[37,0],[5.4,0],[5.4,-3.8],[5.4,-5.5]]);await shot('first4-duty-room',Math.PI);await path([[5.4,-3.8],[5.4,-1]]);
 const door=await page.evaluate(()=>window.worldRouter.activeZoneInstance.interactables.find(x=>x.userData.type==='duty_door').userData.id);await aim(door);assert(await page.evaluate(()=>window.worldRouter.activeZoneInstance.dutyDoorClosed));await aim(door);assert(!await page.evaluate(()=>window.worldRouter.activeZoneInstance.dutyDoorClosed));await record('Duty room entry exit close reopen');
 await path([[5.4,0],[8,1.5]]);await shot('first_campus_4f',Math.PI);await path([[8,0],[12.3,0]]);
 await aim('WARD_GATE_ACCESS');assert(await page.evaluate(()=>window.worldRouter.activeZoneInstance.wardGateClosed),'Ward gate closes from outside');
 const beforeGatePush=await state();
 await page.evaluate(()=>{const c=window.worldRouter.controller;c.yaw=-Math.PI/2;c.pitch=0;c.updateCameraRotation();});
 await shot('ward-gate-closed',-Math.PI/2);await page.keyboard.down('KeyW');try{await page.waitForTimeout(1000);}finally{await page.keyboard.up('KeyW');}
 const closedGate=await page.evaluate(()=>{const r=window.worldRouter,c=r.controller;return {zone:r.activeZoneId,x:c.position.x,enabled:c.enabled,support:c.supportedHeight(c.position.x,c.position.z)};});
 assert.equal(closedGate.zone,'first_campus_4f');assert(closedGate.enabled);assert.notEqual(closedGate.support,null);assert(closedGate.x>beforeGatePush.position[0]+.1,'W input actually moves toward gate');assert(closedGate.x<14,'Closed ward gate blocks crossing');
 await record('Ward gate closed blocks actual W movement');
 await aim('WARD_GATE_ACCESS');assert.equal(await page.evaluate(()=>window.worldRouter.activeZoneInstance.wardGateClosed),false,'Ward gate reopens');
 await walk(15.5,0);await aim('WARD_GATE_ACCESS_INSIDE');assert(await page.evaluate(()=>window.worldRouter.activeZoneInstance.wardGateClosed));await aim('WARD_GATE_ACCESS_INSIDE');assert(!await page.evaluate(()=>window.worldRouter.activeZoneInstance.wardGateClosed));await record('Inside ward reader close and reopen');await walk(23,0);assert((await state()).position[0]>14);report.wardGate={closedBlocks:true,openAllows:true,closedProbe:closedGate};await record('Ward gate reopened allows passage');await rooms();await path([[37,0],[37,5.5]]);await travel('first_campus_3f','stairs');await path([[19,0],[-10.2,1]]);await travel('first_campus_1f');
 await path([[-4,0],[-4,5],[16,5],[16,0],[18.5,0]]);await rooms();await path([[16,0],[16,5],[-4,5],[-4,-6],[1,-6],[1,-11]]);await record('Lobby main entrance exit');await walk(1,-6);await shot('first_campus_1f',Math.PI);await path([[-4,-6],[-4,0],[-11.5,0]]);await travel('first_campus_2f');
 await path([[-8,0],[-8,18],[-5.5,18]]);await rooms();await path([[-5.5,18],[-8,18],[-8,0],[3.5,0],[3.5,-4.3],[2,-4.3],[2,-6.5]]);await shot('er-ect',Math.PI);await record('ER treatment ECT');await path([[2,-4.3],[3.5,-4.3],[3.5,0],[12.5,0],[12.5,-4.8]]);await record('ER chart office');await path([[12.5,0],[14,0],[14,4.5]]);await shot('first_campus_2f',Math.PI/2);await record('ER bedside');await path([[14,0],[3.5,2.1]]);await record('ER nurse station');await path([[3.5,0],[-9.5,0]]);await travel('first_campus_8f');await shot('first_campus_8f',-Math.PI/2);
 await walk(-.6,0,'skybridge');await record('first_to_bridge');await walk(.6,0,'first_campus_8f');await record('bridge_to_first');await walk(-.6,0,'skybridge');await walk(30,0);await shot('skybridge',-Math.PI/2);await walk(59.4,0,'second_campus_2f');await record('bridge_to_second');await walk(60.6,0,'skybridge');await record('second_to_bridge');await walk(59.4,0,'second_campus_2f');
 await rooms();await walk(67,1.8);await shot('second_campus_2f',Math.PI);await path([[67,0],[78,0],[78,-1.8]]);await travel('second_campus_3f');
 for(const f of [3,4,5,6,7,8]){
  await shot(`second_campus_${f}f`,Math.PI);await path([[77.5,0],[73,0],[73,4.5]]);await record(`second ${f}F station staff entry`);await path([[73,0]]);await rooms();await path([[77.5,0],[77.5,-1.3]]);await travel(`second_campus_${f===8?2:f+1}f`);
 }
 await path([[78,0],[78,2]]);await travel('second_campus_1f','stairs');await walk(76.2,0);await travel('second_campus_2f','stairs');await path([[78,0],[78,2]]);await travel('second_campus_1f','stairs');await shot('second_campus_1f',0);await path([[74,-3],[72,-3],[72,-10],[72,-15.5]]);await walk(72,-16.4,'hillside_route');await record('second_to_hill');
 await walk(71.3,-18.2,'second_campus_1f');await record('hill_to_second');await walk(72,-16.4,'hillside_route');await path([[65,-20],[55,-22],[42,-25]]);await shot('hillside_route',Math.PI/2);await path([[30,-28],[20,-32],[11.5,-34.55]]);await walk(10.7,-34.79,'first_campus_2f');await record('hill_to_er');await walk(29.1,0,'hillside_route');await record('er_to_hill');await path([[20,-32],[30,-28],[42,-25],[46,-30]]);await walk(49.6,-34.5,'ecology_pond');await record('hill_to_pond');await path([[53,-41.5],[56,-41.5],[61,-42]]);await shot('ecology_pond',-Math.PI/2);await path([[56,-41.5],[53,-41.5]]);await walk(53,-35.85,'hillside_route');await record('pond_to_hill');
 await path([[46,-30],[42,-25],[55,-22],[65,-20]]);await walk(71.3,-18.2,'second_campus_1f');await path([[72,-10],[72,-3],[74,-3],[74,.2]]);await travel('second_campus_2f');await path([[78,0],[61.5,0]]);await walk(60.6,0,'skybridge');await walk(.6,0,'first_campus_8f');await walk(-9.5,0);await travel('first_campus_3f');await record('Full loop returns to 3F');
 const returnedKey=await page.evaluate(()=>{const key=window.worldRouter.activeZoneInstance.keyMesh;return {visible:key.visible,targetVisible:key.userData.targetGroup.visible,interactable:key.userData.interactable};});
 assert.deepEqual(returnedKey,{visible:false,targetVisible:false,interactable:false},'Collected key stays hidden and noninteractive after full loop');report.returnedKey=returnedKey;
 assert.equal(report.zones.length,16);assert.equal(new Set(report.rooms).size,37);assert.equal(report.errors.length,0,JSON.stringify(report.errors));report.assets=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name).filter(n=>n.includes('/assets/')));report.verdict='PASS';
}catch(e){report.verdict='FAIL';report.failure=e.stack;if(page){report.lastState=await state().catch(()=>null);await page.screenshot({path:`${output}/failure.jpg`}).catch(()=>{});}process.exitCode=1;console.error(e.stack);
}finally{report.ended=new Date().toISOString();await writeFile(`${output}/result.json`,JSON.stringify(report,null,2));await browser.close();if(server)await new Promise(r=>server.httpServer.close(r));}
