// main.js - Night Corridor Act 1
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { preloadAssets } from './art/AssetRegistry.js';
import { preloadMaterials } from './art/MaterialRegistry.js';

RectAreaLightUniformsLib.init();
await Promise.all([preloadAssets(), preloadMaterials()]);
import { gameState } from './core/GameState.js';
import { DutyEventManager } from './core/DutyEventManager.js';
import { Level3FBlockout } from './world/Level3FBlockout.js';
import { applyAct1CollisionHotfix } from './world/CollisionHotfix.js';
import { FPSController } from './player/FPSController.js';
import { UIManager } from './ui/UIManager.js';
import { soundManager } from './audio/SoundManager.js';

// Setup Three.js Scene & Renderer
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x201c19);
scene.fog = new THREE.FogExp2(0x2a2522, 0.018);

const camera = new THREE.PerspectiveCamera(
  68,
  window.innerWidth / window.innerHeight,
  0.1,
  220
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);
const reflectionRoom = new RoomEnvironment();
const reflectionGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = reflectionGenerator.fromScene(reflectionRoom, .04).texture;
scene.environmentIntensity = .25;
reflectionRoom.dispose();
reflectionGenerator.dispose();
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());

import { WorldRouter } from './world/WorldRouter.js';

// Instantiate FPS Controller
const controller = new FPSController(
  camera,
  renderer.domElement,
  [],
  [],
  []
);

// Instantiate World Router
const worldRouter = new WorldRouter(scene, camera, controller);
window.worldRouter = worldRouter;
const dutyEvents = new DutyEventManager(gameState);

// Instantiate UI Manager
let uiManager;
uiManager = new UIManager(
  gameState,
  () => {
    // On modal close, resume player controls
    controller.enabled = true;
    setTimeout(() => {
      const overlayActive =
        document.querySelector('.modal-overlay.active') ||
        document.querySelector('.cutscene-overlay.active');

      if (
        controller.enabled &&
        !overlayActive &&
        document.pointerLockElement !== renderer.domElement
      ) {
        renderer.domElement.requestPointerLock();
      }
    }, 100);
  },
  () => {
    // Elevator cutscene finish callback
    controller.enabled = true;
    renderer.domElement.requestPointerLock();
  }
);

// Setup Raycast Hover & Interaction
controller.onHoverChange = (interactable) => {
  if (interactable) {
    uiManager.showPrompt(`[E] ${interactable.label}  ·  雙擊走近`);
  } else {
    uiManager.showPrompt(null);
  }
};

