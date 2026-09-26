// main.js - Night Corridor Act 1
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { preloadAssets, preloadCriticalAssets } from './art/AssetRegistry.js';
import { preloadMaterials } from './art/MaterialRegistry.js';
import { preloadCampusBackdropAssets } from './art/CampusBackdrop.js';

RectAreaLightUniformsLib.init();
// Preserve the authored opening 3F furniture without putting the entire hospital
// asset library back on the critical path.
await preloadCriticalAssets();
// Boot immediately with procedural/shared fallback materials and load heavyweight
// GLTF/PBR assets after first paint. This removes 20+ asset requests from the
// critical path while preserving full-quality assets once they are cached.
const deferredHospitalAssets = () => Promise.all([preloadAssets(), preloadMaterials()])
  .catch(error => console.warn('[perf] deferred hospital asset preload failed', error));
const blockingCampusBackdropZones = new Set(['first_campus_1f','first_campus_8f']);
const nonBlockingCampusBackdropZones = new Set(['first_campus_2f']);
const prefetchDestinationAssets = destination => {
  const zoneId=destination?.zoneId;
  if(nonBlockingCampusBackdropZones.has(zoneId)){
    void preloadCampusBackdropAssets().catch(error=>console.warn('[perf] deferred 2F backdrop preload failed',error));
  }
  return Promise.all([
    preloadAssets(),
    preloadMaterials(),
    blockingCampusBackdropZones.has(zoneId) ? preloadCampusBackdropAssets() : Promise.resolve()
  ]);
};
let fastPathWorldPreload=Promise.resolve();
import { gameState } from './core/GameState.js';
import { DutyEventManager } from './core/DutyEventManager.js';
import { Level3FBlockout } from './world/Level3FBlockout.js';
import { applyAct1CollisionHotfix } from './world/CollisionHotfix.js';
import { FPSController } from './player/FPSController.js';
import { UIManager } from './ui/UIManager.js';
import { soundManager } from './audio/SoundManager.js';
import { floorStateManager, GamePhase } from './core/FloorStateManager.js';
import { persistentMemory, TRUE_NAME_CANON } from './core/PersistentMemory.js';
import { legendState, NodeState } from './core/LegendStateManager.js';
import { LoopManager } from './core/LoopManager.js';
import { canAccess } from './core/AccessGraph.js';
import { getMemorySequence, IDENTITY_CANDIDATES } from './story/NarrativeV22.js';

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
requestAnimationFrame(() => {
  if ('requestIdleCallback' in window) requestIdleCallback(deferredHospitalAssets, { timeout: 2500 });
  else setTimeout(deferredHospitalAssets, 500);
});
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
persistentMemory.applyToGameState(gameState);
gameState.setFlag('FAST_PATH_3F',persistentMemory.data.loopCount>=1);

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

const loopManager=new LoopManager({gameState,worldRouter,controller,uiManager});
uiManager.setHandoffDecisionHandler(choice=>{
  if(choice==='default'){
    loopManager.triggerLegendOverride('HANDOFF_DEFAULT',{legend:'M1 — 預設值班模板覆寫',reason:'你接受了沒有姓名來源的預設身分。'});
    return;
  }
  persistentMemory.addJournalNote('M1_MANUAL_IDENTITY','17:00：拒絕院內預設值班模板，保留「值班醫師／姓名待核」狀態，直到找到原始紀錄。');
});

function registerBed33Clue(clueId){
  const previous=legendState.getState('LEGEND_BED33');
  const state=legendState.registerClue('LEGEND_BED33',clueId);
  if(state===NodeState.UNDERSTOOD&&previous!==NodeState.UNDERSTOOD){
    gameState.setFlag('BED33_UNDERSTOOD',true);
    gameState.setFlag('WHERE_0409',true);
    persistentMemory.learnCode('code_0409');
    persistentMemory.addJournalNote('INFER_0409','04:09……不是時間。是 409？');
    uiManager.showSubtitle('值班醫師','「04:09……不是時間。是 409？」',3600);
  }
  return state;
}

uiManager.setBed33Handlers({
  onConfirm:()=>loopManager.triggerBed33Override(),
  onDefer:()=>uiManager.showSubtitle('值班醫師','「先別簽。床位板、HIS 和 409 的狀態對不起來。」',3200),
  onReject:()=>{
    legendState.resolve('LEGEND_BED33');
    gameState.setFlag('BED33_RESOLVED',true);
    gameState.setFlag('WHERE_0409',true);
    gameState.markTaskComplete('LEGEND_BED33_RESOLVED');
    gameState.addEvidence(1);
    persistentMemory.learnCode('code_0409');
    persistentMemory.setProof('space',true);
    persistentMemory.setTrueNameFragment('frag_employeePrefix','MED-87');
    persistentMemory.resolveLegend('bed33');
    persistentMemory.addJournalNote('BED33_RESOLVED','409A 的床位單不是正常流程；上面的電子簽名也不是我留下的。');
    uiManager.showSubtitle('夜班護理師','「409 整修中？……奇怪，這張不是我印的。可是上面是你的電子簽名。」',5200);
    uiManager.updateTasks();
  }
});

function triggerPost2117DutyRoomSequence(){
  if(!gameState.getFlag('BOOTSTRAP_2117_RESOLVED'))return false;
  if(gameState.getFlag('POST_2117_DUTY_CALL_DONE'))return false;
  if(gameState.getFlag('POST_2117_DUTY_ROOM_TRIGGERED'))return true;

  gameState.setFlag('POST_2117_DUTY_ROOM_TRIGGERED',true);
  gameState.setFlag('POST_2117_RETURN_TO_DUTY_ROOM',false);
  controller.cancelAutoMove();
  controller.enabled=false;
  gameState.setGameTime('23:55');
  uiManager.showSubtitle('值班醫師','「先把今晚看到的東西寫下來……21:17、316、409。等等，已經快午夜了？」',4300);
  uiManager.updateTasks();

  setTimeout(()=>{
    if(gameState.getFlag('POST_2117_DUTY_CALL_DONE')){
      controller.enabled=true;
      return;
    }
    gameState.setGameTime('00:30');
    controller.enabled=true;
    startStoryPhoneCall('ER_GHOST_0033');
  },2200);
  return true;
}

function startStoryPhoneCall(kind){
  if(kind==='FAST_PATH_316')fastPathWorldPreload=prefetchDestinationAssets({zoneId:'first_campus_4f'});
  gameState.setFlag('PHONE_CALL_KIND',kind);
  gameState.setFlag('PHONE_ANSWERED',false);
  gameState.setFlag('PHONE_RING_ACTIVE',true);
  soundManager.playPhoneRingPattern();
  worldRouter.activeZoneInstance?.syncStoryState?.();
  uiManager.updateTasks();
}

function unlockSecondCampusAccess(){
  if(gameState.getFlag('SECOND_CAMPUS_ACCESS'))return;
  gameState.setGameTime('01:15');
  gameState.setFlag('SECOND_CAMPUS_ACCESS',true);
  gameState.setFlag('BRIDGE_ACCESS',true);
  gameState.setFlag('SECOND_CAMPUS_OBJECTIVE_ACTIVE',true);
  persistentMemory.addJournalNote('SECOND_CAMPUS_CALL','第二院區護理站主動開了八樓天橋權限；在這之前我根本沒有跨院區資格。');
  uiManager.showSubtitle('第二院區護理師','「值班醫師，第二院區 5F 有一位病人需要精神科評估。八樓天橋的門禁權限已開放，請到 5F 護理站報到。」',5600);
  uiManager.updateTasks();
}

function completeM5IfReady(){
  if(!gameState.getFlag('M5_ROUTE_CHOICE_RESOLVED'))return false;
  if(!gameState.getFlag('M5_CCTV_RESOLVED')){
    uiManager.updateTasks();
    return false;
  }
  gameState.setGameTime('02:00');
  gameState.setFlag('M5_ROUTE_RESOLVED',true);
  gameState.setFlag('FLOOR6_AVAILABLE',true);
  gameState.setFlag('SIX_FLOOR_HISTORY_CONFIRMED',true);
  if(gameState.getFlag('CHEST_RECORD_MATCH')){gameState.setFlag('IDENTITY_PROOF',true);persistentMemory.setProof('identity',true);}
  uiManager.updateTasks();
  return true;
}

function getDeferred316IdentityMissing() {
  const missing=[];
  if(!gameState.getFlag('B2_ADMIN_SOURCE'))missing.push('3F 行政原始紀錄');
  if(!gameState.getFlag('B2_HISTORY_SOURCE'))missing.push('3F 文史封存索引');
  if(!gameState.getFlag('B2_LEGACY_SOURCE'))missing.push('316 舊終端索引');
  if(!gameState.getFlag('B2_SECURITY_SOURCE'))missing.push('1F 警衛門禁來源');
  const fragments=persistentMemory.data.trueNameFragments;
  if(fragments.frag_employeePrefix!=='MED-87')missing.push('員編前綴 MED-87');
  if(!fragments.frag_surname||!fragments.frag_givenName_1||!fragments.frag_givenName_2)missing.push('完整姓名片段');
  if(!gameState.getFlag('BED33_RESOLVED'))missing.push('409-A 拒簽證據');
  if(!gameState.getFlag('M4_CHEST_RESOLVED'))missing.push('504B 轉院拒簽');
  if(!gameState.getFlag('FLOOR6_STETHOSCOPE_INSPECTED'))missing.push('6F 刻字聽診器');
  if(!persistentMemory.hasAllProofs())missing.push('時間／空間／身分三組證明');
  return [...new Set(missing)];
}

