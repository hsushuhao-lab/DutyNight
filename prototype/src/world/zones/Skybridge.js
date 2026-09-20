import { AccessDoor } from '../shared/AccessDoor.js';
// Skybridge.js - Milestone M7: Enclosed Long Structural Connector Bridge
import * as THREE from 'three';
import { artRoot, solid, wallTrim } from '../../art/ArtDetails.js';
import { buildCampusBackdrop } from '../../art/CampusBackdrop.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { CollisionFactory } from '../shared/CollisionFactory.js';
import { SignAnchor } from '../shared/SignAnchor.js';

export class Skybridge {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'Skybridge_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);

    const bridgeLength = 60.0; // Span from x = 0 to x = 60
    const bridgeWidth = 4.0;   // z from -2.0 to 2.0
    const bridgeHeight = 3.2;

    // ==========================================
    // 1. CONTINUOUS STRUCTURAL FLOOR & CEILING
    // ==========================================
    this.gf.buildFloor(
      this.zoneGroup,
      this.walkables,
      bridgeLength / 2,
      0,
      0,
      bridgeLength,
      bridgeWidth,
      this.gf.materials.floorTile
    );

    this.gf.buildCeiling(
      this.zoneGroup,
      bridgeLength / 2,
      bridgeHeight,
      0,
      bridgeLength,
      bridgeWidth
    );

    // ==========================================
    // 2. DOUBLE-SIDED ENCLOSED WINDOW WALLS & MULLIONS
    // ==========================================
    // North wall (z = 2.0) and South wall (z = -2.0)
    [-bridgeWidth / 2, bridgeWidth / 2].forEach((wallZ) => {
      // Lower sill wall (y: 0 to 0.9m)
      this.gf.buildWall(
        this.zoneGroup,
        this.colliders,
        bridgeLength / 2,
        0.45,
        wallZ,
        bridgeLength,
        0.9,
        0.35,
        this.gf.materials.wall
      );

      // Upper lintel (y: 2.7 to 3.2m)
      this.gf.buildWall(
        this.zoneGroup,
        this.colliders,
        bridgeLength / 2,
        2.95,
        wallZ,
        bridgeLength,
        0.5,
        0.35,
        this.gf.materials.wall
      );

      // Glass window panes (y: 0.9 to 2.7m)
      const glassPane = new THREE.Mesh(
        new THREE.PlaneGeometry(bridgeLength, 1.8),
        this.gf.materials.glass
      );
      glassPane.position.set(bridgeLength / 2, 1.8, wallZ + (wallZ < 0 ? 0.05 : -0.05));
      if (wallZ > 0) glassPane.rotation.y = Math.PI;
      this.zoneGroup.add(glassPane);

      // Vertical structural mullions every 5 meters
      for (let x = 5; x < bridgeLength; x += 5) {
        this.gf.buildWall(
          this.zoneGroup,
          this.colliders,
          x,
          1.8,
          wallZ,
          0.3,
          1.8,
          0.35,
          this.gf.materials.metal
        );
      }

      // Continuous safety handrails along both sides
      const railZ = wallZ + (wallZ < 0 ? 0.22 : -0.22);
      this.gf.buildHandrail(this.zoneGroup, null, bridgeLength / 2, 1.05, railZ, bridgeLength);
    });

    // Solid collision barriers ensuring player cannot breach windows under any condition
    CollisionFactory.addBox(this.colliders, bridgeLength / 2, 1.6, -bridgeWidth / 2 - 0.2, bridgeLength, 3.2, 0.4);
    CollisionFactory.addBox(this.colliders, bridgeLength / 2, 1.6, bridgeWidth / 2 + 0.2, bridgeLength, 3.2, 0.4);

    // ==========================================
    // 3. FIRST CAMPUS VESTIBULE CAP (x = 0)
    // ==========================================
    this.gf.buildWall(this.zoneGroup, this.colliders, -0.2, 1.6, -1.6, 0.4, 3.2, 0.8);
    this.gf.buildWall(this.zoneGroup, this.colliders, -0.2, 1.6, 1.6, 0.4, 3.2, 0.8);

