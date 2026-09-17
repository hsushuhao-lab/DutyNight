// SecondCampusStandardFloor.js - Milestone M8: Second Campus Reusable Standard Ward Floor Module
import * as THREE from 'three';
import { Doorway } from '../shared/Doorway.js';
import { SignAnchor } from '../shared/SignAnchor.js';
import { CollisionFactory } from '../shared/CollisionFactory.js';

export class SecondCampusStandardFloor {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'SecondCampusStandardFloor_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);

    // ==========================================
    // 1. ELEVATOR LOBBY & CENTRAL CORRIDOR (x: 65 to 95, z: -3.0 to 3.0)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 80, 0, 0, 30, 6, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, 80, 3.2, 0, 30, 6);

    // West end wall (Elevator doors at x = 65, z = 0)
    this.gf.buildWall(this.zoneGroup, this.colliders, 65.0, 1.6, 0, 0.4, 3.2, 6.0);

    // Elevator doors mesh
    const elFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 2.4), this.gf.materials.metal);
    elFrame.position.set(65.25, 1.25, 0);
    this.zoneGroup.add(elFrame);
    const elDoors = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 2.0), this.gf.materials.stainless);
    elDoors.position.set(65.35, 1.25, 0);
    this.zoneGroup.add(elDoors);

    // East end wall of corridor
    this.gf.buildWall(this.zoneGroup, this.colliders, 95.0, 1.6, 0, 0.4, 3.2, 6.0);

    // ==========================================
    // 2. NURSING STATION (DIRECTLY VISIBLE UPON ELEVATOR ARRIVAL)
    // Located on North side (x: 72 to 84, z: 3.0 to 8.0)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 78, 0, 5.5, 12, 5, this.gf.materials.floor);
    this.gf.buildCeiling(this.zoneGroup, 78, 3.2, 5.5, 12, 5);

    // North back wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 78, 1.6, 8.0, 12, 3.2, 0.4);
    // Side walls
    this.gf.buildWall(this.zoneGroup, this.colliders, 72.0, 1.6, 5.5, 0.4, 3.2, 5.0);
    this.gf.buildWall(this.zoneGroup, this.colliders, 84.0, 1.6, 5.5, 0.4, 3.2, 5.0);

    // Front Counter (at z = 3.0, height 1.1m, facing elevator lobby)
    const counterBody = new THREE.Mesh(
      new THREE.BoxGeometry(8.0, 1.05, 0.7),
      this.gf.materials.wallDark
    );
    counterBody.position.set(78.0, 0.525, 3.0);
    this.zoneGroup.add(counterBody);

    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 0.08, 0.85),
      this.gf.materials.counterTop
    );
    counterTop.position.set(78.0, 1.08, 3.0);
    this.zoneGroup.add(counterTop);
    CollisionFactory.addBox(this.colliders, 78.0, 0.55, 3.0, 8.2, 1.15, 0.85);

    // Humane upper glass panel
    const glassPanel = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 1.1), this.gf.materials.glass);
    glassPanel.position.set(78.0, 1.72, 3.0);
    this.zoneGroup.add(glassPanel);

    // Unnumbered standard floor identity sign / Care station plaque
    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 78.0,
      y: 2.6,
      z: 3.05,
      rotationY: 0,
      code: 'ST',
      title: '病房護理站',
      subtitle: 'INPATIENT CARE STATION',
      header: '松德醫療中心 ｜ 第二院區標準病房層'
    });

    // ==========================================
    // 3. CORRIDOR WALLS & PATIENT ROOM DOORS
    // ==========================================
    // North corridor walls around nursing station
    this.gf.buildWall(this.zoneGroup, this.colliders, 68.5, 1.6, 3.0, 7.0, 3.2, 0.4);
    this.gf.buildWall(this.zoneGroup, this.colliders, 89.5, 1.6, 3.0, 11.0, 3.2, 0.4);

    // South corridor wall with patient room doorways (z = -3.0)
    // Wall sections
    this.gf.buildWall(this.zoneGroup, this.colliders, 68.0, 1.6, -3.0, 6.0, 3.2, 0.4);
    this.gf.buildWall(this.zoneGroup, this.colliders, 76.0, 1.6, -3.0, 6.0, 3.2, 0.4);
    this.gf.buildWall(this.zoneGroup, this.colliders, 84.0, 1.6, -3.0, 6.0, 3.2, 0.4);
    this.gf.buildWall(this.zoneGroup, this.colliders, 92.0, 1.6, -3.0, 6.0, 3.2, 0.4);

    // Room doorways (Room A at x = 72, Room B at x = 80, Room C at x = 88)
    [72.0, 80.0, 88.0].forEach((rx, idx) => {
      Doorway.build({
        scene: this.zoneGroup,
        colliders: this.colliders,
        x: rx,
        y: 0,
        z: -3.0,
        width: 1.2,
        height: 2.4,
        wallHeight: 3.2,
        wallThickness: 0.4,
        isAlongX: true,
        isOpen: false, // Closed patient room doors
        doorMaterial: this.gf.materials.doorWood
      });

      SignAnchor.buildWallPlaque({
        scene: this.zoneGroup,
        x: rx - 1.0,
        y: 1.85,
        z: -2.78,
        rotationY: 0,
        code: `R${idx + 1}`,
        title: `病房 (Room ${idx + 1})`,
        subtitle: 'PATIENT ROOM',
        header: '第二院區'
      });
    });

    // Handrails
    this.gf.buildHandrail(this.zoneGroup, null, 80, 1.05, 2.78, 30);

    // Ceiling lights
    this.gf.buildCeilingLight(this.zoneGroup, 70, 3.15, 0);
    this.gf.buildCeilingLight(this.zoneGroup, 78, 3.15, 0);
    this.gf.buildCeilingLight(this.zoneGroup, 88, 3.15, 0);
    this.gf.buildCeilingLight(this.zoneGroup, 78, 3.15, 5.5, 0.8, 6.0);

    return this;
  }

  cleanup() {
    this.scene.remove(this.zoneGroup);
  }
}
