import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PersistentMemory,TRUE_NAME_CANON} from './src/core/PersistentMemory.js';

assert.equal(TRUE_NAME_CANON,'張守恆');

const main=readFileSync('./src/main.js','utf8');
const er=readFileSync('./src/world/zones/FirstCampus2FER.js','utf8');
const level3=readFileSync('./src/world/Level3FBlockout.js','utf8');
const ward=readFileSync('./src/world/shared/WardFloorplan.js','utf8');
const bridge=readFileSync('./src/world/zones/Skybridge.js','utf8');
const pond=readFileSync('./src/world/zones/EcologyPond.js','utf8');
const floor6=readFileSync('./src/world/zones/Phantom6F.js','utf8');
const b2=readFileSync('./src/world/zones/B2Archive.js','utf8');
const router=readFileSync('./src/world/WorldRouter.js','utf8');
const routes=readFileSync('./src/world/shared/WorldRoutes.js','utf8');
const html=readFileSync('./index.html','utf8');

assert(!main.includes('工號'),'player-facing story copy must use 員編 terminology');
assert(!routes.includes('hill_from_')&&!routes.includes('pond_from_'),'production routes must not expose outdoor spawns');
assert(!router.includes('HillsideRoute')&&!router.includes('EcologyPond'),'production router must not load outdoor zones');
assert(main.includes("setTrueNameFragment('frag_employeePrefix','MED-87')"),'M3 MED-87 clue missing');
assert(main.includes("setTrueNameFragment('frag_employeeFull','MED-870409')"),'M7 full 員編 clue missing');
assert(main.includes('請到第二院區 5F 護理站報到'),'M3 lookup must hand off through the nursing station');
assert(main.includes('八樓天橋的門禁權限已開放'),'second-campus call must identify the bridge floor');
assert(main.includes('怎麼知道我在 316 辦公室'),'M3 phone must establish the 316 privacy violation');
assert(html.includes('final-employee-id'),'M9 must collect the full 員編');
assert(main.includes("employeeId==='MED-870409'")&&main.includes("name===TRUE_NAME_CANON"),'M9 must require both the exact name and employee ID');
assert(!readFileSync('./src/ui/UIManager.js','utf8').includes('突然出現在樓層選單裡的「6F」'),'M6 task must not spoil the floor');
assert(!readFileSync('./src/world/WorldRouter.js','utf8').includes("label:'6F'"),'phantom 6F must never be a selectable floor');

assert(er.includes("type:'er_ghost_registration'"),'M3 ghost registration terminal missing');
assert(er.includes("type:'er_exit_notice'")&&er.includes('此門只進不出'),'M3 ER entry-only exit warning missing');
assert(main.includes("LEGEND 02 — 00:33 急診掛號")&&main.includes("ER0033_SLIP_COLLECTED")&&main.includes("legacy_terminal_316")&&level3.includes("316_LEGACY_TERMINAL")&&main.includes("SECOND_CAMPUS_ACCESS"),'M3 two-stage ER-to-316 resolve or campus call missing');

assert(ward.includes("type:'second_campus_nursing_report'")&&ward.includes("type:'second_chest_patient'")&&ward.includes("type:'second_chest_transfer'"),'M4 nursing report/patient/form sequence missing');
assert(ward.includes("label:'查看病人處置醫囑'"),'M4 desk paper must retain its initial treatment-order name');
assert(main.includes("SECOND_CAMPUS_5F_REPORTED")&&main.includes('病人是陳怡君，在 504B'),'M4 report must reveal patient identity and bed before assessment');
assert(main.includes("LEGEND 03 — 事先填妥的轉院單")&&main.includes("M4_CHEST_RESOLVED")&&main.includes("second_chest_roster_clue"),'M4 clinical/admin-horror decision flow or physical clue missing');

assert(bridge.includes("type:'bridge_loop_event'")&&main.includes("LEGEND 04 — 不能回頭的天橋"),'M5 bridge legend missing');
assert(main.includes("frag_givenName_2','恆'"),'M5 true-name fragment missing');
assert(!bridge.includes("type:'true_name_clue_2'")&&floor6.includes("type:'floor6_stethoscope_search'")&&floor6.includes("type:'floor6_stethoscope_inspect'")&&main.includes("FLOOR6_STETHOSCOPE_INSPECTED"),'the physical name clue must be searched and inspected on 6F');

assert(floor6.includes("type:'floor6_safe_return'")&&floor6.includes("type:'floor6_chase'"),'M6 phantom floor interactions missing');
assert(router.includes("'phantom_6f': Phantom6F")&&routes.includes("phantom_6f_lift"),'M6 route registration missing');
assert(main.includes("LEGEND 06 — 不存在的六樓")&&main.includes("M6_FLOOR6_RESOLVED"),'M6 safe/override logic missing');

assert(b2.includes("type:'b2_archive_terminal'")&&b2.includes("type:'b2_escape_stairs'"),'M7 B2 convergence interactions missing');
assert(main.includes("interactable.type === 'er_nurse_computer'")&&main.includes('這個電腦是護理師專用'),'ER nurse computers must redirect the physician');
assert(main.includes("gameState.setFlag('B2_IDENTITY_INCOMPLETE',true)")&&main.includes("interactable.type === 'b2_escape_stairs'"),'B2 insufficient identity route must fail forward to stairs');
assert(router.includes("'b2_archive': B2Archive")&&routes.includes("b2_archive_lift"),'M7 B2 route registration missing');
assert(main.includes("M7_B2_RESOLVED")&&main.includes("02:17｜警衛台後方 B-Panel"),'M7 02:17/B2 logic missing');

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
assert.equal(memory.canReconstructTrueName(),false,'full MED-870409 is required to reconstruct identity');
memory.setTrueNameFragment('frag_employeeFull','MED-870409');
assert.equal(memory.canReconstructTrueName(),true);
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
