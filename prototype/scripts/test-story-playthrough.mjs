import {chromium} from 'playwright';
import {preview} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const out=process.argv[2]||'qa-results/story-playthrough';
const supplied=process.argv[3]||null;
const root=fileURLToPath(new URL('..',import.meta.url));
await mkdir(out,{recursive:true});
const server=supplied?null:await preview({root,preview:{port:4173,strictPort:true}});
const base=(supplied||'http://localhost:4173/').replace(/\/+$/,'')+'/';
const url=base+'?qa=story';
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={url,started:new Date().toISOString(),milestones:[],screenshots:[],screenshotWarnings:[],errors:[],method:'Browser-driven M2-M9 story checkpoint playthrough. Runtime interactions use the same controller.onInteract handlers; direct checkpoint setup is restricted to the opt-in ?qa=story bridge so long earlier segments do not need replay. Screenshots are best-effort evidence only because software WebGL readback can be slow on CI.'};
let page;

async function snap(){return page.evaluate(()=>window.__storyQA.snapshot());}
async function mark(label,extra={}){
  const s=await snap();report.milestones.push({label,...extra,zone:s.zone,time:s.time,loopCount:s.memory.loopCount,erosion:s.memory.identityErosionLevel});
  await writeFile(out+'/progress.json',JSON.stringify(report,null,2));
  console.log(label,JSON.stringify({zone:s.zone,time:s.time,loop:s.memory.loopCount,erosion:s.memory.identityErosionLevel,...extra}));
}
async function shot(name){
  const file=name+'.png';
  try{
    await page.screenshot({path:out+'/'+file,fullPage:false,timeout:5000});
    report.screenshots.push(file);
  }catch(e){
    report.screenshotWarnings.push({name,error:e.message});
    console.log('SCREENSHOT_WARNING',name,e.message.split('\n')[0]);
  }
}
async function q(fn,arg){return page.evaluate(fn,arg);}
async function taskText(){return q(()=>document.getElementById('task-panel')?.innerText||'');}
async function load(zone,spawn){await q(({zone,spawn})=>window.__storyQA.load(zone,spawn),{zone,spawn});await page.waitForTimeout(120);}
async function enter(zone,spawn){await q(({zone,spawn})=>window.__storyQA.enter(zone,spawn),{zone,spawn});await page.waitForTimeout(160);}
async function flag(k,v=true){await q(({k,v})=>window.__storyQA.setFlag(k,v),{k,v});}
async function task(id){await q(id=>window.__storyQA.task(id),id);}
async function interact(query){await q(query=>window.__storyQA.interact(query),query);await page.waitForTimeout(100);}
async function domClick(selector){
  await page.evaluate(selector=>{
    const el=document.querySelector(selector);
    if(!el)throw new Error('DOM click target missing '+selector);
    if(el.disabled)throw new Error('DOM click target disabled '+selector);
    el.click();
  },selector);
  await page.waitForTimeout(120);
}
async function closeArchive(){if(await page.locator('#archive-modal.active').count())await domClick('#btn-close-archive');}
async function secondary(){await domClick('#story-choice-modal.active #btn-story-secondary');}
async function primary(){await domClick('#story-choice-modal.active #btn-story-primary');}
async function setM2Checkpoint(){
  await flag('STAFF_ACCESS_CARD',true);await flag('HOOK_409_ZERO_ROOM',true);
  for(const id of ['WARD_ENTRY','P1_4F_REPORT','P1_DUTY_ROOM_READY','P1_ROUND_COMPLETE'])await task(id);
  await load('first_campus_4f');
}

