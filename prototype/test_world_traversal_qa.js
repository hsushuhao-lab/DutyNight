// prototype/test_world_traversal_qa.js - Real-world Traversal, Doorway, Wall, Reachability & Cleanup QA
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
import { CollisionFactory } from './src/world/shared/CollisionFactory.js';
import { GameState } from './src/core/GameState.js';

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

const gf = new GeometryFactory();

const zones = {
  first_campus_3f: FirstCampus3F,
  first_campus_4f: FirstCampus4F,
  first_campus_2f: FirstCampus2FER,
  first_campus_1f: FirstCampus1F,
  first_campus_8f: FirstCampus8FBridgeEntry,
  skybridge: Skybridge,
  second_campus_2f: SecondCampus2F,
  second_campus_std: SecondCampusStandardFloor,
  second_campus_1f: SecondCampus1F,
  hillside_route: HillsideRoute,
  ecology_pond: EcologyPond
};

function buildZone(zoneId) {
  const scene = new THREE.Scene();
  const ZoneClass = zones[zoneId];
  if (!ZoneClass) throw new Error(`Unknown zone ${zoneId}`);
  const instance = new ZoneClass(scene, gf);
  instance.build();
  return { scene, instance, colliders: instance.colliders };
}

// Ray-box segment intersection helper
function isRayBlocked(p1, p2, colliders, ignoreNearTarget = 0.05) {
  const start = new THREE.Vector3(...p1);
  const end = new THREE.Vector3(...p2);
  const dist = start.distanceTo(end);
  if (dist < 0.001) return { blocked: false };
  const dir = new THREE.Vector3().subVectors(end, start).normalize();
  const ray = new THREE.Ray(start, dir);
  const hitPoint = new THREE.Vector3();

  for (const box of colliders) {
    // If the box contains the target object (i.e. the furniture/pedestal the item is sitting on), skip it
    if (box.containsPoint(end)) continue;

    const hit = ray.intersectBox(box, hitPoint);
    if (hit) {
      const hitDist = start.distanceTo(hitPoint);
      if (hitDist > 0.02 && hitDist < dist - ignoreNearTarget) {
        return { blocked: true, collider: box, hitDist };
      }
    }
  }
  return { blocked: false };
}

console.log('===============================================================');
console.log(' DUTYNIGHT WORLD TRAVERSAL & SPATIAL INTEGRITY QA (REAL QA v2) ');
console.log('===============================================================\n');

// ==============================================================
// 1. ROUTE WALK TEST (18 routes, 0.10 - 0.15m sampling, player radius 0.35m)
// ==============================================================
console.log('--- TEST CATEGORY 1: ROUTE WALK TEST (18 routes) ---');

