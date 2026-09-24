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

function removeLegacyOppositeGlass(level) {
  const toRemove = [];

  level.scene.children.forEach((obj) => {
    if (!obj?.isMesh || obj.geometry?.type !== 'PlaneGeometry') return;
    const params = obj.geometry.parameters || {};

    const isLegacyGlass =
      near(obj.position.z, -2.35) &&
      near(obj.position.y, 1.8) &&
      Math.abs((params.width || 0) - 19) < 0.2 &&
      Math.abs((params.height || 0) - 1.8) < 0.2;

    if (isLegacyGlass) toRemove.push(obj);
  });

  toRemove.forEach((obj) => level.scene.remove(obj));
  return toRemove.length;
}

function removeLegacyOppositeWallMeshes(level) {
  const toRemove = [];

  level.scene.children.forEach((obj) => {
    if (!obj?.isMesh || obj.geometry?.type !== 'BoxGeometry') return;
    const params = obj.geometry.parameters || {};
    if (!near(obj.position.z, -2.5)) return;

    const width = params.width || 0;
    const height = params.height || 0;
    const depth = params.depth || 0;

    const legacyLowerOrUpper =
      Math.abs(width - 20.0) < 0.2 &&
      Math.abs(depth - 0.4) < 0.12 &&
      (Math.abs(height - 1.0) < 0.12 || Math.abs(height - 0.4) < 0.12);

    const legacyMullion =
      Math.abs(width - 0.3) < 0.08 &&
      Math.abs(height - 2.0) < 0.15 &&
      Math.abs(depth - 0.4) < 0.12;

    if (legacyLowerOrUpper || legacyMullion) toRemove.push(obj);
  });

  toRemove.forEach((obj) => level.scene.remove(obj));
  return toRemove.length;
}

function removeLegacyCorridorDutyNotice(level) {
  const toRemove = [];

  level.scene.children.forEach((obj) => {
    if (!obj?.isMesh || obj.geometry?.type !== 'PlaneGeometry') return;
    const params = obj.geometry.parameters || {};

    const isLegacyDutyNotice =
      near(obj.position.x, 15.77) &&
      near(obj.position.y, 1.75) &&
      near(obj.position.z, 0.0) &&
      Math.abs((params.width || 0) - 2.25) < 0.2 &&
      Math.abs((params.height || 0) - 1.4) < 0.2;

    if (isLegacyDutyNotice) toRemove.push(obj);
  });

  toRemove.forEach((obj) => level.scene.remove(obj));
  return toRemove.length;
}

function buildModeledOppositeWall(level) {
  const group = new THREE.Group();
  group.name = 'MODELING_3F_OPPOSITE_WALL_V3_SEALED';

  // MODELING-FIRST shell: one continuous full-height volume from floor to ceiling.
  // No transparent exterior, no open backface, and no corner gap is permitted.
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xd8d6cf,
    roughness: 0.92,
    metalness: 0.0
  });

  const wallBacking = new THREE.Mesh(
    new THREE.BoxGeometry(20.4, 3.2, 0.24),
    wallMat
  );
  wallBacking.position.set(6.0, 1.6, -2.42);
  wallBacking.receiveShadow = true;
  wallBacking.castShadow = true;
  group.add(wallBacking);

  // Seal the floor and ceiling junctions so the shell reads as one continuous wall.
  const floorSeal = new THREE.Mesh(new THREE.BoxGeometry(20.4, 0.12, 0.34), wallMat);
  floorSeal.position.set(6.0, 0.06, -2.35);
  group.add(floorSeal);

  const ceilingSeal = new THREE.Mesh(new THREE.BoxGeometry(20.4, 0.12, 0.34), wallMat);
  ceilingSeal.position.set(6.0, 3.14, -2.35);
  group.add(ceilingSeal);

  // Return walls close the west/east corner joins to the adjacent architecture.
  const westReturn = new THREE.Mesh(new THREE.BoxGeometry(0.30, 3.2, 0.86), wallMat);
  westReturn.position.set(-4.08, 1.6, -2.08);
  group.add(westReturn);

  const eastReturn = new THREE.Mesh(new THREE.BoxGeometry(0.30, 3.2, 0.86), wallMat);
  eastReturn.position.set(16.08, 1.6, -2.08);
  group.add(eastReturn);

  // Six window placeholders sit ON the sealed wall during topology lock.
  // They are intentionally opaque until the later art pass creates real glass/exterior views.
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x6f7777,
    roughness: 0.72,
    metalness: 0.12
  });
  const paneMat = new THREE.MeshStandardMaterial({
    color: 0xb9c6ca,
    roughness: 0.42,
    metalness: 0.04
  });

  const centers = [-2.35, 0.95, 4.25, 7.55, 10.85, 14.15];
  centers.forEach((x) => {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.72, 1.58, 0.055),
      frameMat
    );
    frame.position.set(x, 1.83, -2.275);
    group.add(frame);

    const pane = new THREE.Mesh(
      new THREE.BoxGeometry(2.50, 1.36, 0.035),
      paneMat
    );
    pane.position.set(x, 1.83, -2.235);
    group.add(pane);
  });

  level.scene.add(group);
  return group;
}

