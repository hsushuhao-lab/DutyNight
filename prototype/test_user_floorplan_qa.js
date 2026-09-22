import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ward=readFileSync('./src/world/shared/WardFloorplan.js','utf8');
const bridge=readFileSync('./src/world/zones/FirstCampus8FBridgeEntry.js','utf8');

assert.match(ward,/USER_PLAN_20260922_IMAGE_V4/);

for(const room of ['401','402','403','404','405','406','407','408','409'])
  assert.match(ward,new RegExp(room));

for(const room of ['501','502','503','504','505','506','507','508','509'])
  assert.match(ward,new RegExp(room));

assert.match(ward,/STORE_NW/);
assert.match(ward,/STORE_NE/);
assert.match(ward,/centralStation:true/);
assert.match(ward,/narrowStationStrip:false/);

assert.match(
  ward,
  /id:'first_station'/
);

assert.match(
  ward,
  /id:'second_station'/
);

assert.match(
  ward,
  /rearEntry:true/
);

assert.doesNotMatch(
  bridge,
  /asset\(art,'bench'/
);

console.log(
  'USER FLOORPLAN V4 PASS: perimeter wards + twin storage rooms + central nursing stations + clear 8F bridge'
);
