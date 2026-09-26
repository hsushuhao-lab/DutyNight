import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getMaterials, materialForSurface, preloadOutdoorMaterials } from './MaterialRegistry.js';
import { instantiateAsset, preloadOutdoorAssets } from './AssetRegistry.js';
import { gameState } from '../core/GameState.js';

export function getExteriorTimePhase(time=gameState.gameTime) {
  const value=String(time||'17:00');
  if(value>='03:30'&&value<'17:00')return 'DAWN';
  if(value>='21:17'||value<'03:30')return 'DEEP_NIGHT';
  return 'DUSK';
}

const EXTERIOR_PALETTE={
  DUSK:{zenith:0x40566f,horizon:0xd09a72,glass:0x4b5e68,warm:0xb58b58,emissive:.24},
  DEEP_NIGHT:{zenith:0x050914,horizon:0x111b2a,glass:0x182630,warm:0xc08b49,emissive:.42},
  DAWN:{zenith:0x718ca4,horizon:0xe1b18c,glass:0x5c7180,warm:0xb29672,emissive:.13}
};

export function applyExteriorTime(root,time=gameState.gameTime) {
  const phase=getExteriorTimePhase(time),palette=EXTERIOR_PALETTE[phase];
  root?.traverse?.(object=>{
    if(object.name==='Campus atmospheric sky'){
      object.material.uniforms.zenith.value.setHex(palette.zenith);
      object.material.uniforms.horizon.value.setHex(palette.horizon);
      object.material.uniforms.starOpacity.value=phase==='DEEP_NIGHT'?.78:phase==='DAWN'?.10:0;
    }
    if(object.name==='Campus story sky'&&object.userData.paintStorySky)object.userData.paintStorySky(palette,phase);
    if(object.name==='Campus exterior dark glass')object.material.color.setHex(palette.glass);
    if(object.name==='Campus exterior warm glass'){
      object.material.color.setHex(palette.warm);object.material.emissive.setHex(palette.warm);object.material.emissiveIntensity=palette.emissive;
    }
  });
  return phase;
}

/** Decorative context is below/beyond each locked campus route, never a walkable surface. */
export function preloadCampusBackdropAssets() {
  return Promise.all([preloadOutdoorAssets(), preloadOutdoorMaterials()]);
}

