import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ward=readFileSync('./src/world/shared/WardFloorplan.js','utf8');
const bridge=readFileSync('./src/world/zones/FirstCampus8FBridgeEntry.js','utf8');

assert.match(ward,/USER_PLAN_20260921_V2/);
for(const room of ['401','402','403','404','405','406','407','408','409']) assert.match(ward,new RegExp(room));
for(const room of ['501','502','503','504','505','506','507','508','509']) assert.match(ward,new RegExp(room));
assert.match(ward,/narrowStationStrip:false/);
assert.match(ward,/unnamedNorthwestBlock:true/);
assert.match(ward,/second_station_staff/);
assert.match(ward,/ACTIVITY_HALL/);
assert.doesNotMatch(bridge,/asset\(art,'bench'/);

console.log('User floorplan / 8F clearance QA PASS');
