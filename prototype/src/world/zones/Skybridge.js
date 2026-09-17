// Skybridge.js - Milestone M7: Enclosed Long Structural Connector Bridge
import * as THREE from 'three';
import { CollisionFactory } from '../shared/CollisionFactory.js';
import { SignAnchor } from '../shared/SignAnchor.js';

export class Skybridge {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'Skybridge_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);

    const bridgeLength = 60.0; // Span from x = 0 to x = 60
    const bridgeWidth = 4.0;   // z from -2.0 to 2.0
    const bridgeHeight = 3.2;

    // ==========================================
    // 1. CONTINUOUS STRUCTURAL FLOOR & CEILING
    // ==========================================
    this.gf.buildFloor(
      this.zoneGroup,
      this.walkables,
      bridgeLength / 2,
      0,
      0,
      bridgeLength,
      bridgeWidth,
      this.gf.materials.floorTile
    );

    this.gf.buildCeiling(
      this.zoneGroup,
      bridgeLength / 2,
      bridgeHeight,
      0,
      bridgeLength,
      bridgeWidth
    );

    // ==========================================
    // 2. DOUBLE-SIDED ENCLOSED WINDOW WALLS & MULLIONS
    // ==========================================
    // North wall (z = 2.0) and South wall (z = -2.0)
    [-bridgeWidth / 2, bridgeWidth / 2].forEach((wallZ) => {
      // Lower sill wall (y: 0 to 0.9m)
      this.gf.buildWall(
        this.zoneGroup,
        this.colliders,
        bridgeLength / 2,
        0.45,
        wallZ,
        bridgeLength,
        0.9,
        0.35,
        this.gf.materials.wall
      );

      // Upper lintel (y: 2.7 to 3.2m)
      this.gf.buildWall(
        this.zoneGroup,
        this.colliders,
        bridgeLength / 2,
        2.95,
        wallZ,
        bridgeLength,
        0.5,
        0.35,
        this.gf.materials.wall
      );

      // Glass window panes (y: 0.9 to 2.7m)
      const glassPane = new THREE.Mesh(
        new THREE.PlaneGeometry(bridgeLength, 1.8),
        this.gf.materials.glass
      );
      glassPane.position.set(bridgeLength / 2, 1.8, wallZ + (wallZ < 0 ? 0.05 : -0.05));
      if (wallZ > 0) glassPane.rotation.y = Math.PI;
      this.zoneGroup.add(glassPane);

      // Vertical structural mullions every 5 meters
      for (let x = 5; x < bridgeLength; x += 5) {
        this.gf.buildWall(
          this.zoneGroup,
          this.colliders,
          x,
          1.8,
          wallZ,
          0.3,
          1.8,
          0.35,
          this.gf.materials.metal
        );
      }

      // Continuous safety handrails along both sides
      const railZ = wallZ + (wallZ < 0 ? 0.22 : -0.22);
      this.gf.buildHandrail(this.zoneGroup, null, bridgeLength / 2, 1.05, railZ, bridgeLength);
    });

    // Solid collision barriers ensuring player cannot breach windows under any condition
    CollisionFactory.addBox(this.colliders, bridgeLength / 2, 1.6, -bridgeWidth / 2 - 0.2, bridgeLength, 3.2, 0.4);
    CollisionFactory.addBox(this.colliders, bridgeLength / 2, 1.6, bridgeWidth / 2 + 0.2, bridgeLength, 3.2, 0.4);

    // ==========================================
    // 3. FIRST CAMPUS VESTIBULE CAP (x = 0)
    // ==========================================
    this.gf.buildWall(this.zoneGroup, this.colliders, -0.2, 1.6, -1.6, 0.4, 3.2, 0.8);
    this.gf.buildWall(this.zoneGroup, this.colliders, -0.2, 1.6, 1.6, 0.4, 3.2, 0.8);

    // ==========================================
    // 4. SECOND CAMPUS VESTIBULE CAP (x = 60)
    // ==========================================
    this.gf.buildWall(this.zoneGroup, this.colliders, bridgeLength + 0.2, 1.6, -1.6, 0.4, 3.2, 0.8);
    this.gf.buildWall(this.zoneGroup, this.colliders, bridgeLength + 0.2, 1.6, 1.6, 0.4, 3.2, 0.8);

    // End-wall threshold overhead signs
    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: 3.0,
      y: 2.65,
      z: 0,
      ceilingY: 3.2,
      rotationY: -Math.PI / 2, // Facing returning players
      text: '◀ 第一院區 8F 行政大樓 (Campus 1)'
    });

    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: bridgeLength - 3.0,
      y: 2.65,
      z: 0,
      ceilingY: 3.2,
      rotationY: Math.PI / 2, // Facing advancing players
      text: '▶ 第二院區 2F 醫療大樓 (Campus 2)'
    });

    // ==========================================
    // 5. CEILING LIGHT FIXTURES (Alternating / realistic spacing)
    // ==========================================
    const lightPositions = [5, 12, 18, 25, 33, 40, 48, 55];
    lightPositions.forEach((x, index) => {
      // Intentionally subtle alternating lateral offset & mixed orientation
      const offsetZ = index % 2 === 0 ? -0.25 : 0.25;
      const isTransverse = index % 3 === 0;
      const tubeColor = (index === 2 || index === 5) ? 0xffe4c0 : 0xfff6ea; // Aged warm tube
      this.gf.buildCeilingLight(
        this.zoneGroup,
        x,
        bridgeHeight - 0.05,
        offsetZ,
        0.75,
        8.0,
        tubeColor,
        isTransverse
      );
    });

    return this;
  }

  cleanup() {
    this.scene.remove(this.zoneGroup);
  }
}
