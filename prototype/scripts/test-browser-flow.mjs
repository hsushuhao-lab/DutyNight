import { chromium } from 'playwright';
import { preview } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output = process.argv[2] || '../.visual-work/flow';
await mkdir(output,{recursive:true});
const baseUrl=process.argv[3] || 'http://localhost:4173/';
const server=process.argv[3] ? null : await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4173,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try {
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto(baseUrl);await page.waitForFunction(()=>window.worldRouter?.activeZoneInstance);
async function aim(id,position){
await page.evaluate(({id,position})=>{const r=window.worldRouter;const target=r.activeZoneInstance.interactables.find(o=>o.userData.id===id);const t=target.getWorldPosition(r.camera.position.clone());r.controller.teleport(...position);const dx=t.x-position[0],dy=t.y-position[1],dz=t.z-position[2];r.controller.yaw=Math.atan2(-dx,-dz);r.controller.pitch=Math.atan2(dy,Math.hypot(dx,dz));r.controller.updateCameraRotation();},{id,position});
await page.waitForFunction(id=>window.worldRouter.controller.currentInteractable?.id===id,id);
await page.keyboard.press('KeyE');
}
await aim('KEY_PICKUP',[5.6,1.7,5]);
await aim('DUTY_LOG',[6.4,1.7,5]);await page.locator('#btn-sign-log').click();
await page.waitForTimeout(300); await page.keyboard.press('Escape');
await aim('E_HANDOFF',[8.7,1.7,4.9]);
await page.waitForSelector('#workstation-modal.active');await page.screenshot({path:`${output}/his-desktop.png`});
for(const width of [768,375]) {await page.setViewportSize({width,height:900});await page.screenshot({path:`${output}/his-${width}.png`});}
await page.setViewportSize({width:1440,height:900});await page.locator('#btn-sign-handoff').click();
await page.waitForTimeout(300);await page.keyboard.press('Escape');
const tasks=await page.locator('#task-key,#task-log,#task-handoff').evaluateAll(nodes=>nodes.map(n=>({id:n.id,className:n.className})));
if(tasks.some(t=>!t.className.includes('completed')))throw new Error(JSON.stringify(tasks));
await page.evaluate(()=>window.worldRouter.loadZone('first_campus_4f'));
const doorId=await page.evaluate(()=>window.worldRouter.activeZoneInstance.interactables.find(x=>x.userData.type==='duty_door').userData.id);
await aim(doorId,[5.7,1.7,-1.3]);
const closed=await page.evaluate(()=>window.worldRouter.activeZoneInstance.dutyDoorClosed);
if(!closed)throw new Error('Door did not close through E interaction');
await page.evaluate(()=>window.worldRouter.loadZone('first_campus_3f'));
if(await page.evaluate(()=>window.worldRouter.activeZoneInstance.keyMesh.visible))throw new Error('Collected key visually reappears after returning to 3F');
await page.evaluate(()=>window.worldRouter.loadZone('first_campus_4f'));
if(!await page.evaluate(()=>window.worldRouter.activeZoneInstance.dutyDoorClosed))throw new Error('Door closed state lost on zone return');
await writeFile(`${output}/result.json`,JSON.stringify({tasks,doorClosedByKeyboard:closed,doorStatePersists:true,errors},null,2));
if(errors.length)throw new Error(JSON.stringify(errors));console.log('Browser key pickup, duty log signature, HIS signature, responsive terminal and door persistence PASS');
}finally{await browser.close();if(server)await new Promise(r=>server.httpServer.close(r));}
