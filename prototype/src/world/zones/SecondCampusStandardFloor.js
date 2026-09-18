// SecondCampusStandardFloor.js - Milestone M8: Second Campus Reusable Standard Ward Floor Module
import * as THREE from 'three';
import { artRoot, solid, asset, monitor, counterFront, wallTrim } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { Doorway } from '../shared/Doorway.js';
import { SignAnchor } from '../shared/SignAnchor.js';
import { CollisionFactory } from '../shared/CollisionFactory.js';

export class SecondCampusStandardFloor {
  constructor(scene, geometryFactory, { floor = 3 } = {}) {
    this.floor = floor;
    this.roomAreas = [];
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = `SecondCampus${floor}F_Zone`;
  }

  build() {
    this.scene.add(this.zoneGroup);

    // ==========================================
    // 1. ELEVATOR LOBBY & CENTRAL CORRIDOR (x: 65 to 95, z: -3.0 to 3.0)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 80, 0, 0, 30, 6, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, 80, 3.2, 0, 30, 6);

    // Sealed west end of the corridor
    this.gf.buildWall(this.zoneGroup, this.colliders, 65.0, 1.6, 0, 0.4, 3.2, 6.0);

    // Elevator opens north toward the nursing station
    const elFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 2.4), this.gf.materials.metal);
    elFrame.position.set(77.5, 1.25, -2.75);
    elFrame.rotation.y = Math.PI / 2;
    this.zoneGroup.add(elFrame);
    const elDoors = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 2.0), this.gf.materials.stainless);
    elDoors.position.set(77.5, 1.25, -2.65);
    elDoors.rotation.y = Math.PI / 2;
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

    // Floor-specific care station identity
    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 78.0,
      y: 2.6,
      z: 3.05,
      rotationY: 0,
      code: `${this.floor}F-ST`,
      title: `${this.floor}F 病房護理站`,
      subtitle: 'INPATIENT CARE STATION',
      header: `松德醫療中心 ｜ 第二院區 ${this.floor}F`
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
      const roomCode = `B${this.floor}-${String(idx + 1).padStart(2, '0')}`;
      const roomZ = -6;
      this.gf.buildFloor(this.zoneGroup, this.walkables, rx, 0, roomZ, 8.04, 6.04);
      this.gf.buildCeiling(this.zoneGroup, rx, 3.2, roomZ, 8, 6);
      this.gf.buildWall(this.zoneGroup, this.colliders, rx, 1.6, -9, 8, 3.2, .4);
      for (const side of [-1, 1]) {
        this.gf.buildWall(this.zoneGroup, this.colliders, rx + side * 4, 1.6, roomZ, .4, 3.2, 6);
        this.gf.buildWall(this.zoneGroup, this.colliders, rx + side * .85, 1.6, -3, .3, 3.2, .4);
      }
      const model = idx === 2 ? 'workDesk' : 'hospitalBed';
      asset(this.zoneGroup, model, [rx + 2, 0, -7.6]);
      CollisionFactory.addBox(this.colliders, rx + 2, .55, -7.6, idx === 2 ? 1.5 : 1.15, 1.1, idx === 2 ? .8 : 2.15);
      this.gf.buildCeilingLight(this.zoneGroup, rx, 3.15, roomZ);
      this.roomAreas.push({id: roomCode, label: idx === 2 ? '醫師辦公室／支援室' : '病房', point: [rx, 1.7, -6], door: [rx, 1.7, -3], corridor: [rx, 1.7, 0]});

      Doorway.build({
        scene: this.zoneGroup,
        colliders: this.colliders,
        x: rx,
        y: 0,
        z: -3.0,
        width: 1.4,
        height: 2.4,
        wallHeight: 3.2,
        wallThickness: 0.4,
        isAlongX: true,
        isOpen: true,
        doorMaterial: this.gf.materials.doorWood
      });

      SignAnchor.buildWallPlaque({
        scene: this.zoneGroup,
        x: rx + 1.25,
        y: 1.85,
        z: -2.78,
        rotationY: 0,
        code: roomCode,
        title: idx === 2 ? `${roomCode} 醫師辦公室／支援室` : `${roomCode} 病房`,
        subtitle: idx === 2 ? 'STAFF SUPPORT' : 'PATIENT ROOM',
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

    const art=artRoot(this.zoneGroup,'SecondCampusStandardFloor');

    counterFront(art,this.gf.materials,78,2.62,8,1.05);
    solid(art,this.gf.materials.doorWood,[78,2.5,3],[8.2,.45,.15]);
    for(const x of [74,78,82])solid(art,this.gf.materials.doorWood,[x,1.76,3],[.065,1.45,.10]);
    for(const child of this.zoneGroup.children){
      if(child.name.startsWith(`Plaque_${this.floor}F-ST`)) {child.rotation.y=Math.PI;child.position.z=2.90;}
      if(child.geometry?.parameters.width===30 && child.geometry?.parameters.height===.08)child.visible=false;
    }
    for(const [x,w] of [[68.5,6.5],[89.5,10.5]])solid(art,this.gf.materials.handrail,[x,1.05,2.78],[w,.08,.08]);
    for(const x of [75.2,77.1,80.8]) monitor(art,this.gf.materials,x,1.12,3,Math.PI);
    for(const x of [73,83])asset(art,'storageCabinet',[x,0,7.25]);


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
    this.roomAreas = [];
  }
}
