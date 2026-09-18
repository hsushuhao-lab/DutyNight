// WorldRouter.js - Milestone M13: Central Scene/Zone Router, Traversal Verification & Debug Spawns
import * as THREE from 'three';
import { applyZoneLighting } from '../art/VisualProfile.js';
import { GeometryFactory } from './shared/GeometryFactory.js';
import { WORLD_SPAWNS as DEBUG_SPAWN_POINTS, ROUTE_PORTALS, FIRST_FLOORS, SECOND_FLOORS } from './shared/WorldRoutes.js';
import { addTravelFixtures } from './shared/TravelFixtures.js';
import { CollisionFactory } from './shared/CollisionFactory.js';

import { FirstCampus3F } from './zones/FirstCampus3F.js';
import { FirstCampus4F } from './zones/FirstCampus4F.js';
import { FirstCampus2FER } from './zones/FirstCampus2FER.js';
import { FirstCampus1F } from './zones/FirstCampus1F.js';
import { FirstCampus8FBridgeEntry } from './zones/FirstCampus8FBridgeEntry.js';
import { Skybridge } from './zones/Skybridge.js';
import { SecondCampus2F } from './zones/SecondCampus2F.js';
import { SecondCampusStandardFloor } from './zones/SecondCampusStandardFloor.js';
import { SecondCampus1F } from './zones/SecondCampus1F.js';
import { HillsideRoute } from './zones/HillsideRoute.js';
import { EcologyPond } from './zones/EcologyPond.js';

export class WorldRouter {
  constructor(scene, camera, controller) {
    this.scene = scene;
    this.camera = camera;
    this.controller = controller;
    this.gf = new GeometryFactory();

    this.dutyDoorClosed = false;
    this.wardGateClosed = false;
    this.activeZoneId = null;
    this.activeZoneInstance = null;

    this.zones = {
      'first_campus_3f': FirstCampus3F,
      'first_campus_4f': FirstCampus4F,
      'first_campus_2f': FirstCampus2FER,
      'first_campus_1f': FirstCampus1F,
      'first_campus_8f': FirstCampus8FBridgeEntry,
      'skybridge': Skybridge,
      'second_campus_2f': SecondCampus2F,
      'second_campus_std': SecondCampusStandardFloor,
      'second_campus_1f': SecondCampus1F,
      'hillside_route': HillsideRoute,
      'ecology_pond': EcologyPond
    };

    for(const floor of [3,4,5,6,7,8])this.zones[`second_campus_${floor}f`]=SecondCampusStandardFloor;
    this.zoneLabels = {
      'first_campus_3f': '1. 第一院區 3F 行政與總醫師室 (M0)',
      'first_campus_4f': '2. 第一院區 4F 病房、值班室與護理站 (M1-M3)',
      'first_campus_2f': '3. 第一院區 2F 急診與處置室 (M4)',
      'first_campus_1f': '4. 第一院區 1F 公共服務大廳 (M5)',
      'first_campus_8f': '5. 第一院區 8F 連通道前廳 (M6)',
      'skybridge': '6. 跨院區空中連通道 (M7)',
      'second_campus_2f': '7. 第二院區 2F 連通道抵達大廳 (M9)',
      'second_campus_std': '8. 第二院區 標準病房層 (M8)',
      'second_campus_1f': '9. 第二院區 1F 山側後門出口 (M10)',
      'hillside_route': '10. 山側景觀步道與叉路 (M11)',
      'ecology_pond': '11. 生態池觀景木棧台 (M12)'
    };

    for(const floor of [3,4,5,6,7,8])this.zoneLabels[`second_campus_${floor}f`]=`第二院區 ${floor}F 病房護理站`;
    this.lightingGroup = new THREE.Group();
    this.lightingGroup.name = 'WorldRouter_BaselineLighting';
    this.scene.add(this.lightingGroup);
  }

