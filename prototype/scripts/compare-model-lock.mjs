import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {GeometryFactory} from '../src/world/shared/GeometryFactory.js';
const repositoryRoot=fileURLToPath(new URL('../..',import.meta.url));
const baseline='31f9e1b039a42317989291a1657b9901a673e748';
const files=execFileSync('git',['ls-tree','-r','--name-only',baseline,'prototype/src'],{encoding:'utf8',cwd:repositoryRoot}).trim().split(String.fromCharCode(10));
for(const file of files){
 const target=new URL('../.model-baseline/'+file,import.meta.url);
 await mkdir(dirname(fileURLToPath(target)),{recursive:true});
 await writeFile(target,execFileSync('git',['show',baseline+':'+file],{cwd:repositoryRoot}));
}
const {GeometryFactory:OriginalFactory}=await import('../.model-baseline/prototype/src/world/shared/GeometryFactory.js');
globalThis.document??={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})})})};
const names=['FirstCampus3F','FirstCampus4F','FirstCampus2FER','FirstCampus1F','FirstCampus8FBridgeEntry','Skybridge','SecondCampus2F','SecondCampusStandardFloor','SecondCampus1F','HillsideRoute','EcologyPond'];
const box=b=>[b.min.toArray(),b.max.toArray()];
const surface=m=>({position:m.position.toArray(),rotation:m.rotation.toArray(),parameters:m.geometry.parameters});
const report=[];
for(const name of names){
 const Original=(await import(`../.model-baseline/prototype/src/world/zones/${name}.js`))[name];
 const Current=(await import(`../src/world/zones/${name}.js`))[name];
 const original=new Original(new THREE.Scene(),new OriginalFactory()).build();
 const current=new Current(new THREE.Scene(),new GeometryFactory()).build();
 const oldBoxes=original.colliders.map(box),newBoxes=current.colliders.map(box);
 for(const prior of oldBoxes)assert.ok(newBoxes.some(b=>JSON.stringify(b)===JSON.stringify(prior)),`${name}: original collider removed or changed`);
 const added=newBoxes.filter(b=>!oldBoxes.some(old=>JSON.stringify(old)===JSON.stringify(b)));
 assert.equal(added.length,name==='FirstCampus2FER'?8:['FirstCampus1F','FirstCampus8FBridgeEntry'].includes(name)?2:0,`${name}: unapproved collider additions`);
 assert.equal(original.walkables.length,current.walkables.length,`${name}: walkable count`);
 for(let i=0;i<original.walkables.length;i++) {
  const old=surface(original.walkables[i]),now=surface(current.walkables[i]);
  if(name==='HillsideRoute')old.rotation[2]=-old.rotation[2];
  assert.deepEqual(now,old,`${name}: walkable ${i}`);
 }
 const anchors=objects=>objects.filter(o=>o.userData.id!=='DUTY_ROOM_DOOR').map(o=>({id:o.userData.id,position:o.position.toArray(),rotation:o.rotation.toArray(),geometry:o.geometry?.parameters})).sort((a,b)=>a.id.localeCompare(b.id));
 assert.deepEqual(anchors(current.interactables),anchors(original.interactables),`${name}: original interaction anchors`);
 report.push({zone:name,originalColliders:oldBoxes.length,addedColliders:added,walkables:current.walkables.length,originalInteractionsRetained:true,authorizedSurfaceRotations:name==='HillsideRoute'?8:0});
 original.cleanup();current.cleanup();
}
await writeFile(new URL('../../docs/visual-qa/model-diff.json',import.meta.url),JSON.stringify({baseline:'31f9e1b039a42317989291a1657b9901a673e748',verdict:'PASS',zones:report},null,2)+String.fromCharCode(10));
console.log('MODEL DIFFERENTIAL PASS: original collider boxes, walkable shapes and interactions retained; only authorized ER8 + entry4 + hillside8 rotations');
