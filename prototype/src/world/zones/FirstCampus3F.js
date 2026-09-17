// FirstCampus3F.js - Milestone M0: First Campus 3F Doctor Administrative Area & Room 316
import * as THREE from 'three';
import { Level3FBlockout } from '../Level3FBlockout.js';
import { applyAct1CollisionHotfix } from '../CollisionHotfix.js';

export class FirstCampus3F {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.geometryFactory = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'FirstCampus3F_Zone';
    this.levelInstance = null;
  }

  build() {
    this.scene.add(this.zoneGroup);
    // Instantiate underlying 3F level
    this.levelInstance = new Level3FBlockout(this.scene);
    applyAct1CollisionHotfix(this.levelInstance);

    this.colliders = this.levelInstance.colliders;
    this.walkables = this.levelInstance.walkables;
    this.interactables = this.levelInstance.interactables;

    // References for gameplay state
    this.keyMesh = this.levelInstance.keyMesh;
    this.workstationMesh = this.levelInstance.workstationMesh;
    this.dutyLogMesh = this.levelInstance.dutyLogMesh;
    this.elevatorLight = this.levelInstance.elevatorLight;

    return this;
  }

  updateElevatorLight(isReady) {
    if (this.levelInstance) {
      this.levelInstance.updateElevatorLight(isReady);
    }
  }

  cleanup() {
    // In three.js we can clear scene elements if switching zones
    this.scene.remove(this.zoneGroup);
  }
}
