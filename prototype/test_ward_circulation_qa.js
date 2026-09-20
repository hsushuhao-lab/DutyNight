import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
const zone=r.loadZone('second_campus_5f');zone.setWardGateClosed(false);
c.teleport(76.4,1.7,1.2); // Only initial test fixture; the complete route never teleports.
function walk(x,z){for(let i=0;i<2000;i++){
 const dx=x-c.position.x,dz=z-c.position.z,d=Math.hypot(dx,dz);if(d<.025)return;
 const before=c.position.clone();c.moveWithCollision(dx/d*Math.min(.04,d),dz/d*Math.min(.04,d));
 assert(c.position.distanceTo(before)>.001,`Ward route blocked ${c.position.toArray()} -> ${x},${z}`);
 }throw Error('Route exhausted');}
for(const [x,z] of [[76.4,-9],[68.1,-9],[68.1,-2.5],[67.1,-2.5],[64.75,-2.5],
 [67.1,-2.5],[68.1,-2.5],[68.1,-8.5],[64.75,-8.5],[68.1,-8.5],[68.1,-10.5],[76.4,-10.5],[76.4,1.2]])walk(x,z);
zone.cleanup();console.log('WARD CIRCULATION PASS: gate -> activity hall -> west lane -> 501/502 -> gate, with open door-leaf collision retained');
