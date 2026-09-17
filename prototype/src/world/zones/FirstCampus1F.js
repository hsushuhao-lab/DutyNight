// FirstCampus1F.js - Milestone M5: First Campus 1F Public Lobby
import * as THREE from 'three';
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
    this.gf.buildWall(this.zoneGroup, this.colliders, 18, lobbyHeight / 2, 0, 0.4, lobbyHeight, 16); // East wall
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
      text: '◀ 1F 門診大廳 ｜ 電梯往 2F-8F 各病房區 ▶'
    });

    // South wall with main entrance (z = -8)
    // Left wall segment (x: -14 to -2)
    this.gf.buildWall(this.zoneGroup, this.colliders, -8.0, lobbyHeight / 2, -8, 12, lobbyHeight, 0.4);
    // Right wall segment (x: 4 to 18)
    this.gf.buildWall(this.zoneGroup, this.colliders, 11.0, lobbyHeight / 2, -8, 14, lobbyHeight, 0.4);

    // Main entrance sliding doors opening (x: -2 to 4, width 6m, height 3.2m)
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

    return this;
  }

  cleanup() {
    if (this.zoneGroup) {
      this.scene.remove(this.zoneGroup);
      this.zoneGroup.traverse((child) => {
        if (child.geometry && typeof child.geometry.dispose === 'function') {
          child.geometry.dispose();
        }
      });
      this.zoneGroup.clear();
    }
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
  }
}
