import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {ANNIE_STATES, updateAnnieArt} from './src/art/AnnieArt.js';

const context=new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))});
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({width:0,height:0,getContext:()=>context})};
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),null);
function assertAnnie(group,state){
  assert(group,`${state} mannequin must exist`);
  assert.equal(group.userData.characterId,'ANNIE_CPR_TRAINING_MANNEQUIN');
  assert.equal(group.userData.state,state);
  assert(group.getObjectByName('Annie_Head'),'shared mannequin head missing');
  assert(group.getObjectByName('Annie_Torso'),'shared mannequin torso missing');
  assert(!group.getObjectByName('Annie_Stethoscope'),'stethoscope must remain off Annie');
  assert(!group.getObjectByName('Annie_MouthAirway'),'Annie must have no mouth or airway feature');
  assert(group.getObjectByName('Annie_MoldedNose'),'nose is Annie’s only facial feature');
  assert(group.getObjectByName('Annie_SmoothVinylFace'),'face must read as molded vinyl');
  assert(group.getObjectByName('Annie_WhiteCoat'),'yellowed white coat missing');
  assert(group.getObjectByName('Annie_Scrubs'),'gray-green scrub layer missing');
  assert(group.getObjectByName('Annie_WorkShoe_-1'),'rounded work shoes missing');
  assert(group.getObjectByName('Annie_NeckMoldSeam'),'neck mold seam missing');
  assert(group.getObjectByName('Annie_WristMoldSeam_-1'),'wrist mold seam missing');
  const names=[];group.traverse(object=>names.push(object.name));
  assert(!names.some(name=>/^Annie_(FixedEye|UnfocusedIris|FixedPupil|Mouth|BlowTrainingMouth|CoatPocket|CoatButton|CompressionPlate)/.test(name)),'face must be nose-only and chest must have no attached items');
  assert(!Object.hasOwn(group.userData,'inscription'),'the mannequin does not own the stethoscope clue');
  assert.equal(group.userData.modelHeight,1.65,'standing reference height remains 165 cm');
  let meshCount=0;
  group.traverse(object=>{
    if(!object.isMesh)return;
    meshCount++;
    assert.notEqual(object.geometry.type,'BoxGeometry',`${object.name} must use rounded mannequin geometry`);
  });
  assert(meshCount>45,'Annie should use smoothly segmented body and clothing geometry');
}

const threeF=router.loadZone('first_campus_3f');
const storage=threeF.levelInstance.anneGroup;
assertAnnie(storage,ANNIE_STATES.STORAGE_STATIC);
assert(storage.getObjectByName('Annie_Stool'),'M1 Annie must sit on the storage stool');
const storageStethoscope=threeF.levelInstance.anneStethoscopeProp;
assert(storageStethoscope?.getObjectByName('Zhang_Stethoscope_1997_Inscription'),'engraved stethoscope remains a separate nearby prop');
assert.equal(storageStethoscope.userData.inscription,'祝 守恆 醫師 1997 執業誌慶');
const storageElapsed=storage.userData.rig.elapsed;
updateAnnieArt(storage,1);
assert.equal(storage.userData.rig.elapsed,storageElapsed,'M1 storage mannequin remains completely static');
assertAnnie(router.loadZone('first_campus_4f').zoneGroup.getObjectByName('Annie_STORAGE_STATIC'),ANNIE_STATES.STORAGE_STATIC);

const bridge=router.loadZone('skybridge').bridgeDoppelganger;
assertAnnie(bridge,ANNIE_STATES.BRIDGE_MANIFEST);
updateAnnieArt(bridge,.5);
assert.equal(bridge.userData.pose,ANNIE_STATES.BRIDGE_MANIFEST);
assert.notEqual(bridge.userData.rig.head.rotation.z,0,'bridge idle keeps a tiny mechanical settling motion');
assert(bridge.getObjectByName('Annie_OverlappedHands'),'bridge pose must hold both hands together');
bridge.updateMatrixWorld(true);
assert(bridge.getObjectByName('Annie_HandStack_Top').getWorldPosition(new THREE.Vector3()).y>1.05,'bridge hands remain lifted and extended');

const cpr=router.loadZone('phantom_6f').zoneGroup.getObjectByName('Annie_FLOOR6_CPR');
assertAnnie(cpr,ANNIE_STATES.FLOOR6_CPR);
updateAnnieArt(cpr,0);
assert(cpr.getObjectByName('Annie_OverlappedHands'),'CPR uses overlapped hands');
assert(cpr.getObjectByName('Annie_Local_CoolWhite_Practical')?.castShadow,'Annie needs local cool-white shadowed light');
cpr.updateMatrixWorld(true);
const cprHands=cpr.getObjectByName('Annie_HandStack_Top').getWorldPosition(new THREE.Vector3());
const patient=router.loadZone('phantom_6f').zoneGroup.getObjectByName('Annie_Patient_CPR_Target');
patient.updateWorldMatrix(true,false);
const patientCenter=patient.getWorldPosition(new THREE.Vector3());
assert(cprHands.distanceTo(patientCenter)<0.35,'overlapped CPR hands must reach the burned patient contact point');
const patientTop=patientCenter.y+patient.geometry.parameters.radius*patient.scale.y;
assert(Math.abs(cprHands.x-patientCenter.x)<0.1,'CPR hands must be centered over the patient chest');
assert(Math.abs(cprHands.y-patientTop)<0.06,'CPR hands must touch the patient chest surface');
updateAnnieArt(cpr,.1);
assert(cpr.userData.rig.compression>0,'M6 must animate repetitive mechanical CPR');

console.log('DUTYNIGHT V2 ANNIE IDENTITY QA PASS');
