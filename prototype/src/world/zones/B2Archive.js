import * as THREE from 'three';
import { monitor, solid } from '../../art/ArtDetails.js';
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

    const frame=solid(this.zoneGroup,m.wallDark,[0,1.25,-14.65],[3.4,2.5,.15]);
    frame.name='B2_ArchiveMirror_Frame';
    const mirror=new THREE.Mesh(
      new THREE.PlaneGeometry(2.62,1.82),
      new THREE.MeshPhysicalMaterial({color:0x56665f,metalness:.82,roughness:.24,envMapIntensity:.7})
    );
    mirror.name='B2_ArchiveMirror_Surface';mirror.position.set(0,1.23,-14.56);this.zoneGroup.add(mirror);
    SignAnchor.buildWallPlaque({
      scene:this.zoneGroup,x:0,y:2.36,z:-14.52,rotationY:0,width:1.45,height:.42,
      code:'B2',title:'封存驗證區',subtitle:'ARCHIVE MIRROR',header:''
    });

    const desk=solid(this.zoneGroup,m.doorWood,[0,.78,-12.8],[2.2,.08,.88]);desk.name='B2_ArchiveDesk';
    solid(this.zoneGroup,m.metal,[-.8,.38,-12.8],[.07,.72,.07]);
    solid(this.zoneGroup,m.metal,[.8,.38,-12.8],[.07,.72,.07]);
    const workstation=monitor(this.zoneGroup,m,0,.82,-12.92,0);workstation.name='B2_ArchiveWorkstation';
    const phone=new THREE.Group();phone.name='B2_ArchiveDeskPhone';phone.position.set(.72,.84,-12.66);this.zoneGroup.add(phone);
    solid(phone,m.wallDark,[0,.04,0],[.34,.08,.22]);
    solid(phone,m.metal,[0,.12,0],[.42,.08,.09],.025);
    const terminal=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.05,.9),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    terminal.position.set(0,1.18,-12.75);
    terminal.name='B2_ArchiveTerminal';
    terminal.userData={interactable:true,id:'B2_ARCHIVE_TERMINAL',type:'b2_archive_terminal',label:'啟動 B2 舊終端機'};
    this.interactables.push(terminal);

    const stairwell=new THREE.Group();stairwell.name='B2_EscapeStairwell';stairwell.position.set(0,0,.72);this.zoneGroup.add(stairwell);
    for(let step=0;step<6;step++)solid(stairwell,m.metal,[0,.10+step*.17,.30-step*.30],[2.2,.20,.42]);
    solid(stairwell,m.wallDark,[-1.18,1.25,-.45],[.10,2.5,2.8]);solid(stairwell,m.wallDark,[1.18,1.25,-.45],[.10,2.5,2.8]);
    SignAnchor.buildWallPlaque({scene:stairwell,x:0,y:2.25,z:.66,rotationY:Math.PI,width:1.55,height:.38,code:'EXIT',title:'逃生梯｜返回 1F',subtitle:'STAIRWAY',header:''});
    const returnHit=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.4,1.5),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    returnHit.position.set(0,1.2,1.1);
    returnHit.userData={interactable:true,id:'B2_ESCAPE_STAIRS',type:'b2_escape_stairs',label:'沿逃生梯返回 1F'};
    this.zoneGroup.add(returnHit);this.interactables.push(returnHit);

    // Charred archive boxes: visual evidence only.
    for(let i=0;i<8;i++)solid(this.zoneGroup,i%2?m.wallDark:m.metal,[-3.6+(i%2)*7.2,.28+(i%3)*.38,-3.5-Math.floor(i/2)*2.2],[.72,.52,.92]);

    this.b2={id:'B2_ARCHIVE',archiveMirror:true,terminal:'B2_ARCHIVE_TERMINAL',exit:'B2_ESCAPE_STAIRS'};
    return this;
  }

  cleanup(){this.scene.remove(this.zoneGroup);disposeZoneArt(this.zoneGroup);this.colliders=[];this.walkables=[];this.interactables=[];}
}
