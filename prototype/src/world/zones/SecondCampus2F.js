// SecondCampus2F.js - Milestone M9: Second Campus 2F Special Bridge Landing & Gallery
import * as THREE from 'three';
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
    this.gf.buildWall(this.zoneGroup, this.colliders, 70, 1.6, -4.5, 20, 3.2, 0.4);

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
      title: '跨院區聯絡諮詢處',
      subtitle: 'CAMPUS LIAISON DESK',
      header: '松德醫療中心 ｜ 第二院區 2F'
    });

    // ==========================================
    // 3. ELEVATOR & STAIR CORE (at East wall x = 80)
    // ==========================================
    this.gf.buildWall(this.zoneGroup, this.colliders, 80.0, 1.6, 0, 0.4, 3.2, 9.0);

    // Elevator doors
    const elFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 2.4), this.gf.materials.metal);
    elFrame.position.set(79.75, 1.25, -1.8);
    this.zoneGroup.add(elFrame);
    const elDoors = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 2.0), this.gf.materials.stainless);
    elDoors.position.set(79.65, 1.25, -1.8);
    this.zoneGroup.add(elDoors);

    // Stairwell door to 1F exit
    Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 79.8,
      y: 0,
      z: 1.8,
      width: 1.2,
      height: 2.3,
      wallHeight: 3.2,
      wallThickness: 0.4,
      isAlongX: false,
      isOpen: false, // Fire door to stairs
      doorMaterial: this.gf.materials.metal
    });

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 79.7,
      y: 1.8,
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

    return this;
  }

  cleanup() {
    this.scene.remove(this.zoneGroup);
  }
}
