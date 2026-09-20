import * as THREE from 'three';
import { solid, asset, monitor } from '../../art/ArtDetails.js';
import { AccessDoor } from './AccessDoor.js';
import { Doorway } from './Doorway.js';
import { CollisionFactory } from './CollisionFactory.js';
import { SignAnchor } from './SignAnchor.js';

/** Merge coincident partitions before cutting apertures: no stacked wall surfaces. */
export class PlanWalls {
  constructor(zone){this.zone=zone;this.lines=new Map();this.cuts=new Map();}
  line(axis,at,a,b){const k=`${axis}:${at}`;if(!this.lines.has(k))this.lines.set(k,[]);this.lines.get(k).push([a,b]);}
  rect(x1,z1,x2,z2){this.line('x',z1,x1,x2);this.line('x',z2,x1,x2);this.line('z',x1,z1,z2);this.line('z',x2,z1,z2);}
  cut(axis,at,c,w){const k=`${axis}:${at}`;if(!this.cuts.has(k))this.cuts.set(k,[]);this.cuts.get(k).push([c-w/2,c+w/2]);}
  build(){const q=this.zone;for(const [key,raw] of this.lines){let merged=[];for(const [a,b] of raw.sort((a,b)=>a[0]-b[0])){if(merged.length&&a<=merged.at(-1)[1]+.001)merged.at(-1)[1]=Math.max(b,merged.at(-1)[1]);else merged.push([a,b]);}
    for(const [ca,cb] of this.cuts.get(key)||[])merged=merged.flatMap(([a,b])=>cb<=a||ca>=b?[[a,b]]:[[a,Math.max(a,ca)],[Math.min(b,cb),b]].filter(([l,r])=>r-l>.001));
    const [axis,s]=key.split(':'),at=Number(s);for(const [a,b] of merged){const x=axis==='x'?(a+b)/2:at,z=axis==='x'?at:(a+b)/2;const w=axis==='x'?b-a:.22,d=axis==='x'?.22:b-a;
      q.gf.buildWall(q.zoneGroup,q.colliders,x,1.6,z,w,3.2,d);
      // Painted baseboard, follows each individual wall segment; never crosses a doorway.
      solid(q.zoneGroup,q.gf.materials.wallDark,[x,.07,z],[w+.025,.14,d+.025]);
    }
  }}
}

export function ordinaryRoom(zone,walls,{id,label=id+' 病房',rect,side,door,kind='ward',protectedArea=true}) {
  const [x1,z1,x2,z2]=rect,cx=(x1+x2)/2,cz=(z1+z2)/2;
  walls.rect(...rect);const alongX=side==='north'||side==='south';
  const x=alongX?door:(side==='west'?x1:x2),z=alongX?(side==='north'?z1:z2):door;
  walls.cut(alongX?'x':'z',alongX?z:x,alongX?x:z,1.6);
  const opening=Doorway.build({scene:zone.zoneGroup,colliders:zone.colliders,x,z,width:1.6,height:2.4,wallHeight:3.2,isAlongX:alongX,isOpen:true,doorMaterial:zone.gf.materials.doorWood});
  opening.name=`RoomDoor_${id}`;
  // Open leaves sit at the side of the aperture; register their actual footprints.
  for(const child of opening.children)if(child.geometry?.parameters.height===2.35){opening.updateWorldMatrix(true,true);zone.colliders.push(new THREE.Box3().setFromObject(child));}
  const outward=side==='north'?[0,-1]:side==='south'?[0,1]:side==='west'?[-1,0]:[1,0];
  const corridor=[x+outward[0]*1.1,1.7,z+outward[1]*1.1],point=[x-outward[0]*1.25,1.7,z-outward[1]*1.25];
  const yaw=side==='north'?Math.PI:side==='south'?0:side==='west'?-Math.PI/2:Math.PI/2;
  SignAnchor.buildWallPlaque({scene:zone.zoneGroup,x:x+(alongX?-1.1:outward[0]*.15),y:1.75,z:z+(alongX?outward[1]*.15:-1.1),rotationY:yaw,width:1,height:.34,code:id,title:label.replace(id,'').trim(),subtitle:'',header:''});
  if(kind==='ward'){const bx=side==='west'?x2-1.2:x1+1.2,bz=alongX?(side==='south'?z1+1.6:z2-1.6):z1+1.5;
    asset(zone.zoneGroup,'hospitalBed',[bx,0,bz]);CollisionFactory.addBox(zone.colliders,bx,.5,bz,1.15,1,2.15);
  }
  zone.roomAreas.push({id,label,rect,door:[x,1.7,z],point,corridor,protectedArea,kind});
  zone.gf.buildCeilingLight(zone.zoneGroup,cx,3.15,cz,.65,7);
  return zone.roomAreas.at(-1);
}

