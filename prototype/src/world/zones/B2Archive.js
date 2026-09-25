import * as THREE from 'three';
import { solid } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { SignAnchor } from '../shared/SignAnchor.js';

export class B2Archive {
  constructor(scene,geometryFactory){
    this.scene=scene;this.gf=geometryFactory;this.colliders=[];this.walkables=[];this.interactables=[];
    this.zoneGroup=new THREE.Group();this.zoneGroup.name='B2Archive_Zone';
  }

  build(){
    this.scene.add(this.zoneGroup);
    const m=this.gf.materials;
    this.gf.buildFloor(this.zoneGroup,this.walkables,0,0,-7,10,18,m.floorTile);
    this.gf.buildCeiling(this.zoneGroup,0,3.2,-7,10,18);
    this.gf.buildWall(this.zoneGroup,this.colliders,-5,1.6,-7,.3,3.2,18);
    this.gf.buildWall(this.zoneGroup,this.colliders,5,1.6,-7,.3,3.2,18);
    this.gf.buildWall(this.zoneGroup,this.colliders,0,1.6,-16,10,3.2,.3);
    this.gf.buildWall(this.zoneGroup,this.colliders,0,1.6,2,10,3.2,.3);

    for(const z of [-1,-6,-11])this.gf.buildCeilingLight(this.zoneGroup,0,3.15,z,.55,2.6,0x6b5146);

    SignAnchor.buildWallPlaque({
      scene:this.zoneGroup,x:-3.5,y:2.1,z:.8,rotationY:0,width:1.25,height:.42,
      code:'B2',title:'封存隔離層',subtitle:'ARCHIVE / ISOLATION',header:'資料不存在於現行樓層圖'
    });

    // Burnt mirror-316 office at the end of the corridor.
    const frame=solid(this.zoneGroup,m.wallDark,[0,1.25,-14.65],[3.4,2.5,.15]);
    frame.name='B2_Mirror316_Frame';
    const mirror=new THREE.Mesh(
      new THREE.PlaneGeometry(2.62,1.82),
      new THREE.MeshPhysicalMaterial({color:0x56665f,metalness:.82,roughness:.24,envMapIntensity:.7})
    );
    mirror.name='B2_Mirror316_Surface';mirror.position.set(0,1.23,-14.56);this.zoneGroup.add(mirror);
    SignAnchor.buildWallPlaque({
      scene:this.zoneGroup,x:0,y:2.36,z:-14.52,rotationY:0,width:1.45,height:.42,
      code:'316',title:'總醫師辦公室',subtitle:'ARCHIVE MIRROR',header:''
    });

    const desk=solid(this.zoneGroup,m.doorWood,[0,.78,-12.8],[2.2,.08,.88]);desk.name='B2_316_Desk';
    solid(this.zoneGroup,m.metal,[-.8,.38,-12.8],[.07,.72,.07]);
    solid(this.zoneGroup,m.metal,[.8,.38,-12.8],[.07,.72,.07]);
    const terminal=solid(this.zoneGroup,m.wallDark,[0,1.18,-12.95],[.78,.46,.08]);
    terminal.name='B2_ArchiveTerminal';
    terminal.userData={interactable:true,id:'B2_ARCHIVE_TERMINAL',type:'b2_archive_terminal',label:'啟動 B2 舊終端機'};
    this.interactables.push(terminal);

    const returnHit=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.4,1.2),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    returnHit.position.set(0,1.2,1.1);
    returnHit.userData={interactable:true,id:'B2_RETURN_LIFT',type:'b2_return_lift',label:'搭乘舊貨梯返回 1F'};
    this.zoneGroup.add(returnHit);this.interactables.push(returnHit);

    // Charred archive boxes: visual evidence only.
    for(let i=0;i<8;i++)solid(this.zoneGroup,i%2?m.wallDark:m.metal,[-3.6+(i%2)*7.2,.28+(i%3)*.38,-3.5-Math.floor(i/2)*2.2],[.72,.52,.92]);

    this.b2={id:'B2_ARCHIVE',mirror316:true,terminal:'B2_ARCHIVE_TERMINAL'};
    return this;
  }

  cleanup(){this.scene.remove(this.zoneGroup);disposeZoneArt(this.zoneGroup);this.colliders=[];this.walkables=[];this.interactables=[];}
}
