// FirstCampus3F.js - Milestone M0: First Campus 3F Doctor Administrative Area & Room 316
import * as THREE from 'three';
import { Level3FBlockout } from '../Level3FBlockout.js';
import { applyAct1CollisionHotfix } from '../CollisionHotfix.js';

function disposeMaterial(mat) {
  if (!mat) return;
  ['map', 'lightMap', 'bumpMap', 'normalMap', 'specularMap', 'envMap', 'alphaMap', 'roughnessMap', 'metalnessMap'].forEach((key) => {
    if (mat[key] && typeof mat[key].dispose === 'function') {
      mat[key].dispose();
    }
  });
  if (typeof mat.dispose === 'function') {
    mat.dispose();
  }
}

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
    // Pass zoneGroup so all meshes, lights, signs are children of zoneGroup, not global scene
    this.levelInstance = new Level3FBlockout(this.zoneGroup);
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
    if (this.zoneGroup) {
      this.scene.remove(this.zoneGroup);
      this.zoneGroup.traverse((child) => {
        if (child.geometry && typeof child.geometry.dispose === 'function') {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => disposeMaterial(m));
          } else {
            disposeMaterial(child.material);
          }
        }
      });
      this.zoneGroup.clear();
    }
    this.levelInstance = null;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
  }
}
