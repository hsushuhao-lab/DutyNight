import assert from 'node:assert/strict';
import * as THREE from 'three';
import { FirstCampus2FER } from './src/world/zones/FirstCampus2FER.js';
import { GeometryFactory } from './src/world/shared/GeometryFactory.js';

global.document = { createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => ({ addColorStop() {} }) }) }) };
const zone = new FirstCampus2FER(new THREE.Scene(), new GeometryFactory()).build();
const gaps = [
  { name: 'south arrival return', min: -4, max: 0, z: -3.5 },
  { name: 'north arrival return', min: -4, max: 0, z: 3.5 },
  { name: 'south treatment-charting junction', min: 7, max: 9, z: -3.5 },
  { name: 'north triage-observation junction', min: 7, max: 9, z: 3.5 },
  { name: 'south ambulance approach', min: 16, max: 22, z: -3.5 },
  { name: 'north ambulance approach', min: 20, max: 22, z: 3.5 },
];
const failures = [];
for (const gap of gaps) {
  try {
    for (let x = gap.min + .25; x < gap.max; x += .25) {
      const probe = new THREE.Box3(new THREE.Vector3(x - .1, .15, gap.z - .15), new THREE.Vector3(x + .1, 1.9, gap.z + .15));
      assert(zone.colliders.some(box => box.intersectsBox(probe)), `No player-height boundary at x=${x}, z=${gap.z}`);
      const ray = new THREE.Raycaster(new THREE.Vector3(x, 1.6, 0), new THREE.Vector3(0, 0, Math.sign(gap.z)), 0, 3.75);
      zone.zoneGroup.updateMatrixWorld(true);
      assert(ray.intersectObjects(zone.zoneGroup.children, true).some(hit => hit.distance >= 3.25 && hit.object.geometry?.parameters.height >= 3.2), `No full-height visible shell at x=${x}, z=${gap.z}`);
    }
    console.log(`PASS ${gap.name}`);
  } catch (error) {
    failures.push(`${gap.name}: ${error.message}`);
    console.error(`FAIL ${gap.name}: ${error.message}`);
  }
}
for (const [name, start, end] of [['observation west return', 3.5, 9.5], ['charting west return', -9.5, -3.5]]) {
  try {
    for(let z=start+.25;z<end;z+=.25) {
      const probe=new THREE.Box3(new THREE.Vector3(8.85,.15,z-.1),new THREE.Vector3(9.15,1.9,z+.1));
      assert(zone.colliders.some(box=>box.intersectsBox(probe)), 'No west return collision at x=9, z='+z);
      const ray=new THREE.Raycaster(new THREE.Vector3(9.8,1.6,z),new THREE.Vector3(-1,0,0),0,1.1);
      zone.zoneGroup.updateMatrixWorld(true);
      assert(ray.intersectObjects(zone.zoneGroup.children,true).some(hit=>hit.object.geometry?.parameters.height>=3.2), 'No visible west return at x=9, z='+z);
    }
    console.log('PASS '+name);
  } catch(error) { failures.push(name+': '+error.message); console.error('FAIL '+name+': '+error.message); }
}
zone.cleanup();
assert.equal(failures.length, 0, failures.join('\n'));
console.log('ER AUTHORIZED BOUNDARIES: 8/8 PASS');
