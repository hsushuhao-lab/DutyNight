import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GeometryFactory } from './src/world/shared/GeometryFactory.js';
import { SecondCampusStandardFloor } from './src/world/zones/SecondCampusStandardFloor.js';
import { SecondCampus2F } from './src/world/zones/SecondCampus2F.js';
import { SecondCampus1F } from './src/world/zones/SecondCampus1F.js';

global.document = { createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => ({ addColorStop() {} }) }) }) };
const gf = new GeometryFactory();
let routes = 0;
function clear(zone, point) {
  const [x,y,z] = point;
  const box = new THREE.Box3(new THREE.Vector3(x-.35,.15,z-.35),new THREE.Vector3(x+.35,1.95,z+.35));
  assert(!zone.colliders.some(collider=>collider.intersectsBox(box)), `Blocked at ${point}`);
  const hits = new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,-1,0),0,2).intersectObjects(zone.walkables,true);
  assert(hits.length, `No floor at ${point}`);
}
function path(zone, points) {
  for(let index=1;index<points.length;index++) {
    const a=new THREE.Vector3(...points[index-1]),b=new THREE.Vector3(...points[index]);
    const steps=Math.ceil(a.distanceTo(b)/.05);
    for(let step=0;step<=steps;step++)clear(zone,a.clone().lerp(b,step/steps).toArray());
  }
  routes++;
}
const codes = new Set();
for(let floor=3;floor<=8;floor++) {
  const zone=new SecondCampusStandardFloor(new THREE.Scene(),gf,{floor}).build();
  zone.zoneGroup.updateMatrixWorld(true);
  assert.equal(zone.roomAreas?.length,3,'Standard floor must contain 3 enterable rooms');
  assert.equal(zone.floor,floor);
  const station=zone.zoneGroup.children.find(child=>child.name.startsWith('Plaque_'+floor+'F-ST_'));
  assert(station, 'Numbered station sign missing');
  assert.equal(station.rotation.y,Math.PI,'Station must face elevator');
  path(zone,[[77.5,1.7,-1.3],[77.5,1.7,1.9],[77.5,1.7,-1.3]]);
  const elevator=zone.zoneGroup.children.find(child=>child.position.x===77.5 && child.position.z===-2.65);
  assert(elevator, 'Elevator must face station across corridor');
  for(const room of zone.roomAreas) {
    assert(!codes.has(room.id),'Floor-specific room identity required');codes.add(room.id);
    path(zone,[[66.5,1.7,0],room.corridor,room.door,room.point,room.door,room.corridor,[66.5,1.7,0]]);
    const back=new THREE.Box3(new THREE.Vector3(room.point[0]-.35,.15,-9.1),new THREE.Vector3(room.point[0]+.35,1.95,-8.7));
    assert(zone.colliders.some(collider=>collider.intersectsBox(back)),'Room back boundary is unsealed');
  }
  path(zone,[[66.5,1.7,0],[70,1.7,0],[73,1.7,0],[73,1.7,2],[73,1.7,4.5],[73,1.7,2],[73,1.7,0],[66.5,1.7,0]]);
  zone.cleanup();
  assert.equal(zone.roomAreas.length,0);
}
const second=new SecondCampus2F(new THREE.Scene(),gf).build();
second.zoneGroup.updateMatrixWorld(true);
assert.equal(second.roomAreas?.length,2,'2F must have enterable ward and support room');
for(const room of second.roomAreas)path(second,[[62,1.7,0],room.corridor,room.door,room.point,room.door,room.corridor,[62,1.7,0]]);
second.cleanup();
assert.equal(second.roomAreas.length,0);
second.build();
assert.equal(second.roomAreas.length,2);
second.cleanup();
const ground=new SecondCampus1F(new THREE.Scene(),gf).build();
ground.zoneGroup.updateMatrixWorld(true);
assert(ground.zoneGroup.getObjectByName('Plaque_1F-ST_1F 護理站'),'1F elevator-facing nursing station identity missing');
path(ground,[[74,1.7,0],[74,1.7,-3],[72,1.7,-3],[72,1.7,-10],[72,1.7,-3],[74,1.7,-3],[74,1.7,0]]);
ground.cleanup();
console.log(`SECOND CAMPUS ROOMS: ${routes} enter/exit/return routes PASS, ${codes.size} unique room identities`);
