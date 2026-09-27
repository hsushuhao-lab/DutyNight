import {chromium} from 'playwright';
import {preview} from 'vite';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='prototype/qa-results/audio-hotfix';await mkdir(out,{recursive:true});
const server=await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4192,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--autoplay-policy=user-gesture-required']});
const report={verdict:'FAIL',checks:[],errors:[]};
try{
 const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto('http://localhost:4192/?qa=story');await page.waitForFunction(()=>window.__storyQA?.soundManager);
 await page.evaluate(()=>window.__storyQA.gameState.setFlag('PHONE_RING_ACTIVE',true));
 assert.equal(await page.evaluate(()=>window.__storyQA.soundManager.debugCounters.phoneBurst),0);
 await page.keyboard.press('Shift');
 await page.waitForFunction(()=>window.__storyQA.soundManager.ctx?.state==='running');
 await page.waitForTimeout(5100);
 let audit=await page.evaluate(()=>{const s=window.__storyQA.soundManager;return {state:s.ctx.state,bursts:s.debugCounters.phoneBurst,timer:s.phoneRingTimer};});
 assert(audit.bursts>=2);report.checks.push({id:'missed-unlock-recovery-and-repeat',...audit});
 const same=await page.evaluate(()=>{const s=window.__storyQA.soundManager;const before=s.phoneRingTimer;s.startPhoneRing();return before===s.phoneRingTimer;});assert(same);
 await page.evaluate(()=>window.__storyQA.gameState.setFlag('PHONE_RING_ACTIVE',false));
 const stopped=await page.evaluate(()=>window.__storyQA.soundManager.debugCounters.phoneBurst);
 await page.waitForTimeout(5100);
 assert.equal(await page.evaluate(()=>window.__storyQA.soundManager.debugCounters.phoneBurst),stopped);
 assert.equal(await page.evaluate(()=>window.__storyQA.soundManager.phoneOscillators.size),0);
 await page.evaluate(()=>window.__storyQA.soundManager.ctx.suspend());
 await page.keyboard.press('Shift');await page.waitForFunction(()=>window.__storyQA.soundManager.ctx.state==='running');
 report.checks.push({id:'idempotence-answer-cancellation-resume',pass:true});
 assert.deepEqual(report.errors,[]);report.verdict='PASS';
}catch(error){report.errors.push(error.stack);throw error;}
finally{await writeFile(`${out}/result.json`,JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.httpServer.close(r));}
