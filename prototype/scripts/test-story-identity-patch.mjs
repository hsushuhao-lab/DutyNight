import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preview} from 'vite';
import {fileURLToPath} from 'node:url';
const out=process.argv[2]||'qa-results/story-identity-patch';
await mkdir(out,{recursive:true});
const server=process.argv[3]?null:await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4185,strictPort:true}});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const report={verdict:'FAIL',checks:[],errors:[]};
const check=(id,data)=>{report.checks.push({id,...data});console.log(id);};
const q=fn=>page.evaluate(fn);
const dialogue=async()=>{
  const lines=[];
  while(await q(()=>!!window.__storyQA.uiManager.dialogueSequence)){
    lines.push(await page.locator('#subtitle-text').textContent());
    await page.keyboard.press('e');
  }
  return lines;
};
try{
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto((process.argv[3]||'http://localhost:4185/')+'?qa=story');
  await page.waitForFunction(()=>window.__storyQA?.worldRouter.activeZoneInstance);
  await q(()=>{const a=window.__storyQA;a.load('first_campus_1f');a.interact({type:'guard_post_inspection'});});
  const guard=await q(()=>{const a=window.__storyQA;return {interactable:a.worldRouter.activeZoneInstance.guardPostObject.userData.interactable,source:!!a.gameState.getFlag('B2_SECURITY_SOURCE'),door:!!a.gameState.getFlag('HIDDEN_SERVICE_DOOR_DISCOVERED')};});
  assert.deepEqual(guard,{interactable:false,source:false,door:false});check('PRE_6F_GUARD_BLOCKED',guard);
  await q(()=>{const a=window.__storyQA;a.task('WARD_ENTRY');a.load('first_campus_4f');a.interact({type:'p1_action',action:'NURSE_REPORT'});a.interact({type:'p1_action',action:'NORMAL_EVENT'});});
  const assessment=await dialogue();assert.equal(assessment.length,6);assert.match(assessment.join(' '),/人聲|人說話/);assert.match(assessment.join(' '),/環境聲音/);
  assert.equal(await q(()=>!!window.__storyQA.gameState.getFlag('KNOCK_408C_POST_SEAL_PLAYED')),false);
  check('408C_ASSESSMENT_WITHOUT_KNOCK',{lines:assessment});
  await q(()=>window.__storyQA.interact({type:'bed33_409_sealed'}));
  assert.equal(await q(()=>window.__storyQA.gameState.getFlag('KNOCK_408C_POST_SEAL_PLAYED')),true);
  check('KNOCK_ONLY_AFTER_409_SEAL',{});
  await q(()=>window.__storyQA.uiManager.closeArchiveDocument());
  await page.waitForTimeout(1000);
  await q(()=>{const a=window.__storyQA;a.load('first_campus_2f');a.setFlag('P1_ER_CALL_ANSWERED');a.setFlag('ER_JANE_PRESENT');a.interact({type:'p1_action',action:'ER_ASSESS'});});
  await page.screenshot({path:out+'/er-identity.png'});
  const identity=await dialogue();assert.match(identity.join(' '),/劉志遠／ENG-860214／工務機電技師/);assert.match(identity.join(' '),/這名字好熟悉，在哪裡看過/);
  await q(()=>window.__storyQA.interact({type:'p1_action',action:'ER_NOTE'}));
  assert.match(await page.locator('#subtitle-text').textContent(),/劉志遠/);check('ER_CANONICAL_IDENTITY',{lines:identity});
  await q(()=>{const a=window.__storyQA;a.load('first_campus_3f');});
  const roster=await q(()=>window.__storyQA.worldRouter.activeZoneInstance.interactables.find(x=>x.userData?.id==='ARCHIVE_PERSONNEL_1998').userData);
  assert.equal(roster.pages.length,7);assert.equal(roster.documentTitle,'1998 夜班核心人員名錄');assert(!JSON.stringify(roster).includes('4+3'));check('SEVEN_PERSONNEL_PAGES',{count:roster.pages.length});
  for(const stage of ['storage','patrol','history','final']){
    const location=await page.evaluate(stage=>{const a=window.__storyQA;a.setFlag('NIGHT_PATROL_RETURN_3F',stage!=='storage');a.setFlag('B2_EXITED_PERMANENTLY',['history','final'].includes(stage));a.setFlag('B2_HISTORY_FALLBACK_ACTIVE',stage==='history');a.setFlag('HISTORY_PERSONNEL_PROFILES_REVIEWED',stage==='final');const z=a.worldRouter.activeZoneInstance;z.syncStoryState();const visible=[];z.zoneGroup.traverse(o=>{if(o.userData.characterId==='ANNIE_CPR_TRAINING_MANNEQUIN'&&o.visible)visible.push(o.userData.storyLocation||'STORAGE');});return visible;},stage);
    assert.equal(location.length,1);assert.equal(location[0],{storage:'STORAGE',patrol:'HISTORY_ENTRANCE',history:'HISTORY_INSIDE',final:'316'}[stage]);check('ANNIE_'+stage,{location});
  }
  await q(()=>{const a=window.__storyQA;a.setFlag('M6_FLOOR6_RESOLVED');a.setFlag('B2_EXITED_PERMANENTLY',false);a.load('first_campus_1f');});
  assert.equal(await q(()=>window.__storyQA.worldRouter.activeZoneInstance.guardPostObject.userData.interactable),true);check('POST_6F_GUARD_AVAILABLE',{});
  await q(()=>{const a=window.__storyQA;a.load('first_campus_3f');a.setFlag('B2_EXITED_PERMANENTLY',false);a.setFlag('HISTORY_PERSONNEL_PROFILES_REVIEWED',false);a.setFlag('BOOTSTRAP_2117_RESOLVED');a.setFlag('POST_2117_RETURN_TO_DUTY_ROOM');a.setFlag('POST_2117_DUTY_CALL_DONE',false);a.setFlag('PHONE_RING_ACTIVE',false);a.gameState.setGameTime('21:17');a.task('P1_RETURN_4F');a.load('first_campus_4f');a.interact({type:'p1_action',action:'END_SHIFT'});});
  assert.equal(await q(()=>window.__storyQA.gameState.gameTime),'21:17');
  assert.equal(await q(()=>!!window.__storyQA.gameState.getFlag('PHONE_RING_ACTIVE')),false);
  await page.waitForFunction(()=>window.__storyQA.gameState.getFlag('CG_21_17_DUTY_ROOM_ACTIVATION_PLAYED'),null,{timeout:20000});
  assert.equal(await q(()=>window.__storyQA.gameState.getFlag('PHONE_RING_ACTIVE')),true);check('RECAP_BEFORE_TIME_AND_PHONE',{});
  await q(()=>{const a=window.__storyQA;a.setFlag('FAST_PATH_3F');a.gameState.completedTasks.delete('P1_4F_REPORT');a.load('first_campus_4f');a.interact({type:'p1_action',action:'NURSE_REPORT'});});
  assert.equal(await q(()=>window.__storyQA.gameState.getFlag('BED33_RESOLVED')),true);check('REPEAT_LOOP_REPORT_ONLY',{});
  await q(()=>{const a=window.__storyQA;a.load('phantom_6f');a.setFlag('FLOOR6_STETHOSCOPE_FOUND');a.setFlag('FLOOR6_STETHOSCOPE_INSPECTED');a.interact({type:'floor6_safe_return'});});
  const returned=await q(()=>({zone:window.__storyQA.worldRouter.activeZoneId,position:window.__storyQA.controller.position.toArray()}));
  assert.equal(returned.zone,'first_campus_1f');check('FLOOR6_LIFT_RETURN',returned);
  await q(()=>{const a=window.__storyQA;a.setFlag('B2_EXITED_PERMANENTLY');a.setFlag('HISTORY_PERSONNEL_PROFILES_REVIEWED');a.setFlag('M8_IDENTITY_BATTLE_ACTIVE');a.load('first_campus_3f');a.interact({type:'workstation'});});
  await page.waitForFunction(()=>!!window.__storyQA.uiManager.dialogueSequence,null,{timeout:15000});
  const finalLines=await dialogue();assert.equal(finalLines.length,2);
  assert.equal(await page.locator('#final-employee-id').getAttribute('type'),'text');
  await page.locator('#final-employee-id').fill('409');await page.locator('#btn-submit-final-handoff').click();
  await page.waitForTimeout(800);
  assert.equal(await q(()=>!!window.__storyQA.gameState.getFlag('GAME_COMPLETE')),false);check('FINAL_REJECTS_MISSING_LEADING_ZERO',{});
  assert.deepEqual(report.errors,[]);report.verdict='PASS';
}catch(error){report.failure=String(error.stack);throw error;}finally{await writeFile(out+'/result.json',JSON.stringify(report,null,2));await browser.close();await server?.httpServer.close();}
