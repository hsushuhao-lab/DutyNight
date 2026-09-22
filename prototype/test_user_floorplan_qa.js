import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {WorldRouter} from './src/world/WorldRouter.js';

const context=new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))});
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>context})};

const bridge=readFileSync('./src/world/zones/FirstCampus8FBridgeEntry.js','utf8');
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),null);

for(const [zoneId,prefix] of [['first_campus_4f','40'],['second_campus_5f','50']]){
  const zone=router.loadZone(zoneId);
  assert.equal(zone.layoutVersion,'USER_PLAN_20260922_IMAGE_V5');
  assert.equal(zone.layoutPlan.dualGate,true);
  assert.equal(zone.layoutPlan.stationGlassDoor,true);
  assert.equal(zone.layoutPlan.entrancePlant,true);
  assert.equal(zone.layoutPlan.bedCapacity,36);
  assert.deepEqual(zone.layoutPlan.storage,['STORE_ENTRY']);
  assert(zone.accessDoors[zoneId.startsWith('first')?'first_ward_inner':'second_ward_inner']);
  const glassDoor=zone.accessDoors[zoneId.startsWith('first')?'first_station_staff':'second_station_staff'];
  assert(glassDoor,'Missing nursing-station glass door');
  assert(glassDoor.leaves.every(leaf=>leaf.material.transparent),'Station staff door must be glass');
  const wardRooms=zone.roomAreas.filter(r=>r.kind==='ward');
  assert.deepEqual(wardRooms.map(r=>r.id),Array.from({length:9},(_,i)=>`${prefix}${i+1}`));
  assert.equal(zone.bedAreas.length,36);
  for(const room of wardRooms)assert.equal(zone.bedAreas.filter(b=>b.roomId===room.id).length,4,`${room.id} must contain four beds`);
  const bed33=zone.bedAreas.find(b=>b.wardBedNumber===33);
  assert(bed33,'Missing ward bed 33');
  assert.equal(bed33.roomId,`${prefix}9`);
  assert.equal(bed33.bedInRoom,1);
  assert(zone.roomAreas.some(r=>r.id==='STORE_ENTRY'&&r.kind==='storage'));
  assert(zone.entrancePlant);
  assert.equal(zone.station.module,'NursingStation_V5_CUSTOM');
  if(zoneId==='second_campus_5f'){
    assert(zone.roomAreas.some(r=>r.id==='SECOND_DUTY'&&r.label==='值班室'));
    assert(zone.accessDoors.second_duty_room?.closed);
    assert(!zone.roomAreas.some(r=>r.id==='DOCTOR'));
  }
}

assert.doesNotMatch(bridge,/asset\(art,'bench'/);
console.log('USER FLOORPLAN V5 PASS: perimeter wards, dual gates, glass station door, entrance storage/plant, second duty room, 36 beds with bed 33');
