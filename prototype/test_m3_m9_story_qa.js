import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PersistentMemory,TRUE_NAME_CANON} from './src/core/PersistentMemory.js';

assert.equal(TRUE_NAME_CANON,'張守恆');

const main=readFileSync('./src/main.js','utf8');
const er=readFileSync('./src/world/zones/FirstCampus2FER.js','utf8');
const ward=readFileSync('./src/world/shared/WardFloorplan.js','utf8');
const bridge=readFileSync('./src/world/zones/Skybridge.js','utf8');
const pond=readFileSync('./src/world/zones/EcologyPond.js','utf8');
const floor6=readFileSync('./src/world/zones/Phantom6F.js','utf8');
const b2=readFileSync('./src/world/zones/B2Archive.js','utf8');
const router=readFileSync('./src/world/WorldRouter.js','utf8');
const routes=readFileSync('./src/world/shared/WorldRoutes.js','utf8');
const html=readFileSync('./index.html','utf8');

assert(er.includes("type:'er_ghost_registration'"),'M3 ghost registration terminal missing');
assert(er.includes("type:'er_exit_notice'")&&er.includes('此門只進不出'),'M3 ER entry-only exit warning missing');
assert(main.includes("LEGEND 02 — 00:33 急診掛號")&&main.includes("ER0033_SLIP_COLLECTED")&&main.includes("316_LEGACY_TERMINAL")&&main.includes("SECOND_CAMPUS_ACCESS"),'M3 two-stage ER-to-316 resolve or campus call missing');

assert(ward.includes("type:'second_chest_patient'")&&ward.includes("type:'second_chest_transfer'"),'M4 chest-pain patient/form missing');
assert(main.includes("LEGEND 03 — 多出來的胸痛病人")&&main.includes("M4_CHEST_RESOLVED"),'M4 decision flow missing');

assert(bridge.includes("type:'bridge_loop_event'")&&main.includes("LEGEND 04 — 不能回頭的天橋"),'M5 bridge legend missing');
assert(pond.includes("type:'pond_reflection_event'")&&main.includes("LEGEND 05 — 生態池裡的人影"),'M5 pond legend missing');
assert(main.includes("frag_givenName_2','恆'"),'M5 true-name fragment missing');

assert(floor6.includes("type:'floor6_safe_return'")&&floor6.includes("type:'floor6_chase'"),'M6 phantom floor interactions missing');
assert(router.includes("'phantom_6f': Phantom6F")&&routes.includes("phantom_6f_lift"),'M6 route registration missing');
assert(main.includes("LEGEND 06 — 不存在的六樓")&&main.includes("M6_FLOOR6_RESOLVED"),'M6 safe/override logic missing');

assert(b2.includes("type:'b2_archive_terminal'")&&b2.includes("type:'b2_return_lift'"),'M7 B2 convergence interactions missing');
assert(router.includes("'b2_archive': B2Archive")&&routes.includes("b2_archive_lift"),'M7 B2 route registration missing');
assert(main.includes("M7_B2_RESOLVED")&&main.includes("02:17｜舊警衛台後配電"),'M7 02:17/B2 logic missing');

assert(main.includes("M8_IDENTITY_BATTLE_ACTIVE")&&main.includes("LAST_CALL_SEEN"),'M8 identity battle/last call missing');
assert(html.includes('final-handoff-modal')&&main.includes("TRUE_NAME_CANON")&&main.includes("GAME_COMPLETE"),'M9 true-name final handoff missing');

const backing=new Map();
const storage={getItem:k=>backing.get(k)||null,setItem:(k,v)=>backing.set(k,v),removeItem:k=>backing.delete(k)};
const memory=new PersistentMemory(storage);
memory.setProof('space');memory.setProof('identity');memory.setProof('time');
assert(memory.hasAllProofs(),'M7 proof convergence must require all three proofs');
memory.setTrueNameFragment('frag_employeePrefix','MED-87');
memory.setTrueNameFragment('frag_surname','張');
memory.setTrueNameFragment('frag_givenName_1','守');
memory.setTrueNameFragment('frag_givenName_2','恆');
memory.setTrueNameFragment('frag_title','住院醫師');
assert.equal(memory.resolveTrueName(TRUE_NAME_CANON),true);
assert.equal(memory.data.trueName,'張守恆');
memory.completeGame();
assert.equal(memory.data.gameComplete,true);

for(const file of [
  readFileSync('./src/world/zones/FirstCampus8FBridgeEntry.js','utf8'),
  readFileSync('./src/world/zones/SecondCampus2F.js','utf8'),
  readFileSync('./src/world/zones/SecondCampus1F.js','utf8'),
  bridge,pond
]) assert(!file.includes('松德'),'Public zone contains forbidden legacy real-hospital name');

console.log('M3-M9 STORY ARCHITECTURE QA PASS');
