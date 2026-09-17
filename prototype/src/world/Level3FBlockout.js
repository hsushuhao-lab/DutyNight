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
      color: 0x966842,
      roughness: 0.52
    });

    // Hospital wood laminate wainscoting (lower wall protective paneling, A01 reference)
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 256; woodCanvas.height = 256;
    const wctx = woodCanvas.getContext('2d');
    wctx.fillStyle = '#9e6d42';
    wctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 4) {
      wctx.fillStyle = `rgba(120, 80, 45, ${0.12 + (y % 8 === 0 ? 0.08 : 0.03)})`;
      wctx.fillRect(0, y, 256, 2);
    }
    const woodTex = new THREE.CanvasTexture(woodCanvas);
    woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
    woodTex.repeat.set(6, 1);
    this.materials.woodWainscot = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.48,
      metalness: 0.04
    });

    // Cork bulletin board material (with fine fleck texture)
    const corkCanvas = document.createElement('canvas');
    corkCanvas.width = 128; corkCanvas.height = 128;
    const cctx = corkCanvas.getContext('2d');
    cctx.fillStyle = '#b8895b'; cctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 400; i++) {
      const c = 150 + Math.floor(Math.random() * 45);
      cctx.fillStyle = `rgba(${c},${c - 30},${c - 60},0.22)`;
      cctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
    }
    const corkTex = new THREE.CanvasTexture(corkCanvas);
    corkTex.wrapS = corkTex.wrapT = THREE.RepeatWrapping;
    this.materials.cork = new THREE.MeshStandardMaterial({ map: corkTex, roughness: 0.95 });

    // Office dark mahogany furniture
    this.materials.darkWood = new THREE.MeshStandardMaterial({
      color: 0x4e3321,
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

    // Sconce warm diffuse lightbox
    this.materials.sconceLight = new THREE.MeshBasicMaterial({
      color: 0xffdfa8
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

    // Hospital Lobby Signage & Floor Directory Board (Step 4 Reference)
    this.createSignMesh(-6, 2.7, 0, '🛗 電梯大廳 3F ｜ 往 4F 閉鎖病房 / 2F 急診', -Math.PI / 2);
    this.buildElevatorDirectoryBoard(-11.75, 1.65, -2.2, '3F');
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

    // Wood laminate wainscoting panels (lower wall protection, A01 reference)
    const wainscotMat = this.materials.woodWainscot;
    // North wall wainscots
    const wNorth1 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.15, 0.04), wainscotMat);
    wNorth1.position.set(-1.5, 0.58, 2.29);
    this.scene.add(wNorth1);

    const wNorth2 = new THREE.Mesh(new THREE.BoxGeometry(8.0, 1.15, 0.04), wainscotMat);
    wNorth2.position.set(7.0, 0.58, 2.29);
    this.scene.add(wNorth2);

    const wNorth3 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.15, 0.04), wainscotMat);
    wNorth3.position.set(13.5, 0.58, 2.29);
    this.scene.add(wNorth3);

    // South wall window sill wainscot
    const wSouth = new THREE.Mesh(new THREE.BoxGeometry(20.0, 1.0, 0.04), wainscotMat);
    wSouth.position.set(6.0, 0.50, -2.29);
    this.scene.add(wSouth);

    // Natural beech wood handrails along corridor (at top of wainscot)
    [-2.27, 2.27].forEach((z) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(19.5, 0.09, 0.08), this.materials.wood);
      rail.position.set(6, 1.15, z);
      rail.castShadow = true;
      this.scene.add(rail);

      // Baseboard bumper
      const base = new THREE.Mesh(new THREE.BoxGeometry(19.5, 0.16, 0.04), this.materials.bumperSage);
      base.position.set(6, 0.08, z);
      this.scene.add(base);
    });

    // Wall Sconces between doorways & pillars (A01 reference)
    [-2.5, 0.5, 4.0, 7.5, 11.0, 14.5].forEach((x) => {
      this.buildCorridorSconce(x, 2.15, 2.27);
    });

    // Authentic Taiwanese Public Hospital Bulletin Boards (A01 reference)
    // Board 1: Infection Control & Night Duty Guide
    this.buildHospitalBulletinBoard(4.5, 1.85, 2.28, 1);
    // Board 2: Monthly Doctor Shift Schedule
    this.buildHospitalBulletinBoard(13.2, 1.85, 2.28, 2);

    // 316 Room Signage (mounted on north wall facing south corridor)
    this.createSignMesh(2, 2.85, 2.25, '316 總醫師辦公室 (Chief Resident Office)', Math.PI);

    // Overhead corridor directional signage
    this.createSignMesh(6.0, 2.7, 0, '← 301-320 醫師行政區 ｜ 電梯大廳 ➔', -Math.PI / 2);
    this.createSignMesh(6.0, 2.7, 0.05, '← 電梯大廳 ｜ 301-320 醫師行政區 ➔', Math.PI / 2);

    // East end corridor facility sign (mounted on north wall facing south)
    this.createSignMesh(15.2, 2.2, 2.25, '🚻 男/女化妝室 ｜ 🚪 安全梯 Exit', Math.PI);
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

    // Doorway trim, lever handle, and ajar door with vision slit
    const doorGroup = new THREE.Group();
    const doorLeaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 2.3, 0.05),
      this.materials.wood
    );
    doorLeaf.position.set(0.425, 1.15, 0);
    doorGroup.add(doorLeaf);

    // Vertical vision slit in door
    const doorVision = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 0.85),
      this.materials.frostedGlass
    );
    doorVision.position.set(0.55, 1.35, 0.03);
    doorGroup.add(doorVision);

    // Stainless lever handle
    const doorHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.03, 0.06),
      this.materials.steel
    );
    doorHandle.position.set(0.75, 1.05, 0.04);
    doorGroup.add(doorHandle);

    doorGroup.position.set(1.0, 0, 2.5);
    doorGroup.rotation.y = Math.PI * 0.35; // Ajar into room
    this.scene.add(doorGroup);

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
    whiteboard.rotation.y = Math.PI;
    whiteboard.position.set(6.0, 2.0, 8.28);
    this.scene.add(whiteboard);

    // Wall Clock showing 17:05 (A01/A07 reference)
    const clock = this.createAnalogClock(17, 5);
    clock.rotation.y = Math.PI;
    clock.position.set(3.5, 2.4, 8.28);
    this.scene.add(clock);

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

    // 1. Multi-tier Document Organizer (5 tiers, A07 reference: 待簽醫囑/病程紀錄/檢查申請...)
    const trayGroup = new THREE.Group();
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x3a4852, roughness: 0.5 });
    for (let i = 0; i < 5; i++) {
      const tier = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.34), trayMat);
      tier.position.set(0, i * 0.05, 0);
      trayGroup.add(tier);
      // Paper sheet inside tray
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.30), new THREE.MeshBasicMaterial({ color: 0xfdfbf7 }));
      sheet.rotation.x = -Math.PI / 2;
      sheet.position.set(0, i * 0.05 + 0.012, 0);
      trayGroup.add(sheet);
    }
    trayGroup.position.set(7.0, 0.83, 6.5);
    this.scene.add(trayGroup);

    // 2. Bookend Rack with Medical Chart Binders (A07 reference: 病房交班本, 精神科指引...)
    const binderColors = [0x1e3d59, 0x175841, 0x8c2b2b, 0x4a4a4a];
    binderColors.forEach((col, i) => {
      const binder = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.28, 0.24),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 })
      );
      binder.position.set(6.8 + i * 0.07, 0.96, 5.7);
      this.scene.add(binder);
    });

    // 3. Yellow Legal Pad Clipboard (A07 reference)
    const clipBoard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.015, 0.32), new THREE.MeshStandardMaterial({ color: 0x7c5835 }));
    clipBoard.position.set(6.0, 0.83, 5.7);
    this.scene.add(clipBoard);
    const yellowPad = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.28), new THREE.MeshBasicMaterial({ color: 0xfbee9d }));
    yellowPad.rotation.x = -Math.PI / 2;
    yellowPad.position.set(6.0, 0.84, 5.7);
    this.scene.add(yellowPad);

    // 4. Avaya Landline Hospital Telephone (A08 reference)
    const phoneBase = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.06, 0.22), new THREE.MeshStandardMaterial({ color: 0x1e2224 }));
    phoneBase.position.set(4.9, 0.85, 5.7);
    this.scene.add(phoneBase);
    const phoneHandset = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.24), new THREE.MeshStandardMaterial({ color: 0x141618 }));
    phoneHandset.position.set(4.88, 0.90, 5.7);
    this.scene.add(phoneHandset);

    // 5. Ceramic Coffee Mug ("再撐一下 天會亮的", A08 reference)
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.10, 16), new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.6 }));
    mug.position.set(5.3, 0.87, 6.4);
    this.scene.add(mug);

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

    // Monitor 1 Screen Texture (Main HIS Electronic Handoff Terminal, A08 Reference)
    const hisCanvas = document.createElement('canvas');
    hisCanvas.width = 512; hisCanvas.height = 320;
    const hctx = hisCanvas.getContext('2d');
    // Screen background
    hctx.fillStyle = '#1a2926'; hctx.fillRect(0, 0, 512, 320);
    // Green hospital header bar
    hctx.fillStyle = '#1c4d36'; hctx.fillRect(0, 0, 512, 44);
    hctx.fillStyle = '#ffffff'; hctx.font = 'bold 18px sans-serif';
    hctx.fillText('🏥 臺北市立聯合醫院松德院區 醫療資訊系統 (HIS)', 14, 28);
    hctx.fillStyle = '#68d391'; hctx.font = 'bold 13px monospace';
    hctx.fillText('● 連線正常 17:05', 390, 28);

    // Left navigation sidebar
    hctx.fillStyle = '#14201e'; hctx.fillRect(0, 44, 110, 276);
    hctx.fillStyle = '#a0aec0'; hctx.font = '12px sans-serif';
    ['▶ 4A 急性病房', '  4B 亞急病房', '  4C 復健病房', '  處方審核', '  留觀床位'].forEach((txt, i) => {
      if (i === 0) {
        hctx.fillStyle = '#23593f';
        hctx.fillRect(0, 50 + i * 32, 110, 28);
        hctx.fillStyle = '#ffffff';
      } else {
        hctx.fillStyle = '#819790';
      }
      hctx.fillText(txt, 8, 70 + i * 32);
    });

    // Main workspace content cards (A08 layout)
    hctx.fillStyle = '#e8f0ec'; hctx.fillRect(118, 52, 386, 218);
    hctx.fillStyle = '#1b382b'; hctx.font = 'bold 14px sans-serif';
    hctx.fillText('【4A 閉鎖病房】夜間交班動態摘要 (佔床 32/34)', 128, 74);

    // Table rows
    hctx.fillStyle = '#2d3748'; hctx.font = '11px monospace';
    hctx.fillText('床號   病患       狀態             夜班注意事項', 128, 98);
    hctx.strokeStyle = '#cbd5e0'; hctx.lineWidth = 1;
    hctx.beginPath(); hctx.moveTo(128, 104); hctx.lineTo(494, 104); hctx.stroke();

    const pRows = [
      ['4A01', '張○翔 (38M)', '穩定', '常規巡房服藥'],
      ['4A12', '林○雅 (29F)', '安睡', '反應走廊燈亮，已調暗'],
      ['4A24', '陳○隆 (52M)', '注意', '重點防跌，夜間如廁需陪同'],
      ['4A33', '留觀待確認', '觀察', '常規晚間床位交班記錄']
    ];
    pRows.forEach((r, idx) => {
      hctx.fillStyle = idx === 2 ? '#c53030' : (idx === 3 ? '#b7791f' : '#22543d');
      hctx.fillText(`${r[0]}  ${r[1]}  [${r[2]}]  ${r[3]}`, 128, 126 + idx * 26);
    });

    // Subtext notice banner
    hctx.fillStyle = '#edf2f7'; hctx.fillRect(128, 236, 366, 26);
    hctx.fillStyle = '#4a5568'; hctx.font = 'bold 11px sans-serif';
    hctx.fillText('🔔 [E] 點擊或靠近進行電子交班審核簽署', 136, 253);

    // Bottom screen status bar
    hctx.fillStyle = '#14201e'; hctx.fillRect(0, 296, 512, 24);
    hctx.fillStyle = '#a0aec0'; hctx.font = '11px sans-serif';
    hctx.fillText('登入：李住院醫師 (第一線夜班) ｜ 精神專科病歷庫 v4.2', 12, 312);

    const hisTex = new THREE.CanvasTexture(hisCanvas);

    // Monitor 2 Screen Texture (PACS / Ward Bed Map Monitor)
    const pacsCanvas = document.createElement('canvas');
    pacsCanvas.width = 512; pacsCanvas.height = 320;
    const pctx2 = pacsCanvas.getContext('2d');
    pctx2.fillStyle = '#0f172a'; pctx2.fillRect(0, 0, 512, 320);
    pctx2.fillStyle = '#1e293b'; pctx2.fillRect(0, 0, 512, 36);
    pctx2.fillStyle = '#94a3b8'; pctx2.font = 'bold 14px sans-serif';
    pctx2.fillText('🗂️ 4F 病房全區床位動態監控 (Bed Occupancy Matrix)', 14, 24);
    // Draw bed grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        const isOcc = (row * 8 + col) < 32;
        pctx2.fillStyle = isOcc ? '#1e3a8a' : '#047857';
        pctx2.fillRect(20 + col * 59, 50 + row * 55, 52, 46);
        pctx2.fillStyle = '#ffffff'; pctx2.font = 'bold 10px monospace';
        pctx2.fillText(`4A${String(row * 8 + col + 1).padStart(2, '0')}`, 26 + col * 59, 70 + row * 55);
        pctx2.fillStyle = isOcc ? '#93c5fd' : '#a7f3d0';
        pctx2.font = '9px sans-serif';
        pctx2.fillText(isOcc ? '佔床' : '空床', 28 + col * 59, 88 + row * 55);
      }
    }
    const pacsTex = new THREE.CanvasTexture(pacsCanvas);

    // Sticky note texture for 3D bezel
    const stickyCanvas = document.createElement('canvas');
    stickyCanvas.width = 128; stickyCanvas.height = 128;
    const sctx = stickyCanvas.getContext('2d');
    sctx.fillStyle = '#fffa65'; sctx.fillRect(0, 0, 128, 128);
    sctx.fillStyle = '#8b572a'; sctx.font = 'bold 12px sans-serif';
    sctx.fillText('學長留言：', 10, 24);
    sctx.font = '11px sans-serif';
    sctx.fillText('4F值班室鑰匙', 10, 48);
    sctx.fillText('在辦公桌右屜！', 10, 68);
    sctx.fillText('便當18:30送達', 10, 90);
    const stickyTex = new THREE.CanvasTexture(stickyCanvas);

    // Dual PC monitors, keyboard, chart rack
    [-0.6, 0.6].forEach((offsetZ, idx) => {
      // Monitor stand & casing
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.22), this.materials.steel);
      stand.position.set(10.2, 0.93, 5.5 + offsetZ);
      this.scene.add(stand);

      const casing = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.62), new THREE.MeshStandardMaterial({ color: 0x1f2326, roughness: 0.4 }));
      casing.position.set(10.2, 1.25, 5.5 + offsetZ);
      this.scene.add(casing);

      // Screen with canvas texture
      const displayMat = new THREE.MeshBasicMaterial({ map: idx === 0 ? hisTex : pacsTex });
      const display = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.38), displayMat);
      display.rotation.y = -Math.PI / 2;
      display.position.set(10.16, 1.25, 5.5 + offsetZ);
      this.scene.add(display);

      // Keyboard & mousepad
      const kb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.44), new THREE.MeshStandardMaterial({ color: 0x181a1b }));
      kb.position.set(9.8, 0.83, 5.5 + offsetZ);
      this.scene.add(kb);

      const mousePad = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.005, 0.18), new THREE.MeshStandardMaterial({ color: 0x243b35 }));
      mousePad.position.set(9.8, 0.825, 5.5 + offsetZ + 0.35);
      this.scene.add(mousePad);

      const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.06), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      mouse.position.set(9.8, 0.84, 5.5 + offsetZ + 0.35);
      this.scene.add(mouse);

      if (idx === 0) {
        // Post-it Sticky Note attached to monitor bezel corner (A08 reference)
        const stickyNote = new THREE.Mesh(
          new THREE.PlaneGeometry(0.11, 0.11),
          new THREE.MeshBasicMaterial({ map: stickyTex, side: THREE.DoubleSide })
        );
        stickyNote.rotation.y = -Math.PI / 2;
        stickyNote.rotation.x = 0.08;
        stickyNote.position.set(10.15, 1.44, 5.5 + offsetZ - 0.28);
        this.scene.add(stickyNote);

        // Green quick-contact sticky note on lower bezel
        const greenSticky = new THREE.Mesh(
          new THREE.PlaneGeometry(0.09, 0.06),
          new THREE.MeshBasicMaterial({ color: 0x9be8a8, side: THREE.DoubleSide })
        );
        greenSticky.rotation.y = -Math.PI / 2;
        greenSticky.position.set(10.15, 1.06, 5.5 + offsetZ + 0.22);
        this.scene.add(greenSticky);

        // Main eligible workstation terminal hitbox
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

    // Internal Hospital Telephone Directory Reference Card on Desk
    const cardGeo = new THREE.PlaneGeometry(0.24, 0.16);
    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 256; cardCanvas.height = 160;
    const cctx = cardCanvas.getContext('2d');
    cctx.fillStyle = '#ffffff'; cctx.fillRect(0, 0, 256, 160);
    cctx.fillStyle = '#1c4d36'; cctx.fillRect(0, 0, 256, 32);
    cctx.fillStyle = '#ffffff'; cctx.font = 'bold 14px sans-serif';
    cctx.fillText('松德院區 常用緊急分機', 16, 22);
    cctx.fillStyle = '#222222'; cctx.font = '12px sans-serif';
    cctx.fillText('• 4F 護理站：#4101', 16, 58);
    cctx.fillText('• 4F 值班室：#4102', 16, 82);
    cctx.fillText('• 2F 急診檢傷：#1119', 16, 106);
    cctx.fillText('• 總機 / 火警：#9 / #119', 16, 130);
    const cardTex = new THREE.CanvasTexture(cardCanvas);
    const dirCard = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ map: cardTex }));
    dirCard.rotation.x = -Math.PI / 2;
    dirCard.rotation.z = -0.15;
    dirCard.position.set(9.85, 0.825, 4.45);
    this.scene.add(dirCard);
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

    // Overhead Sign & Floor Directory Board (Step 4 Reference)
    this.createSignMesh(-6, 12.7, 0, '🛗 電梯大廳 4F ｜ 4F 精神科閉鎖病房區', -Math.PI / 2);
    this.buildElevatorDirectoryBoard(-11.75, 11.65, -2.2, '4F');
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

    // Door warning plaques on door leaves (A03 Reference)
    const warnCanvas = document.createElement('canvas');
    warnCanvas.width = 512; warnCanvas.height = 256;
    const wctx = warnCanvas.getContext('2d');
    wctx.fillStyle = '#ffffff'; wctx.fillRect(0, 0, 512, 256);
    wctx.fillStyle = '#c53030'; wctx.fillRect(0, 0, 512, 60);
    wctx.fillStyle = '#ffffff'; wctx.font = 'bold 26px sans-serif';
    wctx.textAlign = 'center';
    wctx.fillText('⛔ 精神科急性閉鎖病房 重點管制區', 256, 40);
    wctx.fillStyle = '#1a202c'; wctx.font = 'bold 20px sans-serif';
    wctx.fillText('【非醫護工作人員 嚴禁擅自進入】', 256, 110);
    wctx.fillStyle = '#4a5568'; wctx.font = '16px sans-serif';
    wctx.fillText('• 隨身進出請確實隨手關門並確認上鎖', 256, 150);
    wctx.fillText('• 嚴防病患尾隨出走 ｜ 落實門禁安全管制', 256, 185);
    wctx.fillStyle = '#c53030'; wctx.font = 'bold 15px sans-serif';
    wctx.fillText('緊急求救請按對講機通報護理站 (分機 #4101)', 256, 225);
    const warnTex = new THREE.CanvasTexture(warnCanvas);

    const warnPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.40), new THREE.MeshBasicMaterial({ map: warnTex }));
    warnPlate.rotation.y = Math.PI;
    warnPlate.position.set(1.95, 10.85, 2.44);
    this.scene.add(warnPlate);

    const safePlateCanvas = document.createElement('canvas');
    safePlateCanvas.width = 512; safePlateCanvas.height = 256;
    const sctx = safePlateCanvas.getContext('2d');
    sctx.fillStyle = '#ffffff'; sctx.fillRect(0, 0, 512, 256);
    sctx.fillStyle = '#1e5e3a'; sctx.fillRect(0, 0, 512, 60);
    sctx.fillStyle = '#ffffff'; sctx.font = 'bold 26px sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('🛡️ 訪客與夜間照護 安全規範', 256, 40);
    sctx.fillStyle = '#2d3748'; sctx.font = '16px sans-serif';
    sctx.fillText('1. 進入病房區請配戴外科口罩並完成乾洗手', 256, 105);
    sctx.fillText('2. 禁止攜帶打火機、刀剪等危險管制物品入內', 256, 140);
    sctx.fillText('3. 會客請於日間指定會客室進行，夜間全面門禁', 256, 175);
    sctx.fillStyle = '#718096'; sctx.font = 'italic 14px sans-serif';
    sctx.fillText('松德院區 4A護理站 關心您', 256, 225);
    const safePlateTex = new THREE.CanvasTexture(safePlateCanvas);

    const safePlate = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.40), new THREE.MeshBasicMaterial({ map: safePlateTex }));
    safePlate.rotation.y = Math.PI;
    safePlate.position.set(4.05, 10.85, 2.44);
    this.scene.add(safePlate);

    // Electromagnetic lock unit at center top
    const magLock = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.12), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    magLock.position.set(3.0, 12.28, 2.44);
    this.scene.add(magLock);

    // Card Reader & Intercom unit on the wall beside gate
    const intercomGroup = new THREE.Group();
    const icBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.38, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x22262a, metalness: 0.7, roughness: 0.4 })
    );
    intercomGroup.add(icBody);

    const icKeypad = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.14),
      new THREE.MeshBasicMaterial({ color: 0x334440, side: THREE.DoubleSide })
    );
    icKeypad.position.set(0, -0.06, 0.035);
    intercomGroup.add(icKeypad);

    const readerLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x22ff66 })
    );
    readerLight.position.set(0.06, 0.12, 0.035);
    intercomGroup.add(readerLight);

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
    this.createSignMesh(3.0, 12.82, 2.42, '⛔ 4A/4B 閉鎖病房 ｜ 門禁管制 (刷卡進入)', Math.PI);

    // Green Emergency Exit Light Box
    const exitBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.12), new THREE.MeshStandardMaterial({ color: 0x1f2320 }));
    exitBox.position.set(3.0, 13.08, 2.38);
    this.scene.add(exitBox);
    const exitSign = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.18), new THREE.MeshBasicMaterial({ color: 0x1db85b }));
    exitSign.rotation.y = Math.PI;
    exitSign.position.set(3.0, 13.08, 2.31);
    this.scene.add(exitSign);

    // Ward Interior Beyond Depth (Nursing Station Counter & Ward Glimpse, A03 Reference)
    const wardCorridorWall = this.materials.wall4F;
    const wardFloor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), this.materials.floor4F);
    wardFloor.rotation.x = -Math.PI / 2;
    wardFloor.position.set(3.0, 10.0, 6.0);
    this.scene.add(wardFloor);

    const wardCeil = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), this.materials.ceiling);
    wardCeil.rotation.x = Math.PI / 2;
    wardCeil.position.set(3.0, 13.2, 6.0);
    this.scene.add(wardCeil);

    const wardBackWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), wardCorridorWall);
    wardBackWall.position.set(3.0, 11.6, 9.5);
    this.scene.add(wardBackWall);

    // 4A Nursing Station Counter (A03 Style Wood/White Counter)
    const counterGroup = new THREE.Group();
    // Front wood wainscot panel
    const counterFront = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 1.05, 0.8),
      this.materials.woodWainscot
    );
    counterFront.position.set(0, 0.525, 0);
    counterGroup.add(counterFront);

    // Counter top in solid white corian
    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.08, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xf0f3f1, roughness: 0.2 })
    );
    counterTop.position.set(0, 1.08, 0);
    counterGroup.add(counterTop);

    // Nursing Station Overhead Sign: "4A 護理站 Nursing Station"
    const nsSignCanvas = document.createElement('canvas');
    nsSignCanvas.width = 512; nsSignCanvas.height = 128;
    const nctx = nsSignCanvas.getContext('2d');
    nctx.fillStyle = '#1a4734'; nctx.fillRect(0, 0, 512, 128);
    nctx.strokeStyle = '#c6ded2'; nctx.lineWidth = 4;
    nctx.strokeRect(6, 6, 500, 116);
    nctx.fillStyle = '#ffffff'; nctx.font = 'bold 32px sans-serif';
    nctx.textAlign = 'center';
    nctx.fillText('4A 護理站 Nursing Station', 256, 55);
    nctx.font = '18px sans-serif';
    nctx.fillStyle = '#9fe0bf';
    nctx.fillText('精神科急性閉鎖病房 照護核心', 256, 95);
    const nsSignTex = new THREE.CanvasTexture(nsSignCanvas);
    const nsSign = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.5), new THREE.MeshBasicMaterial({ map: nsSignTex }));
    nsSign.rotation.y = Math.PI;
    nsSign.position.set(0, 1.7, -0.4);
    counterGroup.add(nsSign);

    // Nurse Station Monitor (Screen glow visible through vision glass)
    const nsMonitor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.05), new THREE.MeshBasicMaterial({ color: 0x23523d }));
    nsMonitor.position.set(-0.6, 1.30, 0.05);
    counterGroup.add(nsMonitor);

    // Chart binders on counter
    const nsChart = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.08), this.materials.binder);
    nsChart.position.set(0.6, 1.25, 0.1);
    counterGroup.add(nsChart);

    counterGroup.position.set(3.0, 10.0, 5.2);
    this.scene.add(counterGroup);

    // Interior Nurse Station Staff Schedule Whiteboard on back wall
    const wbCanvas = document.createElement('canvas');
    wbCanvas.width = 512; wbCanvas.height = 256;
    const wbCtx = wbCanvas.getContext('2d');
    wbCtx.fillStyle = '#ffffff'; wbCtx.fillRect(0, 0, 512, 256);
    wbCtx.fillStyle = '#1c4232'; wbCtx.fillRect(0, 0, 512, 40);
    wbCtx.fillStyle = '#ffffff'; wbCtx.font = 'bold 18px sans-serif';
    wbCtx.fillText('4A 今日值勤人員 ｜ 2026.09.17', 16, 26);
    wbCtx.fillStyle = '#222'; wbCtx.font = '14px sans-serif';
    wbCtx.fillText('• 白班護理：陳護理長、黃護理師、郭護理師', 16, 70);
    wbCtx.fillText('• 小夜班護理：張護理師、廖護理師 (接班中)', 16, 105);
    wbCtx.fillStyle = '#c53030'; wbCtx.font = 'bold 15px sans-serif';
    wbCtx.fillText('• 第一線值班醫師：李住院醫師 (316/422)', 16, 145);
    wbCtx.fillStyle = '#444'; wbCtx.font = '13px sans-serif';
    wbCtx.fillText('• 今日晚餐：護理站代訂便當 18:30 送達', 16, 185);
    wbCtx.fillText('• 急診交班：4A33 床常規收治留觀中', 16, 220);
    const wbTex = new THREE.CanvasTexture(wbCanvas);
    const wbMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshBasicMaterial({ map: wbTex }));
    wbMesh.rotation.y = Math.PI;
    wbMesh.position.set(4.2, 11.8, 9.46);
    this.scene.add(wbMesh);

    // Interior Wall Clock on back wall (showing 17:35)
    const nsClock = this.createAnalogClock(17, 35);
    nsClock.rotation.y = Math.PI;
    nsClock.position.set(1.6, 12.3, 9.46);
    this.scene.add(nsClock);

    // Warm evening glow illuminating the nursing station counter (3000K, A03 reference)
    const nsWarmLight = new THREE.PointLight(0xffe8c2, 1.4, 6.0);
    nsWarmLight.position.set(3.0, 12.2, 5.5);
    this.scene.add(nsWarmLight);

    // South wall of 4F corridor (leads to 4F Duty Room)
    this.buildWall(-1.5, 11.6, -2.5, 5.0, 3.2, 0.4, this.materials.wall4F);
    this.buildWall(11.5, 11.6, -2.5, 5.0, 3.2, 0.4, this.materials.wall4F);
    this.buildWall(5.0, 12.8, -2.5, 8.0, 0.8, 0.4, this.materials.wall4F); // Lintel over duty room area

    // Directional signs overhead in corridor (placed away from gate view)
    this.createSignMesh(-1.5, 12.7, 0, '← 4A/4B 閉鎖病房 ｜ 4F 獨立值班室 ➔', -Math.PI / 2);
    this.createSignMesh(-1.5, 12.7, 0.05, '← 4F 獨立值班室 ｜ 4A/4B 閉鎖病房 ➔', Math.PI / 2);
  }

  build4FDutyRoom() {
    // 4F Independent Duty Room (Room 422, A02 Reference): x: 2 to 9, z: -2.5 to -8.5, y: 10.0
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

    // REAL CLOSABLE WOODEN DOOR FOR DUTY ROOM (Room 422)
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

    // Door sign plate: "422 值班室 ｜ 休息是為了走更長的路" (A02 Reference)
    const plateCanvas = document.createElement('canvas');
    plateCanvas.width = 512; plateCanvas.height = 140;
    const pctx = plateCanvas.getContext('2d');
    pctx.fillStyle = '#1c3d31'; pctx.fillRect(0, 0, 512, 140);
    pctx.strokeStyle = '#c6ded2'; pctx.lineWidth = 4;
    pctx.strokeRect(6, 6, 500, 128);
    pctx.fillStyle = '#ffffff'; pctx.font = 'bold 36px sans-serif';
    pctx.textAlign = 'center'; pctx.textBaseline = 'middle';
    pctx.fillText('422 值班室', 256, 50);
    pctx.fillStyle = '#a8e0c4'; pctx.font = '20px sans-serif';
    pctx.fillText('休息是為了走更長的路', 256, 95);
    const plateTex = new THREE.CanvasTexture(plateCanvas);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.16), new THREE.MeshBasicMaterial({ map: plateTex }));
    plate.position.set(0.55, 1.55, 0.04);
    doorGroup.add(plate);

    // Caution sign below handle: "請輕聲關門 保持安靜"
    const quietCanvas = document.createElement('canvas');
    quietCanvas.width = 256; quietCanvas.height = 64;
    const qctx = quietCanvas.getContext('2d');
    qctx.fillStyle = '#f7faf8'; qctx.fillRect(0, 0, 256, 64);
    qctx.fillStyle = '#333333'; qctx.font = 'bold 18px sans-serif';
    qctx.textAlign = 'center'; qctx.textBaseline = 'middle';
    qctx.fillText('請輕聲關門 ｜ 保持安靜', 128, 32);
    const quietTex = new THREE.CanvasTexture(quietCanvas);
    const quietPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.09), new THREE.MeshBasicMaterial({ map: quietTex }));
    quietPlate.position.set(0.55, 1.35, 0.04);
    doorGroup.add(quietPlate);

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
      label: '422 獨立值班套房 (使用鑰匙開啟門鎖)',
      type: 'duty_room_door'
    };
    this.scene.add(doorHitbox);
    this.interactables.push(doorHitbox);

    // --- INSIDE ROOM 422: PRIVATE SANCTUARY (A02 Reference) ---

    // 1. Single Bed with casters, headboard/footboard, clean linen, blue throw, and folded dark fleece jacket
    const bedGroup = new THREE.Group();
    // Wooden bed frame
    const bedFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.35, 2.2),
      this.materials.darkWood
    );
    bedFrame.position.set(0, 0.22, 0);
    bedGroup.add(bedFrame);

    // 4 Caster Wheels (A02 reference hospital mobile bed)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7 });
    [[-0.52, -0.95], [0.52, -0.95], [-0.52, 0.95], [0.52, 0.95]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12), wheelMat);
      wheel.position.set(wx, 0.04, wz);
      wheel.rotation.z = Math.PI / 2;
      bedGroup.add(wheel);
    });

    // Dark wood headboard & footboard
    const headboard = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 0.85, 0.08),
      this.materials.darkWood
    );
    headboard.position.set(0, 0.46, -1.06);
    bedGroup.add(headboard);

    const footboard = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 0.55, 0.08),
      this.materials.darkWood
    );
    footboard.position.set(0, 0.32, 1.06);
    bedGroup.add(footboard);

    // Clean white hospital mattress & sheet
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(1.12, 0.22, 2.05),
      this.materials.bedsheet
    );
    mattress.position.set(0, 0.48, 0);
    bedGroup.add(mattress);

    // Hospital striped pillow
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.12, 0.44),
      new THREE.MeshStandardMaterial({ color: 0xeff4f8, roughness: 0.9 })
    );
    pillow.position.set(0, 0.62, -0.72);
    bedGroup.add(pillow);

    // Folded blue throw blanket (A02 Reference)
    const blueBlanketMat = new THREE.MeshStandardMaterial({ color: 0x2e4f7a, roughness: 0.85 });
    const blanket = new THREE.Mesh(
      new THREE.BoxGeometry(1.08, 0.08, 1.0),
      blueBlanketMat
    );
    blanket.position.set(0, 0.58, 0.45);
    bedGroup.add(blanket);

    // Folded Dark Fleece Jacket (深色抓絨外套, A02 Reference)
    const fleeceMat = new THREE.MeshStandardMaterial({ color: 0x222831, roughness: 0.95 });
    const fleeceJacket = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.07, 0.42),
      fleeceMat
    );
    fleeceJacket.position.set(0, 0.64, 0.48);
    bedGroup.add(fleeceJacket);

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
      label: '檢視值班床鋪 (床單已換新，整潔溫暖)',
      type: 'prop_info',
      info: '李醫師：『獨立套房單人床，被子和抓絨外套都整齊疊好。值班有空檔可以安心瞇一下。』'
    };
    this.scene.add(bedHitbox);
    this.interactables.push(bedHitbox);

    // Pair of clean hospital slippers beside bed on floor (A02 Reference)
    const slipperMat = new THREE.MeshStandardMaterial({ color: 0x5a7d71, roughness: 0.8 });
    [-0.08, 0.08].forEach((sx) => {
      const slipper = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.035, 0.26), slipperMat);
      slipper.position.set(4.0 + sx, 10.02, -6.6);
      this.scene.add(slipper);
    });

    // 2. Bedside Nightstand, Thermos Flask, Succulent, and Warm Sanctuary Lamp (A02 Reference)
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

    // Warm Sanctuary Bedside Lamp (3000K Amber Glow)
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.03, 16), this.materials.brass);
    lampBase.position.set(4.2, 10.58, -8.0);
    this.scene.add(lampBase);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 16), new THREE.MeshStandardMaterial({ color: 0xffaa44, roughness: 0.3 }));
    lampShade.position.set(4.2, 10.80, -8.0);
    this.scene.add(lampShade);

    const dutyLampLight = new THREE.PointLight(0xffb555, 2.2, 5.0);
    dutyLampLight.position.set(4.2, 10.78, -7.9);
    dutyLampLight.castShadow = true;
    this.scene.add(dutyLampLight);

    // Stainless Steel Thermos Flask (保溫瓶, A02 Reference)
    const thermosBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 16), this.materials.steel);
    thermosBody.position.set(4.35, 10.68, -8.15);
    this.scene.add(thermosBody);
    const thermosCap = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0x334440 }));
    thermosCap.position.set(4.35, 10.80, -8.15);
    this.scene.add(thermosCap);

    // Small Potted Succulent Plant on Nightstand (A02 Reference)
    const succPot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.07, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    succPot.position.set(4.05, 10.60, -8.12);
    this.scene.add(succPot);
    const succPlant = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshStandardMaterial({ color: 0x4a7c59, roughness: 0.9 }));
    succPlant.position.set(4.05, 10.66, -8.12);
    succPlant.scale.set(1, 0.8, 1);
    this.scene.add(succPlant);

    // 3. Wall Framed Inspirational Plaque: "這裡 是你的 專屬空間 辛苦了" (A02 Reference)
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 512; plaqueCanvas.height = 256;
    const plctx = plaqueCanvas.getContext('2d');
    plctx.fillStyle = '#faf8f5'; plctx.fillRect(0, 0, 512, 256);
    plctx.strokeStyle = '#5a3d28'; plctx.lineWidth = 10;
    plctx.strokeRect(5, 5, 502, 246);
    plctx.fillStyle = '#3c2415'; plctx.font = 'bold 32px serif';
    plctx.textAlign = 'center'; plctx.textBaseline = 'middle';
    plctx.fillText('這 裡 是 你 的 專 屬 空 間', 256, 90);
    plctx.font = 'bold 28px serif';
    plctx.fillStyle = '#8b2e1e';
    plctx.fillText('辛 苦 了', 256, 155);
    plctx.font = 'italic 16px sans-serif';
    plctx.fillStyle = '#7a6a58';
    plctx.fillText('— 松德院區 醫師關懷小組 —', 256, 210);
    const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
    const plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.36), new THREE.MeshBasicMaterial({ map: plaqueTex }));
    plaqueMesh.rotation.y = -Math.PI / 2;
    plaqueMesh.position.set(8.78, 11.85, -6.0);
    this.scene.add(plaqueMesh);

    // 4. Dusk Skyline Window on South Wall (A02 Reference)
    const winGroup = new THREE.Group();
    const frameMat = this.materials.steel;
    // Outer border frame (top, bottom, left, right)
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.06), frameMat);
    topBar.position.set(0, 0.67, 0.02);
    winGroup.add(topBar);
    const btmBar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.06), frameMat);
    btmBar.position.set(0, -0.67, 0.02);
    winGroup.add(btmBar);
    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.06), frameMat);
    leftBar.position.set(-1.17, 0, 0.02);
    winGroup.add(leftBar);
    const rightBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.06), frameMat);
    rightBar.position.set(1.17, 0, 0.02);
    winGroup.add(rightBar);
    // Center divider mullion
    const centerMullion = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, 0.05), frameMat);
    centerMullion.position.set(0, 0, 0.02);
    winGroup.add(centerMullion);

    const duskCanvas = document.createElement('canvas');
    duskCanvas.width = 512; duskCanvas.height = 300;
    const dctx = duskCanvas.getContext('2d');
    const dGrad = dctx.createLinearGradient(0, 0, 0, 300);
    dGrad.addColorStop(0, '#262c47');   // Twilight purple-blue
    dGrad.addColorStop(0.45, '#d96434'); // Warm dusky sunset orange
    dGrad.addColorStop(0.75, '#f5a65b'); // Golden horizon
    dGrad.addColorStop(1, '#1b2326');    // Distant Taipei silhouette
    dctx.fillStyle = dGrad;
    dctx.fillRect(0, 0, 512, 300);
    // Mountain ridge silhouettes
    dctx.fillStyle = '#1c2225';
    dctx.beginPath();
    dctx.moveTo(0, 240);
    dctx.lineTo(120, 210);
    dctx.lineTo(240, 230);
    dctx.lineTo(360, 195);
    dctx.lineTo(512, 220);
    dctx.lineTo(512, 300);
    dctx.lineTo(0, 300);
    dctx.closePath();
    dctx.fill();

    const duskTex = new THREE.CanvasTexture(duskCanvas);
    const duskView = new THREE.Mesh(
      new THREE.PlaneGeometry(2.34, 1.34),
      new THREE.MeshBasicMaterial({ map: duskTex, side: THREE.DoubleSide })
    );
    duskView.position.set(0, 0, 0);
    winGroup.add(duskView);

    winGroup.position.set(6.8, 11.8, -8.26);
    this.scene.add(winGroup);

    // 5. Doctor Desk & Chair in Duty Room (with landline phone & white coat)
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

    // Panasonic Hospital Landline Telephone (公務分機電話 #4102)
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

    // Doctor white coat draped on back of chair (A02 Reference)
    const drapedCoat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.70, 0.12), this.materials.whiteCoat);
    drapedCoat.position.set(7.5, 10.60, -6.65);
    this.scene.add(drapedCoat);

    // 6. Private Ensuite Bathroom Sanctuary (A02 Reference)
    // Partition wall dividing bathroom at x = 2.0 to 4.2, z = -2.5 to -4.8
    this.buildWall(3.1, 11.6, -4.8, 1.8, 3.2, 0.3, this.materials.wall4F); // South partition of bath
    this.buildWall(4.1, 11.6, -3.65, 0.3, 3.2, 2.1, this.materials.wall4F); // East partition of bath

    // Ajar wooden bathroom door at x = 4.1, z = -4.75 (swung slightly inward, ~20 degrees)
    const bathDoor = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.1, 0.05), this.materials.wood);
    bathDoor.position.set(3.8, 11.05, -4.8);
    bathDoor.rotation.y = 0.35; // Ajar
    this.scene.add(bathDoor);

    // Warm ceramic light spilling out from private bathroom
    const bathLight = new THREE.PointLight(0xfff7e6, 1.4, 4.5);
    bathLight.position.set(3.0, 11.5, -3.6);
    this.scene.add(bathLight);

    // Bath mat in front of bathroom doorway
    const bathMat = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.45), new THREE.MeshStandardMaterial({ color: 0x4a6b5e, roughness: 0.9 }));
    bathMat.rotation.x = -Math.PI / 2;
    bathMat.position.set(3.8, 10.01, -5.15);
    this.scene.add(bathMat);
  }

  unlockDutyRoom() {
    if (this.isDutyRoomUnlocked || !this.dutyRoomDoor) return;
    this.isDutyRoomUnlocked = true;
    // Animate door swinging open 85 degrees
    this.dutyRoomDoor.rotation.y = -Math.PI * 0.45;
  }

  createAnalogClock(hours = 17, minutes = 5) {
    const clockGroup = new THREE.Group();
    // Clock rim
    const clockRim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.04, 24),
      new THREE.MeshStandardMaterial({ color: 0x222629, roughness: 0.5 })
    );
    clockRim.rotateX(Math.PI / 2);
    clockGroup.add(clockRim);

    // Clock face canvas
    const clockCanvas = document.createElement('canvas');
    clockCanvas.width = 256; clockCanvas.height = 256;
    const cctx = clockCanvas.getContext('2d');
    cctx.fillStyle = '#ffffff';
    cctx.beginPath(); cctx.arc(128, 128, 120, 0, Math.PI * 2); cctx.fill();
    cctx.strokeStyle = '#222222'; cctx.lineWidth = 4; cctx.stroke();

    // Hour markers
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const x1 = 128 + Math.cos(angle) * 98;
      const y1 = 128 + Math.sin(angle) * 98;
      const x2 = 128 + Math.cos(angle) * 112;
      const y2 = 128 + Math.sin(angle) * 112;
      cctx.beginPath(); cctx.moveTo(x1, y1); cctx.lineTo(x2, y2);
      cctx.lineWidth = (i % 3 === 0) ? 5 : 2;
      cctx.strokeStyle = '#222222';
      cctx.stroke();
    }

    // Hands: Hour angle
    const hourAngle = ((hours % 12) + minutes / 60) * (Math.PI / 6) - Math.PI / 2;
    cctx.strokeStyle = '#111111';
    cctx.lineWidth = 6;
    cctx.lineCap = 'round';
    cctx.beginPath();
    cctx.moveTo(128, 128);
    cctx.lineTo(128 + Math.cos(hourAngle) * 58, 128 + Math.sin(hourAngle) * 58);
    cctx.stroke();

    // Minute angle
    const minAngle = (minutes * (Math.PI / 30)) - Math.PI / 2;
    cctx.strokeStyle = '#222222';
    cctx.lineWidth = 4;
    cctx.lineCap = 'round';
    cctx.beginPath();
    cctx.moveTo(128, 128);
    cctx.lineTo(128 + Math.cos(minAngle) * 88, 128 + Math.sin(minAngle) * 88);
    cctx.stroke();

    // Center pin
    cctx.fillStyle = '#c53030';
    cctx.beginPath(); cctx.arc(128, 128, 5, 0, Math.PI * 2); cctx.fill();

    const tex = new THREE.CanvasTexture(clockCanvas);
    const clockFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.40, 0.40),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    clockFace.position.set(0, 0, 0.025);
    clockGroup.add(clockFace);

    return clockGroup;
  }

  createSignMesh(x, y, z, text, rotationY = 0, width = 2.4, height = 0.6) {
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
    const signGeo = new THREE.PlaneGeometry(width, height);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, y, z);
    sign.rotation.y = rotationY;
    this.scene.add(sign);
    return sign;
  }

  buildElevatorDirectoryBoard(x, y, z, currentFloor = '3F') {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 1.25, 0.95),
      this.materials.steel
    );
    group.add(frame);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 680;
    const ctx = canvas.getContext('2d');

    // Clean brushed hospital aluminum background
    ctx.fillStyle = '#f2f4f3';
    ctx.fillRect(0, 0, 512, 680);

    // Dark hospital green header
    ctx.fillStyle = '#1c4232';
    ctx.fillRect(0, 0, 512, 85);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('臺北市立聯合醫院 松德院區', 256, 38);
    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#a8d8c0';
    ctx.fillText('醫療行政與病房大樓 樓層導覽', 256, 65);

    // Floor lines
    const floors = [
      { fl: '4F', desc: '精神科閉鎖急性病房 (4A/4B) ｜ 醫師獨立值班室 (422)' },
      { fl: '3F', desc: '醫師行政區 ｜ 316 總醫師辦公室 ｜ 臨床研討室' },
      { fl: '2F', desc: '急診醫學科 ｜ 精神專科急診觀察室 ｜ 檢傷站' },
      { fl: '1F', desc: '門診大廳 ｜ 掛號批價處 ｜ 門診調劑藥局 ｜ 警衛室' },
      { fl: 'B1', desc: '地下停車場 ｜ 員工餐廳 ｜ 病歷檔案庫 ｜ 機房' }
    ];

    floors.forEach((f, idx) => {
      const isCurrent = f.fl === currentFloor;
      const posY = 100 + idx * 95;

      // Row background
      if (isCurrent) {
        ctx.fillStyle = '#e2f0e8';
        ctx.fillRect(15, posY, 482, 82);
        ctx.strokeStyle = '#2d7a52';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(15, posY, 482, 82);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(15, posY, 482, 82);
        ctx.strokeStyle = '#d5ded8';
        ctx.lineWidth = 1;
        ctx.strokeRect(15, posY, 482, 82);
      }

      // Floor badge
      ctx.fillStyle = isCurrent ? '#216342' : '#495850';
      ctx.fillRect(25, posY + 16, 68, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(f.fl, 59, posY + 50);

      // Floor description
      ctx.fillStyle = isCurrent ? '#16402a' : '#2b3630';
      ctx.font = isCurrent ? 'bold 15px sans-serif' : '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(f.desc, 105, posY + 48);

      if (isCurrent) {
        ctx.fillStyle = '#c53030';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('▲ 您在此處 (Current Location)', 485, posY + 26);
      }
    });

    // Bottom note
    ctx.fillStyle = '#5c6b63';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('※ 夜間 22:00 起各病房實施門禁管制，訪客請由 1F 門口登記出入', 256, 640);

    const tex = new THREE.CanvasTexture(canvas);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 1.2),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    board.rotation.y = Math.PI / 2;
    board.position.set(0.025, 0, 0);
    group.add(board);

    group.position.set(x, y, z);
    this.scene.add(group);
    return group;
  }

  buildHospitalBulletinBoard(x, y, z, type = 1) {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.05, 0.04), this.materials.steel);
    group.add(frame);
    const cork = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.99, 0.045), this.materials.cork);
    group.add(cork);

    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 640;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#b8895b'; ctx.fillRect(0, 0, 1024, 640);

    if (type === 1) {
      // Poster 1: Infection Control (Top-Left)
      ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 20, 470, 280);
      ctx.fillStyle = '#1c6ca1'; ctx.fillRect(20, 20, 470, 50);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px sans-serif';
      ctx.fillText('臺北市立聯合醫院 松德院區 感染管制通告', 35, 52);
      ctx.fillStyle = '#222222'; ctx.font = '16px sans-serif';
      ctx.fillText('• 進入精神科閉鎖與急性病房區請一律配戴口罩', 35, 105);
      ctx.fillText('• 落實手部衛生：內外夾弓大立腕（洗手七字訣）', 35, 140);
      ctx.fillText('• 呼吸道症狀同仁請主動向總督導通報並就醫', 35, 175);
      ctx.fillText('• 值班期間各護理站備有酒精乾洗手液與防護面罩', 35, 210);
      ctx.fillStyle = '#0f8a5f'; ctx.fillRect(35, 240, 220, 35);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 15px sans-serif';
      ctx.fillText('感管小組 關心您的健康', 45, 263);

      // Poster 2: Night Duty Rules (Top-Right)
      ctx.fillStyle = '#ffffff'; ctx.fillRect(530, 20, 470, 280);
      ctx.fillStyle = '#2d5a3e'; ctx.fillRect(530, 20, 470, 50);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px sans-serif';
      ctx.fillText('精神專科夜間值班醫師作業要點', 545, 52);
      ctx.fillStyle = '#b32424'; ctx.font = 'bold 16px sans-serif';
      ctx.fillText('值班時段：17:00 ～ 翌日 08:30', 545, 105);
      ctx.fillStyle = '#222222'; ctx.font = '16px sans-serif';
      ctx.fillText('1. 到勤請至 316 辦公室領取鑰匙並親自簽署名冊', 545, 140);
      ctx.fillText('2. 17:30 前完成 HIS 電子交班審核，確認 4A-4D 留觀床位', 545, 175);
      ctx.fillText('3. 4F 閉鎖病房門禁嚴格，未授權不得擅自開放', 545, 210);
      ctx.fillText('4. 遇緊急特殊事件請即刻通報二線值勤主治醫師', 545, 245);

      // Poster 3: Staff Care Support (Bottom-Left)
      ctx.fillStyle = '#fffdf5'; ctx.fillRect(20, 330, 470, 280);
      ctx.fillStyle = '#d97d29'; ctx.fillRect(20, 330, 470, 50);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px sans-serif';
      ctx.fillText('員工心理關懷諮商服務專線', 35, 362);
      ctx.fillStyle = '#333333'; ctx.font = '16px sans-serif';
      ctx.fillText('「照顧他人，也要記得好好照顧自己。」', 35, 415);
      ctx.fillText('本院設有員工安心諮商專線，提供身心減壓諮詢。', 35, 450);
      ctx.fillText('服務電話：院內分機 #3199 ｜ 專線 0800-024-885', 35, 485);
      ctx.fillText('服務時間：週一至週五 08:30 - 17:30', 35, 520);
      ctx.fillStyle = '#666666'; ctx.font = 'italic 14px sans-serif';
      ctx.fillText('職工福利委員會 ｜ 身心健康推廣小組', 35, 570);

      // Poster 4: Evacuation Map (Bottom-Right)
      ctx.fillStyle = '#f8f9fa'; ctx.fillRect(530, 330, 470, 280);
      ctx.fillStyle = '#8b2626'; ctx.fillRect(530, 330, 470, 50);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px sans-serif';
      ctx.fillText('3F 醫師行政區 緊急疏散與滅火設施圖', 545, 362);
      ctx.strokeStyle = '#666'; ctx.lineWidth = 2;
      ctx.strokeRect(550, 400, 430, 140);
      ctx.fillStyle = '#e9ecef'; ctx.fillRect(551, 401, 428, 138);
      ctx.fillStyle = '#b32424'; ctx.font = 'bold 15px sans-serif';
      ctx.fillText('● 滅火栓 (東側走廊盡頭)', 565, 435);
      ctx.fillStyle = '#1c6ca1'; ctx.fillText('▲ 目前位置 (3F 316辦公室外走廊)', 565, 470);
      ctx.fillStyle = '#0f8a5f'; ctx.fillText('➔ 安全疏散梯 (直通 1F 戶外中庭)', 565, 505);
      ctx.fillStyle = '#b32424'; ctx.font = 'bold 16px sans-serif';
      ctx.fillText('火警緊急通報總機：請撥分機 #119 / #9', 545, 580);
    } else {
      // Schedule & announcements
      ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 20, 984, 590);
      ctx.fillStyle = '#1c4d36'; ctx.fillRect(20, 20, 984, 60);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 24px sans-serif';
      ctx.fillText('松德院區 住院醫師夜間輪值班表 (本月份)', 40, 58);
      ctx.fillStyle = '#222'; ctx.font = '16px sans-serif';
      ctx.fillText('日期：2026 年 09 月 ｜ 第一線急診／閉鎖病房值勤', 40, 110);
      ctx.fillText('• 09/16 (三)：陳住院醫師 (交班完畢)', 40, 150);
      ctx.fillStyle = '#b32424'; ctx.font = 'bold 16px sans-serif';
      ctx.fillText('• 09/17 (四) 今日夜班：李住院醫師 (進行中，17:00交接)', 40, 190);
      ctx.fillStyle = '#222'; ctx.font = '16px sans-serif';
      ctx.fillText('• 09/18 (五)：王住院醫師', 40, 230);
      ctx.fillText('• 09/19 (六)：張住院醫師 (週末白班+夜班)', 40, 270);
      ctx.fillStyle = '#444'; ctx.font = '15px sans-serif';
      ctx.fillText('※ 請輪值醫師提早 15 分鐘至 316 室進行臨床交接。', 40, 340);
      ctx.fillText('※ 4F 閉鎖病房代訂便當預計於 18:30 送達護理站。', 40, 380);
    }

    const posterTex = new THREE.CanvasTexture(canvas);
    const posterMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.95), new THREE.MeshBasicMaterial({ map: posterTex }));
    posterMesh.rotation.y = Math.PI;
    posterMesh.position.set(0, 0, -0.025);
    group.add(posterMesh);

    group.position.set(x, y, z);
    this.scene.add(group);
    return group;
  }

  buildCorridorSconce(x, y, z) {
    const sconceGroup = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.35, 0.05), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 }));
    sconceGroup.add(base);
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.06), this.materials.sconceLight);
    diffuser.position.set(0, 0, 0.02);
    sconceGroup.add(diffuser);
    const light = new THREE.PointLight(0xffdfa8, 0.65, 4.0);
    light.position.set(0, 0, 0.12);
    sconceGroup.add(light);
    sconceGroup.position.set(x, y, z);
    this.scene.add(sconceGroup);
    return sconceGroup;
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
