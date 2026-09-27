import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getMaterials, materialForSurface } from './MaterialRegistry.js';
import { instantiateAsset } from './AssetRegistry.js';

const mainPath = [[72,-18],[65,-20],[55,-22],[42,-25],[30,-28],[20,-32],[10,-35]];
const branchPath = [[42,-25],[46,-30],[50,-35]];
function seeded(seed) { return () => { seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed / 4294967296; }; }
function box(root,x,y,z,w,h,d,material) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z); mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
}
function landscapeContext(root,mats,hillside=false) {
  const geometry=new THREE.PlaneGeometry(320,320,48,48);geometry.rotateX(-Math.PI/2);
  const positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++) {
    const x=positions.getX(i)+50,z=positions.getZ(i)-45;
    const distance=Math.hypot(x-50,(z+45)*1.3);
    const rise=Math.max(0,distance-42);
    positions.setXYZ(i,x,-1.2+Math.min(19,rise*.16)*(1+.25*Math.sin(x*.07)*Math.cos(z*.06)),z);
  }
  tintGround(geometry);geometry.computeVertexNormals();const terrain=new THREE.Mesh(geometry,materialForSurface('terrainGrass',320,320));terrain.material.vertexColors=true;root.add(terrain);
  const plants=[];
  const random=seeded(5187);
  for(let i=0;i<22;i++) {
    const a=i*Math.PI/11+random()*.16,r=42+random()*9,x=50+Math.cos(a)*r,z=-45+Math.sin(a)*(r*.8);
    const distance=Math.hypot(x-50,(z+45)*1.3);
    let y=-1.2+Math.min(19,Math.max(0,distance-42)*.16)*(1+.25*Math.sin(x*.07)*Math.cos(z*.06));
    if(hillside && x>=0 && x<=80 && z>=-55 && z<=-5)y=Math.max(y,hillsideHeight(x,z));
    if(!hillside && x>=40 && x<=90 && z>=-68 && z<=-28)y=Math.max(y,-.8);
    plants.push([x,y,z,3.2+random()*2.7]);
  }
  vegetation(root,plants,mats,4108);
}
function tintGround(geometry) {
  const positions=geometry.attributes.position,colors=[];
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i);
    const patch=.78+.11*Math.sin(x*.37+Math.sin(z*.19)*2)+.08*Math.cos(z*.47-x*.16);
    colors.push(patch*.82,patch,patch*.76);
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
}
function rootFor(zone,name) {
  const root=new THREE.Group();root.name=name;zone.zoneGroup.add(root);return root;
}
function hide(mesh) { mesh.visible=false;mesh.userData.visualReplaced=true; }
function distanceToSegments(x,z,nodes) {
  let best=Infinity;
  for(let i=1;i<nodes.length;i++) {
    const [ax,az]=nodes[i-1], [bx,bz]=nodes[i],dx=bx-ax,dz=bz-az;
    const t=THREE.MathUtils.clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1);
    best=Math.min(best,Math.hypot(x-ax-dx*t,z-az-dz*t));
  }
  return best;
}
function hillsideHeight(x,z) {
  const distance=pathDistance(x,z);
  return -.66+Math.max(0,distance-3)*.17+Math.sin(x*.21)*Math.cos(z*.17)*Math.min(.18,distance*.025);
}
function pathDistance(x,z) {return Math.min(distanceToSegments(x,z,mainPath),distanceToSegments(x,z,branchPath));}
function landscapeMaterials() {
  const mats=getMaterials();
  return {
    earth:mats.terrainGrass,
    bark:new THREE.MeshStandardMaterial({color:0x625b48,roughness:.98}),
    concrete:new THREE.MeshStandardMaterial({color:0xa7a699,roughness:.95}),
    metal:mats.metal,wood:mats.handrail,
  };
}
function vegetation(root,positions,mats,seed) {
  const random=seeded(seed);
  positions.forEach(([x,y,z,height],index)=>{
    const tree=height>2;
    const type=tree?'campusTree':index%3===0?'fern':'shrub';
    const plant=instantiateAsset(tree?type:type+'_'+['a','b','c','d'][index%4]);
    if(!plant)return;
    const targetHeight=type==='fern'?Math.min(height,.55):height;
    plant.scale.setScalar(targetHeight/plant.userData.dimensions[1]);
    if(plant.userData.pendingAsset)plant.userData.targetHeight=targetHeight;
    if(tree){plant.scale.x*=1.22;plant.scale.z*=1.22;}
    plant.rotation.y=random()*Math.PI*2;
    plant.position.set(x,y,z);
    root.add(plant);
  });
}
function drains(root,nodes,halfWidth,mat) {
  for(let i=1;i<nodes.length;i++) {
    const [ax,az]=nodes[i-1],[bx,bz]=nodes[i],dx=bx-ax,dz=bz-az,length=Math.hypot(dx,dz),nx=dz/length,nz=-dx/length;
    for(const sign of [-1,1]) {
      const count=Math.ceil(length/.85);
      for(let k=0;k<count;k++) {
        const t=(k+.5)/count,x=ax+dx*t+nx*halfWidth*sign,z=az+dz*t+nz*halfWidth*sign;
        if (nodes===mainPath && distanceToSegments(x,z,branchPath)<1.7) continue;
        if (nodes===branchPath && distanceToSegments(x,z,mainPath)<2.2) continue;
        const y=nodes===branchPath ? -.43-.05*(i-1+t) : -.43;
        const curb=box(root,x,y+.11,z,.18,.19,length/count-.018,mat.concrete);curb.rotation.y=Math.atan2(dx,dz);
      }
    }
    for(let k=1;k<length;k+=2.3) {
      const t=k/length,x=ax+dx*t+nx*(halfWidth-.15),z=az+dz*t+nz*(halfWidth-.15);
      const y=nodes===branchPath ? -.43-.05*(i-1+t) : -.43;
      const drain=box(root,x,y+.013,z,.2,.016,.48,mat.metal);drain.rotation.y=Math.atan2(dx,dz);
      for(let slot=0;slot<5;slot++) {
        const grate=box(root,x+dx/length*(slot-2)*.075,y+.025,z+dz/length*(slot-2)*.075,.14,.009,.018,mat.bark);grate.rotation.y=Math.atan2(dx,dz);
      }
    }
  }
}
function railing(root,ax,az,bx,bz,y,mats) {
  const length=Math.hypot(bx-ax,bz-az),angle=Math.atan2(bx-ax,bz-az),n=Math.ceil(length/.9);
  for(let i=0;i<=n;i++)box(root,ax+(bx-ax)*i/n,y+.50,az+(bz-az)*i/n,.065,1.0,.065,mats.wood);
  for(const h of [.36,.98]) {
    const rail=box(root,(ax+bx)/2,y+h,(az+bz)/2,.08,.075,length+.08,mats.wood);rail.rotation.y=angle;
  }
}