const routes = [
  // 1. 3F corridor -> 316
  {
    id: 'R01_3F_corridor_to_316',
    zone: 'first_campus_3f',
    name: '3F Corridor to 316 Office Entrance',
    waypoints: [
      [0.0, 1.7, 0.0],
      [1.5, 1.7, 0.0],
      [2.4, 1.7, 0.0],
      [2.4, 1.7, 1.2],
      [2.4, 1.7, 2.5],
      [2.4, 1.7, 3.5],
      [4.0, 1.7, 4.2],
      [5.0, 1.7, 4.2]
    ]
  },
  // 2. 316 -> HIS
  {
    id: 'R02_316_to_HIS',
    zone: 'first_campus_3f',
    name: '316 Center to HIS Workstation',
    waypoints: [
      [5.0, 1.7, 4.2],
      [6.5, 1.7, 4.2],
      [8.0, 1.7, 4.2],
      [8.8, 1.7, 4.9]
    ]
  },
  // 3. 316/HIS -> elevator
  {
    id: 'R03_316_HIS_to_Elevator',
    zone: 'first_campus_3f',
    name: '316/HIS Workstation to 3F Elevator Lobby',
    waypoints: [
      [8.8, 1.7, 4.9],
      [8.0, 1.7, 4.2],
      [5.0, 1.7, 4.2],
      [3.5, 1.7, 3.5],
      [2.4, 1.7, 3.5],
      [2.4, 1.7, 2.5],
      [2.4, 1.7, 1.2],
      [2.4, 1.7, 0.0],
      [0.0, 1.7, 0.0],
      [-4.0, 1.7, 0.0],
      [-8.0, 1.7, 0.0],
      [-10.2, 1.7, 0.0]
    ]
  },
  // 4. 4F elevator -> duty room
  {
    id: 'R04_4F_elevator_to_duty_room',
    zone: 'first_campus_4f',
    name: '4F Elevator Lobby to Independent Duty Room',
    waypoints: [
      [-8.0, 1.7, 0.0],
      [-4.0, 1.7, 0.0],
      [0.0, 1.7, 0.0],
      [5.4, 1.7, 0.0],
      [5.4, 1.7, -1.2],
      [5.4, 1.7, -2.5],
      [5.4, 1.7, -3.8],
      [5.4, 1.7, -5.5]
    ]
  },
  // 5. 4F elevator -> nursing station
  {
    id: 'R05_4F_elevator_to_nursing_station',
    zone: 'first_campus_4f',
    name: '4F Elevator Lobby to 4A Nursing Station Counter',
    waypoints: [
      [-8.0, 1.7, 0.0],
      [-2.0, 1.7, 0.0],
      [4.0, 1.7, 0.0],
      [8.0, 1.7, 0.0],
      [8.0, 1.7, 1.5]
    ]
  },
  // 6. 4F nursing station -> ward gate
  {
    id: 'R06_4F_nursing_station_to_ward_gate',
    zone: 'first_campus_4f',
    name: '4A Nursing Station Corridor to 4A Ward Gate',
    waypoints: [
      [8.0, 1.7, 1.5],
      [8.0, 1.7, 0.0],
      [10.5, 1.7, 0.0],
      [12.5, 1.7, 0.0]
    ]
  },
  // 7. 2F ER entrance -> nursing station
  {
    id: 'R07_2F_ER_entrance_to_triage',
    zone: 'first_campus_2f',
    name: '2F ER Arrival to Triage / Nursing Station',
    waypoints: [
      [-4.0, 1.7, 0.0],
      [0.0, 1.7, 0.0],
      [3.5, 1.7, 0.0],
      [3.5, 1.7, 1.2],
      [3.5, 1.7, 2.2]
    ]
  },
  // 8. ER -> observation bays
  {
    id: 'R08_ER_corridor_to_observation_bays',
    zone: 'first_campus_2f',
    name: '2F ER Corridor to Observation Bays 01-04',
    waypoints: [
      [3.5, 1.7, 0.0],
      [8.0, 1.7, 0.0],
      [14.0, 1.7, 0.0],
      [14.0, 1.7, 2.5],
      [14.0, 1.7, 4.5]
    ]
  },
  // 9. ER -> treatment room
  {
    id: 'R09_ER_to_treatment_room',
    zone: 'first_campus_2f',
    name: '2F ER Corridor into Treatment Room (Pre-ECT)',
    waypoints: [
      [3.5, 1.7, 0.0],
      [3.5, 1.7, -1.5],
      [3.5, 1.7, -3.5],
      [3.5, 1.7, -4.3],
      [2.0, 1.7, -4.3],
      [2.0, 1.7, -6.5]
    ]
  },
  // 10. ER -> exterior
  {
    id: 'R10_ER_to_exterior',
    zone: 'first_campus_2f',
    name: '2F ER Corridor to Ambulance Bay Exterior',
    waypoints: [
      [14.0, 1.7, 0.0],
      [17.5, 1.7, 0.0],
      [19.5, 1.7, 0.0],
      [20.5, 1.7, 0.0]
    ]
  },
  // 11. 1F entrance -> reception -> elevator
  {
    id: 'R11_1F_entrance_reception_elevator',
    zone: 'first_campus_1f',
    name: '1F Main Plaza Entrance to Reception to Elevator Core',
    waypoints: [
      [1.0, 1.7, -10.0],
      [1.0, 1.7, -8.0],
      [1.0, 1.7, -5.5],
      [2.0, 1.7, -2.8],
      [-2.5, 1.7, -2.8],
      [-2.5, 1.7, 0.0],
      [-5.0, 1.7, 0.0],
      [-8.0, 1.7, 0.0]
    ]
  },
  // 12. 8F -> skybridge entrance
  {
    id: 'R12_8F_to_skybridge_entrance',
    zone: 'first_campus_8f',
    name: '8F Lobby to Skybridge Fire Door Threshold',
    waypoints: [
      [-4.0, 1.7, 0.0],
      [-2.0, 1.7, 0.0],
      [-0.5, 1.7, 0.0],
      [0.0, 1.7, 0.0]
    ]
  },
  // 13. skybridge start -> end
  {
    id: 'R13_skybridge_start_to_end',
    zone: 'skybridge',
    name: '60m Skybridge Span Full Traversal (First to Second Campus)',
    waypoints: [
      [3.0, 1.7, 0.0],
      [15.0, 1.7, 0.0],
      [30.0, 1.7, 0.0],
      [45.0, 1.7, 0.0],
      [57.0, 1.7, 0.0]
    ]
  },
  // 14. second campus 2F arrival -> elevator/stair
  {
    id: 'R14_second_campus_2F_arrival_to_stair',
    zone: 'second_campus_2f',
    name: 'Second Campus 2F Arrival Lobby to Stairwell Doorway',
    waypoints: [
      [63.0, 1.7, 0.0],
      [70.0, 1.7, 0.0],
      [76.0, 1.7, 0.0],
      [78.0, 1.7, 1.8],
      [80.0, 1.7, 1.8]
    ]
  },
  // 15. standard floor elevator -> nursing station
  {
    id: 'R15_std_floor_elevator_to_nursing',
    zone: 'second_campus_std',
    name: 'Second Campus Standard Ward Floor Elevator to Station',
    waypoints: [
      [76.0, 1.7, 0.0],
      [76.0, 1.7, 1.0],
      [76.0, 1.7, 2.0]
    ]
  },
  // 16. second campus 1F -> hillside exit
  {
    id: 'R16_second_campus_1F_to_hillside_exit',
    zone: 'second_campus_1f',
    name: 'Second Campus 1F Corridor to Hillside Trail Exit Door',
    waypoints: [
      [72.0, 1.7, 0.0],
      [72.0, 1.7, -2.5],
      [72.0, 1.7, -4.0],
      [72.0, 1.7, -7.0]
    ]
  },
  // 17. hillside main route -> fork
  {
    id: 'R17_hillside_main_route_to_fork',
    zone: 'hillside_route',
    name: 'Hillside Trailhead to Nature Trail Pond Fork',
    waypoints: [
      [68.0, 1.7, -18.0],
      [60.0, 1.7, -19.5],
      [50.0, 1.7, -22.0],
      [42.0, 1.7, -25.0]
    ]
  },
  // 18. fork -> pond and pond -> return route
  {
    id: 'R18_fork_to_pond_and_return',
    zone: 'ecology_pond',
    name: 'Ecology Pond Approach Trail to Boardwalk Deck and Return',
    waypoints: [
      [53.0, 1.15, -38.0],
      [53.0, 1.15, -41.5],
      [56.0, 1.20, -41.5],
      [61.0, 1.23, -42.5],
      [56.0, 1.20, -41.5],
      [53.0, 1.15, -41.5],
      [53.0, 1.15, -38.0]
    ]
  }
];

