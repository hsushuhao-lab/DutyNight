import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {FPSController} from './src/player/FPSController.js';
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const camera=new THREE.PerspectiveCamera(),controller=new FPSController(camera,{addEventListener(){}},[],[],[]);
const router=new WorldRouter(new THREE.Scene(),camera,controller);
let assertions=0;
const check=(name,fn)=>{fn();assertions++;console.log('PASS',name);};
function walk(a,b){controller.teleport(...a);for(let i=0;i<180;i++)controller.moveWithCollision((b[0]-a[0])/180,(b[2]-a[2])/180);assert(Math.hypot(controller.position.x-b[0],controller.position.z-b[2])<.05);}
let zone=router.loadZone('first_campus_1f');
for(const id of ['1F_PHARM_GATE','1F_OPD_GATE'])check(id+' fixed opaque night closure',()=>{const gate=zone.interactables.find(o=>o.userData.id===id);assert.equal(gate.material,zone.gf.materials.metal);assert.equal(gate.userData.type,'closed_door');assert.equal(gate.userData.locked,true);assert.equal(zone.accessDoors?.[id],undefined);});
check('1F lift portal has no suspended legacy board',()=>{const hits=[];zone.zoneGroup.traverse(o=>{if(o.isMesh&&o.position.x===-9&&o.position.z>7.7&&o.position.z<7.8)hits.push(o);});assert.equal(hits.length,0);});
zone=router.loadZone('first_campus_2f');
check('ER exterior frame has no second swinging door leaf',()=>{const frame=zone.zoneGroup.getObjectByName('Doorway_22_0');assert(frame);assert.equal(frame.children.filter(o=>o.geometry?.parameters?.height>2.5&&o.geometry?.parameters?.height<2.6).length,0);});
for(const id of ['ER_NURSE_ENTRY','ER_NURSE_BEDS'])check(id+' closed transparent card door',()=>{const gate=zone.accessDoors[id];assert(gate?.closed);assert(gate.leaves.every(l=>l.material.transparent&&l.material.opacity<.4));assert.equal(gate.readers.length,2);});
check('ER staff to bed route is actually connected through glass access',()=>{zone.accessDoors.ER_NURSE_ENTRY.setClosed(false);zone.accessDoors.ER_NURSE_BEDS.setClosed(false);walk([6.4,1.7,2.4],[6.4,1.7,6]);walk([6.4,1.7,6],[9.6,1.7,6]);});
for(const id of ['first_campus_4f','second_campus_5f']){
 zone=router.loadZone(id);const o=id.startsWith('first')?0:72,prefix=o?'second':'first';
 check(id+' outer gate at lift-lobby boundary',()=>{assert.equal(zone.wardDoor.root.position.z,2);assert.equal(zone.wardDoor.root.position.x,o);assert(controller.checkCollision(o,2));});
 check(id+' inner gate at ward boundary',()=>{assert.equal(zone.innerWardDoor.root.position.z,0);assert.equal(zone.innerWardDoor.root.position.x,o);assert(controller.checkCollision(o,0));});
 check(id+' side bays cannot bypass outer gate',()=>{for(const x of [-5,-2,2,5])assert(controller.checkCollision(o+x,2));});
 check(id+' nursing staff door is transparent glass',()=>{const d=zone.accessDoors[prefix+'_station_staff'];assert(d);assert.equal(d.readerSide,1);assert(d.leaves.every(l=>l.material.transparent&&l.material.opacity<.5));assert.equal(d.readers.length,2);});
 check(id+' entrance vestibule has storage and plant',()=>{assert(zone.roomAreas.some(r=>r.id==='STORE_ENTRY'));assert(zone.entrancePlant);});
}
zone=router.loadZone('second_campus_5f');
check('Second-campus V5 uses duty room, not physician office',()=>{assert(zone.roomAreas.some(r=>r.id==='SECOND_DUTY'&&r.label==='值班室'));assert(zone.accessDoors.second_duty_room?.closed);assert(!zone.roomAreas.some(r=>r.id==='DOCTOR'));});
check('Second-campus serial entry reaches ward only after both gates open',()=>{zone.setWardGateClosed(false);zone.setInnerWardGateClosed(false);walk([72,1.7,3.2],[72,1.7,1]);walk([72,1.7,1],[72,1.7,-1.2]);});
check('Station glass door opens into protected station',()=>{const d=zone.accessDoors.second_station_staff;const x=d.root.position.x,z=d.root.position.z;d.setClosed(false);walk([x,1.7,z+1.1],[x,1.7,z-1.2]);});
zone=router.loadZone('first_campus_4f');
check('Duty-room cabinet doors face room, not wall',()=>{assert.equal(zone.dutyCabinetYaw,Math.PI);const source=zone.dutyCabinetAnchor;assert(source[2]<9.8);assert(!controller.checkCollision(source[0],source[2]-.9));});
console.log(`SCREENSHOT ACCESS V5 REGRESSION PASS ${assertions}/${assertions}`);
