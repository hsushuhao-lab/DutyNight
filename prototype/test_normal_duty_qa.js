import assert from 'node:assert/strict';
import {GameClock,NormalDutyRun} from './src/gameplay/NormalDutyCore.js';
import {NORMAL_EVENTS,SECOND_CASE_POOL,F4,ER} from './src/gameplay/normalDutyData.js';
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}
function toFirstCall(seed=0){const r=new NormalDutyRun(seed);r.finishHandoff();r.checkin('regular');for(const id of ['BAG','BED','PHONE'])r.setup(id);for(const w of ['4A','4B','4C','4D'])r.round(w);return r;}
function finishCase(r,zone){r.answer();r.assess(r.activeEvent.ward,'chart_first');r.document(zone);}
function toRest(seed=0){const r=toFirstCall(seed);finishCase(r,F4);finishCase(r,F4);r.dinner();return r;}
const tick=(r,n,paused=false)=>{for(let i=0;i<n*4;i++)r.tick(.25,paused);};

test('20 unique fictional templates; slice pool references real template IDs',()=>{
 assert.equal(NORMAL_EVENTS.length,20);assert.equal(new Set(NORMAL_EVENTS.map(e=>e.id)).size,20);assert(NORMAL_EVENTS.every(e=>e.fictional));assert(SECOND_CASE_POOL.every(id=>NORMAL_EVENTS.some(e=>e.id===id)));
});
test('Clock supports midnight, monotonic advancement and bounded tick',()=>{const c=new GameClock(1439);c.tick(2,2000,1);assert.equal(c.text,'00:01');c.advanceTo(1380);assert.equal(c.minutes,1441);c.advanceTo(1920);assert.equal(c.text,'08:00');});
test('No early check-in, setup, rounds or chapter completion',()=>{const r=new NormalDutyRun();assert(!r.setup('BED'));assert(!r.checkin('regular'));assert(!r.round('4A'));assert(!r.finish());});
test('Handoff and dinner-choice validation are idempotent',()=>{const r=new NormalDutyRun();assert(r.finishHandoff());assert(!r.finishHandoff());assert(!r.checkin('invalid'));assert(r.checkin('vegetarian'));assert.equal(r.choices.meal,'vegetarian');});
test('Room preparation requires all three physical tasks once',()=>{const r=new NormalDutyRun();r.finishHandoff();r.checkin('regular');assert(r.setup('BED'));assert(!r.setup('BED'));r.setup('PHONE');assert.equal(r.stage,'ROOM');r.setup('BAG');assert.equal(r.stage,'ROUNDS');});
test('Four distinct ward rounds required in any order',()=>{const r=new NormalDutyRun();r.finishHandoff();r.checkin('regular');['PHONE','BED','BAG'].forEach(id=>r.setup(id));['4D','4A','4B'].forEach(w=>r.round(w));assert.equal(r.stage,'ROUNDS');assert(!r.round('4A'));r.round('4C');assert.equal(r.stage,'CALL1');assert.equal(r.phone.call.status,'RINGING');});
test('Paused modal/hidden tab advances neither clock nor unanswered-call timeout',()=>{const r=toFirstCall();const before=JSON.stringify(r.snapshot());tick(r,100,true);assert.equal(JSON.stringify(r.snapshot()),before);});
test('20-second missed call persists and supports callback without lost tasks',()=>{const r=toFirstCall();tick(r,21);assert.equal(r.phone.call.status,'MISSED');assert.equal(r.stage,'CALL1');assert(r.answer());assert(!r.answer());assert.equal(r.stage,'ASSESS1');assert.equal(r.phone.call.misses,1);});
test('Explicit defer creates one missed call, duplicate clicks do not multiply it',()=>{const r=toFirstCall();assert(r.miss());assert(!r.miss());assert.equal(r.phone.call.misses,1);assert(r.answer());});
test('Cannot assess wrong ward or document before assessment',()=>{const r=toFirstCall();assert(!r.assess('4A','chart_first'));r.answer();assert(!r.assess('4D','chart_first'));assert(!r.document(F4));assert(r.assess('4A','nurse_first'));assert(!r.assess('4A','chart_first'));assert.equal(r.choices.case1,'nurse_first');});
test('Documentation requires matching location and is not duplicated',()=>{const r=toFirstCall();r.answer();r.assess('4A','chart_first');assert(!r.document(ER));assert(r.document(F4));assert(!r.document(F4));assert.equal(r.stage,'CALL2');assert.equal(r.events.get('case1').status,'COMPLETED');});
test('Seeded secondary event variation is reproducible',()=>{const a=new NormalDutyRun(100),b=new NormalDutyRun(100),c=new NormalDutyRun(101);assert.deepEqual(a.events.events,b.events.events);assert.notEqual(a.events.get('case2').templateId,c.events.get('case2').templateId);});
test('Dinner is required before rest and chapter end',()=>{const r=toFirstCall();assert(!r.dinner());assert(!r.startRest(true));finishCase(r,F4);finishCase(r,F4);assert(!r.finish());assert(r.dinner());assert.equal(r.stage,'REST');});
test('Sleep crosses scheduled ER call exactly once and wakes the doctor',()=>{const r=toRest();assert(r.startRest(true));assert(!r.startRest(true));tick(r,6);assert.equal(r.stage,'ER_CALL');assert(!r.rest.sleeping);assert(r.rest.interrupted);assert.equal(r.rest.state,'SLEEP_INTERRUPTED');assert.equal(r.history.filter(e=>e.type==='phone_ringing'&&e.eventId==='er').length,1);});
test('Staying awake is a genuine alternative, not a fake sleep interruption',()=>{const r=toRest();r.startRest(false);tick(r,6);assert.equal(r.stage,'ER_CALL');assert.equal(r.rest.interrupted,false);assert.equal(r.rest.state,'TIRED');assert.equal(r.choices.rest,'stay_awake');});
test('Waking voluntarily cannot lose the scheduled ER work',()=>{const r=toRest();r.startRest(true);tick(r,1);assert(r.wakeEarly());tick(r,70);assert.equal(r.stage,'ER_CALL');assert(!r.rest.interrupted);});
test('Snapshot round-trip preserves queues, choices, tasks, clock and missed call',()=>{const r=toFirstCall(7);r.miss();const saved=JSON.parse(JSON.stringify(r.snapshot())),x=NormalDutyRun.restore(saved);assert.equal(x.stage,r.stage);assert.equal(x.clock.minutes,r.clock.minutes);assert.deepEqual([...x.tasks.done],[...r.tasks.done]);assert.deepEqual(x.phone.call,r.phone.call);assert.deepEqual(x.events.events,r.events.events);assert(x.answer());});
test('Restored sleep is paused, not an offline time skip or trapped controller state',()=>{const r=toRest();r.startRest(true);const x=NormalDutyRun.restore(JSON.parse(JSON.stringify(r.snapshot())));assert.equal(x.clock.minutes,r.clock.minutes);assert.equal(x.rest.sleeping,false);assert.equal(x.rest.waiting,false);assert(x.startRest(false));});
test('Malformed and incompatible saves rejected',()=>{assert.throws(()=>NormalDutyRun.restore(null));assert.throws(()=>NormalDutyRun.restore({version:0}));const r=toFirstCall();const d=r.snapshot();d.minutes=NaN;assert.throws(()=>NormalDutyRun.restore(d));});
test('Full sleep route ends only after ER documentation and physical-return confirmation',()=>{
 const r=toRest(3);r.startRest(true);tick(r,6);r.answer();assert.equal(r.stage,'ER_ASSESS');assert(!r.finish());r.assess('急診','nurse_first');assert(!r.document(F4));assert(r.document(ER));assert.equal(r.stage,'RETURN');assert(r.finish());assert.equal(r.stage,'COMPLETE');assert.equal(r.clock.text,'21:00');assert(r.events.events.every(e=>e.status==='COMPLETED'));assert(!r.finish());const before=JSON.stringify(r.snapshot());tick(r,3600);assert.equal(JSON.stringify(r.snapshot()),before);
});
console.log(`NORMAL_DUTY_CORE: ${checks}/${checks} checks PASS`);
