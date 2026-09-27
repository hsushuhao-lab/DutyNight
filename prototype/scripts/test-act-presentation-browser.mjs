import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { mkdir,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output=process.argv[2]||'qa-results/act-presentation';
const base=process.argv[3]||'http://localhost:4173/';
const server=process.argv[3]?null:await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4173,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={verdict:'FAIL',errors:[],states:[]};
try{
 await mkdir(output,{recursive:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base);
 await page.locator('.act-presentation.active').waitFor({timeout:30000});
 assert.equal(await page.evaluate(()=>typeof window.__storyQA),'undefined');
 await page.screenshot({path:`${output}/production-opening.png`});
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>!document.querySelector('.act-presentation')?.classList.contains('active'));
 report.states.push({id:'production-opening',qaBridgeAbsent:true,skipCompleted:true});
 await page.goto(`${base}?qa=story`);
 await page.waitForFunction(()=>window.__storyQA?.actPresentationDirector);
 for(const [method,file]of [['playAct2','act2'],['playAct3','act3'],['playSuccessOutro','outro']]){
  await page.evaluate(method=>{const d=window.__storyQA.actPresentationDirector;d.qaMode=false;window.__presentationResult=null;d[method]().then(r=>window.__presentationResult=r);},method);
  await page.locator('.act-presentation.active').waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({path:`${output}/${file}-active.png`});
  await page.keyboard.press('Escape');
  if(method==='playSuccessOutro'){
   await page.locator('.act-final-lockup').waitFor();
   await page.screenshot({path:`${output}/outro-final.png`});
   await page.keyboard.press('Escape');
  }
  await page.waitForFunction(()=>window.__presentationResult===true);
  report.states.push({id:method,completed:true});
 }
 assert.deepEqual(report.errors,[]);report.verdict='PASS';
}catch(e){report.errors.push(e.stack);process.exitCode=1;}
finally{await writeFile(`${output}/result.json`,JSON.stringify(report,null,2));await browser.close();if(server)await new Promise(r=>server.httpServer.close(r));}
console.log(JSON.stringify(report));
