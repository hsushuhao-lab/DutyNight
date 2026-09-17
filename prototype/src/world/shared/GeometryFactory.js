// GeometryFactory.js - Standardized architectural primitives for modeling-first zones
import * as THREE from 'three';

export class GeometryFactory {
  constructor() {
    this.textures = this.createTextures();
    this.materials = this.createMaterials();
  }

  createTextures() {
    if (typeof document === 'undefined') return {};

    // 1. Hospital resilient vinyl floor (subtle beige speckle, soft seams)
    const vinylCanvas = document.createElement('canvas');
    vinylCanvas.width = 256;
    vinylCanvas.height = 256;
    const vctx = vinylCanvas.getContext('2d');
    vctx.fillStyle = '#dfd9cf';
    vctx.fillRect(0, 0, 256, 256);
    // Subtle grout seams
    vctx.strokeStyle = 'rgba(110, 105, 95, 0.18)';
    vctx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 64) {
      vctx.beginPath(); vctx.moveTo(i, 0); vctx.lineTo(i, 256); vctx.stroke();
      vctx.beginPath(); vctx.moveTo(0, i); vctx.lineTo(256, i); vctx.stroke();
    }
    // Subtle mottled medical speckles
    for (let i = 0; i < 600; i++) {
      const shade = 180 + Math.floor(Math.random() * 40);
      vctx.fillStyle = `rgba(${shade},${shade - 4},${shade - 10},0.12)`;
      vctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    const vinylTex = new THREE.CanvasTexture(vinylCanvas);
    vinylTex.wrapS = vinylTex.wrapT = THREE.RepeatWrapping;
    vinylTex.repeat.set(6, 6);
    vinylTex.colorSpace = THREE.SRGBColorSpace;

    // 2. Terrazzo tile floor (for main lobby & elevator vestibules)
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = 256;
    tileCanvas.height = 256;
    const tctx = tileCanvas.getContext('2d');
    tctx.fillStyle = '#cbc5bb';
    tctx.fillRect(0, 0, 256, 256);
    tctx.strokeStyle = 'rgba(85, 80, 75, 0.25)';
    tctx.lineWidth = 3;
    for (let i = 0; i <= 256; i += 128) {
      tctx.beginPath(); tctx.moveTo(i, 0); tctx.lineTo(i, 256); tctx.stroke();
      tctx.beginPath(); tctx.moveTo(0, i); tctx.lineTo(256, i); tctx.stroke();
    }
    for (let i = 0; i < 900; i++) {
      const isDark = Math.random() > 0.6;
      tctx.fillStyle = isDark ? 'rgba(70,65,60,0.18)' : 'rgba(235,230,220,0.22)';
      tctx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
    const tileTex = new THREE.CanvasTexture(tileCanvas);
    tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
    tileTex.repeat.set(4, 4);
    tileTex.colorSpace = THREE.SRGBColorSpace;

    // 3. Hospital acoustic ceiling tile (subtle 60x60 grid)
    const ceilCanvas = document.createElement('canvas');
    ceilCanvas.width = 256;
    ceilCanvas.height = 256;
    const cctx = ceilCanvas.getContext('2d');
    cctx.fillStyle = '#f2efe9';
    cctx.fillRect(0, 0, 256, 256);
    cctx.strokeStyle = 'rgba(140, 135, 125, 0.35)';
    cctx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 64) {
      cctx.beginPath(); cctx.moveTo(i, 0); cctx.lineTo(i, 256); cctx.stroke();
      cctx.beginPath(); cctx.moveTo(0, i); cctx.lineTo(256, i); cctx.stroke();
    }
    const ceilTex = new THREE.CanvasTexture(ceilCanvas);
    ceilTex.wrapS = ceilTex.wrapT = THREE.RepeatWrapping;
    ceilTex.repeat.set(8, 8);
    ceilTex.colorSpace = THREE.SRGBColorSpace;

    // 4. Teak/oak wood grain (for duty room floor & furniture)
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 256;
    woodCanvas.height = 256;
    const wctx = woodCanvas.getContext('2d');
    wctx.fillStyle = '#9b7654';
    wctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) {
      const y = Math.random() * 256;
      wctx.fillStyle = (i % 2 === 0) ? 'rgba(120, 85, 55, 0.25)' : 'rgba(180, 145, 105, 0.2)';
      wctx.fillRect(0, y, 256, 2 + Math.random() * 4);
    }
    const woodTex = new THREE.CanvasTexture(woodCanvas);
    woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
    woodTex.repeat.set(4, 4);
    woodTex.colorSpace = THREE.SRGBColorSpace;

