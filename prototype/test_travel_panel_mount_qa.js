import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FIRST_FLOORS,SECOND_FLOORS} from './src/world/shared/WorldRoutes.js';

global.document={querySelector:()=>null,createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})})})};
const controller={enabled:true,teleport(){},updateCameraRotation(){}};
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),controller);
const zones=[...FIRST_FLOORS.map(f=>`first_campus_${f}f`),'skybridge',...SECOND_FLOORS.map(f=>`second_campus_${f}f`),'hillside_route','ecology_pond'];
const failures=[];
let panels=0;
for(const zoneId of zones){
 const zone=router.loadZone(zoneId);
 zone.zoneGroup.updateMatrixWorld(true);
 for(const button of zone.interactables.filter(object=>object.userData.type==='travel_selector')){
  panels++;
  const root=button.parent,backing=root.children[0],plaque=root.children.find(object=>object.name.startsWith('Plaque_'));
  const backingBox=new THREE.Box3().setFromObject(backing).expandByScalar(.000001);
  const label=button.userData.id;
  try{
   assert(backingBox.intersectsBox(new THREE.Box3().setFromObject(button)),`${label}: backing must contact button`);
   assert(backingBox.intersectsBox(new THREE.Box3().setFromObject(plaque)),`${label}: backing must contact plaque`);
   zone.zoneGroup.traverse(object=>{
    if(!object.name.startsWith('Plaque_'))return;
    for(let node=object;node;node=node.parent)if(node===root)return;
    assert(!backingBox.intersectsBox(new THREE.Box3().setFromObject(object)),label+': backing must not cover '+object.name);
   });
   const origin=root.localToWorld(new THREE.Vector3(0,.15,.4));
   const direction=new THREE.Vector3(0,0,-1).applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()));
   const architecturalMeshes=[];
   zone.zoneGroup.traverse(object=>{
    if(!object.isMesh || !(object.geometry?.parameters?.height>=2))return;
    for(let node=object;node;node=node.parent)if(node===root || !node.visible)return;
    architecturalMeshes.push(object);
   });
   const hit=new THREE.Raycaster(origin,direction,0,1).intersectObjects(architecturalMeshes,false)[0];
   assert(hit,`${label}: no actual door or wall behind fixture`);
   assert(backingBox.containsPoint(hit.point),`${label}: actual support ${hit.point.toArray()} lies outside backing`);
   console.log(`PASS ${label}: backing joins button/plaque and actual door/wall`);
  }catch(error){failures.push(error.message);console.error(`FAIL ${error.message}`);}
 }
}
router.activeZoneInstance.cleanup();
assert.equal(panels,16,'Must inspect all canonical travel panels');
assert.equal(failures.length,0,failures.join('\n'));
console.log(`TRAVEL PANEL MOUNTS PASS: ${panels} fixtures across ${zones.length} canonical zones; button/plaque contact and actual architectural support`);
