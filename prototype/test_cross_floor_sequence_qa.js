import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GameState} from './src/core/GameState.js';
import {DutyEventManager} from './src/core/DutyEventManager.js';
import {FloorStateManager,GamePhase} from './src/core/FloorStateManager.js';

const state=new GameState();
const duty=new DutyEventManager(state);
const phases=new FloorStateManager(state);

assert.equal(state.getGamePhase(),GamePhase.FIRST_ARRIVAL);
state.setFlag('HOOK_0217',true);
state.markTaskComplete('P1_REST_DONE');
let line=duty.onZoneEntered('first_campus_2f');
assert.equal(line,null,'20:05 story content must wait for the player to answer the duty-room phone');
assert.equal(state.gameTime,'17:00');
assert.equal(state.getFlag('ER_JANE_PRESENT'),false,'Jane Doe must not materialize on 2F entry');

phases.setPhase(GamePhase.ELEVATOR_GLITCH);
assert.equal(state.getGamePhase(),GamePhase.ELEVATOR_GLITCH);

state.setFlag('NIGHT_PATROL_RETURN_3F',true);
phases.setPhase(GamePhase.NIGHT_PATROL);
line=duty.onZoneEntered('first_campus_3f');
assert.equal(state.gameTime,'21:16');
assert.match(line.text,/查哨點/);
state.setFlag('BOOTSTRAP_2117_RESOLVED',true);
state.setGameTime('21:17');
assert.equal(state.setGameTime('20:40'),false,'Narrative clock must reject backward time');
assert.equal(state.gameTime,'21:17');
state.setFlag('POST_2117_DUTY_CALL_DONE',true);
state.setFlag('GHOST_REGISTRATION_ARMED',true);
state.markTaskComplete('P1_ER_ASSESSMENT_DONE');
state.markTaskComplete('P1_ER_NOTE_DONE');
line=duty.onZoneEntered('first_campus_2f');
assert.equal(line,null,'00:33 must wait for the player to answer the emergency phone');
assert.equal(state.gameTime,'21:17');
assert.equal(state.getDisplayTime(),'21:17');
assert.equal(state.getFlag('GHOST_REGISTRATION_AVAILABLE'),false);

const main=readFileSync('./src/main.js','utf8');
const workflow=readFileSync('../.github/workflows/deploy-pages.yml','utf8');
assert(main.includes("callKind==='ER_JANE_2005'")&&main.includes("callKind==='ER_GHOST_0033'"),'20:05 and 00:33 story triggers must be phone-answer branches');
assert(main.includes("callKind==='NIGHT_PATROL_2115'"),'21:15 return mission must be a phone-answer branch');
assert(main.includes("gameState.isTaskComplete('ACT1_NORMAL_FLOW')||gameState.getFlag('NIGHT_PATROL_RETURN_3F')"),'21:15 call must be one-shot');
assert(workflow.includes('Refuse stale queued push')&&workflow.includes("steps.freshness.outputs.current == 'true'"),'Pages workflow must refuse stale queued commits');

console.log('CROSS-FLOOR SEQUENCE QA PASS');
