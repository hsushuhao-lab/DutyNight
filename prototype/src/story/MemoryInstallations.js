import * as THREE from 'three';
import { getMemorySequence } from './NarrativeV22.js';

const P=(memoryId,x,y,z,rotationY,width=.74)=>Object.freeze({memoryId,x,y,z,rotationY,width});
const PLACEMENTS=Object.freeze({
  first_campus_3f:Object.freeze([
    P('M1_ADMIN_DUTY_PHOTO',-21.84,1.55,8.55,Math.PI/2,.72),
    P('M1_ARCHIVE_6F_ALBUM',23.56,1.48,-5.25,-Math.PI/2,.76)
  ]),
  first_campus_4f:Object.freeze([P('M2_DUTYROOM_ALBUM',-13.84,1.55,8.65,Math.PI/2,.72)]),
  first_campus_2f:Object.freeze([P('M3_ER_PHOTO',15.78,1.55,-7.55,-Math.PI/2,.72)]),
  second_campus_2f:Object.freeze([P('M5_GUARD_REST_LOG',63.7,1.50,-10.28,0,.70)]),
  second_campus_5f:Object.freeze([P('M4_SECOND_DUTY_NOTE',85.74,1.52,8.65,-Math.PI/2,.72)]),
  phantom_6f:Object.freeze([P('M6_6F_PLAYBACK',3.83,1.55,-5.15,-Math.PI/2,.78)]),
  first_campus_1f:Object.freeze([P('M7_GUARD_0217',-13.70,1.58,2.30,Math.PI/2,.70)]),
  b2_archive:Object.freeze([P('B2_VICTIM_MAP',4.82,1.55,-9.55,-Math.PI/2,.82)])
});

function drawFace(sequence){
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=600;
  const ctx=canvas.getContext('2d');const cctv=sequence.mode==='CCTV';
  ctx.fillStyle=cctv?'#202620':'#d8ccb0';ctx.fillRect(0,0,900,600);
  ctx.fillStyle=cctv?'#0a130e':'#766247';ctx.fillRect(0,0,900,76);
  ctx.fillStyle=cctv?'#b6ddbd':'#fff9e8';ctx.font='bold 31px sans-serif';ctx.fillText(cctv?'ARCHIVE PLAYBACK':'院內舊照片／相簿',34,49);
  ctx.fillStyle=cctv?'#76957d':'#4e4434';ctx.font='bold 32px sans-serif';
  const title=sequence.title.length>24?sequence.title.slice(0,24)+'…':sequence.title;ctx.fillText(title,34,135);
  ctx.font='24px sans-serif';ctx.fillText(sequence.frames.length+' FRAMES',34,178);
  ctx.fillStyle=cctv?'#111814':'#b6a581';ctx.fillRect(75,225,750,285);
  ctx.strokeStyle=cctv?'#76957d':'#66543b';ctx.lineWidth=6;ctx.strokeRect(75,225,750,285);
  for(let i=0;i<4;i++){const x=160+i*175;ctx.fillStyle=cctv?'#4b6150':'#74654e';ctx.beginPath();ctx.arc(x,330,34,0,Math.PI*2);ctx.fill();ctx.fillRect(x-42,365,84,90);}
  ctx.fillStyle=cctv?'#b6ddbd':'#4e4434';ctx.font='22px sans-serif';ctx.fillText('按 E 檢視逐幀內容',280,558);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

export function createMemoryEvidence(zone,placement){
  const sequence=getMemorySequence(placement.memoryId);if(!sequence||!zone?.zoneGroup)return null;
  const width=placement.width||.74,height=width*.68;
  const root=new THREE.Group();root.name='MemoryEvidence/'+placement.memoryId;
  root.position.set(placement.x,placement.y,placement.z);root.rotation.y=placement.rotationY||0;
  const frame=new THREE.Mesh(new THREE.BoxGeometry(width+.08,height+.08,.04),new THREE.MeshStandardMaterial({color:0x4c4031,roughness:.9}));frame.position.z=-.018;root.add(frame);
  const face=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshStandardMaterial({map:drawFace(sequence),roughness:.88,side:THREE.DoubleSide}));
  face.position.z=.005;face.name='MemoryEvidenceFace/'+placement.memoryId;
  face.userData={interactable:true,id:'MEMORY_'+placement.memoryId,type:'memory_evidence',memoryId:placement.memoryId,label:'查看「'+sequence.title+'」'};
  root.add(face);zone.zoneGroup.add(root);zone.interactables.push(face);return root;
}
export function installMemoryEvidence(zone,zoneId){
  const created=[];for(const placement of PLACEMENTS[zoneId]||[]){const item=createMemoryEvidence(zone,placement);if(item)created.push(item);}
  zone.memoryEvidence=created;return created;
}
