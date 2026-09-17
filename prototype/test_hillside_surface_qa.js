import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GeometryFactory } from './src/world/shared/GeometryFactory.js';
import { HillsideRoute } from './src/world/zones/HillsideRoute.js';

globalThis.document ??= { createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => ({ addColorStop() {} }) }) }) };
const main = [[72,-18,-.45],[65,-20,-.45],[55,-22,-.45],[42,-25,-.45],[30,-28,-.45],[20,-32,-.45],[10,-35,-.45]];
const branch = [[42,-25,-.45],[46,-30,-.5],[50,-35,-.55]];
const scene = new THREE.Scene();
const zone = new HillsideRoute(scene, new GeometryFactory()).build();
scene.updateMatrixWorld(true);
assert.equal(zone.walkables.length, 8, 'retain all eight original path segments');
assert.deepEqual(zone.colliders.map(box => [box.min.toArray(), box.max.toArray()]), [
  [[0,-1,-14.25],[80,3,-13.75]], [[0,-1,-45.25],[80,3,-44.75]],
  [[76.25,-1,-47.5],[76.75,3,-12.5]], [[4.75,-1,-47.5],[5.25,3,-12.5]],
], 'boundary collision boxes remain exactly locked');
const ray = new THREE.Raycaster();
let index = 0, samples = 0;
const failures = [];
for (const [name,nodes,width,padding] of [['main',main,3.6,.5],['branch',branch,2.4,.4]]) {
  for (let segment = 1; segment < nodes.length; segment++) {
    const [ax,az,ay] = nodes[segment-1], [bx,bz,by] = nodes[segment];
    const mesh = zone.walkables[index++];
    const length = Math.hypot(bx-ax,bz-az);
    assert.equal(mesh.geometry.parameters.width, width, 'path width remains locked');
    assert.equal(mesh.geometry.parameters.height, length+padding, 'path length remains locked');
    assert.deepEqual(mesh.position.toArray(), [(ax+bx)/2,(ay+by)/2+.02,(az+bz)/2], 'path midpoint/elevation remains locked');
    const intended = new THREE.Vector3(bx-ax,0,bz-az).normalize();
    const actual = new THREE.Vector3(0,1,0).transformDirection(mesh.matrixWorld);
    const angle = THREE.MathUtils.radToDeg(Math.acos(Math.min(1,Math.abs(actual.dot(intended)))));
    let misses = 0;
    const count = Math.ceil(length/.25);
    for(let point=0;point<=count;point++) {
      const t=point/count;
      ray.set(new THREE.Vector3(ax+(bx-ax)*t,10,az+(bz-az)*t),new THREE.Vector3(0,-1,0));
      if(ray.intersectObject(mesh,false).length===0)misses++;
      samples++;
    }
    console.log(`${name} segment ${segment}: axis_error=${angle.toFixed(4)}deg, centerline_misses=${misses}/${count+1}`);
    if(angle>.001||misses>0)failures.push(`${name}/${segment}`);
  }
}
zone.cleanup();
assert.equal(failures.length, 0, `Node-connected path surfaces must cover their full intended centerline: ${failures.join(', ')}`);
console.log(`HILLSIDE_SURFACE_QA = PASS: eight aligned segments; ${samples} raycast samples; original widths, nodes, elevations and boundary boxes retained`);
