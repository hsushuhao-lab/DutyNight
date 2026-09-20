import * as THREE from 'three';
import { solid } from '../../art/ArtDetails.js';
import { SignAnchor } from './SignAnchor.js';
import { LIFT_PANELS, STAIR_DOORS } from './WorldRoutes.js';

export function addTravelFixtures(zone, zoneId) {
  const m = zone.gf.materials;

  // 1. Unified 3F-style elevator call button panel (mounted firmly on adjacent side wall, NOT on doors)
  function buildElevatorPanel(position, yaw) {
    const root = new THREE.Group();
    root.position.set(...position);
    root.rotation.y = yaw;
    zone.zoneGroup.add(root);

    // Call panel mounting box on wall
    solid(root, m.metal, [0, 0, -0.04], [0.18, 0.38, 0.08]);

    // Amber glowing call button
    const btnGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16);
    btnGeo.rotateX(Math.PI / 2);
    const btnMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const button = new THREE.Mesh(btnGeo, btnMat);
    button.position.set(0, 0, 0.02);
    root.add(button);

    button.userData = {
      interactable: true,
      id: `${zoneId}_elevator`,
      type: 'elevator',
      kind: 'elevator',
      campus: zoneId.startsWith('first') ? 'first' : 'second',
      label: '搭乘電梯前往其他樓層'
    };
    zone.interactables.push(button);

    // Sign plaque above button
    SignAnchor.buildWallPlaque({
      scene: root,
      x: 0,
      y: 0.32,
      z: 0.01,
      width: 0.45,
      height: 0.18,
      code: 'LIFT',
      title: '電梯選層',
      subtitle: 'ELEVATOR',
      header: ''
    });
  }

  // 2. Unified heavy fire exit "Stair Door" (interactable door with push bar, no physical stairs)
  function buildStairDoor(position, yaw, label) {
    const root = new THREE.Group();
    root.position.set(...position);
    root.rotation.y = yaw;
    zone.zoneGroup.add(root);

    // Outer door frame
    solid(root, m.metal, [0, 1.25, 0], [1.3, 2.5, 0.22]);

    // Heavy fire exit door leaf
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5a4634, roughness: 0.6, metalness: 0.3 });
    const doorLeaf = solid(root, doorMat, [0, 1.2, 0.02], [1.16, 2.36, 0.08]);

    // Horizontal panic push bar
    solid(root, m.stainless, [0, 1.0, 0.08], [0.95, 0.06, 0.06]);
    solid(root, m.metal, [-0.42, 1.0, 0.06], [0.06, 0.08, 0.06]);
    solid(root, m.metal, [0.42, 1.0, 0.06], [0.06, 0.08, 0.06]);

    // Illuminated Exit / Stairs Sign over door
    const signBox = solid(root, new THREE.MeshBasicMaterial({ color: 0x1f7a4d }), [0, 2.55, 0.12], [0.75, 0.24, 0.08]);
    SignAnchor.buildWallPlaque({
      scene: root,
      x: 0,
      y: 2.55,
      z: 0.17,
      width: 0.72,
      height: 0.22,
      code: 'EXIT',
      title: '安全梯',
      subtitle: 'EMERGENCY STAIRS',
      header: ''
    });

    doorLeaf.userData = {
      interactable: true,
      id: `${zoneId}_stairs`,
      type: 'travel_selector',
      kind: 'stairs',
      campus: zoneId.startsWith('first') ? 'first' : 'second',
      label: label || '推開安全梯門前往其他樓層'
    };
    zone.interactables.push(doorLeaf);

    // Indoor stairs are intentionally not modeled as walkable stairs. The fire door
    // is a real collision boundary; interacting with it opens the floor selector.
    root.updateMatrixWorld(true);
    const stairDoorCollider = new THREE.Box3().setFromObject(doorLeaf).expandByScalar(0.015);
    zone.colliders.push(stairDoorCollider);
    doorLeaf.userData.stairDoorCollider = stairDoorCollider;
  }

  // Mount elevator call panels on walls
  if (LIFT_PANELS[zoneId]) {
    const p = LIFT_PANELS[zoneId];
    buildElevatorPanel(p.position, p.yaw);
  }

  // Mount stair doors
  if (STAIR_DOORS[zoneId]) {
    const s = STAIR_DOORS[zoneId];
    buildStairDoor(s.position, s.yaw, s.label);
  }

  // Outdoor trail wayfinding signs
  if (zoneId === 'hillside_route') {
    for (const [x, z, label] of [[12, -35.5, '第一院區 2F 急診'], [72.8, -18.4, '第二院區 1F 入口']]) {
      solid(zone.zoneGroup, m.metal, [x, 0.35, z], [0.07, 1.7, 0.07]);
      SignAnchor.buildWallPlaque({
        scene: zone.zoneGroup,
        x,
        y: 0.9,
        z: z - 0.055,
        rotationY: Math.PI,
        width: 1.05,
        height: 0.36,
        code: 'PATH',
        title: label,
        subtitle: '',
        header: '院區步道'
      });
    }
  }
}
