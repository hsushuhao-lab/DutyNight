import * as THREE from 'three';
import { solid } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { SignAnchor } from '../shared/SignAnchor.js';
import { createAnnieArt, updateAnnieArt } from '../../art/AnnieArt.js';
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

    const elevatorDisplay=new THREE.Group();elevatorDisplay.name='Phantom6F_ElevatorDisplay';elevatorDisplay.position.set(0,2.48,1.78);this.zoneGroup.add(elevatorDisplay);
    solid(elevatorDisplay,m.wallDark,[0,0,0],[.52,.34,.09]);
    const displayCanvas=document.createElement('canvas');displayCanvas.width=128;displayCanvas.height=128;
    const displayContext=displayCanvas.getContext('2d');displayContext.fillStyle='#180e0c';displayContext.fillRect(0,0,128,128);
    displayContext.fillStyle='#c95a3d';displayContext.font='bold 92px sans-serif';displayContext.textAlign='center';displayContext.textBaseline='middle';displayContext.fillText('6',64,66);
    const displayTexture=new THREE.CanvasTexture(displayCanvas);displayTexture.colorSpace=THREE.SRGBColorSpace;
    const displayFace=new THREE.Mesh(new THREE.PlaneGeometry(.40,.25),new THREE.MeshBasicMaterial({map:displayTexture}));displayFace.position.z=-.051;displayFace.rotation.y=Math.PI;elevatorDisplay.add(displayFace);

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
    const patient=new THREE.Mesh(new THREE.SphereGeometry(.34,24,16),charred);patient.name='Annie_Patient_CPR_Target';patient.scale.set(.72,.42,2.45);patient.position.set(0,.82,.02);burntBed.add(patient);

    const annie=createAnnieArt(this.zoneGroup,{materials:m,state:'FLOOR6_CPR',position:[1.42,0,-7.3],rotationY:-Math.PI/2});
    this.annie=annie;
    this.cprElapsed=0;this.nextCprSound=60/110*.25;

    this.phantomFloor={id:'PHANTOM_6F',safe:'FLOOR6_SAFE_RETURN',danger:'FLOOR6_CHASE'};
    return this;
  }

  update(_,delta=0){
    this.cprElapsed+=delta;
    updateAnnieArt(this.annie,delta);
    if(this.cprElapsed>=this.nextCprSound){soundManager.playCprCompression();this.nextCprSound=this.cprElapsed+60/110;}
  }

  cleanup(){this.scene.remove(this.zoneGroup);disposeZoneArt(this.zoneGroup);this.colliders=[];this.walkables=[];this.interactables=[];}
}