let routePassed = 0;
const routeResults = [];

for (const r of routes) {
  const { colliders } = buildZone(r.zone);
  let totalSamples = 0;
  let blockedSample = null;
  const stepSize = 0.12;

  for (let i = 0; i < r.waypoints.length - 1; i++) {
    const pA = new THREE.Vector3(...r.waypoints[i]);
    const pB = new THREE.Vector3(...r.waypoints[i + 1]);
    const segDist = pA.distanceTo(pB);
    const steps = Math.max(1, Math.ceil(segDist / stepSize));

    for (let s = 0; s <= steps; s++) {
      const cur = new THREE.Vector3().lerpVectors(pA, pB, s / steps);
      totalSamples++;
      const check = CollisionFactory.testPoint(colliders, cur.x, cur.y, cur.z, 0.35);
      if (check.collided) {
        blockedSample = {
          pos: [cur.x.toFixed(2), cur.y.toFixed(2), cur.z.toFixed(2)],
          seg: `${i}->${i+1}`,
          collider: check.collider
        };
        break;
      }
    }
    if (blockedSample) break;
  }

  const passed = !blockedSample;
  if (passed) routePassed++;
  routeResults.push({
    RouteId: r.id,
    Name: r.name,
    Zone: r.zone,
    Samples: totalSamples,
    Status: passed ? 'PASS' : `FAIL (${blockedSample.pos.join(',')})`
  });
}

