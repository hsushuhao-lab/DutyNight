import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';

global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
const zone=r.loadZone('second_campus_5f');
zone.setWardGateClosed(false);zone.setInnerWardGateClosed(false);
const glass=zone.accessDoors.second_station_staff;assert(glass);glass.setClosed(false);

c.teleport(72,1.7,3.2);
function walk(x,z){for(let i=0;i<3000;i++){
 const dx=x-c.position.x,dz=z-c.position.z,d=Math.hypot(dx,dz);if(d<.025)return;
 const before=c.position.clone();c.moveWithCollision(dx/d*Math.min(.04,d),dz/d*Math.min(.04,d));
 assert(c.position.distanceTo(before)>.001,`Ward route blocked ${c.position.toArray()} -> ${x},${z}`);
 }throw Error(`Route exhausted -> ${x},${z}`);}

// Lobby -> outer iron gate -> vestibule -> inner iron gate.
walk(72,1);walk(72,-1.2);
// West side -> north corridor -> east side around the central station island.
for(const [x,z] of [[66,-1.2],[66,-9],[66,-13],[72,-13],[78,-13],[78,-9],[78,-1.2]])walk(x,z);
// Real south-east glass staff door into and out of the nursing station.
const sx=glass.root.position.x,sz=glass.root.position.z;
walk(sx,sz+1.1);walk(sx,sz-1.2);walk(sx,sz+1.1);
// Return through both serial ward gates.
walk(72,-1.2);walk(72,1);walk(72,3.2);
zone.cleanup();
console.log('WARD CIRCULATION V5 PASS: outer gate -> vestibule -> inner gate -> perimeter ring -> nursing-station glass door -> exit');
