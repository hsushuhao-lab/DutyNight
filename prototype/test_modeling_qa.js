// prototype/test_modeling_qa.js - Automated spatial verification for M0~M13
import * as THREE from 'three';

// Minimal DOM mock for Node environment texture generation
if (typeof document === 'undefined') {
  global.document = {
    createElement: () => ({
      width: 512,
      height: 512,
      getContext: () => new Proxy({
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: '',
        textBaseline: ''
      }, {
        get: (target, prop) => {
          if (prop in target) return target[prop];
          return () => ({ addColorStop: () => {} });
        }
      })
    })
  };
}
import { GeometryFactory } from './src/world/shared/GeometryFactory.js';
import { DEBUG_SPAWN_POINTS } from './src/world/shared/DebugSpawnPoints.js';
import { CollisionFactory } from './src/world/shared/CollisionFactory.js';

import { FirstCampus3F } from './src/world/zones/FirstCampus3F.js';
import { FirstCampus4F } from './src/world/zones/FirstCampus4F.js';
import { FirstCampus2FER } from './src/world/zones/FirstCampus2FER.js';
import { FirstCampus1F } from './src/world/zones/FirstCampus1F.js';
import { FirstCampus8FBridgeEntry } from './src/world/zones/FirstCampus8FBridgeEntry.js';
import { Skybridge } from './src/world/zones/Skybridge.js';
import { SecondCampus2F } from './src/world/zones/SecondCampus2F.js';
import { SecondCampusStandardFloor } from './src/world/zones/SecondCampusStandardFloor.js';
import { SecondCampus1F } from './src/world/zones/SecondCampus1F.js';
import { HillsideRoute } from './src/world/zones/HillsideRoute.js';
import { EcologyPond } from './src/world/zones/EcologyPond.js';

const zones = {
  'first_campus_3f': FirstCampus3F,
  'first_campus_4f': FirstCampus4F,
  'first_campus_2f': FirstCampus2FER,
  'first_campus_1f': FirstCampus1F,
  'first_campus_8f': FirstCampus8FBridgeEntry,
  'skybridge': Skybridge,
  'second_campus_2f': SecondCampus2F,
  'second_campus_5f': SecondCampusStandardFloor,
  'second_campus_std': SecondCampusStandardFloor,
  'second_campus_1f': SecondCampus1F,
  'hillside_route': HillsideRoute,
  'ecology_pond': EcologyPond
};

const gf = new GeometryFactory();
console.log('=== RUNNING MODELING SPAWN CLEARANCE QA (SPAWN_CLEAR_TEST) ===\n');

let totalTests = 0;
let passedTests = 0;
const results = [];

for (const [spawnKey, sp] of Object.entries(DEBUG_SPAWN_POINTS)) {
  totalTests++;
  const ZoneClass = zones[sp.zoneId];
  const dummyScene = new THREE.Scene();
  const zone = new ZoneClass(dummyScene, gf);
  zone.build();
  // Production doors are normally closed; spatial spawn QA opens them so door state does not masquerade as bad geometry.
  for (const door of Object.values(zone.accessDoors || {})) door.setClosed(false);

  // Spawn clearance test (player radius 0.35m)
  const pointCheck = CollisionFactory.testPoint(
    zone.colliders,
    sp.pos[0],
    sp.pos[1],
    sp.pos[2],
    0.35
  );

  const passed = !pointCheck.collided;
  if (passed) passedTests++;

  results.push({
    Milestone: sp.milestone,
    Name: sp.name,
    Zone: sp.zoneId,
    SpawnCoords: `[${sp.pos[0]}, ${sp.pos[1]}, ${sp.pos[2]}]`,
    Colliders: zone.colliders.length,
    Walkables: zone.walkables.length,
    SpawnClearance: pointCheck.collided ? 'FAIL (Blocked)' : 'PASS (Clear)',
    Overall: passed ? 'PASS' : 'FAIL'
  });
}

console.table(results);
console.log(`\nSPAWN CLEAR: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests/totalTests)*100)}%).`);

if (passedTests === totalTests) {
  console.log('>>> SPAWN CLEAR TEST: ALL 25 SPAWN POINTS PASS (Clear) <<<');
  process.exit(0);
} else {
  console.error('>>> SPAWN CLEAR TEST FAILED <<<');
  process.exit(1);
}
