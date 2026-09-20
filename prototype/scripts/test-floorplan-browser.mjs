import {chromium} from 'playwright';
import {preview} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const out=process.argv[2]||'qa-results/browser';
const url=process.argv[3]||'http://127.0.0.1:4177/';
await mkdir(out,{recursive:true});
const server=process.argv[3]?null:await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{host:'127.0.0.1',port:4177,strictPort:true}});
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
page.setDefaultTimeout(30000);
const report={url,source:process.env.DUTYNIGHT_SOURCE_SHA||process.env.GITHUB_SHA||'local',method:'One production session. Routes use actual FPSController.moveWithCollision at <=0.04m increments; card readers use real raycast + keyboard E; floor selection uses DOM buttons. No direct task completion, loadZone, teleport, or player-coordinate assignment in this browser test. Camera aim is automated. Separate screenshot presets are not traversal evidence.',steps:[],zones:[],rooms:[],errors:[],screenshots:[],movementSteps:0};
page.on('pageerror',e=>report.errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
const state=()=>page.evaluate(()=>({zone:window.worldRouter.activeZoneId,pos:window.worldRouter.controller.position.toArray(),enabled:window.worldRouter.controller.enabled}));
async function log(label){const s=await state();report.steps.push({label,...s});if(!report.zones.includes(s.zone))report.zones.push(s.zone);console.log(label,JSON.stringify(s));await writeFile(`${out}/progress.json`,JSON.stringify(report,null,2));}
async function shot(name,yaw){if(yaw!==undefined)await page.evaluate(yaw=>{const c=window.worldRouter.controller;c.yaw=yaw;c.pitch=-.06;c.updateCameraRotation();},yaw);await page.waitForTimeout(250);await page.screenshot({path:`${out}/${name}.jpg`,quality:85});report.screenshots.push(name+'.jpg');}
// Grid search only plans routes; every actual step still goes through gameplay collision and ground support.
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
 },{x,z});report.movementSteps+=n;await page.waitForTimeout(120);
}
async function straight(x,z,expected){const from=(await state()).zone;const n=await page.evaluate(({x,z,expected})=>{const r=window.worldRouter,c=r.controller,origin=r.activeZoneId;let n=0;c.cancelAutoMove();for(let i=0;i<5000;i++){if(r.activeZoneId!==origin){if(r.activeZoneId!==expected)throw Error('Wrong portal destination');return n;}const dx=x-c.position.x,dz=z-c.position.z,d=Math.hypot(dx,dz);if(d<.02){r.update();return n;}const before=c.position.clone();c.moveWithCollision(dx/d*Math.min(.04,d),dz/d*Math.min(.04,d));n++;r.update();if(r.activeZoneId===origin&&c.position.distanceTo(before)<.001)throw Error(`Unsupported/blocked route ${origin} ${c.position.toArray()} -> ${x},${z}`);}throw Error('Movement exhausted');},{x,z,expected});report.movementSteps+=n;await page.waitForTimeout(180);if(expected)assert.equal((await state()).zone,expected,from+' portal');}
async function use(id){await page.evaluate(id=>{const r=window.worldRouter,c=r.controller,o=r.activeZoneInstance.interactables.find(o=>o.userData.id===id);if(!o)throw Error('Missing interactable '+id);const p=o.getWorldPosition(c.position.clone()),d=p.sub(c.camera.position);c.yaw=Math.atan2(-d.x,-d.z);c.pitch=Math.atan2(d.y,Math.hypot(d.x,d.z));c.updateCameraRotation();},id);await page.waitForFunction(id=>window.worldRouter.controller.currentInteractable?.id===id,id,{timeout:12000});await page.keyboard.press('KeyE');await page.waitForTimeout(180);}
async function card(id,closed=false){const d=await page.evaluate(id=>{const r=window.worldRouter,c=r.controller,d=r.activeZoneInstance.accessDoors[id];if(!d)throw Error('Door missing '+id);return {closed:d.closed,reader:d.readers.map(o=>({id:o.userData.id,distance:o.getWorldPosition(c.position.clone()).distanceTo(c.position)})).sort((a,b)=>a.distance-b.distance)[0].id};},id);if(d.closed!==closed)await use(d.reader);assert.equal(await page.evaluate(id=>window.worldRouter.activeZoneInstance.accessDoors[id].closed,id),closed);}
async function portal(id,dest){const rid=await page.evaluate(id=>{const r=window.worldRouter,c=r.controller,d=r.activeZoneInstance.accessDoors[id];if(!d?.closed)throw Error('Portal should be opaque and closed');return d.readers.map(o=>({id:o.userData.id,d:o.getWorldPosition(c.position.clone()).distanceTo(c.position)})).sort((a,b)=>a.d-b.d)[0].id;},id);await use(rid);await page.waitForFunction(dest=>window.worldRouter.activeZoneId===dest&&window.worldRouter.controller.enabled,dest);await log(`card portal ${id} -> ${dest}`);}
let cancelled=false;
async function travel(dest,kind='elevator'){
 const current=(await state()).zone,core=await page.evaluate(()=>window.worldRouter.activeZoneInstance.verticalCore),[x,z]=core.origin;
 if(kind==='elevator')await go(x+1.65,z+2.6);else if(core.layout==='FIRST_CORE_V1')await go(x+6.7,z+1);else await go(x-5,z+2.5);
 const id=current+'_'+(kind==='elevator'?'elevator':'stairs');await use(id);await page.waitForSelector('#elevator-cutscene.active');
 const buttons=await page.locator('[data-floor]').evaluateAll(nodes=>nodes.map(n=>n.dataset.floor));assert.equal(buttons.length,current.startsWith('first')?5:3);assert(!buttons.includes('second_campus_4f_story'));assert(await page.locator(`[data-floor="${current}"]`).isDisabled());
 if(!cancelled){await page.locator('#btn-cancel-travel').click();await page.waitForFunction(()=>window.worldRouter.controller.enabled);assert.equal((await state()).zone,current);await use(id);await page.keyboard.press('Escape');await page.waitForFunction(()=>window.worldRouter.controller.enabled);await use(id);cancelled=true;}
 await page.locator(`[data-floor="${dest}"]`).click();
 const up=Number(dest.match(/_(\d)f/)[1])>Number(current.match(/_(\d)f/)[1]);
 assert.equal(await page.locator('.floor-arrow').innerText(),up?'▲':'▼');assert.equal((await state()).zone,current,'Direction must display BEFORE arrival');
 await shot(`travel-${current}-${dest}-${kind}`);
 await page.waitForFunction(dest=>window.worldRouter.activeZoneId===dest&&window.worldRouter.controller.enabled,dest);await log(`${kind} ${current} -> ${dest}`);
}
async function roomTour(){const rooms=await page.evaluate(()=>window.worldRouter.activeZoneInstance.roomAreas||[]);for(const room of rooms){await go(room.corridor[0],room.corridor[2]);await go(room.point[0],room.point[2]);await log('room '+room.id);report.rooms.push(room.id);await go(room.corridor[0],room.corridor[2]);}}
try{
 await page.goto(url,{waitUntil:'load',timeout:180000});await page.waitForFunction(()=>window.worldRouter?.activeZoneInstance,null,{timeout:180000});await page.waitForTimeout(700);assert.equal(await page.locator('#debug-zone-selector').count(),0);await log('Production initial 3F');
 await go(5.6,5);await use('KEY_PICKUP');await go(6.4,5);await use('DUTY_LOG');await page.locator('#btn-sign-log').click();await page.waitForFunction(()=>window.worldRouter.controller.enabled);
 await go(8.7,4.9);await use('E_HANDOFF');await shot('his');await page.locator('#btn-sign-handoff').click();await page.waitForFunction(()=>window.worldRouter.controller.enabled);await log('key / log / HIS via real UI');
 assert(await page.locator('#task-key,#task-log,#task-handoff').evaluateAll(ns=>ns.length===3&&ns.every(n=>n.classList.contains('completed'))));
 await travel('first_campus_4f');await shot('4f-lobby',0);await go(-6.5,6);await card('duty_room',true);await shot('duty-door-closed',Math.PI/2);await card('duty_room',false);await go(-9.5,6);await shot('duty-room',Math.PI/2);await go(-6.5,6);
 await go(0,1.2);await page.evaluate(()=>{const c=window.worldRouter.controller;c.yaw=0;c.pitch=0;c.updateCameraRotation();});await page.keyboard.down('KeyW');await page.waitForTimeout(1200);await page.keyboard.up('KeyW');assert((await state()).pos[2]>.4,'Actual W must not cross closed gate');await go(.8,1.2);await card('first_ward');await go(0,-2);await shot('first-ward-hall',0);await roomTour();await go(3.5,-3);await shot('first-station',-Math.PI/2);await go(0,1.2);
 await travel('first_campus_3f','stairs');await travel('first_campus_1f');await go(1,-6.8);await use('1F_MAIN_DOOR');assert((await page.locator('#subtitle-text').innerText()).includes('出不去'));await shot('1f-locked-glass',Math.PI);await travel('first_campus_2f');
 await go(-1.2,0);await card('ER_MAIN');await go(14.5,1.8);await shot('er-beds-closed',Math.PI);await card('ER_BEDS');await go(14.5,4.6);await log('Entered controlled ER bed area');await go(20.5,0);await card('ER_HILLSIDE');await go(24,0);await shot('er-hillside',Math.PI/2);await go(20.5,0);await card('ER_HILLSIDE',true);await travel('first_campus_8f');
 await go(-1.6,0);await shot('8f-card-gate',-Math.PI/2);await portal('BRIDGE_ACCESS','skybridge');await straight(30,0);await shot('bridge-middle',-Math.PI/2);await straight(58.4,0);await portal('BRIDGE_SECOND','second_campus_2f');await shot('second2-gate',Math.PI/2);await travel('second_campus_5f');await shot('second5-core',Math.PI);await go(76.4,1.2);await card('second_ward');await roomTour();await go(71,-9);await shot('second5-station',Math.PI);await log('All 501-509 rooms visited');
 await travel('second_campus_1f');await shot('second1-guard',0);await go(72,-3);await straight(72,-10);await straight(72,-15.5);await straight(72,-16.4,'hillside_route');await log('Hillside via guard exit');
 for(const [x,z] of [[65,-20],[55,-22],[42,-25],[46,-30]])await straight(x,z);await straight(49.6,-34.5,'ecology_pond');await log('Pond reached');
 for(const [x,z] of [[53,-41.5],[56,-41.5],[62,-42],[62,-46],[62,-47.7],[62,-50.8],[62,-51.8]])await straight(x,z);await shot('pond-waterfront',0);assert((await state()).pos[2]<-51.5);await log('Close waterfront deck reached with ground support');
 for(const [x,z] of [[62,-50.8],[62,-47.7],[62,-46],[62,-42],[56,-41.5],[53,-41.5]])await straight(x,z);await straight(53,-35.85,'hillside_route');for(const [x,z] of [[46,-30],[42,-25],[55,-22],[65,-20]])await straight(x,z);await straight(71.3,-18.2,'second_campus_1f');await straight(72,-10);await go(72,-3);await travel('second_campus_2f','stairs');await go(61.6,0);await portal('BRIDGE_ACCESS','skybridge');await straight(1.6,0);await portal('BRIDGE_FIRST','first_campus_8f');await travel('first_campus_3f');await log('Full circuit returned to 3F');
 const key=await page.evaluate(()=>window.worldRouter.activeZoneInstance.keyMesh.userData.interactable);assert.equal(key,false,'Key remains collected');
 assert.equal(report.zones.length,11);assert(report.rooms.includes('402'));assert.equal(report.errors.length,0,JSON.stringify(report.errors));report.verdict='PASS';
}catch(e){report.verdict='FAIL';report.failure=e.stack;report.last=await state().catch(()=>null);await page.screenshot({path:`${out}/failure.jpg`}).catch(()=>{});process.exitCode=1;console.error(e.stack);
}finally{await writeFile(`${out}/result.json`,JSON.stringify(report,null,2));await browser.close();if(server)await new Promise(r=>server.httpServer.close(r));}
