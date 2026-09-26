import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync('./src/main.js','utf8');
const ui=readFileSync('./src/ui/UIManager.js','utf8');
const state=readFileSync('./src/core/GameState.js','utf8');

assert(main.includes("setFlag('SECOND_CAMPUS_PHONE_PENDING',true)"));
assert(main.includes("setFlag('SECOND_CAMPUS_OBJECTIVE_ACTIVE',true)"));
assert(main.includes("setFlag('SECOND_CAMPUS_ACCESS',true)"));
assert(main.includes("setFlag('BRIDGE_ACCESS',true)"));
assert(main.includes('uiManager.updateTasks()'));
assert(ui.includes("getFlag('SECOND_CAMPUS_OBJECTIVE_ACTIVE')"));
assert(ui.includes('01:15 前往第二院區 5F 護理站報到'));
assert(state.includes("flags.set('SECOND_CAMPUS_OBJECTIVE_ACTIVE', false)"));
console.log('M3 TO M4 OBJECTIVE PASS');
