import * as THREE from 'three';
import { solid } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { SignAnchor } from '../shared/SignAnchor.js';

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

    const double=new THREE.Group();double.name='Floor6_Doppelganger';
    const coat=new THREE.Mesh(new THREE.BoxGeometry(.44,1.02,.18),new THREE.MeshStandardMaterial({color:0xdedfd9,roughness:.92}));
    coat.position.y=.75;double.add(coat);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.15,14,10),new THREE.MeshStandardMaterial({color:0xbca98f,roughness:.92}));
    head.position.y=1.40;double.add(head);
    double.position.set(0,0,-11.2);double.rotation.y=Math.PI;this.zoneGroup.add(double);

    this.phantomFloor={id:'PHANTOM_6F',safe:'FLOOR6_SAFE_RETURN',danger:'FLOOR6_CHASE'};
    return this;
  }

  cleanup(){this.scene.remove(this.zoneGroup);disposeZoneArt(this.zoneGroup);this.colliders=[];this.walkables=[];this.interactables=[];}
}
