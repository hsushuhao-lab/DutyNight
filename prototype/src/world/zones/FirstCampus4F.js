// FirstCampus4F.js - Milestones M1, M2, M3: 4F Core Shell, Independent Duty Room, Nursing Station & Ward Gate
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { artRoot, asset, solid, counterFront, monitor, wallTrim, wallClock } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
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
    this.art = artRoot(this.zoneGroup, '4F');

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

    // Lobby overhead sign
    SignAnchor.buildHangingSign({
      scene: this.zoneGroup,
      x: -6.5,
      y: 2.65,
      z: 0,
      ceilingY: 3.2,
      rotationY: Math.PI / 2,
      text: '4F 醫師值班室 ｜ 4A 護理站・病房'
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
    asset(this.art, 'hospitalBed', [3.5, 0, -6.8], [1.3, .95, .97]);
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
      new THREE.CylinderGeometry(0.07, 0.14, 0.18, 32),
      new THREE.MeshStandardMaterial({ color: 0xfff2dc, roughness: 0.4 })
    );
    lampShade.position.set(4.65, 0.72, -7.2);
    this.zoneGroup.add(lampShade);

    const nightLampLight = new THREE.PointLight(0xffe1b0, 0.8, 3.5);
    nightLampLight.position.set(4.65, 0.70, -7.2);
    this.zoneGroup.add(nightLampLight);

    // 2. Study desk & chair
    asset(this.art, 'workDesk', [7.5, 0, -4.5], [1.6 / 1.405, 1, .8 / .725], Math.PI);
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

    asset(this.art, 'officeChair', [7.5, 0, -5.3], [.9, 1, .9]);

    // 3. Wardrobe / locker with stainless handle
    asset(this.art, 'storageCabinet', [8.2, 0, -7.5], [.8 / .9, 2 / 1.8, .7 / .509]);
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

    const mirror = new Reflector(new THREE.PlaneGeometry(.45,.7), {color:0xf2f2ec,textureWidth:512,textureHeight:512,clipBias:.003});
    mirror.material.addEventListener('dispose',()=>mirror.getRenderTarget().dispose());
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
    [7.48, 10.02].forEach(x => asset(this.art, 'workDesk', [x, 0, 4.5], [2.45 / 1.405, 1, 1 / .725]));
    CollisionFactory.addBox(this.colliders, 8.75, 0.4, 4.5, 5.0, 0.8, 1.0);

    // Desktop monitors & chart binder racks
    monitor(this.art, this.gf.materials, 7.5, .76, 4.5, 0);
    monitor(this.art, this.gf.materials, 9.8, .76, 4.5, 0);
    [7.5, 9.8].forEach(x => asset(this.art, 'officeChair', [x, 0, 5.5], [1, 1, 1], Math.PI));
    asset(this.art, 'printer', [11, .76, 4.5]);

    // Wall chart rack on back wall
    const chartRack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.12), this.gf.materials.metal);
    chartRack.position.set(8.0, 1.8, 7.3);
    this.zoneGroup.add(chartRack);

    // Nursing Station Signboard
    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 8.75,
      y: 2.55,
      z: 2.385,
      rotationY: Math.PI,
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
      text: '4A 閉鎖病房 ｜ 門禁管制區域（請刷卡）'
    });

    this.buildArtDetails();
    this.buildDutyDoor();
    return this;
  }

  buildArtDetails() {
    const m = this.gf.materials;
    const add = (material, position, size) => solid(this.art, material, position, size);
    for(const z of [-3,3])add(m.wall,[-4,1.6,z],[.4,3.2,1]);
    wallTrim(this.zoneGroup, m);
    counterFront(this.art, m, 8.75, 2.185, 5.5, 1.05);
    // Continuous timber header holds the plaque and observation glazing physically.
    add(m.doorWood, [8.75, 2.56, 2.5], [5.7, .48, .18]);
    [6.05, 8.75, 11.45].forEach(x => add(m.doorWood, [x, 1.73, 2.5], [.065, 1.28, .09]));
    add(m.doorWood, [8.75, 2.3, 2.5], [5.45, .06, .09]);
    // Chart pockets attach to the existing rack rather than floating over the desk.
    for(let i=0;i<8;i++) {
      add(m.wallBumper, [7.07+i*.265, 1.75, 7.2], [.22, .52, .08]);
      add(m.bedSheet, [7.07+i*.265, 1.86, 7.145], [.185, .48, .008]);
      add(m.metal, [7.07+i*.265, 2.09, 7.13], [.05, .03, .016]);
    }
    add(m.metal, [4.65, .69, -7.2], [.016, .2, .016]);
    add(m.doorWood, [4.65, .43, -6.951], [.41, .19, .018]);
    add(m.metal, [4.65, .43, -6.934], [.14, .015, .025]);
    wallClock(this.art,m,5.1,2.35,-8.27);
    add(m.doorWood,[6.5,1.8,-8.26],[.6,.09,.04]);
    add(m.metal,[6.5,1.78,-8.20],[.035,.10,.08]);
    const coatMaterial=new THREE.MeshStandardMaterial({color:0xc8c9c0,roughness:.96,side:THREE.DoubleSide});
    const garment=new THREE.Group();garment.name='DutyRoom/DrapedCoat';garment.position.set(6.5,1.75,-8.13);this.art.add(garment);
    // A closed circumferential cloth surface gives the hanging garment real volume.
    const coatGeometry=new THREE.PlaneGeometry(1,1,48,32);
    const cloth=coatGeometry.attributes.position;
    for(let i=0;i<cloth.count;i++) {
      const u=cloth.getX(i)+.5,t=.5-cloth.getY(i),a=u*Math.PI*2;
      const width=.17+.055*t+.05*Math.exp(-Math.pow((t-.14)*8,2));
      const fold=.012*Math.sin(a*9+t*2)+.006*Math.sin(a*17-t*4);
      cloth.setXYZ(i,Math.cos(a)*(width+fold),-.91*t+.012*Math.sin(a*4)*t,Math.sin(a)*(.072+fold)+.035);
    }
    coatGeometry.computeVertexNormals();
    const coat=new THREE.Mesh(coatGeometry,coatMaterial);coat.castShadow=true;coat.receiveShadow=true;garment.add(coat);
    for(const side of [-1,1]) {
      const sleevePath=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.17,-.08,.025),new THREE.Vector3(side*.27,-.19,.04),new THREE.Vector3(side*.30,-.37,.07),new THREE.Vector3(side*.29,-.55,.1)]);
      const sleeve=new THREE.Mesh(new THREE.TubeGeometry(sleevePath,20,.063,12,false),coatMaterial);sleeve.castShadow=true;garment.add(sleeve);
      const lapel=new THREE.Mesh(new THREE.PlaneGeometry(.075,.22,3,8),coatMaterial);lapel.position.set(side*.052,-.12,.119);lapel.rotation.z=side*-.28;garment.add(lapel);
      const pocket=new THREE.Mesh(new THREE.BoxGeometry(.115,.13,.012),coatMaterial);pocket.position.set(side*.12,-.64,.106);garment.add(pocket);
    }
    for(const y of [-.29,-.42,-.55])add(m.bedSheet,[6.5,1.75+y,-8.006],[.012,.012,.009]);
    // A finely subdivided cover drapes over the existing mattress, inside its collider footprint.
    const coverGeometry=new THREE.PlaneGeometry(1.29,1.46,48,56);
    const coverVertices=coverGeometry.attributes.position;
    for(let i=0;i<coverVertices.count;i++) {
      const x=coverVertices.getX(i),z=coverVertices.getY(i),edge=Math.max(0,(Math.abs(x)-.55)/.095);
      const folds=.013*Math.sin(x*39+z*8)+.006*Math.cos(z*29-x*15);
      coverVertices.setXYZ(i,x,.646+folds-.14*edge*edge,z);
    }
    coverGeometry.computeVertexNormals();
    const cover=new THREE.Mesh(coverGeometry,new THREE.MeshStandardMaterial({color:0x87998b,roughness:1,side:THREE.DoubleSide}));
    cover.name='DutyRoom/SoftBedCover';cover.position.set(3.5,0,-6.58);cover.castShadow=true;cover.receiveShadow=true;this.art.add(cover);
    // Personal items rest on the existing desk and nightstand, away from circulation.
    add(m.doorWood,[6.96,.777,-4.58],[.24,.04,.18]);
    add(m.bedSheet,[6.96,.804,-4.58],[.22,.014,.17]);
    const flask=new THREE.Mesh(new THREE.CylinderGeometry(.037,.039,.20,24),m.stainless);flask.position.set(4.50,.66,-7.33);this.art.add(flask);
    const flaskLid=new THREE.Mesh(new THREE.CylinderGeometry(.039,.039,.035,24),m.wallDark);flaskLid.position.set(4.50,.778,-7.33);this.art.add(flaskLid);
    // Reading lamp and ordinary phone make the private room a usable staff retreat.
    add(m.metal, [8.1, .775, -4.5], [.25, .035, .18]);
    add(m.bedSheet, [8.1, 1.1, -4.5], [.28, .055, .18]);
    add(m.metal, [7.8, .79, -4.33], [.22, .065, .18]);
    add(m.wallDark, [7.8, .84, -4.33], [.24, .045, .065]);
    asset(this.art, 'plant', [8.9, .76, 4.45], [.26, .26, .26]);
    // Sink is wall supported with a recessed basin, chrome tap and drain pedestal.
    const oldSink=this.zoneGroup.children.find(object=>object.isMesh && object.position.equals(new THREE.Vector3(2.6,.8,-4)));
    oldSink.visible=false;
    add(m.bedSheet,[2.6,.69,-4.53],[.47,.12,.53]);
    add(m.bedSheet,[2.6,.79,-4.79],[.52,.13,.07]);
    add(m.bedSheet,[2.6,.79,-4.27],[.52,.13,.07]);
    [2.36,2.84].forEach(x=>add(m.bedSheet,[x,.79,-4.53],[.07,.13,.53]));
    add(m.bedSheet,[2.6,.39,-4.68],[.18,.65,.18]);
    add(m.stainless,[2.6,.87,-4.74],[.025,.19,.025]);
    add(m.stainless,[2.6,.96,-4.68],[.025,.025,.15]);
    add(m.stainless,[2.6,.757,-4.53],[.06,.006,.06]);
    [2.355,2.845].forEach(x=>add(m.metal,[x,1.5,-4.87],[.035,.75,.025]));
    [1.125,1.875].forEach(y=>add(m.metal,[2.6,y,-4.87],[.52,.035,.025]));
    // Elevator seam, thresholds and small hardware remain outside circulation.
    add(m.wallDark,[-11.598,1.25,0],[.012,2.3,.012]);
    add(m.stainless,[-11.56,.016,0],[.22,.032,2.1]);
    add(m.wallDark,[13.724,1.32,-1.2],[.018,.13,.085]);
  }

  buildDutyDoor() {
    const doorway=this.zoneGroup.getObjectByName('Doorway_5.4_-2.5');
    const leaf=doorway.children.find(object=>object.geometry?.parameters.width===.05 && object.geometry.parameters.height===2.35);
    this.dutyDoorPivot=new THREE.Group();
    this.dutyDoorPivot.name='DutyRoomHingedLeaf';
    this.dutyDoorPivot.position.set(4.92,0,-2.5);
    doorway.add(this.dutyDoorPivot);
    this.dutyDoorPivot.add(leaf);
    leaf.position.set(0,1.175,.56);
    const m=this.gf.materials;
    solid(this.dutyDoorPivot,m.stainless,[.035,.2,.56],[.022,.27,1.04]);
    [.22,1.2,2.12].forEach(y=>solid(this.dutyDoorPivot,m.stainless,[0,y,.035],[.08,.09,.04]));
    const handle=solid(this.dutyDoorPivot,m.stainless,[.085,1.05,.97],[.13,.025,.025]);
    solid(this.dutyDoorPivot,m.stainless,[-.085,1.05,.97],[.13,.025,.025]);
    this.dutyDoorHandle=handle;
    this.dutyDoorHitbox=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3),new THREE.MeshBasicMaterial({visible:false}));
    this.dutyDoorHitbox.userData={interactable:true,id:'DUTY_ROOM_DOOR',type:'duty_door',label:'關閉值班室房門'};
    this.zoneGroup.add(this.dutyDoorHitbox);
    this.interactables.push(this.dutyDoorHitbox);
    this.dutyDoorCollider=new THREE.Box3(new THREE.Vector3(4.92,0,-2.545),new THREE.Vector3(6.04,2.35,-2.455));
    this.dutyDoorClosed=false;
    this.setDutyDoorClosed(false);
  }

  setDutyDoorClosed(closed) {
    this.dutyDoorClosed=closed;
    this.dutyDoorPivot.rotation.y=closed?Math.PI/2:0;
    const index=this.colliders.indexOf(this.dutyDoorCollider);
    if(closed && index===-1)this.colliders.push(this.dutyDoorCollider);
    if(!closed && index!==-1)this.colliders.splice(index,1);
    this.dutyDoorPivot.updateWorldMatrix(true,true);
    this.dutyDoorHandle.getWorldPosition(this.dutyDoorHitbox.position);
    this.dutyDoorHitbox.userData.label=closed?'開啟值班室房門':'關閉值班室房門';
  }

  toggleDutyDoor(playerPosition) {
    if(!this.dutyDoorClosed && playerPosition) {
      const player=new THREE.Box3(new THREE.Vector3(playerPosition.x-.35,0,playerPosition.z-.35),new THREE.Vector3(playerPosition.x+.35,1.9,playerPosition.z+.35));
      if(player.intersectsBox(this.dutyDoorCollider))return false;
    }
    this.setDutyDoorClosed(!this.dutyDoorClosed);
    return true;
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
