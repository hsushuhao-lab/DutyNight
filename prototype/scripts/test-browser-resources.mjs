import {chromium} from 'playwright';
import {preview} from 'vite';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const output=process.argv[2]||'.visual-work/browser-resources.json';
const server=await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4173,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:960,height:600}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://localhost:4173/?debug=1');
 await page.waitForFunction(()=>typeof window.renderResourceStats==='function');
 const samples=[];
 const zones=await page.evaluate(()=>Object.keys(window.worldRouter.zones));
 for(let cycle=0;cycle<4;cycle++){
  for(const zone of zones){await page.evaluate(zone=>window.worldRouter.loadZone(zone),zone);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
  await page.evaluate(()=>window.worldRouter.loadZone('first_campus_3f'));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  samples.push(await page.evaluate(()=>window.renderResourceStats()));
 }
 assert.deepEqual(samples[3],samples[1],'GPU geometry/texture counts must stabilize after all zones warm');
 assert.equal(errors.length,0,JSON.stringify(errors));
 await mkdir(fileURLToPath(new URL('../../.visual-work/',import.meta.url)),{recursive:true});
 await writeFile(output,JSON.stringify({cycles:4,zonesPerCycle:zones.length,samples,errors,verdict:'PASS'},null,2));
 console.log('Browser GPU resource counts stable: '+JSON.stringify(samples));
}finally{await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
