// FirstCampus4F.js - Milestones M1, M2, M3: 4F Core Shell, Independent Duty Room, Nursing Station & Ward Gate
import * as THREE from 'three';
import { Doorway } from '../shared/Doorway.js';
import { SignAnchor } from '../shared/SignAnchor.js';
import { CollisionFactory } from '../shared/CollisionFactory.js';

export class FirstCampus4F {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'FirstCampus4F_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);

    // ==========================================
    // 1. ELEVATOR LOBBY (x: -12 to -4, z: -3.5 to 3.5)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, -8, 0, 0, 8, 7, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, -8, 3.2, 0, 8, 7);

    // West wall (Elevator doors wall)
    this.gf.buildWall(this.zoneGroup, this.colliders, -12, 1.6, 0, 0.4, 3.2, 7);
    // North wall of lobby
    this.gf.buildWall(this.zoneGroup, this.colliders, -8, 1.6, 3.5, 8, 3.2, 0.4);
    // South wall of lobby
    this.gf.buildWall(this.zoneGroup, this.colliders, -8, 1.6, -3.5, 8, 3.2, 0.4);

    // Elevator doors mesh
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.5, 2.4),
      this.gf.materials.metal
    );
    doorFrame.position.set(-11.75, 1.25, 0);
    this.zoneGroup.add(doorFrame);

    const doorLeafs = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.3, 2.0),
      this.gf.materials.stainless
    );
    doorLeafs.position.set(-11.65, 1.25, 0);
    this.zoneGroup.add(doorLeafs);

    // 4F Elevator call button panel
    const btnBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.35, 0.18),
      this.gf.materials.metal
    );
    btnBox.position.set(-11.65, 1.2, 1.5);
    this.zoneGroup.add(btnBox);

    // Floor indicator 4F glow
    const indLight = new THREE.PointLight(0xffb03a, 1.0, 2.5);
    indLight.position.set(-11.5, 2.65, 0);
    this.zoneGroup.add(indLight);

    // Lobby overhead sign
    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: -6.5,
      y: 2.65,
      z: 0,
      ceilingY: 3.2,
      rotationY: Math.PI / 2,
      text: '◀ 4F 醫師值班室 ｜ 4A 護理站・閉鎖病房 ▶'
    });

    this.gf.buildCeilingLight(this.zoneGroup, -8, 3.15, 0);

    // ==========================================
    // 2. MAIN CORRIDOR (x: -4 to 14, z: -2.5 to 2.5)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 5, 0, 0, 18, 5, this.gf.materials.floor);
    this.gf.buildCeiling(this.zoneGroup, 5, 3.2, 0, 18, 5);

    // South wall returns and sections
    // Section west of duty room (x: -4 to 2)
    this.gf.buildWall(this.zoneGroup, this.colliders, -1.0, 1.6, -2.5, 6.0, 3.2, 0.4);
    // Section east of duty room (x: 9 to 14)
    this.gf.buildWall(this.zoneGroup, this.colliders, 11.5, 1.6, -2.5, 5.0, 3.2, 0.4);

    // North wall returns and sections
    // Section west of nursing station (x: -4 to 4)
    this.gf.buildWall(this.zoneGroup, this.colliders, 0.0, 1.6, 2.5, 8.0, 3.2, 0.4);
    // Section east of nursing station (x: 12 to 14)
    this.gf.buildWall(this.zoneGroup, this.colliders, 13.0, 1.6, 2.5, 2.0, 3.2, 0.4);

    // Corridor handrails
    this.gf.buildHandrail(this.zoneGroup, null, -1.0, 1.05, -2.28, 6.0);
    this.gf.buildHandrail(this.zoneGroup, null, 11.5, 1.05, -2.28, 5.0);
    this.gf.buildHandrail(this.zoneGroup, null, 0.0, 1.05, 2.28, 8.0);

    this.gf.buildCeilingLight(this.zoneGroup, 0, 3.15, 0);
    this.gf.buildCeilingLight(this.zoneGroup, 8, 3.15, 0);

    // ==========================================
    // 3. M2: INDEPENDENT DUTY ROOM SUITE (x: 2 to 9, z: -8.5 to -2.5)
    // ==========================================
    // Duty room floor & ceiling
    this.gf.buildFloor(this.zoneGroup, this.walkables, 5.5, 0, -5.5, 7, 6, this.gf.materials.floorWood);
    this.gf.buildCeiling(this.zoneGroup, 5.5, 3.2, -5.5, 7, 6);

    // Duty room perimeter walls
    this.gf.buildWall(this.zoneGroup, this.colliders, 2.0, 1.6, -5.5, 0.4, 3.2, 6.0); // West wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 9.0, 1.6, -5.5, 0.4, 3.2, 6.0); // East wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 5.5, 1.6, -8.5, 7.0, 3.2, 0.4); // South back wall

    // Corridor-facing front wall (z = -2.5) with doorway:
    // Left segment (x: 2.0 to 4.8)
    this.gf.buildWall(this.zoneGroup, this.colliders, 3.4, 1.6, -2.5, 2.8, 3.2, 0.4);
    // Right segment (x: 6.0 to 9.0)
    this.gf.buildWall(this.zoneGroup, this.colliders, 7.5, 1.6, -2.5, 3.0, 3.2, 0.4);

    // Duty Room Doorway (x: 4.8 to 6.0, center 5.4, width 1.2m)
    Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 5.4,
      y: 0,
      z: -2.5,
      width: 1.2,
      height: 2.4,
      wallHeight: 3.2,
      wallThickness: 0.4,
      isAlongX: true,
      isOpen: true,
      doorMaterial: this.gf.materials.doorWood
    });

    // Wall Plaque on corridor wall beside door
    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 4.0,
      y: 1.85,
      z: -2.28,
      rotationY: 0,
      code: '4F',
      title: '醫師值班室',
      subtitle: 'DUTY ROOM',
      header: '松德醫療中心 ｜ 4F 病房區'
    });

    // Duty room interior:
    // 1. Made Bed with frame, mattress, pillow, blanket
    const bedGroup = new THREE.Group();
    const bFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 2.1), this.gf.materials.bedFrame);
    bFrame.position.set(0, 0.2, 0);
    bedGroup.add(bFrame);
    const bMattress = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.25, 2.02), this.gf.materials.bedSheet);
    bMattress.position.set(0, 0.45, 0);
    bedGroup.add(bMattress);
    const bPillow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.45), this.gf.materials.bedSheet);
    bPillow.position.set(0, 0.62, -0.75);
    bedGroup.add(bPillow);

    // Folded extra blanket at foot of bed
    const bBlanket = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.08, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x5d7366, roughness: 0.85 })
    );
    bBlanket.position.set(0, 0.58, 0.65);
    bedGroup.add(bBlanket);

    bedGroup.position.set(3.5, 0, -6.8);
    this.zoneGroup.add(bedGroup);
    CollisionFactory.addBox(this.colliders, 3.5, 0.4, -6.8, 1.4, 0.8, 2.1);

    // Nightstand table beside bed
    const nightstand = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.56, 0.48),
      this.gf.materials.doorWood
    );
    nightstand.position.set(4.65, 0.28, -7.2);
    this.zoneGroup.add(nightstand);
    CollisionFactory.addBox(this.colliders, 4.65, 0.28, -7.2, 0.48, 0.56, 0.48);

    // Bedside warm reading lamp
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.04, 12),
      this.gf.materials.metal
    );
    lampBase.position.set(4.65, 0.58, -7.2);
    this.zoneGroup.add(lampBase);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.18, 12, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xfff2dc, roughness: 0.4 })
    );
    lampShade.position.set(4.65, 0.72, -7.2);
    this.zoneGroup.add(lampShade);

    const nightLampLight = new THREE.PointLight(0xffe1b0, 0.8, 3.5);
    nightLampLight.position.set(4.65, 0.70, -7.2);
    this.zoneGroup.add(nightLampLight);

    // 2. Study desk & chair
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.76, 0.8), this.gf.materials.doorWood);
    desk.position.set(7.5, 0.38, -4.5);
    this.zoneGroup.add(desk);
    CollisionFactory.addBox(this.colliders, 7.5, 0.4, -4.5, 1.6, 0.8, 0.8);

    // Desk study lamp & papers
    const deskLamp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.12), this.gf.materials.metal);
    deskLamp.position.set(8.1, 0.92, -4.5);
    this.zoneGroup.add(deskLamp);

    const deskPapers = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.02, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xf8f8f4, roughness: 0.9 })
    );
    deskPapers.position.set(7.25, 0.77, -4.5);
    this.zoneGroup.add(deskPapers);

    const deskChair = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.55), this.gf.materials.metal);
    deskChair.position.set(7.5, 0.42, -5.3);
    this.zoneGroup.add(deskChair);

    // 3. Wardrobe / locker with stainless handle
    const locker = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.0, 0.7), this.gf.materials.metal);
    locker.position.set(8.2, 1.0, -7.5);
    this.zoneGroup.add(locker);
    CollisionFactory.addBox(this.colliders, 8.2, 1.0, -7.5, 0.8, 2.0, 0.7);

    // 4. Private bathroom partition shell & fittings
    this.gf.buildWall(this.zoneGroup, this.colliders, 3.2, 1.6, -5.0, 2.0, 3.2, 0.2); // north partition
    this.gf.buildWall(this.zoneGroup, this.colliders, 4.2, 1.6, -4.0, 0.2, 3.2, 2.0); // east partition

    const sink = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xf2f4f2, roughness: 0.2 })
    );
    sink.position.set(2.6, 0.8, -4.0);
    this.zoneGroup.add(sink);

    const mirror = new THREE.Mesh(
      new THREE.PlaneGeometry(0.45, 0.7),
      this.gf.materials.stainless
    );
    mirror.position.set(2.6, 1.5, -4.88);
    mirror.rotation.y = 0;
    this.zoneGroup.add(mirror);

    // Warm ceiling light in duty room
    this.gf.buildCeilingLight(this.zoneGroup, 6.0, 3.15, -5.5, 0.85, 6.5, 0xffebce);

    // ==========================================
    // 4. M3: 4A NURSING STATION (x: 4 to 12, z: 2.5 to 7.5)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 8, 0, 5, 8, 5, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, 8, 3.2, 5, 8, 5);

    // North back wall of nursing station
    this.gf.buildWall(this.zoneGroup, this.colliders, 8, 1.6, 7.5, 8, 3.2, 0.4);
    // East wall of nursing station
    this.gf.buildWall(this.zoneGroup, this.colliders, 12, 1.6, 5.0, 0.4, 3.2, 5.0);
    // West wall of nursing station
    this.gf.buildWall(this.zoneGroup, this.colliders, 4, 1.6, 5.0, 0.4, 3.2, 5.0);

    // Nursing Station Counter Front (at z = 2.5, height 1.1m, with staff passage at x = 5)
    // Left counter (x: 6 to 11.5)
    const counterBody = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.05, 0.6), this.gf.materials.wallDark);
    counterBody.position.set(8.75, 0.525, 2.5);
    this.zoneGroup.add(counterBody);
    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.08, 0.75), this.gf.materials.counterTop);
    counterTop.position.set(8.75, 1.08, 2.5);
    this.zoneGroup.add(counterTop);
    CollisionFactory.addBox(this.colliders, 8.75, 0.55, 2.5, 5.7, 1.15, 0.75);

    // Upper glass partition (humane hospital observation window with frosted privacy stripe)
    const glassUpper = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.1), this.gf.materials.glass);
    glassUpper.position.set(8.75, 1.72, 2.5);
    this.zoneGroup.add(glassUpper);

    // Frosted privacy stripe across center of glass
    const frostStripe = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 0.28),
      new THREE.MeshStandardMaterial({
        color: 0xdfede6,
        transparent: true,
        opacity: 0.65,
        roughness: 0.6
      })
    );
    frostStripe.position.set(8.75, 1.65, 2.502);
    this.zoneGroup.add(frostStripe);

    // Nursing station inner work desk
    const innerDesk = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.76, 1.0), this.gf.materials.metal);
    innerDesk.position.set(8.75, 0.38, 4.5);
    this.zoneGroup.add(innerDesk);
    CollisionFactory.addBox(this.colliders, 8.75, 0.4, 4.5, 5.0, 0.8, 1.0);

    // Desktop monitors & chart binder racks
    const monitor1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.06), this.gf.materials.metal);
    monitor1.position.set(7.5, 0.95, 4.5);
    this.zoneGroup.add(monitor1);

    const monitor2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.06), this.gf.materials.metal);
    monitor2.position.set(9.8, 0.95, 4.5);
    this.zoneGroup.add(monitor2);

    // Wall chart rack on back wall
    const chartRack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.12), this.gf.materials.metal);
    chartRack.position.set(8.0, 1.8, 7.3);
    this.zoneGroup.add(chartRack);

    // Nursing Station Signboard
    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 8.75,
      y: 2.55,
      z: 2.55,
      rotationY: 0,
      code: '4A',
      title: '護理站',
      subtitle: 'NURSING STATION',
      header: '松德醫療中心 ｜ 急性精神病房'
    });

    this.gf.buildCeilingLight(this.zoneGroup, 8.0, 3.15, 5.0, 0.8, 6.0);

    // ==========================================
    // 5. M3: CONTROLLED WARD THRESHOLD (x = 14 to 22, z: -2.5 to 2.5)
    // ==========================================
    // Closed ward corridor floor & ceiling
    this.gf.buildFloor(this.zoneGroup, this.walkables, 18, 0, 0, 8, 5, this.gf.materials.floor);
    this.gf.buildCeiling(this.zoneGroup, 18, 3.2, 0, 8, 5);

    // Ward corridor side walls
    this.gf.buildWall(this.zoneGroup, this.colliders, 18, 1.6, -2.5, 8, 3.2, 0.4);
    this.gf.buildWall(this.zoneGroup, this.colliders, 18, 1.6, 2.5, 8, 3.2, 0.4);
    // East boundary wall
    this.gf.buildWall(this.zoneGroup, this.colliders, 22, 1.6, 0, 0.4, 3.2, 5.0);

    // Ward Gate Partition Wall at x = 14:
    // Left segment (z: -2.5 to -1.0)
    this.gf.buildWall(this.zoneGroup, this.colliders, 14.0, 1.6, -1.75, 0.4, 3.2, 1.5);
    // Right segment (z: 1.0 to 2.5)
    this.gf.buildWall(this.zoneGroup, this.colliders, 14.0, 1.6, 1.75, 0.4, 3.2, 1.5);

    // Controlled Access Doorway (center z = 0, width 2.0m double door)
    Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 14.0,
      y: 0,
      z: 0.0,
      width: 2.0,
      height: 2.4,
      wallHeight: 3.2,
      wallThickness: 0.4,
      isAlongX: false,
      isOpen: true, // Gate doorway open for traversal
      doorMaterial: this.gf.materials.doorWood
    });

    // Card swipe reader box
    const cardReader = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.22, 0.14),
      this.gf.materials.metal
    );
    cardReader.position.set(13.8, 1.3, -1.2);
    this.zoneGroup.add(cardReader);

    cardReader.userData = {
      interactable: true,
      id: 'WARD_GATE_ACCESS',
      label: '4A 閉鎖病房門禁（感應刷卡）',
      type: 'ward_gate'
    };
    this.interactables.push(cardReader);

    // Ward Entrance Overhead Sign
    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: 13.2,
      y: 2.7,
      z: 0,
      ceilingY: 3.2,
      rotationY: Math.PI / 2,
      text: '🔒 4A 閉鎖病房 ｜ 門禁管制區域（請刷卡）'
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
