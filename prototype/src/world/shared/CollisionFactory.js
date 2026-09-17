// CollisionFactory.js - Collision validation, boundary checking and traversal verification
import * as THREE from 'three';

export class CollisionFactory {
  static addBox(colliders, cx, cy, cz, width, height, depth) {
    const box = new THREE.Box3();
    box.setFromCenterAndSize(
      new THREE.Vector3(cx, cy, cz),
      new THREE.Vector3(width, height, depth)
    );
    colliders.push(box);
    return box;
  }

  static addPerimeterBounds(colliders, minX, maxX, minZ, maxZ, height = 4.0, thickness = 0.5) {
    const midX = (minX + maxX) / 2;
    const midZ = (minZ + maxZ) / 2;
    const spanX = maxX - minX;
    const spanZ = maxZ - minZ;
    const midY = height / 2;

    // North wall
    this.addBox(colliders, midX, midY, maxZ + thickness / 2, spanX + thickness * 2, height, thickness);
    // South wall
    this.addBox(colliders, midX, midY, minZ - thickness / 2, spanX + thickness * 2, height, thickness);
    // East wall
    this.addBox(colliders, maxX + thickness / 2, midY, midZ, thickness, height, spanZ + thickness * 2);
    // West wall
    this.addBox(colliders, minX - thickness / 2, midY, midZ, thickness, height, spanZ + thickness * 2);
  }

  static testPoint(colliders, x, y, z, radius = 0.35) {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(x - radius, y - 1.5, z - radius),
      new THREE.Vector3(x + radius, y + 0.25, z + radius)
    );

    for (const box of colliders) {
      if (playerBox.intersectsBox(box)) {
        return { collided: true, collider: box };
      }
    }
    return { collided: false, collider: null };
  }

  static testTraversal(colliders, p1, p2, radius = 0.35, steps = 15) {
    const start = new THREE.Vector3(...p1);
    const end = new THREE.Vector3(...p2);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const current = new THREE.Vector3().lerpVectors(start, end, t);
      const res = this.testPoint(colliders, current.x, current.y, current.z, radius);
      if (res.collided) {
        return {
          passable: false,
          blockedAt: current,
          stepIndex: i,
          collider: res.collider
        };
      }
    }
    return { passable: true };
  }
}
