// HillsideRoute.js - Milestone M11: Outdoor Hillside Trail with Contained Boundaries & Pond Branch
import * as THREE from 'three';
import { applyHillsideArt } from '../../art/LandscapeArt.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { CollisionFactory } from '../shared/CollisionFactory.js';
import { SignAnchor } from '../shared/SignAnchor.js';

export class HillsideRoute {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'HillsideRoute_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);

    // Subtropical night sky ambient lighting
    const outdoorLight = new THREE.HemisphereLight(0x3a4b56, 0x1c241c, 0.45);
    this.zoneGroup.add(outdoorLight);

    // ==========================================
    // 1. BASE HILLSIDE TERRAIN GROUND
    // ==========================================
    const terrainGeo = new THREE.PlaneGeometry(80, 50);
    const terrain = new THREE.Mesh(terrainGeo, this.gf.materials.terrainGrass);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(40, -0.6, -30);
    terrain.receiveShadow = true;
    this.zoneGroup.add(terrain);

    // ==========================================
    // 2. MAIN PAVED PATH SEGMENTS (Width 3.5m)
    // Runs from Second Campus Exit (x = 72, z = -17) curving west toward First Campus (x = 10, z = -35)
    // ==========================================
    const pathNodes = [
      { x: 72, z: -18, y: -0.45 },
      { x: 65, z: -20, y: -0.45 },
      { x: 55, z: -22, y: -0.45 },
      { x: 42, z: -25, y: -0.45 }, // FORK TO POND
      { x: 30, z: -28, y: -0.45 },
      { x: 20, z: -32, y: -0.45 },
      { x: 10, z: -35, y: -0.45 }
    ];

    for (let i = 0; i < pathNodes.length - 1; i++) {
      const p1 = pathNodes[i];
      const p2 = pathNodes[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midZ = (p1.z + p2.z) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const segLength = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);

      // Path mesh
      const pathGeo = new THREE.PlaneGeometry(3.6, segLength + 0.5);
      const pathMesh = new THREE.Mesh(pathGeo, this.gf.materials.pathGravel);
      pathMesh.rotation.x = -Math.PI / 2;
      pathMesh.rotation.z = angle;
      pathMesh.position.set(midX, midY + 0.02, midZ);
      pathMesh.receiveShadow = true;
      this.zoneGroup.add(pathMesh);
      this.walkables.push(pathMesh);

      // Side retaining stone curbs
      const curbLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.45, segLength),
        this.gf.materials.wallDark
      );
      curbLeft.rotation.y = angle;
      const normalX = Math.cos(angle) * 1.95;
      const normalZ = -Math.sin(angle) * 1.95;
      curbLeft.position.set(midX + normalX, midY + 0.2, midZ + normalZ);
      this.zoneGroup.add(curbLeft);

      const curbRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.45, segLength),
        this.gf.materials.wallDark
      );
      curbRight.rotation.y = angle;
      curbRight.position.set(midX - normalX, midY + 0.2, midZ - normalZ);
      this.zoneGroup.add(curbRight);
    }

    // ==========================================
    // 3. SUBTLE BRANCH PATH TOWARD ECOLOGICAL POND
    // Starts at fork (x = 42, z = -25) and curves southeast down toward pond (x = 52, z = -36)
    // ==========================================
    const branchNodes = [
      { x: 42, z: -25, y: -0.45 },
      { x: 46, z: -30, y: -0.5 },
      { x: 50, z: -35, y: -0.55 }
    ];

    for (let i = 0; i < branchNodes.length - 1; i++) {
      const p1 = branchNodes[i];
      const p2 = branchNodes[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midZ = (p1.z + p2.z) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const segLength = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);

      const bPathGeo = new THREE.PlaneGeometry(2.4, segLength + 0.4);
      const bPath = new THREE.Mesh(bPathGeo, this.gf.materials.pathGravel);
      bPath.rotation.x = -Math.PI / 2;
      bPath.rotation.z = angle;
      bPath.position.set(midX, midY + 0.02, midZ);
      this.zoneGroup.add(bPath);
      this.walkables.push(bPath);
    }

    // Wooden Trail Directional Signpost at the Fork (x = 42, z = -24)
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8),
      this.gf.materials.doorWood
    );
    post.position.set(42.5, 0.45, -23.5);
    this.zoneGroup.add(post);

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 42.5,
      y: 1.2,
      z: -23.58,
      width: 0.95,
      height: 0.4,
      rotationY: Math.PI,
      code: 'TRAIL',
      title: '主步道 ｜ 往生態池分支 ↘',
      subtitle: 'NATURE TRAIL FORK',
      header: '院區景觀步道'
    });

    // ==========================================
    // 4. PATHWAY LIGHTS (Subtle warm outdoor bollards)
    // ==========================================
    [
      { x: 68, z: -18 },
      { x: 55, z: -21 },
      { x: 42, z: -24 },
      { x: 30, z: -27 },
      { x: 18, z: -32 },
      { x: 47, z: -31 } // On branch
    ].forEach((lp) => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8),
        this.gf.materials.metal
      );
      pole.position.set(lp.x, 0.15, lp.z);
      this.zoneGroup.add(pole);

      const lampHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.18, 0.18),
        new THREE.MeshBasicMaterial({ color: 0xffdfaa })
      );
      lampHead.position.set(lp.x, 0.75, lp.z);
      this.zoneGroup.add(lampHead);

      const pLight = new THREE.PointLight(0xffbe6b, 0.75, 7.0);
      pLight.position.set(lp.x, 0.85, lp.z);
      this.zoneGroup.add(pLight);
    });

    // ==========================================
    // 5. TERRAIN BOUNDARY CONTAINMENT COLLIDERS
    // ==========================================
    // North terrain edge
    CollisionFactory.addBox(this.colliders, 40, 1.0, -14.0, 80, 4.0, 0.5);
    // South terrain edge
    CollisionFactory.addBox(this.colliders, 40, 1.0, -45.0, 80, 4.0, 0.5);
    // East terrain edge
    CollisionFactory.addBox(this.colliders, 76.5, 1.0, -30.0, 0.5, 4.0, 35);
    // West terrain edge
    CollisionFactory.addBox(this.colliders, 5.0, 1.0, -30.0, 0.5, 4.0, 35);

    applyHillsideArt(this);
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