    return {
      vinyl: vinylTex,
      tile: tileTex,
      ceiling: ceilTex,
      wood: woodTex
    };
  }

  createMaterials() {
    return {
      wall: new THREE.MeshStandardMaterial({
        color: 0xf5f2eb, // Pale warm ivory hospital drywall
        roughness: 0.88,
        metalness: 0.02
      }),
      wallDark: new THREE.MeshStandardMaterial({
        color: 0x4a5d52, // Institutional sage green / slate
        roughness: 0.75
      }),
      wallBumper: new THREE.MeshStandardMaterial({
        color: 0x5a7364, // Medical protective bumper rail green
        roughness: 0.55
      }),
      floor: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: this.textures.vinyl || null,
        roughness: 0.52,
        metalness: 0.02
      }),
      floorTile: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: this.textures.tile || null,
        roughness: 0.48,
        metalness: 0.05
      }),
      floorWood: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: this.textures.wood || null,
        roughness: 0.62,
        metalness: 0.01
      }),
      ceiling: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: this.textures.ceiling || null,
        roughness: 0.92
      }),
      doorWood: new THREE.MeshStandardMaterial({
        color: 0x826045, // Honey teak hospital door
        map: this.textures.wood || null,
        roughness: 0.58
      }),
      metal: new THREE.MeshStandardMaterial({
        color: 0x7c8288,
        metalness: 0.65,
        roughness: 0.38
      }),
      stainless: new THREE.MeshStandardMaterial({
        color: 0xb5bac0,
        metalness: 0.85,
        roughness: 0.25
      }),
      glass: new THREE.MeshStandardMaterial({
        color: 0xcbe2eb,
        transparent: true,
        opacity: 0.35,
        roughness: 0.12,
        metalness: 0.1
      }),
      glassOpaquePlaceholder: new THREE.MeshStandardMaterial({
        color: 0x8ea2a8,
        roughness: 0.35
      }),
      counterTop: new THREE.MeshStandardMaterial({
        color: 0x243e32, // Deep forest solid surface
        roughness: 0.35,
        metalness: 0.05
      }),
      bedSheet: new THREE.MeshStandardMaterial({
        color: 0xedf1ee,
        roughness: 0.82
      }),
      bedFrame: new THREE.MeshStandardMaterial({
        color: 0x56605b,
        roughness: 0.55,
        metalness: 0.35
      }),
      terrainGrass: new THREE.MeshStandardMaterial({
        color: 0x364731, // Natural hillside sod
        roughness: 0.95
      }),
      pathGravel: new THREE.MeshStandardMaterial({
        color: 0x8a8478, // Permeable aggregate gravel path
        roughness: 0.88
      }),
      waterPlaceholder: new THREE.MeshStandardMaterial({
        color: 0x16282b, // Calm nocturnal pond surface
        roughness: 0.12,
        metalness: 0.55
      }),
      handrail: new THREE.MeshStandardMaterial({
        color: 0x937050, // Smooth lacquered teak handrail
        roughness: 0.45
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

  buildBaseboard(scene, x, y, z, width, depth) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.12, depth),
      this.materials.wallBumper
    );
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  buildCeilingLight(scene, x, y, z, intensity = 0.75, distance = 7.0, color = 0xfff6ea, isTransverse = false) {
    const fw = isTransverse ? 0.35 : 1.4;
    const fd = isTransverse ? 1.4 : 0.35;
    const ew = isTransverse ? 0.22 : 1.25;
    const ed = isTransverse ? 1.25 : 0.22;

    const fixture = new THREE.Mesh(
      new THREE.BoxGeometry(fw, 0.06, fd),
      this.materials.metal
    );
    fixture.position.set(x, y, z);
    scene.add(fixture);

    const emitter = new THREE.Mesh(
      new THREE.BoxGeometry(ew, 0.02, ed),
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
