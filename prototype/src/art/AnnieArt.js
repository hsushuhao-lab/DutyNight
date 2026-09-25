import * as THREE from 'three';

export const ANNIE_STATES = Object.freeze({
  STORAGE_STATIC: 'STORAGE_STATIC',
  BRIDGE_MANIFEST: 'BRIDGE_MANIFEST',
  FLOOR6_CPR: 'FLOOR6_CPR'
});

const CPR_PERIOD = 60 / 110;
const sphereGeometry = new THREE.SphereGeometry(1, 32, 24);
const vinylMaterial = new THREE.MeshPhysicalMaterial({
  name: 'Annie_Mat_Vinyl', color: 0xd1cbb9, roughness: 0.48, metalness: 0,
  clearcoat: 0.08, clearcoatRoughness: 0.58
});
const vinylSeamMaterial = new THREE.MeshStandardMaterial({color: 0x9d998b, roughness: 0.72});
const cloudyEyeMaterial = new THREE.MeshStandardMaterial({color: 0xc5c8bf, roughness: 0.38});
const irisMaterial = new THREE.MeshStandardMaterial({color: 0x777e79, roughness: 0.54});
const pupilMaterial = new THREE.MeshStandardMaterial({color: 0x303533, roughness: 0.56});
const airwayMaterial = new THREE.MeshStandardMaterial({color: 0x383a35, roughness: 0.82});
const hairMaterial = new THREE.MeshStandardMaterial({color: 0x34302b, roughness: 0.88});
const coatMaterial = new THREE.MeshStandardMaterial({
  name: 'Annie_Mat_Coat', color: 0xd7d1b7, roughness: 0.88, metalness: 0
});
const coatEdgeMaterial = new THREE.MeshStandardMaterial({color: 0xe3ddc8, roughness: 0.86});
const scrubMaterial = new THREE.MeshStandardMaterial({
  name: 'Annie_Mat_Scrubs', color: 0x727f76, roughness: 0.93, metalness: 0
});
const rubberMaterial = new THREE.MeshStandardMaterial({
  name: 'Annie_Mat_Stethoscope_Rubber', color: 0x46443b, roughness: 0.74
});
const metalMaterial = new THREE.MeshStandardMaterial({
  name: 'Annie_Mat_Stethoscope_Metal', color: 0x8f8469, roughness: 0.48, metalness: 0.68
});
const shoeMaterial = new THREE.MeshStandardMaterial({color: 0x514b40, roughness: 0.83});

function ellipsoid(parent, name, position, scale, material) {
  const mesh = new THREE.Mesh(sphereGeometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  parent.add(mesh);
  return mesh;
}

function capsuleBetween(parent, name, start, end, radius, material) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const axis = to.clone().sub(from);
  const length = axis.length();
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, Math.max(0.001, length - radius * 2), 6, 24), material
  );
  mesh.name = name;
  mesh.position.copy(from.add(to).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize());
  parent.add(mesh);
  return mesh;
}

function tube(parent, name, points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, radius, 10, false), material);
  mesh.name = name;
  parent.add(mesh);
  return mesh;
}

function ring(parent, name, position, radius, material) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.003, 7, 32), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.x = Math.PI / 2;
  parent.add(mesh);
  return mesh;
}

function makeInscriptionTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 384;
  const context = canvas.getContext('2d');
  context.fillStyle = '#4e4c43';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#c3b58e';
  context.lineWidth = 12;
  context.strokeRect(10, 10, 748, 364);
  context.fillStyle = '#e0d3ab';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = 'bold 108px sans-serif';
  context.fillText('祝 守恆 醫師', 384, 126);
  context.font = 'bold 88px sans-serif';
  context.fillText('1997 執業誌慶', 384, 270);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildHead(upperBody, localHeadY) {
  const head = new THREE.Group();
  head.name = 'Annie_Head';
  head.position.set(0, localHeadY, 0.012);
  upperBody.add(head);

  const face = ellipsoid(head, 'Annie_SmoothVinylFace', [0, 0, 0], [0.082, 0.116, 0.078], vinylMaterial);
  face.userData.materialIntent = 'smooth gray-ivory CPR-trainer vinyl';
  ring(head, 'Annie_FaceMoldSeam', [0, -0.055, 0], 0.074, vinylSeamMaterial);

  for (const side of [-1, 1]) {
    const eyeX = side * 0.029;
    ellipsoid(head, `Annie_FixedEye_${side}`, [eyeX, 0.018, 0.071], [0.021, 0.013, 0.008], cloudyEyeMaterial);
    ellipsoid(head, `Annie_UnfocusedIris_${side}`, [eyeX, 0.017, 0.078], [0.007, 0.008, 0.003], irisMaterial);
    ellipsoid(head, `Annie_FixedPupil_${side}`, [eyeX, 0.017, 0.080], [0.0032, 0.004, 0.0015], pupilMaterial);
  }

  ellipsoid(head, 'Annie_MoldedNose', [0, -0.018, 0.079], [0.012, 0.026, 0.012], vinylMaterial);
  ellipsoid(head, 'Annie_MouthAirway', [0, -0.077, 0.073], [0.021, 0.009, 0.004], airwayMaterial);
  const airwayRim = new THREE.Mesh(new THREE.TorusGeometry(0.019, 0.003, 7, 24), vinylMaterial);
  airwayRim.name = 'Annie_BlowTrainingMouthRim';
  airwayRim.scale.y = 0.52;
  airwayRim.position.set(0, -0.077, 0.075);
  head.add(airwayRim);

  ellipsoid(head, 'Annie_HairWigCap', [0, 0.083, -0.012], [0.09, 0.052, 0.081], hairMaterial);
  for (const side of [-1, 1]) {
    const lock = ellipsoid(head, `Annie_HairWigLock_${side}`, [side * 0.066, 0.005, -0.005], [0.024, 0.093, 0.047], hairMaterial);
    lock.rotation.z = side * -0.12;
  }
  tube(head, 'Annie_HairWigStrand_A', [[-0.055, 0.104, 0.035], [-0.018, 0.121, 0.055], [0.033, 0.106, 0.055]], 0.006, hairMaterial);
  tube(head, 'Annie_HairWigStrand_B', [[0.045, 0.088, 0.04], [0.075, 0.048, 0.02], [0.071, -0.022, 0]], 0.006, hairMaterial);
  return head;
}

function buildHand(parent, name, side, position) {
  const hand = new THREE.Group();
  hand.name = name;
  hand.position.set(...position);
  parent.add(hand);
  ellipsoid(hand, `${name}_Palm`, [0, 0, 0.036], [0.045, 0.022, 0.056], vinylMaterial);
  for (let finger = 0; finger < 4; finger++) {
    const x = (finger - 1.5) * 0.021;
    const length = 0.052 - Math.abs(finger - 1.5) * 0.006;
    capsuleBetween(hand, `${name}_Finger_${finger + 1}`, [x, 0, 0.065], [x, 0, 0.065 + length], 0.008, vinylMaterial);
    ellipsoid(hand, `${name}_FingerHinge_${finger + 1}`, [x, 0, 0.069], [0.009, 0.009, 0.009], vinylSeamMaterial);
  }
  capsuleBetween(hand, `${name}_Thumb`, [side * 0.036, 0, 0.023], [side * 0.057, 0, 0.066], 0.010, vinylMaterial);
  return hand;
}

function buildStethoscope(upperBody, shoulderLocalY) {
  const stethoscope = new THREE.Group();
  stethoscope.name = 'Annie_Stethoscope';
  stethoscope.userData.owner = '張守恆';
  stethoscope.userData.inscription = '祝 守恆 醫師 1997 執業誌慶';
  upperBody.add(stethoscope);
  tube(stethoscope, 'Annie_Stethoscope_OldRubberTube', [
    [-0.09, shoulderLocalY + 0.05, 0.105], [-0.145, shoulderLocalY - 0.10, 0.135],
    [-0.12, shoulderLocalY - 0.27, 0.164], [0, shoulderLocalY - 0.34, 0.176],
    [0.12, shoulderLocalY - 0.27, 0.164], [0.145, shoulderLocalY - 0.10, 0.135],
    [0.09, shoulderLocalY + 0.05, 0.105]
  ], 0.009, rubberMaterial);

  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.041, 0.018, 32), metalMaterial);
  bell.name = 'Annie_StethoscopeBell';
  bell.rotation.x = Math.PI / 2;
  bell.position.set(0, shoulderLocalY - 0.36, 0.187);
  stethoscope.add(bell);

  const plate = ellipsoid(stethoscope, 'Annie_StethoscopeEngravingPlate', [0, shoulderLocalY - 0.25, 0.196], [0.132, 0.081, 0.014], metalMaterial);
  plate.userData.inscription = stethoscope.userData.inscription;
  const inscription = new THREE.Mesh(
    new THREE.PlaneGeometry(0.245, 0.118),
    new THREE.MeshBasicMaterial({map: makeInscriptionTexture(), toneMapped: false})
  );
  inscription.name = 'Annie_StethoscopeInscription';
  inscription.position.set(0, shoulderLocalY - 0.25, 0.210);
  stethoscope.add(inscription);
}

