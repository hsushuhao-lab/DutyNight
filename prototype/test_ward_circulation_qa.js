import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';

global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
const zone=r.loadZone('second_campus_5f');
const outer=zone.accessDoors.second_ward,inner=zone.accessDoors.second_ward_inner,bypass=zone.accessDoors.second_ward_glass,stationWard=zone.accessDoors.second_station_ward;
for(const d of [outer,inner,bypass,stationWard])assert(d?.closed);

c.teleport(72,1.7,3.2);
function walk(x,z){for(let i=0;i<3500;i++){
 const dx=x-c.position.x,dz=z-c.position.z,d=Math.hypot(dx,dz);if(d<.025)return;
 const before=c.position.clone();c.moveWithCollision(dx/d*Math.min(.04,d),dz/d*Math.min(.04,d));
 assert(c.position.distanceTo(before)>.001,`Ward route blocked ${c.position.toArray()} -> ${x},${z}`);
 }throw Error(`Route exhausted -> ${x},${z}`);}

zone.setWardGateClosed(false);walk(72,1);

// Straight through second iron gate enters nursing station.
zone.setInnerWardGateClosed(false);walk(72,-3.2);
const wx=stationWard.root.position.x,wz=stationWard.root.position.z;
walk(wx,wz+1.1);stationWard.setClosed(false);walk(wx,wz-1.2);
assert.equal(zone.station.facesRoom,'506');

// Return to vestibule, then right-turn / left-turn through glass bypass directly into ward.
walk(wx,wz+1.1);walk(72,-3.2);walk(72,1);walk(78,1);
const gx=bypass.root.position.x,gz=bypass.root.position.z;
walk(gx,gz+1.0);bypass.setClosed(false);walk(gx,gz-1.2);walk(78,-6);walk(78,-12);

// A patient room is closed by default and becomes traversable only after opening.
const room509=zone.roomAreas.find(room=>room.id==='509'),roomDoor=zone.keyedDoors[room509.accessDoorId];
assert.equal(room509.doorType,'knob');assert(roomDoor?.closed);roomDoor.setClosed(false);
walk(room509.corridor[0],room509.corridor[2]);walk(room509.point[0],room509.point[2]);

zone.cleanup();
console.log('WARD CIRCULATION V5.2 PASS: outer gate -> vestibule -> station route toward 506; alternate glass bypass -> ward');
