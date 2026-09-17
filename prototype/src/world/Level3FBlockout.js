// Level3FBlockout.js - Act 1 Art Pass: 3F Admin, 316 Chief Resident Office, HIS Terminal, Elevator, 4F Closed Ward Entry & Duty Room
import * as THREE from 'three';

export class Level3FBlockout {
  constructor(scene) {
    this.scene = scene;
    this.interactables = [];
    this.colliders = [];
    this.walkables = [];
    this.materials = {};
    this.elevatorLight3F = null;
    this.elevatorLight4F = null;
    this.keyMesh = null;
    this.dutyLogMesh = null;
    this.workstationMesh = null;
    this.dutyRoomDoor = null;
    this.isDutyRoomUnlocked = false;

    this.initMaterials();
    this.build3FEnvironment();
    this.build3FElevatorLobby();
    this.build3FCorridor();
    this.build316Office();
    this.buildWorkstations();
    this.build3FCorridorProps();

    // 4F Minimal Pass & Duty Room
    this.build4FElevatorLobby();
    this.build4FClosedWardEntry();
    this.build4FDutyRoom();

    this.setupLighting();
  }

  initMaterials() {
    // 1. Procedural hospital vinyl tile floor texture (warm grey-beige linoleum)
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 256;
    floorCanvas.height = 256;
    const fctx = floorCanvas.getContext('2d');
    fctx.fillStyle = '#dfd8cb';
    fctx.fillRect(0, 0, 256, 256);
    fctx.strokeStyle = 'rgba(100, 92, 80, 0.18)';
    fctx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 64) {
      fctx.beginPath(); fctx.moveTo(i, 0); fctx.lineTo(i, 256); fctx.stroke();
      fctx.beginPath(); fctx.moveTo(0, i); fctx.lineTo(256, i); fctx.stroke();
    }
    for (let i = 0; i < 900; i++) {
      const shade = 190 + Math.floor(Math.random() * 30);
      fctx.fillStyle = `rgba(${shade},${shade - 6},${shade - 14},0.12)`;
      fctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    }
    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(8, 4);
    floorTexture.colorSpace = THREE.SRGBColorSpace;

