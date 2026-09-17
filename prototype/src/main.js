// main.js - Songde Night Duty Act 1 First Agent Task & Canonical Art Direction v2
import * as THREE from 'three';
import { gameState } from './core/GameState.js';
import { Level3FBlockout } from './world/Level3FBlockout.js';
import { FPSController } from './player/FPSController.js';
import { UIManager } from './ui/UIManager.js';
import { soundManager } from './audio/SoundManager.js';
import { applyAct1ArtDirection } from './art/Act1ArtDirector.js';

// Setup Three.js Scene & Renderer
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x918f89);
scene.fog = new THREE.FogExp2(0xb5aa9b, 0.0075);

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
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

// Instantiate World Level (3F Admin & 4F Ward / Duty Room)
const level = new Level3FBlockout(scene);
applyAct1ArtDirection({ scene, renderer });

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
    controller.enabled = true;
    setTimeout(() => {
      renderer.domElement.requestPointerLock();
    }, 100);
  },
  () => {
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
          controller.teleport(-8.0, 10.0 + controller.eyeHeight, 0.0, 0);
          gameState.markTaskComplete('WARD_ENTRY');
        },
        () => {
          controller.enabled = true;
          renderer.domElement.requestPointerLock();
          uiManager.showSubtitle('李醫師', '「抵達 4F 病房區了。先找到獨立值班室，把今晚的東西安頓好。」');
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
        uiManager.showSubtitle('李醫師', '「（用鑰匙轉開門鎖）好，今晚可以在這裡短暫休息。」');
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

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

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
  controller.pitch = -0.14;
  controller.updateCameraRotation();
} else if (camPreset === 'workstation') {
  controller.teleport(8.6, controller.eyeHeight, 5.5, -Math.PI / 2);
  setTimeout(() => { uiManager.openWorkstation(); }, 300);
} else if (camPreset === 'elevator') {
  controller.teleport(-6.0, controller.eyeHeight, 0.0, Math.PI / 2);
} else if (camPreset === '4f_gate') {
  controller.teleport(3.0, 10.0 + controller.eyeHeight, -0.6, Math.PI);
  controller.pitch = -0.02;
  controller.updateCameraRotation();
  const locEl = document.querySelector('.hud-location');
  if (locEl) locEl.textContent = '4F 病房區 ｜ 門禁前室';
} else if (camPreset === '4f_dutyroom' || camPreset === '4f') {
  level.unlockDutyRoom();
  controller.teleport(5.3, 10.0 + controller.eyeHeight, -4.6, 0.0);
  controller.pitch = -0.10;
  controller.updateCameraRotation();
  const locEl = document.querySelector('.hud-location');
  if (locEl) locEl.textContent = '4F 病房區 ｜ 422 獨立值班室';
} else if (camPreset === 'hotfix_316_doorway') {
  controller.teleport(2.0, controller.eyeHeight, -0.4, Math.PI);
  controller.pitch = -0.12;
  controller.updateCameraRotation();
  const locEl = document.querySelector('.hud-location');
  if (locEl) locEl.textContent = '3F 走廊 ｜ 316 總醫師辦公室門口 (走廊扶手無橫槓阻擋)';
} else if (camPreset === 'hotfix_4f_signs') {
  controller.teleport(-3.2, 10.0 + controller.eyeHeight, 0.0, -Math.PI / 2);
  controller.pitch = 0.08;
  controller.updateCameraRotation();
  const locEl = document.querySelector('.hud-location');
  if (locEl) locEl.textContent = '4F 走廊 ｜ 導引標示檢核 (值班室在左/閉鎖病房在右)';
} else if (camPreset === 'hotfix_orange_fixed') {
  controller.teleport(2.2, 10.0 + controller.eyeHeight, 0.8, 0.0);
  controller.pitch = -0.05;
  controller.updateCameraRotation();
  const locEl = document.querySelector('.hud-location');
  if (locEl) locEl.textContent = '4F 走廊南側 ｜ 422 值班室外牆檢核 (原橘色區塊已移除)';
} else if (camPreset === 'hotfix_duty_door') {
  controller.teleport(4.5, 10.0 + controller.eyeHeight, -0.7, 0.0);
  controller.pitch = -0.06;
  controller.updateCameraRotation();
  const locEl = document.querySelector('.hud-location');
  if (locEl) locEl.textContent = '4F 422值班室 ｜ 牆面門牌與木門組件檢核';
}

animate();
console.log('Songde Night Duty - Act 1 Canonical Art Direction v2 Initialized.');
