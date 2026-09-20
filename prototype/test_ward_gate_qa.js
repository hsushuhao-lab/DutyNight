import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
for(const id of ['first_campus_4f','second_campus_5f']){
 let zone=r.loadZone(id),d=zone.wardDoor,p=d.closedBox.getCenter(new THREE.Vector3());assert(d.closed);assert.equal(d.readers.length,2);
 c.teleport(p.x,1.7,p.z+1.2);c.moveWithCollision(0,-3);assert(c.position.z>p.z);
 zone.setWardGateClosed(false);c.teleport(p.x,1.7,p.z+1.2);c.moveWithCollision(0,-2.4);assert(c.position.z<p.z-.9);
 assert.equal(d.toggle(new THREE.Vector3(p.x,1.7,p.z)),false);zone.setWardGateClosed(true);
 r.loadZone('first_campus_3f');zone=r.loadZone(id);assert(zone.wardDoor.closed);
}
console.log('WARD GATES PASS: closed and authorized passage on both campuses, occupancy and persistence');
