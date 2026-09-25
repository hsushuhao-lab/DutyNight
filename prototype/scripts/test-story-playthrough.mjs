import {chromium} from 'playwright';
import {preview} from 'vite';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const out=process.argv[2]||'qa-results/story-playthrough';
const supplied=process.argv[3]||null;
const root=fileURLToPath(new URL('..',import.meta.url));
await mkdir(out,{recursive:true});
const server=supplied?null:await preview({root,preview:{port:4173,strictPort:true}});
const base=(supplied||'http://localhost:4173/').replace(/\/+$/,'')+'/';
const url=base+'?qa=story';
const browser=await chromium.launch({headless:true});
const requiredShots=[
  'm1-3f-admin-316.png','m1-3f-storage-annie-static.png','m1-annie-close-inspection.png','m2-4f-nursing-station.png','m2-4f-duty-room.png',
  'm2-408c-bed.png','m2-409-sealed.png','m3-er-nursing-station.png','m3-0033-registration.png',
  'm3-316-legacy-terminal-phone.png','m4-ordinary-patient.png','m4-transfer-form.png','m4-guard-roster-clue.png',
  'm5-outbound-bridge-baseline.png','m5-return-bridge-annie.png','m5-bridge-close-annie.png','m5-stethoscope-relic.png','m6-elevator-display-6.png',
  'm6-annie-cpr-long.png','m6-annie-cpr.png','m6-annie-cpr-close.png','m7-1f-guard-post.png','m7-b-panel-concealed-door.png','m7-b2-mirror-316.png',
  'm9-dual-identity-form.png','m9-successful-dawn-ending.png'
];
const report={url,sourceSha:process.env.GITHUB_SHA||'local-working-tree',started:new Date().toISOString(),milestones:[],screenshots:[],motionScreenshots:[],screenshotWarnings:[],errors:[],method:'Browser-driven M2-M9 story checkpoint playthrough with named scene-anchor frustum checks, 26 required full-resolution captures, and bridge-idle/CPR motion frames.'};
let page;

