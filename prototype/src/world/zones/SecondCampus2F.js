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

    // ==========================================
    // 1. BRIDGE ARRIVAL GALLERY FLOOR & CEILING (x: 60 to 80, z: -4.5 to 4.5)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 70, 0, 0, 20, 9, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, 70, 3.2, 0, 20, 9);

    // North wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 70, 1.6, 4.5, 20, 3.2, 0.4);
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
      const label = index === 0 ? '病房' : '醫師辦公室／支援室';
      SignAnchor.buildWallPlaque({scene:this.zoneGroup,x:x-1.25,y:1.9,z:-4.28,rotationY:0,code,title:label,subtitle:'',header:'第二院區 2F'});
      asset(this.zoneGroup,index===0?'hospitalBed':'workDesk',[x+2,0,-9]);
      CollisionFactory.addBox(this.colliders,x+2,.55,-9,index===0?1.15:1.5,1.1,index===0?2.15:.8);
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
      text: '◀ 第二院區 2F 連通道大廳 ｜ 電梯・樓梯往 1F 山側出入口 ▶'
    });

    // ==========================================
    // 2. CHECK-IN / LIAISON COUNTER (Special 2F layout, not standard ward station)
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

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 67.0,
      y: 2.2,
      z: 4.28,
      rotationY: Math.PI,
      code: '2F',
      title: '2F 護理站／跨院區聯絡',
      subtitle: 'NURSING & CAMPUS LIAISON',
      header: '松德醫療中心 ｜ 第二院區 2F'
    });

    // ==========================================
    // 3. ELEVATOR & STAIR CORE (at East wall x = 80)
    // ==========================================
    // Wall segment south of stair door (z: -4.5 to 1.2)
    this.gf.buildWall(this.zoneGroup, this.colliders, 80.0, 1.6, -1.65, 0.4, 3.2, 5.7);
    // Wall segment north of stair door (z: 2.4 to 4.5)
    this.gf.buildWall(this.zoneGroup, this.colliders, 80.0, 1.6, 3.45, 0.4, 3.2, 2.1);

    // Elevator doors
    const elFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 2.4), this.gf.materials.metal);
    elFrame.position.set(79.75, 1.25, -1.8);
    this.zoneGroup.add(elFrame);
    const elDoors = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 2.0), this.gf.materials.stainless);
    elDoors.position.set(79.65, 1.25, -1.8);
    this.zoneGroup.add(elDoors);

    // Stairwell door to 1F exit (opening from z = 1.2 to 2.4)
    Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 80.0,
      y: 0,
      z: 1.8,
      width: 1.2,
      height: 2.4,
      wallHeight: 3.2,
      wallThickness: 0.4,
      isAlongX: false,
      isOpen: true,
      doorMaterial: this.gf.materials.metal
    });

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 79.79,
      y: 2.3,
      z: 3.0,
      rotationY: -Math.PI / 2,
      code: 'STAIR',
      title: '安全梯（通往 1F 山側出口）',
      subtitle: 'STAIRWELL TO 1F EXIT',
      header: '第二院區'
    });

    // Ceiling lights
    this.gf.buildCeilingLight(this.zoneGroup, 65, 3.15, 0, 0.8, 7.5);
    this.gf.buildCeilingLight(this.zoneGroup, 75, 3.15, 0, 0.8, 7.5);

    const art=artRoot(this.zoneGroup,'SecondCampus2F');

    counterFront(art,this.gf.materials,67,2.78,4.2,1.1);
    monitor(art,this.gf.materials,66.5,1.18,3.2,Math.PI);
    asset(art,'bench',[70,0,-3.85]);
    asset(art,'plant',[61.4,0,3.65]);
    solid(art,this.gf.materials.metal,[79.58,1.25,-1.8],[.03,2.3,.012]);
    for(const z of [-2.8,-.8])solid(art,this.gf.materials.metal,[79.55,1.25,z],[.08,2.5,.06]);

    solid(art,this.gf.materials.floorTile,[82,-.08,1.8],[4,.16,2.4]);
    solid(art,this.gf.materials.ceiling,[82,3.2,1.8],[4,.16,2.4]);
    for(const z of [.6,3])solid(art,this.gf.materials.wall,[82,1.6,z],[4,3.2,.25]);
    solid(art,this.gf.materials.wall,[84,1.6,1.8],[.25,3.2,2.4]);
    for(let i=0;i<6;i++)solid(art,this.gf.materials.floorTile,[82+i*.28,(i+1)*.075,1.8],[.28,(i+1)*.15,2]);
    solid(art,this.gf.materials.lightWarm,[82,3.09,1.8],[1.1,.03,.32]);
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
