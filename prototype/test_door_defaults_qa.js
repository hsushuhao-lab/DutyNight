import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ward=readFileSync('./src/world/shared/WardFloorplan.js','utf8');
const access=readFileSync('./src/world/shared/AccessDoor.js','utf8');
const main=readFileSync('./src/main.js','utf8');

assert.match(ward,/Protected station sits directly against the ward hall/);
assert.match(ward,/dutyDoor\.setClosed\(true\);this\.dutyDoorClosed=true/);
assert.match(ward,/doctor_office[\s\S]*setClosed\(true\)/);
assert.match(access,/this\.closed=false; this\.setClosed\(true\)/);
assert.match(access,/鑰匙開門/);
assert.match(main,/值班室是鑰匙喇叭鎖/);
assert.match(main,/KEY_PICKUP/);
console.log('Door defaults and 4F floorplan QA PASS');
