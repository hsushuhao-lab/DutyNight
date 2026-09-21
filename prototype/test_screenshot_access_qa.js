import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const camera=new THREE.PerspectiveCamera(),controller=new FPSController(camera,{addEventListener(){}},[],[],[]);
const router=new WorldRouter(new THREE.Scene(),camera,controller);
let assertions=0;
const check=(name,fn)=>{fn();assertions++;console.log('PASS',name);};
function walk(a,b){controller.teleport(...a);for(let i=0;i<150;i++)controller.moveWithCollision((b[0]-a[0])/150,(b[2]-a[2])/150);assert(Math.hypot(controller.position.x-b[0],controller.position.z-b[2])<.04);}
let zone=router.loadZone('first_campus_1f');
for(const id of ['1F_PHARM_GATE','1F_OPD_GATE'])check(id+' fixed opaque night closure',()=>{const gate=zone.interactables.find(o=>o.userData.id===id);assert.equal(gate.material,zone.gf.materials.metal);assert.equal(gate.userData.type,'closed_door');assert.equal(gate.userData.locked,true);assert.equal(zone.accessDoors?.[id],undefined);});
check('1F lift portal has no suspended legacy board',()=>{const hits=[];zone.zoneGroup.traverse(o=>{if(o.isMesh&&o.position.x===-9&&o.position.z>7.7&&o.position.z<7.8)hits.push(o);});assert.equal(hits.length,0);});
zone=router.loadZone('first_campus_2f');
check('ER exterior frame has no second swinging door leaf',()=>{const frame=zone.zoneGroup.getObjectByName('Doorway_22_0');assert(frame);assert.equal(frame.children.filter(o=>o.geometry?.parameters?.height>2.5&&o.geometry?.parameters?.height<2.6).length,0);});
for(const id of ['ER_NURSE_ENTRY','ER_NURSE_BEDS'])check(id+' closed transparent card door',()=>{const gate=zone.accessDoors[id];assert(gate?.closed);assert(gate.leaves.every(l=>l.material.transparent&&l.material.opacity<.4));assert.equal(gate.readers.length,2);});
check('ER staff to bed route is actually connected through glass access',()=>{zone.accessDoors.ER_NURSE_ENTRY.setClosed(false);zone.accessDoors.ER_NURSE_BEDS.setClosed(false);walk([6.4,1.7,2.4],[6.4,1.7,6]);walk([6.4,1.7,6],[9.6,1.7,6]);});
for(const id of ['first_campus_4f','second_campus_5f']){
 zone=router.loadZone(id);const o=id.startsWith('first')?0:72;
 check(id+' gate at lift-lobby boundary, no parallel corridor',()=>{assert.equal(zone.wardDoor.root.position.z,2);assert.equal(zone.wardDoor.root.position.x,o);assert(controller.checkCollision(o,2));});
 check(id+' side bays cannot bypass main gate',()=>{for(const x of [-5,-2,2,5])assert(controller.checkCollision(o+x,2));});
 check(id+' staff reader is mounted on left post above counter',()=>{const d=zone.accessDoors[(o?'second':'first')+'_station_staff'];assert.equal(d.readerSide,-1);assert.equal(d.readers.length,2);for(const r of d.readers){const p=r.parent.position;assert(p.x<0);assert(p.y>=1.35);assert(d.readerMounts.includes(r.parent.parent.children.find(m=>m.userData?.readerMount)));}});
}
zone=router.loadZone('second_campus_5f');
check('Second-campus ward entry opens into protected station',()=>{assert.equal(zone.station.position[1],-4);zone.setWardGateClosed(false);walk([72,1.7,3.2],[72,1.7,.6]);assert.equal(zone.accessDoors.second_station_staff.closed,true);});
check('Station exit remains separate from main admission gate',()=>{assert(controller.checkCollision(74.3,-4));zone.accessDoors.second_station_staff.setClosed(false);walk([72,1.7,-2.5],[74.3,1.7,-2.5]);walk([74.3,1.7,-2.5],[74.3,1.7,-5.4]);});
zone=router.loadZone('first_campus_4f');
check('Duty-room cabinet doors face room, not wall',()=>{assert.equal(zone.dutyCabinetYaw,Math.PI);const source=zone.dutyCabinetAnchor;assert(source[2]<9.8);assert(!controller.checkCollision(source[0],source[2]-.9));});
console.log(`SCREENSHOT ACCESS REGRESSION PASS ${assertions}/${assertions}`);