function resolveAdminIdentityPuzzleIfReady() {
  if(gameState.getFlag('ADMIN_IDENTITY_PUZZLE_RESOLVED')) return;
  const complete=
    gameState.getFlag('ADMIN_ROSTER_CHECKED') &&
    gameState.getFlag('ADMIN_PRINTER_DOC_CHECKED') &&
    gameState.getFlag('ADMIN_DRAWER_MANUAL_CHECKED');
  if(!complete) return;
  gameState.setFlag('ADMIN_IDENTITY_PUZZLE_RESOLVED',true);
  gameState.setFlag('ECHO_2117_KNOWN',true);
  gameState.markTaskComplete('P1_ADMIN_IDENTITY_PUZZLE');
  gameState.addEvidence(1);
  uiManager.showSubtitle('值班醫師','「名冊是空的，補登單卻寫我 21:17 已完成巡查……而備忘錄又說最後完成交班的人才算值班醫師。這三份資料不可能同時是真的。」',6200);
}

if(new URLSearchParams(location.search).get('qa')==='story'){
  const findInteractable=({id,type,action}={})=>{
    const list=worldRouter.activeZoneInstance?.interactables||[];
    return list.find(o=>{
      const d=o?.userData||o;
      return (!id||d.id===id)&&(!type||d.type===type)&&(!action||d.action===action);
    });
  };
  window.__storyQA={
    gameState,persistentMemory,legendState,worldRouter,uiManager,loopManager,dutyEvents,GamePhase,floorStateManager,controller,
    load:(zone,spawn)=>{worldRouter.loadZone(zone,spawn);worldRouter.activeZoneInstance?.syncStoryState?.();},
    enter:(zone,spawn)=>{
      worldRouter.loadZone(zone,spawn);
      const line=dutyEvents.onZoneEntered(zone);
      worldRouter.activeZoneInstance?.syncStoryState?.();
      if(line)uiManager.showSubtitle(line.speaker,line.text);
      return line;
    },
    setFlag:(k,v=true)=>gameState.setFlag(k,v),
    task:id=>gameState.markTaskComplete(id),
    phase:p=>{floorStateManager.setPhase(p);worldRouter.activeZoneInstance?.applyGamePhase?.(p,gameState);},
    captureView:({position,target,anchorName})=>{
      const dx=target[0]-position[0],dy=target[1]-position[1],dz=target[2]-position[2];
      const yaw=Math.atan2(-dx,-dz),pitch=Math.atan2(dy,Math.hypot(dx,dz));
      controller.teleport(position[0],position[1],position[2],yaw);
      controller.pitch=pitch;controller.updateCameraRotation();
      scene.updateMatrixWorld(true);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
      const anchor=scene.getObjectByName(anchorName);
      if(!anchor||!anchor.visible)throw new Error('Story QA anchor missing or hidden: '+anchorName);
      const bounds=new THREE.Box3().setFromObject(anchor);
      if(bounds.isEmpty())throw new Error('Story QA anchor has no visible geometry: '+anchorName);
      const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
      if(!frustum.intersectsBox(bounds))throw new Error('Story QA anchor is outside the camera frustum: '+anchorName);
      const points=[];
      for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
        points.push(new THREE.Vector3(x,y,z).project(camera));
      }
      const width=renderer.domElement.clientWidth,height=renderer.domElement.clientHeight;
      const minX=Math.min(...points.map(p=>(p.x+1)*.5*width)),maxX=Math.max(...points.map(p=>(p.x+1)*.5*width));
      const minY=Math.min(...points.map(p=>(1-p.y)*.5*height)),maxY=Math.max(...points.map(p=>(1-p.y)*.5*height));
      const rect={left:Math.max(0,minX),top:Math.max(0,minY),width:Math.min(width,maxX)-Math.max(0,minX),height:Math.min(height,maxY)-Math.max(0,minY)};
      if(rect.width<=2||rect.height<=2)throw new Error('Story QA anchor has no visible projected rectangle: '+anchorName);
      return {anchorName,rect,viewport:{width,height}};
    },
    lookAt:(target)=>{
      const dx=target[0]-controller.position.x,dy=target[1]-controller.position.y,dz=target[2]-controller.position.z;
      controller.yaw=Math.atan2(-dx,-dz);controller.pitch=Math.atan2(dy,Math.hypot(dx,dz));controller.updateCameraRotation();
      camera.updateMatrixWorld(true);controller.updateRaycast();
      const hits=controller.raycaster.intersectObjects(controller.interactables.filter(o=>o?.isObject3D),true);
      return {
        current:controller.currentInteractable?.id||null,
        position:controller.position.toArray(),
        hits:hits.slice(0,6).map(hit=>({name:hit.object.name,id:hit.object.userData?.id,distance:hit.distance}))
      };
    },
    interact:(query)=>{
      const obj=findInteractable(query);
      if(!obj)throw new Error('QA interactable missing '+JSON.stringify(query));
      controller.onInteract(obj.userData||obj);
    },
    snapshot:()=>({
      zone:worldRouter.activeZoneId,time:gameState.gameTime,
      controllerEnabled:controller.enabled,
      flags:Object.fromEntries(gameState.flags),
      tasks:[...gameState.completedTasks],
      memory:JSON.parse(JSON.stringify(persistentMemory.data)),
      legend:legendState.getState('LEGEND_BED33')
    })
  };
}

// Setup Raycast Hover & Interaction
controller.onHoverChange = (interactable) => {
  if (interactable) {
    uiManager.showPrompt(`[E] ${interactable.label}  ·  雙擊走近`);
  } else {
    uiManager.showPrompt(null);
  }
};

