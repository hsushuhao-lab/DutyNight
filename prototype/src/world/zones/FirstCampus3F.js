// FirstCampus3F.js - Milestone M0: First Campus 3F Doctor Administrative Area & Room 316
import * as THREE from 'three';
import { gameState } from '../../core/GameState.js';
import { buildRoomWing } from '../shared/RoomWing.js';
import { Level3FBlockout } from '../Level3FBlockout.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { applyFirstFloorArt } from '../../art/FirstFloorArt.js';
import { applyAct1CollisionHotfix } from '../CollisionHotfix.js';
import { AccessDoor } from '../shared/AccessDoor.js';
import { asset, solid } from '../../art/ArtDetails.js';

export class FirstCampus3F {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.geometryFactory = geometryFactory;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'FirstCampus3F_Zone';
    this.levelInstance = null;
  }

  build() {
    this.scene.add(this.zoneGroup);
    // Pass zoneGroup so all meshes, lights, signs are children of zoneGroup, not global scene
    this.levelInstance = new Level3FBlockout(this.zoneGroup);
    applyAct1CollisionHotfix(this.levelInstance);
    applyFirstFloorArt(this.levelInstance);

    this.colliders = this.levelInstance.colliders;
    this.walkables = this.levelInstance.walkables;
    this.interactables = this.levelInstance.interactables;

    buildRoomWing(this,{x:16,z:0,rooms:[
      {code:'3F_ARCHIVE',label:'文件保管室',kind:'office'},
    ]});
    this.accessDoors={};
    this.archiveDoor=new AccessDoor(this,{id:'3F_ARCHIVE_DOOR',x:16,z:0,yaw:Math.PI/2,width:2.4,title:'文件保管室',material:this.gf.materials.doorWood,readerSide:-1});
    this.archiveDoor.setClosed(true);
    const archiveX=19,archiveZ=-2.8;
    for(const dx of [-1.7,0,1.7])asset(this.zoneGroup,'storageCabinet',[archiveX+dx,0,archiveZ],[.9,1,1],0);
    solid(this.zoneGroup,this.gf.materials.wallDark,[archiveX,1.35,-5.25],[3.9,1.65,.08]);
    const lore=document.createElement('canvas');lore.width=900;lore.height=420;const ctx=lore.getContext('2d');
    ctx.fillStyle='#d8d0bc';ctx.fillRect(0,0,900,420);ctx.fillStyle='#4a2f28';ctx.font='bold 38px sans-serif';ctx.fillText('文件保管室｜封存索引',34,58);
    ctx.font='25px sans-serif';ctx.fillStyle='#302b27';['舊院區工程紀錄：部分樓層圖缺頁','夜間值班異常紀錄：1998–2007','封存照片：來源未註記','地下連通空間：查無正式竣工圖'].forEach((t,i)=>ctx.fillText('• '+t,48,125+i*66));
    const tex=new THREE.CanvasTexture(lore);tex.colorSpace=THREE.SRGBColorSpace;
    const board=new THREE.Mesh(new THREE.PlaneGeometry(3.75,1.55),new THREE.MeshStandardMaterial({map:tex,roughness:.95}));board.position.set(archiveX,1.35,-5.20);this.zoneGroup.add(board);
    this.secretArchive={id:'3F_ARCHIVE',doorId:'3F_ARCHIVE_DOOR',requires:'STAFF_ACCESS_CARD',lore:['missing_floorplans','night_anomaly_records','unlabelled_photos','undocumented_sublevel']};

    // References for gameplay state
    this.keyMesh = this.levelInstance.keyMesh;
    this.workstationMesh = this.levelInstance.workstationMesh;
    this.dutyLogMesh = this.levelInstance.dutyLogMesh;
    this.elevatorLight = this.levelInstance.elevatorLight;
    const keyAvailable = !gameState.isTaskComplete('KEY_PICKUP');
    this.keyMesh.visible = keyAvailable;
    this.keyMesh.userData.targetGroup.visible = keyAvailable;
    this.keyMesh.userData.interactable = keyAvailable;
    this.updateElevatorLight(gameState.areRequiredTasksComplete());

    return this;
  }

  updateElevatorLight(isReady) {
    if (this.levelInstance) {
      this.levelInstance.updateElevatorLight(isReady);
    }
  }

  cleanup() {
    if (this.zoneGroup) {
      this.scene.remove(this.zoneGroup);
      disposeZoneArt(this.zoneGroup);
    }
    this.levelInstance = null;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
  }
}
