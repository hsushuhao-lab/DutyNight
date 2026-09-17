// Doorway.js - Single source of truth for aperture, collision and visual door leaf
import * as THREE from 'three';
import { CollisionFactory } from './CollisionFactory.js';

export class Doorway {
  /**
   * Builds an architectural doorway opening in a wall.
   * @param {Object} options
   * @param {THREE.Scene} options.scene
   * @param {Array<THREE.Box3>} options.colliders
   * @param {number} options.x Center X of doorway
   * @param {number} options.y Floor Y
   * @param {number} options.z Center Z of doorway
   * @param {number} options.width Clear opening width (e.g. 1.2m)
   * @param {number} options.height Clear opening height (e.g. 2.4m)
   * @param {number} options.wallHeight Total ceiling/wall height (e.g. 3.2m)
   * @param {number} options.wallThickness Wall thickness (e.g. 0.4m)
   * @param {boolean} options.isAlongX True if wall runs along X (doorway in Z-facing wall), false if wall runs along Z
   * @param {boolean} options.isOpen True if door leaf is propped open
   * @param {string} options.doorLabel Label for the room/door
   * @param {THREE.Material} options.frameMaterial
   * @param {THREE.Material} options.doorMaterial
   */
  static build(options) {
    const {
      scene,
      colliders,
      x,
      y = 0,
      z,
      width = 1.2,
      height = 2.4,
      wallHeight = 3.2,
      wallThickness = 0.35,
      isAlongX = true,
      isOpen = true,
      frameMaterial,
      doorMaterial
    } = options;

    const group = new THREE.Group();
    group.name = `Doorway_${x}_${z}`;

    const defaultFrameMat = frameMaterial || new THREE.MeshStandardMaterial({
      color: 0x75583f,
      roughness: 0.65
    });

    const defaultDoorMat = doorMaterial || new THREE.MeshStandardMaterial({
      color: 0x82644b,
      roughness: 0.6
    });

    // 1. Lintel overhead (occupies from height to wallHeight)
    const lintelHeight = wallHeight - height;
    const lintelCenterY = height + lintelHeight / 2;
    const lintelW = isAlongX ? width : wallThickness;
    const lintelD = isAlongX ? wallThickness : width;

    const lintelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(lintelW, lintelHeight, lintelD),
      defaultFrameMat
    );
    lintelMesh.position.set(x, lintelCenterY, z);
    lintelMesh.castShadow = true;
    lintelMesh.receiveShadow = true;
    group.add(lintelMesh);

    // Lintel collider starts at 'height' (y = 2.4m) up to wallHeight (y = 3.2m), so player walks underneath!
    if (colliders) {
      CollisionFactory.addBox(colliders, x, lintelCenterY, z, lintelW, lintelHeight, lintelD);
    }

    // 2. Door frame casing (jambs + top header)
    const jambThickness = 0.05;
    const jambDepth = wallThickness + 0.02;

    if (isAlongX) {
      // Left jamb
      const leftJamb = new THREE.Mesh(
        new THREE.BoxGeometry(jambThickness, height, jambDepth),
        defaultFrameMat
      );
      leftJamb.position.set(x - width / 2 + jambThickness / 2, height / 2, z);
      group.add(leftJamb);

      // Right jamb
      const rightJamb = new THREE.Mesh(
        new THREE.BoxGeometry(jambThickness, height, jambDepth),
        defaultFrameMat
      );
      rightJamb.position.set(x + width / 2 - jambThickness / 2, height / 2, z);
      group.add(rightJamb);

      // Header jamb
      const topJamb = new THREE.Mesh(
        new THREE.BoxGeometry(width, jambThickness, jambDepth),
        defaultFrameMat
      );
      topJamb.position.set(x, height - jambThickness / 2, z);
      group.add(topJamb);
    } else {
      // Wall runs along Z
      const leftJamb = new THREE.Mesh(
        new THREE.BoxGeometry(jambDepth, height, jambThickness),
        defaultFrameMat
      );
      leftJamb.position.set(x, height / 2, z - width / 2 + jambThickness / 2);
      group.add(leftJamb);

      const rightJamb = new THREE.Mesh(
        new THREE.BoxGeometry(jambDepth, height, jambThickness),
        defaultFrameMat
      );
      rightJamb.position.set(x, height / 2, z + width / 2 - jambThickness / 2);
      group.add(rightJamb);

      const topJamb = new THREE.Mesh(
        new THREE.BoxGeometry(jambDepth, jambThickness, width),
        defaultFrameMat
      );
      topJamb.position.set(x, height - jambThickness / 2, z);
      group.add(topJamb);
    }

    // 3. Door leaf
    const leafThickness = 0.05;
    const leafWidth = width - 0.08;
    const leafHeight = height - 0.05;

    if (isOpen) {
      // Propped open against interior wall
      if (isAlongX) {
        const doorLeaf = new THREE.Mesh(
          new THREE.BoxGeometry(leafThickness, leafHeight, leafWidth),
          defaultDoorMat
        );
        doorLeaf.position.set(x - width / 2 + 0.12, leafHeight / 2, z + leafWidth / 2);
        group.add(doorLeaf);
      } else {
        const doorLeaf = new THREE.Mesh(
          new THREE.BoxGeometry(leafWidth, leafHeight, leafThickness),
          defaultDoorMat
        );
        doorLeaf.position.set(x + leafWidth / 2, leafHeight / 2, z - width / 2 + 0.12);
        group.add(doorLeaf);
      }
    } else {
      // Closed door leaf (with door collider)
      const leafW = isAlongX ? leafWidth : leafThickness;
      const leafD = isAlongX ? leafThickness : leafWidth;
      const doorLeaf = new THREE.Mesh(
        new THREE.BoxGeometry(leafW, leafHeight, leafD),
        defaultDoorMat
      );
      doorLeaf.position.set(x, leafHeight / 2, z);
      group.add(doorLeaf);

      if (colliders) {
        CollisionFactory.addBox(colliders, x, leafHeight / 2, z, leafW, leafHeight, leafD);
      }
    }

    scene.add(group);
    return group;
  }
}
