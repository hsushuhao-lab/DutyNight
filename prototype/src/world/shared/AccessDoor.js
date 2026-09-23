import * as THREE from 'three';
import { solid } from '../../art/ArtDetails.js';
import { SignAnchor } from './SignAnchor.js';

/** A pocket-sliding, normally closed staff door. Geometry and collision share the aperture. */
export class AccessDoor {
  constructor(zone, {id, x, z, yaw=0, width=2.4, title='感應門禁', material, portal=null, readers=true, readerSide=1}) {
    this.zone=zone; this.id=id; this.portal=portal; this.width=width; this.readerSide=readerSide;
    const m=zone.gf.materials;
    this.root=new THREE.Group(); this.root.name=`AccessDoor_${id}`;
    this.root.position.set(x,0,z); this.root.rotation.y=yaw; zone.zoneGroup.add(this.root);
    // Recessed steel doors, not prison bars. Side frames stay outside the clear width.
    for(const side of [-1,1]) solid(this.root,m.metal,[side*(width/2+.05),1.2,0],[.10,2.4,.25]);
    solid(this.root,m.metal,[0,2.43,0],[width+.2,.12,.25]);
    // Close the header to ceiling height; a valid doorway must not expose a void above its frame.
    solid(this.root,m.wall,[0,2.845,0],[width+.2,.71,.22]);
    this.leaves=[-1,1].map(side=>{
      const leaf=solid(this.root,material||m.metal,[side*width/4,1.175,0],[width/2,2.35,.10]);
      if(!readers)solid(leaf,m.stainless,[-side*.14,-.12,-.07],[.035,.34,.05]);
      leaf.userData={interactable:!portal,id:`${id}_leaf_${side}`,type:'access_door',doorId:id,label:`開啟${title}`};
      if(!portal) zone.interactables.push(leaf);
      return leaf;
    });
    this.readers=[];
    const mountX=readerSide*(width/2+.16);
    const mount=new THREE.Group();mount.position.set(mountX,1.4,0);mount.name=`ReaderJambMount_${id}`;
    mount.userData={readerMount:true,mount:'jamb',doorId:id,readerSide};this.root.add(mount);
    solid(mount,m.metal,[0,0,0],[.24,.42,.30]);this.readerMounts=[mount];
    for(const side of [-1,1]) {
      const reader=new THREE.Group(); reader.position.set(0,0,side*.18);
      reader.rotation.y=side===1?0:Math.PI; mount.add(reader);
      const panel=solid(reader,m.metal,[0,0,0],[.17,.32,.07]);
      const led=new THREE.Mesh(new THREE.CircleGeometry(.037,16),new THREE.MeshBasicMaterial({color:0xdda634}));
      led.position.z=.042; if(readers)reader.add(led);
      else solid(reader,m.stainless,[0,0,.07],[.09,.04,.04]);
      panel.userData={interactable:true,id:`${id}_${side===1?'front':'back'}`,type:'access_door',doorId:id,label:readers?`感應開啟${title}`:`鑰匙開啟${title}`};
      zone.interactables.push(panel); this.readers.push(panel);
    }
    SignAnchor.buildWallPlaque({scene:this.root,x:0,y:2.69,z:.14,width:Math.min(2.5,width+.25),height:.3,code:'',title,subtitle:'',header:''});
    this.root.updateWorldMatrix(true,true);
    this.closedBox=new THREE.Box3(new THREE.Vector3(-width/2,0,-.1),new THREE.Vector3(width/2,2.35,.1)).applyMatrix4(this.root.matrixWorld);
    this.closed=false; this.setClosed(true);
    zone.accessDoors??={}; zone.accessDoors[id]=this;
  }
  setClosed(closed) {
    this.closed=closed;
    this.leaves.forEach((leaf,i)=>{leaf.position.x=(i===0?-1:1)*(closed?this.width/4:this.width*.75);});
    const i=this.zone.colliders.indexOf(this.closedBox);
    if(closed&&i<0)this.zone.colliders.push(this.closedBox);
    if(!closed&&i>=0)this.zone.colliders.splice(i,1);
    for(const panel of this.readers) panel.userData.label=this.id==='duty_room'?(closed?'鑰匙開門':'關門'):(closed?'感應開門':'感應關門');
    this.root.updateWorldMatrix(true,true);
  }
  toggle(position) {
    if(!this.closed && position) {
      const player=new THREE.Box3(new THREE.Vector3(position.x-.35,0,position.z-.35),new THREE.Vector3(position.x+.35,1.95,position.z+.35));
      if(player.intersectsBox(this.closedBox))return false;
    }
    this.setClosed(!this.closed);return true;
  }
}