async function snap(){return page.evaluate(()=>window.__storyQA.snapshot());}
async function mark(label,extra={}){
  const s=await snap();report.milestones.push({label,...extra,zone:s.zone,time:s.time,loopCount:s.memory.loopCount,erosion:s.memory.identityErosionLevel});
  await writeFile(out+'/progress.json',JSON.stringify(report,null,2));
  console.log(label,JSON.stringify({zone:s.zone,time:s.time,loop:s.memory.loopCount,erosion:s.memory.identityErosionLevel,...extra}));
}
async function shot(name,zone,spawn,anchorName,position,target){
  const file=name+'.png';
  if(zone)await load(zone,spawn);
  const view=await q(args=>window.__storyQA.captureView(args),{anchorName,position,target});
  await page.waitForTimeout(180);
  const buffer=await page.screenshot({path:out+'/'+file,fullPage:false,timeout:30000});
  const image=await readFile(out+'/'+file);
  assert(buffer.length>1024,'Screenshot was empty: '+file);
  assert.deepEqual([...image.subarray(0,8)],[137,80,78,71,13,10,26,10],'Invalid PNG: '+file);
  assert.equal(image.readUInt32BE(16),1440,'Unexpected screenshot width: '+file);
  assert.equal(image.readUInt32BE(20),900,'Unexpected screenshot height: '+file);
  report.screenshots.push({
    file,anchorName,rect:view.rect,bytes:image.length,
    camera:{position,target,distance:Number(Math.hypot(...position.map((value,index)=>value-target[index])).toFixed(2))},
    sha256:createHash('sha256').update(image).digest('hex')
  });
  await writeFile(out+'/progress.json',JSON.stringify(report,null,2));
  console.log('SCREENSHOT',JSON.stringify({file,anchorName,rect:view.rect,bytes:image.length}));
}
async function motionShot(name,anchorName,position,target,motionValue){
  const file='motion/'+name+'.png';
  await mkdir(out+'/motion',{recursive:true});
  const view=await q(args=>window.__storyQA.captureView(args),{anchorName,position,target});
  let frozen=false;
  if(motionValue?.capture==='cpr'){
    const phase=motionValue.phase;
    const sample=await page.waitForFunction(phase=>{
      const zone=window.__storyQA.worldRouter.activeZoneInstance;
      const value=zone.annie.userData.rig.compression;
      if(phase==='press'?value<=.85:value>=.05)return false;
      zone.__storyQaMotionUpdate={own:Object.hasOwn(zone,'update'),update:zone.update};
      zone.update=()=>{};
      return {value};
    },phase,{timeout:5000});
    frozen=true;
    motionValue=(await sample.jsonValue()).value;
  }
  try{
    const buffer=await page.screenshot({path:out+'/'+file,fullPage:false,timeout:30000});
    assert(buffer.length>1024,'Motion screenshot was empty: '+file);
    const image=await readFile(out+'/'+file);
    report.motionScreenshots.push({
      file,anchorName,rect:view.rect,motionValue,
      camera:{position,target,distance:Number(Math.hypot(...position.map((value,index)=>value-target[index])).toFixed(2))},
      bytes:image.length,sha256:createHash('sha256').update(image).digest('hex')
    });
    await writeFile(out+'/progress.json',JSON.stringify(report,null,2));
  }finally{
    if(frozen)await q(()=>{
      const zone=window.__storyQA.worldRouter.activeZoneInstance;
      const previous=zone.__storyQaMotionUpdate;
      if(previous.own)zone.update=previous.update;else delete zone.update;
      delete zone.__storyQaMotionUpdate;
    });
  }
  return motionValue;
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
  await publicPage.close();

  await page.goto(url,{waitUntil:'load',timeout:180000});
  await page.waitForFunction(()=>window.__storyQA?.worldRouter?.activeZoneInstance,null,{timeout:180000});
  await mark('Story QA bridge ready');
  await shot('m1-3f-admin-316','first_campus_3f','m0_316_office','AdminDesk_Monitor',[-19.25,1.7,3.65],[-19.25,1.25,5.18]);
  await shot('m1-3f-storage-annie-static','first_campus_3f','m0_3f_corridor','Annie_STORAGE_STATIC',[15.2,1.7,5.6],[13.48,1.0,3.18]);
  let mannequinCheck=await q(()=>{const a=window.__storyQA.worldRouter.activeZoneInstance.levelInstance.anneGroup;return {state:a.userData.state,inscription:a.userData.inscription,airway:!!a.getObjectByName('Annie_MouthAirway'),face:a.getObjectByName('Annie_SmoothVinylFace')?.material?.roughness,stethoscope:!!a.getObjectByName('Annie_StethoscopeEngravingPlate')}});
  assert.equal(mannequinCheck.state,'STORAGE_STATIC');assert.equal(mannequinCheck.inscription,'祝 守恆 醫師 1997 執業誌慶');assert(mannequinCheck.airway);assert(mannequinCheck.face<.5);assert(mannequinCheck.stethoscope);
  await shot('m1-annie-close-inspection',null,null,'Annie_Stethoscope',[13.48,1.25,4.15],[13.48,0.85,3.18]);
  await shot('m2-4f-nursing-station','first_campus_4f','m3_4f_nursing_station','WorkstationDesk_first_station_A',[0,1.7,-4.6],[-3.35,1.0,-2.35]);
  await shot('m2-4f-duty-room','first_campus_4f','m2_4f_duty_room','DutyRoom_ExtensionPhone',[-10.8,1.7,4.8],[-9.62,.87,7.1]);
  await shot('m2-408c-bed','first_campus_4f','m2_4f_409','Bed_408C',[9.8,1.7,-8.2],[8.1,.8,-7.32]);
  await shot('m2-409-sealed','first_campus_4f','m2_4f_409','Bed33_409_WarningTape',[5.0,1.7,-3.0],[6.88,1.2,-3.0]);

  // M2: deliberately fail first, verify identity override + soft reset + persistent cognition.
  await setM2Checkpoint();
  await load('first_campus_4f','m3_4f_nursing_station');
  await interact({action:'INSOMNIA_403'});
  await interact({id:'BED33_BOARD'});await closeArchive();
  await interact({id:'BED33_HIS_409'});await closeArchive();
  let s=await snap();assert.equal(s.legend,'NOTICED');
  await interact({id:'BED33_ASSIGNMENT'});
  await page.waitForSelector('#bed33-modal.active');

  await q(()=>new Promise((resolve,reject)=>{
    document.getElementById('btn-bed33-confirm').click();
    setTimeout(()=>{
      const cutscene=document.getElementById('loop-cutscene');
      const skip=document.getElementById('btn-loop-skip');
      if(!cutscene?.classList.contains('active')||!skip||skip.getBoundingClientRect().width===0){
        reject(new Error('Loop fast-forward control was not visible during override'));
        return;
      }
      skip.click();
      resolve();
    },500);
  }));
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
  await load('first_campus_2f','m4_2f_er_triage');await shot('m3-er-nursing-station',null,null,'ER_TriageCounter',[3.5,2.2,.8],[3.5,1.45,6.4]);
  s=await snap();assert.equal(s.flags.GHOST_REGISTRATION_AVAILABLE,true);assert.equal(s.time,'00:33');
  assert.equal(await q(()=>window.__storyQA.gameState.getDisplayTime()),'翌日 00:33');
  await interact({id:'ER_GHOST_REGISTRATION'});
  await page.waitForSelector('#story-choice-modal.active');
  await shot('m3-0033-registration',null,null,'ER_GhostRegistrationTerminal',[15.2,1.7,-6.2],[13,1.18,-6.35]);await secondary();
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
  await shot('m3-316-legacy-terminal-phone',null,null,'DutyTerminal_316_LegacyScreen',[3.4,1.65,5.72],[9.55,1.25,5.5]);
  assert.match(await page.locator('#subtitle-text').innerText(),/終端機停止後，桌上的院內電話立刻響起/);
  assert.doesNotMatch(await page.locator('#subtitle-text').innerText(),/\\n/,'316 terminal subtitle must use real line breaks');
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
  await shot('m4-ordinary-patient',null,null,'SecondCampus_ChestPainPatient',[70.2,1.7,-11.3],[72,.95,-13]);
  await interact({id:'SECOND_CHEST_PATIENT'});
  assert.match(await taskText(),/轉院單/,'seeing the M4 patient must advance the objective to the transfer form');
  await interact({id:'SECOND_CHEST_TRANSFER'});
  await page.waitForSelector('#story-choice-modal.active');
  await shot('m4-transfer-form',null,null,'SecondCampus_ChestTransferForm',[70.9,1.5,-1.2],[70.72,.83,-2.18]);await secondary();
  s=await snap();assert.equal(s.flags.M4_CHEST_RESOLVED,true);assert.equal(s.flags.CHEST_RECORD_MATCH,true);assert.equal(s.memory.trueNameFragments.frag_givenName_1,null);assert.equal(s.time,'01:45');
  await interact({id:'SECOND_CHEST_NAME_CLUE'});await closeArchive();
  await shot('m4-guard-roster-clue',null,null,'SecondCampus_TrueNameRosterFragment',[73.4,2.0,-11.9],[72.24,.82,-12.72]);
  s=await snap();assert.equal(s.flags.M4_NAME_CLUE_FOUND,true);assert.equal(s.memory.trueNameFragments.frag_givenName_1,'守');
  assert.match(await taskText(),/返回第一院區/,'M4 resolution must push the player toward the next route');
  await mark('M4 chest-pain duplicate resolved');

  // M5A: skybridge rule.
  await load('skybridge','bridge_from_first');
  await shot('m5-outbound-bridge-baseline',null,null,'Annie_BRIDGE_MANIFEST',[34,1.9,0],[46,0.95,0]);
  await interact({id:'BRIDGE_LOOP_EVENT'});
  await page.waitForSelector('#story-choice-modal.active');await secondary();
  await shot('m5-return-bridge-annie',null,null,'Annie_BRIDGE_MANIFEST',[41,1.65,0],[46,1.0,0]);
  await shot('m5-bridge-close-annie',null,null,'Annie_BRIDGE_MANIFEST',[44.95,1.6,-0.4],[46,1.25,0]);
  const bridgeMotion=[];
  for(let frame=0;frame<3;frame++){
    await page.waitForTimeout(180);
    const pose=await q(()=>{const a=window.__storyQA.worldRouter.activeZoneInstance.bridgeDoppelganger;return {body:a.userData.rig.upperBody.rotation.z,head:a.userData.rig.head.rotation.z};});
    bridgeMotion.push(pose.head);
    await motionShot(`m5-bridge-idle-${frame+1}`,'Annie_BRIDGE_MANIFEST',[41,1.65,0],[46,1.0,0],pose);
  }
  assert(Math.max(...bridgeMotion)-Math.min(...bridgeMotion)>0.0001,'Bridge idle motion must change across the three browser frames');
  s=await snap();assert.equal(s.flags.M5_BRIDGE_RESOLVED,true);assert.equal(s.flags.M5_ROUTE_RESOLVED,false);assert.equal(s.flags.FLOOR6_AVAILABLE,false);assert.equal(s.memory.proofs.identity,false);assert.equal(s.memory.trueNameFragments.frag_givenName_2,null);assert.equal(s.time,'02:00');
  await interact({id:'ANNIE_TRUE_NAME_CLUE'});
  await shot('m5-stethoscope-relic',null,null,'Annie_EngravedStethoscope_Bridge',[6.5,1.65,1.2],[5,.95,.4]);
  s=await snap();assert.equal(s.flags.M5_ROUTE_RESOLVED,true);assert.equal(s.flags.FLOOR6_AVAILABLE,true);assert.equal(s.memory.proofs.identity,true);assert.equal(s.memory.trueNameFragments.frag_givenName_2,'恆');
  assert.match(await taskText(),/搭乘一般電梯返回第一院區/,'M5 resolution must reveal the return-to-ward elevator objective');
  await mark('M5 bridge rule resolved');

  // M6: nonexistent 6F — stay near lift instead of chasing.
  await flag('PHANTOM6_RETURN_ZONE','second_campus_5f');await load('phantom_6f','phantom_6f_lift');
  await shot('m6-elevator-display-6',null,null,'Phantom6F_ElevatorDisplay',[0,2.48,.6],[0,2.48,1.78]);
  await shot('m6-annie-cpr-long',null,null,'Annie_FLOOR6_CPR',[0,2.8,1.2],[.6,.9,-7.3]);
  mannequinCheck=await q(()=>{const a=window.__storyQA.worldRouter.activeZoneInstance.annie;return {state:a.userData.state,compression:a.userData.rig.compression,inscription:a.userData.inscription}});
  assert.equal(mannequinCheck.state,'FLOOR6_CPR');assert.equal(mannequinCheck.inscription,'祝 守恆 醫師 1997 執業誌慶');
  await page.waitForTimeout(120);
  const cprAfterFrame=await q(()=>window.__storyQA.worldRouter.activeZoneInstance.annie.userData.rig.compression);
  assert.notEqual(cprAfterFrame,mannequinCheck.compression,'6F CPR pose must move during the live animation loop');
  await shot('m6-annie-cpr',null,null,'Annie_FLOOR6_CPR',[0.5,1.85,-10.6],[.82,.85,-7.3]);
  await shot('m6-annie-cpr-close',null,null,'Annie_Stethoscope',[.3,2.15,-8.0],[.6,.96,-7.3]);
  const pressOne=await motionShot('m6-cpr-press-1','Annie_FLOOR6_CPR',[.3,2.15,-8.0],[.6,.96,-7.3],{capture:'cpr',phase:'press'});
  const release=await motionShot('m6-cpr-release','Annie_FLOOR6_CPR',[.3,2.15,-8.0],[.6,.96,-7.3],{capture:'cpr',phase:'release'});
  const pressTwo=await motionShot('m6-cpr-press-2','Annie_FLOOR6_CPR',[.3,2.15,-8.0],[.6,.96,-7.3],{capture:'cpr',phase:'press'});
  assert(pressOne>0.85&&release<0.05&&pressTwo>0.85,'CPR browser frames must show press, release, and press');

  await interact({id:'FLOOR6_SAFE_RETURN'});
  s=await snap();assert.equal(s.flags.M6_FLOOR6_RESOLVED,true);assert.equal(s.zone,'second_campus_5f');
  assert.match(await taskText(),/第一院區 1F[\s\S]*隱藏服務門/,'M6 resolution must push the player to the 1F service door');
  await mark('M6 nonexistent 6F resolved');

  // M7: 02:17 decision + B2 convergence.
  assert.equal((await snap()).memory.proofs.space,true);
  assert.equal((await snap()).memory.proofs.identity,true);
  assert.equal((await snap()).memory.proofs.time,true);
  await load('first_campus_1f');
  await shot('m7-1f-guard-post',null,null,'FirstCampus1F_OldGuardPost',[-7.8,1.7,3.2],[-10.7,1.0,3.2]);
  await shot('m7-b-panel-concealed-door',null,null,'FirstFloor_BPanel_ConcealedDoor',[-11.2,1.7,4.55],[-13.78,1.18,4.55]);
  await interact({id:'1F_HIDDEN_SERVICE_DOOR'});
  await page.waitForSelector('#story-choice-modal.active');await secondary();
  await page.waitForFunction(()=>window.__storyQA.worldRouter.activeZoneId==='b2_archive');
  await shot('m7-b2-mirror-316',null,null,'B2_Mirror316_Frame',[0,1.7,-11.0],[0,1.7,-14.65]);

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
  await page.waitForSelector('#final-handoff-modal.active');s=await snap();assert.equal(s.time,'04:05');
  await shot('m9-dual-identity-form',null,null,'DutyPhone_316_Handset',[7.5,1.7,5.7],[5.45,.95,5.72]);
  await page.locator('#final-true-name').fill('張守恆');
  await page.locator('#final-employee-id').fill('MED-870409');
  await domClick('#btn-submit-final-handoff');
  await page.waitForSelector('#final-success-modal.active');

  s=await snap();assert.equal(s.flags.GAME_COMPLETE,true);assert.equal(s.memory.gameComplete,true);
  await shot('m9-successful-dawn-ending',null,null,'DutyPhone_316_Handset',[7.5,1.7,5.7],[5.45,.95,5.72]);
  assert.match(await taskText(),/交班完成/,'completed game must close the task chain instead of dropping guidance');
  await mark('M9 TRUE NAME handoff accepted');

  assert.equal(report.errors.length,0,JSON.stringify(report.errors,null,2));
  assert.deepEqual(report.screenshots.map(shot=>shot.file),requiredShots,'Story QA must produce the exact ordered 26-image manifest');
  assert.equal(report.screenshotWarnings.length,0,'Screenshot warnings are not accepted');
  assert.equal(report.motionScreenshots.length,6,'Three bridge idle and three CPR animation frames are required');
  const pngFiles=(await readdir(out)).filter(file=>file.endsWith('.png')).sort();
  assert.deepEqual(pngFiles,[...requiredShots].sort(),'Output must contain exactly the 26 required screenshots');
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
