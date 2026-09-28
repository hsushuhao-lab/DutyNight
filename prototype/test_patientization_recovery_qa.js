import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GameState} from './src/core/GameState.js';
import {
  PATIENTIZATION_RECOVERY_ANCHORS,
  applyPatientizationRecoveryAnchor
} from './src/core/PatientizationRecovery.js';

const expected={
  HANDOFF_DEFAULT:['17:00','first_campus_3f','m0_316_office'],
  BED33:['19:30','first_campus_4f','m3_4f_ward_gate'],
  ER0033:['00:33','first_campus_2f','recovery_er0033'],
  CHEST:['01:15','second_campus_5f','recovery_chest_patient'],
  BRIDGE:['01:45','skybridge','m7_skybridge_end'],
  TIMELOOP:['02:17','first_campus_1f','first_1f_guard_back']
};

for(const [id,[time,zoneId,spawnId]] of Object.entries(expected)){
  const anchor=PATIENTIZATION_RECOVERY_ANCHORS[id];
  assert(anchor,'missing Patientization recovery anchor '+id);
  assert.equal(anchor.time,time,id+' recovery time drifted');
  assert.equal(anchor.zoneId,zoneId,id+' recovery zone drifted');
  assert.equal(anchor.spawnId,spawnId,id+' recovery spawn drifted');
  const state=new GameState();
  const applied=applyPatientizationRecoveryAnchor(state,id);
  assert.equal(applied,anchor);
  assert.equal(state.gameTime,time);
  assert.equal(state.getFlag('PATIENTIZATION_RECOVERY_ANCHOR'),id);
}

{
  const state=new GameState();
  applyPatientizationRecoveryAnchor(state,'HANDOFF_DEFAULT');
  assert.equal(state.getFlag('OPENED_316'),true);
  assert.equal(state.getFlag('HIS_CREDENTIALS'),true);
  assert.equal(state.isTaskComplete('DUTY_LOG'),true,'M1 repeat must not redo the duty-log chore');
  assert.equal(state.isTaskComplete('E_HANDOFF'),true,'M1 repeat must skip the already-learned identity-template decision');
  assert.equal(state.isTaskComplete('KEY_PICKUP'),false,'M1 repeat must still require the 1700 locker pickup');
  assert.equal(state.getFlag('M1_HANDOFF_CHOICE_RESOLVED'),true);
  assert.equal(state.getFlag('FAST_PATH_316_CALL_DONE'),true,'M1 repeat must not insert an extra 316 phone gate');
}

{
  const state=new GameState();
  applyPatientizationRecoveryAnchor(state,'BED33');
  assert.equal(state.isTaskComplete('WARD_ENTRY'),true);
  assert.equal(state.isTaskComplete('P1_4F_REPORT'),false,'M2 repeat must still require one nursing-station report');
  assert.equal(state.isTaskComplete('P1_NORMAL_EVENT_DONE'),false,'M2 repeat skips 408C/409 only after the nursing report');
  assert.equal(state.getFlag('FOURF_409_SEAL_CHECKED_AFTER_408C'),false);
  assert.equal(state.getFlag('BED33_RESOLVED'),false);
  assert.equal(state.getFlag('FAST_PATH_3F'),true,'the nursing report must collapse the already-learned M2 chores');
}

{
  const state=new GameState();
  applyPatientizationRecoveryAnchor(state,'ER0033');
  assert.equal(state.getFlag('GHOST_REGISTRATION_AVAILABLE'),true);
  assert.equal(state.getFlag('ER0033_SLIP_COLLECTED'),false,'00:33 recovery must return before creating/reading the record');
}

{
  const state=new GameState();
  applyPatientizationRecoveryAnchor(state,'CHEST');
  assert.equal(state.getFlag('SECOND_CAMPUS_5F_REPORTED'),true);
  assert.equal(state.getFlag('SECOND_CHEST_PATIENT_SEEN'),false,'M4 repeat must restart at 504B patient assessment, not at the form');
  assert.equal(state.getFlag('M4_CHEST_RESOLVED'),false,'transfer recovery must return before signing');
}

{
  const state=new GameState();
  applyPatientizationRecoveryAnchor(state,'BRIDGE');
  assert.equal(state.getFlag('M5_CCTV_RESOLVED'),true);
  assert.equal(state.getFlag('M5_ROUTE_CHOICE_RESOLVED'),false,'bridge recovery must return before the look-back decision');
}

{
  const state=new GameState();
  applyPatientizationRecoveryAnchor(state,'TIMELOOP');
  assert.equal(state.getFlag('M6_FLOOR6_RESOLVED'),true);
  assert.equal(state.getFlag('HIDDEN_SERVICE_DOOR_DISCOVERED'),true);
  assert.equal(state.getFlag('B_PANEL_KEY'),true);
  assert.equal(state.getFlag('M7_B2_OPEN'),false,'02:17 recovery must return before opening B2');
}

const loopManager=readFileSync('./src/core/LoopManager.js','utf8');
const ui=readFileSync('./src/ui/UIManager.js','utf8');
const main=readFileSync('./src/main.js','utf8');
const routes=readFileSync('./src/world/shared/WorldRoutes.js','utf8');

assert(loopManager.includes("persistentMemory.data.loopCount===1"),'first Patientization must still use the full 17:00 reset');
assert(loopManager.includes('getPatientizationRecoveryAnchor')&&loopManager.includes('recoverToMemoryAnchor'),'later Patientization must use explicit recovery anchors');
assert(loopManager.includes("this.softResetTo1700()"),'17:00 full-loop fallback must remain available');
assert(ui.includes('MEMORY ANCHOR RESTORED')&&ui.includes('這些我已經記得。'),'memory-anchor recovery presentation missing');
assert(ui.includes('已保留：已確認身分線索、院史資料與生存規則'),'recovery must tell players what persisted');
assert(main.includes("prepareLoopReset:(zoneId='first_campus_3f')=>prepareZoneWithRetry(zoneId)"),'recovery destination must preload before scene rebuild');
assert(routes.includes("add('recovery_er0033'")&&routes.includes("add('recovery_chest_patient'"),'authored recovery spawns missing');
const html=readFileSync('./index.html','utf8');
assert(!html.includes('第一線值班：'),'initial HUD must not imply the player is the canonical first-line doctor');
assert(!ui.includes('第一線值班：'),'runtime HUD must not imply the player is the canonical first-line doctor');
assert(ui.includes('進入 316，使用 1700 打開值班物品櫃'),'M1 repeat HUD must point directly to the 1700 locker');
assert(main.includes("recoveredBed33?'19:30':'17:15'"),'M2 recovery report must preserve 19:30 without backward-time warnings');

console.log('PATIENTIZATION MEMORY-ANCHOR RECOVERY QA PASS');
