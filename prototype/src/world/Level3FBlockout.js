// Level3FBlockout.js - 3F Administration Blockout with Sunset Warmth
import * as THREE from 'three';

export class Level3FBlockout {
  constructor(scene) {
    this.scene = scene;
    this.interactables = [];
    this.colliders = [];
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
    this.setupLighting();
  }

  initMaterials() {
    // Hospital vinyl floor (warm grey/beige)
    this.materials.floor = new THREE.MeshStandardMaterial({
      color: 0xdfd9ce,
      roughness: 0.35,
      metalness: 0.05
    });

    // Hospital wall (pale warm ivory)
    this.materials.wall = new THREE.MeshStandardMaterial({
      color: 0xf5f2eb,
      roughness: 0.85
    });

    // Wall protective bumper strip / baseboard (warm wood/sage)
    this.materials.bumper = new THREE.MeshStandardMaterial({
      color: 0x5a7364,
      roughness: 0.5
    });

    // Ceiling tiles
    this.materials.ceiling = new THREE.MeshStandardMaterial({
      color: 0xededed,
      roughness: 0.95
    });

    // Elevator doors (brushed stainless steel)
    this.materials.elevatorDoor = new THREE.MeshStandardMaterial({
      color: 0x9fa3a6,
      roughness: 0.25,
      metalness: 0.8
    });

    // Wood desks
    this.materials.wood = new THREE.MeshStandardMaterial({
      color: 0x7a5230,
      roughness: 0.6
    });

    // Fluorescent fixture casing
    this.materials.fixture = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.4
    });

    // Fluorescent emission
    this.materials.lightEmitter = new THREE.MeshBasicMaterial({
      color: 0xfffbee
    });

    // Glass / Window
    this.materials.glass = new THREE.MeshStandardMaterial({
      color: 0xffd199,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.35
    });

    // Brass key
    this.materials.brass = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.9
    });

    // Computer screen
    this.materials.screen = new THREE.MeshBasicMaterial({
      color: 0x1a4532
    });
  }

  addCollider(box) {
    this.colliders.push(box);
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
    // Sunset backdrop outside south windows
    const skyGeo = new THREE.PlaneGeometry(60, 20);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0xff7733,
      side: THREE.DoubleSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.position.set(0, 5, -16);
    this.scene.add(sky);
  }

  buildElevatorLobby() {
    // Elevator lobby floor: x from -12 to -4, z from -3.5 to 3.5
    const floorGeo = new THREE.PlaneGeometry(8, 7);
    const floor = new THREE.Mesh(floorGeo, this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(-8, 0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(8, 7);
    const ceil = new THREE.Mesh(ceilGeo, this.materials.ceiling);
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

    // Floor indicator text 3F glow
    const indLight = new THREE.PointLight(0xffb03a, 1.2, 2.5);
    indLight.position.set(-11.4, 2.65, 0);
    this.scene.add(indLight);

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
      label: '搭乘電梯前往 4F 閉鎖病房 (Elevator to 4F)',
      type: 'elevator'
    };
    this.interactables.push(callButton);
    this.elevatorLight = callButton;

    // Overhead sign
    this.createSignMesh(-6, 2.7, 0, '🛗 電梯大廳 3F | 往 4F 閉鎖病房 / 2F 急診');
  }

  buildCorridor() {
    // Corridor floor: x from -4 to 16, z from -2.5 to 2.5
    const floorGeo = new THREE.PlaneGeometry(20, 5);
    const floor = new THREE.Mesh(floorGeo, this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(6, 0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Corridor ceiling
    const ceilGeo = new THREE.PlaneGeometry(20, 5);
    const ceil = new THREE.Mesh(ceilGeo, this.materials.ceiling);
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
    // Wall segment west of office door (x from -4 to 1)
    this.buildWall(-1.5, 1.6, 2.5, 5.0, 3.2, 0.4);
    // Doorway opening from x = 1 to 3
    // Lintel over doorway
    this.buildWall(2, 2.8, 2.5, 2.0, 0.8, 0.4);
    // Wall segment east of office (x from 11 to 16)
    this.buildWall(13.5, 1.6, 2.5, 5.0, 3.2, 0.4);

    // Directional sign at entrance
    this.createSignMesh(2, 2.85, 2.25, '302 醫師值班簽到室 (Duty Office)');
  }

  buildDutyOffice() {
    // Duty office floor: x from 1 to 11, z from 2.5 to 8.5
    const floorGeo = new THREE.PlaneGeometry(10, 6);
    const floor = new THREE.Mesh(floorGeo, this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(6, 0, 5.5);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(10, 6);
    const ceil = new THREE.Mesh(ceilGeo, this.materials.ceiling);
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
    board.position.set(6.0, 2.0, 8.28);
    this.scene.add(board);

    // Desk warm lamp
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
    );
    lampBase.position.set(5.1, 0.84, 6.5);
    this.scene.add(lampBase);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xd9822b, roughness: 0.4 })
    );
    lampShade.position.set(5.1, 1.15, 6.5);
    this.scene.add(lampShade);

    // Desk warm point light (3800K glow)
    const deskLight = new THREE.PointLight(0xffbf66, 1.8, 4.5);
    deskLight.position.set(5.1, 1.1, 6.4);
    deskLight.castShadow = true;
    this.scene.add(deskLight);

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

    // Key plastic tag with 402
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
      label: '領取 4F 值班室鑰匙 (Pickup Duty-Room Key)',
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
      label: '簽署值班名冊 (Sign Duty Log)',
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

      // Glowing display
      const displayGeo = new THREE.PlaneGeometry(0.58, 0.38);
      const displayMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x234f3b : 0x1d2e3f
      });
      const display = new THREE.Mesh(displayGeo, displayMat);
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
          label: '使用電子交班工作站 (Electronic Handoff Workstation)',
          type: 'workstation'
        };
        this.scene.add(wsHitbox);
        this.interactables.push(wsHitbox);
        this.workstationMesh = wsHitbox;
      }
    });
  }

  createSignMesh(x, y, z, text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2c4b3e'; // Hospital dark green
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#e0eae2';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshBasicMaterial({ map: texture });
    const signGeo = new THREE.PlaneGeometry(2.4, 0.6);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, y, z);
    this.scene.add(sign);
  }

  setupLighting() {
    // Ambient light - warm hospital indoor bounce (Phase W1)
    const ambient = new THREE.AmbientLight(0xfff3e6, 0.9);
    this.scene.add(ambient);

    // Sunset Directional Light (low angle from south windows)
    const sunsetSun = new THREE.DirectionalLight(0xffa254, 2.2);
    sunsetSun.position.set(6, 4, -14);
    sunsetSun.target.position.set(6, 1, 2);
    sunsetSun.castShadow = true;
    sunsetSun.shadow.mapSize.width = 1024;
    sunsetSun.shadow.mapSize.height = 1024;
    sunsetSun.shadow.camera.near = 0.5;
    sunsetSun.shadow.camera.far = 30;
    this.scene.add(sunsetSun);
    this.scene.add(sunsetSun.target);

    // Ceiling fluorescent fixtures (warm white 4000K)
    const fixturePositions = [
      { x: -8, y: 3.15, z: 0 },    // Elevator lobby
      { x: -1, y: 3.15, z: 0 },    // Corridor west
      { x: 5, y: 3.15, z: 0 },     // Corridor mid
      { x: 11, y: 3.15, z: 0 },    // Corridor east
      { x: 6, y: 3.15, z: 5.5 }    // Office center
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

      // Soft point light
      const light = new THREE.PointLight(0xfffaea, 0.95, 7.5);
      light.position.set(pos.x, pos.y - 0.2, pos.z);
      this.scene.add(light);
    });
  }

  updateElevatorLight(isReady) {
    if (this.elevatorLight) {
      this.elevatorLight.material.color.setHex(isReady ? 0x00ff66 : 0xffaa00);
    }
  }
}
