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

assert.equal(zone.layoutPlan?.bedCapacity,32,'official census must be 32 beds');
assert.equal(zone.bedAreas.length,32,'only 32 physical census beds may be generated');
assert.deepEqual(zone.bedAreas.filter(b=>b.roomId==='408').map(b=>[b.id,b.wardBedNumber]),[
  ['408A',29],['408B',30],['408C',31],['408D',32]
]);
assert.equal(zone.bedAreas.filter(b=>b.roomId==='409'&&!b.anomalous).length,0,'sealed 409 must be outside the ordinary census');

assert.equal(zone.layoutPlan?.bed33Id,'409A');
assert(!zone.bedAreas.some(b=>b.id==='409A'),'409A is an anomalous clue, not a physical bed');
assert.equal(zone.bed33Legend?.id,'LEGEND_BED33');
assert.equal(zone.bed33Legend?.bedId,'409A');
assert.equal(zone.bed33Legend?.checkpoint,'CP_EXIT_403');

for(const type of ['bed33_board','bed33_his_status','bed33_409_sealed','bed33_assignment']){
  assert(zone.interactables.some(o=>o.userData?.type===type),`${type} missing`);
}
assert(zone.keyedDoors['room_409']?.closed,'409 sealed-room door must remain closed at Gold Slice start');
assert(zone.zoneGroup.getObjectByName('Bed33_WardBoard'),'Bed33 ward board visual missing');
assert(zone.zoneGroup.getObjectByName('Bed33_AssignmentForm'),'Bed33 assignment form visual missing');
assert(zone.zoneGroup.getObjectByName('Bed33_409_WarningTape'),'409 warning tape missing');
assert.equal(zone.zoneGroup.children.filter(o=>o.name==='Bed33_409_WarningTape').length,3,'409 needs three tape bands');
assert(zone.zoneGroup.getObjectByName('Bed33_409_ColdPeepholeLight'),'409 needs restrained cold peephole light');
assert(!zone.zoneGroup.getObjectByName('ClockFace'),'4F duty room must not show the wall clock');

console.log('BED33 GOLD SLICE GEOMETRY QA PASS');
