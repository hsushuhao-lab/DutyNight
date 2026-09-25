import assert from 'node:assert/strict';
import {GameState} from './src/core/GameState.js';
import {PersistentMemory} from './src/core/PersistentMemory.js';
import {LegendStateManager,NodeState} from './src/core/LegendStateManager.js';

const backing=new Map();
const storage={
  getItem:k=>backing.get(k)||null,
  setItem:(k,v)=>backing.set(k,v),
  removeItem:k=>backing.delete(k)
};

const memory=new PersistentMemory(storage);
assert.equal(memory.data.loopCount,0);
assert(memory.learnCode('pass_1700'));
assert(memory.learnCode('pass_3082'));
memory.recordOverride('BED33');
assert.equal(memory.data.loopCount,1);
assert.equal(memory.data.hasSeenOverride_Bed33,true);
assert.equal(memory.data.survivalRules.neverSignBed33,true);
assert.equal(memory.data.knownCodes.code_0409,true);
assert(memory.data.journalNotes.some(n=>/409A/.test(n.text)));

const reloaded=new PersistentMemory(storage);
assert.equal(reloaded.data.loopCount,1);
assert.equal(reloaded.data.knownCodes.pass_1700,true);
assert.equal(reloaded.data.knownCodes.pass_3082,true);
assert.equal(reloaded.claimOnce('hotCoffee'),true);
assert.equal(new PersistentMemory(storage).claimOnce('hotCoffee'),false);

const state=new GameState();
let resets=0;state.addListener(evt=>{if(evt==='loop_reset')resets++;});
state.setFlag('TEMP_TEST',true);state.markTaskComplete('TEMP_TASK');
state.resetForLoop();
assert.equal(resets,1);
assert.equal(state.getFlag('TEMP_TEST'),false);
assert.equal(state.isTaskComplete('TEMP_TASK'),false);
reloaded.applyToGameState(state);
assert.equal(state.getFlag('LOOP_COUNT'),1);
assert.equal(state.getFlag('MEMORY_NEVER_SIGN_BED33'),true);

const legend=new LegendStateManager();
assert.equal(legend.getState('LEGEND_BED33'),NodeState.UNSEEN);
legend.registerClue('LEGEND_BED33','KNOCK_408C_49');
assert.equal(legend.getState('LEGEND_BED33'),NodeState.NOTICED);
legend.registerClue('LEGEND_BED33','HIS_409_CLOSED');
assert.equal(legend.getState('LEGEND_BED33'),NodeState.UNDERSTOOD);
legend.resolve('LEGEND_BED33');
assert.equal(legend.getState('LEGEND_BED33'),NodeState.RESOLVED);

console.log('PERSISTENT LOOP ENGINE QA PASS');
