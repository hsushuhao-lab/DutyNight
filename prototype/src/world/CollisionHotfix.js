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
  group.name = 'MODELING_3F_OPPOSITE_WALL_V2';

  // Modeling-phase backing wall: deliberately neutral and opaque so there are
  // no open backfaces, black voids, or transparency artifacts. Final glass,
  // exterior view, materials, and lighting will come only after topology is frozen.
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xd8d6cf,
    roughness: 0.92,
    metalness: 0.0
  });
  const wallBacking = new THREE.Mesh(
    new THREE.BoxGeometry(20.0, 1.88, 0.08),
    wallMat
  );
  wallBacking.position.set(6.0, 1.82, -2.27);
  wallBacking.receiveShadow = true;
  group.add(wallBacking);

  // Six clearly modeled window modules. For now the panes are opaque neutral
  // blue-grey placeholders: this is intentional during modeling-first phase.
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
    frame.position.set(x, 1.83, -2.205);
    group.add(frame);

    const pane = new THREE.Mesh(
      new THREE.BoxGeometry(2.50, 1.36, 0.04),
      paneMat
    );
    pane.position.set(x, 1.83, -2.17);
    group.add(pane);
  });

  // End caps remove the black/open-looking vertical seams at both ends.
  const westCap = new THREE.Mesh(new THREE.BoxGeometry(0.34, 2.05, 0.10), wallMat);
  westCap.position.set(-3.82, 1.74, -2.24);
  group.add(westCap);

  const eastCap = new THREE.Mesh(new THREE.BoxGeometry(0.34, 2.05, 0.10), wallMat);
  eastCap.position.set(15.82, 1.74, -2.24);
  group.add(eastCap);

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
  // Back wall interior surface is at z ~= 8.30; place the board just inside it.
  face.position.set(3.35, 1.78, 8.235);
  face.rotation.y = Math.PI;
  group.add(face);

  level.scene.add(group);
  return group;
}

/**
 * Runtime structural correction for Act 1.
 *
 * During MODELING_FIRST, this function owns two known topology regressions:
 * 1) the 316 doorway must remain traversable;
 * 2) the wall opposite 316 must be visually closed and physically solid.
 *
 * It also relocates the duty-rules board from the public corridor end into
 * room 316, where it belongs spatially and narratively.
 */
export function applyAct1CollisionHotfix(level) {
  const before = level.colliders.length;

  // buildWall() historically generated floor-origin colliders even for the
  // overhead 316 lintel. Remove only that legacy invisible blocker.
  level.colliders = level.colliders.filter((box) => !isLegacy316LintelCollider(box));

  // Rebuild the opposite wall as a single continuous physical boundary.
  const southWindowBarrier = new THREE.Box3(
    new THREE.Vector3(-4.0, 0.0, -2.68),
    new THREE.Vector3(16.0, 3.2, -2.12)
  );
  level.colliders.push(southWindowBarrier);

  // Replace unstable transparent/backface geometry with explicit modeling.
  const removedLegacyGlass = removeLegacyOppositeGlass(level);
  const removedLegacyDutyNotice = removeLegacyCorridorDutyNotice(level);
  buildModeledOppositeWall(level);
  buildDutyNoticeInside316(level);

  // Development-time topology assertions. These do not block gameplay.
  const doorwayBlocked = level.colliders.some((box) =>
    intersectsAtPlayerHeight(box, 2.4, 2.48, 0.30)
  );
  const oppositeWallSolid = level.colliders.some((box) =>
    intersectsAtPlayerHeight(box, 2.4, -2.42, 0.30)
  );

  if (doorwayBlocked) {
    console.error('[ModelingHotfix] 316 doorway is still blocked. Review corridor colliders.');
  }
  if (!oppositeWallSolid) {
    console.error('[ModelingHotfix] Opposite wall is not solid.');
  }

  console.info('[ModelingHotfix] Applied', {
    removedLegacyColliders: before - (level.colliders.length - 1),
    removedLegacyGlass,
    removedLegacyDutyNotice,
    doorwayPassable: !doorwayBlocked,
    oppositeWallSolid,
    modelingFirst: true
  });

  return {
    doorwayPassable: !doorwayBlocked,
    oppositeWallSolid,
    dutyNoticeInside316: true,
    modelingFirst: true
  };
}