console.table(routeResults);
console.log(`ROUTE TRAVERSAL: ${routePassed}/${routes.length} (${Math.round((routePassed / routes.length) * 100)}%)\n`);

// ==============================================================
// 2. DOORWAY APERTURE TEST (Center, Left-offset, Right-offset, Lintel >= 1.95m)
// ==============================================================
console.log('--- TEST CATEGORY 2: DOORWAY APERTURE TEST ---');

const doorwaysToTest = [
  { id: 'D01_3F_316_door', zone: 'first_campus_3f', x: 2.4, y: 0.0, z: 2.5, width: 1.2, isAlongX: true, lintelY: 2.4 },
  { id: 'D02_4F_duty_room', zone: 'first_campus_4f', x: 5.4, y: 0.0, z: -2.5, width: 1.2, isAlongX: true, lintelY: 2.4 },
  { id: 'D03_4F_ward_gate', zone: 'first_campus_4f', x: 14.0, y: 0.0, z: 0.0, width: 2.0, isAlongX: false, lintelY: 2.4 },
  { id: 'D04_2F_ER_treatment', zone: 'first_campus_2f', x: 3.5, y: 0.0, z: -3.5, width: 1.4, isAlongX: true, lintelY: 2.4 },
  { id: 'D05_8F_bridge_fire_door', zone: 'first_campus_8f', x: 0.0, y: 0.0, z: 0.0, width: 2.4, isAlongX: false, lintelY: 2.4 },
  { id: 'D06_2F_second_campus_stair', zone: 'second_campus_2f', x: 80.0, y: 0.0, z: 1.8, width: 1.2, isAlongX: false, lintelY: 2.4 },
  { id: 'D07_1F_second_campus_exit', zone: 'second_campus_1f', x: 72.0, y: 0.0, z: -7.0, width: 1.4, isAlongX: true, lintelY: 2.4 },
  { id: 'D08_1F_lobby_entrance', zone: 'first_campus_1f', x: 1.0, y: 0.0, z: -8.0, width: 4.0, isAlongX: true, lintelY: 3.0 }
];

let doorwayPassed = 0;
const doorwayResults = [];

