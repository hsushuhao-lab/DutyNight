import * as THREE from 'three';
import { solid } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { SignAnchor } from '../shared/SignAnchor.js';
import { createAnnieArt, updateAnnieArt } from '../../art/AnnieArt.js';
import { soundManager } from '../../audio/SoundManager.js';
import { gameState } from '../../core/GameState.js';

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

    const elevator=new THREE.Group();elevator.name='Phantom6F_ElevatorDoors';elevator.position.set(0,0,1.79);this.zoneGroup.add(elevator);
    const doorMaterial=new THREE.MeshStandardMaterial({color:0x7f8781,metalness:.32,roughness:.62});
    const frameMaterial=new THREE.MeshStandardMaterial({color:0x3f4944,metalness:.38,roughness:.7});
    solid(elevator,doorMaterial,[-.61,1.12,0],[1.18,2.24,.08]);
    solid(elevator,doorMaterial,[.61,1.12,0],[1.18,2.24,.08]);
    solid(elevator,frameMaterial,[0,2.27,-.01],[2.64,.14,.14]);
    solid(elevator,frameMaterial,[-1.25,1.12,-.01],[.14,2.38,.14]);
    solid(elevator,frameMaterial,[1.25,1.12,-.01],[.14,2.38,.14]);
    solid(elevator,frameMaterial,[0,1.12,-.055],[.035,2.18,.025]);

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

    const burntBed=new THREE.Group();burntBed.name='Annie_CPR_BurntBed';burntBed.position.set(.6,0,-7.3);this.zoneGroup.add(burntBed);
    const charred=new THREE.MeshStandardMaterial({color:0x77766d,roughness:0.94});
    solid(burntBed,m.wallDark,[0,.38,0],[1.18,.18,2.12]);solid(burntBed,charred,[0,.57,0],[1.24,.20,2.18]);
    solid(burntBed,m.wallDark,[0,.72,-.92],[1.25,.48,.12]);
    const patient=new THREE.Mesh(new THREE.SphereGeometry(.34,48,32),charred);patient.name='Annie_Patient_CPR_Target';patient.scale.set(.92,.42,2.25);patient.position.set(0,.82,.02);burntBed.add(patient);
    this.patientTarget=patient;this.patientRestY=patient.position.y;this.patientRestScaleY=patient.scale.y;

    const annie=createAnnieArt(this.zoneGroup,{materials:m,state:'FLOOR6_CPR',position:[1.42,0,-7.3],rotationY:-Math.PI/2});
    this.annie=annie;
    this.cprElapsed=0;this.nextCprSound=60/110*.25;

    const search=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.05,1.2),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    search.name='Floor6_StethoscopeSearch';search.position.set(-1.55,.68,-8.35);
    search.userData={interactable:true,id:'FLOOR6_STETHOSCOPE_SEARCH',type:'floor6_stethoscope_search',label:'翻找焦黑器材'};
    this.zoneGroup.add(search);this.interactables.push(search);this.stethoscopeSearch=search;

    const inspect=new THREE.Mesh(new THREE.BoxGeometry(1.1,.7,.85),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    inspect.name='Floor6_StethoscopeInspection';inspect.position.set(-1.55,.48,-8.35);
    inspect.userData={interactable:false,id:'FLOOR6_STETHOSCOPE_INSPECT',type:'floor6_stethoscope_inspect',label:'檢視老舊聽診器'};
    this.zoneGroup.add(inspect);this.interactables.push(inspect);this.stethoscopeInspect=inspect;

    const stethoscope=new THREE.Group();stethoscope.name='Floor6_OldStethoscope';stethoscope.position.set(-1.55,.08,-8.35);stethoscope.visible=false;stethoscope.userData.inscription='祝 守恆 醫師 1997 執業誌慶';this.zoneGroup.add(stethoscope);
    const tubeMat=new THREE.MeshStandardMaterial({color:0x171a18,roughness:.9});
    const tubePath=new THREE.CatmullRomCurve3([
      new THREE.Vector3(-.24,.10,0),new THREE.Vector3(-.27,.18,0),new THREE.Vector3(-.20,.25,0),
      new THREE.Vector3(0,.27,0),new THREE.Vector3(.20,.25,0),new THREE.Vector3(.27,.18,0),new THREE.Vector3(.24,.10,0),
      new THREE.Vector3(.18,.05,.03),new THREE.Vector3(.14,.02,.10),new THREE.Vector3(.18,.02,.20)
    ]);
    stethoscope.add(new THREE.Mesh(new THREE.TubeGeometry(tubePath,48,.018,8,false),tubeMat));
    const chestpiece=new THREE.Mesh(new THREE.CylinderGeometry(.09,.10,.045,24),new THREE.MeshStandardMaterial({color:0x766f61,metalness:.45,roughness:.72}));
    chestpiece.rotation.x=Math.PI/2;chestpiece.position.set(.18,.02,.23);stethoscope.add(chestpiece);
    const engravingCanvas=document.createElement('canvas');engravingCanvas.width=768;engravingCanvas.height=384;
    const engravingContext=engravingCanvas.getContext('2d');engravingContext.fillStyle='#817969';engravingContext.fillRect(0,0,768,384);
    engravingContext.fillStyle='#292721';engravingContext.font='bold 52px sans-serif';engravingContext.textAlign='center';engravingContext.textBaseline='middle';
    engravingContext.fillText('祝 守恆 醫師',384,86);engravingContext.fillText('1997',384,192);engravingContext.fillText('執業誌慶',384,298);
    const engravingTexture=new THREE.CanvasTexture(engravingCanvas);engravingTexture.colorSpace=THREE.SRGBColorSpace;
    const engraving=new THREE.Mesh(new THREE.PlaneGeometry(.17,.12),new THREE.MeshBasicMaterial({map:engravingTexture,toneMapped:false,side:THREE.DoubleSide}));
    engraving.name='Floor6_Stethoscope_Engraving';engraving.userData.inscription=stethoscope.userData.inscription;engraving.position.set(.18,.02,.257);stethoscope.add(engraving);
    for(const x of [-.24,.24]){
      const eartip=new THREE.Mesh(new THREE.SphereGeometry(.035,12,10),tubeMat);eartip.position.set(x,.11,0);stethoscope.add(eartip);
    }
    this.stethoscopeProp=stethoscope;
    this.syncStoryState();

    this.phantomFloor={id:'PHANTOM_6F',safe:'FLOOR6_SAFE_RETURN',danger:'FLOOR6_CHASE'};
    return this;
  }

  update(_,delta=0){
    this.cprElapsed+=delta;
    updateAnnieArt(this.annie,delta);
    const compression=this.annie.userData.rig.compression;
    this.patientTarget.position.y=this.patientRestY-compression*.025;
    this.patientTarget.scale.y=this.patientRestScaleY*(1-compression*.1);
    if(this.cprElapsed>=this.nextCprSound){soundManager.playCprCompression();this.nextCprSound=this.cprElapsed+60/110;}
  }

  syncStoryState(){
    const found=gameState.getFlag('FLOOR6_STETHOSCOPE_FOUND')===true;
    const inspected=gameState.getFlag('FLOOR6_STETHOSCOPE_INSPECTED')===true;
    this.stethoscopeSearch.userData.interactable=!found;
    this.stethoscopeInspect.userData.interactable=found&&!inspected;
    this.stethoscopeSearch.visible=!found;
    this.stethoscopeInspect.visible=found&&!inspected;
    if(found)this.stethoscopeSearch.layers.disableAll();else this.stethoscopeSearch.layers.set(0);
    if(found&&!inspected)this.stethoscopeInspect.layers.set(0);else this.stethoscopeInspect.layers.disableAll();
    this.stethoscopeProp.visible=found;
  }

  cleanup(){this.scene.remove(this.zoneGroup);disposeZoneArt(this.zoneGroup);this.colliders=[];this.walkables=[];this.interactables=[];}
}
