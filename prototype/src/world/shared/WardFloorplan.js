import * as THREE from 'three';
import { solid, asset, wallClock } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { PlanWalls, ordinaryRoom, nursingStation, workstation } from './PlanArchitecture.js';
import { AccessDoor } from './AccessDoor.js';
import { KeyedKnobDoor } from './KeyedKnobDoor.js';
import { CollisionFactory } from './CollisionFactory.js';
import { SignAnchor } from './SignAnchor.js';

/** September 20 user sketch. Units are gameplay metres, not a real hospital survey. */
export class WardFloorplan {
  constructor(scene,gf,{campus='first',floor=4}={}){
    Object.assign(this,{scene,gf,campus,floor});this.colliders=[];this.walkables=[];this.interactables=[];this.roomAreas=[];this.workstations=[];this.accessDoors={};
    this.layoutVersion='USER_PLAN_20260921_V2';this.activityHall=null;this.layoutPlan=null;
    this.zoneGroup=new THREE.Group();this.zoneGroup.name=`${campus}_${floor}F_PLAN_20260920`;
  }
  build(){this.scene.add(this.zoneGroup);const second=this.campus==='second',o=second?72:0,walls=new PlanWalls(this);this.planOrigin=o;
    this.gf.buildFloor(this.zoneGroup,this.walkables,o,0,-10,24,24,this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup,o,3.2,-10,24,24);
    walls.rect(o-12,-22,o+12,2);walls.cut('x',2,o,2.4);
    // A single admission boundary at z=2. The previous parallel z=0 wall made an unintended corridor.
    const room=(n,r,side,d,kind='ward',label)=>ordinaryRoom(this,walls,{id:String(this.floor*100+n),label,rect:[r[0]+o,r[1],r[2]+o,r[3]],side,door:d+(side==='north'||side==='south'?o:0),kind});
    if(!second){
      room(1,[-12,-4,-6,0],'east',-2);
      room(2,[-12,-9,-6,-4],'east',-6.5);
      room(3,[-12,-14,-6,-9],'east',-11.5);
      ordinaryRoom(this,walls,{id:'WC',label:'性別友善廁所',rect:[-12,-22,-6,-14],side:'east',door:-15.5,kind:'toilet'});
      room(4,[-6,-22,-1.5,-17],'south',-3.75);
      room(5,[-1.5,-22,3,-17],'south',.75);
      room(6,[3,-22,7.5,-17],'south',5.25);
      room(7,[7.5,-22,12,-17],'south',9.75);
      room(8,[5,-14,12,-10],'west',-12);
      room(9,[5,-10,12,-6],'west',-8);
      // Protected station sits directly against the ward hall. No extra parallel strip beside it.
      nursingStation(this,{x:3.2,z:-3,yaw:Math.PI/2,id:'first_station'});
      walls.line('x',-6,3.8,12);
      // User-approved 4F plan: 401-403 + WC on west, 404-407 south,
      // 408-409 east, with one open central activity hall and no side-strip corridor.
      this.activityHall={id:'ACTIVITY_HALL',label:'活動大廳',bounds:[-5.2,-16.8,4.8,-6.3],center:[0,1.7,-11.6]};
      this.layoutPlan={rooms:['401','402','403','WC','404','405','406','407','408','409'],entrySequence:['duty_room','first_ward','first_station','activity_hall'],dutyRoomOutsideWard:true,narrowStationStrip:false};
      SignAnchor.buildHangingSign({scene:this.zoneGroup,x:0,y:2.66,z:-15.8,ceilingY:3.2,rotationY:0,text:'活動大廳'});
      this.buildDutyRoom();
      this.wardDoor=new AccessDoor(this,{id:'first_ward',x:0,z:2,width:2.4,title:'4F 病房'});
      this.wardGateCollider=this.wardDoor.closedBox;this.wardGateClosed=true;
      this.entryPoint=[0,1.7,3.2];this.hallPoint=[0,1.7,-3];
    }else{
      room(1,[-12,-5,-6,0],'east',-2.5);
      room(2,[-12,-12,-6,-5],'east',-8.5);
      room(3,[-12,-17,-6,-12],'east',-14.5);
      // Unlabelled north-west block in source remains sealed and unnamed.
      walls.rect(o-12,-22,o-4,-17);
      room(4,[-4,-22,.5,-17],'south',-1.75);
      room(5,[.5,-22,5,-17],'south',2.75);
      room(6,[5,-22,12,-17],'south',8.5);
      room(7,[6,-17,12,-10],'west',-13.5);
      room(8,[6,-10,12,-6],'west',-8);
      room(9,[6,-6,12,0],'west',-3);
      // Keep 3 m on the west: open ward leaves project into this circulation lane.
      // User-approved 5F route is: ward gate -> protected nursing station -> staff card door
      // -> activity hall -> 501-509. The north-west sealed block remains deliberately unnamed.
      nursingStation(this,{x:o,z:-4,yaw:0,id:'second_station',rearEntry:true});
      this.activityHall={id:'ACTIVITY_HALL',label:'活動大廳',bounds:[o-5,-16.8,o+5,-6.3],center:[o,1.7,-11.6]};
      this.layoutPlan={rooms:['501','502','503','504','505','506','507','508','509'],entrySequence:['second_ward','second_station','second_station_staff','activity_hall'],doctorOfficeOutsideWard:true,unnamedNorthwestBlock:true};
      SignAnchor.buildHangingSign({scene:this.zoneGroup,x:o,y:2.66,z:-15.8,ceilingY:3.2,rotationY:0,text:'活動大廳'});
      this.wardDoor=new AccessDoor(this,{id:'second_ward',x:o,z:2,width:2.4,title:`${this.floor}F 病房`});
      this.wardGateCollider=this.wardDoor.closedBox;this.wardGateClosed=true;
      this.entryPoint=[o,1.7,3.2];this.hallPoint=[o+4.4,1.7,-8];
      this.buildDoctorOffice(o);
    }
    walls.build();
    // Solid sill spans the coplanar floor seam; no sub-pixel support crack at z=2.
    this.gf.buildFloor(this.zoneGroup,this.walkables,o,.002,2,2.4,.36,this.gf.materials.stainless);
    for(const [x,z] of [[o,1],[o,-9],[o,-15],[o-4,-3],[o+4,-3]]) this.gf.buildCeilingLight(this.zoneGroup,x,3.15,z,.7,8);
    SignAnchor.buildHangingSign({scene:this.zoneGroup,x:o,y:2.7,z:1.6,ceilingY:3.2,rotationY:0,text:second?`${this.floor}F 病房`:'4F 病房'});
    SignAnchor.buildWallPlaque({scene:this.zoneGroup,x:o,y:2.6,z:-21.85,width:1.6,height:.35,code:'',title:'活動大廳',subtitle:'',header:''});
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
    // Bathroom with a real doorway, not a sealed alcove.
    w.rect(-14,2,-11.5,5);w.cut('z',-11.5,4,1.2);
    solid(this.zoneGroup,this.gf.materials.bedSheet,[-13.4,.8,3],[.65,.25,.45]);
    solid(this.zoneGroup,this.gf.materials.metal,[-13.85,1.5,3],[.025,.75,.55]);
    w.build();this.gf.buildCeilingLight(this.zoneGroup,-11,3.15,6,.7,7,0xffebce);
    wallClock(this.zoneGroup,this.gf.materials,-10,2.1,2.15);
    this.dutyRoom={door:[-8,1.7,6],inside:[-9.5,1.7,6],outside:[-6.5,1.7,6],bounds:[-14,2,-8,10]};
    this.interactables.push(
      {type:'p1_action',action:'NURSE_REPORT',label:'向護理站報到',position:new THREE.Vector3(1.6,1.4,-3.0),radius:1.8},
      {type:'p1_action',action:'DUTY_ROOM_PREP',label:'整理值班室',position:new THREE.Vector3(-10.0,1.2,6.0),radius:1.8},
      {type:'p1_action',action:'WARD_ROUND',label:'完成晚間巡房',position:new THREE.Vector3(0,1.4,-10.0),radius:2.0},
      {type:'p1_action',action:'INSOMNIA_403',label:'評估 403 睡眠問題',position:new THREE.Vector3(-6.2,1.2,-11.5),radius:1.8},
      {type:'p1_action',action:'NORMAL_EVENT',label:'處理一般病房事件',position:new THREE.Vector3(5.4,1.2,-12.0),radius:1.8},
      {type:'p1_action',action:'REST',label:'短暫休息',position:new THREE.Vector3(-12.5,1.0,7.8),radius:1.8},
      {type:'p1_action',action:'END_SHIFT',label:'回值班室休息',position:new THREE.Vector3(-10.0,1.1,3.1),radius:1.8}
    );
  }
  buildDoctorOffice(o){
    const w=new PlanWalls(this);w.rect(o+8,2,o+14,10);w.cut('z',o+8,6,1.4);
    this.gf.buildFloor(this.zoneGroup,this.walkables,o+11,0,6,6,8,this.gf.materials.floor);
    this.gf.buildCeiling(this.zoneGroup,o+11,3.2,6,6,8);
    workstation(this,{x:o+11,z:3.5,id:'second_doctor'});
    new AccessDoor(this,{id:'doctor_office',x:o+8,z:6,yaw:Math.PI/2,width:1.4,title:'醫師辦公室'}).setClosed(true);
    w.build();this.gf.buildCeilingLight(this.zoneGroup,o+11,3.15,6,.75,7);
    this.roomAreas.push({id:'DOCTOR',label:'醫師辦公室',point:[o+9.5,1.7,6],door:[o+8,1.7,6],corridor:[o+6.5,1.7,6],protectedArea:false,kind:'office'});
  }
  setWardGateClosed(closed){this.wardDoor.setClosed(closed);this.wardGateClosed=closed;}
  toggleWardGate(p){const ok=this.wardDoor.toggle(p);this.wardGateClosed=this.wardDoor.closed;return ok;}
  setDutyDoorClosed(closed){if(this.dutyDoor)this.dutyDoor.setClosed(closed);this.dutyDoorClosed=closed;}
  toggleDutyDoor(p){if(!this.dutyDoor)return false;const ok=this.dutyDoor.toggle(p);this.dutyDoorClosed=this.dutyDoor.closed;return ok;}
  cleanup(){this.scene.remove(this.zoneGroup);disposeZoneArt(this.zoneGroup);this.colliders=[];this.walkables=[];this.interactables=[];this.roomAreas=[];this.workstations=[];this.accessDoors={};}
}
