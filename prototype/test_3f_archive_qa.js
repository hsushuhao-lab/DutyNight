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
const zone=router.loadZone('first_campus_3f');

assert.equal(zone.explorationArea?.id,'3F_ELEVATOR_LOBBY');
assert.deepEqual(zone.explorationArea.bounds,[-12,-3.5,-4,3.5]);
assert.equal(zone.secretArchive?.bookshelfCount,4);
assert.equal(zone.secretArchive?.documentIds.length,4);
assert(zone.keyedDoors['3F_ARCHIVE_DOOR']?.closed,'Museum keyed door must default closed');
assert.equal(zone.secretArchive?.requires,'ARCHIVE_ACCESS_KEY');
assert(zone.levelInstance?.officeDoorLeaf?.userData?.type==='office_316_door','316 office must begin as a locked interactive door');
assert(zone.spareKeyMesh?.userData?.type==='spare_key_316','316 guard-patrol spare-key interaction missing');
assert.equal(zone.guardPatrolPoint?.opposite,'3F_ARCHIVE_DOOR');
assert(zone.levelInstance?.lockerMesh?.userData?.type==='locker_316','316 keypad locker interaction missing');
assert(zone.levelInstance?.credentialDrawerMesh?.userData?.type==='credential_drawer_316','316 under-desk credential drawer missing');

const docs=zone.interactables.filter(o=>o.userData?.type==='archive_document');
assert.equal(docs.length,9,'3F must expose four museum files, two office secrets and three 1F hint files');
assert.equal(zone.officeSecrets?.count,2,'316 must contain two optional secret clues');
assert.equal(zone.secretArchive?.documentIds.length,4);
for(const doc of docs){
  assert(doc.userData.documentTitle);
  assert(doc.userData.pages.length>=2);
  assert.match(doc.userData.label,/翻閱/);
}
assert.equal(zone.levelInstance?.office302?.code,'3082');
assert.equal(zone.levelInstance?.office302Keypad?.userData?.type,'office_302_keypad');
assert.equal(zone.levelInstance?.museumKey302?.userData?.type,'museum_key_302');
assert.equal(zone.levelInstance?.storageRoom?.anne,true);
assert.equal(zone.levelInstance?.anneStage,0);
assert.equal(zone.levelInstance?.phoneMesh?.userData?.type,'office_phone_316');
assert.equal(zone.coreOffice3F?.relativeTo4FDutyRoom,true);
assert.deepEqual(zone.coreOffice3F?.bounds,[-22,3.5,-16,11.5]);
assert.deepEqual(zone.coreOffice3F?.door,[-16,1.7,7.5]);

zone.levelInstance.unlock302();
const doorway302=new THREE.Box3(new THREE.Vector3(-9.82,.10,-4.05),new THREE.Vector3(-9.18,1.8,-3.28));
assert(!zone.colliders.some(c=>c.intersectsBox(doorway302)),'302 doorway must be physically passable after keypad unlock');

const coreOfficeDoorway=new THREE.Box3(new THREE.Vector3(-16.18,.10,7.15),new THREE.Vector3(-15.82,1.8,7.85));
assert(!zone.colliders.some(c=>c.intersectsBox(coreOfficeDoorway)),'3F office doorway at the 4F-duty-room-relative position must remain passable');
console.log('3F EXPLORATION + ARCHIVE QA PASS');
