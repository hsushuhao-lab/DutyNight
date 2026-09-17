// FirstCampus8FBridgeEntry.js - Milestone M6: First Campus 8F Skybridge Transition Vestibule
import * as THREE from 'three';
import { Doorway } from '../shared/Doorway.js';
import { SignAnchor } from '../shared/SignAnchor.js';

export class FirstCampus8FBridgeEntry {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'FirstCampus8F_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);

    // ==========================================
    // 1. ELEVATOR ARRIVAL CORE (x: -12 to -4, z: -3.5 to 3.5)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, -8, 0, 0, 8, 7, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, -8, 3.2, 0, 8, 7);

    this.gf.buildWall(this.zoneGroup, this.colliders, -12, 1.6, 0, 0.4, 3.2, 7);
    this.gf.buildWall(this.zoneGroup, this.colliders, -8, 1.6, 3.5, 8, 3.2, 0.4);
    this.gf.buildWall(this.zoneGroup, this.colliders, -8, 1.6, -3.5, 8, 3.2, 0.4);

    // Elevator doors
    const elFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 2.4), this.gf.materials.metal);
    elFrame.position.set(-11.75, 1.25, 0);
    this.zoneGroup.add(elFrame);
    const elDoors = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 2.0), this.gf.materials.stainless);
    elDoors.position.set(-11.65, 1.25, 0);
    this.zoneGroup.add(elDoors);

    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: -6.0,
      y: 2.65,
      z: 0,
      ceilingY: 3.2,
      rotationY: Math.PI / 2,
      text: '◀ 8F 電梯大廳 ｜ 前往 第二院區空中連通道 ▶'
    });

    this.gf.buildCeilingLight(this.zoneGroup, -8, 3.15, 0);

    // ==========================================
    // 2. ENCLOSED BRIDGE VESTIBULE (x: -4 to 0, z: -2.0 to 2.0)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, -2, 0, 0, 4, 4, this.gf.materials.floor);
    this.gf.buildCeiling(this.zoneGroup, -2, 3.2, 0, 4, 4);

    // North and south side walls
    this.gf.buildWall(this.zoneGroup, this.colliders, -2, 1.6, 2.0, 4, 3.2, 0.4);
    this.gf.buildWall(this.zoneGroup, this.colliders, -2, 1.6, -2.0, 4, 3.2, 0.4);

    // Handrails
    this.gf.buildHandrail(this.zoneGroup, null, -2, 1.05, 1.78, 4.0);
    this.gf.buildHandrail(this.zoneGroup, null, -2, 1.05, -1.78, 4.0);

    // ==========================================
    // 3. FIRE DOOR SEPARATION & BRIDGE THRESHOLD (x = 0)
    // ==========================================
    // Partition wall returns
    this.gf.buildWall(this.zoneGroup, this.colliders, 0, 1.6, 1.6, 0.4, 3.2, 0.8);
    this.gf.buildWall(this.zoneGroup, this.colliders, 0, 1.6, -1.6, 0.4, 3.2, 0.8);

    // Fire door opening (width 2.4m, magnetic open plates)
    Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 0,
      y: 0,
      z: 0,
      width: 2.4,
      height: 2.4,
      wallHeight: 3.2,
      wallThickness: 0.4,
      isAlongX: false,
      isOpen: true,
      frameMaterial: this.gf.materials.metal
    });

    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: -1.0,
      y: 2.65,
      z: 0,
      ceilingY: 3.2,
      rotationY: Math.PI / 2,
      text: '🌉 空中連通道 (Skybridge) ｜ 往 第二院區'
    });

    this.gf.buildCeilingLight(this.zoneGroup, -2, 3.15, 0);

    return this;
  }

  cleanup() {
    this.scene.remove(this.zoneGroup);
  }
}
