import * as THREE from 'three';
import { solid } from '../art/ArtDetails.js';
import { getMaterials, materialForSurface } from '../art/MaterialRegistry.js';
import { disposeZoneArt } from '../art/ArtResources.js';

export async function playElevatorGlimpse(container) {
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x030706);
  const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.05,25);
  camera.position.set(0,1.65,2.5);camera.lookAt(0,1.65,-5);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setSize(innerWidth,innerHeight);renderer.domElement.className='elevator-glimpse-canvas';
  Object.assign(renderer.domElement.style,{position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:'25000'});container.append(renderer.domElement);
  const m=getMaterials();
  solid(scene,materialForSurface('floorTile',4,12),[0,-.05,-5],[4,.1,12]);
  for(const x of [-2,2])solid(scene,materialForSurface('wall',12,3),[x,1.5,-5],[.15,3,12]);
  solid(scene,m.wallDark,[0,1.5,-10],[4,3,.15]);
  const doors=[-1,1].map(side=>({side,mesh:solid(scene,m.stainless,[side*.55,1.4,.5],[1.1,2.8,.08])}));
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#0a211a';ctx.fillRect(0,0,512,128);ctx.fillStyle='#c1d0ba';ctx.font='40px sans-serif';ctx.fillText('6F 臨床技能中心',30,82);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(2,.5),new THREE.MeshBasicMaterial({map}));sign.position.set(0,2.2,-4);scene.add(sign);
  const indicatorCanvas=document.createElement('canvas');indicatorCanvas.width=128;indicatorCanvas.height=128;
  const indicatorContext=indicatorCanvas.getContext('2d');indicatorContext.fillStyle='#030706';indicatorContext.fillRect(0,0,128,128);indicatorContext.fillStyle='#ce8d54';indicatorContext.font='bold 100px monospace';indicatorContext.fillText('6',34,104);
  const indicatorMap=new THREE.CanvasTexture(indicatorCanvas);indicatorMap.colorSpace=THREE.SRGBColorSpace;
  const indicator=new THREE.Mesh(new THREE.PlaneGeometry(.28,.28),new THREE.MeshBasicMaterial({map:indicatorMap}));indicator.position.set(0,2.52,.6);scene.add(indicator);
  const cabinLight=new THREE.PointLight(0xc8b994,3,5);cabinLight.position.set(0,2.7,1.8);scene.add(cabinLight);
  const light=new THREE.PointLight(0xb4cec4,8,15);light.position.set(0,2.8,-3);scene.add(light,new THREE.AmbientLight(0x526a60,.2));
  const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);};window.addEventListener('resize',resize);
  try{await new Promise(resolve=>{const start=performance.now();const tick=now=>{const t=(now-start)/1000;const gap=t<.6?0:t<1.2?(t-.6)/.6:t<2?1:t<2.7?1-(t-2)/.7:0;
    for(const {side,mesh}of doors)mesh.position.x=side*(.55+.18*gap);
    light.intensity=t>1.45&&t<1.6?.15:8;renderer.render(scene,camera);
    if(t>=3)resolve();else requestAnimationFrame(tick);};requestAnimationFrame(tick);});}
  finally{window.removeEventListener('resize',resize);disposeZoneArt(scene);renderer.dispose();renderer.domElement.remove();}
}