function buildStool(parent, materials) {
  const stool = new THREE.Group();
  stool.name = 'Annie_Stool';
  const frameMaterial = materials?.metal || metalMaterial;
  const seatMaterial = materials?.wallDark || coatMaterial;
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.065, 32), seatMaterial);
  seat.position.y = 0.46;
  stool.add(seat);
  for (let index = 0; index < 3; index++) {
    const angle = index * Math.PI * 2 / 3;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.45, 16), frameMaterial);
    leg.position.set(Math.cos(angle) * 0.14, 0.225, Math.sin(angle) * 0.14);
    stool.add(leg);
    ellipsoid(stool, `Annie_StoolFoot_${index}`, [Math.cos(angle) * 0.14, 0.015, Math.sin(angle) * 0.14], [0.025, 0.015, 0.035], shoeMaterial);
  }
  parent.add(stool);
  return stool;
}

function buildContactShadows(parent, state) {
  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x171b19, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide
  });
  const positions = state === ANNIE_STATES.FLOOR6_CPR
    ? [[-0.16, 0.004, -0.26], [0.16, 0.004, -0.26], [-0.16, 0.004, -0.49], [0.16, 0.004, -0.49]]
    : state === ANNIE_STATES.STORAGE_STATIC
      ? [[-0.14, 0.004, 0.36], [0.14, 0.004, 0.36]]
      : [[-0.105, 0.004, 0.045], [0.105, 0.004, 0.045]];
  positions.forEach(([x, y, z], index) => {
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), shadowMaterial);
    shadow.name = `Annie_ContactShadow_${index}`;
    shadow.position.set(x, y, z);
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.set(1.3, 0.68, 1);
    parent.add(shadow);
  });
}