    this.materials.floor3F = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: floorTexture,
      roughness: 0.42,
      metalness: 0.04
    });

    // 4F Vinyl floor (slightly deeper, quiet evening tint)
    this.materials.floor4F = new THREE.MeshStandardMaterial({
      color: 0xede6da,
      map: floorTexture,
      roughness: 0.46,
      metalness: 0.03
    });

    // Hospital wall (pale warm ivory plaster)
    this.materials.wall = new THREE.MeshStandardMaterial({
      color: 0xf6f3eb,
      roughness: 0.82
    });

    // 4F Wall (soft muted hospital neutral)
    this.materials.wall4F = new THREE.MeshStandardMaterial({
      color: 0xeeeae2,
      roughness: 0.85
    });

    // Warm natural beech / oak wood
    this.materials.wood = new THREE.MeshStandardMaterial({
      color: 0x8a623e,
      roughness: 0.52
    });

    // Office dark mahogany furniture
    this.materials.darkWood = new THREE.MeshStandardMaterial({
      color: 0x5a3c26,
      roughness: 0.58
    });

    // Lower hospital bumper strip (olive-sage green protective rubber)
    this.materials.bumperSage = new THREE.MeshStandardMaterial({
      color: 0x4a6254,
      roughness: 0.48
    });

    // Brushed satin steel (elevators, dispenser, handles)
    this.materials.steel = new THREE.MeshStandardMaterial({
      color: 0xd2d9dc,
      roughness: 0.35,
      metalness: 0.20
    });

    // Yellow safety hazard line
    this.materials.yellowSafety = new THREE.MeshStandardMaterial({
      color: 0xf5b82e,
      roughness: 0.4
    });

    // Ceiling acoustic tiles
    this.materials.ceiling = new THREE.MeshStandardMaterial({
      color: 0xedece8,
      roughness: 0.94
    });

    // Glass / Window with warm evening reflection
    this.materials.glass = new THREE.MeshStandardMaterial({
      color: 0xffcb94,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0.38
    });

    // 4F Security glass with frosted modesty bands
    this.materials.frostedGlass = new THREE.MeshStandardMaterial({
      color: 0xd8e8e2,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.55
    });

    // Fluorescent lamp casing
    this.materials.fixture = new THREE.MeshStandardMaterial({
      color: 0xd4d4d4,
      roughness: 0.4
    });

    // Fluorescent light emission
    this.materials.lightEmitter = new THREE.MeshBasicMaterial({
      color: 0xfffaed
    });

    // Brass key & hardware
    this.materials.brass = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.32,
      metalness: 0.92
    });

    // Crimson red for Fire cabinet
    this.materials.fireRed = new THREE.MeshStandardMaterial({
      color: 0xbe2525,
      roughness: 0.45,
      metalness: 0.35
    });

    // Crisp white hospital bedsheet / mattress
    this.materials.bedsheet = new THREE.MeshStandardMaterial({
      color: 0xf7f7f7,
      roughness: 0.88
    });

    // Folded wool hospital blanket (olive green)
    this.materials.blanket = new THREE.MeshStandardMaterial({
      color: 0x485e4d,
      roughness: 0.95
    });

    // Doctor white coat
    this.materials.whiteCoat = new THREE.MeshStandardMaterial({
      color: 0xf2f2f2,
      roughness: 0.8
    });
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

    const halfW = width / 2;
    const halfD = depth / 2;
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(x - halfW, y - height / 2, z - halfD),
      new THREE.Vector3(x + halfW, y + height / 2, z + halfD)
    ));
    return mesh;
  }

  build3FEnvironment() {
    // Sunset backdrop outside south windows (Taipei sunset horizon)
    const skyGeo = new THREE.PlaneGeometry(60, 20);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0xff7033,
      side: THREE.DoubleSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.position.set(0, 5, -16);
    this.scene.add(sky);
  }

  build3FElevatorLobby() {
    // 3F Elevator lobby floor: x: -12 to -4, z: -3.5 to 3.5, y: 0
    const floorGeo = new THREE.PlaneGeometry(8, 7);
    const floor = new THREE.Mesh(floorGeo, this.materials.floor3F);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(-8, 0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.addWalkable(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(8, 7);
    const ceil = new THREE.Mesh(ceilGeo, this.materials.ceiling);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(-8, 3.2, 0);
    this.scene.add(ceil);

    // Perimeter walls
    this.buildWall(-12, 1.6, 0, 0.4, 3.2, 7);   // West
    this.buildWall(-8, 1.6, 3.5, 8, 3.2, 0.4);  // North
    this.buildWall(-8, 1.6, -3.5, 8, 3.2, 0.4); // South

    // Elevator Door Frame & Sliding Doors (Brushed Stainless Steel)
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x6e767c, metalness: 0.35, roughness: 0.45 });
    const leftJamb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.16), doorFrameMat);
    leftJamb.position.set(-11.55, 1.20, -1.22);
    this.scene.add(leftJamb);

    const rightJamb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.16), doorFrameMat);
    rightJamb.position.set(-11.55, 1.20, 1.22);
    this.scene.add(rightJamb);

    const topHeader = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 2.60), doorFrameMat);
    topHeader.position.set(-11.55, 2.42, 0);
    this.scene.add(topHeader);

    // Realistic elevator sliding door panels
    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.30, 1.12), this.materials.steel);
    leftDoor.position.set(-11.58, 1.20, -0.58);
    this.scene.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.30, 1.12), this.materials.steel);
    rightDoor.position.set(-11.58, 1.20, 0.58);
    this.scene.add(rightDoor);

    // Dark seam between sliding doors
    const doorSeam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.30, 0.02), new THREE.MeshStandardMaterial({ color: 0x181c1e }));
    doorSeam.position.set(-11.57, 1.20, 0);
    this.scene.add(doorSeam);

    // Yellow safety boundary line in front of elevator
    const safetyLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 2.6),
      this.materials.yellowSafety
    );
    safetyLine.rotation.x = -Math.PI / 2;
    safetyLine.position.set(-10.8, 0.005, 0);
    this.scene.add(safetyLine);

    // Floor Indicator Panel over elevator (LED display "3F")
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.35, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x1f2124 })
    );
    panel.position.set(-11.6, 2.65, 0);
    this.scene.add(panel);

    const indCanvas = document.createElement('canvas');
    indCanvas.width = 256; indCanvas.height = 128;
    const ictx = indCanvas.getContext('2d');
    ictx.fillStyle = '#101214'; ictx.fillRect(0, 0, 256, 128);
    ictx.fillStyle = '#ff9922'; ictx.font = 'bold 56px monospace';
    ictx.textAlign = 'center'; ictx.textBaseline = 'middle';
    ictx.fillText('▲ 3F', 128, 64);
    const indTex = new THREE.CanvasTexture(indCanvas);
    const indScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.28), new THREE.MeshBasicMaterial({ map: indTex }));
    indScreen.rotation.y = Math.PI / 2;
    indScreen.position.set(-11.54, 2.65, 0);
    this.scene.add(indScreen);

    const indLight = new THREE.PointLight(0xffb03a, 1.4, 3.0);
    indLight.position.set(-11.4, 2.65, 0);
    this.scene.add(indLight);

    // Dedicated warm downlight for elevator threshold
    const elevatorDownlight = new THREE.PointLight(0xfff1dc, 1.2, 5.0);
    elevatorDownlight.position.set(-10.2, 3.0, 0);
    this.scene.add(elevatorDownlight);

    // Elevator Call Button Panel
    const buttonBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.4, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x2e3236, metalness: 0.8 })
    );
    buttonBox.position.set(-11.6, 1.2, 1.6);
    this.scene.add(buttonBox);

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
      type: 'elevator_3f'
    };
    this.interactables.push(callButton);
    this.elevatorLight3F = callButton;

    // Hospital Lobby Signage
    this.createSignMesh(-6, 2.7, 0, '🛗 電梯大廳 3F ｜ 往 4F 閉鎖病房 / 2F 急診');
  }

  build3FCorridor() {
    // Floor: x: -4 to 16, z: -2.5 to 2.5, y: 0
    const floorGeo = new THREE.PlaneGeometry(20, 5);
    const floor = new THREE.Mesh(floorGeo, this.materials.floor3F);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(6, 0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.addWalkable(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(20, 5);
    const ceil = new THREE.Mesh(ceilGeo, this.materials.ceiling);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(6, 3.2, 0);
    this.scene.add(ceil);

    // East end wall
    this.buildWall(16, 1.6, 0, 0.4, 3.2, 5);

    // South wall with large sunset windows
    this.buildWall(6, 0.5, -2.5, 20, 1.0, 0.4); // Sill
    this.buildWall(6, 3.0, -2.5, 20, 0.4, 0.4); // Lintel
    for (let x = -3; x <= 15; x += 3.5) {
      this.buildWall(x, 1.8, -2.5, 0.3, 2.0, 0.4);
    }
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(19, 1.8), this.materials.glass);
    glass.position.set(6, 1.8, -2.35);
    this.scene.add(glass);

    // North wall with doorway into 316 Chief Resident Office
    this.buildWall(-1.5, 1.6, 2.5, 5.0, 3.2, 0.4); // West segment (-4 to 1)
    this.buildWall(2, 2.8, 2.5, 2.0, 0.8, 0.4);     // Lintel over 316 door (1 to 3)
    this.buildWall(7.0, 1.6, 2.5, 8.0, 3.2, 0.4);   // Front wall of 316 office (3 to 11)
    this.buildWall(13.5, 1.6, 2.5, 5.0, 3.2, 0.4);  // East corridor segment (11 to 16)

    // Natural wood handrails along corridor
    [-2.31, 2.31].forEach((z) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(19.0, 0.09, 0.08), this.materials.wood);
      rail.position.set(6, 1.05, z);
      rail.castShadow = true;
      this.scene.add(rail);

      // Baseboard bumper
      const base = new THREE.Mesh(new THREE.BoxGeometry(19.0, 0.16, 0.04), this.materials.bumperSage);
      base.position.set(6, 0.08, z);
      this.scene.add(base);
    });

    // 316 Room Signage
    this.createSignMesh(2, 2.85, 2.25, '316 總醫師辦公室 (Chief Resident Office)');
  }

  build316Office() {
    // Floor: x: 1 to 11, z: 2.5 to 8.5, y: 0
    const floorGeo = new THREE.PlaneGeometry(10, 6);
    const floor = new THREE.Mesh(floorGeo, this.materials.floor3F);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(6, 0, 5.5);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.addWalkable(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(10, 6);
    const ceil = new THREE.Mesh(ceilGeo, this.materials.ceiling);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(6, 3.2, 5.5);
    this.scene.add(ceil);

    // Office walls
    this.buildWall(6, 1.6, 8.5, 10, 3.2, 0.4); // North back
    this.buildWall(1, 1.6, 5.5, 0.4, 3.2, 6);   // West
    this.buildWall(11, 1.6, 5.5, 0.4, 3.2, 6);  // East

    // Doorway trim and ajar door
    const doorLeaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 2.3, 0.05),
      this.materials.wood
    );
    doorLeaf.position.set(1.25, 1.15, 2.9);
    doorLeaf.rotation.y = Math.PI * 0.35; // Ajar into room
    this.scene.add(doorLeaf);

    // Main Doctor Office Desk
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.08, 1.2),
      this.materials.darkWood
    );
    deskTop.position.set(6.0, 0.78, 6.2);
    deskTop.castShadow = true;
    this.scene.add(deskTop);

    const deskBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.74, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x483222, roughness: 0.7 })
    );
    deskBody.position.set(6.0, 0.37, 6.2);
    this.scene.add(deskBody);
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(4.7, 0, 5.5),
      new THREE.Vector3(7.3, 1.0, 6.9)
    ));

    // Leather office swivel chair
    const chair = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.9, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.75 })
    );
    chair.position.set(6.0, 0.5, 7.3);
    this.scene.add(chair);

    // Whiteboard with authentic Taiwanese doctor handover memos
    const wbCanvas = document.createElement('canvas');
    wbCanvas.width = 512;
    wbCanvas.height = 256;
    const wbCtx = wbCanvas.getContext('2d');
    wbCtx.fillStyle = '#fbfcfc';
    wbCtx.fillRect(0, 0, 512, 256);
    wbCtx.strokeStyle = '#6c7a89';
    wbCtx.lineWidth = 8;
    wbCtx.strokeRect(4, 4, 504, 248);

    wbCtx.fillStyle = '#1b3a4b';
    wbCtx.font = 'bold 22px sans-serif';
    wbCtx.fillText('【松德院區】醫師夜間值班交班事項', 24, 38);

    wbCtx.fillStyle = '#b72525';
    wbCtx.font = 'bold 18px sans-serif';
    wbCtx.fillText('今日一線夜班：李住院醫師 (17:00–08:30)', 24, 76);

    wbCtx.fillStyle = '#222222';
    wbCtx.font = '16px sans-serif';
    wbCtx.fillText('• 二線主治：張主治醫師 (院外待命 / 分機 #3105)', 24, 110);
    wbCtx.fillText('• 4A~4D 病房巡視重點：注意夜間防跌與新入院留觀', 24, 142);
    wbCtx.fillText('• 晚餐已由 4F 護理站代訂，請至護理站確認', 24, 174);
    wbCtx.fillText('• 4F 獨立值班室出入請隨手關門上鎖', 24, 206);

    const wbTex = new THREE.CanvasTexture(wbCanvas);
    const whiteboard = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 1.35),
      new THREE.MeshBasicMaterial({ map: wbTex })
    );
    whiteboard.position.set(6.0, 2.0, 8.28);
    this.scene.add(whiteboard);

    // Warm Desk Reading Lamp (3500K golden pool)
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.04, 16),
      this.materials.steel
    );
    lampBase.position.set(5.1, 0.84, 6.5);
    this.scene.add(lampBase);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.22, 16),
      new THREE.MeshStandardMaterial({ color: 0xd9822b, roughness: 0.35 })
    );
    lampShade.position.set(5.1, 1.16, 6.5);
    this.scene.add(lampShade);

    const deskLight = new THREE.PointLight(0xffbe60, 2.2, 5.0);
    deskLight.position.set(5.1, 1.1, 6.4);
    deskLight.castShadow = true;
    this.scene.add(deskLight);

    // Stacks of Medical Paperwork / Folders on desk
    const folderGeo = new THREE.BoxGeometry(0.35, 0.06, 0.28);
    const folderMat = new THREE.MeshStandardMaterial({ color: 0x2b4f6b, roughness: 0.7 });
    const folders = new THREE.Mesh(folderGeo, folderMat);
    folders.position.set(7.0, 0.85, 6.4);
    this.scene.add(folders);

    // Stationery Pen Holder with pens
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.12, 16),
      this.materials.steel
    );
    cup.position.set(5.2, 0.88, 5.8);
    this.scene.add(cup);

    // Red Doctor Stamp Pad (印泥盒)
    const stampPad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16),
      this.materials.fireRed
    );
    stampPad.position.set(6.1, 0.83, 5.7);
    this.scene.add(stampPad);

    // High Bookshelf with Psychiatric Diagnostic Manuals (DSM-5 / Psychopharmacology)
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 2.4, 1.8),
      this.materials.darkWood
    );
    shelf.position.set(1.4, 1.2, 6.5);
    this.scene.add(shelf);
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(1.1, 0, 5.5),
      new THREE.Vector3(1.7, 2.4, 7.5)
    ));

    // Doctor White Coat hanging on wall hook
    const coatGroup = new THREE.Group();
    const coatBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.45), this.materials.whiteCoat);
    coatBody.position.set(0, 0, 0);
    coatGroup.add(coatBody);
    coatGroup.position.set(1.3, 1.8, 4.4);
    this.scene.add(coatGroup);

    // INTERACTABLE: 4F Duty Room Key (值班室鑰匙)
    const keyGroup = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 12, 24), this.materials.brass);
    keyGroup.add(ring);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.006, 0.12), this.materials.brass);
    blade.position.set(0, 0, 0.08);
    keyGroup.add(blade);
    const tag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.14), new THREE.MeshStandardMaterial({ color: 0x1f5f8b, roughness: 0.5 }));
    tag.position.set(0.06, 0, -0.04);
    keyGroup.add(tag);
    keyGroup.position.set(5.6, 0.83, 6.0);
    this.scene.add(keyGroup);

    const keyHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.25, 0.35),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    keyHitbox.position.copy(keyGroup.position);
    keyHitbox.userData = {
      interactable: true,
      id: 'KEY_PICKUP',
      label: '領取 4F 獨立值班室鑰匙 (Pickup Duty-Room Key)',
      type: 'key',
      targetGroup: keyGroup
    };
    this.scene.add(keyHitbox);
    this.interactables.push(keyHitbox);
    this.keyMesh = keyHitbox;

    // INTERACTABLE: Duty Log Book (值班本)
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.32), new THREE.MeshStandardMaterial({ color: 0x1b3c59, roughness: 0.6 }));
    book.position.set(6.4, 0.84, 6.0);
    this.scene.add(book);

    const page = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.28), new THREE.MeshStandardMaterial({ color: 0xf5f3ee, roughness: 0.9 }));
    page.rotation.x = -Math.PI / 2;
    page.position.set(6.4, 0.865, 6.0);
    this.scene.add(page);

    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18), new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6 }));
    pen.rotateZ(Math.PI / 2);
    pen.position.set(6.7, 0.84, 6.0);
    this.scene.add(pen);

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
    // Workstation desk in 316 office: x: 10.0, z: 5.5
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.08, 2.6),
      this.materials.wood
    );
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

    // Dual PC monitors, keyboard, chart rack
    [-0.6, 0.6].forEach((offsetZ, idx) => {
      // Monitor stand & casing
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.22), this.materials.steel);
      stand.position.set(10.2, 0.93, 5.5 + offsetZ);
      this.scene.add(stand);

      const casing = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.62), new THREE.MeshStandardMaterial({ color: 0x1f2326, roughness: 0.4 }));
      casing.position.set(10.2, 1.25, 5.5 + offsetZ);
      this.scene.add(casing);

      const display = new THREE.Mesh(
        new THREE.PlaneGeometry(0.58, 0.38),
        new THREE.MeshBasicMaterial({ color: idx === 0 ? 0x22553b : 0x1d2e3f })
      );
      display.rotation.y = -Math.PI / 2;
      display.position.set(10.16, 1.25, 5.5 + offsetZ);
      this.scene.add(display);

      const kb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.44), new THREE.MeshStandardMaterial({ color: 0x111111 }));
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

  build3FCorridorProps() {
    // 1. Authentic Taiwanese Hospital Water Dispenser (賀眾牌風格飲水機)
    const dispenserGroup = new THREE.Group();
    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.30, 0.44), this.materials.steel);
    body.position.set(0, 0.65, 0);
    dispenserGroup.add(body);
    // Dark dispensing alcove
    const alcove = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.35, 0.16), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    alcove.position.set(0, 0.78, 0.16);
    dispenserGroup.add(alcove);
    // 3 Spouts: Red (Hot), Yellow (Warm), Blue (Cold)
    const colors = [0xd12424, 0xe0a824, 0x2477d1];
    colors.forEach((col, i) => {
      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.06), new THREE.MeshStandardMaterial({ color: col }));
      spout.position.set(-0.10 + i * 0.10, 0.88, 0.20);
      dispenserGroup.add(spout);
    });
    // Drip tray
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.14), new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 }));
    tray.position.set(0, 0.62, 0.22);
    dispenserGroup.add(tray);
    dispenserGroup.position.set(-2.8, 0, -2.1);
    this.scene.add(dispenserGroup);
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(-3.1, 0, -2.4),
      new THREE.Vector3(-2.5, 1.4, -1.8)
    ));

    // Water dispenser interactable
    const wdHitbox = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 0.6), new THREE.MeshBasicMaterial({ visible: false }));
    wdHitbox.position.copy(dispenserGroup.position);
    wdHitbox.userData = {
      interactable: true,
      id: 'WATER_DISPENSER',
      label: '飲水機 (溫水 45°C / 運作正常)',
      type: 'prop_info',
      info: '李醫師：『值班前記得多喝點水。』'
    };
    this.scene.add(wdHitbox);
    this.interactables.push(wdHitbox);

    // 2. Hospital Waiting Benches (3-seat tandem chairs in sage green)
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x4f6b5b, roughness: 0.7 });
    [7.5, 8.8, 10.1].forEach((x) => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.46), seatMat);
      seat.position.set(x, 0.48, 2.05);
      seat.castShadow = true;
      this.scene.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.54, 0.08), seatMat);
      back.position.set(x, 0.78, 2.26);
      this.scene.add(back);
    });
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(7.0, 0, 1.8),
      new THREE.Vector3(10.7, 1.1, 2.4)
    ));

    // 3. Fire Hydrant & Extinguisher Cabinet (消防栓 / 滅火器箱)
    const fireCabinet = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 1.4, 0.75),
      this.materials.fireRed
    );
    fireCabinet.position.set(15.75, 1.4, -1.5);
    this.scene.add(fireCabinet);
    // Red indicator lamp on top
    const fireBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff3333 })
    );
    fireBulb.position.set(15.72, 2.2, -1.5);
    this.scene.add(fireBulb);

    // 4. Potted Plant in corridor nook
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.45, 20), new THREE.MeshStandardMaterial({ color: 0x826449, roughness: 0.9 }));
    pot.position.set(14.8, 0.22, -1.9);
    this.scene.add(pot);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3d664c, roughness: 0.85 });
    for (let i = 0; i < 8; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), leafMat);
      leaf.scale.set(0.65, 1.8, 0.55);
      const angle = i * Math.PI * 0.25;
      leaf.position.set(14.8 + Math.cos(angle) * 0.18, 0.60 + (i % 2) * 0.10, -1.9 + Math.sin(angle) * 0.18);
      leaf.rotation.z = Math.cos(angle) * 0.35;
      this.scene.add(leaf);
    }
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(14.3, 0, -2.4),
      new THREE.Vector3(15.3, 1.2, -1.4)
    ));

    // 5. East End Sunset Horizon Art Box
    const artCanvas = document.createElement('canvas');
    artCanvas.width = 512;
    artCanvas.height = 320;
    const artCtx = artCanvas.getContext('2d');
    const grad = artCtx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0, '#d87845');
    grad.addColorStop(0.45, '#e4a26c');
    grad.addColorStop(1, '#5b6d75');
    artCtx.fillStyle = grad;
    artCtx.fillRect(0, 0, 512, 320);
    artCtx.fillStyle = 'rgba(38,48,47,0.65)';
    for (let x = 0; x < 512; x += 55) {
      const h = 55 + (x % 110);
      artCtx.fillRect(x, 320 - h, 45, h);
    }
    const artTex = new THREE.CanvasTexture(artCanvas);
    const art = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 1.40), new THREE.MeshBasicMaterial({ map: artTex }));
    art.position.set(15.77, 1.75, 0);
    art.rotation.y = -Math.PI / 2;
    this.scene.add(art);
  }

  build4FElevatorLobby() {
    // 4F Elevator Lobby: x: -12 to -4, z: -3.5 to 3.5, y: 10.0
    const floorGeo = new THREE.PlaneGeometry(8, 7);
    const floor = new THREE.Mesh(floorGeo, this.materials.floor4F);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(-8, 10.0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.addWalkable(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(8, 7);
    const ceil = new THREE.Mesh(ceilGeo, this.materials.ceiling);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(-8, 13.2, 0);
    this.scene.add(ceil);

    // Walls
    this.buildWall(-12, 11.6, 0, 0.4, 3.2, 7, this.materials.wall4F);   // West
    this.buildWall(-8, 11.6, 3.5, 8, 3.2, 0.4, this.materials.wall4F);  // North
    this.buildWall(-8, 11.6, -3.5, 8, 3.2, 0.4, this.materials.wall4F); // South

    // Elevator Door Frame & Sliding Doors (4F)
    const doorFrameMat4F = new THREE.MeshStandardMaterial({ color: 0x6e767c, metalness: 0.35, roughness: 0.45 });
    const leftJamb4F = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.16), doorFrameMat4F);
    leftJamb4F.position.set(-11.55, 11.20, -1.22);
    this.scene.add(leftJamb4F);

    const rightJamb4F = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.16), doorFrameMat4F);
    rightJamb4F.position.set(-11.55, 11.20, 1.22);
    this.scene.add(rightJamb4F);

    const topHeader4F = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 2.60), doorFrameMat4F);
    topHeader4F.position.set(-11.55, 12.42, 0);
    this.scene.add(topHeader4F);

    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.30, 1.12), this.materials.steel);
    leftDoor.position.set(-11.58, 11.20, -0.58);
    this.scene.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.30, 1.12), this.materials.steel);
    rightDoor.position.set(-11.58, 11.20, 0.58);
    this.scene.add(rightDoor);

    // Dark seam between sliding doors
    const doorSeam4F = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.30, 0.02), new THREE.MeshStandardMaterial({ color: 0x181c1e }));
    doorSeam4F.position.set(-11.57, 11.20, 0);
    this.scene.add(doorSeam4F);

    // Yellow safety boundary line
    const safetyLine = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 2.6), this.materials.yellowSafety);
    safetyLine.rotation.x = -Math.PI / 2;
    safetyLine.position.set(-10.8, 10.005, 0);
    this.scene.add(safetyLine);

    // Floor Indicator Panel over elevator (Display "4F")
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.8), new THREE.MeshStandardMaterial({ color: 0x1f2124 }));
    panel.position.set(-11.6, 12.65, 0);
    this.scene.add(panel);

    const indCanvas4F = document.createElement('canvas');
    indCanvas4F.width = 256; indCanvas4F.height = 128;
    const ictx4F = indCanvas4F.getContext('2d');
    ictx4F.fillStyle = '#101214'; ictx4F.fillRect(0, 0, 256, 128);
    ictx4F.fillStyle = '#33ee88'; ictx4F.font = 'bold 56px monospace';
    ictx4F.textAlign = 'center'; ictx4F.textBaseline = 'middle';
    ictx4F.fillText('▲ 4F', 128, 64);
    const indTex4F = new THREE.CanvasTexture(indCanvas4F);
    const indScreen4F = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.28), new THREE.MeshBasicMaterial({ map: indTex4F }));
    indScreen4F.rotation.y = Math.PI / 2;
    indScreen4F.position.set(-11.54, 12.65, 0);
    this.scene.add(indScreen4F);

    const indLight = new THREE.PointLight(0x55ffaa, 1.2, 2.5);
    indLight.position.set(-11.4, 12.65, 0);
    this.scene.add(indLight);

    // Dedicated downlight for 4F elevator threshold
    const elevatorDownlight4F = new THREE.PointLight(0xfff1dc, 1.2, 5.0);
    elevatorDownlight4F.position.set(-10.2, 13.0, 0);
    this.scene.add(elevatorDownlight4F);

    // Call button to go back to 3F
    const buttonBox = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.2), new THREE.MeshStandardMaterial({ color: 0x2e3236, metalness: 0.8 }));
    buttonBox.position.set(-11.6, 11.2, 1.6);
    this.scene.add(buttonBox);

    const btnGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 16);
    btnGeo.rotateZ(Math.PI / 2);
    const btnMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
    const callButton = new THREE.Mesh(btnGeo, btnMat);
    callButton.position.set(-11.55, 11.2, 1.6);
    this.scene.add(callButton);

    callButton.userData = {
      interactable: true,
      id: 'ELEVATOR_BUTTON_4F',
      label: '搭乘電梯返回 3F 行政區 (Elevator to 3F)',
      type: 'elevator_4f'
    };
    this.interactables.push(callButton);
    this.elevatorLight4F = callButton;

    // Overhead Sign
    this.createSignMesh(-6, 12.7, 0, '🛗 電梯大廳 4F ｜ 4F 精神科閉鎖病房區');
  }

  build4FClosedWardEntry() {
    // 4F Corridor: x: -4 to 14, z: -2.5 to 2.5, y: 10.0
    const floorGeo = new THREE.PlaneGeometry(18, 5);
    const floor = new THREE.Mesh(floorGeo, this.materials.floor4F);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(5, 10.0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.addWalkable(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(18, 5);
    const ceil = new THREE.Mesh(ceilGeo, this.materials.ceiling);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(5, 13.2, 0);
    this.scene.add(ceil);

    // East end wall
    this.buildWall(14, 11.6, 0, 0.4, 3.2, 5, this.materials.wall4F);

    // North wall (Closed Ward Gate: 4A/4B Security Access)
    // Wall sections flanking the doorway (opening from x = 1.0 to x = 5.0)
    this.buildWall(-1.5, 11.6, 2.5, 5.0, 3.2, 0.4, this.materials.wall4F);
    this.buildWall(7.5, 11.6, 2.5, 5.0, 3.2, 0.4, this.materials.wall4F);
    this.buildWall(3.0, 12.8, 2.5, 4.0, 0.8, 0.4, this.materials.wall4F); // Lintel

    // Heavy Security Double Doors for Closed Psychiatric Ward (閉鎖病房安全門)
    // Door Jambs & Frame
    const jambMat = new THREE.MeshStandardMaterial({ color: 0x27362e, metalness: 0.6, roughness: 0.4 });
    const leftJamb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.22), jambMat);
    leftJamb.position.set(1.0, 11.2, 2.5);
    this.scene.add(leftJamb);

    const rightJamb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.22), jambMat);
    rightJamb.position.set(5.0, 11.2, 2.5);
    this.scene.add(rightJamb);

    const topHeader = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.12, 0.22), jambMat);
    topHeader.position.set(3.0, 12.36, 2.5);
    this.scene.add(topHeader);

    // Two heavy hospital door leaves
    const doorLeafMat = new THREE.MeshStandardMaterial({ color: 0x3d5047, metalness: 0.35, roughness: 0.6 });
    const kickPlateMat = new THREE.MeshStandardMaterial({ color: 0x889196, metalness: 0.8, roughness: 0.3 });
    const handleMat = this.materials.steel;

    [
      { x: 1.95, handleX: 2.80 },
      { x: 4.05, handleX: 3.20 }
    ].forEach((leaf) => {
      // Lower solid panel
      const lowerPanel = new THREE.Mesh(new THREE.BoxGeometry(1.82, 1.2, 0.08), doorLeafMat);
      lowerPanel.position.set(leaf.x, 10.6, 2.5);
      this.scene.add(lowerPanel);

      // Stainless steel kickplate at bottom
      const kickplate = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.28, 0.09), kickPlateMat);
      kickplate.position.set(leaf.x, 10.16, 2.5);
      this.scene.add(kickplate);

      // Upper door frame surround
      const upperLeftStile = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.15, 0.08), doorLeafMat);
      upperLeftStile.position.set(leaf.x - 0.70, 11.75, 2.5);
      this.scene.add(upperLeftStile);

      const upperRightStile = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.15, 0.08), doorLeafMat);
      upperRightStile.position.set(leaf.x + 0.70, 11.75, 2.5);
      this.scene.add(upperRightStile);

      const upperRail = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.15, 0.08), doorLeafMat);
      upperRail.position.set(leaf.x, 12.28, 2.5);
      this.scene.add(upperRail);

      // Vision panel (wire-reinforced safety glass window)
      const visionGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.0), this.materials.frostedGlass);
      visionGlass.position.set(leaf.x, 11.75, 2.5);
      this.scene.add(visionGlass);

      // Vertical push-pull bar handle
      const barHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 16), handleMat);
      barHandle.position.set(leaf.handleX, 11.05, 2.42);
      this.scene.add(barHandle);
    });

    // Electromagnetic lock unit at center top
    const magLock = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.12), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    magLock.position.set(3.0, 12.28, 2.45);
    this.scene.add(magLock);

    // Card Reader & Intercom unit on the wall beside gate (facing -Z towards corridor)
    const intercomGroup = new THREE.Group();
    const icBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.38, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x22262a, metalness: 0.7, roughness: 0.4 })
    );
    intercomGroup.add(icBody);

    // Keypad plate
    const icKeypad = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.14),
      new THREE.MeshBasicMaterial({ color: 0x334440 })
    );
    icKeypad.position.set(0, -0.06, 0.035);
    intercomGroup.add(icKeypad);

    // Status LED (green standby)
    const readerLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x22ff66 })
    );
    readerLight.position.set(0.06, 0.12, 0.035);
    intercomGroup.add(readerLight);

    // Call button
    const icCallBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0xc43c3c })
    );
    icCallBtn.rotateX(Math.PI / 2);
    icCallBtn.position.set(-0.04, 0.12, 0.035);
    intercomGroup.add(icCallBtn);

    intercomGroup.position.set(4.85, 11.3, 2.44);
    this.scene.add(intercomGroup);

    // Intercom & gate hitbox
    const gateHitbox = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 0.6), new THREE.MeshBasicMaterial({ visible: false }));
    gateHitbox.position.set(3.0, 11.2, 2.5);
    gateHitbox.userData = {
      interactable: true,
      id: 'CLOSED_WARD_GATE',
      label: '4A/4B 精神科閉鎖病房大門 (門禁鎖定)',
      type: 'prop_info',
      info: '李醫師：『4A/4B 閉鎖病房門禁嚴格，平時皆由護理站電子中控上鎖。值班若非緊急呼叫不可擅自進入。』'
    };
    this.scene.add(gateHitbox);
    this.interactables.push(gateHitbox);

    // Overhead Exit / Access Signs
    this.createSignMesh(3.0, 12.82, 2.44, '⛔ 4A/4B 閉鎖病房 ｜ 門禁管制 (刷卡進入)', -1);

    // Green Emergency Exit Light Box
    const exitBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.12), new THREE.MeshStandardMaterial({ color: 0x1f2320 }));
    exitBox.position.set(3.0, 13.08, 2.38);
    this.scene.add(exitBox);
    const exitSign = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.18), new THREE.MeshBasicMaterial({ color: 0x1db85b }));
    exitSign.rotation.y = Math.PI;
    exitSign.scale.x = -1;
    exitSign.position.set(3.0, 13.08, 2.31);
    this.scene.add(exitSign);

    // Ward Interior Beyond Depth (dim distant ward corridor)
    const wardCorridorWall = this.materials.wall4F;
    const wardFloor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), this.materials.floor4F);
    wardFloor.rotation.x = -Math.PI / 2;
    wardFloor.position.set(3.0, 10.0, 5.5);
    this.scene.add(wardFloor);

    const wardCeil = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), this.materials.ceiling);
    wardCeil.rotation.x = Math.PI / 2;
    wardCeil.position.set(3.0, 13.2, 5.5);
    this.scene.add(wardCeil);

    const wardBackWall = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), wardCorridorWall);
    wardBackWall.rotation.y = Math.PI;
    wardBackWall.position.set(3.0, 11.6, 8.5);
    this.scene.add(wardBackWall);

    // Dim night nurse station glow in the background behind frosted glass
    const wardAmbientLight = new THREE.PointLight(0xaad8e6, 0.6, 7.0);
    wardAmbientLight.position.set(3.0, 11.8, 5.0);
    this.scene.add(wardAmbientLight);

    // South wall of 4F corridor (leads to 4F Duty Room)
    this.buildWall(-1.5, 11.6, -2.5, 5.0, 3.2, 0.4, this.materials.wall4F);
    this.buildWall(11.5, 11.6, -2.5, 5.0, 3.2, 0.4, this.materials.wall4F);
    this.buildWall(5.0, 12.8, -2.5, 8.0, 0.8, 0.4, this.materials.wall4F); // Lintel over duty room area

    // Directional signs overhead in corridor (placed away from gate view)
    this.createSignMesh(-1.5, 12.7, 0, '← 4A/4B 閉鎖病房 ｜ 4F 獨立值班室 ➔');
    this.createSignMesh(-1.5, 12.7, 0.05, '← 4A/4B 閉鎖病房 ｜ 4F 獨立值班室 ➔', -1);
  }

  build4FDutyRoom() {
    // 4F Independent Duty Room: x: 2 to 9, z: -2.5 to -8.5, y: 10.0
    // Floor
    const floorGeo = new THREE.PlaneGeometry(7, 6);
    const floor = new THREE.Mesh(floorGeo, this.materials.floor4F);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(5.5, 10.0, -5.5);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.addWalkable(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(7, 6);
    const ceil = new THREE.Mesh(ceilGeo, this.materials.ceiling);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(5.5, 13.2, -5.5);
    this.scene.add(ceil);

    // Room perimeter walls
    this.buildWall(5.5, 11.6, -8.5, 7.0, 3.2, 0.4, this.materials.wall4F); // South
    this.buildWall(2.0, 11.6, -5.5, 0.4, 3.2, 6.0, this.materials.wall4F); // West
    this.buildWall(9.0, 11.6, -5.5, 0.4, 3.2, 6.0, this.materials.wall4F); // East

    // North wall of duty room has door opening at x = 5.0
    this.buildWall(3.2, 11.6, -2.5, 2.0, 3.2, 0.4, this.materials.wall4F);
    this.buildWall(7.5, 11.6, -2.5, 3.0, 3.2, 0.4, this.materials.wall4F);
    this.buildWall(5.1, 12.8, -2.5, 1.8, 0.8, 0.4, this.materials.wall4F);

    // REAL CLOSABLE WOODEN DOOR FOR DUTY ROOM
    const doorGroup = new THREE.Group();
    const doorLeaf = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 2.3, 0.06),
      this.materials.wood
    );
    doorLeaf.position.set(0.55, 1.15, 0);
    doorGroup.add(doorLeaf);

    // Brass door handle & lock
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12), this.materials.brass);
    knob.rotateZ(Math.PI / 2);
    knob.position.set(0.95, 1.05, 0.04);
    doorGroup.add(knob);

    // Door sign plate: "4F 醫師值班室"
    const plateCanvas = document.createElement('canvas');
    plateCanvas.width = 256; plateCanvas.height = 64;
    const pctx = plateCanvas.getContext('2d');
    pctx.fillStyle = '#1c3d31'; pctx.fillRect(0, 0, 256, 64);
    pctx.fillStyle = '#ffffff'; pctx.font = 'bold 22px sans-serif';
    pctx.textAlign = 'center'; pctx.textBaseline = 'middle';
    pctx.fillText('4F 醫師值班室', 128, 32);
    const plateTex = new THREE.CanvasTexture(plateCanvas);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.14), new THREE.MeshBasicMaterial({ map: plateTex }));
    plate.position.set(0.55, 1.55, 0.04);
    doorGroup.add(plate);

    doorGroup.position.set(4.5, 10.0, -2.5);
    this.scene.add(doorGroup);
    this.dutyRoomDoor = doorGroup;

    // Door Hitbox / Interactable
    const doorHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.4, 0.6),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    doorHitbox.position.set(5.1, 11.2, -2.5);
    doorHitbox.userData = {
      interactable: true,
      id: 'DUTY_ROOM_DOOR',
      label: '4F 獨立值班室 (使用鑰匙開啟門鎖)',
      type: 'duty_room_door'
    };
    this.scene.add(doorHitbox);
    this.interactables.push(doorHitbox);

    // --- INSIDE THE INDEPENDENT DUTY ROOM (Private Sanctuary) ---

    // 1. Single Bed (溫暖獨立套房單人床)
    const bedGroup = new THREE.Group();
    // Wooden bed frame
    const bedFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.35, 2.2),
      this.materials.darkWood
    );
    bedFrame.position.set(0, 0.175, 0);
    bedGroup.add(bedFrame);

    // Headboard
    const headboard = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.85, 0.08),
      this.materials.darkWood
    );
    headboard.position.set(0, 0.42, -1.06);
    bedGroup.add(headboard);

    // White mattress & clean sheet
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.22, 2.05),
      this.materials.bedsheet
    );
    mattress.position.set(0, 0.42, 0);
    bedGroup.add(mattress);

    // Blue-striped Hospital Pillow
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.12, 0.42),
      new THREE.MeshStandardMaterial({ color: 0xedf3f7, roughness: 0.9 })
    );
    pillow.position.set(0, 0.55, -0.75);
    bedGroup.add(pillow);

    // Folded green wool hospital blanket
    const blanket = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.08, 1.1),
      this.materials.blanket
    );
    blanket.position.set(0, 0.52, 0.45);
    bedGroup.add(blanket);

    bedGroup.position.set(3.2, 10.0, -7.0);
    this.scene.add(bedGroup);
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(2.5, 10.0, -8.3),
      new THREE.Vector3(3.9, 11.2, -5.7)
    ));

    // Bed interactable
    const bedHitbox = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.8, 2.2), new THREE.MeshBasicMaterial({ visible: false }));
    bedHitbox.position.copy(bedGroup.position);
    bedHitbox.position.y += 0.4;
    bedHitbox.userData = {
      interactable: true,
      id: 'DUTY_BED',
      label: '檢視值班床鋪 (床單整潔，已更換乾淨枕套)',
      type: 'prop_info',
      info: '李醫師：『床單剛換過，今晚有空檔時可以在這裡休息。』'
    };
    this.scene.add(bedHitbox);
    this.interactables.push(bedHitbox);

    // 2. Bedside Nightstand & Warm Sanctuary Lamp (3200K)
    const nightstand = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.55),
      this.materials.wood
    );
    nightstand.position.set(4.2, 10.28, -8.0);
    this.scene.add(nightstand);
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(3.9, 10.0, -8.3),
      new THREE.Vector3(4.5, 10.8, -7.7)
    ));

    // Warm Bedside Lamp
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.03, 16), this.materials.brass);
    lampBase.position.set(4.2, 10.58, -8.0);
    this.scene.add(lampBase);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 16), new THREE.MeshStandardMaterial({ color: 0xffaa44, roughness: 0.3 }));
    lampShade.position.set(4.2, 10.80, -8.0);
    this.scene.add(lampShade);

    const dutyLampLight = new THREE.PointLight(0xffb855, 2.0, 4.5);
    dutyLampLight.position.set(4.2, 10.78, -7.9);
    dutyLampLight.castShadow = true;
    this.scene.add(dutyLampLight);

    // 3. Doctor Desk in Duty Room (with landline phone)
    const dutyDesk = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.08, 0.85),
      this.materials.wood
    );
    dutyDesk.position.set(7.5, 10.78, -7.8);
    this.scene.add(dutyDesk);

    const deskLeg = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.74, 0.75), this.materials.darkWood);
    deskLeg.position.set(7.5, 10.37, -7.8);
    this.scene.add(deskLeg);
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(6.6, 10.0, -8.3),
      new THREE.Vector3(8.4, 11.0, -7.3)
    ));

    // Panasonic Hospital Landline Telephone (公務分機電話)
    const phoneBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.05, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 })
    );
    phoneBase.position.set(7.1, 10.85, -7.7);
    this.scene.add(phoneBase);

    const phoneHandset = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.04, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 })
    );
    phoneHandset.position.set(7.08, 10.90, -7.7);
    this.scene.add(phoneHandset);

    // Phone interactable
    const phoneHitbox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), new THREE.MeshBasicMaterial({ visible: false }));
    phoneHitbox.position.copy(phoneBase.position);
    phoneHitbox.userData = {
      interactable: true,
      id: 'DUTY_PHONE',
      label: '檢查值班公務電話 (分機 #4102 通話正常)',
      type: 'prop_info',
      info: '李醫師：『公務分機運作正常，護理站有急事會撥這支。』'
    };
    this.scene.add(phoneHitbox);
    this.interactables.push(phoneHitbox);

    // Doctor chair at duty desk
    const dutyChair = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.85, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    dutyChair.position.set(7.5, 10.45, -6.8);
    this.scene.add(dutyChair);

    // Doctor white coat on back of duty room door
    const extraCoat = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.4), this.materials.whiteCoat);
    extraCoat.position.set(8.75, 11.6, -4.5);
    this.scene.add(extraCoat);
  }

  unlockDutyRoom() {
    if (this.isDutyRoomUnlocked || !this.dutyRoomDoor) return;
    this.isDutyRoomUnlocked = true;
    // Animate door swinging open 85 degrees
    this.dutyRoomDoor.rotation.y = -Math.PI * 0.45;
  }

  createSignMesh(x, y, z, text, faceDir = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#213a30'; // Hospital dark green
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#c5d8cf';
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
    if (faceDir === -1) {
      sign.rotation.y = Math.PI;
      sign.scale.x = -1;
    }
    this.scene.add(sign);
    return sign;
  }

  setupLighting() {
    // Ambient light - warm hospital indoor bounce (Phase W1)
    const ambient = new THREE.AmbientLight(0xfff0dc, 0.72);
    this.scene.add(ambient);

    // Sunset Directional Light (low angle from south windows)
    const sunsetSun = new THREE.DirectionalLight(0xff9a50, 2.6);
    sunsetSun.position.set(6, 4, -14);
    sunsetSun.target.position.set(6, 1, 2);
    sunsetSun.castShadow = true;
    sunsetSun.shadow.mapSize.width = 1024;
    sunsetSun.shadow.mapSize.height = 1024;
    sunsetSun.shadow.camera.near = 0.5;
    sunsetSun.shadow.camera.far = 30;
    this.scene.add(sunsetSun);
    this.scene.add(sunsetSun.target);

    // Ceiling fluorescent fixtures for 3F (warm white 4000K)
    const fixture3FPositions = [
      { x: -8, y: 3.15, z: 0 },    // Elevator lobby
      { x: -1.5, y: 3.15, z: 0 },  // Corridor west
      { x: 2.5, y: 3.15, z: 0 },   // Corridor west-mid
      { x: 6.5, y: 3.15, z: 0 },   // Corridor mid
      { x: 10.5, y: 3.15, z: 0 },  // Corridor east-mid
      { x: 14.0, y: 3.15, z: 0 },  // Corridor east
      { x: 4.5, y: 3.15, z: 5.5 }, // Office west
      { x: 8.0, y: 3.15, z: 5.5 }  // Office east
    ];

    fixture3FPositions.forEach(pos => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.4), this.materials.fixture);
      box.position.set(pos.x, pos.y, pos.z);
      this.scene.add(box);

      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.25), this.materials.lightEmitter);
      bar.position.set(pos.x, pos.y - 0.04, pos.z);
      this.scene.add(bar);

      const light = new THREE.PointLight(0xfff1cf, 0.85, 6.5);
      light.position.set(pos.x, pos.y - 0.2, pos.z);
      this.scene.add(light);
    });

    // Ceiling fluorescent fixtures for 4F (evening warm white 3800K)
    const fixture4FPositions = [
      { x: -8, y: 13.15, z: 0 },    // 4F Elevator lobby
      { x: -1.0, y: 13.15, z: 0 },  // 4F Corridor west
      { x: 4.0, y: 13.15, z: 0 },   // 4F Gate area
      { x: 9.0, y: 13.15, z: 0 },   // 4F Corridor east
      { x: 5.5, y: 13.15, z: -5.5 } // 4F Duty Room ceiling
    ];

    fixture4FPositions.forEach(pos => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.4), this.materials.fixture);
      box.position.set(pos.x, pos.y, pos.z);
      this.scene.add(box);

      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.25), this.materials.lightEmitter);
      bar.position.set(pos.x, pos.y - 0.04, pos.z);
      this.scene.add(bar);

      const light = new THREE.PointLight(0xffe8c6, 0.75, 6.0);
      light.position.set(pos.x, pos.y - 0.2, pos.z);
      this.scene.add(light);
    });
  }

  updateElevatorLight(isReady) {
    if (this.elevatorLight3F) {
      this.elevatorLight3F.material.color.setHex(isReady ? 0x00ff66 : 0xffaa00);
    }
  }
}