for (const d of doorwaysToTest) {
  const { colliders } = buildZone(d.zone);
  const playerRadius = 0.35;
  const halfClear = d.width / 2;
  const offset = Math.max(0.08, halfClear - playerRadius - 0.04);

  // Lanes definition (0.9m from threshold on each side)
  const travDist = 0.9;
  let lanes = [];
  if (d.isAlongX) {
    lanes = [
      { name: 'center', start: [d.x, 1.7, d.z - travDist], end: [d.x, 1.7, d.z + travDist] },
      { name: 'left',   start: [d.x - offset, 1.7, d.z - travDist], end: [d.x - offset, 1.7, d.z + travDist] },
      { name: 'right',  start: [d.x + offset, 1.7, d.z - travDist], end: [d.x + offset, 1.7, d.z + travDist] }
    ];
  } else {
    lanes = [
      { name: 'center', start: [d.x - travDist, 1.7, d.z], end: [d.x + travDist, 1.7, d.z] },
      { name: 'left',   start: [d.x - travDist, 1.7, d.z - offset], end: [d.x + travDist, 1.7, d.z - offset] },
      { name: 'right',  start: [d.x - travDist, 1.7, d.z + offset], end: [d.x + travDist, 1.7, d.z + offset] }
    ];
  }

  let laneFailures = [];
  for (const lane of lanes) {
    const p1 = new THREE.Vector3(...lane.start);
    const p2 = new THREE.Vector3(...lane.end);
    const steps = 24;
    for (let s = 0; s <= steps; s++) {
      const cur = new THREE.Vector3().lerpVectors(p1, p2, s / steps);
      const test = CollisionFactory.testPoint(colliders, cur.x, cur.y, cur.z, playerRadius);
      if (test.collided) {
        laneFailures.push(`${lane.name}@(${cur.x.toFixed(2)},${cur.z.toFixed(2)})`);
        break;
      }
    }
  }

  // Lintel clearance check: no collider within the doorway clear opening between y = 0.2m and 1.95m
  let lintelPass = true;
  for (const b of colliders) {
    // Check if box overlaps doorway horizontal opening
    let overlapsH = false;
    if (d.isAlongX) {
      overlapsH = (b.min.x < d.x + halfClear - 0.08 && b.max.x > d.x - halfClear + 0.08 &&
                   b.min.z < d.z + 0.22 && b.max.z > d.z - 0.22);
    } else {
      overlapsH = (b.min.z < d.z + halfClear - 0.08 && b.max.z > d.z - halfClear + 0.08 &&
                   b.min.x < d.x + 0.22 && b.max.x > d.x - 0.22);
    }
    if (overlapsH) {
      // Overlapping box must either be below floor or strictly above player head (1.95m)
      if (b.min.y < 1.95 && b.max.y > 0.2) {
        lintelPass = false;
        laneFailures.push(`lintel_intrusion(y:${b.min.y.toFixed(2)}-${b.max.y.toFixed(2)})`);
        break;
      }
    }
  }

  const passed = laneFailures.length === 0 && lintelPass;
  if (passed) doorwayPassed++;
  doorwayResults.push({
    DoorId: d.id,
    Zone: d.zone,
    Opening: `${d.width}m x ${d.lintelY}m`,
    Lanes: laneFailures.length === 0 ? '3/3 CLEAR' : laneFailures.join('; '),
    Lintel: lintelPass ? 'PASS (>=1.95m)' : 'FAIL',
    Status: passed ? 'PASS' : 'FAIL'
  });
}

console.table(doorwayResults);
console.log(`DOORWAY: ${doorwayPassed}/${doorwaysToTest.length} (${Math.round((doorwayPassed / doorwaysToTest.length) * 100)}%)\n`);

// ==============================================================
// 3. WALL CONTAINMENT TEST (Orthogonal & Diagonal penetration check)
// ==============================================================
console.log('--- TEST CATEGORY 3: WALL CONTAINMENT / PENETRATION TEST ---');

const wallTests = [
  // 3F opposite wall (south continuous shell at z = -2.5)
  { id: 'W01_3F_opposite_wall', zone: 'first_campus_3f', inside: [6.0, 1.7, -1.0], outside: [6.0, 1.7, -3.2] },
  // 316 outer walls (north wall at z = 8.5, east wall at x = 11.0)
  { id: 'W02_316_north_wall', zone: 'first_campus_3f', inside: [3.0, 1.7, 7.5], outside: [3.0, 1.7, 9.2] },
  { id: 'W03_316_east_wall', zone: 'first_campus_3f', inside: [9.0, 1.7, 3.8], outside: [12.0, 1.7, 3.8] },
  // 4F perimeter
  { id: 'W04_4F_north_wall', zone: 'first_campus_4f', inside: [0.0, 1.7, 1.5], outside: [0.0, 1.7, 3.2] },
  { id: 'W05_4F_duty_room_south', zone: 'first_campus_4f', inside: [5.4, 1.7, -7.0], outside: [5.4, 1.7, -9.2] },
  { id: 'W06_4F_nursing_counter', zone: 'first_campus_4f', inside: [8.0, 1.7, 1.5], outside: [8.0, 1.7, 3.2] },
  // ER perimeter
  { id: 'W07_2F_ER_south_wall', zone: 'first_campus_2f', inside: [10.5, 1.7, -1.5], outside: [10.5, 1.7, -4.5] },
  { id: 'W08_2F_ER_north_wall', zone: 'first_campus_2f', inside: [14.0, 1.7, 4.5], outside: [14.0, 1.7, 10.5] },
  // Skybridge side windows
  { id: 'W09_skybridge_north_window', zone: 'skybridge', inside: [30.0, 1.7, 1.2], outside: [30.0, 1.7, 2.8] },
  { id: 'W10_skybridge_south_window', zone: 'skybridge', inside: [30.0, 1.7, -1.2], outside: [30.0, 1.7, -2.8] },
  // Second campus perimeter
  { id: 'W11_second_campus_north', zone: 'second_campus_2f', inside: [70.0, 1.7, 2.0], outside: [70.0, 1.7, 4.5] },
  // Hillside & pond containment
  { id: 'W12_hillside_north_boundary', zone: 'hillside_route', inside: [50.0, 1.7, -18.0], outside: [50.0, 1.7, -13.0] },
  { id: 'W13_pond_water_boundary', zone: 'ecology_pond', inside: [61.0, 1.23, -42.5], outside: [61.0, 1.23, -47.5] }
];

