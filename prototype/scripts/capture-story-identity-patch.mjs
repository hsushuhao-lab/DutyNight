import {chromium} from 'playwright';
import {preview} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const out=process.argv[2]||'qa-results/identity-visual';await mkdir(out,{recursive:true});
const server=process.argv[3]?null:await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4186,strictPort:true}});
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[],captures=[];
page.on('pageerror',e=>errors.push(e.message));
const shot=async name=>{await page.waitForTimeout(200);await page.screenshot({path:out+'/'+name+'.png'});captures.push(name);console.log(name);};
const load=async zone=>{await page.evaluate(async zone=>{const a=window.__storyQA;await a.prefetch({zoneId:zone});a.load(zone);},zone);await page.waitForTimeout(500);};
const view=async(position,target,anchorName)=>page.evaluate(args=>window.__storyQA.captureView(args),{position,target,anchorName});
try{
 await page.goto((process.argv[3]||'http://localhost:4186/')+'?qa=story');await page.waitForFunction(()=>window.__storyQA?.worldRouter.activeZoneInstance);
 await load('first_campus_3f');
 await page.evaluate(()=>{const a=window.__storyQA;const file=a.worldRouter.activeZoneInstance.interactables.find(x=>x.userData?.id==='ARCHIVE_PERSONNEL_1998');a.interact({id:'ARCHIVE_PERSONNEL_1998'});});
 for(let i=1;i<=7;i++){await shot('roster-'+i);if(i<7)await page.locator('#btn-archive-next').click();}await page.locator('#btn-close-archive').click();
 for(const stage of ['patrol','history','final']){
  await page.evaluate(stage=>{const a=window.__storyQA;a.setFlag('NIGHT_PATROL_RETURN_3F');a.setFlag('B2_EXITED_PERMANENTLY',stage!=='patrol');a.setFlag('B2_HISTORY_FALLBACK_ACTIVE',stage==='history');a.setFlag('HISTORY_PERSONNEL_PROFILES_REVIEWED',stage==='final');a.worldRouter.activeZoneInstance.syncStoryState();},stage);
  const target=stage==='final'?[3.8,.9,7.25]:stage==='history'?[20.6,.9,-5.8]:[20.25,.9,-1.35];
  await view(stage==='final'?[3.8,1.65,4.4]:stage==='history'?[20.6,1.65,-3]:[20.25,1.65,1.4],target,'Annie_2117_GuardCheckpoint');await shot('annie-'+stage);
 }
 await load('first_campus_4f');await view([-2,1.65,-5.5],[-2,1.78,-8.495],'FourF_NursingHandoverBoard');await shot('report-board');
 await page.evaluate(()=>{const a=window.__storyQA;a.task('WARD_ENTRY');a.task('P1_4F_REPORT');a.interact({action:'NORMAL_EVENT'});});await shot('408c-assessment');while(await page.evaluate(()=>!!window.__storyQA.uiManager.dialogueSequence))await page.keyboard.press('e');
 await load('first_campus_2f');await view([10.5,1.65,5.2],[10.5,1,7.5],'ER_UnknownMale_ObservationPatient').catch(()=>{});
 await page.evaluate(()=>{const a=window.__storyQA;a.setFlag('P1_ER_CALL_ANSWERED');a.setFlag('ER_JANE_PRESENT');a.worldRouter.activeZoneInstance.syncStoryState();a.interact({action:'ER_ASSESS'});});await shot('liu-identity');while(await page.evaluate(()=>!!window.__storyQA.uiManager.dialogueSequence))await page.keyboard.press('e');
 await load('b2_archive');await view([0,1.65,-1.5],[0,1.2,2],'B2_OneWayExitDoor');await shot('b2-fire-door');
 await load('second_campus_2f');await view([72,1.65,6],[70,1,10],'Second2F_DoctorDutyDesk');await shot('second2f-desk');
 await load('second_campus_5f');await view([65,1.65,6],[67.885,2.3,6],'Plaque_5F_醫師值班室');await shot('second5f-sign');
 await writeFile(out+'/result.json',JSON.stringify({captures,errors},null,2));
}finally{await browser.close();await server?.httpServer.close();}
