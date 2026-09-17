import {chromium} from 'playwright';
import {preview} from 'vite';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {writeFile,mkdir} from 'node:fs/promises';
import {DEBUG_SPAWN_POINTS} from '../src/world/shared/DebugSpawnPoints.js';
const url=process.argv[2] || 'http://localhost:4173/';
const output=process.argv[3] || '.visual-work/smoke.json';
const server=process.argv[2]?null:await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4173,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' '+JSON.stringify(m.location()));});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto(url,{timeout:120000});
 await page.waitForFunction(()=>window.worldRouter?.activeZoneInstance,null,{timeout:120000});
 if(await page.locator('#debug-zone-selector').count())throw new Error('Production selector exposed');
 for(const id of Object.keys(DEBUG_SPAWN_POINTS)){
  await page.evaluate(id=>window.worldRouter.teleportToSpawn(id),id);
  await page.waitForTimeout(250);
 }
 const assets=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name).filter(n=>n.includes('/assets/')));
 await mkdir(dirname(output),{recursive:true});
 await writeFile(output,JSON.stringify({url,browser:browser.version(),spawns:Object.keys(DEBUG_SPAWN_POINTS).length,errors,assets,checkedAt:new Date().toISOString()},null,2));
 if(errors.length)throw new Error(JSON.stringify(errors));
 console.log('Public browser smoke PASS: 25 spawns, no shader/console/network errors, debug hidden');
}finally{await browser.close();if(server)await new Promise(r=>server.httpServer.close(r));}
