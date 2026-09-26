import * as THREE from 'three';
import {asset,monitor,solid} from './ArtDetails.js';

export function buildDeskCluster(parent,materials,{x,z,yaw=0,chairs=1,name='DeskCluster'}={}){
  const group=new THREE.Group();group.name=name;group.position.set(x,0,z);group.rotation.y=yaw;parent.add(group);
  asset(group,'workDesk',[0,0,0]);
  monitor(group,materials,0,.76,0,0);
  for(let i=0;i<chairs;i++)asset(group,'officeChair',[-.42+i*.84,0,.92],[.92,.92,.92],Math.PI);
  const phone=new THREE.Group();phone.name=`${name}_Phone`;phone.position.set(-.48,.80,-.08);group.add(phone);
  solid(phone,materials.wallDark,[0,.035,0],[.28,.07,.19]);
  solid(phone,materials.metal,[0,.105,0],[.35,.07,.08],.025);
  for(let i=0;i<3;i++)solid(group,i%2?materials.wallBumper:materials.bedSheet,[.48+i*.07,.92,-.08],[.055,.28,.20]);
  return group;
}

export function buildSupplyCabinet(parent,materials,{x,z,yaw=0,rows=4,columns=5,name='SupplyCabinet'}={}){
  const group=new THREE.Group();group.name=name;group.position.set(x,0,z);group.rotation.y=yaw;parent.add(group);
  solid(group,materials.wallDark,[0,1.02,-.16],[1.35,2.04,.08]);
  for(const side of [-.68,.68])solid(group,materials.metal,[side,1.02,0],[.07,2.04,.42]);
  for(let row=0;row<rows;row++){
    const y=.18+row*.48;solid(group,materials.metal,[0,y,0],[1.42,.06,.45]);
    for(let column=0;column<columns;column++){
      const material=(row+column)%2?materials.wallBumper:materials.lightWarm;
      solid(group,material,[-.52+column*.26,y+.16,.04],[.20,.22,.28],.015);
    }
  }
  return group;
}

export function buildClinicalCart(parent,materials,{x,z,yaw=0,name='ClinicalCart'}={}){
  const group=new THREE.Group();group.name=name;group.position.set(x,0,z);group.rotation.y=yaw;parent.add(group);
  solid(group,materials.stainless,[0,.65,0],[.82,.08,.48]);
  solid(group,materials.metal,[0,.34,0],[.74,.54,.42]);
  for(const xOffset of [-.31,.31])for(const zOffset of [-.15,.15]){
    solid(group,materials.wallDark,[xOffset,.05,zOffset],[.07,.10,.07]);
  }
  for(let i=0;i<4;i++)solid(group,i%2?materials.bedSheet:materials.wallBumper,[-.27+i*.18,.76,0],[.13,.16,.18]);
  return group;
}

export function buildIvStand(parent,materials,{x,z,name='IVStand'}={}){
  const group=new THREE.Group();group.name=name;group.position.set(x,0,z);parent.add(group);
  solid(group,materials.stainless,[0,.92,0],[.035,1.84,.035]);
  solid(group,materials.stainless,[0,.04,0],[.52,.04,.08]);
  solid(group,materials.stainless,[0,1.80,0],[.38,.025,.025]);
  for(const xOffset of [-.14,.14])solid(group,materials.bedSheet,[xOffset,1.55,0],[.18,.30,.07],.02);
  return group;
}

export function buildMonitorWall(parent,materials,{x,y=1.75,z,yaw=0,name='MonitorWall'}={}){
  const group=new THREE.Group();group.name=name;group.position.set(x,y,z);group.rotation.y=yaw;parent.add(group);
  for(let row=0;row<2;row++)for(let column=0;column<3;column++){
    const screen=solid(group,materials.wallDark,[-.72+column*.72,.32-row*.64,0],[.62,.48,.06]);
    screen.name=`${name}_${row}_${column}`;
    const glow=new THREE.Mesh(new THREE.PlaneGeometry(.54,.40),new THREE.MeshBasicMaterial({color:(row+column)%2?0x395249:0x4d5a55}));
    glow.position.set(screen.position.x,screen.position.y,.035);group.add(glow);
  }
  return group;
}
