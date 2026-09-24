import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';

const context=new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))});
global.document={
  querySelector:()=>null,
  addEventListener(){},
  createElement:(tag)=>tag==='canvas'?{width:0,height:0,getContext:()=>context}:{getContext:()=>context}
};

const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),null);
const zone=router.loadZone('first_campus_4f');

assert.equal(zone.layoutPlan?.bed33Id,'409A');
const bed33=zone.bedAreas.find(b=>b.id==='409A');
assert(bed33,'409A bed missing');
assert.equal(bed33.wardBedNumber,33);
assert.equal(zone.bed33Legend?.id,'LEGEND_BED33');
assert.equal(zone.bed33Legend?.bedId,'409A');
assert.equal(zone.bed33Legend?.checkpoint,'CP_EXIT_403');

for(const type of ['bed33_board','bed33_his_status','bed33_409_sealed','bed33_assignment']){
  assert(zone.interactables.some(o=>o.userData?.type===type),`${type} missing`);
}
assert(zone.keyedDoors['room_409']?.closed,'409 patient-room door must remain closed at Gold Slice start');
assert(zone.zoneGroup.getObjectByName('Bed33_WardBoard'),'Bed33 ward board visual missing');
assert(zone.zoneGroup.getObjectByName('Bed33_AssignmentForm'),'Bed33 assignment form visual missing');
assert(zone.zoneGroup.getObjectByName('Bed33_409_WarningTape'),'409 warning tape missing');

console.log('BED33 GOLD SLICE GEOMETRY QA PASS');
