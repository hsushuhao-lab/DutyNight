import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync('./src/main.js','utf8');
const ui=readFileSync('./src/ui/UIManager.js','utf8');
const gameState=readFileSync('./src/core/GameState.js','utf8');
const director=readFileSync('./src/story/B2FireRecapDirector.js','utf8');

for(const token of [
  '警衛台後方的 B-Panel',
  '錯誤程序被執行',
  '劉志遠試圖恢復排煙',
  '八個人被困在不同位置',
  '院內紀錄開始失真',
  'UNKNOWN SESSION / OVERWRITE ACTIVE'
]) assert(director.includes(token),'B2 fire recap missing beat: '+token);

assert(main.includes("import { B2FireRecapDirector } from './story/B2FireRecapDirector.js';"),'B2 fire recap director integration missing');
assert(main.includes("if(!gameState.getFlag('B2_FIRE_RECAP_SEEN'))"),'first B2 terminal contact must route into the recap');
assert(main.includes('playB2FireRecap()'),'B2 terminal must launch fire recap');
assert(main.includes("gameState.setFlag('B2_TERMINAL_CONTACTED',true)"),'B2 terminal contact flag missing');
assert(main.includes("gameState.setFlag('B2_FIRE_RECAP_SEEN',true)"),'B2 recap completion flag missing');
assert(main.includes("gameState.setFlag('RECORD_OVERWRITE_ACTIVE',true)"),'B2 recap must activate overwrite pressure');
assert(main.includes("gameState.setFlag('M8_IDENTITY_BATTLE_ACTIVE',true)"),'B2 recap must unlock final 316 identity battle');
assert(main.includes("先啟動 B2 封存終端"),'B2 one-way exit must remain blocked before terminal recap');
assert(main.includes("gameState.getFlag('B2_FIRE_RECAP_SEEN') ||"),'correct 316 authorization must accept the B2 fire recap as the route gate');
assert(!main.includes('身分檔案尚未完成來源核對。先去三樓文史資料室查閱夜班核心人員檔案。'),'history-room detour must no longer hard-block final 316 after B2');
assert(ui.includes('啟動封存驗證終端，讀取當年火災與人員封存紀錄'),'B2 task board must explicitly request the fire recap');
assert(ui.includes('立即返回 316，輸入正確權限阻止事故與身分紀錄被再次覆蓋'),'post-B2 task board must converge on final 316');
assert(gameState.includes("this.flags.set('B2_TERMINAL_CONTACTED', false)"),'fresh loop must clear B2 terminal contact');
assert(gameState.includes("this.flags.set('B2_FIRE_RECAP_SEEN', false)"),'fresh loop must clear B2 fire recap state');
assert(gameState.includes("this.flags.set('RECORD_OVERWRITE_ACTIVE', false)"),'fresh loop must clear overwrite state');

console.log('B2 FIRE RECAP / FINAL 316 GATE QA PASS');
