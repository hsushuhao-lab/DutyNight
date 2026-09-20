// SecondCampus1F.js - Milestone M10: Second Campus 1F Hillside Exit & Outdoor Landing
import * as THREE from 'three';
import { buildHillsidePreview } from '../../art/LandscapeArt.js';
import { artRoot, solid, asset, monitor, counterFront, wallTrim } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { Doorway } from '../shared/Doorway.js';
import { SignAnchor } from '../shared/SignAnchor.js';
import { CollisionFactory } from '../shared/CollisionFactory.js';

export class SecondCampus1F {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'SecondCampus1F_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);

    // ==========================================
    // 1. 1F INTERIOR LOBBY / STAIRWELL VESTIBULE (x: 66 to 78, z: -8 to 2)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 72, 0, -3, 12, 10, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, 72, 3.2, -3, 12, 10);

    // Interior walls
    this.gf.buildWall(this.zoneGroup, this.colliders, 72, 1.6, 2.0, 12, 3.2, 0.4);  // North wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 66.0, 1.6, -3.0, 0.4, 3.2, 10.0); // West wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 78.0, 1.6, -3.0, 0.4, 3.2, 10.0); // East wall

    // Elevator doors on North wall
    const elFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 0.2), this.gf.materials.metal);
    elFrame.position.set(74.0, 1.25, 1.75);
    this.zoneGroup.add(elFrame);
    const elDoors = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.3, 0.08), this.gf.materials.stainless);
    elDoors.position.set(74.0, 1.25, 1.65);
    this.zoneGroup.add(elDoors);

    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: 72.0,
      y: 2.65,
      z: -2.0,
      ceilingY: 3.2,
      rotationY: 0,
      text: '第二院區 1F ｜ 警衛室・山側步道・生態池'
    });

    // South wall (z = -8.0) with heavy exterior exit doors
    // Left segment (x: 66 to 70.5)
    this.gf.buildWall(this.zoneGroup, this.colliders, 68.25, 1.6, -8.0, 4.5, 3.2, 0.4);
    // Right segment (x: 73.5 to 78)
    this.gf.buildWall(this.zoneGroup, this.colliders, 75.75, 1.6, -8.0, 4.5, 3.2, 0.4);

    // Exterior exit doorway (x: 70.5 to 73.5, width 2.4m double door)
    Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 72.0,
      y: 0,
      z: -8.0,
      width: 2.4,
      height: 2.5,
      wallHeight: 3.2,
      wallThickness: 0.4,
      isAlongX: true,
      isOpen: true,
      doorMaterial: this.gf.materials.metal
    });

    // ==========================================
    // 2. COVERED OUTDOOR CONCRETE LANDING (z: -8 to -14)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 72, 0, -11.0, 8, 6, this.gf.materials.pathGravel);
    // Concrete overhang / canopy
    this.gf.buildCeiling(this.zoneGroup, 72, 3.2, -11.0, 8, 6, this.gf.materials.wallDark);

    // Support pillars
    this.gf.buildWall(this.zoneGroup, this.colliders, 68.5, 1.6, -13.6, 0.5, 3.2, 0.5, this.gf.materials.metal);
    this.gf.buildWall(this.zoneGroup, this.colliders, 75.5, 1.6, -13.6, 0.5, 3.2, 0.5, this.gf.materials.metal);

    // Landing safety railings
    this.gf.buildWall(this.zoneGroup, this.colliders, 67.8, 0.5, -11.0, 0.2, 1.0, 6.0, this.gf.materials.metal);
    this.gf.buildWall(this.zoneGroup, this.colliders, 76.2, 0.5, -11.0, 0.2, 1.0, 6.0, this.gf.materials.metal);

    // Steps down to hillside path (z: -14 to -17)
    for (let s = 0; s < 3; s++) {
      const stepZ = -14.5 - s * 0.9;
      const stepY = -s * 0.15;
      const stepMesh = this.gf.buildFloor(
        this.zoneGroup,
        this.walkables,
        72,
        stepY,
        stepZ,
        6,
        1.0,
        this.gf.materials.pathGravel
      );
    }

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 74.5,
      y: 1.8,
      z: -7.78,
      rotationY: 0,
      code: 'EXIT',
      title: '山側環山步道出口',
      subtitle: 'HILLSIDE TRAIL EXIT',
      header: '松德醫療中心 ｜ 第二院區'
    });

    this.gf.buildCeilingLight(this.zoneGroup, 72, 3.15, -4.0);

    const art=artRoot(this.zoneGroup,'SecondCampus1F');
    buildHillsidePreview(art);
    solid(art, this.gf.materials.wallDark, [74, .55, -4.5], [2.6, 1.1, .8]);
    solid(art, this.gf.materials.counterTop, [74, 1.14, -4.5], [2.7, .08, .9]);
    counterFront(art, this.gf.materials, 74, -4.04, 2.6, 1.1);
    // Security CCTV multi-view monitor facing inward
    monitor(art, this.gf.materials, 74, 1.18, -4.5, Math.PI);
    // Guard logbook and security transceiver
    solid(art, this.gf.materials.doorWood, [75, 1.19, -4.5], [0.35, 0.04, 0.28]);
    solid(art, this.gf.materials.metal, [73.2, 1.25, -4.5], [0.08, 0.22, 0.08]);
    CollisionFactory.addBox(this.colliders, 74, .6, -4.5, 2.7, 1.2, .9);
    SignAnchor.buildWallPlaque({scene:this.zoneGroup,x:74,y:.73,z:-4.02,rotationY:0,code:'SEC-1',title:'1F 警衛駐守台',subtitle:'SECURITY POST',header:'松德醫療中心 ｜ 第二院區'});

    asset(art,'bench',[76.5,0,-2],[1,1,1],-Math.PI/2);
    asset(art,'plant',[67.3,0,1]);
    solid(art,this.gf.materials.metal,[72,.02,-7.85],[1.6,.04,.6]);
    solid(art,this.gf.materials.metal,[72,2.7,-8.22],[.42,.18,.12]);
    solid(art,this.gf.materials.lightWarm,[72,2.68,-8.30],[.34,.11,.045]);

    for(const x of [70.65,73.35])solid(art,this.gf.materials.wall,[x,1.6,-8],[.3,3.2,.4]);
    const exitDoor=this.zoneGroup.getObjectByName('Doorway_72_-8');
    for(const mesh of exitDoor.children)if(mesh.geometry?.parameters.depth===2.32)mesh.visible=false;
    for(const x of [70.92,73.08]) {
      solid(art,this.gf.materials.metal,[x,1.225,-7.42],[.055,2.45,1.16]);
      solid(art,this.gf.materials.stainless,[x,1.05,-7.06],[.09,.04,.45]);
      solid(art,this.gf.materials.stainless,[x,.21,-7.42],[.07,.3,1.06]);
      for(const y of [.25,1.25,2.15])solid(art,this.gf.materials.stainless,[x,y,-7.97],[.075,.13,.06]);
    }
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
  }
}