  /**
   * Loads a specific zone by ID and teleports player to a designated spawn point.
   */
  loadZone(zoneId, spawnId = null) {
    if (!this.zones[zoneId]) {
      console.warn(`[WorldRouter] Unknown zone: ${zoneId}, defaulting to first_campus_3f`);
      zoneId = 'first_campus_3f';
    }

    // Clean up current zone
    if (this.activeZoneInstance && typeof this.activeZoneInstance.cleanup === 'function') {
      if (this.activeZoneId === 'first_campus_4f') {
        this.dutyDoorClosed = this.activeZoneInstance.dutyDoorClosed;
        this.wardGateClosed = this.activeZoneInstance.wardGateClosed;
      }
      this.activeZoneInstance.cleanup();
      this.activeZoneInstance = null;
    }

    console.info(`[WorldRouter] Loading Zone: ${zoneId}`);
    applyZoneLighting(this.lightingGroup, this.scene, /^second_campus_[3-8]f$/.test(zoneId)?'second_campus_std':zoneId);
    const ZoneClass = this.zones[zoneId];
    this.activeZoneInstance = new ZoneClass(this.scene, this.gf, {floor:Number(zoneId.match(/_([0-9])f$/)?.[1] || 3)});
    this.activeZoneInstance.build();
    addTravelFixtures(this.activeZoneInstance,zoneId);
    this.activeZoneInstance.zoneGroup.updateMatrixWorld(true);
    const corridorLights=new Set();
    for(const room of this.activeZoneInstance.roomAreas || []) {
      for(const point of [room.point,room.corridor].filter(Boolean)) {
        const key=point[0]+':'+point[2];if(corridorLights.has(key))continue;corridorLights.add(key);
        const light=new THREE.RectAreaLight(0xfff0d9,3.5,2,1.2);light.position.set(point[0],3,point[2]);light.lookAt(point[0],0,point[2]);this.lightingGroup.add(light);
      }
    }
    if (zoneId === 'first_campus_4f') {
      this.activeZoneInstance.setDutyDoorClosed(this.dutyDoorClosed);
      this.activeZoneInstance.setWardGateClosed(this.wardGateClosed);
    }
    this.activeZoneId = zoneId;

    // Connect zone colliders, walkables, and interactables to the controller
    if (this.controller) {
      this.controller.colliders = this.activeZoneInstance.colliders || [];
      this.controller.walkables = this.activeZoneInstance.walkables || [];
      this.controller.interactables = this.activeZoneInstance.interactables || [];
    }

    // Handle spawn point
    if (spawnId && DEBUG_SPAWN_POINTS[spawnId]) {
      this.teleportToSpawn(spawnId);
    } else {
      // Find first default spawn point for this zone
      const defaultSpawn = Object.keys(DEBUG_SPAWN_POINTS).find(
        (key) => DEBUG_SPAWN_POINTS[key].zoneId === zoneId
      );
      if (defaultSpawn) {
        this.teleportToSpawn(defaultSpawn);
      }
    }

    this.updateHUDLocation();
    return this.activeZoneInstance;
  }

  /**
   * Teleports player to named spawn point.
   */
  teleportToSpawn(spawnKey) {
    const sp = DEBUG_SPAWN_POINTS[spawnKey];
    if (!sp) {
      console.warn(`[WorldRouter] Spawn point not found: ${spawnKey}`);
      return;
    }

    // Ensure zone is active
    if (this.activeZoneId !== sp.zoneId) {
      this.loadZone(sp.zoneId, spawnKey);
      return;
    }

    if (this.controller) {
      this.controller.teleport(sp.pos[0], sp.pos[1], sp.pos[2], sp.yaw);
      this.controller.pitch = sp.pitch || 0;
      this.controller.updateCameraRotation();
      console.info(`[WorldRouter] Teleported to ${spawnKey} (${sp.name}):`, sp.pos);
    }
  }

  updateHUDLocation() {
    const locTag = document.querySelector('.hud-location');
    if (locTag && this.zoneLabels[this.activeZoneId]) {
      locTag.textContent = this.zoneLabels[this.activeZoneId].replace(/^[0-9]+[.] /,'').split(' (M')[0];
    }
  }

