import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {WorldRouter} from './src/world/WorldRouter.js';
import {WORLD_SPAWNS,ROUTE_PORTALS} from './src/world/shared/WorldRoutes.js';
import {gameState} from './src/core/GameState.js';

const context=new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))});
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({getContext:()=>context})};

const wardSource=readFileSync('./src/world/shared/WardFloorplan.js','utf8');
const mainSource=readFileSync('./src/main.js','utf8');
const routerSource=readFileSync('./src/world/WorldRouter.js','utf8');
const uiSource=readFileSync('./src/ui/UIManager.js','utf8');
const router=new WorldRouter(new THREE.Scene(),new THREE.PerspectiveCamera(),null);
const ward=router.loadZone('first_campus_4f');

assert.equal(ward.bedAreas.length,32,'4F must generate exactly 32 physical census beds');
assert.deepEqual(ward.bedAreas.map(b=>b.id),Array.from({length:32},(_,i)=>`${401+Math.floor(i/4)}${'ABCD'[i%4]}`));
assert(!ward.bedAreas.some(b=>b.id==='409A'),'409A is a story clue, not a physical or census bed');
assert.equal(ward.bed33Legend?.bedId,'409A','the anomalous Bed 33 clue must remain');
assert(ward.keyedDoors['room_409']?.closed,'409 remains a closed room');
assert(!ward.zoneGroup.getObjectByName('Bed_409A'),'409A must not be rendered as an ordinary bed');

const actions=ward.interactables.map(item=>item.userData??item).filter(item=>item.type==='p1_action');
for(const retired of ['DUTY_ROOM_PREP','WARD_ROUND','INSOMNIA_403'])assert(!actions.some(item=>item.action===retired),retired+' must not survive the simplified 4F flow');
assert.equal(actions.find(item=>item.action==='NURSE_REPORT')?.id,'4F_NURSING_REPORT');
const reportTarget=ward.interactables.find(item=>(item.userData??item).id==='4F_NURSING_REPORT');
assert(reportTarget&&!reportTarget.isObject3D,'the 17:15 report target must not render a box over the handover board');
assert.equal(reportTarget.radius,2.1,'the 17:15 report prompt must cover the accessible nursing-station counter');
assert.equal(actions.find(item=>item.action==='NORMAL_EVENT')?.id,'408C_BED_PLAQUE');
assert.equal(actions.find(item=>item.action==='END_SHIFT')?.id,'4F_DUTY_COMPUTER','21:00 rest must use the physical duty-room computer');
assert.doesNotMatch(mainSource,/KNOCK_403_49/,'403 cannot own the knock clue');
assert.match(mainSource,/registerBed33Clue\('KNOCK_408C_49'\)/,'408C must own the knock clue');
assert.match(uiSource,/19:30 查看 408C 反映的敲牆聲/,'the duty board must identify the real 408C event');
assert.doesNotMatch(uiSource,/19:30 處理一般病房事件/,'the stale generic event label must not return');
const handoverBoard=ward.zoneGroup.getObjectByName('FourF_NursingHandoverBoard');
assert.deepEqual(handoverBoard.position.toArray(),[-2,1.78,-8.495],'handover board must return to its original north wall');
assert(!ward.zoneGroup.children.some(object=>object.name==='ArtAsset/storageCabinet'&&Math.abs(object.position.x+3.6)<.01&&Math.abs(object.position.z+1.2)<.01),'the green station cabinet must be removed from the chair path');
assert(!ward.zoneGroup.getObjectByName('WorkstationChair_first_station_C'),'the green chair back must not block the 4F handover board');
assert.deepEqual(handoverBoard.userData.text,[
  '第一線：李住院醫師　｜　總醫師：316 室',
  '病房現況：滿床 32 床　｜　408C：防跌倒、易躁動',
  '特別交班：409 封閉整修，禁止推床入內'
]);
assert(ward.zoneGroup.getObjectByName('FourF_StationGreenHandoverBinder'));
assert(ward.zoneGroup.getObjectByName('FourF_StationBlueHandoverBinder'));
assert(ward.zoneGroup.getObjectByName('FourF_StationTissueBox'));

assert(!Object.values(WORLD_SPAWNS).some(spawn=>['hillside_route','ecology_pond'].includes(spawn.zoneId)),
  'production spawn registry must not expose outdoor zones');
assert(!ROUTE_PORTALS.some(portal=>['hillside_route','ecology_pond'].includes(WORLD_SPAWNS[portal.spawn]?.zoneId)),
  'production portals must stay indoors');
assert.doesNotMatch(routerSource,/HillsideRoute|EcologyPond|hillside_route|ecology_pond/,
  'production WorldRouter must not load outdoor gameplay zones');
const lobby=router.loadZone('first_campus_1f');
assert(lobby.interactables.includes(lobby.guardPostObject),'the guard post itself must be a physical interactable');
assert.equal(lobby.guardPostObject.userData.type,'guard_post_inspection');
assert.equal(lobby.hiddenServiceHit.userData.interactable,false,'the concealed door stays hidden before guard-post inspection');
assert.equal(lobby.hiddenServiceFrame.visible,false,'the concealed metal frame stays hidden before guard-post inspection');
gameState.setFlag('HIDDEN_SERVICE_DOOR_DISCOVERED',true);
lobby.syncStoryState();
assert.equal(lobby.guardPostObject.userData.interactable,false,'the inspected guard post yields focus to the revealed door');
assert.equal(lobby.hiddenServiceHit.userData.interactable,true,'the revealed door hitbox updates without reloading 1F');
assert.equal(lobby.hiddenServiceFrame.visible,true,'the discovered service door gains a visible metal frame');
assert.equal(lobby.hiddenServiceLed.visible,true,'the purple service-panel indicator reveals with the door');
const revisitedLobby=router.loadZone('first_campus_1f');
assert.equal(revisitedLobby.guardPostObject.userData.interactable,false,'the inspected guard post stays resolved after returning to 1F');
assert.equal(revisitedLobby.hiddenServiceHit.userData.interactable,true,'the service-door interaction persists after returning to 1F');
assert.equal(revisitedLobby.hiddenServiceFrame.visible,true,'the visible service-door frame persists after returning to 1F');
console.log('DUTYNIGHT V2 CORE CONTRACT QA PASS');
