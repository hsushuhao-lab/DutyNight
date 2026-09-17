// FPSController.js - Comfortable first-person controller with collision, raycast interaction and double-click auto-walk
import * as THREE from 'three';
import { soundManager } from '../audio/SoundManager.js';

export class FPSController {
  constructor(camera, domElement, colliders, interactables, walkables = []) {
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders;
    this.interactables = interactables;
    this.walkables = walkables;

    this.isLocked = false;
    this.enabled = true;

    // Movement state
    this.keys = { forward: false, backward: false, left: false, right: false, shift: false };
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.playerRadius = 0.35;
    this.eyeHeight = 1.7;

    // Comfort-tuned camera angles. Lower sensitivity + lower bob reduces motion sickness.
    this.pitch = 0;
    this.yaw = 0;
    this.mouseSensitivity = 0.00105;

    // Head bob & footsteps
    this.bobTimer = 0;
    this.distanceWalked = 0;
    this.lastFootstepDistance = 0;

    // Raycast interaction
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 2.6;
    this.clickRaycaster = new THREE.Raycaster();
    this.clickRaycaster.far = 40;
    this.currentInteractable = null;
    this.onHoverChange = null;
    this.onInteract = null;

    // Double-click auto-walk target. This is intentionally simple: no hidden pathfinding,
    // just a comfort movement helper that still respects existing wall collision boxes.
    this.autoMoveTarget = null;
    this.autoMoveStopDistance = 0.65;
    this.autoMoveSpeed = 2.15;

    // Setup initial position (corridor near office entrance, facing office)
    this.position = new THREE.Vector3(2.0, this.eyeHeight, 0.5);
    this.yaw = Math.PI / 2;
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

    this.domElement.addEventListener('dblclick', (e) => {
      if (!this.enabled) return;
      soundManager.init();
      this.handleDoubleClick(e);
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.domElement;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked || !this.enabled) return;

      this.yaw -= e.movementX * this.mouseSensitivity;
      this.pitch -= e.movementY * this.mouseSensitivity;
      this.pitch = Math.max(-Math.PI / 2.35, Math.min(Math.PI / 2.35, this.pitch));

      this.updateCameraRotation();
    });

    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':
          this.keys.forward = true;
          this.cancelAutoMove();
          e.preventDefault();
          break;
        case 'KeyS': case 'ArrowDown':
          this.keys.backward = true;
          this.cancelAutoMove();
          e.preventDefault();
          break;
        case 'KeyA': case 'ArrowLeft':
          this.keys.left = true;
          this.cancelAutoMove();
          e.preventDefault();
          break;
        case 'KeyD': case 'ArrowRight':
          this.keys.right = true;
          this.cancelAutoMove();
          e.preventDefault();
          break;
        case 'ShiftLeft': case 'ShiftRight':
          this.keys.shift = true;
          break;
        case 'KeyE':
          if (this.currentInteractable && this.onInteract) {
            this.onInteract(this.currentInteractable);
          }
          break;
      }
    }, { passive: false });

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

  handleDoubleClick(event) {
    // Pointer lock has no meaningful cursor position, so use the crosshair/centre.
    const ndc = new THREE.Vector2(0, 0);
    if (!this.isLocked) {
      const rect = this.domElement.getBoundingClientRect();
      ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    this.clickRaycaster.setFromCamera(ndc, this.camera);
    const clickTargets = [...this.interactables, ...this.walkables];
    const hits = this.clickRaycaster.intersectObjects(clickTargets, true);
    if (hits.length === 0) return;

    const hit = hits[0];
    let node = hit.object;
    let interactableData = null;
    while (node) {
      if (node.userData?.interactable) {
        interactableData = node.userData;
        break;
      }
      node = node.parent;
    }

    const target = new THREE.Vector3();
    if (interactableData) {
      hit.object.getWorldPosition(target);
      this.autoMoveStopDistance = 1.15;
    } else {
      target.copy(hit.point);
      this.autoMoveStopDistance = 0.45;
    }

    target.y = this.eyeHeight;
    this.autoMoveTarget = target;
  }

  cancelAutoMove() {
    this.autoMoveTarget = null;
  }

  update(delta) {
    if (!this.enabled) return;

    const manualInput = this.keys.forward || this.keys.backward || this.keys.left || this.keys.right;
    if (manualInput) this.cancelAutoMove();

    // Movement calculation
    const moveSpeed = this.keys.shift ? 3.35 : 2.15;
    const damping = 12.0;

    this.velocity.x -= this.velocity.x * damping * delta;
    this.velocity.z -= this.velocity.z * damping * delta;

    this.direction.z = Number(this.keys.forward) - Number(this.keys.backward);
    this.direction.x = Number(this.keys.right) - Number(this.keys.left);
    this.direction.normalize();

    if (this.keys.forward || this.keys.backward) {
      this.velocity.z += this.direction.z * moveSpeed * 34.0 * delta;
    }
    if (this.keys.left || this.keys.right) {
      this.velocity.x += this.direction.x * moveSpeed * 34.0 * delta;
    }

    // World-space displacement for manual movement.
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    let deltaX = (forward.x * this.velocity.z + right.x * this.velocity.x) * delta;
    let deltaZ = (forward.z * this.velocity.z + right.z * this.velocity.x) * delta;

    // Double-click movement only runs when the player is not pressing movement keys.
    if (!manualInput && this.autoMoveTarget) {
      const toTarget = new THREE.Vector3(
        this.autoMoveTarget.x - this.position.x,
        0,
        this.autoMoveTarget.z - this.position.z
      );
      const distance = toTarget.length();
      if (distance <= this.autoMoveStopDistance) {
        this.cancelAutoMove();
      } else {
        toTarget.normalize();
        deltaX = toTarget.x * this.autoMoveSpeed * delta;
        deltaZ = toTarget.z * this.autoMoveSpeed * delta;

        // Turn the body/camera gently toward the travel direction without snapping.
        const targetYaw = Math.atan2(-toTarget.x, -toTarget.z);
        const yawDelta = Math.atan2(Math.sin(targetYaw - this.yaw), Math.cos(targetYaw - this.yaw));
        this.yaw += yawDelta * Math.min(1, delta * 4.5);
        this.updateCameraRotation();
      }
    }

    this.moveWithCollision(deltaX, deltaZ);

    // Footsteps and reduced head bobbing for comfort.
    const moving = Math.abs(deltaX) + Math.abs(deltaZ) > 0.0001;
    const horizontalSpeed = moving ? Math.sqrt(deltaX * deltaX + deltaZ * deltaZ) / Math.max(delta, 0.0001) : 0;
    if (horizontalSpeed > 0.2) {
      this.bobTimer += delta * (this.keys.shift ? 9.5 : 7.0);
      this.distanceWalked += horizontalSpeed * delta;

      if (this.distanceWalked - this.lastFootstepDistance > (this.keys.shift ? 1.8 : 1.45)) {
        soundManager.playFootstep();
        this.lastFootstepDistance = this.distanceWalked;
      }
    } else {
      this.bobTimer = 0;
    }

    const bobOffset = Math.sin(this.bobTimer) * 0.012;
    this.camera.position.set(this.position.x, this.position.y + bobOffset, this.position.z);

    this.updateRaycast();
  }

  moveWithCollision(deltaX, deltaZ) {
    const newPosX = this.position.x + deltaX;
    if (!this.checkCollision(newPosX, this.position.z)) {
      this.position.x = newPosX;
    } else {
      this.velocity.x = 0;
      if (this.autoMoveTarget) this.cancelAutoMove();
    }

    const newPosZ = this.position.z + deltaZ;
    if (!this.checkCollision(this.position.x, newPosZ)) {
      this.position.z = newPosZ;
    } else {
      this.velocity.z = 0;
      if (this.autoMoveTarget) this.cancelAutoMove();
    }
  }

  checkCollision(x, z) {
    const r = this.playerRadius;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(x - r, 0.2, z - r),
      new THREE.Vector3(x + r, 2.0, z + r)
    );

    for (const box of this.colliders) {
      if (playerBox.intersectsBox(box)) return true;
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
        if (cur.userData?.interactable) {
          foundInteractable = cur.userData;
          break;
        }
        cur = cur.parent;
      }
    }

    if (foundInteractable !== this.currentInteractable) {
      this.currentInteractable = foundInteractable;
      if (this.onHoverChange) this.onHoverChange(foundInteractable);
    }
  }

  teleport(x, y, z, yaw = 0) {
    this.cancelAutoMove();
    this.position.set(x, y, z);
    this.yaw = yaw;
    this.pitch = 0;
    this.updateCameraRotation();
  }
}
