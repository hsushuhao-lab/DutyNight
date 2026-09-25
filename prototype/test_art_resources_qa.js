import assert from 'node:assert/strict';
import * as THREE from 'three';
import { disposeZoneArt } from './src/art/ArtResources.js';
import { applyZoneLighting } from './src/art/VisualProfile.js';
import { applyPondArt } from './src/art/LandscapeArt.js';

const countDisposals = resource => {
  const count = { value: 0 };
  resource.addEventListener('dispose', () => { count.value++; });
  return count;
};

// A visited 3F creates GPU shadow targets only after render. Supply real render-target
// objects here so the test verifies the transition release without requiring WebGL.
const lighting = new THREE.Group();
const scene = new THREE.Scene();
for (let visit = 0; visit < 3; visit++) {
  applyZoneLighting({group:lighting,scene,zoneId:'first_campus_3f'});
  const sun = lighting.children.find(object => object.isSpotLight);
  assert.ok(sun, '3F shadow light exists');
  sun.shadow.map = new THREE.WebGLRenderTarget(16, 16);
  sun.shadow.mapPass = new THREE.WebGLRenderTarget(16, 16);
  const shadow = countDisposals(sun.shadow.map);
  const shadowPass = countDisposals(sun.shadow.mapPass);
  applyZoneLighting({group:lighting,scene,zoneId:'first_campus_4f'});
  assert.equal(shadow.value, 1, 'zone transition releases shadow map exactly once');
  assert.equal(shadowPass.value, 1, 'zone transition releases auxiliary shadow map');
}
console.log('PASS shadow targets released across three 3F/4F cycles');

const root = new THREE.Group();
const geometry = new THREE.BoxGeometry();
const texture = new THREE.Texture();
const material = new THREE.MeshStandardMaterial({ map: texture });
const instances = new THREE.InstancedMesh(geometry, material, 2);
instances.setColorAt(0, new THREE.Color('green'));
const ordinary = new THREE.Mesh(geometry, material);
root.add(instances, ordinary);
const geometryDisposals = countDisposals(geometry);
const textureDisposals = countDisposals(texture);
const materialDisposals = countDisposals(material);
const instanceDisposals = countDisposals(instances);
const sharedGeometry = new THREE.BoxGeometry();
sharedGeometry.userData.sharedAsset = true;
const sharedTexture = new THREE.Texture();
sharedTexture.userData.sharedAsset = true;
const sharedMaterial = new THREE.MeshStandardMaterial({ map: sharedTexture });
sharedMaterial.userData.sharedAsset = true;
const sharedGeometryDisposals = countDisposals(sharedGeometry);
const sharedTextureDisposals = countDisposals(sharedTexture);
const sharedMaterialDisposals = countDisposals(sharedMaterial);
root.add(new THREE.Mesh(sharedGeometry, sharedMaterial));
disposeZoneArt(root);
assert.equal(root.children.length, 0);
assert.equal(instanceDisposals.value, 1, 'instance buffers receive their disposal event');
assert.equal(geometryDisposals.value, 1, 'zone geometry shared by meshes is disposed once');
assert.equal(materialDisposals.value, 1);
assert.equal(textureDisposals.value, 1);
assert.equal(sharedGeometryDisposals.value, 0, 'registry geometry survives zone cleanup');
assert.equal(sharedMaterialDisposals.value, 0, 'registry material survives zone cleanup');
assert.equal(sharedTextureDisposals.value, 0, 'registry texture survives zone cleanup');
disposeZoneArt(root);
assert.equal(instanceDisposals.value, 1, 'repeated empty cleanup is harmless');
console.log('PASS instance buffers and unique resources released; shared cache retained');

// Exercise the actual pond helper and its material-to-render-target release binding.
const pond = { zoneGroup: new THREE.Group(), walkables: [] };
const pondArt = applyPondArt(pond);
const reflection = pondArt.getObjectByName('PondWater/SceneReflection');
assert.ok(reflection?.isReflector);
const reflectionDisposals = countDisposals(reflection.getRenderTarget());
disposeZoneArt(pond.zoneGroup);
assert.equal(reflectionDisposals.value, 1, 'pond reflection target released with zone');
console.log('PASS actual pond reflection render target cleanup');
console.log('ART_RESOURCE_QA = PASS (CPU disposal contracts; browser GPU behavior remains separate)');