  update() {
    if(!this.controller?.enabled)return;
    const portal=ROUTE_PORTALS.find(p=>p.from===this.activeZoneId && new THREE.Box3(new THREE.Vector3(...p.bounds[0]),new THREE.Vector3(...p.bounds[1])).containsPoint(this.controller.position));
    if(portal)this.teleportToSpawn(portal.spawn);
  }

  floorDestinations(kind='elevator') {
    const campus=this.activeZoneId.startsWith('first')?'first':'second';
    const floors=campus==='first'?FIRST_FLOORS:SECOND_FLOORS;
    return floors.filter(f=>kind!=='stairs'||(campus==='first'?[3,4].includes(f):f<=2)).map(f=>({zoneId:`${campus}_campus_${f}f`,spawn:`${campus}_${f}f_${kind==='stairs'&&campus==='first'&&[3,4].includes(f)?'stairs':'lift'}`,label:`${f}F${campus==='first'&&f===8?' 連通天橋':''}`}));
  }

  /**
   * Builds developer location debug selector on the screen.
   */
  createDebugUI() {
    const existing = document.getElementById('debug-zone-selector');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'debug-zone-selector';
    panel.style.position = 'fixed';
    panel.style.bottom = '16px';
    panel.style.left = '16px';
    panel.style.zIndex = '999999';
    panel.style.backgroundColor = 'rgba(20, 32, 26, 0.92)';
    panel.style.border = '1px solid #4d7a64';
    panel.style.borderRadius = '6px';
    panel.style.padding = '8px 12px';
    panel.style.fontFamily = 'monospace';
    panel.style.fontSize = '12px';
    panel.style.color = '#e2ede7';
    panel.style.boxShadow = '0 4px 14px rgba(0,0,0,0.5)';

    const label = document.createElement('div');
    label.style.fontWeight = 'bold';
    label.style.marginBottom = '6px';
    label.style.color = '#79d2a6';
    label.textContent = '🛠️ MODELING QA — 空間導覽切換 (M0~M13)';
    panel.appendChild(label);

    const select = document.createElement('select');
    select.style.backgroundColor = '#11221a';
    select.style.color = '#ffffff';
    select.style.border = '1px solid #3d6050';
    select.style.borderRadius = '4px';
    select.style.padding = '4px 8px';
    select.style.outline = 'none';

    Object.keys(DEBUG_SPAWN_POINTS).forEach((key) => {
      const sp = DEBUG_SPAWN_POINTS[key];
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `[${sp.milestone}] ${sp.name}`;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      this.teleportToSpawn(e.target.value);
    });

    panel.appendChild(select);
    document.body.appendChild(panel);
  }

  /**
   * Automated QA verification runner for all modeling milestones.
   */
  runAutomatedModelingQA() {
    console.log('=== STARTING AUTOMATED MODELING QA VERIFICATION ===');
    const results = {};

    Object.keys(DEBUG_SPAWN_POINTS).forEach((spawnKey) => {
      const sp = DEBUG_SPAWN_POINTS[spawnKey];
      // Test 1: Spawn inside collider
      const testZoneClass = this.zones[sp.zoneId];
      const dummyScene = new THREE.Scene();
      const testZone = new testZoneClass(dummyScene, this.gf);
      testZone.build();

      const pointCheck = CollisionFactory.testPoint(
        testZone.colliders,
        sp.pos[0],
        sp.pos[1],
        sp.pos[2],
        0.35
      );

      results[spawnKey] = {
        milestone: sp.milestone,
        name: sp.name,
        zoneId: sp.zoneId,
        coords: sp.pos,
        noSpawnCollision: !pointCheck.collided,
        colliderCount: testZone.colliders.length,
        walkableCount: testZone.walkables.length,
        status: !pointCheck.collided ? 'PASS' : 'FAIL'
      };
    });

    console.table(results);
    return results;
  }
}
