import * as THREE from 'three';
import {solid} from '../../art/ArtDetails.js';
import {SignAnchor} from './SignAnchor.js';
import {LIFT_PANELS} from './WorldRoutes.js';
export function addTravelFixtures(zone,zoneId){
 const m=zone.gf.materials;
 function panel(position,yaw,kind='elevator'){
  const root=new THREE.Group();root.position.set(...position);root.rotation.y=yaw;zone.zoneGroup.add(root);
  solid(root,m.metal,[0,0,0],[.22,.38,.08]);
  const button=solid(root,m.wallDark,[0,0,.046],[.12,.22,.025]);
  button.userData={interactable:true,id:`${zoneId}_${kind}`,type:'travel_selector',kind,campus:zoneId.startsWith('first')?'first':'second',label:kind==='elevator'?'電梯選擇樓層':'樓梯前往其他樓層'};
  zone.interactables.push(button);
  SignAnchor.buildWallPlaque({scene:root,x:0,y:.36,z:.045,width:.65,height:.24,code:kind==='elevator'?'LIFT':'STAIR',title:kind==='elevator'?'電梯選層':'樓梯',subtitle:'',header:''});
 }
 if(LIFT_PANELS[zoneId]){const p=LIFT_PANELS[zoneId];panel(p.position,p.yaw);}
 const stairs=zone.roomAreas?.find(r=>r.id.endsWith('_STAIRS'));
 if(stairs)panel([stairs.point[0],1.35,7.22],Math.PI,'stairs');
 if(zoneId==='second_campus_2f')panel([79.72,1.35,2.9],-Math.PI/2,'stairs');
 if(zoneId==='second_campus_1f')panel([77.76,1.35,0],-Math.PI/2,'stairs');
 if(zoneId==='hillside_route'){
  for(const [x,z,label] of [[12,-35.5,'第一院區 2F 急診'],[72.8,-18.4,'第二院區 1F 入口']]){
   solid(zone.zoneGroup,m.metal,[x,.35,z],[.07,1.7,.07]);
   SignAnchor.buildWallPlaque({scene:zone.zoneGroup,x,y:.9,z:z-.055,rotationY:Math.PI,width:1.05,height:.36,code:'PATH',title:label,subtitle:'',header:'院區步道'});
  }
 }
}
