import * as THREE from 'three';
import { buildCampusBackdrop } from './CampusBackdrop.js';
import { getMaterials } from './MaterialRegistry.js';
import { instantiateAsset } from './AssetRegistry.js';

export function applyFirstFloorArt(level) {
  const root = new THREE.Group();
  root.name = 'ArtRoot_3F_316';
  level.scene.add(root);
  const m = getMaterials();
  const box = (x, y, z, w, h, d, material = m.metal) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  };
  const asset = (name, x, y, z, scale = [1, 1, 1], rotation = 0) => {
    const object = instantiateAsset(name);
    if (!object) return;
    object.position.set(x, y, z);
    object.scale.set(...scale);
    object.rotation.y = rotation;
    root.add(object);
  };
  const monstera=(x,z,scale=1)=>{
    const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);root.add(g);
    const potMat=new THREE.MeshStandardMaterial({color:0xb7a38d,roughness:.9});
    const soilMat=new THREE.MeshStandardMaterial({color:0x3f3024,roughness:1});
    const leafMat=new THREE.MeshStandardMaterial({color:0x315f3d,roughness:.78,side:THREE.DoubleSide});
    const stemMat=new THREE.MeshStandardMaterial({color:0x58714d,roughness:.85});
    const pot=new THREE.Mesh(new THREE.CylinderGeometry(.24,.18,.42,24),potMat);pot.position.y=.21;g.add(pot);
    const soil=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.025,24),soilMat);soil.position.y=.43;g.add(soil);
    const shape=new THREE.Shape();shape.moveTo(0,-.28);shape.bezierCurveTo(-.34,-.16,-.38,.20,0,.43);shape.bezierCurveTo(.38,.20,.34,-.16,0,-.28);
    for(const hx of [-.13,.13]){const hole=new THREE.Path();hole.absellipse(hx,.06,.055,.10,0,Math.PI*2,false);shape.holes.push(hole);}
    const leafGeo=new THREE.ShapeGeometry(shape);
    const leaves=[[-.18,.95,-.05,-.45],[.18,1.05,.02,.45],[-.26,1.25,.05,-.8],[.28,1.38,-.03,.8],[0,1.55,.02,0]];
    leaves.forEach(([lx,ly,lz,ry],i)=>{
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(.012,.016,ly-.42,8),stemMat);stem.position.set(lx*.35,.42+(ly-.42)/2,lz);stem.rotation.z=-lx*.22;g.add(stem);
      const leaf=new THREE.Mesh(leafGeo,leafMat);leaf.position.set(lx,ly,lz);leaf.rotation.y=ry;leaf.rotation.z=(i%2?-.18:.18);leaf.scale.set(.72,.72,.72);g.add(leaf);
    });
    return g;
  };

  // Only presentation meshes are replaced; every collision and interaction object is retained.
  const furnitureCenters = [[6,.78,6.2],[6,.37,6.2],[6,.5,7.3],[10,.78,5.5],[10,.37,5.5]];
  for (const child of level.scene.children) {
    if (!child.isMesh || child.userData.interactable) continue;
    if (furnitureCenters.some(p => child.position.distanceTo(new THREE.Vector3(...p)) < .001)) child.visible = false;
    if (child.position.x >= 8.6 && child.position.x <= 10.1 && child.position.z >= 1.9 && child.position.z <= 2.2) child.visible = false;
    if (child.position.x > 13.3 && child.position.x < 13.9 && child.position.z < -1.6 && child.position.y < 1) child.visible = false;
  }
  asset('workDesk',6,0,6.2,[2.4/1.4,.82/.76,1.2/.72]);
  asset('officeChair',6,0,7.3,[1,1,1],Math.PI);
  asset('workDesk',10,0,5.5,[2.6/1.4,.82/.76,1.2/.72],Math.PI/2);
  asset('printer',10,.82,6.45,[1,1,1],-Math.PI/2);
  for(const z of [4.9,6.1])asset('officeChair',8.6,0,z,[1,1,1],-Math.PI/2);
  for(const x of [5.0,9.35,13.15])asset('bench',x,0,1.94,[1.25,1,1],Math.PI);
  for(const [x,z,s] of [[-5.3,-1.55,1.05],[13.6,-1.95,1]])asset('plant',x,0,z,[s,s,s]);
  asset('fern_b',-6.7,0,1.35,[1.7,1.7,1.7]);
  monstera(15.0,-1.72,.72);

  // 3F elevator-annex furnishings: a quieter side area to explore before going upstairs.
  asset('bench',-10.15,0,-7.55,[1.18,1,1],0);
  asset('bench',-5.85,0,-7.55,[1.18,1,1],0);
  asset('fern_a',-10.9,0,-4.45,[1.8,1.8,1.8]);
  monstera(-5.05,-4.75,.88);
  monstera(-10.95,-6.15,.68);
  box(-8,1.65,-8.27,4.6,1.25,.055,m.floorWood);
  {
    const canvas=document.createElement('canvas');canvas.width=1100;canvas.height=420;const ctx=canvas.getContext('2d');
    ctx.fillStyle='#e8e5dc';ctx.fillRect(0,0,1100,420);ctx.fillStyle='#42594b';ctx.fillRect(0,0,1100,72);
    ctx.fillStyle='#fff';ctx.font='bold 34px sans-serif';ctx.fillText('三樓院內公告與舊照片',30,48);
    ctx.fillStyle='#3e4c44';ctx.font='23px sans-serif';
    ['夜間通行請攜帶感應卡','舊行政區整修紀錄：部分資料移交保管室','非值勤人員請勿進入文件保管區'].forEach((t,i)=>ctx.fillText('• '+t,38,125+i*60));
    ctx.fillStyle='#b8b2a5';for(let i=0;i<4;i++){ctx.fillRect(650+i*95,112,74,106);ctx.fillStyle='#d5d0c5';ctx.fillRect(660+i*95,122,54,72);ctx.fillStyle='#b8b2a5';}
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
    const face=new THREE.Mesh(new THREE.PlaneGeometry(4.48,1.13),new THREE.MeshStandardMaterial({map:tex,roughness:.9}));face.position.set(-8,1.65,-8.235);root.add(face);
  }
  // Low filing units sit inside the existing desk footprint.
  asset('storageCabinet',6.75,0,6.2,[.8,.39,1.8],Math.PI);

  for(const z of [-3,3])box(-4,1.6,z,.4,3.2,1,m.wall);
  // Wall protection, baseboards and rail mounting brackets follow the validated shell.
  [[-1.1,5.8],[9.5,13]].forEach(([x,w]) => box(x,.09,2.275,w,.18,.045,m.wallBumper));
  box(6,.09,-2.18,20,.18,.045,m.wallBumper);
  box(6,.09,8.275,9.6,.18,.045,m.wallBumper);
  box(1.225,.09,5.5,.045,.18,5.6,m.wallBumper);
  box(10.775,.09,5.5,.045,.18,5.6,m.wallBumper);
  for (let x=-3;x<16;x+=1.4) {
    box(x,1.02,-2.24,.055,.14,.12);
    if (x<1.6 || x>3.2) box(x,1.02,2.28,.055,.14,.12);
  }
  // Standard 600 mm acoustic ceiling T-grid, with actual depth at each joint.
  [[-8,0,8,7],[6,0,20,5],[6,5.5,10,6]].forEach(([x,z,w,d]) => {
    for(let u=-w/2+.6;u<w/2;u+=.6) box(x+u,3.184,z,.012,.02,d,m.ceiling);
    for(let v=-d/2+.6;v<d/2;v+=.6) box(x,3.184,z+v,w,.02,.012,m.ceiling);
  });
  // Render-only glazing replaces the opaque modeling skin; sealed collision stays intact.
  const shell = level.scene.getObjectByName('MODELING_3F_OPPOSITE_WALL_V3_SEALED');
  if (shell) {
    shell.children.forEach(child => {
      const p=child.geometry?.parameters;
      if (!p) return;
      if (p.width === 20.4 && p.height === 3.2) child.visible = false;
      if (Math.abs(p.width-2.5)<.01) child.material=m.glass;
      else if (Math.abs(p.width-2.72)<.01) child.visible=false;
      else child.material=m.wall;
    });
    box(6,.575,-2.42,20.4,1.15,.24,m.wall);
    box(6,2.855,-2.42,20.4,.69,.24,m.wall);
    const centers = [-2.35,.95,4.25,7.55,10.85,14.15];
    let start = -4.2;
    for (const x of centers) {
      const end = x-1.25;
      box((start+end)/2,1.83,-2.42,end-start,1.36,.24,m.wall);
      start=x+1.25;
      for(const dx of [-1.31,1.31])box(x+dx,1.83,-2.275,.12,1.58,.10,m.metal);
      for(const y of [1.10,2.56])box(x,y,-2.275,2.72,.12,.10,m.metal);
    }
    box((start+16.2)/2,1.83,-2.42,16.2-start,1.36,.24,m.wall);
    for(const child of level.scene.children)if(child.geometry?.parameters.width===60 && child.geometry?.parameters.height===20)child.visible=false;
    buildCampusBackdrop(root);
    centers.forEach(x => {
      box(x,1.83,-2.195,.04,1.38,.045);
      box(x,1.83,-2.19,2.5,.035,.045);
      box(x,1.095,-2.13,2.78,.06,.22,m.floorWood);
      box(x+.57,1.62,-2.15,.14,.025,.045);
    });
  }
  // Wall-mounted bulletin board frame and individually pinned administrative sheets.
  box(6.5,2.62,8.22,3.06,.055,.055,m.floorWood);
  box(6.5,1.38,8.22,3.06,.055,.055,m.floorWood);
  box(4.97,2,8.22,.055,1.24,.055,m.floorWood);
  box(8.03,2,8.22,.055,1.24,.055,m.floorWood);
  const paper = new THREE.MeshStandardMaterial({color:0xf2efe4,roughness:.95});
  for(let i=0;i<5;i++) {
    const x=5.35+i*.53;
    box(x,2.02,8.235,.4,.65,.004,paper);
    box(x,2.3,8.222,.025,.025,.012,m.wallDark);
    for(let line=0;line<7;line++) box(x,2.17-line*.055,8.229,.29-(line%3)*.04,.006,.002,m.wallDark);
  }
  // Public administrative notices are distinct from the duty instructions inside 316.
  [[5.1,'行政公告','ADMINISTRATION'],[12.7,'門診資訊','OUTPATIENT SERVICES']].forEach(([x,title,subtitle]) => {
    box(x,1.92,2.255,2.2,1.05,.045,m.floorWood);
    const canvas=document.createElement('canvas');
    canvas.width=1024; canvas.height=512;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#e7e4d9'; ctx.fillRect(0,0,1024,512);
    ctx.fillStyle='#465e50'; ctx.fillRect(0,0,1024,88);
    ctx.fillStyle='#f4f0e6'; ctx.font='bold 42px sans-serif'; ctx.fillText(title,35,60);
    ctx.font='20px sans-serif'; ctx.fillText(subtitle,400,55);
    const headings=['院內聯絡','門診時間','健康資訊'];
    const lines=[['總機轉接及夜間聯絡','請洽各樓層護理站'],['依現場公告辦理','攜帶健保卡與預約單'],['規律作息・適度活動','需要協助請告知工作人員']];
    for(let i=0;i<3;i++) {
      const px=26+i*330;
      ctx.fillStyle='#faf8ef'; ctx.fillRect(px,113,306,363);
      ctx.fillStyle='#415348'; ctx.font='bold 31px sans-serif'; ctx.fillText(headings[i],px+20,166);
      ctx.font='19px sans-serif'; lines[i].forEach((line,j)=>ctx.fillText(line,px+18,219+j*35));
      ctx.fillStyle='#b1b8ad'; for(let row=0;row<5;row++)ctx.fillRect(px+18,320+row*21,244-row%2*38,3);
    }
    const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace;
    const face=new THREE.Mesh(new THREE.PlaneGeometry(2.12,.99),new THREE.MeshStandardMaterial({map:texture,roughness:.92}));
    face.position.set(x,1.92,2.228); face.rotation.y=Math.PI; root.add(face);
  });
  // Fictional physician roster: no real hospital, staff names or portraits are published.
  box(12.7,2.0,2.205,3.25,1.35,.055,m.floorWood);
  {
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=520;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#e9ece7';ctx.fillRect(0,0,1200,520);
    ctx.fillStyle='#344d40';ctx.fillRect(0,0,1200,78);ctx.fillStyle='#fff';ctx.font='bold 34px sans-serif';ctx.fillText('青嶺醫療中心｜夜間醫師值勤名冊',28,51);
    const staff=[['林醫師','總醫師'],['周醫師','住院醫師'],['陳醫師','住院醫師'],['許醫師','主治醫師'],['江醫師','主治醫師'],['方醫師','值班支援']];
    staff.forEach(([name,role],i)=>{const col=i%3,row=Math.floor(i/3),x=38+col*385,y=112+row*190;
      ctx.fillStyle='#c9d1ca';ctx.beginPath();ctx.arc(x+58,y+56,42,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#6f7c74';ctx.beginPath();ctx.arc(x+58,y+47,17,0,Math.PI*2);ctx.fill();ctx.fillRect(x+35,y+67,46,25);
      ctx.fillStyle='#26372f';ctx.font='bold 27px sans-serif';ctx.fillText(name,x+118,y+48);ctx.font='21px sans-serif';ctx.fillStyle='#657168';ctx.fillText(role,x+118,y+83);
      ctx.strokeStyle='#b7beb8';ctx.strokeRect(x,y,340,135);
    });
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
    const face=new THREE.Mesh(new THREE.PlaneGeometry(3.15,1.25),new THREE.MeshStandardMaterial({map:tex,roughness:.9}));face.position.set(12.7,2.0,2.17);face.rotation.y=Math.PI;root.add(face);
  }

  // Desk lamp has a connected articulated stem, not a floating shade.
  box(5.1,.98,6.5,.022,.27,.022,m.metal);
  box(5.1,1.11,6.5,.18,.018,.022,m.metal);
  return root;
}
