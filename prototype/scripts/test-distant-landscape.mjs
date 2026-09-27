import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { buildDistantNightLandscape } from '../src/art/LandscapeArt.js';
import { zoneAssetManifest } from '../src/art/ZoneAssetManifest.js';

const parent = new THREE.Group();
const landscape = buildDistantNightLandscape(parent);
assert.equal(landscape.name, 'DistantNightLandscape');
assert.equal(parent.children.length, 1);
const names = [];
landscape.traverse(object => names.push(object.name));
for (const name of ['Distant pond shoreline', 'Distant pond water', 'Distant pond boardwalk', 'Distant hillside silhouette', 'Distant hillside trail', 'Distant pathway light']) {
  assert(names.includes(name), `missing distant scenery: ${name}`);
}
assert(!landscape.getObjectByName('Annie'), 'distant landscape must not contain Annie');
assert(!landscape.getObjectByName('Pond Annie reflection'), 'distant landscape must not contain Annie reflection');
landscape.traverse(object => {
  assert(!object.isReflector, 'distant landscape must not use Reflector');
  assert(!object.userData.interactable, 'distant scenery must not be interactable');
  assert(!object.userData.storyTrigger, 'distant scenery must not have story triggers');
  assert(!object.userData.walkable && !object.userData.collider, 'distant scenery must not add walkables or colliders');
});
assert(!zoneAssetManifest.skybridge.essential.models.includes('campusTree'));
assert(!zoneAssetManifest.skybridge.optional.models.includes('campusTree'), 'tree GLB must not gate or be requested during Skybridge entry');
const router = await readFile(new URL('../src/world/WorldRouter.js', import.meta.url), 'utf8');
assert(router.includes("'skybridge': Skybridge"));
assert(!router.includes("'ecology_pond':"));
assert(!router.includes("'hillside_route':"));
console.log('PASS distant landscape structure, gameplay exclusion, and Skybridge load manifest');