    // ==========================================
    // 4. SECOND CAMPUS VESTIBULE CAP (x = 60)
    // ==========================================
    this.gf.buildWall(this.zoneGroup, this.colliders, bridgeLength + 0.2, 1.6, -1.6, 0.4, 3.2, 0.8);
    this.gf.buildWall(this.zoneGroup, this.colliders, bridgeLength + 0.2, 1.6, 1.6, 0.4, 3.2, 0.8);

    // End-wall threshold overhead signs
    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: 3.0,
      y: 2.65,
      z: 0,
      ceilingY: 3.2,
      rotationY: -Math.PI / 2, // Facing returning players
      text: '◀ 第一院區 8F 行政大樓 ｜ 松德院史長廊'
    });

    // Central heritage gallery overhead banner
    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: bridgeLength / 2,
      y: 2.7,
      z: 0,
      ceilingY: 3.2,
      rotationY: Math.PI / 2,
      text: '松德院史長廊 ｜ 歷任院長與重大貢獻者紀念展 (1979 - 2026)'
    });

    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: bridgeLength - 3.0,
      y: 2.65,
      z: 0,
      ceilingY: 3.2,
      rotationY: Math.PI / 2, // Facing advancing players
      text: '▶ 第二院區 2F 醫療大樓 (Campus 2)'
    });

    // Archival vintage B&W portraits and historical exhibition along bridge columns
    const buildBridgePortrait = (x, y, z, rotY, title, role, period) => {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 320;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#171614'; ctx.fillRect(0, 0, 256, 320);
      const rad = ctx.createRadialGradient(128, 120, 30, 128, 120, 110);
      rad.addColorStop(0, '#535047'); rad.addColorStop(0.7, '#34322c'); rad.addColorStop(1, '#141311');
      ctx.fillStyle = rad; ctx.fillRect(16, 16, 224, 210);
      ctx.fillStyle = '#1a1916'; ctx.beginPath(); ctx.arc(128, 95, 34, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(128, 185, 65, 48, 0, 0, Math.PI, true); ctx.fill();
      ctx.strokeStyle = '#7c796d'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(114, 130); ctx.lineTo(128, 158); ctx.lineTo(142, 130); ctx.stroke();
      ctx.fillStyle = '#0e0d0b'; ctx.fillRect(16, 236, 224, 68);
      ctx.strokeStyle = '#736543'; ctx.lineWidth = 1.8; ctx.strokeRect(18, 238, 220, 64);
      ctx.fillStyle = '#cfc29f'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(title, 128, 260);
      ctx.font = '12px sans-serif'; ctx.fillStyle = '#968e7b';
      ctx.fillText(role, 128, 277); ctx.fillText(period, 128, 292);
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = rotY;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.90, 0.04), new THREE.MeshStandardMaterial({ color: 0x2b1c11, roughness: 0.7 }));
      frame.position.z = -0.02; grp.add(frame);
      grp.add(new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.84), new THREE.MeshBasicMaterial({ map: tex })));
      this.zoneGroup.add(grp);
    };

    // North wall exhibition sequence (z = 1.78, facing South)
    buildBridgePortrait(10, 1.75, 1.78, Math.PI, '首任院長 陳○○ 醫師', '建院院長・精神醫療奠基', '1979 - 1986');
    buildBridgePortrait(20, 1.75, 1.78, Math.PI, '第二任院長 林○○ 醫師', '住院與社區復健整合推手', '1986 - 1994');
    buildBridgePortrait(30, 1.75, 1.78, Math.PI, '第三任院長 許○○ 醫師', '精神重症與ECT治療先驅', '1994 - 2002');
    buildBridgePortrait(40, 1.75, 1.78, Math.PI, '第四任院長 郭○○ 醫師', '兩院區空中天橋開通主事', '2002 - 2011');
    buildBridgePortrait(50, 1.75, 1.78, Math.PI, '第五任院長 鄭○○ 醫師', '現代精神醫療體系革新', '2011 - 2019');

    // South wall exhibition sequence (z = -1.78, facing North)
    buildBridgePortrait(15, 1.75, -1.78, 0, '1981 首屆精神醫學年會', '創院初期醫療團隊全體留影', '1981.10');
    buildBridgePortrait(25, 1.75, -1.78, 0, '首任精神部主任 葉○○', '急診重症專科奠基者', '1979 - 1990');
    buildBridgePortrait(35, 1.75, -1.78, 0, '1992 天橋貫通落成紀錄', '兩院區高空結構合攏竣工', '1992.05');
    buildBridgePortrait(45, 1.75, -1.78, 0, '首任總護理長 許○○', '推動全台首創開放式日間護理', '1980 - 1996');
    buildBridgePortrait(55, 1.75, -1.78, 0, '終身奉獻獎 蔡護理督導', '長期深耕慢性病房照護體系', '1982 - 2015');

    // ==========================================
    // 5. CEILING LIGHT FIXTURES (Alternating / realistic spacing)
    // ==========================================
    const lightPositions = [5, 12, 18, 25, 33, 40, 48, 55];
    lightPositions.forEach((x, index) => {
      // Intentionally subtle alternating lateral offset & mixed orientation
      const offsetZ = index % 2 === 0 ? -0.25 : 0.25;
      const isTransverse = index % 3 === 0;
      const tubeColor = (index === 2 || index === 5) ? 0xffe4c0 : 0xfff6ea; // Aged warm tube
      this.gf.buildCeilingLight(
        this.zoneGroup,
        x,
        bridgeHeight - 0.05,
        offsetZ,
        0.75,
        8.0,
        tubeColor,
        isTransverse
      );
    });

    const art=artRoot(this.zoneGroup,'Bridge');
    buildCampusBackdrop(art);
    // Adjacent vestibules remain visible until the existing portal changes zones.
    for (const [x, end] of [[-4,-8],[64,68]]) {
      solid(art,this.gf.materials.floorTile,[x,-.08,0],[8,.16,4]);
      solid(art,this.gf.materials.ceiling,[x,3.2,0],[8,.15,4]);
      for(const z of [-2,2])solid(art,this.gf.materials.wall,[x,1.6,z],[8,3.2,.3]);
      solid(art,this.gf.materials.wall,[end,1.6,0],[.3,3.2,4]);
      solid(art,this.gf.materials.stainless,[end+(end<0?.17:-.17),1.25,0],[.04,2.5,2]);
      solid(art,this.gf.materials.metal,[end+(end<0?.2:-.2),1.25,0],[.04,2.5,.025]);
      solid(art,this.gf.materials.lightWarm,[x,3.09,0],[1.2,.04,.35]);
    }
    for (const z of [-1.8,1.8]) {
      solid(art,this.gf.materials.metal,[30,.94,z],[60,.055,.12]);
      solid(art,this.gf.materials.metal,[30,2.7,z],[60,.04,.09]);
      for(let x=2.5;x<60;x+=5) solid(art,this.gf.materials.metal,[x,1.8,z],[.055,1.8,.08]);
      for(let x=1;x<60;x+=2) solid(art,this.gf.materials.metal,[x,1.02,z],[.03,.12,.13]);
    }
    for(let x=10;x<60;x+=10) solid(art,this.gf.materials.wallDark,[x,.004,0],[.025,.008,3.98]);
    wallTrim(this.zoneGroup,this.gf.materials);
    new AccessDoor(this,{id:'BRIDGE_FIRST',x:0,z:0,yaw:Math.PI/2,width:2.4,title:'第一院區感應門',portal:'first_bridge_return'});
    new AccessDoor(this,{id:'BRIDGE_SECOND',x:60,z:0,yaw:Math.PI/2,width:2.4,title:'第二院區感應門',portal:'second_bridge_return'});
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
