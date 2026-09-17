import * as THREE from 'three';

const EPS = 0.03;
const near = (a, b) => Math.abs(a - b) <= EPS;

function isLegacy316LintelCollider(box) {
  return (
    near(box.min.x, 1.8) &&
    near(box.max.x, 3.0) &&
    near(box.min.z, 2.3) &&
    near(box.max.z, 2.7) &&
    near(box.min.y, 0.0) &&
    near(box.max.y, 0.8)
  );
}

function intersectsAtPlayerHeight(box, x, z, radius = 0.35) {
  const playerBox = new THREE.Box3(
    new THREE.Vector3(x - radius, 0.15, z - radius),
    new THREE.Vector3(x + radius, 1.95, z + radius)
  );
  return playerBox.intersectsBox(box);
}

/**
 * Runtime collision correction for Act 1.
 *
 * The original buildWall() collider helper treated every wall as if its
 * vertical origin started at y=0. That was harmless for full-height walls,
 * but it turned the overhead lintel above the 316 doorway into an invisible
 * floor-level blocker. This hotfix removes only that bad collider and adds a
 * continuous safety barrier to the glazed wall opposite room 316.
 *
 * It intentionally does not alter visible geometry or player controls.
 */
export function applyAct1CollisionHotfix(level) {
  const before = level.colliders.length;

  level.colliders = level.colliders.filter((box) => !isLegacy316LintelCollider(box));

  // Continuous collision for the south glazed wall opposite 316.
  // This prevents the player from walking through the window/glass plane,
  // regardless of the decorative sill/mullion meshes.
  const southWindowBarrier = new THREE.Box3(
    new THREE.Vector3(-4.0, 0.0, -2.68),
    new THREE.Vector3(16.0, 3.2, -2.20)
  );
  level.colliders.push(southWindowBarrier);

  // Development-time topology assertions. These do not block gameplay.
  const doorwayBlocked = level.colliders.some((box) => intersectsAtPlayerHeight(box, 2.4, 2.48, 0.30));
  const oppositeWallSolid = level.colliders.some((box) => intersectsAtPlayerHeight(box, 2.4, -2.42, 0.30));

  if (doorwayBlocked) {
    console.error('[CollisionHotfix] 316 doorway is still blocked. Review corridor colliders.');
  }
  if (!oppositeWallSolid) {
    console.error('[CollisionHotfix] South wall/glazing is not solid.');
  }

  console.info('[CollisionHotfix] Applied', {
    removedLegacyColliders: before - (level.colliders.length - 1),
    doorwayPassable: !doorwayBlocked,
    oppositeWallSolid
  });

  return {
    doorwayPassable: !doorwayBlocked,
    oppositeWallSolid
  };
}
