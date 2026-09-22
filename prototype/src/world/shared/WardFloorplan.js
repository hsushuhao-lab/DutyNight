import * as THREE from 'three';
import { solid, asset, wallClock } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { PlanWalls, ordinaryRoom, nursingStationV5, workstation } from './PlanArchitecture.js';
import { AccessDoor } from './AccessDoor.js';
import { KeyedKnobDoor } from './KeyedKnobDoor.js';
import { CollisionFactory } from './CollisionFactory.js';
import { SignAnchor } from './SignAnchor.js';

/** September 22 V5 user floorplan. Units are gameplay metres, not a real hospital survey. */
export class WardFloorplan {
  constructor(scene,gf,{campus='first',floor=4}={}){
    Object.assign(this,{scene,gf,campus,floor});this.colliders=[];this.walkables=[];this.interactables=[];this.roomAreas=[];this.bedAreas=[];this.workstations=[];this.accessDoors={};
    this.layoutVersion='USER_PLAN_20260922_IMAGE_V5_1';this.activityHall=null;this.layoutPlan=null;
    this.zoneGroup=new THREE.Group();this.zoneGroup.name=`${campus}_${floor}F_PLAN_V5_1`;
  }
  build(){this.scene.add(this.zoneGroup);const second=this.campus==='second',o=second?72:0,walls=new PlanWalls(this);this.planOrigin=o;
    this.gf.buildFloor(this.zoneGroup,this.walkables,o,0,-10,24,24,this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup,o,3.2,-10,24,24);

    // V5.1: outer gate -> vestibule. Straight through the inner gate enters the nursing station.
    // From the vestibule, move right then turn left/north through the glass bypass into the ward.
    walls.rect(o-12,-22,o+12,2);walls.cut('x',2,o,2.4);
    walls.line('x',0,o-12,o+12);walls.cut('x',0,o,2.4);walls.cut('x',0,o+6.0,1.4);

    const room=(n,r,side,d,kind='ward',label)=>ordinaryRoom(this,walls,{id:String(this.floor*100+n),label,rect:[r[0]+o,r[1],r[2]+o,r[3]],side,door:d+(side==='north'||side==='south'?o:0),kind});
    const roomIds=Array.from({length:9},(_,i)=>String(this.floor*100+i+1));

    // V5 perimeter geometry: 401/501 bottom-left -> 403/503 upper-left,
    // 404/504–406/506 across the top, 407/507 upper-right -> 409/509 bottom-right.
    room(1,[-12,-6,-8,0],'east',-3);
    room(2,[-12,-12,-8,-6],'east',-9);
    room(3,[-12,-22,-8,-12],'east',-13);
    room(4,[-8,-22,-3,-16],'south',-5.5);
    room(5,[-3,-22,2,-16],'south',-.5);
    room(6,[2,-22,7,-16],'south',4.5);
    room(7,[7,-22,12,-12],'west',-13);
    room(8,[7,-12,12,-6],'west',-9);
    room(9,[7,-6,12,0],'west',-3);

    // Entrance vestibule storage room on the left, plant bay on the right.
    ordinaryRoom(this,walls,{id:'STORE_ENTRY',label:'儲藏室',rect:[o-12,0,o-7,2],side:'east',door:1,kind:'storage',protectedArea:false});
    const plant=asset(this.zoneGroup,'plant',[o+9.4,0,1],[1.15,1.15,1.15]);
    if(plant){plant.name=`${second?'Second':'First'}WardEntrancePlant`;plant.userData={...plant.userData,fixture:'WARD_ENTRY_PLANT'};}
    CollisionFactory.addBox(this.colliders,o+9.4,.45,1,.9,.9,.9);
    this.entrancePlant=[o+9.4,0,1];

    // Central station: the inner iron gate opens directly into it.
    nursingStationV5(this,{x:o,z:-4.3,id:second?'second_station':'first_station'});

    this.wardDoor=new AccessDoor(this,{id:second?'second_ward':'first_ward',x:o,z:2,width:2.4,title:'感應式鐵門'});
    this.innerWardDoor=new AccessDoor(this,{id:second?'second_ward_inner':'first_ward_inner',x:o,z:0,width:2.4,title:'感應式鐵門2'});
    this.glassBypassDoor=new AccessDoor(this,{id:second?'second_ward_glass':'first_ward_glass',x:o+6.0,z:0,width:1.4,title:'感應玻璃門',material:this.gf.materials.glass,readerSide:1});
    this.wardGateCollider=this.wardDoor.closedBox;this.wardGateClosed=true;this.innerWardGateClosed=true;this.glassBypassClosed=true;

    this.activityHall={id:'ACTIVITY_HALL',label:'病房公共區',bounds:[o-7,-16,o+7,0],center:[o,1.7,-13]};
    this.layoutVersion='USER_PLAN_20260922_IMAGE_V5_1';
    this.layoutPlan={
      rooms:roomIds,
      storage:['STORE_ENTRY'],
      centralStation:true,
      dualGate:true,
      glassBypassDoor:true,
      stationWardDoor:true,
      stationWardDoorFaces:roomIds[5],
      entrancePlant:true,
      bedCapacity:36,
      bedLabels:['A','B','C','D'],
      bed33Room:roomIds[8],
      bed33Id:roomIds[8]+'A',
      allControlledDoorsDefaultClosed:true,
      dutyRoomOutsideWard:true,
      narrowStationStrip:false
    };

    if(!second){
      this.buildDutyRoom();
    }else{
      this.buildSecondDutyRoom(o);
    }

    this.entryPoint=[o,1.7,3.2];this.vestibulePoint=[o,1.7,1];this.hallPoint=[o,1.7,-1.2];

    walls.build();
    // Solid sill spans the outer ward/core seam; no sub-pixel support crack at z=2.
    this.gf.buildFloor(this.zoneGroup,this.walkables,o,.002,2,2.4,.36,this.gf.materials.stainless);
    for(const [x,z] of [[o,1],[o,-12],[o-6,-4],[o+6,-4],[o,-18]]) this.gf.buildCeilingLight(this.zoneGroup,x,3.15,z,.7,8);
    SignAnchor.buildHangingSign({scene:this.zoneGroup,x:o,y:2.7,z:1.6,ceilingY:3.2,rotationY:0,text:second?`${this.floor}F 病房`:'4F 病房'});
    this.zoneGroup.updateWorldMatrix(true,true);return this;
  }
  buildDutyRoom(){
    const w=new PlanWalls(this);w.rect(-14,2,-8,10);w.cut('z',-8,6,1.4);
    this.gf.buildFloor(this.zoneGroup,this.walkables,-11,0,6,6,8,this.gf.materials.floorWood);
    this.gf.buildCeiling(this.zoneGroup,-11,3.2,6,6,8);
    this.dutyDoor=new KeyedKnobDoor(this,{id:'duty_room',x:-8,z:6,yaw:Math.PI/2,width:1.4,title:'醫師值班室'});
    this.dutyDoor.setClosed(true);this.dutyDoorClosed=true;
    asset(this.zoneGroup,'hospitalBed',[-12.5,0,7.8],[1.2,.95,.97]);CollisionFactory.addBox(this.colliders,-12.5,.45,7.8,1.4,.9,2.2);
    solid(this.zoneGroup,this.gf.materials.doorWood,[-11.25,.28,8.1],[.5,.56,.5]);
    solid(this.zoneGroup,this.gf.materials.lightWarm,[-11.25,.76,8.1],[.19,.24,.19]);
    workstation(this,{x:-10.0,z:3.1,id:'duty_desk'});
    this.dutyCabinetAnchor=[-8.8,0,9.3];this.dutyCabinetYaw=Math.PI;
    asset(this.zoneGroup,'storageCabinet',this.dutyCabinetAnchor,[1,1,1],this.dutyCabinetYaw);
    w.rect(-14,2,-11.5,5);w.cut('z',-11.5,4,1.2);
    solid(this.zoneGroup,this.gf.materials.bedSheet,[-13.4,.8,3],[.65,.25,.45]);
    solid(this.zoneGroup,this.gf.materials.metal,[-13.85,1.5,3],[.025,.75,.55]);
    w.build();this.gf.buildCeilingLight(this.zoneGroup,-11,3.15,6,.7,7,0xffebce);
    wallClock(this.zoneGroup,this.gf.materials,-10,2.1,2.15);
    this.dutyRoom={door:[-8,1.7,6],inside:[-9.5,1.7,6],outside:[-6.5,1.7,6],bounds:[-14,2,-8,10]};
    this.interactables.push(
      {type:'p1_action',action:'NURSE_REPORT',label:'向護理站報到',position:new THREE.Vector3(0,1.4,-4.3),radius:1.8},
      {type:'p1_action',action:'DUTY_ROOM_PREP',label:'整理值班室',position:new THREE.Vector3(-10.0,1.2,6.0),radius:1.8},
      {type:'p1_action',action:'WARD_ROUND',label:'完成晚間巡房',position:new THREE.Vector3(0,1.4,-12.0),radius:2.0},
      {type:'p1_action',action:'INSOMNIA_403',label:'評估 403 睡眠問題',position:new THREE.Vector3(-6.4,1.2,-17.0),radius:1.8},
      {type:'p1_action',action:'NORMAL_EVENT',label:'處理一般病房事件',position:new THREE.Vector3(5.8,1.2,-9.0),radius:1.8},
      {type:'p1_action',action:'REST',label:'短暫休息',position:new THREE.Vector3(-12.5,1.0,7.8),radius:1.8},
      {type:'p1_action',action:'END_SHIFT',label:'回值班室休息',position:new THREE.Vector3(-10.0,1.1,3.1),radius:1.8}
    );
  }
  buildSecondDutyRoom(o){
    const w=new PlanWalls(this);w.rect(o+8,2,o+14,10);w.cut('z',o+8,6,1.4);
    this.gf.buildFloor(this.zoneGroup,this.walkables,o+11,0,6,6,8,this.gf.materials.floorWood);
    this.gf.buildCeiling(this.zoneGroup,o+11,3.2,6,6,8);
    workstation(this,{x:o+11,z:3.5,id:'second_duty_desk'});
    const door=new AccessDoor(this,{id:'second_duty_room',x:o+8,z:6,yaw:Math.PI/2,width:1.4,title:'值班室'});door.setClosed(true);
    asset(this.zoneGroup,'hospitalBed',[o+12.3,0,7.7],[1.1,.95,.97]);CollisionFactory.addBox(this.colliders,o+12.3,.45,7.7,1.3,.9,2.1);
    asset(this.zoneGroup,'storageCabinet',[o+9.4,0,8.7],[1,1,1],Math.PI);
    w.build();this.gf.buildCeilingLight(this.zoneGroup,o+11,3.15,6,.75,7);
    this.roomAreas.push({id:'SECOND_DUTY',label:'值班室',point:[o+9.5,1.7,6],door:[o+8,1.7,6],corridor:[o+6.5,1.7,6],protectedArea:false,kind:'duty_room',accessDoorId:'second_duty_room'});
  }
  setWardGateClosed(closed){this.wardDoor.setClosed(closed);this.wardGateClosed=closed;}
  setInnerWardGateClosed(closed){if(this.innerWardDoor)this.innerWardDoor.setClosed(closed);this.innerWardGateClosed=closed;}
  setGlassBypassClosed(closed){if(this.glassBypassDoor)this.glassBypassDoor.setClosed(closed);this.glassBypassClosed=closed;}
  toggleWardGate(p){const ok=this.wardDoor.toggle(p);this.wardGateClosed=this.wardDoor.closed;return ok;}
  setDutyDoorClosed(closed){if(this.dutyDoor)this.dutyDoor.setClosed(closed);this.dutyDoorClosed=closed;}
  toggleDutyDoor(p){if(!this.dutyDoor)return false;const ok=this.dutyDoor.toggle(p);this.dutyDoorClosed=this.dutyDoor.closed;return ok;}
  cleanup(){this.scene.remove(this.zoneGroup);disposeZoneArt(this.zoneGroup);this.colliders=[];this.walkables=[];this.interactables=[];this.roomAreas=[];this.bedAreas=[];this.workstations=[];this.accessDoors={};}
}
