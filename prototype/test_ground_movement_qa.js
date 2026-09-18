import assert from 'node:assert/strict';
import * as THREE from 'three';
import {FPSController} from './src/player/FPSController.js';
function plane(x,y,z,w,d){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial());m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.updateMatrixWorld(true);return m;}
function player(floors,position=[0,1.7,0]){const c=Object.create(FPSController.prototype);Object.assign(c,{position:new THREE.Vector3(...position),velocity:new THREE.Vector3(),playerRadius:.35,eyeHeight:1.7,walkables:floors,colliders:[],autoMoveTarget:null,groundRaycaster:new THREE.Raycaster()});return c;}
const edge=player([plane(0,0,0,4,4)]);
for(let i=0;i<60;i++)edge.moveWithCollision(.1,0);
assert.ok(edge.position.x<=1.73,'Player walks beyond supported floor');
const stairs=player([plane(0,0,0,2,2),plane(2,-.15,0,2,2),plane(4,-.30,0,2,2)]);
for(let i=0;i<40;i++)stairs.moveWithCollision(.1,0);
assert.ok(stairs.position.x>3.8,'Cannot descend bounded steps');
assert.ok(Math.abs(stairs.position.y-1.4)<.001,'Eye height must follow stair ground');
for(let i=0;i<40;i++)stairs.moveWithCollision(-.1,0);
assert.ok(stairs.position.x<.1 && Math.abs(stairs.position.y-1.7)<.001,'Cannot return up steps');
const wall=player([plane(0,0,0,20,20)]);wall.colliders=[new THREE.Box3(new THREE.Vector3(1,0,-3),new THREE.Vector3(1.2,3,3))];wall.moveWithCollision(6,0);assert.ok(wall.position.x<.7,'Large delta tunnels through wall');
console.log('Ground movement PASS: floor edge, stair descent/return, swept wall containment');
