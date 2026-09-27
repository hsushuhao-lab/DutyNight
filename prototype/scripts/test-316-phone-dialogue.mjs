import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const start=source.indexOf("}else if(gameState.getFlag('SECOND_CAMPUS_PHONE_PENDING')){");
const end=source.indexOf("}else if(gameState.getFlag('PHONE_RING_ACTIVE')",start);
assert.ok(start>=0&&end>start);
const body=source.slice(source.indexOf('{',start)+1,end);
const timers=[];let dialogue;let unlocked=0;
vm.runInNewContext(body,{
 gameState:{setFlag(){}},soundManager:{playClick(){}},
 uiManager:{showSubtitle(){},showDialogue(lines,onComplete){dialogue={lines,onComplete};}},
 setTimeout(fn){timers.push(fn);},unlockSecondCampusAccess(){unlocked++;}
});
for(const timer of timers)timer();
assert.equal(unlocked,0,'316 phone must not advance the unread thought on a timer');
assert.match(dialogue?.lines[0]?.text||'',/怎麼知道我在 316 辦公室/);
dialogue.onComplete();
assert.equal(unlocked,1,'acknowledging the thought continues the second-campus call once');
console.log('PASS: 316 phone waits for E before continuing the call');
