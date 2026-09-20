import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
global.document={querySelector:()=>null,createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),null);
for(const id of ['first_campus_4f','second_campus_5f','second_campus_4f_story']){
 router.loadZone(id);const panels=router.lightingGroup.children.filter(o=>o.isRectAreaLight);
 assert(panels.length<=7,'Nine-room floor must not create a shader light for every room and corridor waypoint');
 assert(panels.some(o=>o.position.z<-8),'Light placement must follow the new activity-hall plan');
}
console.log('WARD LIGHTING PASS: bounded light count, placement follows new floorplan');
