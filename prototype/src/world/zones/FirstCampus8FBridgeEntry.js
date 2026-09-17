// FirstCampus8FBridgeEntry.js - Milestone M6: First Campus 8F Skybridge Transition Vestibule
import * as THREE from 'three';
import { artRoot, solid, asset, wallTrim } from '../../art/ArtDetails.js';
import { buildCampusBackdrop } from '../../art/CampusBackdrop.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
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

    // Authorized boundary repair: close the two arrival-core narrowing returns.
    this.gf.buildWall(this.zoneGroup, this.colliders, -4, 1.6, -2.75, 0.4, 3.2, 1.5);
    this.gf.buildWall(this.zoneGroup, this.colliders, -4, 1.6, 2.75, 0.4, 3.2, 1.5);

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

    const art=artRoot(this.zoneGroup,'BridgeEntry');
    buildCampusBackdrop(art);
    solid(art,this.gf.materials.floorTile,[10,-.08,0],[20,.16,4]);
    solid(art,this.gf.materials.ceiling,[10,3.2,0],[20,.16,4]);
    for(const z of [-2,2]) {
      solid(art,this.gf.materials.wall,[10,.45,z],[20,.9,.35]);
      solid(art,this.gf.materials.wall,[10,2.95,z],[20,.5,.35]);
      solid(art,this.gf.materials.glass,[10,1.8,z],[20,1.8,.025]);
      for(let x=0;x<=20;x+=5)solid(art,this.gf.materials.metal,[x,1.8,z],[.2,1.8,.35]);
    }
    solid(art,this.gf.materials.wall,[20,1.6,0],[.3,3.2,4]);
    for(const x of [5,12,18])solid(art,this.gf.materials.lightWarm,[x,3.10,0],[1.2,.04,.35]);
    asset(art,'bench',[-8,0,2.8],[1,1,1],Math.PI);
    asset(art,'plant',[-10.5,0,-2.7]);
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
