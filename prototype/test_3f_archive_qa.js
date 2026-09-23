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
const ward=router.loadZone('first_campus_4f');
assert.equal(ward.archiveKeyClueMesh?.userData?.type,'archive_key_clue_4f','4F museum-key clue missing');
assert.equal(ward.archiveKeyMesh?.userData?.type,'archive_key_cache_4f','4F hidden museum-key cache missing');
assert.deepEqual(ward.archiveKeyAnchor,[-11.25,.26,8.08]);
console.log('3F EXPLORATION + ARCHIVE QA PASS');
