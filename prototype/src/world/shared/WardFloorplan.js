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
    const room=(n,r,side,d,kind='ward',label)=>ordinaryRoom(this,walls,{id:String(this.floor*100+n),label,rect:[r[0]+o,r[1],r[2]+o,r[3]],side,door:d+(side==='north'||side==='south'?o:0),kind});    if(!second){

      // =========================================================
      // 第一院區 4F — IMAGE PLAN V4
      // 外圈病房 + 上方儲藏室 + 中央護理站
      // =========================================================

      // 左側：401–403
      room(1,[-12,-5,-7,0],'east',-2.5);
      room(2,[-12,-11,-7,-5],'east',-8);
      room(3,[-12,-17,-7,-11],'east',-14);

      // 左上儲藏室
      ordinaryRoom(this,walls,{
        id:'STORE_NW',
        label:'儲藏室',
        rect:[-12,-22,-7,-17],
        side:'south',
        door:-9.5,
        kind:'storage'
      });

      // 上方中央：404–406
      room(4,[-7,-22,-2.5,-17],'south',-4.75);
      room(5,[-2.5,-22,2,-17],'south',-0.25);
      room(6,[2,-22,6.5,-17],'south',4.25);

      // 右上儲藏室
      ordinaryRoom(this,walls,{
        id:'STORE_NE',
        label:'儲藏室',
        rect:[6.5,-22,12,-17],
        side:'south',
        door:9.25,
        kind:'storage'
      });

      // 右側：407–409
      room(7,[7,-17,12,-11],'west',-14);
      room(8,[7,-11,12,-5],'west',-8);
      room(9,[7,-5,12,0],'west',-2.5);

      // 中央護理站
      nursingStation(this,{
        x:0,
        z:-7,
        yaw:Math.PI,
        id:'first_station'
      });

      // 保留中央環形公共動線 metadata，不顯示「活動大廳」招牌
      this.activityHall={
        id:'ACTIVITY_HALL',
        label:'病房公共區',
        bounds:[-6,-17,6,-2],
        center:[0,1.7,-10]
      };

      this.layoutVersion='USER_PLAN_20260922_IMAGE_V4';

      this.layoutPlan={
        rooms:['401','402','403','404','405','406','407','408','409'],
        storage:['STORE_NW','STORE_NE'],
        centralStation:true,
        dutyRoomOutsideWard:true,
        narrowStationStrip:false
      };

      // 值班室在病房鐵門外
      this.buildDutyRoom();

      // 中央感應鐵門
      this.wardDoor=new AccessDoor(this,{
        id:'first_ward',
        x:0,
        z:2,
        width:2.4,
        title:'4F 病房'
      });

      this.wardGateCollider=this.wardDoor.closedBox;
      this.wardGateClosed=true;

      this.entryPoint=[0,1.7,3.2];
      this.hallPoint=[0,1.7,-4];

    }else{

      // =========================================================
      // 第二院區 5F — IMAGE PLAN V4
      // 外圈病房 + 上方儲藏室 + 中央護理站
      // =========================================================

      // 左側：501–503
      room(1,[-12,-5,-7,0],'east',-2.5);
      room(2,[-12,-11,-7,-5],'east',-8);
      room(3,[-12,-17,-7,-11],'east',-14);

      // 左上儲藏室
      ordinaryRoom(this,walls,{
        id:'STORE_NW',
        label:'儲藏室',
        rect:[o-12,-22,o-7,-17],
        side:'south',
        door:o-9.5,
        kind:'storage'
      });

      // 上方中央：504–506
      room(4,[-7,-22,-2.5,-17],'south',-4.75);
      room(5,[-2.5,-22,2,-17],'south',-0.25);
      room(6,[2,-22,6.5,-17],'south',4.25);

      // 右上儲藏室
      ordinaryRoom(this,walls,{
        id:'STORE_NE',
        label:'儲藏室',
        rect:[o+6.5,-22,o+12,-17],
        side:'south',
        door:o+9.25,
        kind:'storage'
      });

      // 右側：507–509
      room(7,[7,-17,12,-11],'west',-14);
      room(8,[7,-11,12,-5],'west',-8);
      room(9,[7,-5,12,0],'west',-2.5);

      // 中央護理站
      nursingStation(this,{
        x:o,
        z:-7,
        yaw:Math.PI,
        id:'second_station',
        rearEntry:true
      });

      this.activityHall={
        id:'ACTIVITY_HALL',
        label:'病房公共區',
        bounds:[o-6,-17,o+6,-2],
        center:[o,1.7,-10]
      };

      this.layoutVersion='USER_PLAN_20260922_IMAGE_V4';

      this.layoutPlan={
        rooms:['501','502','503','504','505','506','507','508','509'],
        storage:['STORE_NW','STORE_NE'],
        centralStation:true,
        doctorOfficeOutsideWard:true,
        narrowStationStrip:false
      };

      // 中央感應鐵門
      this.wardDoor=new AccessDoor(this,{
        id:'second_ward',
        x:o,
        z:2,
        width:2.4,
        title:`${this.floor}F 病房`
      });

      this.wardGateCollider=this.wardDoor.closedBox;
      this.wardGateClosed=true;

      this.entryPoint=[o,1.7,3.2];
      this.hallPoint=[o,1.7,-4];

      // 右下辦公室
      this.buildDoctorOffice(o);
    }

    walls.build();
    // Solid sill spans the coplanar floor seam; no sub-pixel support crack at z=2.
    this.gf.buildFloor(this.zoneGroup,this.walkables,o,.002,2,2.4,.36,this.gf.materials.stainless);
    for(const [x,z] of [[o,1],[o,-9],[o,-15],[o-4,-3],[o+4,-3]]) this.gf.buildCeilingLight(this.zoneGroup,x,3.15,z,.7,8);
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
    // Bathroom with a real doorway, not a sealed alcove.
    w.rect(-14,2,-11.5,5);w.cut('z',-11.5,4,1.2);
    solid(this.zoneGroup,this.gf.materials.bedSheet,[-13.4,.8,3],[.65,.25,.45]);
    solid(this.zoneGroup,this.gf.materials.metal,[-13.85,1.5,3],[.025,.75,.55]);
    w.build();this.gf.buildCeilingLight(this.zoneGroup,-11,3.15,6,.7,7,0xffebce);
    wallClock(this.zoneGroup,this.gf.materials,-10,2.1,2.15);
    this.dutyRoom={door:[-8,1.7,6],inside:[-9.5,1.7,6],outside:[-6.5,1.7,6],bounds:[-14,2,-8,10]};
    this.interactables.push(
      {type:'p1_action',action:'NURSE_REPORT',label:'向護理站報到',position:new THREE.Vector3(0,1.4,-5.3),radius:1.8},
      {type:'p1_action',action:'DUTY_ROOM_PREP',label:'整理值班室',position:new THREE.Vector3(-10.0,1.2,6.0),radius:1.8},
      {type:'p1_action',action:'WARD_ROUND',label:'完成晚間巡房',position:new THREE.Vector3(0,1.4,-15.0),radius:2.0},
      {type:'p1_action',action:'INSOMNIA_403',label:'評估 403 睡眠問題',position:new THREE.Vector3(-5.5,1.2,-14.0),radius:1.8},
      {type:'p1_action',action:'NORMAL_EVENT',label:'處理一般病房事件',position:new THREE.Vector3(5.5,1.2,-8.0),radius:1.8},
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
