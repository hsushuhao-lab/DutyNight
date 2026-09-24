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
assert.equal(state.gameTime,'20:05');
assert.match(line.text,/無名氏/);
assert.match(line.text,/舊.*住院手圈/);

phases.setPhase(GamePhase.ELEVATOR_GLITCH);
assert.equal(state.getGamePhase(),GamePhase.ELEVATOR_GLITCH);

state.setFlag('NIGHT_PATROL_RETURN_3F',true);
phases.setPhase(GamePhase.NIGHT_PATROL);
line=duty.onZoneEntered('first_campus_3f');
assert.equal(state.gameTime,'21:16');
assert.match(line.text,/查哨點/);
state.setFlag('BOOTSTRAP_2117_RESOLVED',true);
state.setFlag('GHOST_REGISTRATION_ARMED',true);
state.markTaskComplete('P1_ER_NOTE_DONE');
line=duty.onZoneEntered('first_campus_2f');
assert.equal(state.gameTime,'00:33');
assert.equal(state.getFlag('GHOST_REGISTRATION_AVAILABLE'),true);
assert.match(line.text,/00:33/);

const main=readFileSync('./src/main.js','utf8');
const workflow=readFileSync('../.github/workflows/deploy-pages.yml','utf8');
assert(main.includes("gameState.isTaskComplete('ACT1_NORMAL_FLOW')||gameState.getFlag('NIGHT_PATROL_RETURN_3F')"),'21:15 call must be one-shot');
assert(workflow.includes('Refuse stale queued push')&&workflow.includes("steps.freshness.outputs.current == 'true'"),'Pages workflow must refuse stale queued commits');

console.log('CROSS-FLOOR SEQUENCE QA PASS');