function mergeStaticArt(root) {
  const groups=new Map();
  for(const mesh of [...root.children]) {
    if(!mesh.isMesh||mesh.isInstancedMesh||mesh.isReflector)continue;
    mesh.updateMatrix();
    const group=groups.get(mesh.material)??[];group.push(mesh);groups.set(mesh.material,group);
  }
  for(const [material,meshes] of groups) {
    if(meshes.length<2)continue;
    const geometries=meshes.map(mesh=>mesh.geometry.clone().applyMatrix4(mesh.matrix));
    const combined=new THREE.Mesh(mergeGeometries(geometries),material);
    combined.name='Batched landscape detail';combined.castShadow=true;combined.receiveShadow=true;
    for(const mesh of meshes){root.remove(mesh);mesh.geometry.dispose();}
    geometries.forEach(geometry=>geometry.dispose());root.add(combined);
  }
}

/** Lightweight, decorative exterior visible through hospital windows. It intentionally has no gameplay metadata. */
export function buildDistantNightLandscape(parent, { position = [0, 0, 0], rotationY = 0 } = {}) {
  const root = new THREE.Group();
  root.name = 'DistantNightLandscape';
  root.userData.sceneRole = 'DistantEnvironment';
  root.position.set(...position);
  root.rotation.y = rotationY;
  const mat = (color, roughness = 1, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  const ground = mat(0x202923), shore = mat(0x586151), hillFar = mat(0x16221c), hillNear = mat(0x19241e);
  const waterMat = mat(0x142a24, .2, { metalness: .18, emissive: 0x31594d, emissiveIntensity: .48 });
  const wood = mat(0x675640), pathMat = mat(0x7d7868), lampMat = mat(0xb39a6e, .5, { emissive: 0x6b512a, emissiveIntensity: .42 });
  const mesh = (name, geometry, material, x, y, z, sx = 1, sy = 1, sz = 1) => {
    const object = new THREE.Mesh(geometry, material);
    object.name = name; object.position.set(x, y, z); object.scale.set(sx, sy, sz);
    object.userData.sceneRole = 'DistantEnvironment'; root.add(object); return object;
  };
  mesh('Distant landscape ground', new THREE.PlaneGeometry(110, 78), ground, 0, -2.2, -2).rotation.x = -Math.PI / 2;
  mesh('Distant pond shoreline', new THREE.CircleGeometry(1, 48), shore, 0, -.78, 1, 15.8, 7.2, 1).rotation.x = -Math.PI / 2;
  mesh('Distant pond water', new THREE.CircleGeometry(1, 48), waterMat, 0, -.755, 1, 13.6, 5.5, 1).rotation.x = -Math.PI / 2;
  mesh('Distant pond shoreline edge', new THREE.TorusGeometry(1, .028, 4, 64), mat(0x858574), 0, -.765, 1, 15.8, 7.2, 1).rotation.x = -Math.PI / 2;
  for (const [z, width] of [[-2.6, 8.4], [-.8, 6.2], [1.1, 9.5]]) {
    const glint = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(-width * .48, -.725, z), new THREE.Vector3(-width * .16, -.715, z + .10),
      new THREE.Vector3(width * .12, -.725, z - .04), new THREE.Vector3(width * .48, -.715, z + .08)
    ]), 16, .025, 5, false), mat(0x829889, .34, { emissive: 0x465c50, emissiveIntensity: .48 }));
    glint.name = 'Distant pond water glint'; glint.userData.sceneRole = 'DistantEnvironment'; root.add(glint);
  }
  mesh('Distant pond boardwalk', new THREE.BoxGeometry(3.0, .16, 8.8), wood, 0, -.50, 11.6);
  for (let i = 0; i < 13; i++) mesh('Distant boardwalk plank', new THREE.BoxGeometry(3.04, .045, .14), pathMat, 0, -.395, 7.4 + i * .68);
  for (const x of [-1.36, 1.36]) {
    mesh('Distant boardwalk rail post', new THREE.CylinderGeometry(.035, .045, .8, 6), wood, x, -.57, 10.2);
    mesh('Distant boardwalk rail', new THREE.CylinderGeometry(.035, .035, 5.1, 6), wood, x, -.32, 12.7).rotation.x = Math.PI / 2;
  }
  const trail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -.88, 8), new THREE.Vector3(4, -.82, 3), new THREE.Vector3(11, -.60, -3),
    new THREE.Vector3(18, -.18, -11), new THREE.Vector3(25, .55, -20), new THREE.Vector3(31, 1.5, -29)
  ]), 24, .13, 6, false), pathMat);
  trail.name = 'Distant hillside trail'; trail.userData.sceneRole = 'DistantEnvironment'; root.add(trail);
  const ridge = new THREE.Shape();
  ridge.moveTo(-56, -1); ridge.lineTo(-47, 1); ridge.lineTo(-36, 5); ridge.lineTo(-28, 3);
  ridge.lineTo(-15, 9); ridge.lineTo(-4, 6); ridge.lineTo(8, 11); ridge.lineTo(21, 6);
  ridge.lineTo(34, 8); ridge.lineTo(45, 3); ridge.lineTo(56, -1); ridge.lineTo(56, -8); ridge.lineTo(-56, -8); ridge.closePath();
  const ridgeGeometry = new THREE.ExtrudeGeometry(ridge, { depth: 4, bevelEnabled: false, curveSegments: 4 });
  mesh('Distant hillside silhouette', ridgeGeometry, hillFar, 0, -1, -29, 1, 1.2, 1);
  mesh('Distant hillside slope', new THREE.SphereGeometry(1, 18, 10), hillNear, -20, -1.5, -20, 35, 5, 8);
  for (const [x, z, height] of [[-39, -14, 3.2], [-31, -22, 4.1], [-19, -27, 3.5], [18, -30, 4.3], [31, -21, 3.2], [40, -17, 3.8]])
    mesh('Distant tree silhouette', new THREE.ConeGeometry(1.2, height, 7), hillFar, x, -.4 + height / 2, z);
  for (const [x, z] of [[-8, 10], [8, 10], [22, 17], [30, 26]]) {
    mesh('Distant pathway light', new THREE.CylinderGeometry(.035, .05, 1.25, 6), wood, x, -.38, z);
    mesh('Distant pathway light glow', new THREE.SphereGeometry(.12, 8, 6), lampMat, x, .29, z, 1.4, .75, 1.4);
  }
  const starPositions=[];const random=seeded(19981012);
  for(let i=0;i<110;i++)starPositions.push(-48+random()*96,16+random()*22,-66+random()*2);
  const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
  const starMaterial=new THREE.PointsMaterial({color:0xd9e1da,size:2.2,sizeAttenuation:false,transparent:true,opacity:.82,depthWrite:false});
  const stars=new THREE.Points(starGeometry,starMaterial);stars.name='Distant exterior starfield';stars.userData.sceneRole='DistantEnvironment';root.add(stars);
  parent.add(root);
  root.userData.setExteriorPhase = phase => {
    waterMat.color.setHex(phase === 'DAWN' ? 0x314943 : phase === 'DUSK' ? 0x25463b : 0x142a24);
    waterMat.emissiveIntensity = phase === 'DEEP_NIGHT' ? .12 : .04;
    lampMat.emissiveIntensity = phase === 'DEEP_NIGHT' ? .62 : phase === 'DAWN' ? .06 : .24;
    starMaterial.opacity = phase === 'DEEP_NIGHT' ? .82 : phase === 'DAWN' ? .08 : 0;
  };
  return root;
}

