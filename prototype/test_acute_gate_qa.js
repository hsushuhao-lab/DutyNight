import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
const zone=r.loadZone('first_campus_2f');
for(const id of ['ER_MAIN','ER_BEDS','ER_HILLSIDE']){
 const d=zone.accessDoors[id],p=d.closedBox.getCenter(new THREE.Vector3());
 assert(d.closed);assert.equal(d.readers.length,2);assert(c.checkCollision(p.x,p.z));
 assert(d.toggle(new THREE.Vector3(-8,1.7,0)));assert(!d.closed);assert(!c.checkCollision(p.x,p.z));
 assert.equal(d.toggle(new THREE.Vector3(p.x,1.7,p.z)),false);d.setClosed(true);
}
r.loadZone('first_campus_3f');const restored=r.loadZone('first_campus_2f');assert(Object.values(restored.accessDoors).every(d=>d.closed));
console.log('ACUTE GATES PASS: three normally closed boundaries, two readers, opening, occupancy guard, persistence');
