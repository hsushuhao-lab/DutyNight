import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {getCorePersonnelProfiles} from './src/story/CharacterBible.js';

const act=readFileSync('./src/story/ActPresentationDirector.js','utf8');
const memory=readFileSync('./src/story/MemoryInstallations.js','utf8');
const ui=readFileSync('./src/ui/UIManager.js','utf8');
const floor3=readFileSync('./src/world/zones/FirstCampus3F.js','utf8');
const ward=readFileSync('./src/world/shared/WardFloorplan.js','utf8');
const assets=readFileSync('./src/art/ArtPass2Assets.js','utf8');

const artFiles=[
  './public/assets/artpass2/opening-night-campus.webp',
  './public/assets/artpass2/archive-gallery.webp',
  './public/assets/artpass2/memory-fragments.webp'
];
let total=0;
for(const file of artFiles){
  const bytes=statSync(file).size;
  assert(bytes>8000,file+' must contain a real refined image asset');
  assert(bytes<150000,file+' must stay lightweight for browser loading');
  total+=bytes;
}
assert(total<350000,'Art Pass 2 narrative image payload must remain <350 KB; got '+total);

assert(act.includes("ART_PASS2.opening")&&act.includes("preloadArtPass2Image('opening')"),'Act I must use the refined opening artwork');
assert(act.includes('act-art-backdrop')&&act.includes('act-kenburns'),'opening art must have cinematic framing/motion');

assert(memory.includes('drawMemoryFragment')&&memory.includes("preloadArtPass2Image('memoryFragments')"),'world memory photos must use refined archival crops');
assert(ui.includes('drawMemoryFragment'),'full memory viewer must use refined archival imagery');
assert(ui.includes("page.kind==='personnel'")&&ui.includes('personnel-dossier-card'),'seven-person archive must render polished dossier pages');

assert(floor3.includes('buildArchiveGalleryTexture'),'3F archive must use the refined historical photo wall');
assert(floor3.includes("title:'1998 夜班核心人員名錄'"),'canonical seven-person archive title missing');
assert(floor3.includes("kind:'personnel'"),'personnel pages must remain structured canon data');
assert.equal(getCorePersonnelProfiles().length,7,'archive personnel dossier must remain exactly seven people');

assert(ward.includes("Second5F_DutyPhoto_")&&ward.includes('drawMemoryFragment'),'second-campus duty-room photos must use refined archival art');
assert(ward.includes("'1998 夜班合照'")&&ward.includes("'臨床教學留影'"),'in-world historical photo identities must remain stable');

for(const source of [act,memory,ui,floor3,ward,assets]){
  assert(!source.includes('仁安醫院'),'generated non-canonical hospital text must never become runtime canon');
  assert(!source.includes('4+3'),'runtime Art Pass 2 files must not reintroduce 4+3 wording');
}

for(const [name,id] of [
  ['張守恆','MED-870409'],
  ['李承禮','MED-820316'],
  ['周啟文','MED-880217'],
  ['陳柏勳','MED-890605'],
  ['林婉真','NUR-900033'],
  ['王世榮','SEC-760117'],
  ['謝玉琴','ADM-851104']
]){
  const p=getCorePersonnelProfiles().find(item=>item.name===name);
  assert(p,'missing canonical archive person '+name);
  assert.equal(p.employeeId,id,name+' employee ID drifted');
}

console.log('ART PASS 2 OPENING / MEMORY / ARCHIVE QA PASS');
