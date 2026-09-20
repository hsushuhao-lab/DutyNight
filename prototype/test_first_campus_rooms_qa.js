import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GeometryFactory} from './src/world/shared/GeometryFactory.js';
import {CollisionFactory} from './src/world/shared/CollisionFactory.js';
import {FirstCampus1F} from './src/world/zones/FirstCampus1F.js';
import {FirstCampus2FER} from './src/world/zones/FirstCampus2FER.js';
global.document??={createElement:()=>({getContext:()=>new Proxy({}, {get:()=>()=>({addColorStop(){}})})})};
let routes=0,samples=0;
for(const [Zone,approach,count] of [[FirstCampus1F,[[16.5,1.7,0],[18,1.7,0]],3],[FirstCampus2FER,[[-8,1.7,0],[-8,1.7,18],[-6.2,1.7,18]],6]]){
 const scene=new THREE.Scene(),zone=new Zone(scene,new GeometryFactory()).build();
 if(zone.setAcuteGateClosed)zone.setAcuteGateClosed(false);
 scene.updateMatrixWorld(true);
 assert.equal(zone.roomAreas.length,count);
 for(const room of zone.roomAreas){
  const points=[...approach,room.corridor,room.door,room.point];
  for(const way of [points,[...points].reverse()])for(let i=1;i<way.length;i++){
   const a=new THREE.Vector3(...way[i-1]),b=new THREE.Vector3(...way[i]);
   const steps=Math.ceil(a.distanceTo(b)/.08);
   for(let k=0;k<=steps;k++){
    const p=a.clone().lerp(b,k/Math.max(steps,1));
    assert.equal(CollisionFactory.testPoint(zone.colliders,p.x,p.y,p.z,.35).collided,false,`${room.id} blocked at ${p.toArray()}`);
    const supported=new THREE.Raycaster(p,new THREE.Vector3(0,-1,0),0,1.85).intersectObjects(zone.walkables,true).some(hit=>Math.abs(hit.point.y)<.06);
    assert.ok(supported,`${room.id} unsupported at ${p.toArray()}`);samples++;
   }
  }
  routes++;console.log(`PASS ${room.id} continuous in/out ${JSON.stringify(room.point)}`);
 }
 zone.cleanup();assert.equal(scene.children.length,0);
}
console.log(`FIRST_CAMPUS_ROOMS_QA = PASS (${routes} rooms, ${samples} radius .35 supported traversal samples)`);
