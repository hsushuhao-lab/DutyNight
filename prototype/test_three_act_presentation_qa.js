import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const director=readFileSync('./src/story/ActPresentationDirector.js','utf8');
const main=readFileSync('./src/main.js','utf8');

assert(director.includes("ACT II · 21:17 之後"),'Act II title card missing');
assert(director.includes("ACT III · 最後交班"),'Act III title card missing');
assert(director.includes("青嶺醫療中心 · 夜班"),'opening hospital orientation missing');
assert(director.includes("其實就是一個普通夜班"),'Act I light-duty tone missing');
assert(director.includes("去 316 完成交班"),'opening must hand control into 316 objective');
assert(director.includes("8F 天橋"),'opening campus orientation must mention 8F bridge without making it an active objective');
assert(director.includes("BOOTSTRAP_2117_RESOLVED"),'Act II must key off the existing 21:17 story state');
assert(director.includes("M8_IDENTITY_BATTLE_ACTIVE")&&director.includes("M8_CODE_BLACK_ANNOUNCED"),'Act III must key off existing finale state');
assert(director.includes("GAME_COMPLETE"),'success outro must key off the existing game-complete state');
assert(director.includes("張守恆　MED-870409"),'success credits must retain canonical identity');
assert(director.includes("同樣的值班，不同的自己。"),'closing lockup missing');
assert(director.includes("409-A PATIENTIZATION ORDER — INVALIDATED"),'success credits must resolve the patientization order');
assert(!director.includes("gameState.setFlag("),'presentation layer must not mutate story flags');
assert(!director.includes("persistentMemory.completeGame"),'presentation layer must not own ending state');

assert(main.includes("import { ActPresentationDirector } from './story/ActPresentationDirector.js';"),'main integration import missing');
assert(main.includes("const actPresentationDirector=new ActPresentationDirector"),'presentation director instantiation missing');
assert(main.includes("actPresentationDirector.update();"),'animation-loop watcher missing');

console.log('THREE-ACT PRESENTATION QA PASS');
