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
    this.wardGateClosed = true;
    this.acuteGateClosed = true;
    this.doorStates = {};
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
      'second_campus_4f_story': SecondCampusStandardFloor,
      'second_campus_5f': SecondCampusStandardFloor,
      'second_campus_std': SecondCampusStandardFloor,
      'second_campus_1f': SecondCampus1F,
      'hillside_route': HillsideRoute,
      'ecology_pond': EcologyPond
    };

    this.zoneLabels = {
      'first_campus_3f': '1. 第一院區 3F 行政與總醫師室 (M0)',
      'first_campus_4f': '2. 第一院區 4F 病房 (M1-M3)',
      'first_campus_2f': '3. 第一院區 2F 急診 (M4)',
      'first_campus_1f': '4. 第一院區 1F 公共服務大廳 (M5)',
      'first_campus_8f': '5. 第一院區 8F 院史展天橋前廳 (M6)',
      'skybridge': '6. 跨院區空中連通道 (M7)',
      'second_campus_2f': '7. 第二院區 2F 連通道管制台 (M9)',
      'second_campus_4f_story': '第二院區 4F 劇情專用場景（一般電梯不顯示）',
      'second_campus_5f': '8. 第二院區 5F 病房護理站 (M8)',
      'second_campus_std': '8. 第二院區 5F 病房護理站 (M8)',
      'second_campus_1f': '9. 第二院區 1F 警衛台與山側後門 (M10)',
      'hillside_route': '10. 山側景觀步道與叉路 (M11)',
      'ecology_pond': '11. 生態池觀景木棧台 (M12)'
    };

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
      if (this.activeZoneId === 'first_campus_2f' && typeof this.activeZoneInstance.acuteGateClosed === 'boolean') {
        this.acuteGateClosed = this.activeZoneInstance.acuteGateClosed;
      }
      this.doorStates[this.activeZoneId]=Object.fromEntries(Object.entries(this.activeZoneInstance.accessDoors||{}).map(([id,d])=>[id,d.closed]));
      this.activeZoneInstance.cleanup();
      this.activeZoneInstance = null;
    }

    console.info(`[WorldRouter] Loading Zone: ${zoneId}`);
    const lightingZone = (zoneId === 'second_campus_4f_story' || zoneId === 'second_campus_5f') ? 'second_campus_std' : zoneId;
    applyZoneLighting(this.lightingGroup, this.scene, lightingZone);
    const ZoneClass = this.zones[zoneId];
    const floorMatch = zoneId.match(/_([0-9])f(?:_|$)/);
    this.activeZoneInstance = new ZoneClass(this.scene, this.gf, { floor: Number(floorMatch?.[1] || 5) });
    this.activeZoneInstance.build();
    addTravelFixtures(this.activeZoneInstance, zoneId);
    this.activeZoneInstance.zoneGroup.updateMatrixWorld(true);

    const corridorLights = new Set();
    // The new wards have an authored light plan. Do not multiply shader lights
    // by both room and corridor count when expanding from four to nine rooms.
    const authoredWard = ['first_campus_4f','second_campus_5f','second_campus_4f_story','second_campus_std'].includes(zoneId);
    for (const room of (authoredWard ? [] : this.activeZoneInstance.roomAreas || [])) {
      for (const point of [room.point, room.corridor].filter(Boolean)) {
        const key = point[0] + ':' + point[2];
        if (corridorLights.has(key)) continue;
        corridorLights.add(key);
        const light = new THREE.RectAreaLight(0xfff0d9, 3.5, 2, 1.2);
        light.position.set(point[0], 3, point[2]);
        light.lookAt(point[0], 0, point[2]);
        this.lightingGroup.add(light);
      }
    }

    if (zoneId === 'first_campus_4f') {
      this.activeZoneInstance.setDutyDoorClosed(this.dutyDoorClosed);
      this.activeZoneInstance.setWardGateClosed(this.wardGateClosed);
    }
    if (zoneId === 'first_campus_2f' && this.activeZoneInstance.setAcuteGateClosed) {
      this.activeZoneInstance.setAcuteGateClosed(this.acuteGateClosed);
    }
    if (zoneId === 'first_campus_1f') {
      this.activeZoneInstance.setEntranceClosed(true);
    }
    for(const [id,closed] of Object.entries(this.doorStates[zoneId]||{})){
      this.activeZoneInstance.accessDoors?.[id]?.setClosed(closed);
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
      locTag.textContent = this.zoneLabels[this.activeZoneId].replace(/^[0-9]+[.] /, '').split(' (M')[0];
    }
  }

  update() {
    if (!this.controller?.enabled) return;
    const portal = ROUTE_PORTALS.find(p => !p.gated && p.from === this.activeZoneId && new THREE.Box3(new THREE.Vector3(...p.bounds[0]), new THREE.Vector3(...p.bounds[1])).containsPoint(this.controller.position));
    if (portal) this.teleportToSpawn(portal.spawn);
  }

  floorDestinations(kind = 'elevator') {
    const campus = this.activeZoneId.startsWith('first') ? 'first' : 'second';
    const floors = campus === 'first' ? FIRST_FLOORS : SECOND_FLOORS;
    return floors.map(f => {
      let zoneId = `${campus}_campus_${f}f`;
      if (campus === 'second' && f === 5) zoneId = 'second_campus_5f';
      const spawn = kind === 'stairs' ? `${campus}_${f}f_stairs` : `${campus}_${f}f_lift`;
      let label = `${f}F`;
      if (campus === 'first') {
        if (f === 1) label = '1F 公共服務大廳';
        else if (f === 2) label = '2F 急診';
        else if (f === 3) label = '3F 醫師行政區';
        else if (f === 4) label = '4F 病房';
        else if (f === 8) label = '8F 院史展天橋';
      } else {
        if (f === 1) label = '1F 警衛台出入口';
        else if (f === 2) label = '2F 連通道管制台';
        else if (f === 5) label = '5F 病房護理站';
      }
      return { floorNum: f, zoneId, spawn, label };
    });
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
}
