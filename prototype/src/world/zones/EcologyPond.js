// EcologyPond.js - Milestone M12: Contained Ecological Pond Basin & Observation Deck
import * as THREE from 'three';
import { solid } from '../../art/ArtDetails.js';
import { applyPondArt } from '../../art/LandscapeArt.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { CollisionFactory } from '../shared/CollisionFactory.js';
import { SignAnchor } from '../shared/SignAnchor.js';

export class EcologyPond {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'EcologyPond_Zone';
  }

  build() {
    this.scene.add(this.zoneGroup);

    // Humid night mood light
    const outdoorLight = new THREE.HemisphereLight(0x283b48, 0x141f17, 0.4);
    this.zoneGroup.add(outdoorLight);

    // ==========================================
    // 1. SURROUNDING TERRAIN GROUND
    // ==========================================
    const terrainGeo = new THREE.PlaneGeometry(50, 40);
    const terrain = new THREE.Mesh(terrainGeo, this.gf.materials.terrainGrass);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(65, -0.8, -48);
    terrain.receiveShadow = true;
    this.zoneGroup.add(terrain);

    // ==========================================
    // 2. APPROACH PATH (From hillside branch into the pond deck)
    // ==========================================
    const approachGeo = new THREE.PlaneGeometry(2.6, 12);
    const approach = new THREE.Mesh(approachGeo, this.gf.materials.pathGravel);
    approach.rotation.x = -Math.PI / 2;
    approach.position.set(53, -0.58, -41);
    this.zoneGroup.add(approach);
    this.walkables.push(approach);

    // ==========================================
    // 3. WOODEN OBSERVATION DECK / BOARDWALK (x: 55 to 66, z: -46 to -41)
    // ==========================================
    const deckGeo = new THREE.BoxGeometry(11.0, 0.22, 6.0);
    const deck = new THREE.Mesh(deckGeo, this.gf.materials.floorWood);
    deck.position.set(60.5, -0.47, -43.5);
    deck.receiveShadow = true;
    this.zoneGroup.add(deck);
    this.walkables.push(deck);

    // Connect the approach to the existing deck entrance; the old gap was not walkable.
    this.gf.buildFloor(this.zoneGroup,this.walkables,54.65,-.58,-41.5,1.4,1.6,this.gf.materials.floorWood);

    // Wooden deck safety railings (split to allow stepped access to waterside boardwalk)
    // South railing west section (x: 55.0 to 60.5, at z = -46.4)
    const railSouthWest = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.0, 0.12), this.gf.materials.doorWood);
    railSouthWest.position.set(57.75, 0.1, -46.4);
    this.zoneGroup.add(railSouthWest);
    CollisionFactory.addBox(this.colliders, 57.75, 0.1, -46.4, 5.5, 1.2, 0.2);

    // South railing east section (x: 63.5 to 66.0, at z = -46.4)
    const railSouthEast = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.0, 0.12), this.gf.materials.doorWood);
    railSouthEast.position.set(64.75, 0.1, -46.4);
    this.zoneGroup.add(railSouthEast);
    CollisionFactory.addBox(this.colliders, 64.75, 0.1, -46.4, 2.5, 1.2, 0.2);

    // Stepped boardwalk ramp connecting upper observation deck to waterside dock (x: 60.5 to 63.5)
    const rampGeo = new THREE.BoxGeometry(3.0, 0.2, 2.6);
    const ramp = new THREE.Mesh(rampGeo, this.gf.materials.floorWood);
    ramp.position.set(62.0, -0.66, -47.7);
    // North end meets the upper deck; south end meets the lower waterside deck.
    ramp.rotation.x = -0.15;
    this.zoneGroup.add(ramp);
    this.walkables.push(ramp);

    // Ramp side safety barriers
    CollisionFactory.addBox(this.colliders, 60.4, -0.15, -47.7, 0.2, 1.2, 2.6);
    CollisionFactory.addBox(this.colliders, 63.6, -0.15, -47.7, 0.2, 1.2, 2.6);

    // ==========================================
    // 3B. LOWER WATERSIDE VIEWING DECK (x: 58 to 65, z: -49.0 to -52.6, y = -0.86)
    // Allows player to walk directly adjacent to the water's edge
    // ==========================================
    const lowerDeckGeo = new THREE.BoxGeometry(7.0, 0.2, 3.6);
    const lowerDeck = new THREE.Mesh(lowerDeckGeo, this.gf.materials.floorWood);
    lowerDeck.position.set(61.5, -0.86, -50.8);
    lowerDeck.receiveShadow = true;
    this.zoneGroup.add(lowerDeck);
    this.walkables.push(lowerDeck);

    // Waterside deck railings
    // South waterside railing (at z = -52.5)
    const railWaterSouth = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.0, 0.12), this.gf.materials.doorWood);
    railWaterSouth.position.set(61.5, -0.26, -52.5);
    this.zoneGroup.add(railWaterSouth);
    CollisionFactory.addBox(this.colliders, 61.5, -0.26, -52.5, 7.0, 1.2, 0.2);

    // West waterside railing (at x = 58.0)
    const railWaterWest = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 3.6), this.gf.materials.doorWood);
    railWaterWest.position.set(58.0, -0.26, -50.8);
    this.zoneGroup.add(railWaterWest);
    CollisionFactory.addBox(this.colliders, 58.0, -0.26, -50.8, 0.2, 1.2, 3.6);

    // East waterside railing (at x = 65.0)
    const railWaterEast = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 3.6), this.gf.materials.doorWood);
    railWaterEast.position.set(65.0, -0.26, -50.8);
    this.zoneGroup.add(railWaterEast);
    CollisionFactory.addBox(this.colliders, 65.0, -0.26, -50.8, 0.2, 1.2, 3.6);

    // North wings of lower deck (outside ramp)
    CollisionFactory.addBox(this.colliders, 59.25, -0.26, -49.0, 2.5, 1.2, 0.2);
    CollisionFactory.addBox(this.colliders, 64.25, -0.26, -49.0, 1.5, 1.2, 0.2);

    // East railing (at x = 65.9)
    const railEast = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 6.0), this.gf.materials.doorWood);
    railEast.position.set(65.9, 0.1, -43.5);
    this.zoneGroup.add(railEast);
    CollisionFactory.addBox(this.colliders, 65.9, 0.1, -43.5, 0.2, 1.2, 6.0);

    // West railing (at x = 55.1, south half z: -46.5 to -42.5, leaving entrance at -42.5 to -40.5)
    const railWest = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 4.0), this.gf.materials.doorWood);
    railWest.position.set(55.1, 0.1, -44.5);
    this.zoneGroup.add(railWest);
    CollisionFactory.addBox(this.colliders, 55.1, 0.1, -44.5, 0.2, 1.2, 4.0);

    // Observation wooden bench on the deck (placed against south edge x = 58.0, z = -45.2)
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.6), this.gf.materials.doorWood);
    bench.position.set(58.0, -0.2, -45.2);
    this.zoneGroup.add(bench);
    CollisionFactory.addBox(this.colliders, 58.0, -0.1, -45.2, 2.4, 0.6, 0.6);

    // Life-buoy rescue station post (mounted directly on lower waterside dock)
    const buoyPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8), this.gf.materials.metal);
    buoyPost.position.set(64.4, 0.04, -51.8);
    this.zoneGroup.add(buoyPost);
    const ringGeo = new THREE.TorusGeometry(0.3, 0.08, 12, 24);
    const buoyRing = new THREE.Mesh(
      ringGeo,
      new THREE.MeshStandardMaterial({ color: 0xd44728, roughness: 0.5 })
    );
    buoyRing.position.set(64.4, 0.44, -51.8);
    this.zoneGroup.add(buoyRing);

    // Signboard for Ecological Pond
    SignAnchor.buildWallPlaque({
      scene: this.zoneGroup,
      x: 54.0,
      y: 0.6,
      z: -41.0,
      width: 1.0,
      height: 0.4,
      rotationY: 0,
      code: 'POND',
      title: '生態池觀景平台 (深水請注意安全)',
      subtitle: 'ECOLOGICAL POND OBSERVATION DECK',
      header: '青嶺醫療中心 ｜ 後山生態景觀區'
    });

    // ==========================================
    // 4. POND BASIN & WATER PLANE PLACEHOLDER (x: 55 to 78, z: -58 to -47)
    // ==========================================
    const waterGeo = new THREE.PlaneGeometry(24.0, 12.0);
    const water = new THREE.Mesh(waterGeo, this.gf.materials.waterPlaceholder);
    water.rotation.x = -Math.PI / 2;
    water.position.set(66.5, -1.05, -52.5);
    this.zoneGroup.add(water);

    // Shoreline stone borders along pond
    const shoreMat = this.gf.materials.wallDark;
    const shoreNorth = new THREE.Mesh(new THREE.BoxGeometry(24.0, 0.6, 0.8), shoreMat);
    shoreNorth.position.set(66.5, -0.8, -46.8);
    this.zoneGroup.add(shoreNorth);

    const shoreSouth = new THREE.Mesh(new THREE.BoxGeometry(24.0, 0.6, 0.8), shoreMat);
    shoreSouth.position.set(66.5, -0.8, -58.2);
    this.zoneGroup.add(shoreSouth);

    const shoreEast = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 12.0), shoreMat);
    shoreEast.position.set(78.5, -0.8, -52.5);
    this.zoneGroup.add(shoreEast);

    // Deck soft warm ambient lantern
    const lantern = new THREE.PointLight(0xffbe6b, 0.7, 8.0);
    lantern.position.set(60.5, 1.2, -43.5);
    this.zoneGroup.add(lantern);

    // ==========================================
    // 5. BOUNDARY CONTAINMENT COLLIDERS (Prevent falling into void)
    // ==========================================
    CollisionFactory.addBox(this.colliders, 65.0, 1.0, -60.0, 50, 4.0, 0.5); // South edge
    CollisionFactory.addBox(this.colliders, 65.0, 1.0, -35.0, 50, 4.0, 0.5); // North edge
    CollisionFactory.addBox(this.colliders, 82.0, 1.0, -48.0, 0.5, 4.0, 25);  // East edge
    CollisionFactory.addBox(this.colliders, 48.0, 1.0, -48.0, 0.5, 4.0, 25);  // West edge

    applyPondArt(this);
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
