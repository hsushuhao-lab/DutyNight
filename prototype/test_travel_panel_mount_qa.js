import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),c=new FPSController(camera,{addEventListener(){}},[],[],[]),r=new WorldRouter(scene,camera,c);
for(const campus of ['first','second'])for(const floor of campus==='first'?[1,2,3,4,8]:[1,2,5]){
 const id=`${campus}_campus_${floor}f`,z=r.loadZone(id);scene.updateMatrixWorld(true);
 const panel=z.interactables.find(o=>o.userData.kind==='elevator');assert(panel);assert.equal(z.verticalCore.panel[0],1.65);
 const pos=panel.getWorldPosition(new THREE.Vector3()),normal=new THREE.Vector3(0,0,1).transformDirection(panel.matrixWorld);
 assert(normal.z<-.99);assert.equal(z.verticalCore.lift[0],0);
 c.teleport(pos.x,1.7,pos.z-.85);assert(!c.checkCollision(c.position.x,c.position.z));assert.notEqual(c.supportedHeight(c.position.x,c.position.z),null);
 const button=panel.parent.children.find(o=>o.geometry?.type==='CircleGeometry');assert(button,'Visible round call button missing');
 assert(z.interactables.some(o=>o.userData.kind==='stairs'));
}
console.log('TRAVEL MOUNT PASS: all eight floors, same local layouts, visible side-wall buttons facing reachable operators');
