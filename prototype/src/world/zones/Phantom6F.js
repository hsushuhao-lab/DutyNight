import * as THREE from 'three';
import { solid } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { SignAnchor } from '../shared/SignAnchor.js';
import { soundManager } from '../../audio/SoundManager.js';

export class Phantom6F {
  constructor(scene,geometryFactory){
    this.scene=scene;this.gf=geometryFactory;this.colliders=[];this.walkables=[];this.interactables=[];
    this.zoneGroup=new THREE.Group();this.zoneGroup.name='Phantom6F_Zone';
  }

  build(){
    this.scene.add(this.zoneGroup);
    const m=this.gf.materials;
    this.gf.buildFloor(this.zoneGroup,this.walkables,0,0,-6,8,16,m.floorTile);
    this.gf.buildCeiling(this.zoneGroup,0,3.2,-6,8,16);
    this.gf.buildWall(this.zoneGroup,this.colliders,-4,1.6,-6,.3,3.2,16);
    this.gf.buildWall(this.zoneGroup,this.colliders,4,1.6,-6,.3,3.2,16);
    this.gf.buildWall(this.zoneGroup,this.colliders,0,1.6,-14,8,3.2,.3);
    this.gf.buildWall(this.zoneGroup,this.colliders,0,1.6,2,8,3.2,.3);

    for(const z of [-1,-6,-11])this.gf.buildCeilingLight(this.zoneGroup,0,3.15,z,.55,2.8,0x8a5b4b);

    SignAnchor.buildWallPlaque({
      scene:this.zoneGroup,x:-2.9,y:2.1,z:-1.8,rotationY:0,width:1.15,height:.42,
      code:'6F',title:'樓層資料不存在',subtitle:'FLOOR RECORD NOT FOUND',header:'青嶺醫療中心'
    });

    // Burnt mirror of the 316 motif.
    solid(this.zoneGroup,m.wallDark,[0,1.05,-12.9],[2.8,2.1,.12]);
    const plaque=SignAnchor.buildWallPlaque({
      scene:this.zoneGroup,x:0,y:2.15,z:-12.72,rotationY:0,width:1.2,height:.36,
      code:'316',title:'總醫師辦公室',subtitle:'',header:''
    });

    const safe=new THREE.Mesh(new THREE.BoxGeometry(1.8,2.2,.8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    safe.position.set(0,1.1,1.25);
    safe.userData={interactable:true,id:'FLOOR6_SAFE_RETURN',type:'floor6_safe_return',label:'留在電梯前，不往深處走'};
    this.zoneGroup.add(safe);this.interactables.push(safe);

    const chase=new THREE.Mesh(new THREE.BoxGeometry(2.8,2.4,3.0),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    chase.position.set(0,1.2,-10.5);
    chase.userData={interactable:true,id:'FLOOR6_CHASE',type:'floor6_chase',label:'追上走廊深處的白袍'};
    this.zoneGroup.add(chase);this.interactables.push(chase);

    const burntBed=new THREE.Group();burntBed.name='Annie_CPR_BurntBed';burntBed.position.set(.35,0,-7.3);this.zoneGroup.add(burntBed);
    const charred=new THREE.MeshStandardMaterial({color:0x171918,roughness:1});
    solid(burntBed,m.wallDark,[0,.38,0],[1.18,.18,2.12]);solid(burntBed,charred,[0,.57,0],[1.24,.20,2.18]);
    solid(burntBed,m.wallDark,[0,.72,-.92],[1.25,.48,.12]);
    const patient=new THREE.Mesh(new THREE.SphereGeometry(.34,12,8),charred);patient.scale.set(.72,.42,2.45);patient.position.set(0,.82,.02);burntBed.add(patient);

    const annie=new THREE.Group();annie.name='Annie_Floor6_CPR';annie.position.set(-.72,0,-7.15);this.zoneGroup.add(annie);
    const coatMat=new THREE.MeshStandardMaterial({color:0xd6ddd8,roughness:.96});
    const skinMat=new THREE.MeshStandardMaterial({color:0xb9b9ae,roughness:1});
    const hairMat=new THREE.MeshStandardMaterial({color:0x1c2021,roughness:1});
    const torso=new THREE.Mesh(new THREE.BoxGeometry(.42,.82,.48),coatMat);torso.position.set(0,.84,0);torso.rotation.x=.24;annie.add(torso);this.cprTorso=torso;
    const head=new THREE.Mesh(new THREE.SphereGeometry(.16,14,10),skinMat);head.position.set(0,1.38,.10);annie.add(head);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(.19,12,8),hairMat);hair.scale.set(1,.72,1);hair.position.set(0,1.43,.08);annie.add(hair);
    for(const x of [-.16,.16]){
      const sleeve=new THREE.Mesh(new THREE.BoxGeometry(.14,.60,.14),coatMat);sleeve.position.set(x,.72,.37);sleeve.rotation.x=-.72;annie.add(sleeve);
      const hand=new THREE.Mesh(new THREE.SphereGeometry(.075,10,8),skinMat);hand.position.set(x,.48,.62);annie.add(hand);
    }
    const skirt=new THREE.Mesh(new THREE.BoxGeometry(.42,.22,.42),new THREE.MeshStandardMaterial({color:0x29302f,roughness:1}));skirt.position.set(0,.35,-.12);annie.add(skirt);
    annie.rotation.y=-.12;
    this.cprElapsed=0;this.nextCprSound=1.4;

    this.phantomFloor={id:'PHANTOM_6F',safe:'FLOOR6_SAFE_RETURN',danger:'FLOOR6_CHASE'};
    return this;
  }

  update(_,delta=0){
    this.cprElapsed+=delta;
    const cycle=(this.cprElapsed%1.35)/1.35;
    this.cprTorso.position.y=.84-(cycle<.22?.10*Math.sin(Math.PI*cycle/.22):0);
    if(this.cprElapsed>=this.nextCprSound){soundManager.playCprCompression();this.nextCprSound+=1.35;}
  }

  cleanup(){this.scene.remove(this.zoneGroup);disposeZoneArt(this.zoneGroup);this.colliders=[];this.walkables=[];this.interactables=[];}
}
