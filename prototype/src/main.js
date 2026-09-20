// main.js - Songde Night Duty Act 1 First Agent Task (1~6)
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ContactShadows } from './art/ContactShadows.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { preloadAssets } from './art/AssetRegistry.js';
import { preloadMaterials } from './art/MaterialRegistry.js';

RectAreaLightUniformsLib.init();
await Promise.all([preloadAssets(), preloadMaterials()]);
import { gameState } from './core/GameState.js';
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
const contactShadows = new ContactShadows(scene, camera, window.innerWidth, window.innerHeight, 16);
contactShadows.kernelRadius = 0.35;
contactShadows.minDistance = 0.001;
contactShadows.maxDistance = 0.035;
composer.addPass(new RenderPass(scene, camera));
composer.addPass(contactShadows);
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

// Instantiate UI Manager
let uiManager;
uiManager = new UIManager(
  gameState,
  () => {
    // On modal close, resume player controls
    controller.enabled = true;
    setTimeout(() => {
      renderer.domElement.requestPointerLock();
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

  if (interactable.type === 'duty_door') {
    worldRouter.activeZoneInstance.toggleDutyDoor(camera.position);
    controller.currentInteractable = null;
    uiManager.showPrompt(null);
  } else if (interactable.type === 'key') {
    if (!gameState.isTaskComplete('KEY_PICKUP')) {
      soundManager.playKeyPickup();
      gameState.markTaskComplete('KEY_PICKUP');
      uiManager.showSubtitle('李醫師', '「拿到值班室鑰匙了。」');
      if (interactable.targetGroup) {
        interactable.targetGroup.visible = false;
      }
      interactable.interactable = false;
      uiManager.showPrompt(null);
      checkElevatorReady();
    }
  } else if (interactable.type === 'duty_log') {
    controller.enabled = false;
    uiManager.openDutyLog();
    checkElevatorReady();
  } else if (interactable.type === 'workstation') {
    controller.enabled = false;
    uiManager.openWorkstation();
    checkElevatorReady();
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
    controller.enabled = false;
    uiManager.openTravelSelector(worldRouter.floorDestinations(interactable.kind), worldRouter.activeZoneId, destination => {
      if (destination.zoneId === 'first_campus_4f') gameState.markTaskComplete('WARD_ENTRY');
      worldRouter.loadZone(destination.zoneId, destination.spawn);
      controller.enabled = true;
    }, interactable.kind);
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
console.log('Songde Night Duty - Full World Modeling System Initialized.');