controller.onInteract = async (interactable) => {
  console.log('Interacting with:', interactable);

  if (interactable.type === 'access_door') {
    const door=worldRouter.activeZoneInstance.accessDoors?.[interactable.doorId];
    if(!door)return;
    if(interactable.doorId==='SECOND_1F_HILLSIDE'){
      soundManager.playDoorLockClack();
      uiManager.showSubtitle('值班醫師','「打不開，這邊也是只進不出。」',2800);
      return;
    }
    if(door.portal){
      if(interactable.doorId==='BRIDGE_SECOND'&&gameState.getFlag('M5_BRIDGE_COMMITTED')){
        soundManager.playDoorLockClack();
        uiManager.showSubtitle('門禁','「通往第二院區的門已從另一側鎖上。繼續往第一院區走。」',3200);
        return;
      }
      if(['BRIDGE_ACCESS','BRIDGE_FIRST','BRIDGE_SECOND'].includes(interactable.doorId)&&!canAccess(gameState,interactable.doorId==='BRIDGE_ACCESS'?'FIRST_TO_SECOND_BRIDGE':'SECOND_TO_FIRST_BRIDGE')){
        soundManager.playDoorLockClack();
        uiManager.showSubtitle('門禁','「夜間跨院區權限尚未開啟。」',2800);
        return;
      }
      controller.enabled=false;controller.cancelAutoMove();
      uiManager.runDoorTransition(()=>worldRouter.teleportToSpawn(door.portal));
    }else{
      if(interactable.doorId==='ER_HILLSIDE'){
        soundManager.playDoorLockClack();
        uiManager.showSubtitle('門禁','「此門只進不出。」',2600);
        return;
      }
      if(interactable.doorId==='3F_ARCHIVE_DOOR'&&!gameState.getFlag('ARCHIVE_ACCESS_KEY')){
        soundManager.playClick();
        uiManager.showSubtitle('值班醫師','「文史館？今晚的正常交班流程沒有提到這裡。先把 316 的交班做完。」',3200);
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
    if(interactable.doorId==='room_409'){
      if(gameState.isTaskComplete('P1_NORMAL_EVENT_DONE'))gameState.setFlag('FOURF_409_SEAL_CHECKED_AFTER_408C',true);
      registerBed33Clue('DOOR_409_SEALED');
      soundManager.playDoorLockClack();
      uiManager.showSubtitle('值班醫師','「409 整修封閉中……可護理站那張舊床位卡卻還寫著 409A。」',3400);
      uiManager.updateTasks();
      return;
    }
    if(interactable.doorId==='3F_ADMIN_OFFICE_DOOR'){
      const zone=worldRouter.activeZoneInstance;
      const keyedDoor=zone.keyedDoors?.[interactable.doorId];
      if(!keyedDoor)return;
      const wasClosed=keyedDoor.closed;
      const changed=keyedDoor.toggle(controller.position);
      if(changed){
        soundManager.playClick();
        if(wasClosed&&!gameState.getFlag('ADMIN_OFFICE_ENTERED')){
          gameState.setFlag('ADMIN_OFFICE_ENTERED',true);
          uiManager.showSubtitle('值班醫師','「行政辦公室還沒鎖。順便核對一下今晚的值勤名冊。」',3000);
        }
      }else uiManager.showSubtitle('門鎖','請先離開門幅後再關門。',2500);
      controller.currentInteractable=null;uiManager.showPrompt(null);
      return;
    }
    if(interactable.doorId==='3F_ARCHIVE_DOOR'){
      const zone=worldRouter.activeZoneInstance;
      const keyedDoor=zone.keyedDoors?.[interactable.doorId];
      if(!keyedDoor)return;
      if(!gameState.getFlag('ARCHIVE_ACCESS_KEY')){
        gameState.setFlag('ARCHIVE_LOCKED_SEEN',true);
        soundManager.playDoorLockClack();
        uiManager.showSubtitle('值班醫師','「打不開……鑰匙呢？」',2600);
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
      uiManager.showSubtitle('值班醫師','「這是傳統喇叭鎖，先去 316 拿值班室鑰匙與感應卡。」',3000);
      return;
    }
    const zone=worldRouter.activeZoneInstance;
    const keyedDoor=zone.keyedDoors?.[interactable.doorId] || (interactable.doorId==='duty_room'?zone.dutyDoor:null);
    if(!keyedDoor)return;
    const wasClosed=keyedDoor.closed;
    const changed=keyedDoor.toggle(controller.position);
    if(changed)soundManager.playClick();
    else uiManager.showSubtitle('門鎖','請先離開門幅後再關門。',2500);
    if(keyedDoor===zone.dutyDoor)zone.dutyDoorClosed=keyedDoor.closed;
    if(changed&&wasClosed&&keyedDoor===zone.dutyDoor&&gameState.isTaskComplete('P1_NORMAL_EVENT_DONE')&&gameState.getFlag('BED33_RESOLVED')&&!gameState.isTaskComplete('P1_ER_CALL_RECEIVED')){
      dutyEvents.complete('P1_ER_CALL_RECEIVED','20:00');
      gameState.setFlag('P1_ER_CALL_ANSWERED',false);
      startStoryPhoneCall('ER_JANE_2005');
    }
    controller.currentInteractable = null;
    uiManager.showPrompt(null);
  } else if (['admin_roster_3f','admin_printer_doc_3f','admin_drawer_manual_3f'].includes(interactable.type)) {
    // FAST_PATH_3F may skip repeated handoff chores, but evidence documents must
    // remain readable on every loop. A player can trigger HANDOFF_DEFAULT before
    // ever inspecting the admin office, so loopCount alone is not evidence progress.
    const config={
      admin_roster_3f:['ADMIN_ROSTER_CHECKED','P1_ADMIN_ROSTER_CHECK'],
      admin_printer_doc_3f:['ADMIN_PRINTER_DOC_CHECKED','P1_ADMIN_PRINTER_DOC'],
      admin_drawer_manual_3f:['ADMIN_DRAWER_MANUAL_CHECKED','P1_ADMIN_DRAWER_MANUAL']
    }[interactable.type];
    const [flag,taskId]=config;
    if(!gameState.getFlag(flag)){
      gameState.setFlag(flag,true);
      gameState.markTaskComplete(taskId);
      soundManager.playPaperSign();
    }
    controller.enabled=false;
    uiManager.openArchiveDocument({title:interactable.documentTitle,pages:interactable.pages});
    resolveAdminIdentityPuzzleIfReady();
  } else if (interactable.type === 'spare_key_316') {
    if(!gameState.getFlag('FOUND_316_SPARE_KEY')){
      gameState.setFlag('FOUND_316_SPARE_KEY',true);
      gameState.markTaskComplete('FOUND_316_SPARE_KEY');
      if(interactable.targetGroup)interactable.targetGroup.visible=false;
      interactable.interactable=false;
      soundManager.playKeyPickup();
      uiManager.showSubtitle('值班醫師','「警衛查哨點裡真的留了 316 的備援鑰匙。先回去開門。」',3200);
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
        uiManager.showSubtitle('值班醫師',gameState.getFlag('FAST_PATH_3F')?'「門開了。這些流程我已經走過，先進去接電話。」':'「開了。先找值班手冊，學長應該有留下交班方式。」',3200);
      }
    }
  } else if (interactable.type === 'locker_316') {
    if(!gameState.isTaskComplete('DUTY_LOG')){
      soundManager.playClick();
      uiManager.showSubtitle('值班醫師','「四位數電子鎖……先看看桌上的值班手冊有沒有寫什麼。」',3000);
      return;
    }
    controller.enabled=false;
    uiManager.openLocker();
  } else if (interactable.type === 'key') {
    if (!gameState.isTaskComplete('KEY_PICKUP')) {
      soundManager.playKeyPickup();
      gameState.markTaskComplete('KEY_PICKUP');
      uiManager.showSubtitle('值班醫師', '「拿到值班室鑰匙與感應卡了。」');
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
      uiManager.showSubtitle('值班醫師','「鎖上了……需要四位數密碼。看來跟對面的夜間告示有關。」',3200);
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
      uiManager.showSubtitle('值班醫師','「黃銅牌只刻了兩個字：『文史』……」',3000);
      uiManager.showPrompt(null);
    }
  } else if (interactable.type === 'office_phone_316') {
    if(gameState.getFlag('FAST_PATH_3F')&&gameState.getFlag('PHONE_RING_ACTIVE')&&gameState.getFlag('PHONE_CALL_KIND')==='FAST_PATH_316'&&!gameState.getFlag('FAST_PATH_316_CALL_DONE')){
      gameState.setFlag('PHONE_RING_ACTIVE',false);
      gameState.setFlag('PHONE_ANSWERED',true);
      gameState.setFlag('PHONE_CALL_KIND',null);
      gameState.setFlag('FAST_PATH_316_CALL_DONE',true);
      gameState.markTaskComplete('P1_316_COMPLETE');
      gameState.markTaskComplete('DUTY_LOG');
      gameState.markTaskComplete('E_HANDOFF');
      await fastPathWorldPreload;
      soundManager.playClick();
      uiManager.showSubtitle('316 電話','「密碼一樣，拿了鑰匙跟感應卡後就去四樓吧。東西還在櫃子裡。」',4800);
      uiManager.updateTasks();
    }else if(gameState.getFlag('SECOND_CAMPUS_PHONE_PENDING')){
      gameState.setFlag('SECOND_CAMPUS_PHONE_PENDING',false);
      gameState.setFlag('PHONE_ANSWERED',true);
      soundManager.playClick();
      uiManager.showSubtitle('值班醫師','「……怎麼知道我在 316 辦公室？」',2600);
      setTimeout(()=>unlockSecondCampusAccess(),1800);
    }else if(gameState.getFlag('PHONE_RING_ACTIVE')&&!gameState.getFlag('PHONE_ANSWERED')){
      gameState.setFlag('PHONE_ANSWERED',true);
      gameState.setFlag('PHONE_RING_ACTIVE',false);
      soundManager.playClick();
      soundManager.duckAmbient(.18,4300);
      const loopCount=persistentMemory.data.loopCount;
      if(loopCount>0){
        const lines=['「……你還在三樓嗎？」','「嘻嘻，你還在三樓。」','「嘻嘻，你逃不掉的。」','「你又回來了。」'];
        uiManager.showSubtitle('電話',`（三秒雜音）\\n${lines[Math.min(loopCount,lines.length-1)]}`,4300);
        return;
      }
      if(interactable.doorId==='SECOND_1F_HILLSIDE'){
        soundManager.playDoorLockClack();
        uiManager.showSubtitle('門禁','「夜間山側通行權限尚未開啟。」',2800);
        return;
      }
      uiManager.showSubtitle('電話','（三秒雜音）\n「……你還在三樓嗎？」\n嘟——　嘟——　嘟——',4300);
    }else{
      uiManager.showSubtitle('值班醫師','「普通的院內電話。」',1800);
    }
  } else if (interactable.type === 'story_phone') {
    const callKind=gameState.getFlag('PHONE_CALL_KIND');
    if(!gameState.getFlag('PHONE_RING_ACTIVE')||!callKind)return;
    gameState.setFlag('PHONE_RING_ACTIVE',false);
    gameState.setFlag('PHONE_ANSWERED',true);
    soundManager.playClick();
    soundManager.duckAmbient(.18,4300);
    if(callKind==='ER_JANE_2005'){
      gameState.setFlag('PHONE_CALL_KIND',null);
      gameState.setFlag('P1_ER_CALL_ANSWERED',true);
      gameState.setFlag('ER_JANE_PRESENT',true);
      gameState.setGameTime('20:05');
      uiManager.showSubtitle('急診護理師','「值班醫師，急診有一名身分不詳男性，身上有燒焦與煙灰、意識混亂，麻煩精神科下來評估。」',5400);
    }else if(callKind==='NIGHT_PATROL_2115'){
      gameState.setFlag('PHONE_CALL_KIND',null);
      gameState.setFlag('NIGHT_PATROL_RETURN_3F',true);
      floorStateManager.setPhase(GamePhase.NIGHT_PATROL);
      uiManager.showSubtitle('護理站','「值班醫師，三樓警衛說你剛才在查哨點少簽一個名字，21:17 前要送巡查大表。你現在立刻下去補簽。」\\n值班醫師：「我？我一直在四樓值班室啊……」\\n護理站：「三樓說看著你的背影走過去的。快去吧。」',7200);
    }else if(callKind==='ER_GHOST_0033'){
      gameState.setFlag('PHONE_CALL_KIND',null);
      gameState.setFlag('POST_2117_DUTY_CALL_DONE',true);
      gameState.setFlag('GHOST_REGISTRATION_ARMED',true);
      gameState.setFlag('GHOST_REGISTRATION_AVAILABLE',true);
      gameState.setGameTime('00:33');
      uiManager.showSubtitle('急診護理師','「值班醫師，不好意思。系統裡突然多了一筆掛號資料，可是我們這邊找不到病人。你對這筆資料有印象嗎？」\\n值班醫師：「我沒有印象。我下去看看病歷紀錄。」',6200);
    }else return;
    worldRouter.activeZoneInstance?.syncStoryState?.();
    uiManager.updateTasks();
  } else if (interactable.type === 'cpr_anne') {
    const stage=gameState.getFlag('ANNE_STAGE')||0;
    uiManager.showSubtitle('值班醫師',stage===0?'「CPR 訓練用假人安妮。新的，看起來還沒怎麼用過。」':'「……剛才它是這個方向嗎？」',2600);
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
  } else if (interactable.type === 'legacy_terminal_316') {
    if(!gameState.getFlag('ER0033_SLIP_COLLECTED')){
      uiManager.showSubtitle('316 舊資料終端','「ARCHIVE CLIENT｜目前沒有待查的舊索引。」',2600);
      return;
    }
    if(gameState.getFlag('M3_316_DECODED')){
      uiManager.showSubtitle('316 舊資料終端','「1998-ER-0217｜責任醫師員編前綴 MED-87｜姓氏：張。」',3600);
      return;
    }
    gameState.setFlag('M3_316_DECODED',true);
    gameState.setFlag('LEGEND_ER0033_RESOLVED',true);
    gameState.setFlag('ER0033_INDEX_MATCH',true);
    persistentMemory.resolveLegend('er0033');
    persistentMemory.setTrueNameFragment('frag_surname','張');
    persistentMemory.addJournalNote('ER0033_DECODED','316 舊終端解出 1998-ER-0217：責任醫師員編以 MED-87 開頭，姓氏是「張」。');
    if(gameState.getFlag('TIME_PROOF_FRAGMENT')){
      gameState.setFlag('TIME_PROOF',true);
      persistentMemory.setProof('time',true);
    }
    gameState.setFlag('SECOND_CAMPUS_PHONE_PENDING',true);
    gameState.setFlag('B2_LEGACY_SOURCE',true);
    soundManager.playPhoneRingPattern();
    uiManager.showSubtitle('316 舊資料終端','「1998-ER-0217｜責任醫師：張○○｜員編前綴：MED-87。」\n\n終端機停止後，桌上的院內電話立刻響起。',5200);
  } else if (interactable.type === 'workstation') {
    if(gameState.getFlag('B2_EXITED_PERMANENTLY')&&!gameState.getFlag('M7_B2_RESOLVED')&&worldRouter.activeZoneId==='first_campus_3f'){
      const missing=getDeferred316IdentityMissing();
      if(missing.length){
        uiManager.showSubtitle('316｜延後身分重建','「B2 已永久封閉。現在仍缺：'+missing.join('、')+'。先在院內補齊，再回 316。」',5600);
        uiManager.updateTasks();
        return;
      }
      controller.enabled=false;
      uiManager.openIdentityMatrix({
        candidates:IDENTITY_CANDIDATES,
        onSelect:candidate=>{
          if(candidate.id!=='ZHANG_SHOUHENG')return {resolved:false,message:candidate.contradiction};
          persistentMemory.setTrueNameFragment('frag_title','住院醫師');
          persistentMemory.setTrueNameFragment('frag_employeeFull','MED-870409');
          if(!persistentMemory.resolveTrueName(TRUE_NAME_CANON))return {resolved:false,message:'院內來源仍未完成一致性收斂。請再核對行政、門禁與 6F 物證。'};
          gameState.setFlag('M7_B2_RESOLVED',true);
          gameState.setFlag('M7_IDENTITY_RESOLVED_AT_316',true);
          gameState.setFlag('M8_IDENTITY_BATTLE_ACTIVE',true);
          gameState.setFlag('LAST_CALL_SEEN',true);
          gameState.setFlag('M8_CODE_BLACK_ANNOUNCED',true);
          gameState.setGameTime('03:55');
          while(persistentMemory.data.identityErosionLevel<4)persistentMemory.raiseErosion(1);
          persistentMemory.resolveLegend('lastCall');
          persistentMemory.addJournalNote('316_DEFERRED_IDENTITY_VERIFY','B2 已永久封閉後，改由 3F 316 整合行政、文史、門禁、409-A、第二院區與 6F 物證，重建張守恆 MED-870409。');
          uiManager.updateTasks();
          soundManager.playDoorLockClack();
          setTimeout(()=>uiManager.showSubtitle('全院廣播','「CODE BLACK。偵測到已除籍死亡人員 MED-870409 重新登入。04:09 前，夜班紀錄將由李承禮覆寫模板封存。」',6800),1800);
          return {resolved:true,message:'[DEFERRED VERIFICATION @ 316]\n行政／文史／門禁／臨床物證 ........ MATCH\nMED-87 + 409-A + 姓名片段 ........ MATCH\n\n>>> IDENTITY RECONSTRUCTED\n>>> 張守恆 / MED-870409'};
        }
      });
      return;
    }
    if(gameState.getFlag('M8_IDENTITY_BATTLE_ACTIVE')&&worldRouter.activeZoneId==='first_campus_3f'){
      gameState.setGameTime('04:05');
      controller.enabled=false;
      uiManager.openFinalHandoff(({name,employeeId})=>{
        if(name===TRUE_NAME_CANON&&employeeId==='MED-870409'&&persistentMemory.data.trueNameResolved&&persistentMemory.hasAllProofs()){
          gameState.setFlag('GAME_COMPLETE',true);
          gameState.setFlag('M8_IDENTITY_BATTLE_ACTIVE',false);
          persistentMemory.completeGame();
          uiManager.showFinalSuccess(TRUE_NAME_CANON);
          controller.enabled=false;
        }else{
          const hasInput=name||employeeId;
          uiManager.setFinalHandoffStatus(hasInput?'姓名或員編不符｜李承禮覆寫模板正在接管交班':'請輸入姓名與員編');
          if(hasInput){
            setTimeout(()=>{
              uiManager.closeFinalHandoff(false);
              loopManager.triggerLegendOverride('FINAL',{legend:'最終覆寫 — 晨間交班',reason:'今日值班醫師已確認；你已被收治。'});
            },650);
          }
        }
      });
    uiManager.setFinalHandoffStatus('李承禮 MED-820316 覆寫模板已在 316 登入｜請宣告真正姓名與員編');
      return;
    }
    controller.enabled = false;
    uiManager.openWorkstation();
    if(!gameState.getFlag('HIS_CREDENTIALS')){
      uiManager.showSubtitle('值班醫師','「但是我沒有帳號密碼……」',2800);
    }
    checkElevatorReady();
  } else if (interactable.type === 'memory_evidence') {
    const sequence=getMemorySequence(interactable.memoryId);
    if(!sequence)return;
    persistentMemory.rememberEvidence(sequence.id);
    if(sequence.id==='M1_ADMIN_DUTY_PHOTO')gameState.setFlag('B2_ADMIN_SOURCE',true);
    if(sequence.id==='M1_ARCHIVE_6F_ALBUM')gameState.setFlag('B2_HISTORY_SOURCE',true);
    if(sequence.id==='M6_6F_PLAYBACK')gameState.setFlag('SIX_FLOOR_HISTORY_CONFIRMED',true);
    controller.enabled=false;
    uiManager.openMemorySequence(sequence);
  } else if (interactable.type === 'era_poster') {
    controller.enabled=false;
    uiManager.openPoster(interactable.posterData);
  } else if (interactable.type === 'er_nurse_computer') {
    uiManager.showSubtitle('值班醫師','「這個電腦是護理師專用，請醫師用醫師診療室專用電腦。」',3600);
  } else if (interactable.type === 'archive_document') {
    controller.enabled = false;
    uiManager.openArchiveDocument({title:interactable.documentTitle,pages:interactable.pages});
    gameState.addEvidence(1);
    if(interactable.id?.startsWith('ADMIN_'))gameState.setFlag('B2_ADMIN_SOURCE',true);
    if(interactable.id?.startsWith('ARCHIVE_'))gameState.setFlag('B2_HISTORY_SOURCE',true);
    if(interactable.id==='ARCHIVE_UNINDEXED_HANDOFF'&&gameState.getFlag('ARCHIVE_OBJECTIVE')){
      gameState.markTaskComplete('ARCHIVE_CLUE_FOUND');
      gameState.setFlag('ARCHIVE_CLUE_FOUND',true);
      gameState.setFlag('ANNE_STAGE',2);
      gameState.setFlag('GUARD_FUTURE_ENTRY',true);
      gameState.setFlag('HOOK_409_ZERO_ROOM',true);
      registerBed33Clue('ARCHIVE_0409');
      persistentMemory.learnCode('code_0217');
      persistentMemory.learnCode('code_0316');
      gameState.setFlag('HOOK_0316_COMMAND_POINT',true);
      gameState.setFlag('HOOK_1F_HIDDEN_DOOR',true);
      gameState.setFlag('HOOK_0217',true);
      floorStateManager.setPhase(GamePhase.AFTER_ARCHIVE);
      worldRouter.activeZoneInstance?.applyGamePhase?.(GamePhase.AFTER_ARCHIVE,gameState);
      worldRouter.activeZoneInstance?.syncHorrorState?.();
    }
  } else if (interactable.type === 'bed33_board') {
    registerBed33Clue('BEDBOARD_33_409A');
    controller.enabled=false;
    uiManager.openArchiveDocument({title:interactable.documentTitle,pages:interactable.pages});
  } else if (interactable.type === 'bed33_his_status') {
    registerBed33Clue('HIS_409_CLOSED');
    controller.enabled=false;
    uiManager.openArchiveDocument({title:interactable.documentTitle,pages:interactable.pages});
  } else if (interactable.type === 'bed33_409_sealed') {
    if(gameState.isTaskComplete('P1_NORMAL_EVENT_DONE'))gameState.setFlag('FOURF_409_SEAL_CHECKED_AFTER_408C',true);
    registerBed33Clue('DOOR_409_SEALED');
    uiManager.updateTasks();
    controller.enabled=false;
    uiManager.openArchiveDocument({title:interactable.documentTitle,pages:interactable.pages});
  } else if (interactable.type === 'bed33_assignment') {
    if(!gameState.isTaskComplete('P1_4F_REPORT')){
      uiManager.showSubtitle('夜班護理師','「先完成護理站交班，再處理這張床位單。」',2500);
      return;
    }
    if(!gameState.isTaskComplete('P1_NORMAL_EVENT_DONE')){
      uiManager.showSubtitle('值班醫師','「先去 408C 確認敲牆聲。」',2500);
      return;
    }
    if(!gameState.getFlag('FOURF_409_SEAL_CHECKED_AFTER_408C')){
      uiManager.showSubtitle('值班醫師','「先去確認 409 的封條，再回護理站核對這張床位單。」',3200);
      return;
    }
    controller.enabled=false;
    uiManager.openBed33Assignment({
      canReject:true,
      rememberedRule:persistentMemory.data.survivalRules.neverSignBed33
    });
  } else if (interactable.type === 'acute_gate') {
    const changed = worldRouter.activeZoneInstance.toggleAcuteGate(controller.position);
    if (changed) {
      soundManager.playClick();
    } else {
      uiManager.showSubtitle('門禁', '請先離開鐵門門幅，再刷卡關門。', 2500);
    }
    controller.currentInteractable = null;
    uiManager.showPrompt(null);
  } else if (interactable.type === 'guard_post_inspection') {
    gameState.setFlag('B2_SECURITY_SOURCE',true);
    gameState.setFlag('SECURITY_RECORD_OBJECTIVE',false);
    const learnedPanel=gameState.getFlag('B_PANEL_CLUE_KNOWN')===true;
    if(learnedPanel&&!gameState.getFlag('B_PANEL_KEY')){
      gameState.setFlag('B_PANEL_KEY',true);
      gameState.setFlag('FIRST_FLOOR_GUARD_KEY',true);
      persistentMemory.addJournalNote('WANG_B_PANEL_KEY','王世榮 SEC-760117 的值勤簿記載：B-Panel 十字鑰匙屬警衛門禁設備，實體仍掛在警衛台金屬鑰匙櫃。');
    }
    if(!gameState.getFlag('HIDDEN_SERVICE_DOOR_DISCOVERED')){
      gameState.setFlag('HIDDEN_SERVICE_DOOR_DISCOVERED',true);
      worldRouter.activeZoneInstance?.syncStoryState?.();
      soundManager.playClick();
      const keyLine=learnedPanel?'鑰匙櫃裡那把褪色紫牌十字鑰匙正標著「B-PANEL」。':'鑰匙櫃裡有一排老舊機房鑰匙。';
      uiManager.showSubtitle('值班醫師','「王世榮的值勤簿……'+keyLine+'」\nCCTV 最後一頁停在 02:17，警衛設備旁的牆面浮出一道舊門框接縫。',5600);
    }else{
      uiManager.showSubtitle('值班醫師','「舊門框就在警衛台後面。王世榮留下的門禁紀錄和 B-Panel 鑰匙都對上了。」',3200);
    }
  } else if (interactable.type === 'hidden_service_door_1f') {
    if(!gameState.getFlag('HIDDEN_SERVICE_DOOR_DISCOVERED')){
      uiManager.showSubtitle('值班醫師','先檢查警衛台上的 CCTV、值勤簿和鑰匙櫃。',2600);
      return;
    }
    if(!gameState.getFlag('B_PANEL_KEY')){
      uiManager.showSubtitle('值班醫師','「牆面接縫不像一般裝修……B-Panel 的十字鑰匙應該還在警衛設備裡。」',3200);
      return;
    }
    if(gameState.getFlag('B2_EXITED_PERMANENTLY')){
      soundManager.playDoorLockClack();
      uiManager.showSubtitle('值班醫師','「門已經從 B2 那一側永久鎖死。沒有第二次機會。」',3400);
      return;
    }
    if(gameState.getFlag('M7_B2_OPEN')){worldRouter.loadZone('b2_archive','b2_archive_entry');return;}
    gameState.setGameTime('02:17');
    controller.enabled=false;
    uiManager.openStoryChoice({
      title:'02:17｜警衛台後方 B-Panel',
      body:'02:17。舊工務手冊要求依序拉下 1 → 3 → 4；監控卻顯示這個動作讓防火門鎖死、備援排煙停止。旁邊另有一個必須插入十字鑰匙才能轉動的紫色備援排煙旋鈕。',
      primaryText:'照舊手冊拉下 1 → 3 → 4',
      secondaryText:'用十字鑰匙啟動紫色備援排煙',
      onPrimary:()=>loopManager.triggerLegendOverride('TIMELOOP',{legend:'02:17 — 重演',reason:'你成了事故紀錄裡的人。'}),
      onSecondary:()=>{
        gameState.setFlag('M7_B2_OPEN',true);
        gameState.setFlag('B2_DOOR_READY',true);
        persistentMemory.setProof('time',true);
        persistentMemory.addJournalNote('B2_OPEN','02:17 的 1→3→4 是歷史錯誤。我改用王世榮保管的十字鑰匙啟動紫色備援排煙；隱藏服務門因此鬆開。');
        worldRouter.loadZone('b2_archive','b2_archive_entry');
        controller.enabled=true;
      }
    });
  } else if (interactable.type === 'b2_archive_terminal') {
    if(gameState.getFlag('M7_B2_RESOLVED')){
      uiManager.showSubtitle('封存終端','IDENTITY RECONSTRUCTED：'+TRUE_NAME_CANON+'｜MED-870409｜第一線住院醫師',3600);
      return;
    }
    const missing=[];
    if(!gameState.getFlag('B2_ADMIN_SOURCE'))missing.push('行政端原始紀錄');
    if(!gameState.getFlag('B2_HISTORY_SOURCE'))missing.push('歷史封存索引');
    if(!gameState.getFlag('B2_LEGACY_SOURCE'))missing.push('316 舊終端');
    if(!gameState.getFlag('B2_SECURITY_SOURCE'))missing.push('夜間門禁來源');
    if(!persistentMemory.hasEvidence('B2_VICTIM_MAP'))missing.push('B2 火災罹難者位置圖');
    const fragments=persistentMemory.data.trueNameFragments;
    if(!fragments.frag_surname||!fragments.frag_givenName_1||!fragments.frag_givenName_2)missing.push('姓名片段');
    if(missing.length){
      gameState.setFlag('B2_IDENTITY_INCOMPLETE',true);
      uiManager.updateTasks();
      uiManager.showSubtitle('ARCHIVE CONSISTENCY CHECK','「驗證未完成。尚缺：'+missing.join('、')+'。可以繼續查看 B2 原始資料；若現在離開，B2 將永久鎖閉，只能在其他樓層繼續搜尋。」',5800);
      return;
    }
    controller.enabled=false;
    uiManager.openIdentityMatrix({
      candidates:IDENTITY_CANDIDATES,
      onSelect:candidate=>{
        if(candidate.id!=='ZHANG_SHOUHENG')return {resolved:false,message:candidate.contradiction};
        const blockers=[];
        if(!gameState.getFlag('BED33_RESOLVED'))blockers.push('409-A 拒簽');
        if(!gameState.getFlag('M3_316_DECODED'))blockers.push('ER-0217 / MED-87');
        if(!gameState.getFlag('M4_CHEST_RESOLVED'))blockers.push('504B 轉院拒簽');
        if(!gameState.getFlag('FLOOR6_STETHOSCOPE_INSPECTED'))blockers.push('6F 刻字聽診器');
        if(blockers.length)return {resolved:false,message:'候選人方向合理，但證據鏈仍缺：'+blockers.join('、')+'。不能靠名字猜答案。'};
        persistentMemory.setTrueNameFragment('frag_title','住院醫師');
        persistentMemory.setTrueNameFragment('frag_employeeFull','MED-870409');
        if(!persistentMemory.resolveTrueName(TRUE_NAME_CANON))return {resolved:false,message:'姓名片段仍未完成一致性收斂。請回查行政、人事、第二院區與 6F 證物。'};
        gameState.setFlag('M7_B2_RESOLVED',true);
        gameState.setFlag('M8_IDENTITY_BATTLE_ACTIVE',true);
        while(persistentMemory.data.identityErosionLevel<4)persistentMemory.raiseErosion(1);
        persistentMemory.addJournalNote('B2_ARCHIVE_VERIFY','B2 身分矩陣排除李承禮、周啟文與陳柏勳；時間、空間、409-A 與聽診器物證一致指向張守恆 MED-870409。');
        uiManager.updateTasks();
        return {resolved:true,message:'[EVIDENCE] 409-A 拒簽 ........ MATCH\n[EVIDENCE] ER-0217 / MED-87 ... MATCH\n[EVIDENCE] 504B 轉院拒簽 ...... MATCH\n[EVIDENCE] 6F 聽診器刻字 ...... MATCH\n[EVIDENCE] 409-A 約束記憶 ...... MATCH\n\n>>> IDENTITY RECONSTRUCTED\n>>> 張守恆 / MED-870409'};
      }
    });
  } else if (interactable.type === 'b2_exit_door') {
    const resolved=gameState.getFlag('M7_B2_RESOLVED')===true;
    gameState.setFlag('B2_EXITED_PERMANENTLY',true);
    gameState.setFlag('M7_B2_OPEN',false);
    gameState.setFlag('HIDDEN_SERVICE_DOOR_DISCOVERED',false);
    gameState.setFlag('SECURITY_RECORD_OBJECTIVE',false);
    if(resolved)gameState.setGameTime('03:30');
    worldRouter.loadZone('first_campus_1f','first_1f_guard_back');
    if(resolved){
      gameState.setFlag('LAST_CALL_SEEN',true);
      gameState.setFlag('M8_CODE_BLACK_ANNOUNCED',true);
      persistentMemory.resolveLegend('lastCall');
      persistentMemory.addJournalNote('M8_CODE_BLACK','B2 身分重建後，全院系統將 MED-870409 判定為「已死亡／已除籍卻重新登入」的人員，開始自動封門並搶回 316 交班權限。');
      soundManager.playDoorLockClack();
      setTimeout(()=>uiManager.showSubtitle('全院廣播','「CODE BLACK。偵測到已除籍死亡人員 MED-870409 重新登入。門禁完整性程序啟動。04:09 前，夜班紀錄將由李承禮覆寫模板封存。」',7200),700);
    }else{
      gameState.setFlag('B2_IDENTITY_INCOMPLETE',true);
      gameState.setGameTime('03:10');
      persistentMemory.addJournalNote('B2_EXIT_INCOMPLETE','我在身分驗證尚未完成時離開 B2。單向門已永久鎖閉；後續只能從行政、文史、316 舊終端、門禁與臨床物證補齊，最後回 316 完成延後身分重建。');
      setTimeout(()=>uiManager.showSubtitle('值班醫師','「門鎖死了……回不去 B2。先把院內缺的資料找齊，最後回 3F 316 重建身分。」',4600),700);
    }
    uiManager.updateTasks();
    controller.enabled=true;
  } else if (interactable.type === 'security_monitor_anomaly') {
    gameState.setFlag('CCTV_SELF_DUPLICATE_SEEN',true);
    gameState.setFlag('M5_CCTV_RESOLVED',true);
    gameState.setFlag('SIX_FLOOR_HISTORY_CONFIRMED',true);
    persistentMemory.rememberEvidence('M5_SECURITY_PLAYBACK');
    persistentMemory.addJournalNote('CCTV_SELF_DUPLICATE','第二院區監控抽幀先拍到 1998 的 6F、劉志遠與警衛衝突；即時畫面又同時出現我和另一個值班醫師。辨識框短暫顯示 LI_CHENG_LI / MED-820316。');
    controller.enabled=false;
    uiManager.openMemorySequence(getMemorySequence('M5_SECURITY_PLAYBACK'),()=>{
      completeM5IfReady();
      uiManager.updateTasks();
    });
  } else if (interactable.type === 'exit_door' || interactable.type === 'closed_door') {
    soundManager.playClick();
    if (interactable.id === '1F_MAIN_DOOR') {
      uiManager.showSubtitle('值班醫師', '「值班時間都會關起來，出不去。」', 3500);
    } else if (interactable.id === '1F_PHARM_GATE') {
      uiManager.showSubtitle('值班醫師', '「夜間門診藥局已打烊，非急診調劑時段不開放。」', 3500);
    } else if (interactable.id === '2F_ACUTE_GATE') {
      uiManager.showSubtitle('值班醫師', '「2F 急診封閉式病房區，夜間門禁管制鎖定中。」', 3500);
    } else {
      uiManager.showSubtitle('值班醫師', interactable.subtitle || '「夜間門禁管制時間，此區域暫不開放。」', 3000);
    }
  } else if (interactable.type === 'elevator' || interactable.type === 'travel_selector') {
    if(!gameState.getFlag('STAFF_ACCESS_CARD')){
      soundManager.playClick();
      uiManager.showSubtitle('門禁','「電梯與安全梯尚未授權。先到總醫師辦公室領取感應卡。」',2800);
      return;
    }
    if(interactable.kind==='stairs'&&worldRouter.activeZoneId==='first_campus_3f'&&!gameState.getFlag('STAIR_SHORTCUT_3F_4F')){
      soundManager.playDoorLockClack();
      uiManager.showSubtitle('值班醫師','「逃生梯從另一側用插銷鎖住了。」',2800);
      return;
    }
    if(interactable.kind==='stairs'&&worldRouter.activeZoneId==='first_campus_4f'&&!gameState.getFlag('STAIR_SHORTCUT_3F_4F')){
      gameState.setFlag('STAIR_SHORTCUT_3F_4F',true);
      uiManager.showSubtitle('值班醫師','「從這側可以把插銷拔開……3F 和 4F 的逃生梯打通了。」',3200);
    }
    controller.enabled = false;
    const travelFrom=worldRouter.activeZoneId;
    uiManager.openTravelSelector(worldRouter.floorDestinations(interactable.kind), travelFrom, destination => {
      if(interactable.kind==='elevator'&&destination.zoneId.startsWith('first_campus_')&&gameState.getFlag('FLOOR6_AVAILABLE')&&!gameState.getFlag('M6_FLOOR6_RESOLVED')){
        gameState.setFlag('PHANTOM6_RETURN_ZONE',destination.zoneId);
        gameState.setFlag('FLOOR6_AVAILABLE',false);
        floorStateManager.setPhase(GamePhase.ELEVATOR_GLITCH);
        worldRouter.loadZone('phantom_6f','phantom_6f_lift');
        uiManager.showSubtitle('電梯樓層顯示器','6',2200);
        controller.enabled=true;
        return;
      }
      if(destination.zoneId==='phantom_6f')gameState.setFlag('PHANTOM6_RETURN_ZONE',travelFrom);
      if(interactable.kind==='elevator'&&travelFrom==='first_campus_2f'&&destination.zoneId==='first_campus_4f'&&gameState.getFlag('FORCE_3F_ELEVATOR_STOP')&&!gameState.getFlag('FORCED_3F_ELEVATOR_STOP_DONE')){
        gameState.setFlag('FORCED_3F_ELEVATOR_STOP_DONE',true);
        gameState.setFlag('STAIR_SHORTCUT_3F_4F',true);
        floorStateManager.setPhase(GamePhase.ELEVATOR_GLITCH);
        gameState.setGameTime('20:40');
        worldRouter.loadZone('first_campus_3f','first_3f_lift');
        uiManager.showSubtitle('值班醫師','「……不是 4F。電梯怎麼停在三樓？」',3200);
        controller.enabled=true;
        return;
      }
      if (destination.zoneId === 'first_campus_4f') gameState.markTaskComplete('WARD_ENTRY');
      worldRouter.loadZone(destination.zoneId, destination.spawn);
      const dutyLine=dutyEvents.onZoneEntered(destination.zoneId);
      worldRouter.activeZoneInstance?.syncStoryState?.();
      if(dutyLine){
        if(destination.zoneId==='first_campus_2f'&&gameState.gameTime==='20:05')soundManager.playPhoneRingPattern();
        uiManager.showSubtitle(dutyLine.speaker,dutyLine.text);
      }
      controller.enabled = true;
    }, interactable.kind, prefetchDestinationAssets);
  } else if (interactable.type === 'second_campus_nursing_report') {
    if(!gameState.getFlag('SECOND_CAMPUS_ACCESS')){
      uiManager.showSubtitle('值班醫師','「我現在沒有第二院區權限。」',2200);
      return;
    }
    if(!gameState.getFlag('SECOND_CAMPUS_5F_REPORTED')){
      gameState.setFlag('SECOND_CAMPUS_5F_REPORTED',true);
      persistentMemory.addJournalNote('SECOND_5F_REPORT','第二院區 5F 護理站交班：陳怡君，504B。李承禮總醫師已預開醫囑並預蓋章，只等值班醫師簽名。');
      worldRouter.activeZoneInstance?.syncStoryState?.();
      uiManager.showSubtitle('第二院區護理師','「醫師你剛剛開好了，現在簽名就好。病人是陳怡君，在 504B；李承禮總醫師已經預開醫囑、預蓋章。你先去看一下她。」',5600);
    }
  } else if (interactable.type === 'second_chest_patient') {
    if(!gameState.getFlag('SECOND_CAMPUS_ACCESS')){
      uiManager.showSubtitle('值班醫師','「我現在沒有第二院區權限。」',2200);
      return;
    }
    if(!gameState.getFlag('SECOND_CAMPUS_5F_REPORTED')){
      uiManager.showSubtitle('值班醫師','「先到護理站報到，確認病人身分與床位。」',2600);
      return;
    }
    if(!gameState.getFlag('SECOND_CHEST_PATIENT_SEEN')){
      gameState.setFlag('SECOND_CHEST_PATIENT_SEEN',true);
      persistentMemory.addJournalNote('CHEST_PATIENT','陳怡君因胸悶、心悸與焦慮前來；生命徵象穩定，表現符合焦慮伴隨換氣過度。');
      worldRouter.activeZoneInstance?.syncStoryState?.();
      uiManager.showSubtitle('值班醫師','「生命徵象穩定，心電圖也沒有急性變化。先陪她放慢呼吸，這比較像焦慮引起的換氣過度。」',5200);
    }else uiManager.showSubtitle('陳怡君','「胸口好多了，謝謝醫師。」',2800);
  } else if (interactable.type === 'second_chest_roster_clue') {
    if(!gameState.getFlag('M4_CHEST_RESOLVED')){
      uiManager.showSubtitle('值班醫師','「先完成病人評估與轉院單查核，再看這張舊名冊。」',2800);
      return;
    }
    if(!gameState.getFlag('M4_NAME_CLUE_FOUND')){
      persistentMemory.setTrueNameFragment('frag_givenName_1','守');
      persistentMemory.addJournalNote('TRUE_NAME_SHOU','第二院區病床旁的舊名冊殘頁：第一線：張 守 [墨漬]。');
      gameState.setFlag('M4_NAME_CLUE_FOUND',true);
      controller.enabled=false;
      uiManager.openArchiveDocument({title:interactable.documentTitle,pages:interactable.pages});
    }
  } else if (interactable.type === 'floor6_stethoscope_search') {
    if(!gameState.getFlag('FLOOR6_STETHOSCOPE_FOUND')){
      gameState.setFlag('FLOOR6_STETHOSCOPE_FOUND',true);
      worldRouter.activeZoneInstance?.syncStoryState?.();
      soundManager.playClick();
      uiManager.showSubtitle('值班醫師','「摸到一個冰冷的金屬物件……是老舊聽診器。」',3600);
    }
  } else if (interactable.type === 'floor6_stethoscope_inspect') {
    if(!gameState.getFlag('FLOOR6_STETHOSCOPE_FOUND')||gameState.getFlag('FLOOR6_STETHOSCOPE_INSPECTED'))return;
    controller.enabled=false;
    uiManager.openStoryChoice({
      title:'6F｜老舊聽診器近距離檢視',
      body:`金屬表面氧化，胸件周圍滿是刮痕，黑色管線已經龜裂。刻字被灰塵和污垢覆住。

要翻到胸件背面，還是先擦掉表面的灰塵？`,
      primaryText:'翻到胸件背面',
      secondaryText:'擦掉表面灰塵',
      onPrimary:revealTrueName,
      onSecondary:revealTrueName
    });
    function revealTrueName(){
      gameState.setFlag('FLOOR6_STETHOSCOPE_INSPECTED',true);
      gameState.setFlag('M5_NAME_CLUE_FOUND',true);
      persistentMemory.setTrueNameFragment('frag_givenName_2','恆');
      persistentMemory.addJournalNote('TRUE_NAME_HENG','在 6F 焦黑器材旁找到的老舊聽診器，經翻面／拭塵後讀到「祝 守恆 醫師／1997／執業誌慶」。');
      worldRouter.activeZoneInstance?.syncStoryState?.();
      uiManager.showSubtitle('聽診器胸件背面','「祝 守恆 醫師\n1997\n執業誌慶」',4200);
      controller.enabled=true;
    }
  } else if (interactable.type === 'second_chest_transfer') {
    if(!gameState.getFlag('SECOND_CHEST_PATIENT_SEEN')){
      uiManager.showSubtitle('值班醫師','「標題是『病人處置醫囑』。先去 504B 看過陳怡君，再回來核對內容。」',3000);
      return;
    }
    if(gameState.getFlag('M4_CHEST_RESOLVED')){
      uiManager.showSubtitle('值班醫師','「這張轉院單目的地是第一院區 409A，而且已經有我的名字。」',3000);
      return;
    }
    controller.enabled=false;
    uiManager.openStoryChoice({
      title:'第二院區｜病人處置醫囑',
      body:`陳怡君，主訴胸悶與心悸。生命徵象穩定，心電圖沒有急性變化；評估符合焦慮伴隨換氣過度。

重新核對病人後才發現，這份「病人處置醫囑」的第二頁其實是已填妥的轉院單：目的地「第一院區 409A」，預審醫師「李承禮 MED-820316」。

護理師：「醫師你剛剛開好了，現在簽名就好。李承禮總醫師已經預開醫囑、預蓋章，只差你的接治簽名。」`,
      primaryText:'補上簽名',
      secondaryText:'拒絕簽署並重新查核',
      onPrimary:()=>loopManager.triggerLegendOverride('CHEST',{legend:'LEGEND 03 — 事先填妥的轉院單',reason:'轉院目的地是 409A。'}),
      onSecondary:()=>{
        gameState.setGameTime('01:45');
        gameState.setFlag('M4_CHEST_RESOLVED',true);
        gameState.setFlag('CHEST_RECORD_MATCH',true);
        persistentMemory.resolveLegend('chestPain');
        persistentMemory.addJournalNote('CHEST_RESOLVED','焦慮引起的胸悶已改善；轉院單卻事先填妥第一院區 409A，並留有「李○○」簽名。');
        persistentMemory.raiseErosion(1);
        uiManager.showSubtitle('第二院區護理師','「這張單明明有李承禮的預審章……你又說 409-A 根本不能收治。」',4400);
        controller.enabled=true;
      }
    });  } else if (interactable.type === 'bridge_loop_event') {
    if(!gameState.getFlag('M5_CCTV_RESOLVED')){
      uiManager.showSubtitle('值班醫師','「第二院區監控室那段影像還沒看完。裡面出現了不存在的 6F，先回去確認。」',4200);
      uiManager.updateTasks();
      return;
    }
    if(gameState.getFlag('M5_BRIDGE_RESOLVED')){
      uiManager.showSubtitle('值班醫師','「一直往前。不要回頭。」',2200);return;
    }
    controller.enabled=false;
    uiManager.openStoryChoice({
      title:'8F 天橋｜窗戶倒影',
      body:'走到一半，腳步忽然停住。窗戶倒影裡多出一個穿白袍的人影。她站在你身後，雙臂平舉，雙手交疊。\n\n要回頭看清楚，還是忍住不回頭？',
      primaryText:'回頭看清楚',
      secondaryText:'忍住，不要回頭',
      onPrimary:()=>loopManager.triggerLegendOverride('BRIDGE',{legend:'LEGEND 04 — 不能回頭的天橋',reason:'另一位值班醫師已通過。'}),
      onSecondary:()=>{
        gameState.setGameTime('02:00');
        gameState.setFlag('M5_BRIDGE_RESOLVED',true);
        gameState.setFlag('M5_BRIDGE_COMMITTED',true);
        gameState.setFlag('M5_ROUTE_CHOICE_RESOLVED',true);
        persistentMemory.resolveLegend('bridge');
        persistentMemory.addJournalNote('BRIDGE_SAFE','越過天橋中線後不要回頭；保持前進，直到返回第一院區。');
        completeM5IfReady();
        controller.enabled=true;
      }
    });
  } else if (interactable.type === 'floor6_safe_return') {
    if(!gameState.getFlag('FLOOR6_STETHOSCOPE_FOUND')){
      uiManager.showSubtitle('值班醫師','「等等……焦黑器材旁好像有東西在反光，應該先看一下。」',3400);
      return;
    }
    if(!gameState.getFlag('FLOOR6_STETHOSCOPE_INSPECTED')){
      uiManager.showSubtitle('值班醫師','「那個反光的是老舊聽診器，胸件背面像有刻字，應該看清楚。」',3400);
      return;
    }
    if(!gameState.getFlag('M6_FLOOR6_RESOLVED')){
      gameState.setFlag('M6_FLOOR6_RESOLVED',true);
      gameState.setFlag('VERTICAL_PROOF_FRAGMENT',true);
      persistentMemory.resolveLegend('floor6');
      persistentMemory.addJournalNote('FLOOR6_SAFE','文史相簿與監控都證明 6F 臨床技能教學室曾存在。取得證物後不要深入濃煙區；先查警衛門禁。');
      persistentMemory.raiseErosion(1);
    }
    gameState.setFlag('SECURITY_RECORD_OBJECTIVE',true);
    worldRouter.loadZone('first_campus_1f');
    controller.enabled=true;
    uiManager.showSubtitle('值班醫師','「如果這個樓層真的不存在，電梯系統不一定會留下正常紀錄……但夜間門禁和監視系統一定會記錄有人經過。去一樓警衛台。」',5400);
  } else if (interactable.type === 'guard_sign_2117') {
    if(!gameState.getFlag('NIGHT_PATROL_RETURN_3F'))return;
    if(!gameState.getFlag('GUARD_SIGN_EXAMINED')){
      gameState.setFlag('GUARD_SIGN_EXAMINED',true);
      const zone=worldRouter.activeZoneInstance;
      if(zone?.guardLog2117)zone.guardLog2117.userData.interactable=true;
      soundManager.playPaperSign();
      uiManager.showSubtitle('值班醫師','「21:17……三樓巡查完成？現在就是 21:17。這不是剛好，是有人先替我寫好了。」',5200);
      uiManager.updateTasks();
    }else{
      uiManager.showSubtitle('值班醫師','「牌子上的 21:17 沒變。桌上的簽名簿才是關鍵。」',2800);
    }
  } else if (interactable.type === 'guard_book_2117') {
    if(!gameState.getFlag('NIGHT_PATROL_RETURN_3F'))return;
    if(!gameState.getFlag('GUARD_SIGN_EXAMINED')){
      uiManager.showSubtitle('值班醫師','「先把牆上的查哨紀錄看清楚。」',2400);
      return;
    }
    if(!gameState.getFlag('BOOTSTRAP_2117_RESOLVED')){
      gameState.setFlag('BOOTSTRAP_2117_RESOLVED',true);
      gameState.setFlag('TIME_PROOF_FRAGMENT',true);
      gameState.setFlag('POST_2117_RETURN_TO_DUTY_ROOM',true);
      gameState.setFlag('SANDBOX_MODE',false);
      persistentMemory.learnCode('code_0217');
      persistentMemory.addJournalNote('ECHO_2117','17點看到的「21:17 三樓巡查完成」，最後是我自己回來完成的。');
      gameState.setGameTime('21:17');
      soundManager.playPaperSign();
      uiManager.showSubtitle('值班醫師','「筆跡不是我的……但簽的卻是我的名字。原來那行 21:17，不是預言，是我正在把它完成。」',6200);
      setTimeout(()=>uiManager.showSubtitle('值班醫師','「先回 4F 值班室。我要把今晚發生的事情整理清楚。」',3600),1500);
      uiManager.updateTasks();
    }else{
      uiManager.showSubtitle('值班醫師','「這一行已經完成了。下一次異常不該現在就出現。」',2600);
    }
  } else if (interactable.type === 'er_exit_notice') {
    uiManager.showSubtitle('夜間出入口告示','「此門只進不出。」',2600);
  } else if (interactable.type === 'er_ghost_registration') {
    if(!gameState.getFlag('GHOST_REGISTRATION_AVAILABLE')){
      uiManager.showSubtitle('急診掛號系統','目前沒有待處理的異常掛號。',2200);
      return;
    }
    if(gameState.getFlag('LEGEND_ER0033_RESOLVED')){
      uiManager.showSubtitle('值班醫師','「00:33 那筆掛號已經查過了。現場始終沒有對應的病人。」',3200);
      return;
    }
    gameState.setGameTime('00:33');
    controller.enabled=false;
    uiManager.openStoryChoice({
      title:'00:33｜急診掛號紀錄',
      body:'掛號編號：1998-ER-0217\n建檔時間：00:33\n\n護理師：「檢傷區、候診區、留觀床都沒有人。」\n\n系統提供「建立新病歷」與「僅查閱舊索引」兩種處理方式。',
      primaryText:'建立新病歷',
      secondaryText:'只查閱，不建立',
      onPrimary:()=>loopManager.triggerLegendOverride('ER0033',{legend:'LEGEND 02 — 00:33 急診掛號',reason:'你已完成掛號。'}),
      onSecondary:()=>{
        gameState.setFlag('ER0033_SLIP_COLLECTED',true);
        persistentMemory.addJournalNote('ER0033_SLIP','00:33 系統已有一筆 1998-ER-0217 掛號，但急診現場沒有病人。先不要建新檔，把舊掛號聯帶回 316 查封存索引。');
        uiManager.showSubtitle('值班醫師','「不能用現在的 HIS 建檔。把這張 1998-ER-0217 帶回 316 查舊索引。」',4400);
        controller.enabled=true;
      }
    });
  } else if (interactable.type === 'p1_action') {
    const action=interactable.action;
    if(action==='NURSE_REPORT'){
      if(!gameState.isTaskComplete('WARD_ENTRY')) return uiManager.showSubtitle('值班醫師','「先正式抵達 4F 再報到。」',2500);
      if(gameState.isTaskComplete('P1_4F_REPORT')) return;
      dutyEvents.complete('P1_4F_REPORT','17:15');
      interactable.interactable=false;
      uiManager.showSubtitle('晚班護理師','「值班醫師，今晚四樓滿床 32 床。408C 的老先生一直說隔壁有人敲牆；409 仍封閉整修。19:30 麻煩你去 408C 看一下。」',5600);
      uiManager.updateTasks();
    } else if(action==='NORMAL_EVENT'){
      if(!gameState.isTaskComplete('P1_4F_REPORT')) return uiManager.showSubtitle('值班醫師','「先去護理站報到。」',2500);
      if(gameState.isTaskComplete('P1_NORMAL_EVENT_DONE')) return;
      dutyEvents.complete('P1_NORMAL_EVENT_DONE','19:30');
      interactable.interactable=false;
      soundManager.playBed33KnockPattern();
      registerBed33Clue('KNOCK_408C_49');
      worldRouter.activeZoneInstance?.setDutyDoorClosed?.(true);
      uiManager.showSubtitle('408C 老先生','「醫師！隔壁又在敲了！每次都敲四下，停一下，又敲九下……」',5600);
      uiManager.updateTasks();
    } else if(action==='ER_ASSESS'){
      if(!gameState.getFlag('P1_ER_CALL_ANSWERED')) return uiManager.showSubtitle('值班醫師','「先接聽值班室電話，確認急診通知。」',2500);
      dutyEvents.complete('P1_ER_ASSESSMENT_DONE','20:25');
      gameState.setFlag('ER_JANE_DOE_WRISTBAND',false);
      gameState.setFlag('ER_UNKNOWN_MALE_TAG',true);
      gameState.setFlag('B_PANEL_CLUE_KNOWN',true);
      persistentMemory.rememberEvidence('M3_ER_PHOTO');
      persistentMemory.addJournalNote('LIU_MAINTENANCE_TAG','不詳男胸前燒焦吊牌：ENG-860214／6F SKILL LAB／B-PANEL。男子反覆說「不要拉三個、紫色燈、王世榮有鑰匙」。');
      uiManager.showSubtitle('不詳男','「不要……不要拉三個……六樓……紫色的燈……B-Panel 在一樓警衛台後面……王世榮有鑰匙……」',7600);
    } else if(action==='ER_NOTE'){
      if(!gameState.isTaskComplete('P1_ER_ASSESSMENT_DONE')) return uiManager.showSubtitle('值班醫師','「先完成病人評估。」',2500);
      dutyEvents.complete('P1_ER_NOTE_DONE','20:30');
      worldRouter.activeZoneInstance?.syncStoryState?.();
      gameState.setFlag('FORCE_3F_ELEVATOR_STOP',true);
      uiManager.showSubtitle('值班醫師','「評估紀錄先保留原始身分。不詳男沒有任何機房鑰匙；他只知道 B-Panel 與王世榮。鑰匙應該在警衛系統。」',5200);
    } else if(action==='END_SHIFT'){
      if(!gameState.isTaskComplete('P1_RETURN_4F')) return uiManager.showSubtitle('值班醫師','「還沒到可以休息的時候。」',2500);

      if(gameState.getFlag('BOOTSTRAP_2117_RESOLVED')&&!gameState.getFlag('POST_2117_DUTY_CALL_DONE')){
        triggerPost2117DutyRoomSequence();
        return;
      }

      if(gameState.isTaskComplete('ACT1_NORMAL_FLOW')||gameState.getFlag('NIGHT_PATROL_RETURN_3F')) return;
      dutyEvents.complete('ACT1_NORMAL_FLOW','21:00');
      uiManager.showSubtitle('值班醫師','「桌上怎麼有熱咖啡？剛剛值班室鑰匙都在我身上，是誰進來了？」');
      setTimeout(()=>{
        if(gameState.getFlag('NIGHT_PATROL_RETURN_3F')) return;
        gameState.setGameTime('21:15');
        startStoryPhoneCall('NIGHT_PATROL_2115');
      },2200);
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
  worldRouter.update(delta);
  if(gameState.getFlag('BRIDGE_REFLECTION_NOTICE_PENDING')){
    gameState.setFlag('BRIDGE_REFLECTION_NOTICE_PENDING',false);
    gameState.setFlag('BRIDGE_REFLECTION_NOTICE_SEEN',true);
    controller.enabled=false;controller.cancelAutoMove();
    controller.onInteract({type:'bridge_loop_event',forcedReflection:true});
  }
  if(gameState.getFlag('FAST_PATH_3F')&&gameState.getFlag('OPENED_316')&&!gameState.getFlag('FAST_PATH_316_ENTERED')&&worldRouter.activeZoneId==='first_campus_3f'){
    const p=controller.position;
    if(p.x>3.2&&p.x<10.8&&p.z>2.8&&p.z<8.2){
      gameState.setFlag('FAST_PATH_316_ENTERED',true);
      startStoryPhoneCall('FAST_PATH_316');
    }
  }
  if(gameState.getFlag('BRIDGE_OVERRIDE_PENDING')){
    gameState.setFlag('BRIDGE_OVERRIDE_PENDING',false);
    loopManager.triggerLegendOverride('BRIDGE',{legend:'LEGEND 04 — 不能回頭的天橋',reason:'你已經回頭三次。'});
  }

  // After the 21:17 bootstrap the player is explicitly sent back to the 4F duty room.
  // Crossing into the room automatically advances the story; no hidden E target is required.
  if(
    worldRouter.activeZoneId==='first_campus_4f' &&
    gameState.getFlag('POST_2117_RETURN_TO_DUTY_ROOM') &&
    !gameState.getFlag('POST_2117_DUTY_CALL_DONE')
  ){
    const bounds=worldRouter.activeZoneInstance?.dutyRoom?.bounds;
    if(bounds){
      const [x1,z1,x2,z2]=bounds;
      const p=controller.position;
      if(p.x>=Math.min(x1,x2)&&p.x<=Math.max(x1,x2)&&p.z>=Math.min(z1,z2)&&p.z<=Math.max(z1,z2)){
        triggerPost2117DutyRoomSequence();
      }
    }
  }

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
