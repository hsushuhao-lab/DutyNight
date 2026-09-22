import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
for(const id of ['first_campus_4f','second_campus_5f']){
 let zone=r.loadZone(id),outer=zone.wardDoor,inner=zone.innerWardDoor;
 assert(outer?.closed);assert(inner?.closed);assert.equal(outer.readers.length,2);assert.equal(inner.readers.length,2);
 let p=outer.closedBox.getCenter(new THREE.Vector3());
 c.teleport(p.x,1.7,p.z+1.2);c.moveWithCollision(0,-3);assert(c.position.z>p.z,'Outer gate must block');
 zone.setWardGateClosed(false);
 c.teleport(p.x,1.7,p.z+1.2);c.moveWithCollision(0,-1.7);assert(c.position.z<p.z-.2,'Outer gate must open into vestibule');
 p=inner.closedBox.getCenter(new THREE.Vector3());
 c.teleport(p.x,1.7,p.z+1.0);c.moveWithCollision(0,-2.5);assert(c.position.z>p.z,'Inner gate must block');
 zone.setInnerWardGateClosed(false);
 c.teleport(p.x,1.7,p.z+1.0);c.moveWithCollision(0,-2.2);assert(c.position.z<p.z-.7,'Inner gate must authorize ward entry');
 assert.equal(inner.toggle(new THREE.Vector3(p.x,1.7,p.z)),false,'Inner gate must reject closing onto player');
 zone.setWardGateClosed(true);zone.setInnerWardGateClosed(true);
 r.loadZone('first_campus_3f');zone=r.loadZone(id);assert(zone.wardDoor.closed);assert(zone.innerWardDoor.closed);
}
console.log('WARD GATES V5 PASS: both serial iron gates closed by default, block independently, authorize passage, and persist');