export function applyHillsideArt(zone) {
  const original=[...zone.zoneGroup.children],root=rootFor(zone,'ArtRoot/Hillside'),mats=landscapeMaterials();
  for(const mesh of original) {
    if(!mesh.isMesh||zone.walkables.includes(mesh))continue;
    const p=mesh.geometry.parameters;
    if((mesh.geometry.type==='PlaneGeometry'&&p.width===80)||(mesh.geometry.type==='BoxGeometry'&&p.width===.3&&p.height===.45))hide(mesh);
  }
  const geometry=new THREE.PlaneGeometry(80,50,64,40);geometry.rotateX(-Math.PI/2);
  const pos=geometry.attributes.position;
  for(let i=0;i<pos.count;i++) {
    const x=pos.getX(i)+40,z=pos.getZ(i)-30,distance=pathDistance(x,z);
    pos.setXYZ(i,x,-.66+Math.max(0,distance-3)*.17+Math.sin(x*.21)*Math.cos(z*.17)*Math.min(.18,distance*.025),z);
  }
  tintGround(geometry);geometry.computeVertexNormals();const ground=new THREE.Mesh(geometry,materialForSurface('terrainGrass',80,50));ground.material.vertexColors=true;ground.name='Visible hillside terrain';ground.receiveShadow=true;root.add(ground);
  for(const mesh of zone.walkables) {const p=mesh.geometry.parameters;mesh.material=materialForSurface('pathGravel',p.width,p.height);}
  landscapeContext(root,mats,true);
  drains(root,mainPath,1.95,mats);drains(root,branchPath,1.34,mats);
  const plants=[],random=seeded(7319);
  for(let i=0;i<130;i++) {
    const x=7+random()*66,z=-43+random()*28,distance=pathDistance(x,z);
    if(distance<3.0)continue;
    const y=hillsideHeight(x,z);
    plants.push([x,y,z,i%7===0?3+random()*2.5:.6+random()*.6]);
  }
  // Irregular low planting follows the verges, clear of the locked walking surfaces.
  for(const nodes of [mainPath,branchPath])for(let i=1;i<nodes.length;i++){
    const [ax,az]=nodes[i-1],[bx,bz]=nodes[i],dx=bx-ax,dz=bz-az,length=Math.hypot(dx,dz);
    for(let d=.6;d<length;d+=1.35)for(const side of [-1,1]){
      const offset=(nodes===mainPath?3.15:2.4)+random()*.9;
      const x=ax+dx*d/length+dz/length*offset*side,z=az+dz*d/length-dx/length*offset*side;
      if(pathDistance(x,z)<2.6)continue;
      plants.push([x,hillsideHeight(x,z),z,.8+random()*.65]);
    }
  }
  vegetation(root,plants,mats,20260917);
  for(const [x,z] of [[67,-17.2],[54,-19.7],[29,-25.9],[17,-29.5]]) {
    box(root,x,1.3,z,.075,3.5,.075,mats.metal);
    box(root,x,3.08,z,.36,.055,.16,mats.metal);
    box(root,x,3.045,z,.28,.025,.12,getMaterials().lightWarm);
  }
  mergeStaticArt(root);
  return root;
}