try{
  page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',e=>report.errors.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error')report.errors.push('console: '+m.text());});
  page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});

  // Public mode must not expose the story QA bridge.
  const publicPage=await browser.newPage({viewport:{width:900,height:600}});
  await publicPage.goto(base,{waitUntil:'load',timeout:180000});
  await publicPage.waitForFunction(()=>window.worldRouter?.activeZoneInstance,null,{timeout:180000});
  assert.equal(await publicPage.evaluate(()=>typeof window.__storyQA),'undefined');
  await publicPage.screenshot({path:out+'/m1-3f-normal-duty.png',fullPage:false,timeout:5000});
  report.screenshots.push('m1-3f-normal-duty.png');
  await publicPage.close();

  await page.goto(url,{waitUntil:'load',timeout:180000});
  await page.waitForFunction(()=>window.__storyQA?.worldRouter?.activeZoneInstance,null,{timeout:180000});
  await mark('Story QA bridge ready');

  // M2: deliberately fail first, verify identity override + soft reset + persistent cognition.
  await setM2Checkpoint();
  await shot('m2-4f-nursing-station');
  await load('first_campus_4f','m2_4f_409');await shot('m2-409-sealed');
  await load('first_campus_4f','m3_4f_nursing_station');
  await interact({action:'INSOMNIA_403'});
  await interact({id:'BED33_BOARD'});await closeArchive();
  await interact({id:'BED33_HIS_409'});await closeArchive();
  let s=await snap();assert.equal(s.legend,'UNDERSTOOD');
  await interact({id:'BED33_ASSIGNMENT'});
  await page.waitForSelector('#bed33-modal.active');
  await shot('m2-bed33-assignment');
  await domClick('#btn-bed33-confirm');
  await page.waitForSelector('#loop-cutscene.active');
  assert.equal(await page.locator('#btn-loop-skip').isVisible(),true,'Loop fast-forward control must be visible while override is active');
  await shot('m2-override');
  if(await page.locator('#loop-cutscene.active #btn-loop-skip').isVisible().catch(()=>false))await domClick('#btn-loop-skip');
  await page.waitForFunction(()=>window.__storyQA.worldRouter.activeZoneId==='first_campus_3f',null,{timeout:30000});
  s=await snap();
  assert.equal(s.memory.loopCount,1);assert.equal(s.memory.survivalRules.neverSignBed33,true);
  assert(s.memory.journalNotes.some(n=>n.id==='RULE_BED33'));
  await mark('M2 override loops to 17:00 with memory');

  // M2 second loop: use remembered rule and reject without re-learning every clue.
  await flag('STAFF_ACCESS_CARD',true);await flag('HOOK_409_ZERO_ROOM',true);await task('WARD_ENTRY');await task('P1_INSOMNIA_DONE');await load('first_campus_4f');
  await interact({id:'BED33_ASSIGNMENT'});
  await page.waitForSelector('#bed33-modal.active');
  assert.equal(await page.locator('#btn-bed33-reject').isVisible(),true);
  await domClick('#btn-bed33-reject');
  s=await snap();assert.equal(s.flags.BED33_RESOLVED,true);assert.equal(s.memory.proofs.space,true);assert.equal(s.memory.trueNameFragments.frag_employeePrefix,'MED-87');
  await mark('M2 resolved by persistent cognition');

  // M3: Jane Doe happens during the normal 20:00 consult. 00:33 must NOT leak before the 21:17 bootstrap.
  await flag('HOOK_0217',true);await task('P1_REST_DONE');
  await enter('first_campus_2f');
  s=await snap();
  const preGhost=await q(()=>window.__storyQA.worldRouter.activeZoneInstance?.ghostRegistrationTerminal?.userData?.interactable===true);
  assert.equal(preGhost,false,'00:33 terminal must stay dormant during the first ER consult');
  await interact({action:'ER_ASSESS'});await interact({action:'ER_NOTE'});
  s=await snap();assert.equal(s.flags.B_PANEL_KEY,true);assert.equal(s.memory.trueNameFragments.frag_surname,null);
  await interact({id:'ER_EXIT_NOTICE'});
  assert((await page.locator('#subtitle-text').innerText()).includes('只進不出'));

  // Then the 21:15 call returns the player to 3F; noticing the panel is not enough — the logbook must be signed.
  await flag('NIGHT_PATROL_RETURN_3F',true);
  await q(()=>window.__storyQA.floorStateManager.setPhase(window.__storyQA.GamePhase.NIGHT_PATROL));
  await enter('first_campus_3f');
  await interact({id:'GUARD_SIGN_2117'});
  s=await snap();assert.equal(s.flags.GUARD_SIGN_EXAMINED,true);assert.equal(s.flags.BOOTSTRAP_2117_RESOLVED,false);
  await interact({id:'GUARD_BOOK_2117'});
  s=await snap();assert.equal(s.flags.BOOTSTRAP_2117_RESOLVED,true);assert.equal(s.time,'21:17');
  assert.equal(s.flags.GHOST_REGISTRATION_ARMED,false,'00:33 must not arm immediately at 21:17');

  // 21:17 must actively push the player back to the 4F duty room. Merely entering
  // the room must trigger the sequence: no hidden E target or END_SHIFT fallback.
  await enter('first_campus_4f','m2_4f_duty_room');
  await shot('m2-duty-room');
  // Software WebGL can block a frame longer than the 2.2 s 23:55 transition.
  // Do not race the transient frame; prove the durable outcome happened with no E interaction.
  await page.waitForFunction(()=>window.__storyQA.gameState.getFlag('POST_2117_DUTY_CALL_DONE')===true,null,{timeout:30000});
  s=await snap();
  assert.equal(s.flags.POST_2117_DUTY_ROOM_TRIGGERED,true,'entering the duty room must auto-trigger the post-21:17 sequence');
  assert.equal(s.time,'00:30');
  assert.equal(s.flags.GHOST_REGISTRATION_ARMED,true);
  assert.equal(s.flags.POST_2117_DUTY_CALL_DONE,true);
  assert.equal(s.controllerEnabled,true,'movement must return after the forced phone beat');
  assert.equal(await q(()=>window.__storyQA.gameState.getDisplayTime()),'翌日 00:30');
  assert.match(await taskText(),/立即前往 2F 急診/,'00:30 call must actively push the player to 2F ER');
  await mark('21:17 duty-room entry auto-triggers 23:55 beat and 00:30 ER call');

  // Only after the duty-room call does re-entry to 2F materialize the 00:33 registration.
  await enter('first_campus_2f');
  await load('first_campus_2f','m4_2f_er_triage');await shot('m3-er-triage-station');
  s=await snap();assert.equal(s.flags.GHOST_REGISTRATION_AVAILABLE,true);assert.equal(s.time,'00:33');
  assert.equal(await q(()=>window.__storyQA.gameState.getDisplayTime()),'翌日 00:33');
  await interact({id:'ER_GHOST_REGISTRATION'});
  await page.waitForSelector('#story-choice-modal.active');await shot('m3-0033-registration');await secondary();
  s=await snap();
  assert.equal(s.flags.ER0033_SLIP_COLLECTED,true);
  assert.equal(s.flags.LEGEND_ER0033_RESOLVED,false);
  assert.equal(s.flags.SECOND_CAMPUS_ACCESS,false);
  assert.match(await taskText(),/3F 316/,'00:33 slip must explicitly push the player back to 316');

  // M3 only resolves after the 1998-ER-0217 slip is carried back to the second 316 terminal.
  await load('first_campus_3f');
  await interact({id:'316_LEGACY_TERMINAL'});
  s=await snap();
  assert.equal(s.flags.M3_316_DECODED,true);
  assert.equal(s.flags.LEGEND_ER0033_RESOLVED,true);
  assert.equal(s.flags.SECOND_CAMPUS_PHONE_PENDING,true);
  assert.equal(s.flags.SECOND_CAMPUS_ACCESS,false);
  assert.equal(s.memory.proofs.time,true);
  assert.equal(s.memory.trueNameFragments.frag_surname,'張');
  assert.equal(s.time,'00:33');
  await interact({id:'316_PHONE'});
  assert.match(await page.locator('#subtitle-text').innerText(),/怎麼知道我在 316 辦公室/);
  await page.waitForFunction(()=>window.__storyQA.gameState.getFlag('SECOND_CAMPUS_ACCESS')===true,null,{timeout:10000});
  s=await snap();assert.equal(s.flags.SECOND_CAMPUS_ACCESS,true);
  assert.equal(s.time,'01:15');
  assert.equal(await q(()=>window.__storyQA.gameState.getDisplayTime()),'翌日 01:15');
  assert.match(await taskText(),/第二院區 5F[\s\S]*胸痛/,'M3 resolution must leave a concrete second-campus objective');
  await mark('M3 00:33 slip decoded at 316; second campus unlocked');

  // M4: second-campus chest-pain duplicate patient.
  await load('second_campus_5f');
  await shot('m4-second-campus-ward');
  await interact({id:'SECOND_CHEST_PATIENT'});
  assert.match(await taskText(),/轉院單/,'seeing the M4 patient must advance the objective to the transfer form');
  await interact({id:'SECOND_CHEST_TRANSFER'});
  await page.waitForSelector('#story-choice-modal.active');await shot('m4-chest-transfer');await secondary();
  s=await snap();assert.equal(s.flags.M4_CHEST_RESOLVED,true);assert.equal(s.flags.OUTDOOR_ROUTE_ACCESS,true);assert.equal(s.flags.CHEST_RECORD_MATCH,true);assert.equal(s.memory.trueNameFragments.frag_givenName_1,null);assert.equal(s.time,'01:45');
  await interact({id:'SECOND_CHEST_NAME_CLUE'});await closeArchive();
  s=await snap();assert.equal(s.flags.M4_NAME_CLUE_FOUND,true);assert.equal(s.memory.trueNameFragments.frag_givenName_1,'守');
  assert.match(await taskText(),/返回第一院區/,'M4 resolution must push the player toward the next route');
  await mark('M4 chest-pain duplicate resolved');

  // M5A: skybridge rule.
  await load('skybridge');
  await shot('m5-annie-bridge');
  await interact({id:'BRIDGE_LOOP_EVENT'});
  await page.waitForSelector('#story-choice-modal.active');await shot('m5-bridge-double');await secondary();
  s=await snap();assert.equal(s.flags.M5_BRIDGE_RESOLVED,true);assert.equal(s.flags.M5_ROUTE_RESOLVED,false);assert.equal(s.flags.FLOOR6_AVAILABLE,false);assert.equal(s.memory.proofs.identity,false);assert.equal(s.memory.trueNameFragments.frag_givenName_2,null);assert.equal(s.time,'02:00');
  await interact({id:'ANNIE_TRUE_NAME_CLUE'});
  s=await snap();assert.equal(s.flags.M5_ROUTE_RESOLVED,true);assert.equal(s.flags.FLOOR6_AVAILABLE,true);assert.equal(s.memory.proofs.identity,true);assert.equal(s.memory.trueNameFragments.frag_givenName_2,'恆');
  assert.match(await taskText(),/搭乘一般電梯返回第一院區/,'M5 resolution must reveal the return-to-ward elevator objective');
  await mark('M5 bridge rule resolved');

  // M5B: alternate pond route is independently functional.
  await load('ecology_pond');
  await shot('m5-annie-pond');
  await interact({id:'POND_REFLECTION_EVENT'});
  await page.waitForSelector('#story-choice-modal.active');await shot('m5-pond-reflection');await secondary();
  s=await snap();assert.equal(s.flags.M5_POND_RESOLVED,true);
  await mark('M5 pond alternate route resolved');

  // M6: nonexistent 6F — stay near lift instead of chasing.
  await flag('PHANTOM6_RETURN_ZONE','second_campus_5f');await load('phantom_6f','phantom_6f_lift');
  await shot('m6-phantom6');
  await interact({id:'FLOOR6_SAFE_RETURN'});
  s=await snap();assert.equal(s.flags.M6_FLOOR6_RESOLVED,true);assert.equal(s.zone,'second_campus_5f');
  assert.match(await taskText(),/第一院區 1F[\s\S]*隱藏服務門/,'M6 resolution must push the player to the 1F service door');
  await mark('M6 nonexistent 6F resolved');

  // M7: 02:17 decision + B2 convergence.
  assert.equal((await snap()).memory.proofs.space,true);
  assert.equal((await snap()).memory.proofs.identity,true);
  assert.equal((await snap()).memory.proofs.time,true);
  await load('first_campus_1f');
  await shot('m7-first-campus-guard-post');
  await interact({id:'1F_HIDDEN_SERVICE_DOOR'});
  await page.waitForSelector('#story-choice-modal.active');await shot('m7-0217-choice');await secondary();
  await page.waitForFunction(()=>window.__storyQA.worldRouter.activeZoneId==='b2_archive');
  await shot('m7-b2');
  await interact({id:'B2_ARCHIVE_TERMINAL'});
  s=await snap();assert.equal(s.flags.M7_B2_RESOLVED,true);assert.equal(s.flags.M8_IDENTITY_BATTLE_ACTIVE,true);assert.equal(s.memory.trueNameResolved,true);assert.equal(s.memory.trueName,'張守恆');assert.equal(s.memory.trueNameFragments.frag_employeeFull,'MED-870409');
  assert.match(await taskText(),/舊貨梯[\s\S]*離開 B2/,'B2 verification must explicitly tell the player how to leave');
  await interact({id:'B2_RETURN_LIFT'});
  await page.waitForFunction(()=>window.__storyQA.worldRouter.activeZoneId==='first_campus_1f');
  s=await snap();assert.equal(s.flags.LAST_CALL_SEEN,true);assert.equal(s.time,'03:30');
  assert.match(await taskText(),/3F[\s\S]*316/,'last call must push the player back to 3F 316 for the final handoff');
  await mark('M7 B2 reveals true name; M8 identity battle active');

  // M9: return to 316 and complete the real handoff.
  await load('first_campus_3f');
  await flag('OPENED_316',true);
  await interact({id:'E_HANDOFF'});
  await page.waitForSelector('#final-handoff-modal.active');s=await snap();assert.equal(s.time,'04:05');await shot('m9-final-handoff');
  await page.locator('#final-true-name').fill('張守恆');
  await page.locator('#final-employee-id').fill('MED-870409');
  await domClick('#btn-submit-final-handoff');
  await page.waitForSelector('#final-success-modal.active');
  await shot('m9-success');
  s=await snap();assert.equal(s.flags.GAME_COMPLETE,true);assert.equal(s.memory.gameComplete,true);
  assert.match(await taskText(),/交班完成/,'completed game must close the task chain instead of dropping guidance');
  await mark('M9 TRUE NAME handoff accepted');

  assert.equal(report.errors.length,0,JSON.stringify(report.errors,null,2));
  report.verdict='PASS';
}catch(e){
  report.verdict='FAIL';report.failure=e.stack;report.last=await snap().catch(()=>null);
  if(page)await page.screenshot({path:out+'/failure.png',fullPage:false,timeout:2000}).catch(()=>{});
  process.exitCode=1;console.error(e.stack);
}finally{
  report.ended=new Date().toISOString();
  await writeFile(out+'/result.json',JSON.stringify(report,null,2));
  await browser.close();
  if(server)await new Promise(r=>server.httpServer.close(r));
}
