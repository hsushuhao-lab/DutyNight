// Level3FBlockout.js - 3F Administration Blockout with Sunset Warmth
import * as THREE from 'three';
import { getMaterials, materialForSurface } from '../art/MaterialRegistry.js';

export class Level3FBlockout {
  constructor(scene) {
    this.scene = scene;
    this.interactables = [];
    this.colliders = [];
    this.walkables = [];
    this.materials = {};
    this.elevatorLight = null;
    this.keyMesh = null;
    this.dutyLogMesh = null;
    this.workstationMesh = null;

    this.initMaterials();
    this.buildEnvironment();
    this.buildElevatorLobby();
    this.buildCorridor();
    this.buildDutyOffice();
    this.buildWorkstations();
    this.buildEnvironmentalDetails();
    this.setupLighting();
  }

  initMaterials() {
    const shared = getMaterials();
    this.materials = {
      ...shared,
      bumper: shared.wallBumper,
      elevatorDoor: shared.metal,
      wood: shared.floorWood,
      fixture: shared.metal,
      lightEmitter: new THREE.MeshStandardMaterial({ color: 0xf3f0e5, emissive: 0xfff2d7, emissiveIntensity: 0.5, roughness: 0.8 }),
      brass: new THREE.MeshStandardMaterial({ color: 0xb5a56c, roughness: 0.35, metalness: 0.8 }),
      screen: new THREE.MeshBasicMaterial({ color: 0xc9d6c9 })
    };
  }

  addCollider(box) {
    this.colliders.push(box);
  }

  addWalkable(mesh) {
    mesh.userData.walkable = true;
    this.walkables.push(mesh);
  }

