import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
import {WORLD_SPAWNS,ROUTE_PORTALS,FIRST_FLOORS,SECOND_FLOORS} from './src/world/shared/WorldRoutes.js';
global.document={addEventListener(){},querySelector(){return null;},createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})})})};
const camera=new THREE.PerspectiveCamera(),controller=new FPSController(camera,{addEventListener(){}},[],[],[]),scene=new THREE.Scene(),router=new WorldRouter(scene,camera,controller);
const canonical=[...FIRST_FLOORS.map(f=>`first_campus_${f}f`),'skybridge',...SECOND_FLOORS.map(f=>`second_campus_${f}f`),'hillside_route','ecology_pond'];
let spawns=0,rooms=0;
for(const id of canonical){
 const zone=router.loadZone(id);
 for(const door of Object.values(zone.accessDoors||{})) if(!door.portal) door.setClosed(false);
 for(const door of Object.values(zone.keyedDoors||{})) door.setClosed(false);
 if(id==='first_campus_2f'&&zone.setAcuteGateClosed)zone.setAcuteGateClosed(false);
 if(id==='first_campus_4f'&&zone.setWardGateClosed)zone.setWardGateClosed(false);
 for(const [key,spawn] of Object.entries(WORLD_SPAWNS).filter(([,v])=>v.zoneId===id)){
  router.teleportToSpawn(key);
  assert(!controller.checkCollision(controller.position.x,controller.position.z),`Spawn collider: ${key}`);
  assert.notEqual(controller.supportedHeight(controller.position.x,controller.position.z),null,`Spawn unsupported: ${key}`);spawns++;
 }
 for(const room of zone.roomAreas||[]){
  controller.teleport(...room.corridor);
  walk(room.point);walk(room.corridor);rooms++;
 }
 if(id.startsWith('second_campus_')&&/[3-8]f$/.test(id))assert.equal(zone.floor,Number(id.at(-2)));
}
function walk(point){
 for(let i=0;i<5000;i++){
  const dx=point[0]-controller.position.x,dz=point[2]-controller.position.z,d=Math.hypot(dx,dz);if(d<.025)return;
  const before=controller.position.clone();controller.moveWithCollision(dx/d*Math.min(.04,d),dz/d*Math.min(.04,d));
  assert(controller.position.distanceTo(before)>.001,`Controller stuck at ${controller.position.toArray()} toward ${point}`);
 }
 throw Error('Route did not terminate');
}
const probes={
 first_to_bridge:[[-1.6,1.7,0],[-.6,1.7,0]],bridge_to_first:[[1.6,1.7,0],[.6,1.7,0]],
 bridge_to_second:[[58.4,1.7,0],[59.3,1.7,0]],second_to_bridge:[[61.6,1.7,0],[60.7,1.7,0]],
 second_to_hill:[[72,1.55,-15.5],[72,1.4,-16.4]],hill_to_second:[[70.3,1.27,-18.5],[71.2,1.27,-18.23]],
 er_to_hill:[[28.2,1.7,0],[29.1,1.7,0]],hill_to_er:[[11.5,1.27,-34.55],[10.7,1.27,-34.79]],
 hill_to_pond:[[48.8,1.195,-33.5],[49.5,1.17,-34.375]],pond_to_hill:[[53,1.12,-36.8],[53,1.12,-35.85]],
};
for(const portal of ROUTE_PORTALS){
 router.loadZone(portal.from);controller.teleport(...probes[portal.id][0]);
 if(portal.gated){
  const door=Object.values(router.activeZoneInstance.accessDoors).find(d=>d.portal===portal.spawn);
  assert(door?.closed,`${portal.id}: missing closed access door`);
  router.update();assert.equal(router.activeZoneId,portal.from,`${portal.id}: proximity bypassed card access`);
  // Unit routing only: browser QA separately presses E on this door's real reader.
  router.teleportToSpawn(door.portal);
 }else{walk(probes[portal.id][1]);router.update();}
 assert.equal(router.activeZoneId,WORLD_SPAWNS[portal.spawn].zoneId,`${portal.id} transition failed`);
 router.update();assert.equal(router.activeZoneId,WORLD_SPAWNS[portal.spawn].zoneId,`${portal.id} arrival immediately bounces`);
}
router.loadZone('ecology_pond','pond_from_hill');walk([53,1.12,-41.5]);walk([56,1.34,-41.5]);walk([61,1.34,-42]);walk([56,1.34,-41.5]);walk([53,1.12,-41.5]);
router.activeZoneInstance.cleanup();
console.log(`PLAYABLE_WORLD PASS: ${canonical.length} canonical zones, ${spawns} supported spawns, ${rooms} actual-controller room round trips, ${ROUTE_PORTALS.filter(p=>!p.gated).length} automatic + ${ROUTE_PORTALS.filter(p=>p.gated).length} card-controlled portal routing checks, pond deck in/out`);
