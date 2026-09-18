// FirstCampus1F.js - Milestone M5: First Campus 1F Public Lobby
import * as THREE from 'three';
import { buildCampusBackdrop } from '../../art/CampusBackdrop.js';
import { artRoot, asset, solid, monitor, counterFront, wallTrim } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { buildRoomWing } from '../shared/RoomWing.js';
import { Doorway } from '../shared/Doorway.js';
import { SignAnchor } from '../shared/SignAnchor.js';
import { CollisionFactory } from '../shared/CollisionFactory.js';

export class FirstCampus1F {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'FirstCampus1F_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);

    const lobbyHeight = 4.0; // Higher ceiling for public lobby

    // ==========================================
    // 1. GRAND PUBLIC LOBBY FLOOR & CEILING (x: -14 to 18, z: -8 to 8)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 2, 0, 0, 32, 16, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, 2, lobbyHeight, 0, 32, 16);

    // Outer perimeter walls
    for(const z of [-4.6,4.6]) this.gf.buildWall(this.zoneGroup,this.colliders,18,lobbyHeight/2,z,.4,lobbyHeight,6.8);
    this.roomWing = buildRoomWing(this,{x:18,z:0,height:lobbyHeight,rooms:[
      {code:'OPD',label:'門診區',kind:'clinic'},
      {code:'GROUP',label:'團體治療室',kind:'meeting'},
      {code:'PHARM',label:'藥局',kind:'pharmacy'}
    ]});
    this.gf.buildWall(this.zoneGroup, this.colliders, 2, lobbyHeight / 2, 8, 32, lobbyHeight, 0.4);  // North wall

    // West wall with elevator / stairs core
    this.gf.buildWall(this.zoneGroup, this.colliders, -14, lobbyHeight / 2, 0, 0.4, lobbyHeight, 16);

