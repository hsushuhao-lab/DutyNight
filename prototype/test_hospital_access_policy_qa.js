import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const routes=read('./src/world/shared/WorldRoutes.js');
const router=read('./src/world/WorldRouter.js');
const travel=read('./src/world/shared/TravelFixtures.js');
const first1=read('./src/world/zones/FirstCampus1F.js');
const first2=read('./src/world/zones/FirstCampus2FER.js');
const first4=read('./src/world/zones/FirstCampus4F.js');
const second2=read('./src/world/zones/SecondCampus2F.js');

assert(routes.includes('FIRST_FLOORS=[1,2,3,4,8]'));
assert(routes.includes('SECOND_FLOORS=[1,2,5]'));
assert(routes.includes('second_campus_4f_story'));
assert(!routes.includes('second_4f_lift'),'Second-campus story 4F must have no elevator button');
assert(!routes.includes('second_4f_stairs'),'Second-campus story 4F must have no stair button');
assert(router.includes("'second_campus_4f_story': SecondCampusStandardFloor"));
assert(router.includes("else if (f === 2) label = '2F 急診'"));
assert(!router.includes('2F 急診與封閉病房'));
assert(first1.includes('this.gf.materials.glass'));
assert(first1.includes('門診藥局／藥庫'));
assert(first1.includes('1F_MAIN_DOOR'));
assert(first2.includes("type: 'acute_gate'"));
assert(first2.includes('this.setAcuteGateClosed(true)'));
assert(first2.includes("title: '2F 急診'"));
assert(first4.includes('doorMaterial: this.gf.materials.metal'));
assert(first4.includes('this.setWardGateClosed(true)'));
assert(travel.includes('new THREE.Box3().setFromObject(doorLeaf)'),'Stair doors require physical colliders');
assert(!second2.includes('for(let i=0;i<6;i++)solid'),'No modeled indoor stair flight should remain');

console.log('HOSPITAL ACCESS POLICY PASS: floor lists, hidden 4F story scene, closed ward gates, glass night closures, menu-only stairs');