export function workstation(zone,{x,z,yaw=0,id}){
  asset(zone.zoneGroup,'workDesk',[x,0,z],[1.3,1,1]);
  CollisionFactory.addBox(zone.colliders,x,.4,z,1.85,.8,.85);
  const face=monitor(zone.zoneGroup,zone.gf.materials,x,.80,z,yaw);
  const cx=x+Math.sin(yaw)*.95,cz=z+Math.cos(yaw)*.95;
  asset(zone.zoneGroup,'officeChair',[cx,0,cz],[1,1,1],yaw+Math.PI);
  face.name=`Workstation_${id}`;zone.workstations??=[];zone.workstations.push({id,screen:face,chair:[cx,0,cz],yaw});
  return face;
}

/** Identical protected staff-station module used by both wards. Front faces local -Z. */
export function nursingStation(zone,{x,z,yaw=0,id}) {
  const sub={gf:zone.gf,zoneGroup:new THREE.Group(),colliders:[],walkables:[],interactables:[],workstations:[]};
  sub.zoneGroup.name='NursingStation_STANDARD_6x6';sub.zoneGroup.position.set(x,0,z);sub.zoneGroup.rotation.y=yaw;zone.zoneGroup.add(sub.zoneGroup);
  const m=zone.gf.materials;
  // Counter / transparent reinforced glazing / visible posts. No decals or frosted stripes.
  solid(sub.zoneGroup,m.wallDark,[-.7,.53,0],[4.5,1.06,.6]);solid(sub.zoneGroup,m.counterTop,[-.7,1.1,0],[4.6,.08,.72]);
  CollisionFactory.addBox(sub.colliders,-.7,1.5,0,4.6,3,.72);
  const glass=m.glass.clone();glass.side=THREE.DoubleSide;glass.transparent=true;glass.opacity=.23;glass.depthWrite=false;
  solid(sub.zoneGroup,glass,[-.7,1.95,0],[4.5,1.6,.035]);
  for(const sx of [-3,1.6,3])solid(sub.zoneGroup,m.doorWood,[sx,1.55,0],[.10,3.1,.14]);
  solid(sub.zoneGroup,m.doorWood,[0,2.92,0],[6.1,.36,.25]);
  zone.gf.buildWall(sub.zoneGroup,sub.colliders,-3,1.6,3,.2,3.2,6);
  zone.gf.buildWall(sub.zoneGroup,sub.colliders,3,1.6,3,.2,3.2,6);
  zone.gf.buildWall(sub.zoneGroup,sub.colliders,0,1.6,6,6.2,3.2,.2);
  workstation(sub,{x:-1.5,z:3.8,yaw:0,id:id+'_A'});workstation(sub,{x:1.1,z:3.8,yaw:0,id:id+'_B'});
  asset(sub.zoneGroup,'storageCabinet',[-1.7,0,5.6]);asset(sub.zoneGroup,'printer',[1.1,.8,3.8],[.7,.7,.7]);
  SignAnchor.buildWallPlaque({scene:sub.zoneGroup,x:0,y:2.88,z:-.15,rotationY:Math.PI,width:1.5,height:.3,code:'',title:'護理站',subtitle:'',header:''});
  sub.zoneGroup.updateWorldMatrix(true,true);
  const matrix=sub.zoneGroup.matrixWorld;
  for(const c of sub.colliders)zone.colliders.push(c.applyMatrix4(matrix));
  for(const item of sub.workstations){const chair=new THREE.Vector3(...item.chair).applyMatrix4(matrix);zone.workstations.push({...item,chair:chair.toArray(),yaw:item.yaw+yaw});}
  // Door is created in world space after converting the module attachment point.
  const p=new THREE.Vector3(2.3,0,0).applyMatrix4(matrix);
  new AccessDoor(zone,{id:id+'_staff',x:p.x,z:p.z,yaw,width:1.3,title:'護理站工作門',material:m.doorWood});
  zone.station={id,module:'NursingStation_STANDARD_6x6',position:[x,z],yaw};
}
