import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PersistentMemory} from './src/core/PersistentMemory.js';

const director=readFileSync('./src/story/FinalSuccessDirector.js','utf8');
const main=readFileSync('./src/main.js','utf8');
const act=readFileSync('./src/story/ActPresentationDirector.js','utf8');
const ui=readFileSync('./src/ui/UIManager.js','utf8');

for(const token of [
  '有人改過值班名冊',
  '劉志遠不是無名氏',
  '周啟文的警告沒有送達',
  'B-Panel 與紫色備援確實存在',
  '被抹去的樓層仍留下影像',
  '所有線索在 02:17 交會',
  '八個名字終於被放回同一張圖',
  '覆寫完成'
]) assert(director.includes(token),'perfect-ending history recap missing: '+token);

assert(director.includes('已覆寫紀錄（完美結束）'),'perfect ending choice text missing');
assert(director.includes('再體驗一次'),'replay choice text missing');
assert(director.includes('RECORD RESTORED'),'record-restored lockup missing');
assert(main.includes("import { FinalSuccessDirector } from './story/FinalSuccessDirector.js';"),'FinalSuccessDirector integration missing');
assert(main.includes("setFlag('FINAL_SUCCESS_RECAP_MANAGED',true)"),'success path must prevent legacy outro overlap');
assert(main.includes('finalSuccessDirector.play'),'correct final authorization must launch the new recap');
assert(main.includes('restartFreshExperience'),'replay route must restart the experience');
assert(main.includes("sessionStorage.removeItem(key)"),'replay must reset three-act session presentation markers');
assert(act.includes("!this.gameState?.getFlag('FINAL_SUCCESS_RECAP_MANAGED')"),'legacy success outro must be gated when the new recap owns the ending');
assert(ui.includes('PERFECT ENDING — RECORD RESTORED'),'final success modal must use perfect-ending copy');

const backing=new Map();
const storage={getItem:k=>backing.get(k)||null,setItem:(k,v)=>backing.set(k,v),removeItem:k=>backing.delete(k)};
const memory=new PersistentMemory(storage);
memory.completeGame();
assert.equal(memory.data.finalDisposition,'escaped');
memory.completePerfectEnding();
assert.equal(memory.data.finalDisposition,'perfect');
assert.equal(memory.data.gameComplete,true);

console.log('PERFECT ENDING RECAP / REPLAY QA PASS');
