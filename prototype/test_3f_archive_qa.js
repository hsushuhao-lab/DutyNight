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

assert.equal(zone.explorationArea?.id,'3F_ELEVATOR_ANNEX');
assert.deepEqual(zone.explorationArea.bounds,[-12,-8.5,-4,-3.5]);
assert.equal(zone.secretArchive?.bookshelfCount,4);
assert.equal(zone.secretArchive?.documentIds.length,3);
assert(zone.accessDoors['3F_ARCHIVE_DOOR']?.closed,'Archive access door must default closed');

const docs=zone.interactables.filter(o=>o.userData?.type==='archive_document');
assert.equal(docs.length,3,'Archive must expose three readable document objects');
for(const doc of docs){
  assert(doc.userData.documentTitle);
  assert(doc.userData.pages.length>=3);
  assert.match(doc.userData.label,/翻閱/);
}
console.log('3F EXPLORATION + ARCHIVE QA PASS');
