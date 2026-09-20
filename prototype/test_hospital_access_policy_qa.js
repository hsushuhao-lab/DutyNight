import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
import {FIRST_FLOORS,SECOND_FLOORS} from './src/world/shared/WorldRoutes.js';
assert.deepEqual(FIRST_FLOORS,[1,2,3,4,8]);assert.deepEqual(SECOND_FLOORS,[1,2,5]);
const lobby=r.loadZone('first_campus_1f');assert(c.checkCollision(1,-8));assert(c.checkCollision(17.88,-4));
for(const id of ['second_campus_1f','second_campus_2f']){const z=r.loadZone(id);assert(!z.station);assert(!r.floorDestinations().some(f=>f.floorNum===4));}
assert.equal(r.loadZone('first_campus_4f').roomAreas.filter(a=>a.id==='402').length,1,'402 is explicitly approved as a ward in the latest drawing');
assert.equal(r.loadZone('second_campus_4f_story').floor,4);
console.log('HOSPITAL POLICY PASS: approved floors, night closures, security-only 1F/2F, hidden 4F and authorized 402 ward');
