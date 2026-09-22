import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';

global.document={
  querySelector:()=>null,
  addEventListener(){},
  createElement:()=>({
    getContext:()=>new Proxy(
      {measureText:t=>({width:t.length*20})},
      {get:(o,k)=>o[k]||(()=>({addColorStop(){}}))}
    )
  })
};

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera();
const c=new FPSController(
  camera,
  {addEventListener(){}},
  [],
  [],
  []
);

const r=new WorldRouter(scene,camera,c);
const zone=r.loadZone('second_campus_5f');

zone.setWardGateClosed(false);

c.teleport(72,1.7,3.2);

function walk(x,z){
  for(let i=0;i<2500;i++){
    const dx=x-c.position.x;
    const dz=z-c.position.z;
    const d=Math.hypot(dx,dz);

    if(d<.025)return;

    const before=c.position.clone();

    c.moveWithCollision(
      dx/d*Math.min(.04,d),
      dz/d*Math.min(.04,d)
    );

    assert(
      c.position.distanceTo(before)>.001,
      `Ward route blocked ${c.position.toArray()} -> ${x},${z}`
    );
  }

  throw Error(`Route exhausted -> ${x},${z}`);
}

const staffDoor=zone.accessDoors.second_station_staff;

assert(staffDoor,'Missing second_station_staff');
assert.deepEqual(
  zone.station.position,
  [72,-7],
  'V4 central nursing station must be centered at z=-7'
);

staffDoor.setClosed(false);

// Main admission gate -> common ward approach
walk(72,.6);
walk(68.1,-2.5);

// 501
walk(66.1,-2.5);
walk(63.75,-2.5);
walk(66.1,-2.5);

// 502
walk(68.1,-2.5);
walk(68.1,-8);
walk(66.1,-8);
walk(63.75,-8);
walk(66.1,-8);

// Test the REAL staff door location instead of a V3 hard-coded point
const sx=staffDoor.root.position.x;
const sz=staffDoor.root.position.z;

walk(68.1,-5.8);
walk(sx,sz+1.2);
walk(sx,sz-1.2);
walk(sx,sz+1.2);

// Continue around central nursing-station island
walk(68.1,-8);
walk(68.1,-14);
walk(72,-15.5);
walk(76.4,-14);
walk(76.4,-8);
walk(76.4,-2.5);
walk(72,-2.5);
walk(72,3.2);

zone.cleanup();

console.log(
  'WARD CIRCULATION V4 PASS: main gate -> perimeter corridor -> 501/502 -> central station staff door -> ring corridor -> exit'
);
