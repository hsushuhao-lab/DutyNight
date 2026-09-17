import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GeometryFactory } from './src/world/shared/GeometryFactory.js';
import { FirstCampus8FBridgeEntry } from './src/world/zones/FirstCampus8FBridgeEntry.js';
import { FirstCampus1F } from './src/world/zones/FirstCampus1F.js';

global.document = { createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => ({ addColorStop() {} }) }) }) };
const failures = [];
for (const [Zone, axis, boundary, spans, route] of [
  [FirstCampus8FBridgeEntry, 'x', -4, [[-3.5, -2], [2, 3.5]], 0],
  [FirstCampus1F, 'z', -8, [[-2, -1], [3, 4]], 1],
]) {
  const zone = new Zone(new THREE.Scene(), new GeometryFactory()).build();
  zone.zoneGroup.updateMatrixWorld(true);
  const blocked = (normal, lateral) => {
    const [x, z] = axis === 'x' ? [normal, lateral] : [lateral, normal];
    const body = new THREE.Box3(new THREE.Vector3(x - .35, .15, z - .35), new THREE.Vector3(x + .35, 1.95, z + .35));
    return zone.colliders.some(box => box.intersectsBox(body));
  };
  for (const [min, max] of spans) {
    const label = `${Zone.name} ${axis}=${boundary} return ${min}..${max}`;
    try {
      const lateral = (min + max) / 2;
      let stopped = false;
      for (let normal = boundary - .75; normal <= boundary + .75; normal += .025) stopped ||= blocked(normal, lateral);
      assert(stopped, 'Player radius .35 can cross missing return');
      const origin = axis === 'x' ? new THREE.Vector3(boundary - .75, 1.6, lateral) : new THREE.Vector3(lateral, 1.6, boundary + .75);
      const direction = axis === 'x' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, -1);
      const hits = new THREE.Raycaster(origin, direction, 0, 1.5).intersectObjects(zone.zoneGroup.children, true);
      assert(hits.some(hit => hit.object.visible && hit.object.geometry?.parameters.height >= 3.2), 'Missing visible full-height return');
      console.log(`PASS ${label}`);
    } catch (error) { failures.push(`${label}: ${error.message}`); console.error(`FAIL ${label}: ${error.message}`); }
  }
  for (let normal = boundary - .75; normal <= boundary + .75; normal += .025) assert(!blocked(normal, route), `${Zone.name} original central passage obstructed`);
  console.log(`PASS ${Zone.name} original central passage preserved`);
  zone.cleanup();
}
assert.equal(failures.length, 0, failures.join('\n'));
console.log('AUTHORIZED ENTRY BOUNDARIES: 4/4 PASS');
