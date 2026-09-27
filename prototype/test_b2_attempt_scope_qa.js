import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GameState} from './src/core/GameState.js';
import {PersistentMemory} from './src/core/PersistentMemory.js';

const main=readFileSync('./src/main.js','utf8');
const ui=readFileSync('./src/ui/UIManager.js','utf8');
const memorySource=readFileSync('./src/core/PersistentMemory.js','utf8');

const oldPayload={
  version:4,
  loopCount:2,
  b2IdentityAttemptUsed:true,
  knownCodes:{},
  survivalRules:{},
  proofs:{},
  legends:{},
  trueNameFragments:{},
  journalNotes:[],
  memoryEvidence:{}
};
const backing=new Map([['DutyNight_PersistentData',JSON.stringify(oldPayload)]]);
const storage={
  getItem:key=>backing.get(key)||null,
  setItem:(key,value)=>backing.set(key,value),
  removeItem:key=>backing.delete(key)
};
const memory=new PersistentMemory(storage);
assert.equal(memory.data.version,5,'PersistentMemory must migrate to v5');
assert.equal('b2IdentityAttemptUsed' in memory.data,false,'obsolete persistent B2 attempt lock must be discarded');

const state=new GameState();
assert.equal(state.getFlag('B2_IDENTITY_ATTEMPT_USED'),false,'fresh run must start with an unused B2 identity attempt');
state.setFlag('B2_IDENTITY_ATTEMPT_USED',true);
assert.equal(state.getFlag('B2_IDENTITY_ATTEMPT_USED'),true);
state.resetForLoop();
assert.equal(state.getFlag('B2_IDENTITY_ATTEMPT_USED'),false,'loop reset must restore one fresh B2 attempt');

assert(!main.includes('persistentMemory.data.b2IdentityAttemptUsed'),'B2 attempt lock must not be read from persistent memory');
assert(main.includes("gameState.setFlag('B2_IDENTITY_ATTEMPT_USED',false)"),'opening B2 must explicitly arm the attempt for this run');
assert(main.includes("gameState.setFlag('B2_IDENTITY_ATTEMPT_USED',true)"),'selecting a B2 identity candidate must consume this run attempt');
assert(main.includes("if(gameState.getFlag('B2_IDENTITY_ATTEMPT_USED'))"),'B2 terminal must guard against a second attempt in the same run');
assert(ui.includes("this.gameState.getFlag('B2_IDENTITY_ATTEMPT_USED')?'唯一一次身分建立嘗試已用盡"),'B2 task board must use transient state');
assert(memorySource.includes('delete data.b2IdentityAttemptUsed'),'legacy localStorage lock migration missing');

console.log('B2 ATTEMPT SESSION-SCOPE QA PASS');
