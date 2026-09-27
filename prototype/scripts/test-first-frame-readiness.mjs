import {chromium} from 'playwright';
import {preview} from 'vite';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.argv[2]||'prototype/qa-results/first-frame-hotfix';
await mkdir(out,{recursive:true});
const server=await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4191,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={verdict:'FAIL',visits:[],errors:[]};
try{
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
 await page.addInitScript(()=>{
   const observer=new MutationObserver(()=>{
     if(!document.getElementById('asset-loading-mask')&&window.__materialAudit&&!window.__firstFrameAudit){
       window.__firstFrameAudit={ms:performance.now(),audit:window.__materialAudit()};observer.disconnect();
     }
   });observer.observe(document,{childList:true,subtree:true});
 });
 for(const mode of ['cold','warm']){
   await page.goto('http://localhost:4191/?qa=story');
   await page.waitForFunction(()=>window.__firstFrameAudit,null,{timeout:120000});
   const first=await page.evaluate(()=>window.__firstFrameAudit);
   const required=first.audit.materials.filter(m=>['wall','wallDark','floor','floorTile','floorWood','doorWood','ceiling','handrail'].includes(m.materialName.slice(9)));
   assert(required.length>0);
   for(const m of required){assert.equal(m.flatMeshCount,0,m.materialName);assert.equal(m.pbrMeshCount,m.meshCount,m.materialName);assert(m.mapImageWidth>0&&m.mapImageHeight>0);}
   await page.screenshot({path:`${out}/${mode}-FIRST_PLAYABLE_FRAME.png`});
   await page.waitForTimeout(5000);
   const after=await page.evaluate(()=>window.__materialAudit());
   await page.screenshot({path:`${out}/${mode}-AFTER_5_SEC.png`});
   report.visits.push({mode,first,after});
 }
 assert.deepEqual(report.errors,[]);report.verdict='PASS';
} catch(error){report.errors.push(error.stack);throw error;}
finally{await writeFile(`${out}/result.json`,JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.httpServer.close(r));}
