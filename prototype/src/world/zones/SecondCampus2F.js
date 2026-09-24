import { AccessDoor } from '../shared/AccessDoor.js';
// SecondCampus2F.js - Milestone M9: Second Campus 2F Special Bridge Landing & Gallery
import * as THREE from 'three';
import { artRoot, solid, asset, monitor, counterFront, wallTrim } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { Doorway } from '../shared/Doorway.js';
import { SignAnchor } from '../shared/SignAnchor.js';
import { CollisionFactory } from '../shared/CollisionFactory.js';

export class SecondCampus2F {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.roomAreas = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'SecondCampus2F_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);
    this.art = artRoot(this.zoneGroup, 'SecondCampus2F');

    // ==========================================
    // 1. BRIDGE ARRIVAL GALLERY FLOOR & CEILING (x: 60 to 80, z: -4.5 to 4.5)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 70, 0, 0, 20, 9, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, 70, 3.2, 0, 20, 9);

    // North wall
    this.gf.buildWall(this.zoneGroup,this.colliders,65.2,1.6,4.5,10.4,3.2,.4);
    this.gf.buildWall(this.zoneGroup,this.colliders,76.8,1.6,4.5,6.4,3.2,.4);
    // South wall
    for (const [x, width] of [[62.65,5.3],[70,6.6],[77.35,5.3]]) {
      this.gf.buildWall(this.zoneGroup, this.colliders, x, 1.6, -4.5, width, 3.2, .4);
    }
    for (const [index, x] of [66,74].entries()) {
      this.gf.buildFloor(this.zoneGroup, this.walkables, x, 0, -7.5, 8.04, 6.04);
      this.gf.buildCeiling(this.zoneGroup, x, 3.2, -7.5, 8, 6);
      this.gf.buildWall(this.zoneGroup, this.colliders, x, 1.6, -10.5, 8, 3.2, .4);
      for(const side of [-1,1])this.gf.buildWall(this.zoneGroup, this.colliders, x+side*4, 1.6, -7.5, .4, 3.2, 6);
      Doorway.build({scene:this.zoneGroup,colliders:this.colliders,x,z:-4.5,width:1.4,height:2.4,wallHeight:3.2,isAlongX:true,isOpen:true,doorMaterial:this.gf.materials.doorWood});
      const code = index === 0 ? '201' : '202';
      const label = index === 0 ? '警衛休息室' : '安檢監控支援室';
      SignAnchor.buildWallPlaque({scene:this.zoneGroup,x:x-1.25,y:1.9,z:-4.28,rotationY:0,code,title:label,subtitle:'',header:'第二院區 2F'});
      asset(this.art, 'workDesk', [x+2, 0, -9]);
      CollisionFactory.addBox(this.colliders, x+2, .55, -9, 1.5, 1.1, .8);
      this.gf.buildCeilingLight(this.zoneGroup,x,3.15,-7.5);
      this.roomAreas.push({id:code,label,point:[x,1.7,-7.5],door:[x,1.7,-4.5],corridor:[x,1.7,0]});
    }

    // West wall with bridge entrance portal (at x = 60)
    // Left segment (z: -4.5 to -1.4)
    this.gf.buildWall(this.zoneGroup, this.colliders, 60.0, 1.6, -2.95, 0.4, 3.2, 3.1);
    // Right segment (z: 1.4 to 4.5)
    this.gf.buildWall(this.zoneGroup, this.colliders, 60.0, 1.6, 2.95, 0.4, 3.2, 3.1);

    // Bridge portal doorway
    Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 60.0,
      y: 0,
      z: 0.0,
      width: 2.8,
      height: 2.5,
      wallHeight: 3.2,
      wallThickness: 0.4,
      isAlongX: false,
      isOpen: true,
      frameMaterial: this.gf.materials.metal
    });

    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: 63.0,
      y: 2.65,
      z: 0,
      ceilingY: 3.2,
      rotationY: Math.PI / 2,
      text: '◀ 第二院區 2F 連通道管制大廳 ｜ 警衛室・電梯・樓梯往 1F ▶'
    });

    // ==========================================
    // 2. BRIDGE SECURITY & ACCESS CONTROL STATION (No nursing station on 2F)
    // ==========================================
    const counterBody = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.1, 0.8),
      this.gf.materials.wallDark
    );
    counterBody.position.set(67.0, 0.55, 3.2);
    this.zoneGroup.add(counterBody);

    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.08, 0.95),
      this.gf.materials.counterTop
    );
    counterTop.position.set(67.0, 1.14, 3.2);
    this.zoneGroup.add(counterTop);
    CollisionFactory.addBox(this.colliders, 67.0, 0.6, 3.2, 4.4, 1.2, 0.95);

    // Security monitor on counter facing inward (+Z toward back wall)
    monitor(this.art, this.gf.materials, 67.0, 1.18, 3.2, 0);

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 67.0,
      y: 2.2,
      z: 4.28,
      rotationY: Math.PI,
      code: 'SEC-2',
      title: '2F 連通道警衛室 ｜ 出入口管制台',
      subtitle: 'BRIDGE SECURITY & ACCESS CONTROL',
      header: '青嶺醫療中心 ｜ 第二院區 2F'
    });

    // ==========================================
    // 3. ELEVATOR & STAIR CORE (at East wall x = 80)
    // ==========================================
    this.gf.buildWall(this.zoneGroup,this.colliders,80,1.6,0,.4,3.2,9);

    // Ceiling lights
    this.gf.buildCeilingLight(this.zoneGroup, 65, 3.15, 0, 0.8, 7.5);
    this.gf.buildCeilingLight(this.zoneGroup, 75, 3.15, 0, 0.8, 7.5);

    const art = this.art;
    counterFront(art, this.gf.materials, 67, 2.78, 4.2, 1.1);
    asset(art, 'bench', [70, 0, -3.85]);
    asset(art,'plant',[61.4,0,3.65]);
    const oldBridgeDoor=this.zoneGroup.getObjectByName('Doorway_60_0');
    for(const leaf of oldBridgeDoor.children)if(leaf.geometry?.parameters.height===2.35||leaf.geometry?.parameters.height===2.45)leaf.visible=false;
    new AccessDoor(this,{id:'BRIDGE_ACCESS',x:60,z:0,yaw:Math.PI/2,width:2.8,title:'天橋感應門',portal:'bridge_from_second'});
    wallTrim(this.zoneGroup,this.gf.materials);
    return this;
  }

  cleanup() {
    if (this.zoneGroup) {
      this.scene.remove(this.zoneGroup);
      disposeZoneArt(this.zoneGroup);
    }
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.roomAreas = [];
  }
}
