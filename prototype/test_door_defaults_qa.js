import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ward=readFileSync('./src/world/shared/WardFloorplan.js','utf8');
const access=readFileSync('./src/world/shared/AccessDoor.js','utf8');
const keyed=readFileSync('./src/world/shared/KeyedKnobDoor.js','utf8');
const router=readFileSync('./src/world/WorldRouter.js','utf8');
const main=readFileSync('./src/main.js','utf8');

assert.match(ward,/narrowStationStrip:false/);
assert.doesNotMatch(ward,/^\s*walls\.line\('x',-6,3\.8,12\);/m);
assert.match(ward,/new KeyedKnobDoor\(this,\{id:'duty_room'/);
assert.match(ward,/dutyDoor\.setClosed\(true\);this\.dutyDoorClosed=true/);
assert.doesNotMatch(ward,/doctor_office[\s\S]{0,180}readers:false/);
assert.match(access,/this\.closed=false; this\.setClosed\(true\)/);
assert.match(keyed,/type:'duty_door'/);
assert.match(keyed,/鑰匙開門/);
assert.match(router,/this\.dutyDoorClosed = true/);
assert.match(main,/值班室是鑰匙喇叭鎖/);
assert.match(main,/KEY_PICKUP/);
console.log('Door defaults QA PASS: no nursing side strip, all controlled doors closed, duty room uses keyed knob door');

