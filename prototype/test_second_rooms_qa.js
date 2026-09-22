import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
function travel(a,b){c.teleport(...a);const n=140;for(let i=0;i<n;i++)c.moveWithCollision((b[0]-a[0])/n,(b[2]-a[2])/n);assert(Math.hypot(c.position.x-b[0],c.position.z-b[2])<.07,JSON.stringify({a,b,at:c.position.toArray()}));}
const z=r.loadZone('second_campus_5f');z.setWardGateClosed(false);z.setInnerWardGateClosed(false);for(const door of Object.values(z.accessDoors||{})) if(!door.portal) door.setClosed(false);
assert.deepEqual(z.roomAreas.filter(r=>r.kind==='ward').map(r=>r.id),Array.from({length:9},(_,i)=>String(501+i)));
assert.equal(z.bedAreas.length,36);assert.equal(z.bedAreas.find(b=>b.wardBedNumber===33)?.roomId,'509');
assert(z.roomAreas.some(r=>r.id==='SECOND_DUTY'&&r.label==='值班室'));
for(const room of z.roomAreas){travel(room.corridor,room.point);travel(room.point,room.corridor);}
assert(!r.floorDestinations().some(f=>f.floorNum===4));
console.log('SECOND ROOMS V5 PASS: 501–509 x4 beds, bed 33 in 509, entrance storage/plant, duty room, no public 4F button');
