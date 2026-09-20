import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
function travel(a,b){c.teleport(...a);const n=100;for(let i=0;i<n;i++)c.moveWithCollision((b[0]-a[0])/n,(b[2]-a[2])/n);assert(Math.hypot(c.position.x-b[0],c.position.z-b[2])<.06,JSON.stringify({a,b,at:c.position.toArray()}));}
for(const id of ['first_campus_3f','first_campus_4f']){
 const z=r.loadZone(id);z.setWardGateClosed?.(false);
 for(const room of z.roomAreas){travel(room.corridor,room.point);travel(room.point,room.corridor);}
 if(id==='first_campus_4f')assert.deepEqual(z.roomAreas.filter(r=>r.kind==='ward').map(r=>r.id),Array.from({length:9},(_,i)=>String(401+i)));
}
console.log('FIRST UPPER ROOMS PASS: 316-era admin retained; 401–409 and toilet accessible after staff entry');
