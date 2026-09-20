import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';

global.document={querySelector:()=>null,createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})})})};
const controller={enabled:true,teleport(){},updateCameraRotation(){}};
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),controller);
let zone=router.loadZone('first_campus_2f');
const aperture=new THREE.Box3(new THREE.Vector3(-.35,.15,-.35),new THREE.Vector3(.35,1.95,.35));

assert.equal(zone.acuteGateClosed,true,'2F emergency ward gate must initially be closed');
assert(zone.colliders.some(box=>box.intersectsBox(aperture)),'Closed 2F iron gate must block passage');
assert.equal(zone.acuteGatePivot.rotation.y,0,'2F gate visual must be closed at baseline');
for(const id of ['2F_ACUTE_GATE','2F_ACUTE_GATE_INSIDE']){
  const reader=zone.interactables.find(object=>object.userData.id===id);
  assert(reader,`Missing 2F reader ${id}`);
  assert.equal(reader.userData.type,'acute_gate');
  assert.equal(reader.userData.label,'刷卡開啟 2F 急診門禁');
}

const closedCount=zone.colliders.length;
assert.equal(zone.toggleAcuteGate(new THREE.Vector3(-1.0,1.7,0)),true,'Card access must open 2F gate');
assert.equal(zone.acuteGateClosed,false);
assert.equal(zone.colliders.length,closedCount-1);
assert.equal(zone.colliders.some(box=>box.intersectsBox(aperture)),false,'Open 2F gate must clear passage');

assert.equal(zone.toggleAcuteGate(new THREE.Vector3(0,1.7,0)),false,'Must refuse to close gate onto player');
assert.equal(zone.toggleAcuteGate(new THREE.Vector3(1.0,1.7,0)),true,'Inside staff position can close gate');
assert.equal(zone.acuteGateClosed,true);

router.loadZone('first_campus_3f');
zone=router.loadZone('first_campus_2f');
assert.equal(zone.acuteGateClosed,true,'2F gate state must survive revisit');
zone.cleanup();
assert.equal(zone.colliders.length,0);
console.log('2F ACUTE GATE PASS: baseline closed, two readers, authorized open/close, occupancy guard, persistence');
