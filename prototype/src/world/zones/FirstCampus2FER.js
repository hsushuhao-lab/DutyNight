// FirstCampus2FER.js - Milestone M4: First Campus 2F Emergency / Acute Floor
import * as THREE from 'three';
import { Doorway } from '../shared/Doorway.js';
import { SignAnchor } from '../shared/SignAnchor.js';
import { CollisionFactory } from '../shared/CollisionFactory.js';

export class FirstCampus2FER {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'FirstCampus2FER_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);

    // ==========================================
    // 1. ELEVATOR / STAIR CORRIDOR ARRIVAL (x: -12 to -4, z: -3.5 to 3.5)
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
      text: '◀ 2F 急診留觀區 ｜ 處置室・救護車道出入口 ▶'
    });

    this.gf.buildCeilingLight(this.zoneGroup, -8, 3.15, 0, 0.9, 7.0, 0xffffff);

    // ==========================================
    // 2. MAIN ER CORRIDOR (x: -4 to 22, z: -3.5 to 3.5)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 9, 0, 0, 26, 7, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, 9, 3.2, 0, 26, 7);

    // Corridor handrails
    this.gf.buildHandrail(this.zoneGroup, null, 9, 1.05, -3.28, 26);
    this.gf.buildHandrail(this.zoneGroup, null, 9, 1.05, 3.28, 26);

    this.gf.buildCeilingLight(this.zoneGroup, 0, 3.15, 0, 0.85, 7.5);
    this.gf.buildCeilingLight(this.zoneGroup, 8, 3.15, 0, 0.85, 7.5);
    this.gf.buildCeilingLight(this.zoneGroup, 16, 3.15, 0, 0.85, 7.5);

    // ==========================================
    // 3. ER NURSING & TRIAGE WORK ZONE (x: 0 to 7, z: 3.5 to 8.5)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 3.5, 0, 6.0, 7, 5, this.gf.materials.floor);
    this.gf.buildCeiling(this.zoneGroup, 3.5, 3.2, 6.0, 7, 5);

    this.gf.buildWall(this.zoneGroup, this.colliders, 3.5, 1.6, 8.5, 7, 3.2, 0.4); // North back wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 0.0, 1.6, 6.0, 0.4, 3.2, 5.0); // West wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 7.0, 1.6, 6.0, 0.4, 3.2, 5.0); // East wall

    // Triage Counter (at z = 3.5)
    const triageCounter = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.1, 0.7), this.gf.materials.wallDark);
    triageCounter.position.set(3.5, 0.55, 3.5);
    this.zoneGroup.add(triageCounter);
    CollisionFactory.addBox(this.colliders, 3.5, 0.55, 3.5, 4.8, 1.1, 0.7);

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 3.5,
      y: 2.5,
      z: 3.55,
      rotationY: 0,
      code: 'ER',
      title: '急診檢傷與護理站',
      subtitle: 'TRIAGE & NURSING',
      header: '松德醫療中心 ｜ 急診醫學部'
    });

    this.gf.buildCeilingLight(this.zoneGroup, 3.5, 3.15, 6.0, 0.8, 6.0);

    // ==========================================
    // 4. ER ACUTE OBSERVATION BED BAYS (x: 9 to 20, z: 3.5 to 9.5)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 14.5, 0, 6.5, 11, 6, this.gf.materials.floor);
    this.gf.buildCeiling(this.zoneGroup, 14.5, 3.2, 6.5, 11, 6);

    this.gf.buildWall(this.zoneGroup, this.colliders, 14.5, 1.6, 9.5, 11, 3.2, 0.4); // North wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 20.0, 1.6, 6.5, 0.4, 3.2, 6.0); // East wall

    // 4 ER Bed Bays with stretchers and curtain dividers
    for (let i = 0; i < 4; i++) {
      const bx = 10.5 + i * 2.5;
      // Stretcher/bed
      const bed = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.55, 2.1), this.gf.materials.bedSheet);
      bed.position.set(bx, 0.275, 7.5);
      this.zoneGroup.add(bed);
      CollisionFactory.addBox(this.colliders, bx, 0.4, 7.5, 1.0, 0.8, 2.1);

      // Medical gas / monitor headwall box
      const headwall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.12), this.gf.materials.metal);
      headwall.position.set(bx, 1.4, 9.25);
      this.zoneGroup.add(headwall);

      // Curtain rail partition
      if (i < 3) {
        const curtain = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 2.2, 2.8),
          new THREE.MeshStandardMaterial({ color: 0x8a9da3, roughness: 0.8 })
        );
        curtain.position.set(bx + 1.25, 1.5, 7.5);
        this.zoneGroup.add(curtain);
        CollisionFactory.addBox(this.colliders, bx + 1.25, 1.5, 7.5, 0.1, 2.2, 2.8);
      }
    }

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 14.5,
      y: 2.6,
      z: 3.55,
      rotationY: 0,
      code: 'OBS',
      title: '急診留觀區 (床位 01-04)',
      subtitle: 'OBSERVATION BAYS',
      header: '松德醫療中心 ｜ 急診醫學部'
    });

    // ==========================================
    // 5. ACUTE TREATMENT ROOM / ECT PREP FOOTPRINT (x: 0 to 7, z: -9.5 to -3.5)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 3.5, 0, -6.5, 7, 6, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, 3.5, 3.2, -6.5, 7, 6);

    this.gf.buildWall(this.zoneGroup, this.colliders, 3.5, 1.6, -9.5, 7, 3.2, 0.4); // South back wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 0.0, 1.6, -6.5, 0.4, 3.2, 6.0); // West wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 7.0, 1.6, -6.5, 0.4, 3.2, 6.0); // East wall

    // Corridor front wall (at z = -3.5) with doorway opening from x = 2.8 to 4.2
    this.gf.buildWall(this.zoneGroup, this.colliders, 1.4, 1.6, -3.5, 2.8, 3.2, 0.4);
    this.gf.buildWall(this.zoneGroup, this.colliders, 5.6, 1.6, -3.5, 2.8, 3.2, 0.4);

    Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 3.5,
      y: 0,
      z: -3.5,
      width: 1.4,
      height: 2.4,
      wallHeight: 3.2,
      wallThickness: 0.4,
      isAlongX: true,
      isOpen: true,
      doorMaterial: this.gf.materials.stainless
    });

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 2.2,
      y: 1.85,
      z: -3.28,
      rotationY: 0,
      code: 'TR-1',
      title: '急性處置室 (前處置整備)',
      subtitle: 'ACUTE TREATMENT ROOM',
      header: '松德醫療中心 ｜ 急診醫學部'
    });

    // Treatment table
    const treatTable = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 2.2), this.gf.materials.stainless);
    treatTable.position.set(3.5, 0.4, -6.5);
    this.zoneGroup.add(treatTable);
    CollisionFactory.addBox(this.colliders, 3.5, 0.4, -6.5, 1.1, 0.8, 2.2);

    this.gf.buildCeilingLight(this.zoneGroup, 3.5, 3.15, -6.5, 0.9, 6.5, 0xffffff);

    // ==========================================
    // 6. DOCTOR ON-DUTY CHARTING ROOM (x: 9 to 16, z: -9.5 to -3.5)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 12.5, 0, -6.5, 7, 6, this.gf.materials.floor);
    this.gf.buildCeiling(this.zoneGroup, 12.5, 3.2, -6.5, 7, 6);

    this.gf.buildWall(this.zoneGroup, this.colliders, 12.5, 1.6, -9.5, 7, 3.2, 0.4); // South wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 16.0, 1.6, -6.5, 0.4, 3.2, 6.0); // East wall

    this.gf.buildWall(this.zoneGroup, this.colliders, 10.5, 1.6, -3.5, 3.0, 3.2, 0.4);
    this.gf.buildWall(this.zoneGroup, this.colliders, 14.5, 1.6, -3.5, 3.0, 3.2, 0.4);

    Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 12.5,
      y: 0,
      z: -3.5,
      width: 1.2,
      height: 2.4,
      wallHeight: 3.2,
      wallThickness: 0.4,
      isAlongX: true,
      isOpen: true,
      doorMaterial: this.gf.materials.doorWood
    });

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 11.2,
      y: 1.85,
      z: -3.28,
      rotationY: 0,
      code: '208',
      title: '急診醫師診療研究室',
      subtitle: 'DUTY PHYSICIAN OFFICE',
      header: '松德醫療中心 ｜ 急診醫學部'
    });

    // Charting desk & computer
    const docDesk = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.76, 1.0), this.gf.materials.doorWood);
    docDesk.position.set(13.0, 0.38, -6.5);
    this.zoneGroup.add(docDesk);
    CollisionFactory.addBox(this.colliders, 13.0, 0.4, -6.5, 2.0, 0.8, 1.0);

    // ==========================================
    // 7. HILLSIDE EXTERIOR AMBULANCE ENTRANCE (x = 22, z = 0)
    // ==========================================
    // East wall with ambulance doorway
    this.gf.buildWall(this.zoneGroup, this.colliders, 22.0, 1.6, 2.2, 0.4, 3.2, 2.6);
    this.gf.buildWall(this.zoneGroup, this.colliders, 22.0, 1.6, -2.2, 0.4, 3.2, 2.6);

    // Automatic sliding glass entrance threshold
    Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 22.0,
      y: 0,
      z: 0.0,
      width: 2.4,
      height: 2.6,
      wallHeight: 3.2,
      wallThickness: 0.4,
      isAlongX: false,
      isOpen: true, // Sliding glass open threshold to exterior
      frameMaterial: this.gf.materials.stainless
    });

    // Exterior covered ramp / ambulance bay (x: 22 to 30, z: -4 to 4)
    this.gf.buildFloor(this.zoneGroup, this.walkables, 26.0, 0, 0, 8, 8, this.gf.materials.pathGravel);
    this.gf.buildCeiling(this.zoneGroup, 26.0, 3.8, 0, 8, 8, this.gf.materials.wallDark);

    // Exterior support pillars
    this.gf.buildWall(this.zoneGroup, this.colliders, 30.0, 1.9, 3.8, 0.6, 3.8, 0.6, this.gf.materials.metal);
    this.gf.buildWall(this.zoneGroup, this.colliders, 30.0, 1.9, -3.8, 0.6, 3.8, 0.6, this.gf.materials.metal);

    // Exterior boundary containment collider so player cannot fall off the ramp
    CollisionFactory.addBox(this.colliders, 30.5, 1.0, 0, 0.4, 2.0, 8.0);
    CollisionFactory.addBox(this.colliders, 26.0, 1.0, 4.2, 8.0, 2.0, 0.4);
    CollisionFactory.addBox(this.colliders, 26.0, 1.0, -4.2, 8.0, 2.0, 0.4);

    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: 21.0,
      y: 2.7,
      z: 0,
      ceilingY: 3.2,
      rotationY: Math.PI / 2,
      text: '🚑 急診救護車道 ｜ 戶外山側通道 (Ambulance Bay)'
    });

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
