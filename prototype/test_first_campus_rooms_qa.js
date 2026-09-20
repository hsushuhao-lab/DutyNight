import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GeometryFactory} from './src/world/shared/GeometryFactory.js';
import {CollisionFactory} from './src/world/shared/CollisionFactory.js';
import {FirstCampus1F} from './src/world/zones/FirstCampus1F.js';
import {FirstCampus2FER} from './src/world/zones/FirstCampus2FER.js';

global.document??={createElement:()=>({getContext:()=>new Proxy({}, {get:()=>()=>({addColorStop(){}})})})};
const gf=new GeometryFactory();

// 1F night-access policy: public glass entrance and pharmacy/drug-storage glass bay are physically closed.
{
  const scene=new THREE.Scene(),zone=new FirstCampus1F(scene,gf).build();
  zone.setEntranceClosed(true);
  assert.equal(CollisionFactory.testPoint(zone.colliders,1,1.7,-8,.2).collided,true,'1F main glass entrance must be closed at night');
  assert.equal(CollisionFactory.testPoint(zone.colliders,17.88,1.7,-4,.15).collided,true,'1F pharmacy/drug-storage glass frontage must block entry');
  assert(zone.interactables.some(x=>x.userData.id==='1F_MAIN_DOOR'),'Missing closed 1F entrance interaction');
  assert(zone.interactables.some(x=>x.userData.id==='1F_PHARM_GATE'),'Missing closed pharmacy/drug-storage interaction');
  zone.cleanup(); assert.equal(scene.children.length,0);
}

// 2F: arrival stays outside a closed iron gate; after staff authorization all essential ER areas are reachable.
{
  const scene=new THREE.Scene(),zone=new FirstCampus2FER(scene,gf).build();
  const gateProbe=CollisionFactory.testPoint(zone.colliders,0,1.7,0,.25);
  assert.equal(gateProbe.collided,true,'2F emergency gate must block baseline entry');
  zone.setAcuteGateClosed(false);
  assert.equal(CollisionFactory.testPoint(zone.colliders,0,1.7,0,.25).collided,false,'Authorized 2F gate must clear entry');

  const routes=[
    [[-4,1.7,0],[3.5,1.7,2.0],'triage/nursing station'],
    [[-4,1.7,0],[3.5,1.7,-3.0],'treatment-room threshold'],
    [[8,1.7,0],[12.5,1.7,-3.0],'doctor-office threshold'],
    [[8,1.7,0],[14.5,1.7,3.0],'observation area threshold'],
  ];
  for(const [a,b,label] of routes){
    const result=CollisionFactory.testTraversal(zone.colliders,a,b,.30,80);
    assert.equal(result.passable,true,`2F authorized route blocked: ${label}`);
  }
  zone.cleanup(); assert.equal(scene.children.length,0);
}

console.log('FIRST CAMPUS ACCESS QA PASS: 1F glass night closures + authorized 2F essential ER routes');
