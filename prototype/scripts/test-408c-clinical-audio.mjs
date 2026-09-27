import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const between=(start,end)=>{
  const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
  assert(a>=0&&b>a,'production handler boundaries must exist');
  return source.slice(a+start.length,b);
};
const assessment=between("} else if(action==='NORMAL_EVENT'){","} else if(action==='ER_ASSESS'){");
const seal=between("} else if (interactable.type === 'bed33_409_sealed') {","} else if (interactable.type === 'bed33_assignment') {");
const flags=new Map(),tasks=new Set(['P1_4F_REPORT']);
const knocks=[],timers=[];let lines;
const context={
  gameState:{isTaskComplete:id=>tasks.has(id),getFlag:id=>flags.get(id),setFlag:(id,value)=>flags.set(id,value)},
  dutyEvents:{complete:id=>tasks.add(id)},interactable:{},registerBed33Clue(){},
  worldRouter:{activeZoneInstance:{setDutyDoorClosed(){}}},controller:{},
  soundManager:{playBed33KnockPattern:volume=>knocks.push(volume)},
  uiManager:{showDialogue:value=>{lines=value;},updateTasks(){},openArchiveDocument(){},showSubtitle(){}},
  setTimeout:fn=>timers.push(fn)
};
const run=body=>vm.runInNewContext(`(function(){${body}})()`,context);
run(seal);for(const timer of timers.splice(0))timer();
assert.equal(knocks.length,0,'visiting sealed 409 before assessment must not play the pattern');
run(assessment);for(const timer of timers.splice(0))timer();
assert.equal(knocks.length,0,'clinical assessment must not confirm the reported sound audibly');
assert.equal(lines.length,6);
for(const text of ['人說話','其他人','水管','環境聲音','不能下結論'])assert(lines.some(line=>line.text.includes(text)));
run(seal);for(const timer of timers.splice(0))timer();
assert.deepEqual(knocks,[.13],'only post-assessment sealed 409 produces the audible pattern');
run(seal);for(const timer of timers.splice(0))timer();
assert.equal(knocks.length,1,'repeat inspection must not replay the reveal');
console.log('PASS: 408C assessment stays ambiguous; audible knock follows sealed 409 once');
