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
scene.background = new THREE.Color(0x1a1614);
scene.fog = new THREE.FogExp2(0x241e1b, 0.025);

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
      uiManager.showSubtitle('李醫師', '「拿到 4F 獨立值班室的鑰匙了。」');
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

animate();
console.log('Songde Night Duty - Act 1 Prototype Initialized.');
