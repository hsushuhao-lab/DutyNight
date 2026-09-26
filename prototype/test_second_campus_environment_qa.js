import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';

const context=new Proxy({measureText:text=>({width:text.length*20})},{get:(target,key)=>target[key]||(()=>({addColorStop(){}}))});
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({width:0,height:0,getContext:()=>context})};
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),null);
const zone=router.loadZone('second_campus_2f');
for(const room of ['201','202','203'])assert(zone.roomAreas.some(area=>area.id===room));
for(const name of ['Second2F_GuardRestDesk','Second2F_SecurityControlDesk','Second2F_CCTVWall','Second2F_DoctorDutyDesk','Second2F_BridgeLobbyStand_1'])assert(zone.zoneGroup.getObjectByName(name),`${name} missing`);
assert(zone.interactables.some(item=>item.userData?.type==='security_monitor_anomaly'));
const b2=router.loadZone('b2_archive');
assert(b2.zoneGroup.getObjectByName('B2_ArchiveLegacyTerminal'));
assert(b2.zoneGroup.getObjectByName('B2_EscapeStairwell'));
assert.equal(b2.interactables.filter(item=>item.userData?.type==='b2_escape_stairs').length,1);
console.log('SECOND CAMPUS AND B2 ENVIRONMENT PASS');
