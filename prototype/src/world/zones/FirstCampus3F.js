// FirstCampus3F.js - Milestone M0: First Campus 3F Doctor Administrative Area & Room 316
import * as THREE from 'three';
import { gameState } from '../../core/GameState.js';
import { buildRoomWing } from '../shared/RoomWing.js';
import { Level3FBlockout } from '../Level3FBlockout.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { applyFirstFloorArt } from '../../art/FirstFloorArt.js';
import { applyAct1CollisionHotfix } from '../CollisionHotfix.js';

export class FirstCampus3F {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.geometryFactory = geometryFactory;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'FirstCampus3F_Zone';
    this.levelInstance = null;
  }

  build() {
    this.scene.add(this.zoneGroup);
    // Pass zoneGroup so all meshes, lights, signs are children of zoneGroup, not global scene
    this.levelInstance = new Level3FBlockout(this.zoneGroup);
    applyAct1CollisionHotfix(this.levelInstance);
    applyFirstFloorArt(this.levelInstance);

    this.colliders = this.levelInstance.colliders;
    this.walkables = this.levelInstance.walkables;
    this.interactables = this.levelInstance.interactables;

    buildRoomWing(this,{x:16,z:0,rooms:[
      {code:'3F_ADMIN',label:'行政辦公室',kind:'office'},
    ]});

    // References for gameplay state
    this.keyMesh = this.levelInstance.keyMesh;
    this.workstationMesh = this.levelInstance.workstationMesh;
    this.dutyLogMesh = this.levelInstance.dutyLogMesh;
    this.elevatorLight = this.levelInstance.elevatorLight;
    const keyAvailable = !gameState.isTaskComplete('KEY_PICKUP');
    this.keyMesh.visible = keyAvailable;
    this.keyMesh.userData.targetGroup.visible = keyAvailable;
    this.keyMesh.userData.interactable = keyAvailable;
    this.updateElevatorLight(gameState.areRequiredTasksComplete());

    return this;
  }

  updateElevatorLight(isReady) {
    if (this.levelInstance) {
      this.levelInstance.updateElevatorLight(isReady);
    }
  }

  cleanup() {
    if (this.zoneGroup) {
      this.scene.remove(this.zoneGroup);
      disposeZoneArt(this.zoneGroup);
    }
    this.levelInstance = null;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
  }
}
