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
memory.recordOverride('HANDOFF_DEFAULT');
assert.equal(memory.data.knownCodes.pass_1700,true,'M1 Patientization must remember 1700 so the repeat only needs the locker pickup');
memory.recordOverride('BED33');
assert.equal(memory.data.loopCount,2);
assert.equal(memory.data.hasSeenOverride_Bed33,true);
assert.equal(memory.data.survivalRules.neverSignBed33,true);
assert.equal(memory.data.knownCodes.code_0409,true);
assert(memory.data.journalNotes.some(n=>/409A/.test(n.text)));

const reloaded=new PersistentMemory(storage);
assert.equal(reloaded.data.loopCount,2);
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
reloaded.rememberEvidence('M3_ER_PHOTO');
for(const source of ['B2_SOURCE_ADMIN','B2_SOURCE_HISTORY','B2_SOURCE_LEGACY','B2_SOURCE_SECURITY'])reloaded.rememberEvidence(source);
reloaded.applyToGameState(state);
assert.equal(state.getFlag('LOOP_COUNT'),2);
assert.equal(state.getFlag('MEMORY_NEVER_SIGN_BED33'),true);
assert.equal(state.getFlag('B_PANEL_CLUE_KNOWN'),true,'learned B-Panel provenance must survive a later Patientization reset');
assert.equal(state.getFlag('ER_LIU_IDENTITY_REVEALED'),true);
assert.equal(state.getFlag('B2_ADMIN_SOURCE'),true,'admin provenance must survive Patientization');
assert.equal(state.getFlag('B2_HISTORY_SOURCE'),true,'history provenance must survive Patientization');
assert.equal(state.getFlag('B2_LEGACY_SOURCE'),true,'316 legacy provenance must survive Patientization');
assert.equal(state.getFlag('B2_SECURITY_SOURCE'),true,'security provenance must survive Patientization');

// Older localStorage payloads did not store B2 source flags directly. Migration
// must reconstruct them from evidence, archive codes and journal notes.
const legacyBacking=new Map();
legacyBacking.set('DutyNight_PersistentData',JSON.stringify({
  version:5,loopCount:4,
  knownCodes:{code_0217:true,code_0316:true},
  trueNameFragments:{frag_surname:'張'},
  memoryEvidence:{M1_ADMIN_DUTY_PHOTO:true,M1_ARCHIVE_6F_ALBUM:true},
  journalNotes:[
    {id:'ER0033_DECODED',text:'legacy',loop:2},
    {id:'WANG_B_PANEL_KEY',text:'legacy',loop:3}
  ]
}));
const legacyStorage={
  getItem:k=>legacyBacking.get(k)||null,
  setItem:(k,v)=>legacyBacking.set(k,v),
  removeItem:k=>legacyBacking.delete(k)
};
const migrated=new PersistentMemory(legacyStorage);
const migratedState=new GameState();
migrated.applyToGameState(migratedState);
for(const flag of ['B2_ADMIN_SOURCE','B2_HISTORY_SOURCE','B2_LEGACY_SOURCE','B2_SECURITY_SOURCE'])
  assert.equal(migratedState.getFlag(flag),true,'legacy save migration failed for '+flag);

const legend=new LegendStateManager();
assert.equal(legend.getState('LEGEND_BED33'),NodeState.UNSEEN);
legend.registerClue('LEGEND_BED33','KNOCK_408C_49');
assert.equal(legend.getState('LEGEND_BED33'),NodeState.NOTICED);
legend.registerClue('LEGEND_BED33','HIS_409_CLOSED');
assert.equal(legend.getState('LEGEND_BED33'),NodeState.UNDERSTOOD);
legend.resolve('LEGEND_BED33');
assert.equal(legend.getState('LEGEND_BED33'),NodeState.RESOLVED);

console.log('PERSISTENT LOOP ENGINE QA PASS');