export function createAnnieArt(parent, {materials, state, position, rotationY = 0}) {
  const isStorage = state === ANNIE_STATES.STORAGE_STATIC;
  const isCpr = state === ANNIE_STATES.FLOOR6_CPR;
  const root = new THREE.Group();
  root.name = `Annie_${state}`;
  root.position.set(...position);
  root.rotation.y = rotationY;
  root.userData = {
    characterId: 'ANNIE_CPR_TRAINING_MANNEQUIN', state, pose: state,
    modelHeight: 1.65, materialIntent: 'gray-ivory synthetic mannequin vinyl',
    clothingOwner: '張守恆', aggressor: false,
    inscription: '祝 守恆 醫師 1997 執業誌慶'
  };
  parent.add(root);

  const hipY = isStorage ? 0.65 : isCpr ? 0.48 : 0.80;
  const shoulderY = isStorage ? 1.16 : isCpr ? 1.06 : 1.31;
  const headY = isStorage ? 1.39 : isCpr ? 1.22 : 1.50;
  const upperBody = new THREE.Group();
  upperBody.name = 'Annie_Rig_UpperBody';
  upperBody.position.y = hipY;
  root.add(upperBody);

  const torso = new THREE.Group();
  torso.name = 'Annie_Torso';
  const torsoHeight = shoulderY - hipY + 0.11;
  const coatPoints = [
    new THREE.Vector2(0, -0.40), new THREE.Vector2(0.145, -0.39), new THREE.Vector2(0.20, -0.34),
    new THREE.Vector2(0.22, -0.22), new THREE.Vector2(0.205, 0.04), new THREE.Vector2(0.24, 0.26),
    new THREE.Vector2(0.22, 0.34), new THREE.Vector2(0.14, 0.39), new THREE.Vector2(0, 0.40)
  ];
  const coat = new THREE.Mesh(new THREE.LatheGeometry(coatPoints, 40), coatMaterial);
  coat.name = 'Annie_WhiteCoat';
  coat.position.y = shoulderY - hipY - torsoHeight * 0.48;
  coat.scale.set(1, torsoHeight / 0.8, 0.72);
  torso.add(coat);

  const shirt = ellipsoid(torso, 'Annie_Scrubs', [0, shoulderY - hipY - 0.19, 0.154], [0.105, 0.205, 0.028], scrubMaterial);
  tube(torso, 'Annie_ScrubNeckline', [[-0.052, shoulderY - hipY + 0.02, 0.185], [0, shoulderY - hipY - 0.03, 0.191], [0.052, shoulderY - hipY + 0.02, 0.185]], 0.004, coatEdgeMaterial);
  for (const side of [-1, 1]) {
    const lapel = new THREE.Mesh(new THREE.CapsuleGeometry(0.037, 0.19, 6, 20), coatEdgeMaterial);
    lapel.name = `Annie_CoatLapel_${side}`;
    lapel.position.set(side * 0.071, shoulderY - hipY - 0.005, 0.174);
    lapel.rotation.z = side * 0.27;
    lapel.scale.z = 0.48;
    torso.add(lapel);
    ellipsoid(torso, `Annie_CoatPocket_${side}`, [side * 0.13, shoulderY - hipY - 0.22, 0.15], [0.055, 0.069, 0.014], coatEdgeMaterial);
  }
  for (const y of [shoulderY - hipY - 0.10, shoulderY - hipY - 0.19, shoulderY - hipY - 0.28]) {
    ellipsoid(torso, `Annie_CoatButton_${y}`, [0, y, 0.185], [0.009, 0.009, 0.006], metalMaterial);
  }
  upperBody.add(torso);

  const neckY = shoulderY - hipY + 0.005;
  const localHeadY = headY - hipY;
  capsuleBetween(upperBody, 'Annie_NeckConnector', [0, neckY - 0.035, 0], [0, localHeadY - 0.105, 0], 0.047, vinylMaterial);
  ring(upperBody, 'Annie_NeckMoldSeam', [0, localHeadY - 0.112, 0], 0.047, vinylSeamMaterial);
  const head = buildHead(upperBody, localHeadY);

  for (const side of [-1, 1]) {
    const shoulder = [side * 0.205, shoulderY - hipY - 0.055, 0.008];
    const elbow = isStorage
      ? [side * 0.245, shoulderY - hipY - 0.34, 0.19]
      : isCpr
        ? [side * 0.145, shoulderY - hipY - 0.17, 0.29]
        : [side * 0.125, shoulderY - hipY - 0.095, 0.31];
    const wrist = isStorage
      ? [side * 0.17, hipY * 0.16, 0.29]
      : isCpr
        ? [side * 0.014, shoulderY - hipY - 0.085, 0.82]
        : [side * 0.012, shoulderY - hipY - 0.15, 0.61];
    capsuleBetween(upperBody, `Annie_CoatSleeveUpper_${side}`, shoulder, elbow, 0.068, coatMaterial);
    ellipsoid(upperBody, `Annie_ElbowTeachingHinge_${side}`, elbow, [0.061, 0.061, 0.061], vinylSeamMaterial);
    capsuleBetween(upperBody, `Annie_CoatSleeveForearm_${side}`, elbow, wrist, 0.054, coatMaterial);
    ellipsoid(upperBody, `Annie_Cuff_${side}`, wrist, [0.057, 0.055, 0.055], coatEdgeMaterial);
    ring(upperBody, `Annie_WristMoldSeam_${side}`, wrist, 0.047, vinylSeamMaterial);
  }
  const hands = new THREE.Group();
  hands.name = 'Annie_OverlappedHands';
  hands.position.set(0, 0, 0);
  upperBody.add(hands);
  const handPosition = isStorage
    ? [0, hipY * 0.16, 0.30]
    : isCpr
      ? [0, shoulderY - hipY - 0.085, 0.82]
      : [0, shoulderY - hipY - 0.15, 0.61];
  buildHand(hands, 'Annie_HandStack_Bottom', -1, [handPosition[0] - 0.009, handPosition[1] - 0.008, handPosition[2]]);
  buildHand(hands, 'Annie_HandStack_Top', 1, [handPosition[0] + 0.009, handPosition[1] + 0.008, handPosition[2] - 0.012]);

  const knees = isStorage
    ? [[-0.13, 0.405, 0.17], [0.13, 0.405, 0.17]]
    : isCpr
      ? [[-0.145, 0.105, -0.24], [0.145, 0.105, -0.24]]
      : [[-0.12, 0.435, 0.005], [0.12, 0.435, 0.005]];
  for (let index = 0; index < 2; index++) {
    const side = index === 0 ? -1 : 1;
    const hip = [side * 0.115, hipY - 0.08, 0];
    const knee = knees[index];
    const ankle = isStorage
      ? [side * 0.13, 0.095, 0.32]
      : isCpr
        ? [side * 0.145, 0.105, -0.48]
        : [side * 0.12, 0.095, 0.035];
    capsuleBetween(root, `Annie_ScrubThigh_${side}`, hip, knee, 0.078, scrubMaterial);
    ellipsoid(root, `Annie_KneeTeachingHinge_${side}`, knee, [0.071, 0.069, 0.069], vinylSeamMaterial);
    capsuleBetween(root, `Annie_ScrubShin_${side}`, knee, ankle, 0.056, scrubMaterial);
    ellipsoid(root, `Annie_AnkleTeachingHinge_${side}`, ankle, [0.046, 0.047, 0.046], vinylSeamMaterial);
    const shoe = ellipsoid(root, `Annie_WorkShoe_${side}`, [ankle[0], ankle[1] - 0.035, ankle[2] + (isCpr ? -0.028 : 0.045)], [0.073, 0.047, 0.135], shoeMaterial);
    shoe.userData.contactSurface = 'grounded sole';
  }

  if (isStorage) buildStool(root, materials);
  buildStethoscope(upperBody, shoulderY - hipY + 0.01);

  const compressionPlate = ellipsoid(upperBody, 'Annie_CompressionPlate', [0, shoulderY - hipY - 0.19, 0.192], [0.079, 0.105, 0.012], vinylSeamMaterial);
  compressionPlate.userData.contactTarget = isCpr ? 'burned-bed patient silhouette' : 'training chest';
  const practical = new THREE.SpotLight(0xdde8e8, 1.55, 4.8, Math.PI / 5.2, 0.62, 1.4);
  practical.name = 'Annie_Local_CoolWhite_Practical';
  practical.position.set(0.12, isCpr ? 2.12 : 2.32, 0.68);
  practical.castShadow = true;
  practical.shadow.mapSize.set(512, 512);
  practical.shadow.bias = -0.00025;
  practical.target.position.set(0, isCpr ? 0.88 : 1.08, 0.06);
  practical.target.name = 'Annie_Local_Practical_Target';
  root.add(practical, practical.target);

  buildContactShadows(root, state);
  root.traverse(object => {
    if (object.isMesh) {
      object.castShadow = true;
      if (object.name !== 'Annie_StethoscopeInscription') object.receiveShadow = true;
    }
  });

  root.userData.rig = {
    upperBody, head, compressionPlate, compressionBaseY: compressionPlate.position.y,
    baseUpperBodyY: upperBody.position.y, baseLean: isCpr ? 0.11 : 0,
    elapsed: 0, compression: 0
  };
  if (isCpr) upperBody.rotation.x = 0.11;
  if (state === ANNIE_STATES.BRIDGE_MANIFEST) {
    const bridgeHands = root.getObjectByName('Annie_HandStack_Top');
    bridgeHands.userData.pose = 'hands-overlapped-at-chest-height';
  }
  return root;
}

export function updateAnnieArt(annie, delta) {
  const rig = annie.userData.rig;
  if (annie.userData.state === ANNIE_STATES.STORAGE_STATIC) return;
  rig.elapsed += delta;
  if (annie.userData.state === ANNIE_STATES.BRIDGE_MANIFEST) {
    rig.upperBody.rotation.z = Math.sin(rig.elapsed * 0.45) * 0.0045;
    rig.head.rotation.z = Math.sin(rig.elapsed * 0.45 - 0.15) * 0.006;
    return;
  }

  const phase = (rig.elapsed % CPR_PERIOD) / CPR_PERIOD;
  const press = Math.pow(Math.max(0, Math.sin(phase * Math.PI * 2)), 3);
  rig.compression = press;
  const travel = 0.035 * press;
  rig.upperBody.position.y = rig.baseUpperBodyY - travel;
  rig.upperBody.rotation.x = rig.baseLean + press * 0.018;
  rig.compressionPlate.position.y = rig.compressionBaseY - travel * 0.35;
}
