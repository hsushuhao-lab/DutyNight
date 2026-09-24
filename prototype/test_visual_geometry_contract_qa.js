import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {WorldRouter} from './src/world/WorldRouter.js';
import {gameState} from './src/core/GameState.js';

const context=new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))});
global.document={
  querySelector:()=>null,
  addEventListener(){},
  createElement:(tag)=>tag==='canvas'?{width:0,height:0,getContext:()=>context}:{getContext:()=>context}
};

const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),null);

// 4F: paperwork must sit on real workstation tops; keyed doors must have explicit inward swing.
let zone=router.loadZone('first_campus_4f');
for(const [name,expectedY] of [['Bed33_HIS409Sheet',.82],['Bed33_AssignmentForm',.82]]){
  const obj=zone.zoneGroup.getObjectByName(name);
  assert(obj,`${name} missing`);
  const box=new THREE.Box3().setFromObject(obj);
  assert(Math.abs(box.min.y-expectedY)<.005,`${name} floats: bottom=${box.min.y}, expected ${expectedY}`);
}
assert.equal(zone.dutyDoor?.openDirection,1,'4F duty-room door must swing inward');
assert.equal(zone.dutyBathroomDoor?.openDirection,1,'4F bathroom door must swing inward');
assert.equal(zone.keyedDoors['room_409']?.openDirection,-1,'409 west-wall patient door must swing into the room');

// 3F: admin door swings inward and 21:17 checkpoint is a two-step visible interaction.
gameState.resetForLoop();
zone=router.loadZone('first_campus_3f');
assert.equal(zone.keyedDoors['3F_ADMIN_OFFICE_DOOR']?.openDirection,1,'3F administrative-office door must swing inward');
gameState.setFlag('NIGHT_PATROL_RETURN_3F',true);
zone.applyGamePhase('Phase3_2117_NightPatrol',gameState);
assert.equal(zone.guardSign2117?.userData?.interactable,true,'21:17 checkpoint sign must be interactable');
assert.equal(zone.guardLog2117?.visible,true,'21:17 logbook must be physically visible');
assert.equal(zone.guardLog2117?.userData?.interactable,false,'21:17 logbook must require noticing the sign first');

// 2F: the 00:33 terminal must be dormant during the first ER visit.
gameState.resetForLoop();
zone=router.loadZone('first_campus_2f');
assert.equal(zone.ghostRegistrationTerminal?.userData?.interactable,false,'00:33 terminal leaked before bootstrap');
gameState.setFlag('GHOST_REGISTRATION_AVAILABLE',true);
zone.syncStoryState();
assert.equal(zone.ghostRegistrationTerminal?.userData?.interactable,true,'00:33 terminal did not activate after the story gate');

// Second-campus transfer paperwork also belongs on a desk.
zone=router.loadZone('second_campus_5f');
const transfer=zone.zoneGroup.getObjectByName('SecondCampus_ChestTransferForm');
assert(transfer,'Second-campus transfer form missing');
assert(Math.abs(new THREE.Box3().setFromObject(transfer).min.y-.82)<.005,'Second-campus transfer form must sit on workstation surface');

const signAnchor=readFileSync('./src/world/shared/SignAnchor.js','utf8');
assert(signAnchor.includes("header = '青嶺醫療中心 ｜ 臨床醫療區'"),'Default room signage must use the fictional Qingling name');
assert(!signAnchor.includes("header = '松德醫療中心"),'Default room signage must not expose the real-hospital name');

console.log('VISUAL GEOMETRY + STORY GATING CONTRACT QA PASS');
