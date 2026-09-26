import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GameState} from './src/core/GameState.js';
import {FloorStateManager,GamePhase} from './src/core/FloorStateManager.js';

const state=new GameState();
const manager=new FloorStateManager(state);
assert.equal(manager.phase,GamePhase.FIRST_ARRIVAL);
manager.setPhase(GamePhase.AFTER_ARCHIVE);
assert.equal(state.getGamePhase(),GamePhase.AFTER_ARCHIVE);

const router=readFileSync('./src/world/WorldRouter.js','utf8');
const main=readFileSync('./src/main.js','utf8');
const stateSource=readFileSync('./src/core/GameState.js','utf8');
const floor3=readFileSync('./src/world/zones/FirstCampus3F.js','utf8');
const floor2=readFileSync('./src/world/zones/FirstCampus2FER.js','utf8');
const floor1=readFileSync('./src/world/zones/FirstCampus1F.js','utf8');
const core=readFileSync('./src/world/shared/VerticalCore.js','utf8');
const duty=readFileSync('./src/core/DutyEventManager.js','utf8');

assert(router.includes('floorStateManager.apply(zoneId,this.activeZoneInstance)'),'WorldRouter must reapply floor phase on every load');
assert(floor3.includes("Phase2_2040_ElevatorGlitch")&&floor3.includes("Phase3_2117_NightPatrol"),'3F must define phase-specific return states');
assert(floor3.includes('Phase3_2117_WetFootprints'),'21:17 3F return must have wet-footprint layer');
assert(floor3.includes('409／舊隔離零號房')&&floor3.includes('316／夜間封鎖決策點')&&floor3.includes('1F／警衛台後配電')&&floor3.includes('2F／舊式手圈索引'),'Archive must seed 409/316/1F/2F hard hooks');
assert(stateSource.includes("HOOK_409_ZERO_ROOM")&&main.includes("registerBed33Clue('ARCHIVE_0409')")&&main.includes("SECOND_CAMPUS_PHONE_PENDING"),'409A clue and 316-to-second-campus call hooks missing');
assert(main.includes("ER_UNKNOWN_MALE_TAG")&&main.includes("B_PANEL_CLUE_KNOWN")&&main.includes("WANG_B_PANEL_KEY"),'2F unknown-male clue to 1F security-key chain missing');
assert(floor2.includes("ER_UnknownMale_ObservationPatient")&&floor2.includes("ENG-860214 / 6F SKILL LAB / B-PANEL"),'20:05 physical patient must carry the burned facilities-maintenance identity clue');
assert(floor1.includes("1F_HIDDEN_SERVICE_DOOR")&&floor1.includes("requires:'FIRST_FLOOR_GUARD_KEY'"),'1F concealed service-door hook missing');
assert(main.includes("FORCE_3F_ELEVATOR_STOP")&&main.includes("GamePhase.ELEVATOR_GLITCH"),'20:40 forced 3F elevator return missing');
assert(core.includes("StairLatch_3F_Locked")&&core.includes("StairBolt_4F_UnlockSide"),'3F/4F asymmetric stair shortcut visual states missing');
assert(main.includes("STAIR_SHORTCUT_3F_4F"),'3F/4F shortcut gate logic missing');
assert(main.includes("NIGHT_PATROL_RETURN_3F")&&main.includes("GamePhase.NIGHT_PATROL"),'21:15 return-to-3F paradox setup missing');
assert(duty.includes("21:16")&&duty.includes("NIGHT_PATROL_RETURN_3F"),'3F return must stage the player just before the 21:17 bootstrap');
assert(floor3.includes("type:'guard_sign_2117'")&&floor3.includes("type:'guard_book_2117'"),'21:17 bootstrap must require both noticing the checkpoint and signing the logbook');
assert(main.includes("GUARD_SIGN_EXAMINED")&&main.includes("BOOTSTRAP_2117_RESOLVED"),'21:17 two-step completion flags missing');
assert(main.includes("GHOST_REGISTRATION_AVAILABLE")&&floor2.includes("GHOST_REGISTRATION_AVAILABLE"),'00:33 registration must stay gated until a later ER return');

console.log('CROSS-FLOOR ENTANGLEMENT QA PASS');