    // Elevator doors at west wall (x = -13.6, z = 0)
    const elFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 2.6), this.gf.materials.metal);
    elFrame.position.set(-13.6, 1.4, 0);
    this.zoneGroup.add(elFrame);
    const elDoors = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.6, 2.2), this.gf.materials.stainless);
    elDoors.position.set(-13.5, 1.4, 0);
    this.zoneGroup.add(elDoors);

    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: -11.0,
      y: 3.3,
      z: 0,
      ceilingY: lobbyHeight,
      rotationY: Math.PI / 2,
      text: '大廳西側電梯 ｜ 2F 急診・3F 行政・4F 病房・8F 天橋'
    });

    // South wall with main entrance (z = -8)
    // Left wall segment (x: -14 to -2)
    this.gf.buildWall(this.zoneGroup, this.colliders, -8.0, lobbyHeight / 2, -8, 12, lobbyHeight, 0.4);
    // Right wall segment (x: 4 to 18)
    this.gf.buildWall(this.zoneGroup, this.colliders, 11.0, lobbyHeight / 2, -8, 14, lobbyHeight, 0.4);

    // Authorized boundary repair: connect the perimeter to the existing 4m doorway.
    this.gf.buildWall(this.zoneGroup, this.colliders, -1.5, lobbyHeight / 2, -8, 1, lobbyHeight, 0.4);
    this.gf.buildWall(this.zoneGroup, this.colliders, 3.5, lobbyHeight / 2, -8, 1, lobbyHeight, 0.4);

    // Main entrance sliding doors opening (x: -1 to 3, width 4m, height 3m)
    Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 1.0,
      y: 0,
      z: -8.0,
      width: 4.0,
      height: 3.0,
      wallHeight: lobbyHeight,
      wallThickness: 0.4,
      isAlongX: true,
      isOpen: true,
      frameMaterial: this.gf.materials.stainless
    });

    // Exterior entrance plaza threshold (z: -8 to -14)
    this.gf.buildFloor(this.zoneGroup, this.walkables, 1.0, 0, -11.0, 10, 6, this.gf.materials.pathGravel);
    // Canopy over exterior entrance
    this.gf.buildCeiling(this.zoneGroup, 1.0, 3.6, -11.0, 10, 6, this.gf.materials.wallDark);
    // Boundary containment to prevent walking off the plaza
    CollisionFactory.addBox(this.colliders, 1.0, 1.0, -14.2, 10, 2.0, 0.4);
    CollisionFactory.addBox(this.colliders, -4.2, 1.0, -11.0, 0.4, 2.0, 6.0);
    CollisionFactory.addBox(this.colliders, 6.2, 1.0, -11.0, 0.4, 2.0, 6.0);

    // ==========================================
    // 2. CENTRAL INFORMATION & REGISTRATION RECEPTION (x: -1 to 5, z: -2 to 1)
    // ==========================================
    const receptionBase = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 1.1, 2.4),
      this.gf.materials.wallDark
    );
    receptionBase.position.set(2.0, 0.55, -0.5);
    this.zoneGroup.add(receptionBase);

    const receptionTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.08, 2.6),
      this.gf.materials.counterTop
    );
    receptionTop.position.set(2.0, 1.14, -0.5);
    this.zoneGroup.add(receptionTop);
    CollisionFactory.addBox(this.colliders, 2.0, 0.6, -0.5, 5.2, 1.2, 2.6);

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 2.0,
      y: 2.2,
      z: -1.8,
      rotationY: 0,
      code: 'INFO',
      title: '大廳服務台 ｜ 掛號批價',
      subtitle: 'INFORMATION & REGISTRATION',
      header: '松德醫療中心 ｜ 1F 公共服務大廳'
    });

    // ==========================================
    // 3. PUBLIC WAITING LOUNGE (x: 8 to 16, z: -5 to 5)
    // ==========================================
    for (let row = -1; row <= 1; row++) {
      const seatRow = new THREE.Mesh(
        new THREE.BoxGeometry(5.5, 0.48, 0.7),
        this.gf.materials.wallDark
      );
      seatRow.position.set(12.0, 0.24, row * 3.5);
      this.zoneGroup.add(seatRow);
      CollisionFactory.addBox(this.colliders, 12.0, 0.35, row * 3.5, 5.5, 0.7, 0.7);
    }

    // Lobby grand chandelier / ceiling fixtures
    this.gf.buildCeilingLight(this.zoneGroup, 2.0, lobbyHeight - 0.05, -3.0, 1.1, 10.0, 0xfff6ea);
    this.gf.buildCeilingLight(this.zoneGroup, 2.0, lobbyHeight - 0.05, 3.0, 1.1, 10.0, 0xfff6ea);
    this.gf.buildCeilingLight(this.zoneGroup, 12.0, lobbyHeight - 0.05, 0.0, 0.9, 9.0, 0xfff6ea);
    this.gf.buildCeilingLight(this.zoneGroup, -7.0, lobbyHeight - 0.05, 0.0, 0.9, 9.0, 0xfff6ea);

    const art = artRoot(this.zoneGroup, 'Lobby');
    receptionBase.material = this.gf.materials.doorWood;
    counterFront(art, this.gf.materials, 2, -1.72, 5, 1.1);
    monitor(art, this.gf.materials, 1, 1.18, -.5, Math.PI);
    monitor(art, this.gf.materials, 3, 1.18, -.5, Math.PI);
    solid(art, this.gf.materials.doorWood, [2,2.2,-1.76], [5.2,.52,.13]);
    for (const x of [-.4,4.4]) solid(art,this.gf.materials.metal,[x,1.5,-1.7],[.045,3,.045]);
    for (const child of this.zoneGroup.children) {
      if (child.geometry?.parameters.width === 5.5 && child.position.y === .24) child.visible = false;
      if (child.name.startsWith('Plaque_INFO')) { child.rotation.y = Math.PI; child.position.z = -1.85; }
    }
    for (const z of [-3.5,0,3.5]) for(const x of [10.3,12.1,13.9]) asset(art,'bench',[x,0,z]);
    asset(art,'plant',[-10.5,0,6]);
    asset(art,'plant',[16.5,0,6]);
    solid(art,this.gf.materials.metal,[-9,2.5,7.76],[2.8,.9,.055]);
    for (let row=0;row<4;row++) solid(art,this.gf.materials.wall,[-9,2.76-row*.18,7.72],[2.6,.12,.008]);
    wallTrim(this.zoneGroup,this.gf.materials);
    const exterior=buildCampusBackdrop(this.zoneGroup);
    exterior.position.y=11.5;
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
  }
}
