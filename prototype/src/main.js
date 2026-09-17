// main.js - Songde Night Duty Act 1 First Agent Task (1~6)
import * as THREE from 'three';
import { gameState } from './core/GameState.js';
import { Level3FBlockout } from './world/Level3FBlockout.js';
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
  60
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

// Instantiate World Level (3F Blockout)
const level = new Level3FBlockout(scene);

// Instantiate FPS Controller
const controller = new FPSController(
  camera,
  renderer.domElement,
  level.colliders,
  level.interactables,
  level.walkables
);

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

  if (interactable.type === 'key') {
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
  } else if (interactable.type === 'elevator') {
    if (gameState.areRequiredTasksComplete()) {
      controller.enabled = false;
      uiManager.triggerElevatorTransition(() => {
        gameState.markTaskComplete('WARD_ENTRY');
      });
    } else {
      soundManager.playClick();
      const missing = [];
      if (!gameState.isTaskComplete('KEY_PICKUP')) missing.push('值班室鑰匙');
      if (!gameState.isTaskComplete('DUTY_LOG')) missing.push('簽到值班本');
      if (!gameState.isTaskComplete('E_HANDOFF')) missing.push('電腦電子交班');
      uiManager.showSubtitle('李醫師 (自語)', '「還沒完成 3F 報到交班手續，還缺：' + missing.join('、') + '。」', 5000);
    }
  }
};

function checkElevatorReady() {
  const ready = gameState.areRequiredTasksComplete();
  level.updateElevatorLight(ready);
}

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);

  controller.update(delta);
  renderer.render(scene, camera);
}

// URL Camera presets for QA and visual capture
const urlParams = new URLSearchParams(window.location.search);
const camPreset = urlParams.get('cam');
if (camPreset === '316_entrance') {
  controller.teleport(2.1, controller.eyeHeight, 0.4, Math.PI);
  controller.pitch = 0.0;
  controller.updateCameraRotation();
} else if (camPreset === '3f_corridor' || camPreset === 'corridor') {
  controller.teleport(-2.5, controller.eyeHeight, 0.0, -Math.PI / 2);
  controller.pitch = 0.0;
  controller.updateCameraRotation();
} else if (camPreset === 'his_workstation' || camPreset === 'workstation') {
  controller.teleport(9.0, controller.eyeHeight, 5.5, -Math.PI / 2);
  setTimeout(() => { uiManager.openWorkstation(); }, 300);
} else if (camPreset === '4f_arrival_signage' || camPreset === 'elevator') {
  controller.teleport(-4.2, controller.eyeHeight, 0.0, Math.PI / 2);
  controller.pitch = 0.05;
  controller.updateCameraRotation();
} else if (camPreset === 'duty_room_sign') {
  controller.teleport(1.25, 1.82, 1.05, Math.PI);
  controller.pitch = 0.0;
  controller.updateCameraRotation();
}

animate();
console.log('Songde Night Duty - Act 1 Prototype Initialized.');
