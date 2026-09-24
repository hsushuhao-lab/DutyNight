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
const report={url,started:new Date().toISOString(),milestones:[],screenshots:[],errors:[],method:'Browser-driven M2-M9 story checkpoint playthrough. Runtime interactions use the same controller.onInteract handlers; direct checkpoint setup is restricted to the opt-in ?qa=story bridge so long earlier segments do not need replay.'};
let page;

async function snap(){return page.evaluate(()=>window.__storyQA.snapshot());}
async function mark(label,extra={}){
  const s=await snap();report.milestones.push({label,...extra,zone:s.zone,time:s.time,loopCount:s.memory.loopCount,erosion:s.memory.identityErosionLevel});
  await writeFile(out+'/progress.json',JSON.stringify(report,null,2));
  console.log(label,JSON.stringify({zone:s.zone,time:s.time,loop:s.memory.loopCount,erosion:s.memory.identityErosionLevel,...extra}));
}
async function shot(name){
  const file=name+'.png';await page.screenshot({path:out+'/'+file,fullPage:false,timeout:10000});report.screenshots.push(file);
}
async function q(fn,arg){return page.evaluate(fn,arg);}
async function load(zone,spawn){await q(({zone,spawn})=>window.__storyQA.load(zone,spawn),{zone,spawn});await page.waitForTimeout(120);}
async function flag(k,v=true){await q(({k,v})=>window.__storyQA.setFlag(k,v),{k,v});}
async function task(id){await q(id=>window.__storyQA.task(id),id);}
async function interact(query){await q(query=>window.__storyQA.interact(query),query);await page.waitForTimeout(100);}
async function closeArchive(){if(await page.locator('#archive-modal.active').count())await page.locator('#btn-close-archive').click();}
async function secondary(){await page.locator('#story-choice-modal.active #btn-story-secondary').click();await page.waitForTimeout(120);}
async function primary(){await page.locator('#story-choice-modal.active #btn-story-primary').click();await page.waitForTimeout(120);}
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
  await publicPage.close();

  await page.goto(url,{waitUntil:'load',timeout:180000});
  await page.waitForFunction(()=>window.__storyQA?.worldRouter?.activeZoneInstance,null,{timeout:180000});
  await mark('Story QA bridge ready');

  // M2: deliberately fail first, verify identity override + soft reset + persistent cognition.
  await setM2Checkpoint();
  await interact({action:'INSOMNIA_403'});
  await interact({id:'BED33_BOARD'});await closeArchive();
  await interact({id:'BED33_HIS_409'});await closeArchive();
  let s=await snap();assert.equal(s.legend,'UNDERSTOOD');
  await interact({id:'BED33_ASSIGNMENT'});
  await page.waitForSelector('#bed33-modal.active');
  await shot('m2-bed33-assignment');
  await page.locator('#btn-bed33-confirm').click();
  await page.waitForSelector('#loop-cutscene.active');
  assert.equal(await page.locator('#btn-loop-skip').isVisible(),true,'Loop fast-forward control must be visible while override is active');
  await shot('m2-override');
  if(await page.locator('#loop-cutscene.active').count())await page.locator('#btn-loop-skip').click();
  await page.waitForFunction(()=>window.__storyQA.worldRouter.activeZoneId==='first_campus_3f');
  s=await snap();
  assert.equal(s.memory.loopCount,1);assert.equal(s.memory.survivalRules.neverSignBed33,true);
  assert(s.memory.journalNotes.some(n=>n.id==='RULE_BED33'));
  await mark('M2 override loops to 17:00 with memory');

  // M2 second loop: use remembered rule and reject without re-learning every clue.
  await flag('STAFF_ACCESS_CARD',true);await flag('HOOK_409_ZERO_ROOM',true);await task('WARD_ENTRY');await task('P1_INSOMNIA_DONE');await load('first_campus_4f');
  await interact({id:'BED33_ASSIGNMENT'});
  await page.waitForSelector('#bed33-modal.active');
  assert.equal(await page.locator('#btn-bed33-reject').isVisible(),true);
  await page.locator('#btn-bed33-reject').click();
  s=await snap();assert.equal(s.flags.BED33_RESOLVED,true);assert.equal(s.memory.proofs.space,true);assert.equal(s.memory.trueNameFragments.frag_givenName_1,'昱');
  await mark('M2 resolved by persistent cognition');

  // M3: complete the 21:17 echo, Jane Doe, entry-only exit, and 00:33 safe branch.
  await flag('HOOK_0217',true);await flag('NIGHT_PATROL_RETURN_3F',true);
  await q(()=>window.__storyQA.floorStateManager.setPhase(window.__storyQA.GamePhase.NIGHT_PATROL));
  await load('first_campus_3f');
  await interact({id:'GUARD_LOG_2117'});
  s=await snap();assert.equal(s.flags.BOOTSTRAP_2117_RESOLVED,true);assert.equal(s.time,'21:17');
  await task('P1_REST_DONE');await load('first_campus_2f');
  await interact({action:'ER_ASSESS'});await interact({action:'ER_NOTE'});
  s=await snap();assert.equal(s.flags.B_PANEL_KEY,true);assert.equal(s.memory.trueNameFragments.frag_surname,'林');
  await interact({id:'ER_EXIT_NOTICE'});
  assert((await page.locator('#subtitle-text').innerText()).includes('只進不出'));
  await interact({id:'ER_GHOST_REGISTRATION'});
  await page.waitForSelector('#story-choice-modal.active');await shot('m3-0033-registration');await secondary();
  s=await snap();assert.equal(s.flags.LEGEND_ER0033_RESOLVED,true);assert.equal(s.flags.SECOND_CAMPUS_ACCESS,true);assert.equal(s.memory.proofs.time,true);
  await mark('M3 Jane Doe + 00:33 resolved; second campus unlocked');

  // M4: second-campus chest-pain duplicate patient.
  await load('second_campus_5f');
  await interact({id:'SECOND_CHEST_PATIENT'});
  await interact({id:'SECOND_CHEST_TRANSFER'});
  await page.waitForSelector('#story-choice-modal.active');await shot('m4-chest-transfer');await secondary();
  s=await snap();assert.equal(s.flags.M4_CHEST_RESOLVED,true);assert.equal(s.flags.OUTDOOR_ROUTE_ACCESS,true);assert.equal(s.flags.CHEST_RECORD_MATCH,true);
  await mark('M4 chest-pain duplicate resolved');

  // M5A: skybridge rule.
  await load('skybridge');
  await interact({id:'BRIDGE_LOOP_EVENT'});
  await page.waitForSelector('#story-choice-modal.active');await shot('m5-bridge-double');await secondary();
  s=await snap();assert.equal(s.flags.M5_BRIDGE_RESOLVED,true);assert.equal(s.flags.FLOOR6_AVAILABLE,true);assert.equal(s.memory.proofs.identity,true);assert.equal(s.memory.trueNameFragments.frag_givenName_2,'衡');
  await mark('M5 bridge rule resolved');

  // M5B: alternate pond route is independently functional.
  await load('ecology_pond');
  await interact({id:'POND_REFLECTION_EVENT'});
  await page.waitForSelector('#story-choice-modal.active');await shot('m5-pond-reflection');await secondary();
  s=await snap();assert.equal(s.flags.M5_POND_RESOLVED,true);
  await mark('M5 pond alternate route resolved');

  // M6: nonexistent 6F — stay near lift instead of chasing.
  await flag('PHANTOM6_RETURN_ZONE','second_campus_5f');await load('phantom_6f','phantom_6f_lift');
  await shot('m6-phantom6');
  await interact({id:'FLOOR6_SAFE_RETURN'});
  s=await snap();assert.equal(s.flags.M6_FLOOR6_RESOLVED,true);assert.equal(s.zone,'second_campus_5f');
  await mark('M6 nonexistent 6F resolved');

  // M7: 02:17 decision + B2 convergence.
  assert.equal((await snap()).memory.proofs.space,true);
  assert.equal((await snap()).memory.proofs.identity,true);
  assert.equal((await snap()).memory.proofs.time,true);
  await load('first_campus_1f');
  await interact({id:'1F_HIDDEN_SERVICE_DOOR'});
  await page.waitForSelector('#story-choice-modal.active');await shot('m7-0217-choice');await secondary();
  await page.waitForFunction(()=>window.__storyQA.worldRouter.activeZoneId==='b2_archive');
  await shot('m7-b2');
  await interact({id:'B2_ARCHIVE_TERMINAL'});
  s=await snap();assert.equal(s.flags.M7_B2_RESOLVED,true);assert.equal(s.flags.M8_IDENTITY_BATTLE_ACTIVE,true);assert.equal(s.memory.trueNameResolved,true);assert.equal(s.memory.trueName,'林昱衡');
  await interact({id:'B2_RETURN_LIFT'});
  await page.waitForFunction(()=>window.__storyQA.worldRouter.activeZoneId==='first_campus_1f');
  s=await snap();assert.equal(s.flags.LAST_CALL_SEEN,true);
  await mark('M7 B2 reveals true name; M8 identity battle active');

  // M9: return to 316 and complete the real handoff.
  await load('first_campus_3f');
  await flag('OPENED_316',true);
  await interact({id:'E_HANDOFF'});
  await page.waitForSelector('#final-handoff-modal.active');await shot('m9-final-handoff');
  await page.locator('#final-true-name').fill('林昱衡');
  await page.locator('#btn-submit-final-handoff').click();
  await page.waitForSelector('#final-success-modal.active');
  await shot('m9-success');
  s=await snap();assert.equal(s.flags.GAME_COMPLETE,true);assert.equal(s.memory.gameComplete,true);
  await mark('M9 TRUE NAME handoff accepted');

  assert.equal(report.errors.length,0,JSON.stringify(report.errors,null,2));
  report.verdict='PASS';
}catch(e){
  report.verdict='FAIL';report.failure=e.stack;report.last=await snap().catch(()=>null);
  if(page)await page.screenshot({path:out+'/failure.png',fullPage:true}).catch(()=>{});
  process.exitCode=1;console.error(e.stack);
}finally{
  report.ended=new Date().toISOString();
  await writeFile(out+'/result.json',JSON.stringify(report,null,2));
  await browser.close();
  if(server)await new Promise(r=>server.httpServer.close(r));
}