let wallPassed = 0;
const wallResults = [];

for (const wt of wallTests) {
  const { colliders } = buildZone(wt.zone);
  const pIn = new THREE.Vector3(...wt.inside);
  const pOut = new THREE.Vector3(...wt.outside);

  // 1. Inside sample must be CLEAR
  const inCheck = CollisionFactory.testPoint(colliders, pIn.x, pIn.y, pIn.z, 0.35);
  const insideClear = !inCheck.collided;

  // 2. Direct orthogonal traversal must be BLOCKED
  const directTraversal = CollisionFactory.testTraversal(colliders, wt.inside, wt.outside, 0.35, 20);
  const directBlocked = !directTraversal.passable;

  // 3. Diagonal traversal tests (+35 deg and -35 deg lateral deflection)
  const dir = new THREE.Vector3().subVectors(pOut, pIn);
  const diag1End = pIn.clone().add(dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.6));
  const diag2End = pIn.clone().add(dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.6));

  const diag1Traversal = CollisionFactory.testTraversal(
    colliders,
    [pIn.x, pIn.y, pIn.z],
    [diag1End.x, diag1End.y, diag1End.z],
    0.35,
    20
  );
  const diag2Traversal = CollisionFactory.testTraversal(
    colliders,
    [pIn.x, pIn.y, pIn.z],
    [diag2End.x, diag2End.y, diag2End.z],
    0.35,
    20
  );
  const diagonalBlocked = !diag1Traversal.passable && !diag2Traversal.passable;

  const passed = insideClear && directBlocked && diagonalBlocked;
  if (passed) wallPassed++;

  wallResults.push({
    WallId: wt.id,
    Zone: wt.zone,
    InsideClear: insideClear ? 'PASS' : 'FAIL',
    DirectBlocked: directBlocked ? 'PASS' : 'FAIL',
    DiagonalBlocked: diagonalBlocked ? 'PASS' : 'FAIL',
    Status: passed ? 'PASS' : 'FAIL'
  });
}

console.table(wallResults);
console.log(`WALL CONTAINMENT: ${wallPassed}/${wallTests.length} (${Math.round((wallPassed / wallTests.length) * 100)}%)\n`);

// ==============================================================
// 4. INTERACTION REACHABILITY TEST (Standing point clear + Line-of-sight unblocked)
// ==============================================================
console.log('--- TEST CATEGORY 4: INTERACTION REACHABILITY TEST ---');