controller.onInteract = (interactable) => {
  console.log('Interacting with:', interactable);

  if (interactable.type === 'access_door') {
    const door=worldRouter.activeZoneInstance.accessDoors?.[interactable.doorId];
    if(!door)return;
    if(door.portal){
      controller.enabled=false;controller.cancelAutoMove();
      uiManager.runDoorTransition(()=>worldRouter.teleportToSpawn(door.portal));
    }else{
      if(interactable.doorId==='3F_ARCHIVE_DOOR'&&!gameState.getFlag('ARCHIVE_OBJECTIVE')){
        soundManager.playClick();
        uiManager.showSubtitle('李醫師','「文史館？今晚的正常交班流程沒有提到這裡。先把 316 的交班做完。」',3200);
        return;
      }
      if(!gameState.getFlag('STAFF_ACCESS_CARD')){
        soundManager.playClick();
        uiManager.showSubtitle('門禁','「需要先到 316 領取值班室鑰匙與感應卡。」',2800);
        controller.currentInteractable=null;uiManager.showPrompt(null);
        return;
      }
      const changed=door.toggle(controller.position);
      if(changed)soundManager.playClick();
      else uiManager.showSubtitle('門禁','請離開門幅後再關門。',2500);
      const zone=worldRouter.activeZoneInstance;
      if(door===zone.wardDoor)zone.wardGateClosed=door.closed;
      if(door===zone.dutyDoor)zone.dutyDoorClosed=door.closed;
      if(door===zone.acuteGateDoor)zone.acuteGateClosed=door.closed;
    }
    controller.currentInteractable=null;uiManager.showPrompt(null);
  } else if (interactable.type === 'duty_door') {
    if(interactable.doorId==='3F_ARCHIVE_DOOR'){
      const zone=worldRouter.activeZoneInstance;
      const keyedDoor=zone.keyedDoors?.[interactable.doorId];
      if(!keyedDoor)return;
      if(!gameState.getFlag('ARCHIVE_OBJECTIVE')){
        soundManager.playDoorLockClack();
        uiManager.showSubtitle('李醫師','「打不開。門上也沒有牌子……」',2400);
        return;
      }
      if(!gameState.getFlag('ARCHIVE_ACCESS_KEY')){
        gameState.setFlag('ARCHIVE_LOCKED_SEEN',true);
        soundManager.playDoorLockClack();
        uiManager.showSubtitle('李醫師','「打不開……鑰匙呢？」',2600);
        return;
      }
      const changed=keyedDoor.toggle(controller.position);
      if(changed)soundManager.playClick();
      else uiManager.showSubtitle('門鎖','請先離開門幅後再關門。',2500);
      controller.currentInteractable=null;uiManager.showPrompt(null);
      return;
    }
    if (!gameState.isTaskComplete('KEY_PICKUP')) {
      soundManager.playClick();
      uiManager.showSubtitle('李醫師','「這是傳統喇叭鎖，先去 316 拿值班室鑰匙與感應卡。」',3000);
      return;
    }
    const zone=worldRouter.activeZoneInstance;
    const keyedDoor=zone.keyedDoors?.[interactable.doorId] || (interactable.doorId==='duty_room'?zone.dutyDoor:null);
    if(!keyedDoor)return;
    const changed=keyedDoor.toggle(controller.position);
    if(changed)soundManager.playClick();
    else uiManager.showSubtitle('門鎖','請先離開門幅後再關門。',2500);
    if(keyedDoor===zone.dutyDoor)zone.dutyDoorClosed=keyedDoor.closed;
    controller.currentInteractable = null;
    uiManager.showPrompt(null);
  } else if (interactable.type === 'spare_key_316') {
    if(!gameState.getFlag('FOUND_316_SPARE_KEY')){
      gameState.setFlag('FOUND_316_SPARE_KEY',true);
      gameState.markTaskComplete('FOUND_316_SPARE_KEY');
      if(interactable.targetGroup)interactable.targetGroup.visible=false;
      interactable.interactable=false;
      soundManager.playKeyPickup();
      uiManager.showSubtitle('李醫師','「警衛查哨點裡真的留了 316 的備援鑰匙。先回去開門。」',3200);
      uiManager.showPrompt(null);
    }
  } else if (interactable.type === 'office_316_door') {
    if(!gameState.getFlag('FOUND_316_SPARE_KEY')){
      soundManager.playClick();
      uiManager.showSubtitle('316 總醫師辦公室','門鎖著。學長說過可以先去警衛查哨點看看。',3200);
      return;
    }
    if(!gameState.getFlag('OPENED_316')){
      const opened=worldRouter.activeZoneInstance.open316Door?.();
      if(opened){
        gameState.setFlag('OPENED_316',true);
        gameState.markTaskComplete('OPENED_316');
        soundManager.playClick();
        uiManager.showSubtitle('李醫師','「開了。先找值班手冊，學長應該有留下交班方式。」',3200);
      }
    }
  } else if (interactable.type === 'locker_316') {
    if(!gameState.isTaskComplete('DUTY_LOG')){
      soundManager.playClick();
      uiManager.showSubtitle('李醫師','「四位數電子鎖……先看看桌上的值班手冊有沒有寫什麼。」',3000);
      return;
    }
    controller.enabled=false;
    uiManager.openLocker();
  } else if (interactable.type === 'key') {
    if (!gameState.isTaskComplete('KEY_PICKUP')) {
      soundManager.playKeyPickup();
      gameState.markTaskComplete('KEY_PICKUP');
      uiManager.showSubtitle('李醫師', '「拿到值班室鑰匙與感應卡了。」');
      if (interactable.targetGroup) {
        interactable.targetGroup.visible = false;
      }
      interactable.interactable = false;
      uiManager.showPrompt(null);
      checkElevatorReady();
    }
  } else if (interactable.type === 'office_302_inspect') {
    controller.enabled=false;
    uiManager.open302Inspect();
  } else if (interactable.type === 'office_302_keypad') {
    if(gameState.getFlag('OFFICE_302_UNLOCKED')){
      worldRouter.activeZoneInstance.unlock302?.();
      return;
    }
    if(!gameState.getFlag('INTERACTED_302')){
      gameState.setFlag('INTERACTED_302',true);
      soundManager.playDoorLockClack();
      uiManager.showSubtitle('李醫師','「鎖上了……需要四位數密碼。看來跟對面的夜間告示有關。」',3200);
    }
    controller.enabled=false;
    uiManager.open302Keypad();
  } else if (interactable.type === 'museum_key_302') {
    if(!gameState.getFlag('OFFICE_302_UNLOCKED'))return;
    if(!gameState.getFlag('ARCHIVE_ACCESS_KEY')){
      gameState.setFlag('ARCHIVE_ACCESS_KEY',true);
      gameState.markTaskComplete('ARCHIVE_KEY_FOUND');
      if(interactable.targetGroup)interactable.targetGroup.visible=false;
      interactable.interactable=false;
      soundManager.playKeyPickup();
      uiManager.showSubtitle('李醫師','「黃銅牌只刻了兩個字：『文史』……」',3000);
      uiManager.showPrompt(null);
    }
  } else if (interactable.type === 'office_phone_316') {
    if(gameState.getFlag('PHONE_RING_ACTIVE')&&!gameState.getFlag('PHONE_ANSWERED')){
      gameState.setFlag('PHONE_ANSWERED',true);
      gameState.setFlag('PHONE_RING_ACTIVE',false);
      soundManager.playClick();
      soundManager.duckAmbient(.18,4300);
      uiManager.showSubtitle('電話','（三秒雜音）\n「……你還在三樓嗎？」\n嘟——　嘟——　嘟——',4300);
    }else{
      uiManager.showSubtitle('李醫師','「普通的院內電話。」',1800);
    }
  } else if (interactable.type === 'cpr_anne') {
    const stage=gameState.getFlag('ANNE_STAGE')||0;
    uiManager.showSubtitle('李醫師',stage===0?'「CPR 訓練用假人安妮。新的，看起來還沒怎麼用過。」':'「……剛才它是這個方向嗎？」',2600);
  } else if (interactable.type === 'duty_log') {
    if(!gameState.getFlag('OPENED_316'))return;
    controller.enabled = false;
    uiManager.openDutyLog();
    checkElevatorReady();
  } else if (interactable.type === 'credential_drawer_316') {
    if(!gameState.getFlag('OPENED_316'))return;
    if(!gameState.getFlag('HIS_CREDENTIALS')){
      gameState.setFlag('HIS_CREDENTIALS',true);
      gameState.markTaskComplete('HIS_CREDENTIALS_FOUND');
      soundManager.playPaperSign();
    }
    controller.enabled=false;
    uiManager.openArchiveDocument({title:interactable.documentTitle,pages:interactable.pages});
  } else if (interactable.type === 'workstation') {
    controller.enabled = false;
    uiManager.openWorkstation();
    if(!gameState.getFlag('HIS_CREDENTIALS')){
      uiManager.showSubtitle('李醫師','「但是我沒有帳號密碼……」',2800);
    }
    checkElevatorReady();
  } else if (interactable.type === 'archive_document') {
    controller.enabled = false;
    uiManager.openArchiveDocument({title:interactable.documentTitle,pages:interactable.pages});
    gameState.addEvidence(1);
    if(interactable.id==='ARCHIVE_UNINDEXED_HANDOFF'&&gameState.getFlag('ARCHIVE_OBJECTIVE')){
      gameState.markTaskComplete('ARCHIVE_CLUE_FOUND');
      gameState.setFlag('ARCHIVE_CLUE_FOUND',true);
      gameState.setFlag('ANNE_STAGE',2);
      gameState.setFlag('GUARD_FUTURE_ENTRY',true);
      worldRouter.activeZoneInstance?.syncHorrorState?.();
    }
  } else if (interactable.type === 'acute_gate') {
    const changed = worldRouter.activeZoneInstance.toggleAcuteGate(controller.position);
    if (changed) {
      soundManager.playClick();
    } else {
      uiManager.showSubtitle('門禁', '請先離開鐵門門幅，再刷卡關門。', 2500);
    }
    controller.currentInteractable = null;
    uiManager.showPrompt(null);
  } else if (interactable.type === 'exit_door' || interactable.type === 'closed_door') {
    soundManager.playClick();
    if (interactable.id === '1F_MAIN_DOOR') {
      uiManager.showSubtitle('李醫師', '「值班時間都會關起來，出不去。」', 3500);
    } else if (interactable.id === '1F_PHARM_GATE') {
      uiManager.showSubtitle('李醫師', '「夜間門診藥局已打烊，非急診調劑時段不開放。」', 3500);
    } else if (interactable.id === '2F_ACUTE_GATE') {
      uiManager.showSubtitle('李醫師', '「2F 急診封閉式病房區，夜間門禁管制鎖定中。」', 3500);
    } else {
      uiManager.showSubtitle('李醫師', interactable.subtitle || '「夜間門禁管制時間，此區域暫不開放。」', 3000);
    }
  } else if (interactable.type === 'elevator' || interactable.type === 'travel_selector') {
    if(!gameState.getFlag('STAFF_ACCESS_CARD')){
      soundManager.playClick();
      uiManager.showSubtitle('門禁','「電梯與安全梯尚未授權。先到總醫師辦公室領取感應卡。」',2800);
      return;
    }
    controller.enabled = false;
    uiManager.openTravelSelector(worldRouter.floorDestinations(interactable.kind), worldRouter.activeZoneId, destination => {
      if (destination.zoneId === 'first_campus_4f') gameState.markTaskComplete('WARD_ENTRY');
      worldRouter.loadZone(destination.zoneId, destination.spawn);
      const dutyLine=dutyEvents.onZoneEntered(destination.zoneId);
      if(dutyLine)uiManager.showSubtitle(dutyLine.speaker,dutyLine.text);
      controller.enabled = true;
    }, interactable.kind);
  } else if (interactable.type === 'p1_action') {
    const action=interactable.action;
    if(action==='NURSE_REPORT'){
      if(!gameState.isTaskComplete('WARD_ENTRY')) return uiManager.showSubtitle('李醫師','「先正式抵達 4F 再報到。」',2500);
      dutyEvents.complete('P1_4F_REPORT','17:15');
      uiManager.showSubtitle('晚班護理師','「醫師晚安，今天目前都還算穩定。403 昨晚比較睡不好，406 下午有點焦慮，408 晚點再追一下血壓。」');
    } else if(action==='DUTY_ROOM_PREP'){
      if(!gameState.isTaskComplete('P1_4F_REPORT')) return uiManager.showSubtitle('李醫師','「先去護理站報到。」',2500);
      dutyEvents.complete('P1_DUTY_ROOM_READY','17:30');
      uiManager.showSubtitle('李醫師','「東西放好了，床也整理一下。值班電話正常。」');
    } else if(action==='WARD_ROUND'){
      if(!gameState.isTaskComplete('P1_DUTY_ROOM_READY')) return uiManager.showSubtitle('李醫師','「先把值班室整理好再巡房。」',2500);
      dutyEvents.complete('P1_ROUND_COMPLETE','18:00');
      uiManager.showSubtitle('值班電話','☎ 護理站：「醫師，403 說睡不著，可以來看一下嗎？」');
    } else if(action==='INSOMNIA_403'){
      if(!gameState.isTaskComplete('P1_ROUND_COMPLETE')) return uiManager.showSubtitle('李醫師','「先完成晚間巡房。」',2500);
      dutyEvents.complete('P1_INSOMNIA_DONE','18:30');
      uiManager.showSubtitle('403 病人','「醫師，我一直睡不著。」');
    } else if(action==='NORMAL_EVENT'){
      if(!gameState.isTaskComplete('P1_INSOMNIA_DONE')) return uiManager.showSubtitle('李醫師','「先處理 403 的睡眠問題。」',2500);
      dutyEvents.complete('P1_NORMAL_EVENT_DONE','19:30');
      uiManager.showSubtitle('晚班護理師',`「19 點這位病人有些${dutyEvents.normalEvent.label}，目前處理完都穩定。」`);
    } else if(action==='REST'){
      if(!gameState.isTaskComplete('P1_NORMAL_EVENT_DONE')) return uiManager.showSubtitle('李醫師','「先把剛才的病房事件處理完。」',2500);
      dutyEvents.complete('P1_REST_DONE','20:00');
      uiManager.showSubtitle('值班電話','☎ 急診：「醫師您好，急診有一位病人需要精神科評估，可以麻煩下來嗎？」');
    } else if(action==='ER_ASSESS'){
      if(!gameState.isTaskComplete('P1_REST_DONE')) return uiManager.showSubtitle('李醫師','「目前沒有急診會診任務。」',2500);
      dutyEvents.complete('P1_ER_ASSESSMENT_DONE','20:25');
      uiManager.showSubtitle('急診病人','「最近壓力很大，兩天睡不好，今晚一直心悸，很焦慮。」');
    } else if(action==='ER_NOTE'){
      if(!gameState.isTaskComplete('P1_ER_ASSESSMENT_DONE')) return uiManager.showSubtitle('李醫師','「先完成病人評估。」',2500);
      dutyEvents.complete('P1_ER_NOTE_DONE','20:30');
      uiManager.showSubtitle('李醫師','「急診評估紀錄完成，回 4F。」');
    } else if(action==='END_SHIFT'){
      if(!gameState.isTaskComplete('P1_RETURN_4F')) return uiManager.showSubtitle('李醫師','「還沒到可以休息的時候。」',2500);
      dutyEvents.complete('ACT1_NORMAL_FLOW','21:00');
      uiManager.showSubtitle('李醫師','「目前都處理完了。先躺一下吧。」');
    }
    controller.currentInteractable=null;uiManager.showPrompt(null);
  } else if (interactable.type === 'ward_gate') {
    const changed = worldRouter.activeZoneInstance.toggleWardGate(controller.position);
    if (changed) soundManager.playClick();
    else uiManager.showSubtitle('門禁', '請先離開門口，再刷卡關門。', 2500);
    controller.currentInteractable = null;
    uiManager.showPrompt(null);
  }
};

