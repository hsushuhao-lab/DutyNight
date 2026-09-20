import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
const zone=r.loadZone('ecology_pond','pond_from_hill');
function walk(x,z){for(let i=0;i<2000;i++){
 const dx=x-c.position.x,dz=z-c.position.z,d=Math.hypot(dx,dz);if(d<.02)return;
 const before=c.position.clone();c.moveWithCollision(dx/d*Math.min(.04,d),dz/d*Math.min(.04,d));
 assert(c.position.distanceTo(before)>.001,`Pond blocked at ${c.position.toArray()} -> ${x},${z}`);
 }throw Error('Pond route exhausted');}
for(const [x,z] of [[53,-41.5],[56,-41.5],[62,-42],[62,-46],[62,-47.7],[62,-50.8],[62,-51.8]])walk(x,z);
assert(c.position.z<-51.5,'Must reach the lower waterfront, not stop at the upper observation deck');
assert(c.position.y<1.0,'Must actually descend the ramp');
c.moveWithCollision(0,-3);assert(c.position.z>-52.2,'Safety railing must still stop entry into water');
for(const [x,z] of [[62,-50.8],[62,-47.7],[62,-46],[62,-42],[56,-41.5],[53,-41.5],[53,-36.8]])walk(x,z);
assert(c.position.y>1.1);zone.cleanup();
console.log('POND WATERFRONT PASS: entrance -> upper deck -> descending ramp -> lower water edge -> return, safety railing retained');