const interactionTargets = [
  // 3F Key
  {
    id: 'I01_KEY_PICKUP',
    zone: 'first_campus_3f',
    label: 'Room 316 Duty Key',
    standingPos: [5.6, 1.7, 5.0],
    targetPos: [5.6, 0.83, 6.0],
    maxRadius: 1.5
  },
  // 3F Duty Log
  {
    id: 'I02_DUTY_LOG',
    zone: 'first_campus_3f',
    label: 'Room 316 Duty Log Book',
    standingPos: [6.4, 1.7, 5.0],
    targetPos: [6.4, 0.85, 6.0],
    maxRadius: 1.5
  },
  // 3F HIS Workstation
  {
    id: 'I03_HIS_WORKSTATION',
    zone: 'first_campus_3f',
    label: 'Room 316 Electronic Handover HIS',
    standingPos: [8.8, 1.7, 4.9],
    targetPos: [9.9, 1.2, 4.9],
    maxRadius: 1.5
  },
  // 3F Elevator Call Button
  {
    id: 'I04_3F_ELEVATOR_BUTTON',
    zone: 'first_campus_3f',
    label: '3F Elevator Call Panel',
    standingPos: [-10.2, 1.7, 1.6],
    targetPos: [-11.55, 1.2, 1.6],
    maxRadius: 1.8
  },
  // 4F Ward Gate Card Reader
  {
    id: 'I05_WARD_GATE_READER',
    zone: 'first_campus_4f',
    label: '4A Ward Gate RFID Card Reader',
    standingPos: [12.6, 1.7, -1.2],
    targetPos: [13.8, 1.3, -1.2],
    maxRadius: 1.5
  }
];

let interactPassed = 0;
const interactResults = [];

for (const it of interactionTargets) {
  const { colliders } = buildZone(it.zone);
  const sp = it.standingPos;
  const tp = it.targetPos;

  // 1. Standing point clearance
  const standingCheck = CollisionFactory.testPoint(colliders, sp[0], sp[1], sp[2], 0.35);
  const standingClear = !standingCheck.collided;

  // 2. Distance within interaction radius
  const dist = new THREE.Vector3(...sp).distanceTo(new THREE.Vector3(...tp));
  const distValid = dist <= it.maxRadius;

  // 3. Line-of-sight ray unblocked by foreign walls
  const eyePos = [sp[0], sp[1], sp[2]]; // eye level at standingPos
  const rayCheck = isRayBlocked(eyePos, tp, colliders, 0.12);
  const rayUnblocked = !rayCheck.blocked;

  const passed = standingClear && distValid && rayUnblocked;
  if (passed) interactPassed++;

  interactResults.push({
    InteractId: it.id,
    Label: it.label,
    Distance: `${dist.toFixed(2)}m (<= ${it.maxRadius}m)`,
    StandingClear: standingClear ? 'PASS' : 'FAIL',
    RayLOS: rayUnblocked ? 'PASS (Clear)' : 'FAIL (Blocked)',
    Status: passed ? 'PASS' : 'FAIL'
  });
}

console.table(interactResults);
console.log(`INTERACTION REACHABILITY: ${interactPassed}/${interactionTargets.length} (${Math.round((interactPassed / interactionTargets.length) * 100)}%)\n`);

// ==============================================================
// 5. ZONE CLEANUP NO LEAK TEST (20 complete loops through all zones)
// ==============================================================
console.log('--- TEST CATEGORY 5: ZONE CLEANUP & LEAKAGE TEST (TEST_ZONE_CLEANUP_NO_LEAK) ---');

const zoneSequence = [
  'first_campus_3f',
  'first_campus_4f',
  'first_campus_2f',
  'first_campus_1f',
  'first_campus_8f',
  'skybridge',
  'second_campus_2f',
  'second_campus_std',
  'second_campus_1f',
  'hillside_route',
  'ecology_pond'
];

const testScene = new THREE.Scene();
const baselineLightingGroup = new THREE.Group();
baselineLightingGroup.name = 'Baseline_Lighting';
testScene.add(baselineLightingGroup);

let currentZoneInstance = null;
let leakDetected = false;
let leakDetail = '';
const LOOPS = 20;

let initial3FObjectCount = 0;
let final3FObjectCount = 0;