  buildWall(x, y, z, width, height, depth, mat = this.materials.wall) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Bounding box collider
    const halfW = width / 2;
    const halfD = depth / 2;
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(x - halfW, 0, z - halfD),
      new THREE.Vector3(x + halfW, height, z + halfD)
    ));
    return mesh;
  }

  buildEnvironment() {
    // Softer dusk backdrop with a readable gradient instead of a flat orange slab.
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const ctx = skyCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#d8b39a');
    grad.addColorStop(0.35, '#e6c9b3');
    grad.addColorStop(0.7, '#c4ced3');
    grad.addColorStop(1, '#99a6ae');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.arc(820, 150, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(90,104,110,0.18)';
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(40 + i * 150, 340 - (i % 3) * 18, 100, 180 + (i % 2) * 28);
    }
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    const skyGeo = new THREE.PlaneGeometry(60, 20);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.DoubleSide });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.position.set(0, 5, -16);
    this.scene.add(sky);
  }

  buildElevatorLobby() {
    // Elevator lobby floor: x from -12 to -4, z from -3.5 to 3.5
    const floorGeo = new THREE.PlaneGeometry(8, 7);
    const floor = new THREE.Mesh(floorGeo, materialForSurface('floor', floorGeo.parameters.width, floorGeo.parameters.height));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(-8, 0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.addWalkable(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(8, 7);
    const ceil = new THREE.Mesh(ceilGeo, materialForSurface('ceiling', ceilGeo.parameters.width, ceilGeo.parameters.height));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(-8, 3.2, 0);
    this.scene.add(ceil);

    // West wall (behind elevator)
    this.buildWall(-12, 1.6, 0, 0.4, 3.2, 7);
    // North wall of elevator lobby
    this.buildWall(-8, 1.6, 3.5, 8, 3.2, 0.4);
    // South wall of elevator lobby
    this.buildWall(-8, 1.6, -3.5, 8, 3.2, 0.4);

    // Elevator Doors
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 2.5, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8, roughness: 0.3 })
    );
    doorFrame.position.set(-11.7, 1.25, 0);
    this.scene.add(doorFrame);

    const leftDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2.3, 1.1),
      this.materials.elevatorDoor
    );
    leftDoor.position.set(-11.6, 1.25, -0.6);
    this.scene.add(leftDoor);

    const rightDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2.3, 1.1),
      this.materials.elevatorDoor
    );
    rightDoor.position.set(-11.6, 1.25, 0.6);
    this.scene.add(rightDoor);

    // Floor Indicator Panel over elevator
    const panelGeo = new THREE.BoxGeometry(0.1, 0.35, 0.8);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(-11.6, 2.65, 0);
    this.scene.add(panel);

    // Elevator Call Button Panel
    const buttonBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.4, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 })
    );
    buttonBox.position.set(-11.6, 1.2, 1.6);
    this.scene.add(buttonBox);

    // Glowing call button
    const btnGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 16);
    btnGeo.rotateZ(Math.PI / 2);
    const btnMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const callButton = new THREE.Mesh(btnGeo, btnMat);
    callButton.position.set(-11.55, 1.2, 1.6);
    this.scene.add(callButton);

    callButton.userData = {
      interactable: true,
      id: 'ELEVATOR_BUTTON',
      label: '搭乘電梯前往 4F 病房區',
      type: 'elevator'
    };
    this.interactables.push(callButton);
    this.elevatorLight = callButton;

    // Overhead wayfinding sign in elevator lobby, facing approaching corridor traffic (+X)
    this.createSignMesh(-6.8, 2.65, 0, '◀ 3F 電梯大廳 ｜ 2F 急診・4F 病房區 ▶', Math.PI / 2);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.85, roughness: 0.3 });
    const rod1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), rodMat);
    rod1.position.set(-6.8, 2.93, -0.85);
    this.scene.add(rod1);
    const rod2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), rodMat);
    rod2.position.set(-6.8, 2.93, 0.85);
    this.scene.add(rod2);
  }

  buildCorridor() {
    // Corridor floor: x from -4 to 16, z from -2.5 to 2.5
    const floorGeo = new THREE.PlaneGeometry(20, 5);
    const floor = new THREE.Mesh(floorGeo, materialForSurface('floor', floorGeo.parameters.width, floorGeo.parameters.height));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(6, 0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.addWalkable(floor);

    // Corridor ceiling
    const ceilGeo = new THREE.PlaneGeometry(20, 5);
    const ceil = new THREE.Mesh(ceilGeo, materialForSurface('ceiling', ceilGeo.parameters.width, ceilGeo.parameters.height));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(6, 3.2, 0);
    this.scene.add(ceil);

    // East end wall
    this.buildWall(16, 1.6, 0, 0.4, 3.2, 5);

    // South wall with large windows (Sunset view)
    // Pillars and window sills
    this.buildWall(6, 0.5, -2.5, 20, 1.0, 0.4); // lower wall
    this.buildWall(6, 3.0, -2.5, 20, 0.4, 0.4); // upper lintel
    // Vertical mullions
    for (let x = -3; x <= 15; x += 3.5) {
      this.buildWall(x, 1.8, -2.5, 0.3, 2.0, 0.4);
    }
    // Glass panes
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(19, 1.8), this.materials.glass);
    glass.position.set(6, 1.8, -2.35);
    this.scene.add(glass);

    // North wall of corridor has opening into Duty Office
    // Wall segment west of office door (x from -4.0 to 1.8)
    this.buildWall(-1.1, 1.6, 2.5, 5.8, 3.2, 0.4);
    // Doorway opening from x = 1.8 to 3.0 (width 1.2m, height 2.4m)
    // Lintel over doorway (y from 2.4 to 3.2)
    this.buildWall(2.4, 2.8, 2.5, 1.2, 0.8, 0.4);
    // Office front wall east of doorway (x from 3.0 to 11.0)
    this.buildWall(7.0, 1.6, 2.5, 8.0, 3.2, 0.4);
    // Wall segment east of office (x from 11.0 to 16.0)
    this.buildWall(13.5, 1.6, 2.5, 5.0, 3.2, 0.4);
  }

  buildDutyOffice() {
    // Duty office floor: x from 1 to 11, z from 2.5 to 8.5
    const floorGeo = new THREE.PlaneGeometry(10, 6);
    const floor = new THREE.Mesh(floorGeo, materialForSurface('floor', floorGeo.parameters.width, floorGeo.parameters.height));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(6, 0, 5.5);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.addWalkable(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(10, 6);
    const ceil = new THREE.Mesh(ceilGeo, materialForSurface('ceiling', ceilGeo.parameters.width, ceilGeo.parameters.height));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(6, 3.2, 5.5);
    this.scene.add(ceil);

    // Office perimeter walls
    this.buildWall(6, 1.6, 8.5, 10, 3.2, 0.4); // North back wall
    this.buildWall(1, 1.6, 5.5, 0.4, 3.2, 6);   // West wall
    this.buildWall(11, 1.6, 5.5, 0.4, 3.2, 6);  // East wall

    // Office main desk
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.08, 1.2),
      this.materials.wood
    );
    deskTop.position.set(6.0, 0.78, 6.2);
    deskTop.castShadow = true;
    this.scene.add(deskTop);

    // Desk legs/body
    const deskBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.74, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x5a3d28 })
    );
    deskBody.position.set(6.0, 0.37, 6.2);
    this.scene.add(deskBody);
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(4.7, 0, 5.5),
      new THREE.Vector3(7.3, 1.0, 6.9)
    ));

    // Office chair
    const chair = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.9, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 })
    );
    chair.position.set(6.0, 0.5, 7.3);
    this.scene.add(chair);

    // Bulletin Board on North Wall
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 1.2, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xbf9b68, roughness: 0.9 })
    );
    board.position.set(6.5, 2.0, 8.28);
    this.scene.add(board);

    // Desk warm lamp
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
    );
    lampBase.position.set(5.1, 0.84, 6.5);
    this.scene.add(lampBase);

    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.18, 0.16, 32),
      new THREE.MeshStandardMaterial({ color: 0xe8e3d7, roughness: 0.6 })
    );
    lampShade.position.set(5.1, 1.15, 6.5);
    this.scene.add(lampShade);

    // INTERACTABLE 1: Duty-Room Key (值班室鑰匙)
    const keyGroup = new THREE.Group();
    // Key ring
    const ringGeo = new THREE.TorusGeometry(0.05, 0.008, 12, 24);
    const ring = new THREE.Mesh(ringGeo, this.materials.brass);
    keyGroup.add(ring);

    // Key blade
    const bladeGeo = new THREE.BoxGeometry(0.015, 0.006, 0.12);
    const blade = new THREE.Mesh(bladeGeo, this.materials.brass);
    blade.position.set(0, 0, 0.08);
    keyGroup.add(blade);

    // Key plastic tag for the independent 4F duty room
    const tagGeo = new THREE.BoxGeometry(0.08, 0.01, 0.14);
    const tagMat = new THREE.MeshStandardMaterial({ color: 0x1f5f8b, roughness: 0.5 });
    const tag = new THREE.Mesh(tagGeo, tagMat);
    tag.position.set(0.06, 0, -0.04);
    keyGroup.add(tag);

    keyGroup.position.set(5.6, 0.83, 6.0);
    this.scene.add(keyGroup);

    // Hitbox for key pickup
    const keyHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.25, 0.35),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    keyHitbox.position.copy(keyGroup.position);
    keyHitbox.userData = {
      interactable: true,
      id: 'KEY_PICKUP',
      label: '領取 4F 值班室鑰匙',
      type: 'key',
      targetGroup: keyGroup
    };
    this.scene.add(keyHitbox);
    this.interactables.push(keyHitbox);
    this.keyMesh = keyHitbox;

    // INTERACTABLE 2: Duty Log Book (值班本)
    const bookGeo = new THREE.BoxGeometry(0.42, 0.04, 0.32);
    const bookMat = new THREE.MeshStandardMaterial({ color: 0x1b3c59, roughness: 0.6 });
    const logBook = new THREE.Mesh(bookGeo, bookMat);
    logBook.position.set(6.4, 0.84, 6.0);
    this.scene.add(logBook);

    // White page on top
    const pageGeo = new THREE.PlaneGeometry(0.38, 0.28);
    const pageMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ee, roughness: 0.9 });
    const page = new THREE.Mesh(pageGeo, pageMat);
    page.rotation.x = -Math.PI / 2;
    page.position.set(6.4, 0.865, 6.0);
    this.scene.add(page);

    // Pen beside book
    const penGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.18);
    penGeo.rotateZ(Math.PI / 2);
    const penMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6 });
    const pen = new THREE.Mesh(penGeo, penMat);
    pen.position.set(6.7, 0.84, 6.0);
    this.scene.add(pen);

    // Hitbox for Duty Log
    const logHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    logHitbox.position.set(6.4, 0.85, 6.0);
    logHitbox.userData = {
      interactable: true,
      id: 'DUTY_LOG',
      label: '簽署值班名冊',
      type: 'duty_log'
    };
    this.scene.add(logHitbox);
    this.interactables.push(logHitbox);
    this.dutyLogMesh = logHitbox;
  }

  buildWorkstations() {
    // Workstation alcove: desk on the east side of office (x = 9.5, z = 5.5)
    const deskGeo = new THREE.BoxGeometry(1.2, 0.08, 2.6);
    const desk = new THREE.Mesh(deskGeo, this.materials.wood);
    desk.position.set(10.0, 0.78, 5.5);
    this.scene.add(desk);

    const deskLegs = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.74, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    deskLegs.position.set(10.0, 0.37, 5.5);
    this.scene.add(deskLegs);
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(9.4, 0, 4.1),
      new THREE.Vector3(10.7, 1.0, 6.9)
    ));

    // Two PC monitors
    [-0.6, 0.6].forEach((offsetZ, idx) => {
      // Monitor stand
      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.22),
        new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5 })
      );
      stand.position.set(10.2, 0.93, 5.5 + offsetZ);
      this.scene.add(stand);

      // Monitor Screen casing
      const casing = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.42, 0.62),
        new THREE.MeshStandardMaterial({ color: 0x1f2326, roughness: 0.4 })
      );
      casing.position.set(10.2, 1.25, 5.5 + offsetZ);
      this.scene.add(casing);

      // HIS-like monitor content for a more grounded workstation look.
      const screenCanvas = document.createElement('canvas');
      screenCanvas.width = 320;
      screenCanvas.height = 220;
      const sctx = screenCanvas.getContext('2d');
      sctx.fillStyle = idx === 0 ? '#d8e4de' : '#dce4ea';
      sctx.fillRect(0, 0, 320, 220);
      sctx.fillStyle = idx === 0 ? '#355342' : '#41576a';
      sctx.fillRect(0, 0, 320, 32);
      sctx.fillStyle = '#ffffff';
      sctx.font = 'bold 18px sans-serif';
      sctx.fillText(idx === 0 ? '夜間交班' : '病房資訊', 14, 22);
      sctx.fillStyle = '#b9c6bf';
      sctx.fillRect(14, 54, 292, 18);
      sctx.fillRect(14, 84, 292, 18);
      sctx.fillRect(14, 114, 292, 18);
      sctx.fillStyle = '#d99f5d';
      sctx.fillRect(14, 154, 96, 28);
      sctx.fillStyle = '#ffffff';
      sctx.font = '16px sans-serif';
      sctx.fillText('確認', 46, 173);
      const screenTex = new THREE.CanvasTexture(screenCanvas);
      screenTex.colorSpace = THREE.SRGBColorSpace;
      const displayGeo = new THREE.PlaneGeometry(0.58, 0.38);
      const display = new THREE.Mesh(displayGeo, new THREE.MeshBasicMaterial({ map: screenTex }));
      display.rotation.y = -Math.PI / 2;
      display.position.set(10.16, 1.25, 5.5 + offsetZ);
      this.scene.add(display);

      // Keyboard & mouse
      const kb = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.02, 0.44),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      kb.position.set(9.8, 0.83, 5.5 + offsetZ);
      this.scene.add(kb);

      if (idx === 0) {
        // Main eligible workstation terminal
        const wsHitbox = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.7, 0.9),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        wsHitbox.position.set(9.9, 1.2, 5.5 + offsetZ);
        wsHitbox.userData = {
          interactable: true,
          id: 'E_HANDOFF',
          label: '使用電子交班工作站',
          type: 'workstation'
        };
        this.scene.add(wsHitbox);
        this.interactables.push(wsHitbox);
        this.workstationMesh = wsHitbox;
      }
    });
  }


  buildEnvironmentalDetails() {
    // Warm wood handrail / bumper strips, aligned to the walls only (unobstructed at office entrance)
    const railMat = new THREE.MeshStandardMaterial({ color: 0x9a7653, roughness: 0.58 });

    // South wall handrail (continuous along window wall)
    const railSouth = new THREE.Mesh(new THREE.BoxGeometry(19.0, 0.10, 0.10), railMat);
    railSouth.position.set(6, 1.05, -2.31);
    railSouth.castShadow = true;
    this.scene.add(railSouth);

    // North wall handrail: West of office door (x: -3.5 to 1.6, length 5.1, center -0.95)
    const railNorthWest = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.10, 0.10), railMat);
    railNorthWest.position.set(-0.95, 1.05, 2.31);
    railNorthWest.castShadow = true;
    this.scene.add(railNorthWest);

    // North wall handrail: East of office door (x: 3.2 to 15.5, length 12.3, center 9.35)
    const railNorthEast = new THREE.Mesh(new THREE.BoxGeometry(12.3, 0.10, 0.10), railMat);
    railNorthEast.position.set(9.35, 1.05, 2.31);
    railNorthEast.castShadow = true;
    this.scene.add(railNorthEast);

    // 316 Office doorway frame & open door leaf
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x7c5d42, roughness: 0.65 });
    // Left jamb
    const jambLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.4, 0.42), frameMat);
    jambLeft.position.set(1.83, 1.2, 2.5);
    this.scene.add(jambLeft);
    // Right jamb
    const jambRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.4, 0.42), frameMat);
    jambRight.position.set(2.97, 1.2, 2.5);
    this.scene.add(jambRight);
    // Header jamb
    const jambTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.42), frameMat);
    jambTop.position.set(2.4, 2.37, 2.5);
    this.scene.add(jambTop);

    // Door leaf propped open against the inside west wall of 316
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x8b6a4f, roughness: 0.6 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.28, 1.02), doorMat);
    door.position.set(1.92, 1.14, 3.12);
    this.scene.add(door);

    // Door glazed vision panel
    const doorGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.42),
      new THREE.MeshStandardMaterial({ color: 0xc4d6dd, transparent: true, opacity: 0.42, roughness: 0.2, side: THREE.DoubleSide })
    );
    doorGlass.position.set(1.96, 1.55, 3.12);
    doorGlass.rotation.y = Math.PI / 2;
    this.scene.add(doorGlass);

    // Door handle lever
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xc8c8c8, metalness: 0.85, roughness: 0.25 });
    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), handleMat);
    handleBar.rotation.z = Math.PI / 2;
    handleBar.position.set(1.97, 1.05, 3.52);
    this.scene.add(handleBar);

    // 316 Plaque mounted physically on the corridor wall to the left of the doorway
    const plaqueMountMat = new THREE.MeshStandardMaterial({ color: 0x22362b, metalness: 0.3, roughness: 0.6 });
    const plaqueMount = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.34, 0.024), plaqueMountMat);
    plaqueMount.position.set(1.25, 1.85, 2.29);
    this.scene.add(plaqueMount);

    // Plaque face with crisp medical office typography
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 512;
    plaqueCanvas.height = 192;
    const pctx = plaqueCanvas.getContext('2d');
    pctx.fillStyle = '#edf2ee';
    pctx.fillRect(0, 0, 512, 192);

    // Top hospital department header
    pctx.fillStyle = '#204d37';
    pctx.fillRect(0, 0, 512, 40);
    pctx.fillStyle = '#ffffff';
    pctx.font = 'bold 20px sans-serif';
    pctx.textAlign = 'left';
    pctx.textBaseline = 'middle';
    pctx.fillText('精神醫療部 ｜ 醫療行政區', 24, 20);

    // Left room number badge
    pctx.fillStyle = '#204d37';
    pctx.fillRect(18, 54, 120, 120);
    pctx.fillStyle = '#ffffff';
    pctx.font = 'bold 44px sans-serif';
    pctx.textAlign = 'center';
    pctx.textBaseline = 'middle';
    pctx.fillText('316', 78, 114);

    // Right room designation
    pctx.fillStyle = '#1c2822';
    pctx.font = 'bold 36px sans-serif';
    pctx.textAlign = 'left';
    pctx.fillText('總醫師辦公室', 156, 95);

    pctx.fillStyle = '#556a5e';
    pctx.font = '18px sans-serif';
    pctx.fillText('CHIEF RESIDENT OFFICE', 156, 140);

    // Frame border
    pctx.strokeStyle = '#8faaa0';
    pctx.lineWidth = 4;
    pctx.strokeRect(2, 2, 508, 188);

    const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
    plaqueTex.colorSpace = THREE.SRGBColorSpace;
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.31),
      new THREE.MeshBasicMaterial({ map: plaqueTex, side: THREE.DoubleSide })
    );
    plaque.position.set(1.25, 1.85, 2.274);
    plaque.rotation.y = Math.PI;
    this.scene.add(plaque);

    // Corridor seating and waiting nook.
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x566e65, roughness: 0.78 });
    [8.7, 10.0].forEach((x) => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.46), seatMat);
      seat.position.set(x, 0.48, 1.95);
      seat.castShadow = true;
      this.scene.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.56, 0.10), seatMat);
      back.position.set(x, 0.78, 2.18);
      this.scene.add(back);
    });

    // Indoor plant.
    const potMat = new THREE.MeshStandardMaterial({ color: 0x8a6c52, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4d725b, roughness: 0.9 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.42, 20), potMat);
    pot.position.set(13.6, 0.21, -1.95);
    this.scene.add(pot);
    for (let i = 0; i < 8; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), leafMat);
      leaf.scale.set(0.65, 1.8, 0.55);
      const angle = i * Math.PI * 0.25;
      leaf.position.set(13.6 + Math.cos(angle) * 0.18, 0.58 + (i % 2) * 0.10, -1.95 + Math.sin(angle) * 0.18);
      leaf.rotation.z = Math.cos(angle) * 0.35;
      this.scene.add(leaf);
    }

    // Framed notice board at corridor end.
    const artCanvas = document.createElement('canvas');
    artCanvas.width = 512;
    artCanvas.height = 320;
    const actx = artCanvas.getContext('2d');
    const gradient = actx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, '#d3d8d3');
    gradient.addColorStop(1, '#f1eee8');
    actx.fillStyle = gradient;
    actx.fillRect(0, 0, 512, 320);
    actx.fillStyle = '#355342';
    actx.font = 'bold 36px sans-serif';
    actx.fillText('醫師值班提醒', 160, 54);
    actx.font = '24px sans-serif';
    ['• 17:00 交接完成後再上樓', '• 夜間門禁請隨身攜帶鑰匙', '• 病況變化請先通知護理站'].forEach((line, i) => actx.fillText(line, 54, 125 + i * 56));
    const artTex = new THREE.CanvasTexture(artCanvas);
    artTex.colorSpace = THREE.SRGBColorSpace;
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(2.25, 1.40),
      new THREE.MeshBasicMaterial({ map: artTex })
    );
    art.position.set(15.77, 1.75, 0);
    art.rotation.y = -Math.PI / 2;
    this.scene.add(art);

    // Subtle trim above doorway.
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xb9b1a4, roughness: 0.78 });
    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.06, 0.06), trimMat);
    trim.position.set(2.4, 2.42, 2.28);
    this.scene.add(trim);
  }

  createSignMesh(x, y, z, text, rotationY = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#234a36';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#b6d3c3';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const signGroup = new THREE.Group();
    const signBox = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.6, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x2c3b31, roughness: 0.7 })
    );
    signGroup.add(signBox);

    const signMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const signGeo = new THREE.PlaneGeometry(2.38, 0.58);
    const signFront = new THREE.Mesh(signGeo, signMat);
    signFront.position.set(0, 0, 0.022);
    signGroup.add(signFront);

    const signBack = new THREE.Mesh(signGeo, signMat);
    signBack.rotation.y = Math.PI;
    signBack.position.set(0, 0, -0.022);
    signGroup.add(signBack);

    signGroup.position.set(x, y, z);
    signGroup.rotation.y = rotationY;
    this.scene.add(signGroup);
    return signGroup;
  }

  setupLighting() {
    // Ceiling fluorescent fixtures (warm white 4000K)
    const fixturePositions = [
      { x: -8, y: 3.15, z: 0 },    // Elevator lobby
      { x: -1.5, y: 3.15, z: 0 },  // Corridor west
      { x: 2.5, y: 3.15, z: 0 },   // Corridor west-mid
      { x: 6.5, y: 3.15, z: 0 },   // Corridor mid
      { x: 10.5, y: 3.15, z: 0 },  // Corridor east-mid
      { x: 14.0, y: 3.15, z: 0 },  // Corridor east
      { x: 4.5, y: 3.15, z: 5.5 }, // Office west
      { x: 8.0, y: 3.15, z: 5.5 }  // Office east
    ];

    fixturePositions.forEach(pos => {
      // Physical fixture box
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.08, 0.4),
        this.materials.fixture
      );
      box.position.set(pos.x, pos.y, pos.z);
      this.scene.add(box);

      // Light emitter bar
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.02, 0.25),
        this.materials.lightEmitter
      );
      bar.position.set(pos.x, pos.y - 0.04, pos.z);
      this.scene.add(bar);


    });
  }

  updateElevatorLight(isReady) {
    if (this.elevatorLight) {
      this.elevatorLight.material.color.setHex(isReady ? 0x00ff66 : 0xffaa00);
    }
  }
}
