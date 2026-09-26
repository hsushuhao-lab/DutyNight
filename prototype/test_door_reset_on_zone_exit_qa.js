import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';

const context=new Proxy({measureText:text=>({width:text.length*20})},{get:(target,key)=>target[key]||(()=>({addColorStop(){}}))});
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({width:0,height:0,getContext:()=>context})};
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),null);
let zone=router.loadZone('first_campus_4f');
zone.setDutyDoorClosed(false);
zone.setWardGateClosed(false);
for(const door of Object.values(zone.accessDoors||{}))door.setClosed(false);
router.loadZone('first_campus_3f');
zone=router.loadZone('first_campus_4f');
assert.equal(zone.dutyDoor.closed,true);
assert.equal(zone.wardDoor.closed,true);
assert(Object.values(zone.accessDoors||{}).every(door=>door.closed));
console.log('DOOR RESET ON ZONE EXIT PASS');