for (let loop = 1; loop <= LOOPS; loop++) {
  for (const zId of zoneSequence) {
    if (currentZoneInstance) {
      currentZoneInstance.cleanup();
      currentZoneInstance = null;
      // Scene must only contain baselineLightingGroup after cleanup!
      if (testScene.children.length !== 1) {
        leakDetected = true;
        leakDetail = `Leak in loop ${loop} after cleaning ${zId}: Scene children count is ${testScene.children.length} (expected 1)`;
        break;
      }
    }

    const ZoneClass = zones[zId];
    currentZoneInstance = new ZoneClass(testScene, gf);
    currentZoneInstance.build();

    if (zId === 'first_campus_3f') {
      let count = 0;
      testScene.traverse(() => count++);
      if (loop === 1) initial3FObjectCount = count;
      if (loop === LOOPS) final3FObjectCount = count;
    }
  }
  if (leakDetected) break;
}

// Clean final zone
if (currentZoneInstance) {
  currentZoneInstance.cleanup();
  currentZoneInstance = null;
}

const cleanupPassed = !leakDetected && (testScene.children.length === 1) && (initial3FObjectCount === final3FObjectCount);
console.log(`Loops executed: ${LOOPS} full cycles (${LOOPS * zoneSequence.length} zone loads)`);
console.log(`Initial 3F scene objects (Loop 1): ${initial3FObjectCount}`);
console.log(`Final 3F scene objects (Loop 20): ${final3FObjectCount}`);
console.log(`Post-cleanup remaining scene children: ${testScene.children.length} (only baseline lighting group)`);
console.log(`ZONE CLEANUP: ${cleanupPassed ? '1/1 (100% PASS)' : `0/1 FAIL - ${leakDetail}`}\n`);

// ==============================================================
// 6. STATE PERSISTENCE TEST (GameState flags maintained across zone loads)
// ==============================================================
console.log('--- TEST CATEGORY 6: STATE PERSISTENCE TEST ---');

const gs = new GameState();
gs.markTaskComplete('KEY_PICKUP');
gs.markTaskComplete('DUTY_LOG');
gs.setFlag('WARD_GATE_UNLOCKED', true);
gs.setFlag('ELE_READY', true);

// Simulate zone hopping
const testHops = ['first_campus_3f', 'first_campus_4f', 'first_campus_2f', 'skybridge', 'first_campus_3f'];
let stateIntegrityPassed = true;

for (const hop of testHops) {
  const dummyScene = new THREE.Scene();
  const inst = new zones[hop](dummyScene, gf);
  inst.build();

  if (!gs.isTaskComplete('KEY_PICKUP') ||
      !gs.isTaskComplete('DUTY_LOG') ||
      !gs.getFlag('WARD_GATE_UNLOCKED') ||
      !gs.getFlag('ELE_READY')) {
    stateIntegrityPassed = false;
    break;
  }
  inst.cleanup();
}

console.log(`STATE PERSISTENCE: ${stateIntegrityPassed ? '1/1 (100% PASS)' : '0/1 (FAIL)'}\n`);

// ==============================================================
// SUMMARY & VERDICT
// ==============================================================
console.log('===============================================================');
console.log('                 FINAL TEST METRICS SUMMARY                    ');
console.log('===============================================================');
console.log(`ROUTE TRAVERSAL:         ${routePassed}/${routes.length}`);
console.log(`DOORWAY:                 ${doorwayPassed}/${doorwaysToTest.length}`);
console.log(`WALL CONTAINMENT:        ${wallPassed}/${wallTests.length}`);
console.log(`INTERACTION REACHABILITY: ${interactPassed}/${interactionTargets.length}`);
console.log(`ZONE CLEANUP:            ${cleanupPassed ? '1/1' : '0/1'}`);
console.log(`STATE PERSISTENCE:       ${stateIntegrityPassed ? '1/1' : '0/1'}`);
console.log('===============================================================');

const allPassed = (routePassed === routes.length) &&
                  (doorwayPassed === doorwaysToTest.length) &&
                  (wallPassed === wallTests.length) &&
                  (interactPassed === interactionTargets.length) &&
                  cleanupPassed &&
                  stateIntegrityPassed;

if (allPassed) {
  console.log('>>> TRAVERSAL & SPATIAL QA: ALL CATEGORIES PASS (100%) <<<');
  process.exit(0);
} else {
  console.error('>>> TRAVERSAL & SPATIAL QA FAILED <<<');
  process.exit(1);
}