export function buildCampusBackdrop(parent) {
  const root = new THREE.Group();
  root.name = 'ArtRoot_ExteriorCampus';
  const m = getMaterials();
  const concrete = new THREE.MeshStandardMaterial({ color: 0xbab9aa, roughness: .93 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xc7c9bf, roughness: .65, metalness: .2 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x596d70, roughness: .36, metalness: .24 });
  const warmGlass = new THREE.MeshStandardMaterial({ color: 0xd2d0b9, roughness: .57, emissive: 0x867b5a, emissiveIntensity: .16 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x484d47, roughness: .86 });
  const add = (geometry,material,x,y,z) => { const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.receiveShadow=true;root.add(mesh);return mesh; };
  const box = (x,y,z,w,h,d,material=concrete) => add(new THREE.BoxGeometry(w,h,d),material,x,y,z);
  const floor = (x,z,w,d,material,y=-11.99) => { const mesh=add(new THREE.PlaneGeometry(w,d),material,x,y,z);mesh.rotation.x=-Math.PI/2;return mesh; };

  // Infinite-distance gradient: camera translation and the local ER height offset do not move the sky.
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1,24,12),new THREE.ShaderMaterial({
    uniforms:{zenith:{value:new THREE.Color(0x94adb7)},horizon:{value:new THREE.Color(0xd7dad1)},starOpacity:{value:0}},
    vertexShader:'varying vec3 direction; void main(){ direction=position; vec4 clip=projectionMatrix*mat4(mat3(viewMatrix))*vec4(position,1.0); gl_Position=clip.xyww; }',
    fragmentShader:"uniform vec3 zenith; uniform vec3 horizon; uniform float starOpacity; varying vec3 direction; void main(){ vec3 ray=normalize(direction); float h=smoothstep(-0.08,0.75,ray.y); vec3 sky=mix(horizon,zenith,h); vec2 grid=ray.xz*160.0; vec2 cell=floor(grid); float seed=fract(sin(dot(cell,vec2(127.1,311.7)))*43758.5453); float spot=pow(max(0.0,1.0-length(fract(grid)-0.5)*2.0),10.0); float star=step(0.998,seed)*spot*starOpacity*smoothstep(0.02,0.2,ray.y); gl_FragColor=vec4(sky+vec3(star),1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}",
    side:THREE.BackSide,depthWrite:false,
  }));
  sky.name='Campus atmospheric sky';sky.frustumCulled=false;sky.renderOrder=-100;root.add(sky);
  floor(30,0,240,180,materialForSurface('pathGravel',240,180),-12);

  // A service lane, concrete walks, expansion joints and planted islands give ground-level views scale.
  for(const [x,z,w,d] of [[37,0,7,28],[47,20,25,4],[10,-21,44,4],[18,22,40,4]]) {
    box(x,-11.91,z,w,.18,d);
    for(let t=-d/2+1.5;t<d/2;t+=1.5)box(x,-11.814,z+t,w,.008,.016,dark);
    for(let t=-w/2+1.5;t<w/2;t+=1.5)box(x+t,-11.814,z,.016,.008,d,dark);
  }
  for(const [x,z,w,d] of [[43,-10,7,6],[45,10,8,7],[9,25,13,5],[-10,-23,9,4]]) {
    floor(x,z,w,d,materialForSurface('terrainGrass',w,d),-11.78);
    box(x,-11.79,z-d/2,w+.25,.30,.18);box(x,-11.79,z+d/2,w+.25,.30,.18);
    box(x-w/2,-11.79,z,.18,.30,d);box(x+w/2,-11.79,z,.18,.30,d);
    for(let i=0;i<3;i++) {
      const plant=instantiateAsset(i===1?'fern_b':'shrub_'+['a','b','c'][i]);
      if(plant){plant.position.set(x+(i-1)*w*.25,-11.77,z);plant.scale.setScalar(i===1?1.3:.38);root.add(plant);}
    }
  }
  for(const [x,z,scale] of [[43,-10,1.3],[45,10,1.4],[9,25,1.25]]) {
    const tree=instantiateAsset('campusTree');if(tree){tree.position.set(x,-11.76,z);tree.scale.setScalar(scale);tree.rotation.y=x*.13;root.add(tree);}
  }
  for(const [x,z] of [[34,-11],[34,11],[42,20]]) {
    box(x,-10.95,z,.12,2,.12,m.metal);box(x,-9.93,z,.36,.08,.23,m.metal);box(x,-9.98,z,.24,.025,.16,m.lightWarm);
  }

  const sites = [[-18,-33,18,18,12],[8,-42,16,25,15],[39,-36,24,15,12],[74,-48,15,30,17],[-7,35,20,16,13],[30,45,30,22,15],[72,34,17,18,12],[95,0,18,11,22]];
  sites.forEach(([x,z,width,height,depth],site) => {
    box(x,height/2-12,z,width,height,depth,m.wall);
    box(x,height-11.82,z,width+.35,.35,depth+.35,concrete);
    // Recessed rooftop mechanical enclosure, parapets and different-height side wings.
    box(x+width*.18,height-11.0,z-depth*.17,width*.35,1.7,depth*.38,m.wallDark);
    box(x,height-11.53,z-depth/2,width+.2,.50,.16,trim);
    box(x,height-11.53,z+depth/2,width+.2,.50,.16,trim);
    if(site%2===0)box(x-width*.36,-9.4,z+depth*.30,width*.45,5.2,depth*.5,concrete);
    const floors=Math.floor(height/3),columns=Math.floor(width/2.6),sideColumns=Math.floor(depth/2.8);
    function facade(alongX,front,positive,count) {
      const direction=positive?1:-1;
      for(let row=0;row<floors;row++) {
        const y=-10.3+row*3;
        const span=alongX?width:depth;
        for(let col=0;col<count;col++) {
          const u=-span/2+1.6+col*(alongX?2.6:2.8);
          const wx=alongX?x+u:front,wz=alongX?front:z+u;
          const lit=(row*7+col+site)%5===1;
          const window=box(wx,y,wz,1.42,1.38,.08,lit?warmGlass:glass);window.name=lit?'Campus exterior warm glass':'Campus exterior dark glass';
          if(!alongX)window.rotation.y=Math.PI/2;
          for(const [offset,h,w] of [[-.72,1.55,.07],[.72,1.55,.07],[0,1.4,.045]]) {
            const f=box(wx+(alongX?offset:direction*.06),y,wz+(alongX?direction*.06:offset),w,h,.12,trim);if(!alongX)f.rotation.y=Math.PI/2;
          }
          for(const dy of [-.73,.73]) {
            const f=box(wx+(alongX?0:direction*.07),y+dy,wz+(alongX?direction*.07:0),1.55,.065,.17,trim);if(!alongX)f.rotation.y=Math.PI/2;
          }
          const canopy=box(wx+(alongX?0:direction*.20),y+.84,wz+(alongX?direction*.20:0),1.75,.10,.48,concrete);if(!alongX)canopy.rotation.y=Math.PI/2;
          if((col+row+site)%5===0&&row>0) {
            const unit=box(wx+(alongX?.66:direction*.30),y-.98,wz+(alongX?direction*.30:.66),.72,.45,.40,trim);if(!alongX)unit.rotation.y=Math.PI/2;
            const vent=box(wx+(alongX?.66:direction*.51),y-.98,wz+(alongX?direction*.51:.66),.52,.29,.018,dark);if(!alongX)vent.rotation.y=Math.PI/2;
          }
        }
        const band=box(alongX?x:front,-9.25+row*3,alongX?front:z,span,.15,.22,concrete);if(!alongX)band.rotation.y=Math.PI/2;
      }
    }
    facade(true,z+(z<0?depth/2+.035:-depth/2-.035),z<0,columns);
    facade(false,x-width/2-.035,false,sideColumns);
  });

  // Collapse repeated architectural parts by material; cached GLTF children stay shared and untouched.
  const groups=new Map();
  for(const mesh of [...root.children]) {
    if(!mesh.isMesh||mesh===sky)continue;
    mesh.updateMatrix();const group=groups.get(mesh.material)??[];group.push(mesh);groups.set(mesh.material,group);
  }
  for(const [material,meshes] of groups) {
    if(meshes.length<2)continue;
    const geometries=meshes.map(mesh=>mesh.geometry.toNonIndexed().applyMatrix4(mesh.matrix));
    const merged=new THREE.Mesh(mergeGeometries(geometries),material);
    merged.name=material===warmGlass?'Campus exterior warm glass':material===glass?'Campus exterior dark glass':'Campus architectural detail';merged.receiveShadow=true;
    for(const mesh of meshes){root.remove(mesh);mesh.geometry.dispose();}geometries.forEach(g=>g.dispose());root.add(merged);
  }
  parent.add(root);
  applyExteriorTime(root);
  return root;
}
