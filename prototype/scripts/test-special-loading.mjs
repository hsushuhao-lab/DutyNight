import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output=process.argv[2]||'qa-results/special-loading';
const base=process.argv[3]||'http://localhost:4173/';
const server=process.argv[3]?null:await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4173,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={sourceSha:process.env.GITHUB_SHA||'working-tree',verdict:'FAIL',rows:[],errors:[]};
try{
 await mkdir(output,{recursive:true});
 for(const route of ['skybridge','phantom_6f','b2_archive']){
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  for(const cache of ['cold','warm']){
   await page.goto(`${base}?qa=story`,{timeout:120000});
   await page.waitForFunction(()=>window.__storyQA?.worldRouter?.activeZoneInstance);
   await page.evaluate(route=>{
    const q=window.__storyQA;
    for(const flag of ['STAFF_ACCESS_CARD','SECOND_CAMPUS_ACCESS','HIDDEN_SERVICE_DOOR_DISCOVERED','B_PANEL_KEY','M7_B2_OPEN'])q.setFlag(flag,true);
    for(const task of ['KEY_PICKUP','DUTY_LOG','E_HANDOFF'])q.task(task);
    q.load(route==='skybridge'?'first_campus_8f':route==='b2_archive'?'first_campus_1f':'first_campus_3f');
    if(route==='phantom_6f')q.setFlag('FLOOR6_AVAILABLE',true);
    const original=q.worldRouter.loadZone.bind(q.worldRouter);
    q.worldRouter.loadZone=(...args)=>{const value=original(...args);window.__zoneReady=performance.now();return value;};
    window.__loadingStart=performance.now();
    if(route==='skybridge')q.interact({type:'access_door',doorId:'BRIDGE_ACCESS'});
    else if(route==='b2_archive')q.interact({type:'hidden_service_door_1f'});
    else q.interact({type:'elevator'});
   },route);
   if(route==='phantom_6f')await page.locator('button[data-floor="first_campus_4f"]').click();
   await page.waitForFunction(route=>window.__storyQA.worldRouter.activeZoneId===route&&window.__storyQA.controller.enabled,route,{timeout:20000});
   const state=await page.evaluate(()=>({zone:window.__storyQA.worldRouter.activeZoneId,elapsedMs:performance.now()-window.__loadingStart,zoneReadyMs:window.__zoneReady-window.__loadingStart,enabled:window.__storyQA.controller.enabled,resources:performance.getEntriesByType('resource').filter(r=>r.startTime>=window.__loadingStart).map(r=>({name:r.name,bytes:r.transferSize}))}));
   assert(state.zoneReadyMs<10000,`${route} ${cache} scene readiness: ${state.zoneReadyMs} ms`);
   report.rows.push({route,cache,...state});
   await page.screenshot({path:`${output}/${route}-${cache}.png`});
  }
  await context.close();
 }
 assert.deepEqual(report.errors,[]);
 report.verdict='PASS';
}catch(e){report.errors.push(e.stack);process.exitCode=1;}
finally{await writeFile(`${output}/result.json`,JSON.stringify(report,null,2));await browser.close();if(server)await new Promise(r=>server.httpServer.close(r));}
console.log(JSON.stringify(report));
