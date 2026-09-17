// FPSController.js - Smooth first-person controller with collision and raycast interaction
import * as THREE from 'three';
import { soundManager } from '../audio/SoundManager.js';

export class FPSController {
  constructor(camera, domElement, colliders, interactables) {
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders;
    this.interactables = interactables;

    this.isLocked = false;
    this.enabled = true;

    // Movement state
    this.keys = { forward: false, backward: false, left: false, right: false, shift: false };
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.playerRadius = 0.35;
    this.eyeHeight = 1.7;

    // Camera angles
    this.pitch = 0;
    this.yaw = 0;
    this.mouseSensitivity = 0.0022;

    // Head bob & footsteps
    this.bobTimer = 0;
    this.distanceWalked = 0;
    this.lastFootstepDistance = 0;

    // Raycast interaction
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 2.6;
    this.currentInteractable = null;
    this.onHoverChange = null;
    this.onInteract = null;

    // Setup initial position (corridor near office entrance, facing office)
    this.position = new THREE.Vector3(2.0, this.eyeHeight, 0.5);
    this.yaw = Math.PI / 2; // Facing north toward office
    this.updateCameraRotation();

    this.initEvents();
  }

  initEvents() {
    this.domElement.addEventListener('click', () => {
      if (this.enabled && !this.isLocked) {
        this.domElement.requestPointerLock();
        soundManager.init();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.domElement;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked || !this.enabled) return;

      this.yaw -= e.movementX * this.mouseSensitivity;
      this.pitch -= e.movementY * this.mouseSensitivity;
      // Clamp pitch to avoid neck flipping
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));

      this.updateCameraRotation();
    });

    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.keys.forward = true; break;
        case 'KeyS': case 'ArrowDown': this.keys.backward = true; break;
        case 'KeyA': case 'ArrowLeft': this.keys.left = true; break;
        case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': this.keys.shift = true; break;
        case 'KeyE':
          if (this.currentInteractable && this.onInteract) {
            this.onInteract(this.currentInteractable);
          }
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.keys.forward = false; break;
        case 'KeyS': case 'ArrowDown': this.keys.backward = false; break;
        case 'KeyA': case 'ArrowLeft': this.keys.left = false; break;
        case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': this.keys.shift = false; break;
      }
    });
  }

  updateCameraRotation() {
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = this.pitch;
    euler.y = this.yaw;
    this.camera.quaternion.setFromEuler(euler);
  }

  update(delta) {
    if (!this.enabled) return;

    // Movement calculation
    const moveSpeed = this.keys.shift ? 4.0 : 2.6;
    const damping = 10.0;

    this.velocity.x -= this.velocity.x * damping * delta;
    this.velocity.z -= this.velocity.z * damping * delta;

    this.direction.z = Number(this.keys.forward) - Number(this.keys.backward);
    this.direction.x = Number(this.keys.right) - Number(this.keys.left);
    this.direction.normalize();

    if (this.keys.forward || this.keys.backward) {
      this.velocity.z += this.direction.z * moveSpeed * 35.0 * delta;
    }
    if (this.keys.left || this.keys.right) {
      this.velocity.x += this.direction.x * moveSpeed * 35.0 * delta;
    }

    // World-space displacement
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    const deltaX = (forward.x * this.velocity.z + right.x * this.velocity.x) * delta;
    const deltaZ = (forward.z * this.velocity.z + right.z * this.velocity.x) * delta;

    // Attempt movement on X
    const newPosX = this.position.x + deltaX;
    if (!this.checkCollision(newPosX, this.position.z)) {
      this.position.x = newPosX;
    } else {
      this.velocity.x = 0;
    }

    // Attempt movement on Z
    const newPosZ = this.position.z + deltaZ;
    if (!this.checkCollision(this.position.x, newPosZ)) {
      this.position.z = newPosZ;
    } else {
      this.velocity.z = 0;
    }

    // Footsteps and head bobbing
    const horizontalSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    if (horizontalSpeed > 0.3) {
      this.bobTimer += delta * (this.keys.shift ? 14 : 10);
      this.distanceWalked += horizontalSpeed * delta;

      if (this.distanceWalked - this.lastFootstepDistance > (this.keys.shift ? 1.8 : 1.35)) {
        soundManager.playFootstep();
        this.lastFootstepDistance = this.distanceWalked;
      }
    } else {
      this.bobTimer = 0;
    }

    const bobOffset = Math.sin(this.bobTimer) * 0.035;
    this.camera.position.set(this.position.x, this.position.y + bobOffset, this.position.z);

    // Update raycasting for interaction
    this.updateRaycast();
  }

  checkCollision(x, z) {
    const r = this.playerRadius;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(x - r, 0.2, z - r),
      new THREE.Vector3(x + r, 2.0, z + r)
    );

    for (const box of this.colliders) {
      if (playerBox.intersectsBox(box)) {
        return true;
      }
    }
    return false;
  }

  updateRaycast() {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const hits = this.raycaster.intersectObjects(this.interactables, true);

    let foundInteractable = null;
    if (hits.length > 0) {
      let cur = hits[0].object;
      while (cur) {
        if (cur.userData && cur.userData.interactable) {
          foundInteractable = cur.userData;
          break;
        }
        cur = cur.parent;
      }
    }

    if (foundInteractable !== this.currentInteractable) {
      this.currentInteractable = foundInteractable;
      if (this.onHoverChange) {
        this.onHoverChange(foundInteractable);
      }
    }
  }

  teleport(x, y, z, yaw = 0) {
    this.position.set(x, y, z);
    this.yaw = yaw;
    this.pitch = 0;
    this.updateCameraRotation();
  }
}
