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
  assert(zone.guardPost,'visible old 1F guard post missing');
  assert(zone.zoneGroup.getObjectByName('OldGuardPost_CCTVMonitor'),'guard post CCTV monitor missing');
  assert(zone.zoneGroup.getObjectByName('OldGuardPost_NightLogbook'),'guard post night logbook missing');
  assert(zone.hiddenServiceDoor&&zone.guardPost.serviceDoor===zone.hiddenServiceDoor.id,'hidden service route must sit behind the old guard post');
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
    {label:'triage/nursing station',points:[[-4,1.7,0],[1,1.7,0],[3.5,1.7,0],[3.5,1.7,2.65]]},
    {label:'treatment-room threshold',points:[[-4,1.7,0],[1,1.7,0],[3.5,1.7,0],[3.5,1.7,-3.0]]},
    {label:'doctor-office threshold',points:[[8,1.7,0],[12.5,1.7,0],[12.5,1.7,-3.0]]},
    {label:'observation area threshold',points:[[8,1.7,0],[14.5,1.7,0],[14.5,1.7,3.0]]},
  ];
  for(const route of routes){
    for(let i=1;i<route.points.length;i++){
      const result=CollisionFactory.testTraversal(zone.colliders,route.points[i-1],route.points[i],.30,60);
      assert.equal(result.passable,true,`2F authorized route blocked: ${route.label} segment ${i}`);
    }
  }
  zone.cleanup(); assert.equal(scene.children.length,0);
}

console.log('FIRST CAMPUS ACCESS QA PASS: 1F glass night closures + authorized 2F essential ER routes');