export function applyPondArt(zone) {
  const original=[...zone.zoneGroup.children],root=rootFor(zone,'ArtRoot/Pond'),mats=landscapeMaterials();
  for(const mesh of original) {
    if(!mesh.isMesh||zone.walkables.includes(mesh))continue;
    const p=mesh.geometry.parameters;
    if((mesh.geometry.type==='PlaneGeometry'&&(p.width===50||p.width===24))||
       (mesh.geometry.type==='BoxGeometry'&&(p.height===1||p.height===.45||p.height===.6)))hide(mesh);
  }
  landscapeContext(root,mats);
  for(const mesh of zone.walkables)if(mesh.geometry.type==='PlaneGeometry') {const p=mesh.geometry.parameters;mesh.material=materialForSurface('pathGravel',p.width,p.height);}
  // The old decorative ground covered the entire water plane. These four pieces leave its basin open.
  for(const [x,z,w,d] of [[47.25,-48,14.5,40],[84.25,-48,11.5,40],[66.5,-37.25,24,18.5],[66.5,-63.25,24,9.5]]) {
    const ground=box(root,x,-.93,z,w,.26,d,materialForSurface('terrainGrass',w,d));ground.receiveShadow=true;
  }
  const water=new Reflector(new THREE.PlaneGeometry(24,12),{color:0x788c80,textureWidth:512,textureHeight:512,clipBias:.003});
  water.name='PondWater/SceneReflection';water.rotation.x=-Math.PI/2;water.position.set(66.5,-1.035,-52.5);
  water.material.fragmentShader=water.material.fragmentShader.replace('texture2DProj( tDiffuse, vUv )','texture2DProj( tDiffuse, vUv + vec4(sin(vUv.y*95.0)*0.0008*vUv.w, cos(vUv.x*83.0)*0.0006*vUv.w, 0.0, 0.0) )');
  water.material.addEventListener('dispose',()=>water.getRenderTarget().dispose());root.add(water);
  railing(root,55,-46.4,60.5,-46.4,-.36,mats);
  railing(root,63.5,-46.4,66,-46.4,-.36,mats);
  railing(root,65.9,-46.5,65.9,-40.5,-.36,mats);
  railing(root,55.1,-46.5,55.1,-42.5,-.36,mats);
  // Lower waterside deck railings and ramp barriers
  railing(root,58,-52.5,65,-52.5,-.75,mats);
  railing(root,58,-49,58,-52.5,-.75,mats);
  railing(root,65,-49,65,-52.5,-.75,mats);
  railing(root,60.5,-46.4,60.5,-49,-.55,mats);
  railing(root,63.5,-46.4,63.5,-49,-.55,mats);
  for(let x=55.18;x<66;x+=.24)box(root,x,-.353,-43.5,.226,.018,5.88,materialForSurface('floorWood',.23,5.88));
  for(let x=58.15;x<64.9;x+=.24)box(root,x,-.75,-50.8,.226,.018,3.48,materialForSurface('floorWood',.23,3.48));
  for(let x=56.88;x<59.18;x+=.19)box(root,x,.028,-45.2,.16,.075,.58,mats.wood);
  for(const x of [57.05,58.95])box(root,x,-.20,-45.2,.10,.40,.48,mats.metal);
  for(let y=.30;y<.66;y+=.14)box(root,58,y,-45.45,2.35,.105,.045,mats.wood);
  for(const x of [57.05,58.95])box(root,x,.27,-45.45,.06,.80,.055,mats.metal);
  // Segmented aggregate coping replaces uninterrupted green block borders.
  for(const [ax,az,bx,bz] of [[54.5,-46.8,78.5,-46.8],[54.5,-58.2,78.5,-58.2],[78.5,-46.8,78.5,-58.2]]) {
    const length=Math.hypot(bx-ax,bz-az),angle=Math.atan2(bx-ax,bz-az),count=Math.ceil(length/.7);
    for(let i=0;i<count;i++) {
      const stone=box(root,ax+(bx-ax)*(i+.5)/count,-.77,az+(bz-az)*(i+.5)/count,.6,.25,length/count-.025,mats.concrete);stone.rotation.y=angle;
    }
  }
  const plants=[],random=seeded(9051);
  for(let i=0;i<75;i++) {
    const x=49+random()*32,z=-60+random()*24;
    if((x>51.2&&x<67.5&&z>-47.4)||(x>53.2&&x<79.6&&z>-59&&z<-45.5))continue;
    plants.push([x,-.8,z,i%9===0?3+random()*2:.5+random()]);
  }
  for(let i=0;i<45;i++){
    const x=53.5+random()*26,z=-60-random()*3;
    plants.push([x,-.8,z,.8+random()*.8]);
  }
  vegetation(root,plants,mats,4191);
  // Physically support the already-approved ecology plaque.
  for(const x of [53.6,54.4])box(root,x,-.1,-41.04,.05,1.4,.05,mats.metal);
  mergeStaticArt(root);
  return root;
}

