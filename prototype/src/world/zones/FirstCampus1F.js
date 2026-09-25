// FirstCampus1F.js - Milestone M5: First Campus 1F Public Lobby
import * as THREE from 'three';
import { buildCampusBackdrop } from '../../art/CampusBackdrop.js';
import { artRoot, asset, solid, monitor, counterFront, wallTrim } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { buildRoomWing } from '../shared/RoomWing.js';
import { Doorway } from '../shared/Doorway.js';
import { SignAnchor } from '../shared/SignAnchor.js';
import { CollisionFactory } from '../shared/CollisionFactory.js';
import { gameState } from '../../core/GameState.js';

export class FirstCampus1F {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'FirstCampus1F_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);

    const lobbyHeight = 4.0; // Higher ceiling for public lobby

    // ==========================================
    // 1. GRAND PUBLIC LOBBY FLOOR & CEILING (x: -14 to 18, z: -8 to 8)
    // ==========================================
    this.gf.buildFloor(this.zoneGroup, this.walkables, 2, 0, 0, 32, 16, this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup, 2, lobbyHeight, 0, 32, 16);

    // Outer perimeter walls. The east wall is segmented so the closed glass-fronted
    // pharmacy/drug-storage and outpatient areas read as real locked rooms rather than
    // decorative panels placed on a solid wall.
    this.gf.buildWall(this.zoneGroup, this.colliders, 18, lobbyHeight / 2, -6.8, 0.4, lobbyHeight, 2.4);
    this.gf.buildWall(this.zoneGroup, this.colliders, 18, lobbyHeight / 2, 0.0, 0.4, lobbyHeight, 4.8);
    this.gf.buildWall(this.zoneGroup, this.colliders, 18, lobbyHeight / 2, 6.8, 0.4, lobbyHeight, 2.4);
    this.gf.buildWall(this.zoneGroup,this.colliders,-11.8,lobbyHeight/2,8,4.4,lobbyHeight,.4);
    this.gf.buildWall(this.zoneGroup,this.colliders,5.8,lobbyHeight/2,8,24.4,lobbyHeight,.4);
    this.gf.buildWall(this.zoneGroup,this.colliders,-8,3.6,8,3.2,.8,.4);  // North wall

