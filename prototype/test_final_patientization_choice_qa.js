import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PersistentMemory} from './src/core/PersistentMemory.js';

const director=readFileSync('./src/story/FinalPatientizationDirector.js','utf8');
const main=readFileSync('./src/main.js','utf8');

for(const token of [
  '值班名冊被改動',
  '劉志遠帶著工務警告出現',
  '周啟文的警告沒有送達',
  'B-Panel 鑰匙仍在警衛端',
  '現行樓層圖不存在的六樓',
  '所有人最後一次被監控拍到',
  '02:17:00',
  '八個人都沒有離開那一晚',
  '你為什麼又成了病人'
]) assert(director.includes(token),'final historical recap missing: '+token);

assert(director.includes('從此住院（結束遊戲）'),'hospitalized ending choice missing');
assert(director.includes('嘗試逃離（嘗試覆寫紀錄）'),'escape/overwrite choice missing');
assert(director.includes('PATIENT 409-A'),'hospitalized ending card missing');
assert(director.includes('TEMPORARY PATIENT RECORD — WRITE ACCESS'),'escape overwrite animation missing');

assert(main.includes("import { FinalPatientizationDirector } from './story/FinalPatientizationDirector.js';"),'FinalPatientizationDirector import missing');
assert(main.includes('triggerFinalPatientizationFailure'),'final failure branch missing');
assert(main.includes("persistentMemory.recordOverride('FINAL')"),'final Patientization must still record the override');
assert(main.includes("persistentMemory.claimOnce('finalHistoryRecap')"),'full historical recap should be shown once before condensed repeats');
assert(main.includes("setFlag('FINAL_HOSPITALIZED_END',true)"),'hospitalized ending state missing');
assert(main.includes("setFlag('FINAL_ESCAPE_RETRY',true)"),'escape retry state missing');
assert(main.includes("409-A 臨時病歷已暫時改回「身分待核」"),'escape route must reopen the 316 verification window');
assert(!main.includes("loopManager.triggerLegendOverride('FINAL'"),'final failure must no longer immediately soft-reset to 17:00');

const backing=new Map();
const storage={getItem:k=>backing.get(k)||null,setItem:(k,v)=>backing.set(k,v),removeItem:k=>backing.delete(k)};
const memory=new PersistentMemory(storage);
assert.equal(memory.data.finalDisposition,null);
memory.completeHospitalizedEnding();
assert.equal(memory.data.finalDisposition,'hospitalized');
assert.equal(memory.data.gameComplete,false);
memory.beginFinalEscapeAttempt();
assert.equal(memory.data.finalDisposition,'escape_attempt');
memory.completeGame();
assert.equal(memory.data.finalDisposition,'escaped');
assert.equal(memory.data.gameComplete,true);

console.log('FINAL PATIENTIZATION HISTORY / CHOICE QA PASS');
