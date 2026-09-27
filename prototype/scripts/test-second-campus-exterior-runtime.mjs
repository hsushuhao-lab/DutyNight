import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {preview} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
const output=process.argv[2]||'qa-results/second-campus-cold-exterior';
const base=process.argv[3]||'http://localhost:4187/';
const server=process.argv[3]?null:await preview({preview:{port:4187,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={verdict:'FAIL',url:base,sourceSha:process.env.GITHUB_SHA||'working-tree',requests:[],errors:[]};
try{
 await mkdir(output,{recursive:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('request',r=>{if(/Ground037|Asphalt033|campusTree/.test(r.url()))report.requests.push(r.url());});
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(base+'?zone=second_campus_1f&capture=1');
 await page.waitForFunction(()=>window.worldRouter?.activeZoneId==='second_campus_1f');
 await page.waitForFunction(()=>['hospital/terrainGrass','hospital/pathGravel'].every(name=>{
   const m=window.__materialAudit().materials.find(m=>m.materialName===name);
   return m&&m.flatMeshCount===0&&m.pbrMeshCount===m.meshCount&&m.mapImageWidth>0;
 }),null,{timeout:process.argv[3]?300000:30000});
 report.audit=await page.evaluate(()=>window.__materialAudit());
 assert.equal(new Set(report.requests.filter(u=>/Ground037|Asphalt033/.test(u))).size,6);
 assert(!report.requests.some(u=>u.includes('campusTree')));
 await page.evaluate(()=>window.worldRouter.teleportToSpawn('m10_second_campus_1f'));
 await page.screenshot({path:output+'/cold-second-1f.png'});
 assert.deepEqual(report.errors,[]);report.verdict='PASS';
}catch(e){report.errors.push(e.stack);process.exitCode=1;}finally{await writeFile(output+'/result.json',JSON.stringify(report,null,2));await browser.close();if(server)await new Promise(r=>server.httpServer.close(r));}
console.log(JSON.stringify({verdict:report.verdict,requests:report.requests,errors:report.errors}));
