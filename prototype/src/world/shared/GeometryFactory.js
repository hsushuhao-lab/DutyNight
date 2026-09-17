// GeometryFactory.js - Standardized architectural primitives for modeling-first zones
import * as THREE from 'three';

export class GeometryFactory {
  constructor() {
    this.materials = this.createMaterials();
  }

  createMaterials() {
    return {
      wall: new THREE.MeshStandardMaterial({
        color: 0xd9d6cf,
        roughness: 0.88,
        metalness: 0.05
      }),
      wallDark: new THREE.MeshStandardMaterial({
        color: 0x6e7672,
        roughness: 0.85
      }),
      floor: new THREE.MeshStandardMaterial({
        color: 0xc8c3b9,
        roughness: 0.65,
        metalness: 0.1
      }),
      floorTile: new THREE.MeshStandardMaterial({
        color: 0xb9b5ab,
        roughness: 0.55,
        metalness: 0.12
      }),
      floorWood: new THREE.MeshStandardMaterial({
        color: 0x8a6c4f,
        roughness: 0.6
      }),
      ceiling: new THREE.MeshStandardMaterial({
        color: 0xe8e6e1,
        roughness: 0.95
      }),
      doorWood: new THREE.MeshStandardMaterial({
        color: 0x7c5d42,
        roughness: 0.65
      }),
      metal: new THREE.MeshStandardMaterial({
        color: 0x666b6e,
        metalness: 0.75,
        roughness: 0.35
      }),
      stainless: new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        metalness: 0.88,
        roughness: 0.2
      }),
      glass: new THREE.MeshStandardMaterial({
        color: 0xb5cad4,
        transparent: true,
        opacity: 0.38,
        roughness: 0.15,
        metalness: 0.1
      }),
      glassOpaquePlaceholder: new THREE.MeshStandardMaterial({
        color: 0x76878f,
        roughness: 0.4
      }),
      counterTop: new THREE.MeshStandardMaterial({
        color: 0x2e4a3c,
        roughness: 0.5
      }),
      bedSheet: new THREE.MeshStandardMaterial({
        color: 0xdee4e1,
        roughness: 0.85
      }),
      bedFrame: new THREE.MeshStandardMaterial({
        color: 0x4a5550,
        roughness: 0.6,
        metalness: 0.4
      }),
      terrainGrass: new THREE.MeshStandardMaterial({
        color: 0x41523c,
        roughness: 0.92
      }),
      pathGravel: new THREE.MeshStandardMaterial({
        color: 0x827d73,
        roughness: 0.9
      }),
      waterPlaceholder: new THREE.MeshStandardMaterial({
        color: 0x1d333b,
        roughness: 0.25,
        metalness: 0.4
      }),
      handrail: new THREE.MeshStandardMaterial({
        color: 0x8f7256,
        roughness: 0.58
      })
    };
  }

  buildFloor(scene, walkables, x, y, z, width, depth, material = this.materials.floor) {
    const geo = new THREE.PlaneGeometry(width, depth);
    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    if (walkables) walkables.push(mesh);
    return mesh;
  }

  buildCeiling(scene, x, y, z, width, depth, material = this.materials.ceiling) {
    const geo = new THREE.PlaneGeometry(width, depth);
    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  buildWall(scene, colliders, x, y, z, width, height, depth, material = this.materials.wall) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    if (colliders) {
      const box = new THREE.Box3();
      box.setFromCenterAndSize(
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(width, height, depth)
      );
      colliders.push(box);
    }
    return mesh;
  }

  buildHandrail(scene, colliders, x, y, z, length, isAlongZ = false) {
    const w = isAlongZ ? 0.08 : length;
    const d = isAlongZ ? length : 0.08;
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.08, d),
      this.materials.handrail
    );
    rail.position.set(x, y, z);
    rail.castShadow = true;
    scene.add(rail);
    return rail;
  }

  buildCeilingLight(scene, x, y, z, intensity = 0.75, distance = 7.0, color = 0xfff6ea) {
    const fixture = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.06, 0.35),
      this.materials.metal
    );
    fixture.position.set(x, y, z);
    scene.add(fixture);

    const emitter = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.02, 0.22),
      new THREE.MeshBasicMaterial({ color: 0xfffaed })
    );
    emitter.position.set(x, y - 0.035, z);
    scene.add(emitter);

    const light = new THREE.PointLight(color, intensity, distance);
    light.position.set(x, y - 0.2, z);
    scene.add(light);
    return { fixture, emitter, light };
  }
}
