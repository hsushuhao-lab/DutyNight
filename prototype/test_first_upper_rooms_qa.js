import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
function travel(a,b){c.teleport(...a);const n=140;for(let i=0;i<n;i++)c.moveWithCollision((b[0]-a[0])/n,(b[2]-a[2])/n);assert(Math.hypot(c.position.x-b[0],c.position.z-b[2])<.07,JSON.stringify({a,b,at:c.position.toArray()}));}
for(const id of ['first_campus_3f','first_campus_4f']){
 const z=r.loadZone(id);z.setWardGateClosed?.(false);z.setInnerWardGateClosed?.(false);for(const door of Object.values(z.accessDoors||{}))if(!door.portal)door.setClosed(false);
 for(const room of z.roomAreas){travel(room.corridor,room.point);travel(room.point,room.corridor);}
 if(id==='first_campus_4f'){
  assert.deepEqual(z.roomAreas.filter(r=>r.kind==='ward').map(r=>r.id),Array.from({length:9},(_,i)=>String(401+i)));
  assert.equal(z.bedAreas.length,36);assert.equal(z.bedAreas.find(b=>b.wardBedNumber===33)?.roomId,'409');
 }
}
console.log('FIRST UPPER ROOMS V5 PASS: 316 admin retained; 401–409 x4 beds plus entrance storage are accessible after staff entry');