function checkElevatorReady() {
  const ready = gameState.areRequiredTasksComplete();
  if (worldRouter.activeZoneInstance?.updateElevatorLight) {
    worldRouter.activeZoneInstance.updateElevatorLight(ready);
  }
}

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);

  controller.update(delta);
  worldRouter.update();
  composer.render();
}

// URL parameters for QA and visual capture
const urlParams = new URLSearchParams(window.location.search);
const zoneParam = urlParams.get('zone');
const spawnParam = urlParams.get('spawn');
const camPreset = urlParams.get('cam');

if (zoneParam || spawnParam) {
  worldRouter.loadZone(zoneParam || 'first_campus_3f', spawnParam);
  if (urlParams.has('x') && urlParams.has('z')) {
    controller.teleport(
      parseFloat(urlParams.get('x')),
      parseFloat(urlParams.get('y') || controller.eyeHeight),
      parseFloat(urlParams.get('z')),
      parseFloat(urlParams.get('yaw') || 0)
    );
    if (urlParams.has('pitch')) {
      controller.pitch = parseFloat(urlParams.get('pitch'));
      controller.updateCameraRotation();
    }
  }
} else if (camPreset === '316_entrance') {
  worldRouter.loadZone('first_campus_3f');
  controller.teleport(2.1, controller.eyeHeight, 0.4, Math.PI);
  controller.pitch = 0.0;
  controller.updateCameraRotation();
} else if (camPreset === '3f_corridor' || camPreset === 'corridor') {
  worldRouter.loadZone('first_campus_3f');
  controller.teleport(-2.5, controller.eyeHeight, 0.0, -Math.PI / 2);
  controller.pitch = 0.0;
  controller.updateCameraRotation();
} else if (camPreset === 'his_workstation' || camPreset === 'workstation') {
  worldRouter.loadZone('first_campus_3f');
  controller.teleport(9.0, controller.eyeHeight, 5.5, -Math.PI / 2);
  setTimeout(() => { uiManager.openWorkstation(); }, 300);
} else if (camPreset === '4f_arrival_signage' || camPreset === 'elevator') {
  worldRouter.loadZone('first_campus_3f');
  controller.teleport(-4.2, controller.eyeHeight, 0.0, Math.PI / 2);
  controller.pitch = 0.05;
  controller.updateCameraRotation();
} else if (camPreset === 'duty_room_sign') {
  worldRouter.loadZone('first_campus_3f');
  controller.teleport(1.25, 1.82, 1.05, Math.PI);
  controller.pitch = 0.0;
  controller.updateCameraRotation();
} else {
  worldRouter.loadZone('first_campus_3f', 'm0_316_entrance');
}

if (import.meta.env.DEV || urlParams.get('debug') === '1') {
  worldRouter.createDebugUI();
  window.renderResourceStats = () => ({ ...renderer.info.memory });
}

animate();
console.log('Night Corridor - Full World Modeling System Initialized.');
