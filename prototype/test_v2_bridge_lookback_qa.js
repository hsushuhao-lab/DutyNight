import assert from 'node:assert/strict';
import * as THREE from 'three';
import {gameState} from './src/core/GameState.js';
import {GeometryFactory} from './src/world/shared/GeometryFactory.js';
import {Skybridge} from './src/world/zones/Skybridge.js';
import {applyExteriorTime,getExteriorTimePhase} from './src/art/CampusBackdrop.js';

const context=new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))});
global.document={querySelector:()=>null,addEventListener(){},createElement:()=>({width:0,height:0,getContext:()=>context})};

gameState.resetForLoop();
gameState.setFlag('M4_CHEST_RESOLVED',true);
const bridge=new Skybridge(new THREE.Scene(),new GeometryFactory()).build();
const sky=bridge.zoneGroup.getObjectByName('Campus atmospheric sky');
assert.equal(getExteriorTimePhase('17:00'),'DUSK');
assert.equal(getExteriorTimePhase('21:17'),'DEEP_NIGHT');
assert.equal(getExteriorTimePhase('03:30'),'DAWN');
applyExteriorTime(bridge.zoneGroup,'21:17');
assert.equal(sky.material.uniforms.zenith.value.getHex(),0x050914,'21:17 exterior must switch to deep night');
applyExteriorTime(bridge.zoneGroup,'03:30');
assert.equal(sky.material.uniforms.horizon.value.getHex(),0xe1b18c,'03:30 exterior must switch to pre-dawn light');
const camera=new THREE.PerspectiveCamera();
camera.position.set(58,1.7,0);
camera.rotation.y=Math.PI/2;
bridge.update(camera,.01);
assert.equal(bridge.returnBridgeActive,true,'M4 must arm the return crossing from the second campus');

camera.rotation.y=-Math.PI/2;
bridge.update(camera,.46);
assert.equal(bridge.lookbackCount,1,'a sustained reverse look must escalate once');
bridge.update(camera,.46);
assert.equal(bridge.lookbackCount,1,'another reverse look requires a forward reset');
camera.rotation.y=Math.PI/2;
bridge.update(camera,.01);
camera.rotation.y=-Math.PI/2;
bridge.update(camera,.46);
assert.equal(bridge.lookbackCount,2);
assert(bridge.bridgeAnomalyLight.intensity>0,'lookback escalation must change localized bridge lighting');
assert(bridge.bridgeDoppelganger.position.x<46,'lookback escalation must bring the figure closer');

camera.position.x=29;
bridge.update(camera,.01);
assert.equal(gameState.getFlag('BRIDGE_REFLECTION_NOTICE_PENDING'),true,'return crossing must force the reflection notice before the midpoint');
gameState.setFlag('BRIDGE_REFLECTION_NOTICE_PENDING',false);
gameState.setFlag('BRIDGE_REFLECTION_NOTICE_SEEN',true);
bridge.update(camera,.01);
assert.equal(gameState.getFlag('M5_BRIDGE_COMMITTED'),true,'crossing the midpoint must lock the second-campus door');
camera.rotation.y=Math.PI/2;
bridge.update(camera,.01);
camera.rotation.y=-Math.PI/2;
bridge.update(camera,.46);
assert.equal(bridge.lookbackCount,3);
assert.equal(gameState.getFlag('BRIDGE_OVERRIDE_PENDING'),true,'the third sustained lookback must trigger the institutional loop');

console.log('DUTYNIGHT V2 BRIDGE LOOKBACK QA PASS');
