import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GameState} from './src/core/GameState.js';
import {DutyEventManager,NORMAL_EVENT_POOL} from './src/core/DutyEventManager.js';

const state=new GameState();
const duty=new DutyEventManager(state);

assert.equal(state.gameTime,'17:00');
assert.equal(state.getFlag('SUPERNATURAL_ENABLED'),false);
assert.equal(state.getFlag('STAFF_ACCESS_CARD'),false);
state.markTaskComplete('KEY_PICKUP');
assert.equal(state.getFlag('STAFF_ACCESS_CARD'),true);
for(const id of ['DUTY_LOG','E_HANDOFF']) state.markTaskComplete(id);
state.markTaskComplete('WARD_ENTRY');

duty.complete('P1_4F_REPORT','17:15');
duty.complete('P1_DUTY_ROOM_READY','17:30');
duty.complete('P1_ROUND_COMPLETE','18:00');
duty.complete('P1_INSOMNIA_DONE','18:30');
duty.complete('P1_NORMAL_EVENT_DONE','19:30');
duty.complete('P1_REST_DONE','20:00');
let er=duty.onZoneEntered('first_campus_2f');
assert.match(er.text,/壓力大/);
duty.complete('P1_ER_ASSESSMENT_DONE','20:25');
duty.complete('P1_ER_NOTE_DONE','20:30');
let back=duty.onZoneEntered('first_campus_4f');
assert.match(back.text,/病房都還好/);
duty.complete('ACT1_NORMAL_FLOW','21:00');

assert.equal(state.isTaskComplete('ACT1_NORMAL_FLOW'),true);
assert.equal(state.gameTime,'21:00');
assert.equal(state.getFlag('SUPERNATURAL_ENABLED'),false);
assert.equal(NORMAL_EVENT_POOL.length,6);
const uiSource=readFileSync('./src/ui/UIManager.js','utf8');
for(const token of ['P1_4F_REPORT','P1_DUTY_ROOM_READY','P1_ROUND_COMPLETE','P1_INSOMNIA_DONE','P1_NORMAL_EVENT_DONE','P1_REST_DONE','P1_ER_ASSESSMENT_DONE','P1_ER_NOTE_DONE','P1_RETURN_4F','ACT1_NORMAL_FLOW']) assert.match(uiSource,new RegExp(token));
assert.match(uiSource,/4F 病房值班/);
assert.match(uiSource,/2F 急診會診/);
console.log('P1 normal duty core QA PASS');
