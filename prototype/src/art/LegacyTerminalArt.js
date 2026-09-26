import * as THREE from 'three';
import {solid} from './ArtDetails.js';

export function buildLegacyArchiveTerminal({parent,materials,position,rotationY=0,id,type,label,screenTitle,name='LegacyArchiveTerminal'}){
  const group=new THREE.Group();group.name=name;group.position.set(...position);group.rotation.y=rotationY;parent.add(group);
  solid(group,materials.wallDark,[0,.37,0],[.68,.48,.10]);
  solid(group,materials.metal,[0,.10,0],[.09,.26,.08]);
  solid(group,materials.metal,[0,.015,0],[.30,.03,.22]);
  solid(group,materials.wallDark,[0,.015,.34],[.52,.03,.24]);
  const canvas=document.createElement('canvas');canvas.width=720;canvas.height=480;
  const context=canvas.getContext('2d');context.fillStyle='#07110c';context.fillRect(0,0,720,480);
  context.fillStyle='#78b68f';context.font='bold 38px monospace';context.fillText(screenTitle,28,58);
  context.font='24px monospace';context.fillStyle='#4e8064';
  ['ARCHIVE LINK: ONLINE','INDEX SOURCE: 1998','CONSISTENCY: PENDING','> WAITING FOR OPERATOR'].forEach((text,index)=>context.fillText(text,34,145+index*68));
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(.60,.40),new THREE.MeshBasicMaterial({map:texture}));
  screen.name=`${name}_Screen`;screen.position.set(0,.37,.056);group.add(screen);
  const hitbox=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.05,1.05),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  hitbox.name=`${name}_Hitbox`;hitbox.position.set(0,.42,.16);hitbox.userData={interactable:true,id,type,label};group.add(hitbox);
  return {group,screen,hitbox};
}