export function buildHillsidePreview(parent) {
  const preview={zoneGroup:new THREE.Group(),walkables:[]};
  parent.add(preview.zoneGroup);
  applyHillsideArt(preview);
  // Keep the neighboring landscape below the existing lobby, landing and steps.
  preview.zoneGroup.traverse(mesh=>{
    if(mesh.name.startsWith('ArtAsset/') && mesh.position.z>-17)mesh.visible=false;
    if(mesh.isInstancedMesh) {
      const matrix=new THREE.Matrix4(),position=new THREE.Vector3();
      for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);position.setFromMatrixPosition(matrix);if(position.z>-17){matrix.makeScale(0,0,0);mesh.setMatrixAt(i,matrix);}}
      mesh.instanceMatrix.needsUpdate=true;
    } else if(mesh.isMesh && !mesh.geometry.userData.sharedAsset) {
      const positions=mesh.geometry.attributes.position;
      for(let i=0;i<positions.count;i++)if(positions.getZ(i)>-17)positions.setY(i,Math.min(-.66,positions.getY(i)));
      positions.needsUpdate=true;mesh.geometry.computeVertexNormals();
    }
  });
  for(let i=1;i<mainPath.length;i++) {
    const [ax,az]=mainPath[i-1],[bx,bz]=mainPath[i],length=Math.hypot(bx-ax,bz-az);
    const path=new THREE.Mesh(new THREE.PlaneGeometry(3.6,length+.5),materialForSurface('pathGravel',3.6,length+.5));
    path.rotation.set(-Math.PI/2,0,Math.atan2(bx-ax,bz-az));
    path.position.set((ax+bx)/2,-.43,(az+bz)/2);
    preview.zoneGroup.add(path);
  }
}
