import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {WorldRouter} from './src/world/WorldRouter.js';

const context=new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))});
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>context})};

const bridge=readFileSync('./src/world/zones/FirstCampus8FBridgeEntry.js','utf8');
const main=readFileSync('./src/main.js','utf8');
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),null);

for(const [zoneId,prefix] of [['first_campus_4f','40'],['second_campus_5f','50']]){
  const zone=router.loadZone(zoneId);
  assert.equal(zone.layoutVersion,'USER_PLAN_20260923_IMAGE_V5_2');
  assert.equal(zone.layoutPlan.dualGate,true);
  assert.equal(zone.layoutPlan.nursingStationFourSideGlass,true);
  assert.equal(zone.layoutPlan.nursingStationLowerWallUpperGlass,true);
  assert.equal(zone.layoutPlan.patientRoomDoorType,'traditional_knob');
  assert.equal(zone.layoutPlan.bedPlaquesWallMounted,true);
  assert.equal(zone.layoutPlan.glassBypassDoor,true);
  assert.equal(zone.layoutPlan.stationWardDoor,true);
  assert.equal(zone.layoutPlan.stationWardDoorFaces,prefix+'6');
  assert.equal(zone.layoutPlan.entrancePlant,true);
  assert.equal(zone.layoutPlan.bedCapacity,36);
  assert.deepEqual(zone.layoutPlan.bedLabels,['A','B','C','D']);
  assert.deepEqual(zone.layoutPlan.storage,['STORE_ENTRY']);
  assert.equal(zone.layoutPlan.allControlledDoorsDefaultClosed,true);

  const tag=zoneId.startsWith('first')?'first':'second';
  assert(zone.accessDoors[tag+'_ward']?.closed);
  assert(zone.accessDoors[tag+'_ward_inner']?.closed);
  const bypass=zone.accessDoors[tag+'_ward_glass'];
  assert(bypass?.closed);
  assert(bypass.leaves.every(leaf=>leaf.material.transparent),'Bypass door must be glass');

  const stationWard=zone.accessDoors[tag+'_station_ward'];
  assert(stationWard?.closed,'Missing station-to-ward door');
  assert.equal(zone.station.facesRoom,prefix+'6');
  assert.equal(zone.station.module,'NursingStation_V5_2_GLASS_BOX');
  assert.deepEqual(zone.station.entryDoor,[zone.planOrigin,0]);

  const wardRooms=zone.roomAreas.filter(r=>r.kind==='ward');
  assert.deepEqual(wardRooms.map(r=>r.id),Array.from({length:9},(_,i)=>`${prefix}${i+1}`));
  for(const room of wardRooms){
    assert(room.accessDoorId,'Ward room missing knob door');
    assert.equal(room.doorType,'knob');
    assert(zone.keyedDoors[room.accessDoorId]?.closed,room.id+' knob door must default closed');
    const beds=zone.bedAreas.filter(b=>b.roomId===room.id);
    assert.equal(beds.length,4,room.id+' must contain four beds');
    assert.deepEqual(beds.map(b=>b.bedInRoom),['A','B','C','D']);
    assert.deepEqual(beds.map(b=>b.id),['A','B','C','D'].map(letter=>room.id+letter));
    for(const bed of beds){
      assert(['north','south','west','east'].includes(bed.plaque.wall));
      const [x1,z1,x2,z2]=room.rect;
      const onWall=Math.min(Math.abs(bed.plaque.x-x1),Math.abs(bed.plaque.x-x2),Math.abs(bed.plaque.z-z1),Math.abs(bed.plaque.z-z2))<.2;
      assert(onWall,bed.id+' plaque must be wall-mounted');
    }
  }
  assert.equal(zone.bedAreas.length,36);
  const bed33=zone.bedAreas.find(b=>b.wardBedNumber===33);
  assert.equal(bed33.id,prefix+'9A');
  assert.equal(bed33.bedInRoom,'A');

  const storage=zone.roomAreas.find(r=>r.id==='STORE_ENTRY');
  assert(storage?.accessDoorId);
  assert(zone.accessDoors[storage.accessDoorId]?.closed);
  assert(zone.entrancePlant);

  if(zoneId==='second_campus_5f'){
    assert(zone.roomAreas.some(r=>r.id==='SECOND_DUTY'&&r.label==='值班室'));
    assert(zone.accessDoors.second_duty_room?.closed);
    assert(!zone.roomAreas.some(r=>r.id==='DOCTOR'));
  }
}
assert.match(main,/STAFF_ACCESS_CARD/);
assert.doesNotMatch(bridge,/asset\(art,'bench'/);
console.log('USER FLOORPLAN V5.2 PASS: station route + glass bypass + x06 station door + credentialed room doors + A-D beds');