function buildDutyNoticeInside316(level) {
  const group = new THREE.Group();
  group.name = 'MODELING_316_DUTY_RULES_BOARD';

  const mount = new THREE.Mesh(
    new THREE.BoxGeometry(2.72, 1.48, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xc9c4b8, roughness: 0.88 })
  );
  mount.position.set(3.35, 1.78, 8.27);
  group.add(mount);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 560;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f1efe8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#8b918c';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  ctx.fillStyle = '#355342';
  ctx.font = 'bold 58px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('醫師值班提醒', canvas.width / 2, 88);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#425047';
  ctx.font = '34px sans-serif';
  const lines = [
    '• 17:00 交接完成後再上樓',
    '• 夜間門禁請隨身攜帶鑰匙與感應卡',
    '• 病況變化先聯絡護理站並完成紀錄',
    '• 離開辦公室前確認值班本與交班系統'
  ];
  lines.forEach((line, i) => ctx.fillText(line, 82, 190 + i * 82));

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(2.64, 1.40),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
  );
  face.position.set(3.35, 1.78, 8.235);
  face.rotation.y = Math.PI;
  group.add(face);

  level.scene.add(group);
  return group;
}

/**
 * Runtime structural correction for Act 1 during MODELING_FIRST.
 *
 * Guarantees:
 * 1) the 316 doorway remains traversable;
 * 2) the wall opposite 316 is visually closed and physically solid;
 * 3) the opposite wall joins floor/ceiling/end returns without exterior gaps;
 * 4) the duty-rules board lives inside room 316.
 */
export function applyAct1CollisionHotfix(level) {
  const before = level.colliders.length;

  level.colliders = level.colliders.filter((box) => !isLegacy316LintelCollider(box));

  // One continuous collision shell for the rebuilt opposite wall.
  const southWindowBarrier = new THREE.Box3(
    new THREE.Vector3(-4.23, 0.0, -2.72),
    new THREE.Vector3(16.23, 3.2, -2.00)
  );
  level.colliders.push(southWindowBarrier);

  const removedLegacyGlass = removeLegacyOppositeGlass(level);
  const removedLegacyWallMeshes = removeLegacyOppositeWallMeshes(level);
  const removedLegacyDutyNotice = removeLegacyCorridorDutyNotice(level);
  buildModeledOppositeWall(level);
  buildDutyNoticeInside316(level);

  // The 316 leaf is intentionally locked/closed at scene start. Its own
  // collider must not be mistaken for an architectural doorway obstruction.
  const doorwayBlocked = level.colliders.some((box) =>
    box !== level.officeDoorCollider &&
    intersectsAtPlayerHeight(box, 2.4, 2.48, 0.30)
  );
  const oppositeWallSolid = level.colliders.some((box) =>
    intersectsAtPlayerHeight(box, 2.4, -2.42, 0.30)
  );
  const westCornerSolid = level.colliders.some((box) =>
    intersectsAtPlayerHeight(box, -3.92, -2.22, 0.18)
  );
  const eastCornerSolid = level.colliders.some((box) =>
    intersectsAtPlayerHeight(box, 15.92, -2.22, 0.18)
  );

  if (doorwayBlocked) {
    console.error('[ModelingHotfix] 316 doorway is still blocked. Review corridor colliders.');
  }
  if (!oppositeWallSolid || !westCornerSolid || !eastCornerSolid) {
    console.error('[ModelingHotfix] Opposite wall shell is not completely sealed.');
  }

  console.info('[ModelingHotfix] Applied', {
    removedLegacyColliders: before - (level.colliders.length - 1),
    removedLegacyGlass,
    removedLegacyWallMeshes,
    removedLegacyDutyNotice,
    doorwayPassable: !doorwayBlocked,
    oppositeWallSolid,
    westCornerSolid,
    eastCornerSolid,
    dutyNoticeInside316: true,
    modelingFirst: true
  });

  return {
    doorwayPassable: !doorwayBlocked,
    oppositeWallSolid,
    westCornerSolid,
    eastCornerSolid,
    dutyNoticeInside316: true,
    modelingFirst: true
  };
}
