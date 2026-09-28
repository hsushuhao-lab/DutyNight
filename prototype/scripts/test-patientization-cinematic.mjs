import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {preview} from 'vite';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const output=process.argv[2]||'qa-results/patientization';
const publicUrl=process.argv[3];
const server=publicUrl?null:await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4173,strictPort:true}});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={sourceSha:process.env.GITHUB_SHA||'working-tree',verdict:'FAIL',errors:[],runs:[]};
try{
  await mkdir(output,{recursive:true});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(`${publicUrl||'http://localhost:4173/'}?qa=story`);
  await page.waitForFunction(()=>window.__storyQA);
  for(const skip of [false,true]){
    const before=await page.evaluate(()=>window.__storyQA.persistentMemory.data.loopCount);
    await page.evaluate(()=>window.__storyQA.loopManager.triggerBed33Override());
    await page.waitForTimeout(1100);
    const scene=await page.evaluate(()=>({canvas:!!document.querySelector('.patientization-canvas'),meshes:window.__storyQA.uiManager.patientizationScene.scene.children.filter(o=>o.isMesh).map(o=>o.name),enabled:window.__storyQA.controller.enabled}));
    assert(scene.canvas&&scene.meshes.includes('409 patient wristband')&&scene.meshes.includes('Leather wrist restraint'));
    assert.equal(scene.enabled,false);
    await page.waitForFunction(()=>!document.querySelector('#loop-cutscene').classList.contains('active'),null,{timeout:20000});
    await page.waitForTimeout(800);
    const after=await page.evaluate(()=>({
      loop:window.__storyQA.persistentMemory.data.loopCount,
      zone:window.__storyQA.worldRouter.activeZoneId,
      time:window.__storyQA.gameState.gameTime,
      anchor:window.__storyQA.gameState.getFlag('PATIENTIZATION_RECOVERY_ANCHOR')||null,
      bed33Resolved:window.__storyQA.gameState.getFlag('BED33_RESOLVED'),
      enabled:window.__storyQA.controller.enabled,
      canvas:!!document.querySelector('.patientization-canvas')
    }));
    if(before===0){
      assert.deepEqual(after,{loop:1,zone:'first_campus_3f',time:'17:00',anchor:null,bed33Resolved:false,enabled:true,canvas:false});
    }else{
      assert.deepEqual(after,{loop:before+1,zone:'first_campus_4f',time:'19:30',anchor:'BED33',bed33Resolved:false,enabled:true,canvas:false});
      const restoredCard=await page.evaluate(()=>({
        title:document.querySelector('#loop-gameover-card strong')?.textContent||'',
        detail:document.querySelector('#loop-gameover-card span')?.textContent||''
      }));
      assert.equal(restoredCard.title,'MEMORY ANCHOR RESTORED');
      assert.match(restoredCard.detail,/19:30｜4F 護理站報到/);
      const beforeReport=await page.evaluate(()=>({
        reported:window.__storyQA.gameState.isTaskComplete('P1_4F_REPORT'),
        normalEvent:window.__storyQA.gameState.isTaskComplete('P1_NORMAL_EVENT_DONE'),
        bed33:window.__storyQA.gameState.getFlag('BED33_RESOLVED')
      }));
      assert.deepEqual(beforeReport,{reported:false,normalEvent:false,bed33:false});
      await page.evaluate(()=>window.__storyQA.interact({id:'first_ward_reader_sensor'}));
      await page.waitForFunction(()=>window.__storyQA.gameState.isTaskComplete('P1_4F_REPORT')&&window.__storyQA.gameState.getFlag('BED33_RESOLVED')===true);
      const afterReport=await page.evaluate(()=>({
        reported:window.__storyQA.gameState.isTaskComplete('P1_4F_REPORT'),
        normalEvent:window.__storyQA.gameState.isTaskComplete('P1_NORMAL_EVENT_DONE'),
        bed33:window.__storyQA.gameState.getFlag('BED33_RESOLVED')
      }));
      assert.deepEqual(afterReport,{reported:true,normalEvent:true,bed33:true},'M2 repeat must collapse 408C/409/Bed33 after one nursing report');
    }
    report.runs.push({skip,scene,after});
  }
  assert.deepEqual(report.errors,[]);report.verdict='PASS';
}finally{
  await writeFile(`${output}/result.json`,JSON.stringify(report,null,2));
  await browser.close();if(server)await new Promise(r=>server.httpServer.close(r));
}
console.log(JSON.stringify(report));
