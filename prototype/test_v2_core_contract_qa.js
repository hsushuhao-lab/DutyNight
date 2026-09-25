import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {WORLD_SPAWNS,ROUTE_PORTALS} from './src/world/shared/WorldRoutes.js';

const context=new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))});
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>context})};

const wardSource=readFileSync('./src/world/shared/WardFloorplan.js','utf8');
const mainSource=readFileSync('./src/main.js','utf8');
const routerSource=readFileSync('./src/world/WorldRouter.js','utf8');
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),null);
const ward=router.loadZone('first_campus_4f');

assert.equal(ward.bedAreas.length,32,'4F must generate exactly 32 physical census beds');
assert.deepEqual(ward.bedAreas.map(b=>b.id),Array.from({length:32},(_,i)=>`${401+Math.floor(i/4)}${'ABCD'[i%4]}`));
assert(!ward.bedAreas.some(b=>b.id==='409A'),'409A is a story clue, not a physical or census bed');
assert.equal(ward.bed33Legend?.bedId,'409A','the anomalous Bed 33 clue must remain');
assert(ward.keyedDoors['room_409']?.closed,'409 remains a closed room');
assert(!ward.zoneGroup.getObjectByName('Bed_409A'),'409A must not be rendered as an ordinary bed');

const actions=ward.interactables.filter(item=>item.type==='p1_action');
assert.equal(actions.find(item=>item.action==='INSOMNIA_403')?.anchorRoom,'403');
assert.equal(actions.find(item=>item.action==='NORMAL_EVENT')?.anchorBedId,'408C');
assert.doesNotMatch(mainSource,/KNOCK_403_49/,'403 cannot own the knock clue');
assert.match(mainSource,/registerBed33Clue\('KNOCK_408C_49'\)/,'408C must own the knock clue');

assert(!Object.values(WORLD_SPAWNS).some(spawn=>['hillside_route','ecology_pond'].includes(spawn.zoneId)),
  'production spawn registry must not expose outdoor zones');
assert(!ROUTE_PORTALS.some(portal=>['hillside_route','ecology_pond'].includes(WORLD_SPAWNS[portal.spawn]?.zoneId)),
  'production portals must stay indoors');
assert.doesNotMatch(routerSource,/HillsideRoute|EcologyPond|hillside_route|ecology_pond/,
  'production WorldRouter must not load outdoor gameplay zones');
console.log('DUTYNIGHT V2 CORE CONTRACT QA PASS');
