import {chromium} from 'playwright';
import {preview} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const out=process.argv[2]||'qa-results/browser';
const url=process.argv[3]||'http://127.0.0.1:4177/';
await mkdir(out,{recursive:true});
const server=process.argv[3]?null:await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{host:'127.0.0.1',port:4177,strictPort:true}});
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{channel:'chrome'}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const surface={viewport:{width:1280,height:720},deviceScaleFactor:process.env.CI?.5:1};
const page=await browser.newPage(surface);page.setDefaultTimeout(45000);
const report={url,source:process.env.DUTYNIGHT_SOURCE_SHA||process.env.GITHUB_SHA||'local',surface,method:'One production session. Routes use FPSController.moveWithCollision at <=0.04m increments; card readers use real raycast + keyboard E; floor selection uses DOM buttons. No direct task completion, loadZone, teleport or player-coordinate assignment. Camera aim is automated. Separate screenshot presets are not traversal evidence.',steps:[],zones:[],rooms:[],errors:[],screenshots:[],travelEvidence:[],movementSteps:0};
page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
const state=()=>page.evaluate(()=>({zone:window.worldRouter.activeZoneId,pos:window.worldRouter.controller.position.toArray(),enabled:window.worldRouter.controller.enabled}));
async function log(label){const s=await state();report.steps.push({label,...s});if(!report.zones.includes(s.zone))report.zones.push(s.zone);console.log(label,JSON.stringify(s));await writeFile(`${out}/progress.json`,JSON.stringify(report,null,2));}
async function cameraSettled(){await page.waitForFunction(()=>{const c=window.worldRouter.controller;return Math.hypot(c.camera.position.x-c.position.x,c.camera.position.z-c.position.z)<.02;});}
async function shot(name,yaw){if(yaw!==undefined)await page.evaluate(yaw=>{const c=window.worldRouter.controller;c.yaw=yaw;c.pitch=-.06;c.updateCameraRotation();},yaw);await page.waitForTimeout(250);await page.screenshot({path:`${out}/${name}.jpg`,quality:85,timeout:90000});report.screenshots.push(name+'.jpg');}
// The grid plans a route only. The production controller performs each actual step.
async function go(x,z){
 const n=await page.evaluate(({x,z})=>{
  const r=window.worldRouter,c=r.controller;if(!c.enabled)throw Error('Movement disabled');c.cancelAutoMove();
  const step=.4,sx=c.position.x,sz=c.position.z,key=(i,j)=>i+','+j;
  const ix=Math.round(sx/step),iz=Math.round(sz/step),tx=Math.round(x/step),tz=Math.round(z/step);
  const cache=new Map();const free=(i,j)=>{const k=key(i,j);if(!cache.has(k))cache.set(k,!c.checkCollision(i*step,j*step)&&c.supportedHeight(i*step,j*step)!==null);return cache.get(k);};
  const clearSegment=(a,b)=>{const n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/.1);for(let k=0;k<=n;k++){const t=n?k/n:0,px=a[0]+(b[0]-a[0])*t,pz=a[1]+(b[1]-a[1])*t;if(c.checkCollision(px,pz)||c.supportedHeight(px,pz)===null)return false;}return true;};
  const candidates=[];for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(free(ix+a,iz+b)&&clearSegment([sx,sz],[(ix+a)*step,(iz+b)*step]))candidates.push([ix+a,iz+b]);
  candidates.sort((a,b)=>Math.hypot(a[0]*step-sx,a[1]*step-sz)-Math.hypot(b[0]*step-sx,b[1]*step-sz));if(!candidates.length)throw Error(`No route start ${r.activeZoneId}: ${c.position.toArray()}`);
  const start=candidates[0],queue=[start],parents=new Map([[key(...start),null]]);let end=null;
  for(let q=0;q<queue.length&&q<20000;q++){
   const p=queue[q];if(Math.hypot(p[0]*step-x,p[1]*step-z)<.6&&clearSegment([p[0]*step,p[1]*step],[x,z])){end=p;break;}
   for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=p[0]+a,nj=p[1]+b,k=key(ni,nj);if(parents.has(k)||ni<Math.min(ix,tx)-40||ni>Math.max(ix,tx)+40||nj<Math.min(iz,tz)-60||nj>Math.max(iz,tz)+60||!free(ni,nj))continue;parents.set(k,p);queue.push([ni,nj]);}
  }
  if(!end)throw Error(`No supported route ${r.activeZoneId} ${sx},${sz} -> ${x},${z}; visited=${queue.length}`);
  const path=[];for(let p=end;p;p=parents.get(key(...p)))path.push([p[0]*step,p[1]*step]);path.reverse().push([x,z]);let count=0;
  for(const [px,pz] of path){for(let i=0;i<100;i++){const dx=px-c.position.x,dz=pz-c.position.z,d=Math.hypot(dx,dz);if(d<.015)break;const bx=c.position.x,bz=c.position.z;c.moveWithCollision(dx/d*Math.min(.04,d),dz/d*Math.min(.04,d));count++;if(Math.hypot(c.position.x-bx,c.position.z-bz)<.001)throw Error(`Controller stuck ${r.activeZoneId} at ${c.position.toArray()}`);}}
  if(Math.hypot(c.position.x-x,c.position.z-z)>.05)throw Error('Route did not arrive');return count;
 },{x,z});report.movementSteps+=n;await cameraSettled();
}
async function straight(x,z,expected){const from=(await state()).zone;const n=await page.evaluate(({x,z,expected})=>{const r=window.worldRouter,c=r.controller,origin=r.activeZoneId;let n=0;c.cancelAutoMove();for(let i=0;i<5000;i++){if(r.activeZoneId!==origin){if(r.activeZoneId!==expected)throw Error('Wrong portal destination');return n;}const dx=x-c.position.x,dz=z-c.position.z,d=Math.hypot(dx,dz);if(d<.02){r.update();return n;}const before=c.position.clone();c.moveWithCollision(dx/d*Math.min(.04,d),dz/d*Math.min(.04,d));n++;r.update();if(r.activeZoneId===origin&&c.position.distanceTo(before)<.001)throw Error(`Unsupported/blocked route ${origin} ${c.position.toArray()} -> ${x},${z}`);}throw Error('Movement exhausted');},{x,z,expected});report.movementSteps+=n;await cameraSettled();if(expected)assert.equal((await state()).zone,expected,from+' portal');}
async function use(id){
 console.log('USE',id);
 await cameraSettled();
 await page.evaluate(id=>{
  const r=window.worldRouter,c=r.controller;
  const matches=r.activeZoneInstance.interactables
   .filter(o=>o.userData?.id===id)
   .map(o=>({o,p:o.getWorldPosition(c.position.clone())}))
   .sort((a,b)=>a.p.distanceTo(c.position)-b.p.distanceTo(c.position));
  const o=matches[0]?.o;
  if(!o)throw Error('Missing interactable '+id);
  const p=o.getWorldPosition(c.position.clone()),d=p.sub(c.camera.position);
  c.yaw=Math.atan2(-d.x,-d.z);
  c.pitch=Math.atan2(d.y,Math.hypot(d.x,d.z));
  c.updateCameraRotation();
  c.camera.updateMatrixWorld(true);
  c.updateRaycast();
 },id);
 try{
  await page.waitForFunction(id=>window.worldRouter.controller.currentInteractable?.id===id,id,{timeout:20000});
 }catch(e){
  console.error('RAY_DIAGNOSTIC',await page.evaluate(id=>{
   const r=window.worldRouter,c=r.controller;
   const candidates=r.activeZoneInstance.interactables
    .filter(o=>o.userData?.id===id)
    .map(o=>({id:o.userData.id,world:o.getWorldPosition(c.position.clone()).toArray(),distance:o.getWorldPosition(c.position.clone()).distanceTo(c.position)}))
    .sort((a,b)=>a.distance-b.distance);
   return {id,position:c.position.toArray(),camera:c.camera.position.toArray(),candidates,current:c.currentInteractable?.id,yaw:c.yaw,pitch:c.pitch};
  },id));
  throw e;
 }
 await page.keyboard.press('KeyE');
 await page.waitForTimeout(180);
}
async function card(id,closed=false){const d=await page.evaluate(id=>{const r=window.worldRouter,c=r.controller,d=r.activeZoneInstance.accessDoors[id];if(!d)throw Error('Door missing '+id);return {closed:d.closed,reader:d.readers.map(o=>({id:o.userData.id,distance:o.getWorldPosition(c.position.clone()).distanceTo(c.position)})).sort((a,b)=>a.distance-b.distance)[0].id};},id);if(d.closed!==closed)await use(d.reader);assert.equal(await page.evaluate(id=>window.worldRouter.activeZoneInstance.accessDoors[id].closed,id),closed);}
async function portal(id,dest){const rid=await page.evaluate(id=>{const r=window.worldRouter,c=r.controller,d=r.activeZoneInstance.accessDoors[id];if(!d?.closed)throw Error('Portal should be opaque and closed');return d.readers.map(o=>({id:o.userData.id,d:o.getWorldPosition(c.position.clone()).distanceTo(c.position)})).sort((a,b)=>a.d-b.d)[0].id;},id);await use(rid);await page.waitForFunction(dest=>window.worldRouter.activeZoneId===dest&&window.worldRouter.controller.enabled,dest);await log(`card portal ${id} -> ${dest}`);}
let cancelled=false;
async function travel(dest,kind='elevator'){
 const current=(await state()).zone,core=await page.evaluate(()=>{const c=window.worldRouter.activeZoneInstance.verticalCore;return {origin:c.origin,layout:c.layout};}),[x,z]=core.origin;
 if(kind==='elevator')await go(x+1.65,z+2.6);else if(core.layout==='FIRST_CORE_V1')await go(x+6.7,z+1);else await go(x-5,z+2.5);
 const id=current+'_'+(kind==='elevator'?'elevator':'stairs');await use(id);await page.waitForSelector('#elevator-cutscene.active');
 const buttons=await page.locator('[data-floor]').evaluateAll(nodes=>nodes.map(n=>n.dataset.floor));assert.equal(buttons.length,current.startsWith('first')?5:3);assert(!buttons.includes('second_campus_4f_story'));assert.deepEqual(buttons.map(s=>Number(s.match(/_(\d)f/)[1])),current.startsWith('first')?[8,4,3,2,1]:[5,2,1]);await shot(`menu-${current}-${kind}`);assert(await page.locator(`[data-floor="${current}"]`).isDisabled());
 if(!cancelled){await page.locator('#btn-cancel-travel').click();await page.waitForFunction(()=>window.worldRouter.controller.enabled);assert.equal((await state()).zone,current);await use(id);await page.keyboard.press('Escape');await page.waitForFunction(()=>window.worldRouter.controller.enabled);await use(id);cancelled=true;}
 // Read-only event-time observation AFTER the real button handler, BEFORE its timer.
 // Independent protocol requests can exceed the 1.7s ride on software WebGL.
 await page.evaluate(dest=>{
  window.__travelStartEvidence=null;
  document.querySelector(`[data-floor="${dest}"]`).addEventListener('click',()=>{
   window.__travelStartEvidence={zone:window.worldRouter.activeZoneId,enabled:window.worldRouter.controller.enabled,
    arrow:document.querySelector('.floor-arrow').textContent,status:document.getElementById('elevator-status-text').textContent,
    travelling:document.getElementById('elevator-cutscene').dataset.travelling};
  },{once:true});
 },dest);
 await page.locator(`[data-floor="${dest}"]`).click();
 const up=Number(dest.match(/_(\d)f/)[1])>Number(current.match(/_(\d)f/)[1]);
 const proof=await page.evaluate(()=>window.__travelStartEvidence);
 assert.equal(proof.arrow,up?'▲':'▼');assert.equal(proof.zone,current,'Direction must display BEFORE arrival');
 assert.equal(proof.enabled,false);assert.equal(proof.travelling,'true');report.travelEvidence.push({from:current,to:dest,kind,...proof});
 await page.waitForFunction(dest=>window.worldRouter.activeZoneId===dest&&window.worldRouter.controller.enabled,dest);
 await shot(`arrival-${current}-${dest}-${kind}`);await log(`${kind} ${current} -> ${dest}`);
}
async function roomTour(){
 const rooms=await page.evaluate(()=>window.worldRouter.activeZoneInstance.roomAreas||[]);

 for(const room of rooms){
  await go(room.corridor[0],room.corridor[2]);

  // Second-campus doctor office is a controlled AccessDoor and must
  // remain normally closed. Exercise the real card reader before entry.
  const accessId=room.id==='DOCTOR'?'doctor_office':null;

  if(accessId){
   const startsClosed=await page.evaluate(
    id=>window.worldRouter.activeZoneInstance.accessDoors?.[id]?.closed,
    accessId
   );

   assert.equal(
    startsClosed,
    true,
    accessId+' must start closed'
   );

   await card(accessId);
  }

  await go(room.point[0],room.point[2]);
  await log('room '+room.id);
  report.rooms.push(room.id);

  await go(room.corridor[0],room.corridor[2]);

  // Restore normally-closed state after the visit.
  if(accessId){
   await card(accessId,true);
  }
 }
}try{
 await page.goto(url,{waitUntil:'load',timeout:180000});await page.waitForFunction(()=>window.worldRouter?.activeZoneInstance,null,{timeout:180000});await page.waitForTimeout(700);assert.equal(await page.locator('#debug-zone-selector').count(),0);await log('Production initial 3F');
 await go(5.6,5);await use('KEY_PICKUP');await go(6.4,5);await use('DUTY_LOG');await page.locator('#btn-sign-log').click();await page.waitForFunction(()=>window.worldRouter.controller.enabled);
 await go(8.7,4.9);
await use('E_HANDOFF');
await shot('his');

console.log('HIS_GEOMETRY', await page.evaluate(() => {
  const body = document.querySelector('.his-body');
  const footer = document.querySelector('.his-footer');
  const btn = document.querySelector('#btn-sign-handoff');
  const win = document.querySelector('.workstation-window');

  const rect = el => {
    const r = el.getBoundingClientRect();
    return {
      left:r.left,
      top:r.top,
      right:r.right,
      bottom:r.bottom,
      width:r.width,
      height:r.height
    };
  };

  const b = rect(btn);
  const cx = b.left + b.width / 2;
  const cy = b.top + b.height / 2;

  return {
    window: rect(win),
    body: rect(body),
    footer: rect(footer),
    button: b,
    buttonCenter: [cx, cy],
    elementAtButtonCenter: document.elementFromPoint(cx,cy)?.outerHTML?.slice(0,300),
    bodyStyle: {
      display:getComputedStyle(body).display,
      position:getComputedStyle(body).position,
      zIndex:getComputedStyle(body).zIndex,
      overflow:getComputedStyle(body).overflow,
      gridRow:getComputedStyle(body).gridRow
    },
    footerStyle: {
      display:getComputedStyle(footer).display,
      position:getComputedStyle(footer).position,
      zIndex:getComputedStyle(footer).zIndex,
      gridRow:getComputedStyle(footer).gridRow
    },
    windowStyle: {
      display:getComputedStyle(win).display,
      gridTemplateRows:getComputedStyle(win).gridTemplateRows,
      height:getComputedStyle(win).height
    }
  };
}));

const handoffButton = page.locator('#btn-sign-handoff');
const handoffBox = await handoffButton.boundingBox();
if (!handoffBox) throw Error('HIS handoff button has no bounding box');

const handoffX = handoffBox.x + handoffBox.width / 2;
const handoffY = handoffBox.y + handoffBox.height / 2;

const handoffHit = await page.evaluate(({x,y}) => {
  const hit = document.elementFromPoint(x,y);
  return {
    id: hit?.id,
    tag: hit?.tagName,
    text: hit?.textContent?.trim()
  };
},{x:handoffX,y:handoffY});

console.log('HIS_CLICK_TARGET',handoffHit);

if (handoffHit.id !== 'btn-sign-handoff') {
  throw Error('HIS button center is not actually clickable: '+JSON.stringify(handoffHit));
}

await page.evaluate(() => {
  window.__handoffEvents = [];

  const btn = document.getElementById('btn-sign-handoff');

  for (const type of ['pointerdown','mousedown','pointerup','mouseup','click']) {
    btn.addEventListener(type, () => {
      window.__handoffEvents.push('BUTTON:' + type);
    });
  }

  document.addEventListener('click', e => {
    window.__handoffEvents.push(
      'DOCUMENT:click:' + (e.target?.id || e.target?.className || e.target?.tagName)
    );
  }, {capture:true, once:true});
});

console.log('HIS_PRE_CLICK', await page.evaluate(() => ({
  enabled: window.worldRouter.controller.enabled,
  pointerLock: document.pointerLockElement
    ? (document.pointerLockElement.id || document.pointerLockElement.tagName)
    : null,
  modalActive: document.getElementById('workstation-modal').classList.contains('active'),
  taskCompleted: document.getElementById('task-handoff').classList.contains('completed')
})));

await page.mouse.move(handoffX,handoffY);
await page.mouse.down();
await page.mouse.up();
await page.waitForTimeout(500);

const handoffAfterMouse = await page.evaluate(() => ({
  enabled: window.worldRouter.controller.enabled,
  pointerLock: document.pointerLockElement
    ? (document.pointerLockElement.id || document.pointerLockElement.tagName)
    : null,
  modalActive: document.getElementById('workstation-modal').classList.contains('active'),
  taskCompleted: document.getElementById('task-handoff').classList.contains('completed'),
  events: window.__handoffEvents
}));

console.log('HIS_POST_MOUSE', handoffAfterMouse);

if (!handoffAfterMouse.enabled) {
  throw Error('HANDOFF_MOUSE_DIAGNOSTIC ' + JSON.stringify(handoffAfterMouse));
}
await page.waitForFunction(()=>window.worldRouter.controller.enabled);
await log('key / log / HIS via real UI');
 assert(await page.locator('#task-key,#task-log,#task-handoff').evaluateAll(ns=>ns.length===3&&ns.every(n=>n.classList.contains('completed'))));
 await travel('first_campus_4f');await shot('4f-lobby',0);await go(-6.5,6);assert.equal(await page.evaluate(()=>window.worldRouter.activeZoneInstance.dutyDoor?.closed),true,'Duty-room keyed knob door must start closed');await shot('duty-door-closed',Math.PI/2);await use('duty_room');assert.equal(await page.evaluate(()=>window.worldRouter.activeZoneInstance.dutyDoor?.closed),false,'316 key must open duty-room knob lock');await go(-9.5,6);await shot('duty-room',Math.PI/2);await go(-6.5,6);
 await go(0,3.2);await page.evaluate(()=>{const c=window.worldRouter.controller;c.yaw=0;c.pitch=0;c.updateCameraRotation();});await page.keyboard.down('KeyW');await page.waitForTimeout(1200);await page.keyboard.up('KeyW');assert((await state()).pos[2]>2.4,'Actual W must not cross closed gate');await go(.8,3.2);await card('first_ward');await go(0,-2);await shot('first-ward-hall',0);await roomTour();await go(-1.0,-3);await shot('first-station',-Math.PI/2);await go(0,3.2);
 await travel('first_campus_3f','stairs');await travel('first_campus_1f');await go(1,-6.8);await use('1F_MAIN_DOOR');assert((await page.locator('#subtitle-text').innerText()).includes('出不去'));await shot('1f-locked-glass',Math.PI);
 for(const [z,id] of [[-4,'1F_PHARM_GATE'],[4,'1F_OPD_GATE']]){await go(16.5,z);await use(id);await shot(`locked-${id}`,-Math.PI/2);assert.equal(await page.evaluate(id=>window.worldRouter.activeZoneInstance.interactables.find(o=>o.userData.id===id).userData.locked,id),true);}
 await go(-8,6.3);await shot('1f-clear-lift-opening',Math.PI);await travel('first_campus_2f');
 await go(-1.2,0);await card('ER_MAIN');await go(6.4,2.3);await shot('er-staff-entry',Math.PI);await card('ER_NURSE_ENTRY');await go(6.4,6);await shot('er-staff-bed-glass',-Math.PI/2);await card('ER_NURSE_BEDS');await go(9.6,6);await log('Staff-to-beds glass passage via two real card readers');await go(14.5,4.6);await card('ER_BEDS');await log('Entered controlled ER bed area');await go(20.5,0);await card('ER_HILLSIDE');await go(24,0);await shot('er-hillside',Math.PI/2);await go(20.5,0);await card('ER_HILLSIDE',true);await travel('first_campus_8f');
 await go(-1.6,0);await shot('8f-card-gate',-Math.PI/2);await portal('BRIDGE_ACCESS','skybridge');await straight(30,0);await shot('bridge-middle',-Math.PI/2);await straight(58.4,0);await portal('BRIDGE_SECOND','second_campus_2f');await shot('second2-gate',Math.PI/2);await travel('second_campus_5f');await shot('second5-core',Math.PI);await go(72,3.2);await shot('second5-direct-entry',0);await card('second_ward');await go(72,.6);await shot('second5-inside-station',0);await go(72,-2.5);await go(74.3,-2.5);await shot('second5-staff-reader',0);await card('second_station_staff');await go(74.3,-5.4);await log('Second-campus entry -> protected nursing station -> activity hall');await roomTour();await go(71,-9);await shot('second5-station',Math.PI);await log('All 501-509 rooms visited');
 await travel('second_campus_1f');await shot('second1-guard',0);await go(72,-3);await straight(72,-10);await straight(72,-15.5);await straight(72,-16.4,'hillside_route');await log('Hillside via guard exit');
 for(const [x,z] of [[65,-20],[55,-22],[42,-25],[46,-30]])await straight(x,z);await straight(49.6,-34.5,'ecology_pond');await log('Pond reached');
 for(const [x,z] of [[53,-41.5],[56,-41.5],[62,-42],[62,-46],[62,-47.7],[62,-50.8],[62,-51.8]])await straight(x,z);await shot('pond-waterfront',0);assert((await state()).pos[2]<-51.5);await log('Close waterfront deck reached with ground support');
 for(const [x,z] of [[62,-50.8],[62,-47.7],[62,-46],[62,-42],[56,-41.5],[53,-41.5]])await straight(x,z);await straight(53,-35.85,'hillside_route');for(const [x,z] of [[46,-30],[42,-25],[55,-22],[65,-20]])await straight(x,z);await straight(71.3,-18.2,'second_campus_1f');await straight(72,-10);await go(72,-3);await travel('second_campus_2f','stairs');await go(61.6,0);await portal('BRIDGE_ACCESS','skybridge');await straight(1.6,0);await portal('BRIDGE_FIRST','first_campus_8f');await travel('first_campus_3f');await log('Full circuit returned to 3F');
 const key=await page.evaluate(()=>window.worldRouter.activeZoneInstance.keyMesh.userData.interactable);assert.equal(key,false,'Key remains collected');assert.equal(report.zones.length,11);assert(report.rooms.includes('402'));assert.equal(report.errors.length,0,JSON.stringify(report.errors));report.verdict='PASS';
}catch(e){report.verdict='FAIL';report.failure=e.stack;report.last=await state().catch(()=>null);await page.screenshot({path:`${out}/failure.jpg`,timeout:15000}).catch(()=>{});process.exitCode=1;console.error(e.stack);
}finally{await writeFile(`${out}/result.json`,JSON.stringify(report,null,2));await browser.close();if(server)await new Promise(r=>server.httpServer.close(r));}
