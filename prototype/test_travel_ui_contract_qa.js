import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
const ui=readFileSync(new URL('./src/ui/UIManager.js',import.meta.url),'utf8');
for(const cls of ['floor-arrow','floor-digit']){
 assert(new RegExp('class="[^"]*\\b'+cls+'\\b[^"]*"').test(html),`Travel UI missing .${cls}`);
 assert(ui.includes(`querySelector('.${cls}')`));
}
assert(html.includes('401–409'));
assert(html.includes('位於電梯旁、病房大門外側'));
assert(!html.includes('位於護理站右側走廊'));
console.log('TRAVEL UI CONTRACT PASS: direction and floor elements exist; HIS location follows approved plan');
