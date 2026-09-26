import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {WorldRouter} from './src/world/WorldRouter.js';

const context=new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))});
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>context})};

const bridge=readFileSync('./src/world/zones/FirstCampus8FBridgeEntry.js','utf8');
const main=readFileSync('./src/main.js','utf8');
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),null);

for(const [zoneId,prefix] of [['first_campus_4f','40'],['second_campus_5f','50']]){
  const zone=router.loadZone(zoneId);
  assert.equal(zone.layoutVersion,'USER_PLAN_20260923_IMAGE_V5_2');
  assert.equal(zone.layoutPlan.dualGate,true);
  assert.equal(zone.layoutPlan.nursingStationFourSideGlass,true);
  assert.equal(zone.layoutPlan.nursingStationLowerWallUpperGlass,true);
  assert.equal(zone.layoutPlan.patientRoomDoorType,'traditional_knob');
  assert.equal(zone.layoutPlan.bedPlaquesWallMounted,true);
  assert.equal(zone.layoutPlan.glassBypassDoor,true);
  assert.equal(zone.layoutPlan.stationWardDoor,true);
  assert.equal(zone.layoutPlan.stationWardDoorFaces,prefix+'6');
  assert.equal(zone.layoutPlan.entrancePlant,true);
  const firstCampus4F=zoneId==='first_campus_4f';
  assert.equal(zone.layoutPlan.bedCapacity,firstCampus4F?32:36);
  assert.deepEqual(zone.layoutPlan.bedLabels,['A','B','C','D']);
  assert.deepEqual(zone.layoutPlan.storage,['STORE_ENTRY']);
  assert.equal(zone.layoutPlan.allControlledDoorsDefaultClosed,true);

  const tag=zoneId.startsWith('first')?'first':'second';
  assert(zone.accessDoors[tag+'_ward']?.closed);
  assert(zone.accessDoors[tag+'_ward_inner']?.closed);
  const bypass=zone.accessDoors[tag+'_ward_glass'];
  assert(bypass?.closed);
  assert(bypass.leaves.every(leaf=>leaf.material.transparent),'Bypass door must be glass');

  const stationWard=zone.accessDoors[tag+'_station_ward'];
  assert(stationWard?.closed,'Missing station-to-ward door');
  assert.equal(zone.station.facesRoom,prefix+'6');
  assert.equal(zone.station.module,'NursingStation_V5_2_GLASS_BOX');
  assert.deepEqual(zone.station.entryDoor,[zone.planOrigin,0]);
  assert.equal(zone.station.wardDoorReaderSide,-1);
  assert.equal(stationWard.readerSide,-1,'Station ward reader must use the opposite jamb');

  const stationWorkstations=zone.workstations.filter(w=>w.id.startsWith(tag+'_station_'));
  assert.equal(stationWorkstations.length,4,'Nursing station must have four workstations');
  for(const ws of stationWorkstations){
    const screenPos=ws.screen.getWorldPosition(new THREE.Vector3());
    const towardChair=new THREE.Vector3(...ws.chair).sub(screenPos);towardChair.y=0;towardChair.normalize();
    const normal=new THREE.Vector3(0,0,1).applyQuaternion(ws.screen.getWorldQuaternion(new THREE.Quaternion()));
    normal.y=0;normal.normalize();
    assert(normal.dot(towardChair)>.95,ws.id+' monitor must face its chair');
    assert.equal(ws.deskYaw,ws.yaw,ws.id+' desk yaw metadata must match workstation yaw');
  }
  const clinicalIds=new Set(zone.clinicalProps.map(p=>p.id));
  for(const suffix of ['medication_cart','treatment_cart','iv_pole','iv_bag','medication_cabinet','syringe_tray','sharps_container','stethoscope','white_coat','bp_device','pulse_oximeter','supply_boxes']){
    assert(clinicalIds.has(tag+'_station_'+suffix),'Missing clinical prop '+suffix);
  }
  assert.equal(zone.station.clinicalPropIds.length,12);

  const wardRooms=zone.roomAreas.filter(r=>r.kind==='ward');
  assert.deepEqual(wardRooms.map(r=>r.id),Array.from({length:9},(_,i)=>`${prefix}${i+1}`));
  for(const room of wardRooms){
    assert(room.accessDoorId,'Ward room missing knob door');
    assert.equal(room.doorType,'knob');
    assert(zone.keyedDoors[room.accessDoorId]?.closed,room.id+' knob door must default closed');
    const beds=zone.bedAreas.filter(b=>b.roomId===room.id&&!b.anomalous);
    const expectedBeds=firstCampus4F&&room.id==='409'?0:4;
    assert.equal(beds.length,expectedBeds,room.id+' official bed count');
    assert.deepEqual(beds.map(b=>b.bedInRoom),expectedBeds?['A','B','C','D']:[]);
    assert.deepEqual(beds.map(b=>b.id),expectedBeds?['A','B','C','D'].map(letter=>room.id+letter):[]);
    for(const bed of beds){
      assert(['north','south','west','east'].includes(bed.plaque.wall));
      const [x1,z1,x2,z2]=room.rect;
      const onWall=Math.min(Math.abs(bed.plaque.x-x1),Math.abs(bed.plaque.x-x2),Math.abs(bed.plaque.z-z1),Math.abs(bed.plaque.z-z2))<.2;
      assert(onWall,bed.id+' plaque must be wall-mounted');
    }
  }
  assert.equal(zone.bedAreas.filter(b=>!b.anomalous).length,firstCampus4F?32:36);
  assert.equal(zone.bedAreas.length,firstCampus4F?32:36);
  if(firstCampus4F)assert(!zone.bedAreas.some(b=>b.wardBedNumber===33),'4F Bed 33 is narrative-only');
  else{
    const bed33=zone.bedAreas.find(b=>b.wardBedNumber===33);
    assert.equal(bed33.id,prefix+'9A');
    assert.equal(bed33.bedInRoom,'A');
  }

  const storage=zone.roomAreas.find(r=>r.id==='STORE_ENTRY');
  assert(storage?.accessDoorId);
  assert(zone.accessDoors[storage.accessDoorId]?.closed||zone.keyedDoors[storage.accessDoorId]?.closed);
  assert(zone.entrancePlant);

  if(firstCampus4F){
    const legacyActions=new Set(['DUTY_ROOM_PREP','WARD_ROUND','INSOMNIA_403']);
    assert(!zone.interactables.some(o=>!o?.isObject3D&&legacyActions.has(o?.action)),'legacy 4F proximity actions must be removed');
    const report=zone.interactables.find(o=>(o?.userData??o)?.id==='4F_NURSING_REPORT');
    assert(report&&!report.isObject3D,'4F report must use a non-rendered nursing-station proximity target');
    assert.equal(report.radius,2.1,'4F report target must cover the accessible counter approach');
    assert(zone.interactables.some(o=>o?.userData?.id==='408C_BED_PLAQUE'&&o?.userData?.action==='NORMAL_EVENT'),'408C task must live on the bed plaque');
    assert(zone.interactables.some(o=>o?.userData?.id==='4F_DUTY_COMPUTER'&&o?.userData?.action==='END_SHIFT'),'21:00 rest must live on the duty-room computer');
  }

  if(zoneId==='second_campus_5f'){
    assert(zone.roomAreas.some(r=>r.id==='SECOND_DUTY'&&r.label==='值班室'));
    assert(zone.accessDoors.second_duty_room?.closed);
    assert(!zone.roomAreas.some(r=>r.id==='DOCTOR'));
    const patient=zone.zoneGroup.getObjectByName('SecondCampus_ChestPainPatient');
    assert(patient?.isGroup,'M4 ordinary patient must have a visible scene model');
    assert(patient.getObjectByName('SecondCampus_ChestPainPatient_Face')?.isMesh,'M4 patient must include a face');
    assert(patient.getObjectByName('SecondCampus_ChestPainPatient_Wristband')?.isMesh,'M4 patient must include a wristband');
  }
}
assert.match(main,/STAFF_ACCESS_CARD/);
assert.doesNotMatch(bridge,/asset\(art,'bench'/);
console.log('USER FLOORPLAN V5.2 PASS: station route + glass bypass + x06 station door + credentialed room doors + A-D beds');
