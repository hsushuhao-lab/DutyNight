import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GeometryFactory} from './src/world/shared/GeometryFactory.js';
import {FirstCampus3F} from './src/world/zones/FirstCampus3F.js';
import {FirstCampus4F} from './src/world/zones/FirstCampus4F.js';
global.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})})})};
for(const [Zone,start,ids] of [[FirstCampus3F,[14,1.7,0],['3F_ADMIN']],[FirstCampus4F,[12,1.7,0],['4A','4B','4C','4D','4F_PHYSICIAN']]]) {
 const zone=new Zone(new THREE.Scene(),new GeometryFactory()).build();
 if(zone.setWardGateClosed)zone.setWardGateClosed(false);
 zone.zoneGroup.updateMatrixWorld(true);
 assert.deepEqual(zone.roomAreas.map(a=>a.id),ids);
 const walk=(a,b)=>{const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),steps=Math.ceil(from.distanceTo(to)/.05);
  for(let i=0;i<=steps;i++) {const p=from.clone().lerp(to,i/steps),body=new THREE.Box3(new THREE.Vector3(p.x-.35,.15,p.z-.35),new THREE.Vector3(p.x+.35,1.95,p.z+.35));
   assert(!zone.colliders.some(c=>c.intersectsBox(body)),`blocked at ${p.toArray()}`);
   const ray=new THREE.Raycaster(new THREE.Vector3(p.x,2,p.z),new THREE.Vector3(0,-1,0),0,3);assert(ray.intersectObjects(zone.walkables,true).length,`floor missing at ${p.toArray()}`);
  }
 };
 for(const room of zone.roomAreas){walk(start,room.corridor);walk(room.corridor,room.point);walk(room.point,room.corridor);walk(room.corridor,start);console.log('PASS room in/out '+room.id+' '+JSON.stringify(room.point));}
 zone.cleanup();
}
console.log('FIRST UPPER ROOMS: 6/6 in/out floor-supported routes PASS; stair travel is door-menu only');
