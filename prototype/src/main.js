// main.js - Songde Night Duty Act 1 First Agent Task & Art Pass v1
import * as THREE from 'three';
import { gameState } from './core/GameState.js';
import { Level3FBlockout } from './world/Level3FBlockout.js';
import { FPSController } from './player/FPSController.js';
import { UIManager } from './ui/UIManager.js';
import { soundManager } from './audio/SoundManager.js';

// Setup Three.js Scene & Renderer
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181513);
scene.fog = new THREE.FogExp2(0x231d1a, 0.022);

const camera = new THREE.PerspectiveCamera(
  68, // Conservative FOV to prevent motion sickness
  window.innerWidth / window.innerHeight,
  0.1,
  60
);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
container.appendChild(renderer.domElement);

// Instantiate World Level (3F Admin & 4F Closed Ward / Duty Room)
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
    uiManager.showPrompt('[E] ' + interactable.label + '  ·  雙擊走近');
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
  } else if (interactable.type === 'elevator' || interactable.type === 'elevator_3f') {
    if (gameState.areRequiredTasksComplete()) {
      controller.enabled = false;
      uiManager.triggerElevatorTransition(
        '4F',
        () => {
          // Teleport to 4F elevator lobby facing east
          controller.teleport(-8.0, 10.0 + controller.eyeHeight, 0.0, 0);
          gameState.markTaskComplete('WARD_ENTRY');
        },
        () => {
          controller.enabled = true;
          renderer.domElement.requestPointerLock();
          uiManager.showSubtitle('李醫師', '「抵達 4F 閉鎖病房區了。先找到 4F 獨立值班室把公事包安頓好。」');
        }
      );
    } else {
      soundManager.playClick();
      const missing = [];
      if (!gameState.isTaskComplete('KEY_PICKUP')) missing.push('值班室鑰匙');
      if (!gameState.isTaskComplete('DUTY_LOG')) missing.push('簽到值班本');
      if (!gameState.isTaskComplete('E_HANDOFF')) missing.push('電腦電子交班');
      uiManager.showSubtitle('李醫師 (自語)', '「還沒完成 3F 報到交班手續，還缺：' + missing.join('、') + '。」', 5000);
    }
  } else if (interactable.type === 'elevator_4f') {
    // Return back down to 3F
    controller.enabled = false;
    uiManager.triggerElevatorTransition(
      '3F',
      () => {
        controller.teleport(-8.0, 0.0 + controller.eyeHeight, 0.0, 0);
      },
      () => {
        controller.enabled = true;
        renderer.domElement.requestPointerLock();
        uiManager.showSubtitle('李醫師', '「回到 3F 醫師行政區。」');
      }
    );
  } else if (interactable.type === 'duty_room_door') {
    if (gameState.isTaskComplete('KEY_PICKUP')) {
      if (!level.isDutyRoomUnlocked) {
        soundManager.playClick();
        level.unlockDutyRoom();
        gameState.markTaskComplete('DUTY_ROOM_SETUP');
        interactable.label = '4F 獨立值班室 (已開啟)';
        uiManager.showSubtitle('李醫師', '「（用鑰匙轉開門鎖）呼……這就是今晚的值班室，有床有桌子，感覺很安頓。」');
      }
    } else {
      soundManager.playClick();
      uiManager.showSubtitle('李醫師 (自語)', '「門鎖著，需要 4F 值班室鑰匙。剛才在 316 總醫師辦公桌上好像有看見。」');
    }
  } else if (interactable.type === 'prop_info') {
    soundManager.playClick();
    if (interactable.info) {
      uiManager.showSubtitle('李醫師', '「' + interactable.info.replace(/^李醫師：『|』$/g, '') + '」');
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
if (camPreset === 'corridor') {
  controller.teleport(0.0, controller.eyeHeight, 0.0, -Math.PI / 2);
} else if (camPreset === 'office') {
  controller.teleport(5.8, controller.eyeHeight, 4.4, Math.PI);
  controller.pitch = -0.14; // Angle down to frame desk props, keys, stamps and wall whiteboard/clock
  controller.updateCameraRotation();
} else if (camPreset === 'workstation') {
  controller.teleport(8.6, controller.eyeHeight, 5.5, -Math.PI / 2);
  setTimeout(() => { uiManager.openWorkstation(); }, 300);
} else if (camPreset === 'elevator') {
  controller.teleport(-6.0, controller.eyeHeight, 0.0, Math.PI / 2);
} else if (camPreset === '4f_gate') {
  controller.teleport(3.0, 10.0 + controller.eyeHeight, -0.6, Math.PI);
  controller.pitch = -0.02; // Level gaze straight at vision glass & warning plaques
  controller.updateCameraRotation();
  const locEl = document.querySelector('.hud-location');
  if (locEl) locEl.textContent = '4F 精神科閉鎖病房區 ｜ 門禁前室';
} else if (camPreset === '4f_dutyroom' || camPreset === '4f') {
  level.unlockDutyRoom();
  controller.teleport(5.3, 10.0 + controller.eyeHeight, -4.6, 0.0);
  controller.pitch = -0.10; // Perfectly centered view capturing bed, slippers, lamp, dusk window, desk, and white coat
  controller.updateCameraRotation();
  const locEl = document.querySelector('.hud-location');
  if (locEl) locEl.textContent = '4F 精神科閉鎖病房區 ｜ 422 獨立值班室 (私人套房空間)';
}

animate();
console.log('Songde Night Duty - Act 1 Art Pass v1 Initialized.');
