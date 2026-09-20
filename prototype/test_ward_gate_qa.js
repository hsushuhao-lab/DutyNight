import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';

global.document={querySelector:()=>null,createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})})})};
const controller={enabled:true,teleport(){},updateCameraRotation(){}};
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),controller);
let zone=router.loadZone('first_campus_4f');
const aperture=new THREE.Box3(new THREE.Vector3(13.7,.15,-.35),new THREE.Vector3(14.3,1.95,.35));

assert.equal(zone.wardGateClosed,true,'4F ward gate must initially be closed');
assert(zone.colliders.some(box=>box.intersectsBox(aperture)),'Closed 4F gate must block the aperture');
assert.equal(zone.wardGatePivot.rotation.y,-Math.PI/2,'Visible 4F metal gate must be closed at baseline');
for(const id of ['WARD_GATE_ACCESS','WARD_GATE_ACCESS_INSIDE']){
  const reader=zone.interactables.find(object=>object.userData.id===id);
  assert(reader,`Missing reader ${id}`);
  assert.equal(reader.userData.label,'刷卡開啟4F病房門');
}

const closedCount=zone.colliders.length;
zone.setWardGateClosed(false);
assert.equal(zone.wardGateClosed,false);
assert.equal(zone.colliders.length,closedCount-1);
assert.equal(zone.colliders.some(box=>box.intersectsBox(aperture)),false,'Open 4F gate must clear passage');
assert.equal(zone.wardGatePivot.rotation.y,0);

assert.equal(zone.toggleWardGate(new THREE.Vector3(14,1.7,0)),false,'Must refuse to close into player');
assert.equal(zone.toggleWardGate(new THREE.Vector3(12.7,1.7,0)),true,'Reader outside gate must close it');
assert.equal(zone.wardGateClosed,true);
assert(zone.colliders.some(box=>box.intersectsBox(aperture)));

router.loadZone('first_campus_3f');
zone=router.loadZone('first_campus_4f');
assert.equal(zone.wardGateClosed,true,'Closed 4F gate state must survive revisit');
assert.equal(zone.toggleWardGate(new THREE.Vector3(15.3,1.7,0)),true,'Inside reader must permit authorized exit');
assert.equal(zone.wardGateClosed,false);

zone.cleanup();
assert.equal(zone.colliders.length,0);
console.log('WARD GATE PASS: baseline closed, card access, occupancy guard, two readers, persistence, cleanup');
