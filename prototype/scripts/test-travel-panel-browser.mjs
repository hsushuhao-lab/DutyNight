import {chromium} from 'playwright';
import {preview} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const output=process.argv[2]||'../docs/traversal-qa/panels';await mkdir(output,{recursive:true});
const server=await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4173,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[],panels=[];
try{
 const page=await browser.newPage({viewport:{width:960,height:720}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4173/');await page.waitForFunction(()=>window.worldRouter?.activeZoneInstance);
 const zones=await page.evaluate(()=>Object.keys(window.worldRouter.zones).filter(z=>z!=='second_campus_std'));
 for(const zone of zones){
  const ids=await page.evaluate(zone=>{const r=window.worldRouter;r.loadZone(zone);return r.activeZoneInstance.interactables.filter(o=>o.userData.type==='travel_selector').map(o=>o.userData.id);},zone);
  for(const id of ids){
   await page.evaluate(id=>{const r=window.worldRouter,c=r.controller,button=r.activeZoneInstance.interactables.find(o=>o.userData.id===id),root=button.parent;const front=root.localToWorld(c.position.clone().set(.45,.35,1.6));c.teleport(front.x,front.y,front.z);const target=button.getWorldPosition(c.position.clone()),d=target.sub(c.camera.position);c.yaw=Math.atan2(-d.x,-d.z);c.pitch=Math.atan2(d.y,Math.hypot(d.x,d.z));c.updateCameraRotation();},id);
   await page.waitForFunction(id=>window.worldRouter.controller.currentInteractable?.id===id,id);await page.waitForTimeout(120);await page.screenshot({path:`${output}/${id}.jpg`,type:'jpeg',quality:85});panels.push({zone,id,raycastReachable:true});
  }
 }
 assert.equal(panels.length,16);assert.deepEqual(errors,[]);await writeFile(`${output}/result.json`,JSON.stringify({verdict:'PASS',method:'Isolated oblique closeups via QA positioning; continuous movement is tested separately.',panels,errors},null,2));console.log('PANEL BROWSER PASS: 16 attached panel closeups and reachable controls');
}finally{await browser.close();await new Promise(r=>server.httpServer.close(r));}