    const buildClosedSteelBay = (z, title) => {
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.6, 3.2), this.gf.materials.metal);
      glass.position.set(17.85, 1.3, z);
      this.zoneGroup.add(glass);
      CollisionFactory.addBox(this.colliders, 17.88, 1.3, z, 0.16, 2.6, 3.2);

      // Stainless perimeter and center mullion make the locked glass door legible.
      for (const zOff of [-1.56, 0, 1.56]) {
        const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.7, 0.07), this.gf.materials.stainless);
        mullion.position.set(17.80, 1.35, z + zOff);
        this.zoneGroup.add(mullion);
      }
      for (const y of [0.08, 2.62]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 3.2), this.gf.materials.stainless);
        rail.position.set(17.80, y, z);
        this.zoneGroup.add(rail);
      }

      // A shallow sealed room behind the glass prevents exterior/void views while
      // remaining non-walkable during night duty.
      this.gf.buildFloor(this.zoneGroup, null, 19.0, 0.02, z, 2.0, 3.2, this.gf.materials.floorTile);
      this.gf.buildCeiling(this.zoneGroup, 19.0, lobbyHeight, z, 2.0, 3.2);
      this.gf.buildWall(this.zoneGroup, this.colliders, 20.0, lobbyHeight / 2, z, 0.4, lobbyHeight, 3.2);
      this.gf.buildWall(this.zoneGroup, this.colliders, 19.0, lobbyHeight / 2, z - 1.6, 2.0, lobbyHeight, 0.2);
      this.gf.buildWall(this.zoneGroup, this.colliders, 19.0, lobbyHeight / 2, z + 1.6, 2.0, lobbyHeight, 0.2);
      this.gf.buildWall(this.zoneGroup,this.colliders,18,3.3,z,.4,1.4,3.2);
      return glass;
    };

    // 1. Pharmacy / drug-storage facade (z = -4.0), closed behind glass at night.
    const pharmShutter = buildClosedSteelBay(-4.0, '門診藥局／藥庫');
    pharmShutter.userData = {
      interactable: true,
      id: '1F_PHARM_GATE',
      type: 'closed_door',
      locked: true,
      label: '檢視夜間鎖閉的門診藥局／藥庫'
    };
    this.interactables.push(pharmShutter);

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 17.78,
      y: 2.8,
      z: -4.0,
      rotationY: -Math.PI / 2,
      code: 'PHARM',
      title: '【夜間未開放】門診藥局／藥庫',
      subtitle: 'PHARMACY / DRUG STORAGE CLOSED AT NIGHT',
      header: '青嶺醫療中心 ｜ 藥劑科'
    });

    // 2. Outpatient clinic facade (z = 4.0), also a visibly locked glass frontage.
    const opdShutter = buildClosedSteelBay(4.0, '門診診間區');
    opdShutter.userData = {
      interactable: true,
      id: '1F_OPD_GATE',
      type: 'closed_door',
      locked: true,
      label: '檢視夜間閉館的門診區',
      subtitle: '「門診區日間營業結束，夜間暫停開放。」'
    };
    this.interactables.push(opdShutter);

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 17.78,
      y: 2.8,
      z: 4.0,
      rotationY: -Math.PI / 2,
      code: 'OPD',
      title: '【夜間未開放】門診診間區',
      subtitle: 'OUTPATIENT CLINICS CLOSED',
      header: '青嶺醫療中心 ｜ 門診部'
    });

    // West wall with elevator / stairs core
    this.gf.buildWall(this.zoneGroup, this.colliders, -14, lobbyHeight / 2, 0, 0.4, lobbyHeight, 16);

    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: -11.0,
      y: 3.3,
      z: 0,
      ceilingY: lobbyHeight,
      rotationY: Math.PI / 2,
      text: '大廳西側電梯 ｜ 2F 急診・3F 行政・4F 病房・8F 天橋'
    });

    // South wall with main entrance (z = -8)
    // Left wall segment (x: -14 to -1)
    this.gf.buildWall(this.zoneGroup, this.colliders, -7.5, lobbyHeight / 2, -8, 13, lobbyHeight, 0.4);
    // Right wall segment (x: 3 to 18)
    this.gf.buildWall(this.zoneGroup, this.colliders, 10.5, lobbyHeight / 2, -8, 15, lobbyHeight, 0.4);

    // Main entrance doorway (x: -1 to 3, width 4m, height 3m, lintel: 3.0 to 4.0m)
    const mainEntranceDoorway = Doorway.build({
      scene: this.zoneGroup,
      colliders: this.colliders,
      x: 1.0,
      y: 0,
      z: -8.0,
      width: 4.0,
      height: 3.0,
      wallHeight: lobbyHeight,
      wallThickness: 0.4,
      isAlongX: true,
      isOpen: true,
      doorMaterial: this.gf.materials.glass
    });
    // Hide Doorway's generic propped-open leaf; the real night state is represented
    // by the two closed glass leaves below.
    for (const child of mainEntranceDoorway.children) {
      const p = child.geometry?.parameters;
      if (p?.width === 0.05 && p?.height === 2.95) child.visible = false;
    }

    // Left and right glass leaves (visual representation)
    const glassDoorL = new THREE.Mesh(new THREE.BoxGeometry(1.95, 2.8, 0.08), this.gf.materials.glass);
    glassDoorL.position.set(0.05, 1.45, -7.95);
    this.zoneGroup.add(glassDoorL);

    const glassDoorR = new THREE.Mesh(new THREE.BoxGeometry(1.95, 2.8, 0.08), this.gf.materials.glass);
    glassDoorR.position.set(1.95, 1.45, -7.95);
    this.zoneGroup.add(glassDoorR);

    // Keycard / Intercom access terminal on right frame
    const intercom = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.08), this.gf.materials.metal);
    intercom.position.set(3.08, 1.3, -7.78);
    this.zoneGroup.add(intercom);

    // Main entrance closed signage
    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 1.0,
      y: 3.2,
      z: -7.78,
      rotationY: Math.PI,
      code: 'NIGHT',
      title: '夜間正門已關閉 ｜ 門禁管制',
      subtitle: 'MAIN ENTRANCE CLOSED AT NIGHT',
      header: '青嶺醫療中心 ｜ 總務保全課'
    });

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 1.0,
      y: 1.6,
      z: -7.78,
      rotationY: Math.PI,
      width: 1.1,
      height: 0.45,
      code: 'CLOSED',
      title: '【夜間大門已關閉】',
      subtitle: '夜間到勤／急診洽公請由 2F 急診夜間出入口進出',
      header: ''
    });

    // Make the door interactable to trigger dialogue: 「值班時間都會關起來，出不去。」
    const mainDoorHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 2.6, 0.5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    mainDoorHitbox.position.set(1.0, 1.3, -7.8);
    mainDoorHitbox.userData = {
      interactable: true,
      id: '1F_MAIN_DOOR',
      type: 'exit_door',
      label: '檢視夜間鎖閉的正門玻璃門'
    };
    this.zoneGroup.add(mainDoorHitbox);
    this.interactables.push(mainDoorHitbox);

    // Legacy service door concealed by later wall finish; only becomes meaningful after 3F archive evidence.
    const hiddenDoorMat=new THREE.MeshStandardMaterial({color:0xd8d6cf,roughness:.96});
    const hiddenPanel=new THREE.Mesh(new THREE.PlaneGeometry(1.15,2.15),hiddenDoorMat);hiddenPanel.name='FirstFloor_BPanel_ConcealedDoor';
    hiddenPanel.position.set(-13.785,1.18,4.55);hiddenPanel.rotation.y=Math.PI/2;this.zoneGroup.add(hiddenPanel);
    const seamMat=new THREE.MeshStandardMaterial({color:0x8f918d,roughness:.95});
    for(const zOff of [-.57,.57]){
      const seam=new THREE.Mesh(new THREE.BoxGeometry(.012,2.16,.018),seamMat);
      seam.position.set(-13.77,1.18,4.55+zOff);this.zoneGroup.add(seam);
    }
    const topSeam=new THREE.Mesh(new THREE.BoxGeometry(.012,.018,1.16),seamMat);
    topSeam.position.set(-13.77,2.25,4.55);this.zoneGroup.add(topSeam);
    const oldKeyhole=new THREE.Mesh(new THREE.CircleGeometry(.022,12),new THREE.MeshBasicMaterial({color:0x4a4239}));
    oldKeyhole.position.set(-13.755,1.05,4.86);oldKeyhole.rotation.y=Math.PI/2;this.zoneGroup.add(oldKeyhole);
    const hiddenHit=new THREE.Mesh(new THREE.BoxGeometry(.38,2.3,1.35),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    hiddenHit.position.set(-13.58,1.18,4.55);
    hiddenHit.userData={
      interactable:gameState.getFlag('HOOK_1F_HIDDEN_DOOR')||gameState.getFlag('FIRST_FLOOR_GUARD_KEY'),
      id:'1F_HIDDEN_SERVICE_DOOR',type:'hidden_service_door_1f',label:'檢查牆面的舊門框痕跡'
    };
    this.zoneGroup.add(hiddenHit);this.interactables.push(hiddenHit);
    this.hiddenServiceDoor={id:'1F_HIDDEN_SERVICE_DOOR',position:[-13.78,1.18,4.55],requires:'FIRST_FLOOR_GUARD_KEY',revealedBy:'HOOK_1F_HIDDEN_DOOR'};

    const guardPost=new THREE.Group();guardPost.name='FirstCampus1F_OldGuardPost';guardPost.position.set(-10.7,0,3.2);this.zoneGroup.add(guardPost);
    solid(guardPost,this.gf.materials.doorWood,[0,.53,0],[2.1,1.06,.78]);
    solid(guardPost,this.gf.materials.counterTop,[0,1.10,0],[2.18,.08,.84]);
    const cctv=monitor(guardPost,this.gf.materials,-.48,1.17,-.18,0);cctv.name='OldGuardPost_CCTVMonitor';
    solid(guardPost,this.gf.materials.metal,[.50,1.15,-.1],[.30,.12,.22]);
    solid(guardPost,this.gf.materials.lightWarm,[.06,1.155,.08],[.36,.018,.24]).name='OldGuardPost_NightLogbook';
    asset(guardPost,'storageCabinet',[-1.25,0,-.16],[.45,.9,.55]);
    CollisionFactory.addBox(this.colliders,-10.7,.55,3.2,2.2,1.1,.9);
    SignAnchor.buildWallPlaque({scene:this.zoneGroup,x:-12.9,y:2.05,z:3.2,rotationY:Math.PI/2,width:1.2,height:.34,code:'SECURITY',title:'舊警衛台',subtitle:'NIGHT SECURITY POST',header:''});
    this.guardPost={id:'OLD_GUARD_POST',position:[-10.7,0,3.2],cctv:'OldGuardPost_CCTVMonitor',logbook:'OldGuardPost_NightLogbook',serviceDoor:'1F_HIDDEN_SERVICE_DOOR'};

    // ==========================================
    // 2. CENTRAL INFORMATION & REGISTRATION RECEPTION (x: -1 to 5, z: -2 to 1)
    // ==========================================
    const receptionBase = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 1.1, 2.4),
      this.gf.materials.wallDark
    );
    receptionBase.position.set(2.0, 0.55, -0.5);
    this.zoneGroup.add(receptionBase);

    const receptionTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.08, 2.6),
      this.gf.materials.counterTop
    );
    receptionTop.position.set(2.0, 1.14, -0.5);
    this.zoneGroup.add(receptionTop);
    CollisionFactory.addBox(this.colliders, 2.0, 0.6, -0.5, 5.2, 1.2, 2.6);

    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 2.0,
      y: 2.2,
      z: -1.8,
      rotationY: 0,
      code: 'INFO',
      title: '大廳服務台 ｜ 掛號批價',
      subtitle: 'INFORMATION & REGISTRATION',
      header: '青嶺醫療中心 ｜ 1F 公共服務大廳'
    });

    // ==========================================
    // 3. PUBLIC WAITING LOUNGE (x: 8 to 16, z: -5 to 5)
    // ==========================================
    for (let row = -1; row <= 1; row++) {
      const seatRow = new THREE.Mesh(
        new THREE.BoxGeometry(5.5, 0.48, 0.7),
        this.gf.materials.wallDark
      );
      seatRow.position.set(12.0, 0.24, row * 3.5);
      this.zoneGroup.add(seatRow);
      CollisionFactory.addBox(this.colliders, 12.0, 0.35, row * 3.5, 5.5, 0.7, 0.7);
    }

    // Lobby grand chandelier / ceiling fixtures
    this.gf.buildCeilingLight(this.zoneGroup, 2.0, lobbyHeight - 0.05, -3.0, 1.1, 10.0, 0xfff6ea);
    this.gf.buildCeilingLight(this.zoneGroup, 2.0, lobbyHeight - 0.05, 3.0, 1.1, 10.0, 0xfff6ea);
    this.gf.buildCeilingLight(this.zoneGroup, 12.0, lobbyHeight - 0.05, 0.0, 0.9, 9.0, 0xfff6ea);
    this.gf.buildCeilingLight(this.zoneGroup, -7.0, lobbyHeight - 0.05, 0.0, 0.9, 9.0, 0xfff6ea);

    const art = artRoot(this.zoneGroup, 'Lobby');
    receptionBase.material = this.gf.materials.doorWood;
    counterFront(art, this.gf.materials, 2, -1.72, 5, 1.1);
    monitor(art, this.gf.materials, 1, 1.18, -.5, Math.PI);
    monitor(art, this.gf.materials, 3, 1.18, -.5, Math.PI);
    solid(art, this.gf.materials.doorWood, [2,2.2,-1.76], [5.2,.52,.13]);
    for (const x of [-.4,4.4]) solid(art,this.gf.materials.metal,[x,1.5,-1.7],[.045,3,.045]);
    for (const child of this.zoneGroup.children) {
      if (child.geometry?.parameters.width === 5.5 && child.position.y === .24) child.visible = false;
      if (child.name.startsWith('Plaque_INFO')) { child.rotation.y = Math.PI; child.position.z = -1.85; }
    }
    for (const z of [-3.5,0,3.5]) for(const x of [10.3,12.1,13.9]) asset(art,'bench',[x,0,z]);
    asset(art,'plant',[-10.5,0,6]);
    asset(art,'plant',[16.5,0,6]);
    // The shared elevator-core opening is clear; no legacy directory board across it.
    wallTrim(this.zoneGroup,this.gf.materials);
    const exterior=buildCampusBackdrop(this.zoneGroup);
    exterior.position.y=11.5;
    return this;
  }

  setEntranceClosed(closed) {
    this.entranceClosed = closed;
    if (closed) {
      if (!this.entranceCollider) {
        this.entranceCollider = new THREE.Box3(
          new THREE.Vector3(-1.0, 0, -8.2),
          new THREE.Vector3(3.0, 3.0, -7.8)
        );
        this.colliders.push(this.entranceCollider);
      }
    } else if (this.entranceCollider) {
      const idx = this.colliders.indexOf(this.entranceCollider);
      if (idx !== -1) this.colliders.splice(idx, 1);
      this.entranceCollider = null;
    }
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
