import * as THREE from 'three';
import { solid, asset, monitor, counterFront } from '../../art/ArtDetails.js';
import { AccessDoor } from './AccessDoor.js';
import { KeyedKnobDoor } from './KeyedKnobDoor.js';
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

function mountBedWallPlaque(zone,{rect,bx,bz,roomId,bedInRoom}){
  const [x1,z1,x2,z2]=rect,margin=.16;
  const choices=[
    {wall:'north',d:Math.abs(bz-z1),x:THREE.MathUtils.clamp(bx,x1+.45,x2-.45),z:z1+margin,rotationY:0},
    {wall:'south',d:Math.abs(z2-bz),x:THREE.MathUtils.clamp(bx,x1+.45,x2-.45),z:z2-margin,rotationY:Math.PI},
    {wall:'west',d:Math.abs(bx-x1),x:x1+margin,z:THREE.MathUtils.clamp(bz,z1+.45,z2-.45),rotationY:Math.PI/2},
    {wall:'east',d:Math.abs(x2-bx),x:x2-margin,z:THREE.MathUtils.clamp(bz,z1+.45,z2-.45),rotationY:-Math.PI/2}
  ].sort((a,b)=>a.d-b.d);
  const p=choices[0];
  SignAnchor.buildWallPlaque({
    scene:zone.zoneGroup,x:p.x,y:1.42,z:p.z,rotationY:p.rotationY,
    width:.62,height:.23,code:bedInRoom,title:roomId,subtitle:`${roomId}${bedInRoom}`,header:'床位'
  });
  return {wall:p.wall,x:p.x,y:1.42,z:p.z,rotationY:p.rotationY};
}

export function ordinaryRoom(zone,walls,{id,label=id+' 病房',rect,side,door,kind='ward',protectedArea=true}) {
  const [x1,z1,x2,z2]=rect,cx=(x1+x2)/2,cz=(z1+z2)/2;
  walls.rect(...rect);const alongX=side==='north'||side==='south';
  const x=alongX?door:(side==='west'?x1:x2),z=alongX?(side==='north'?z1:z2):door;
  walls.cut(alongX?'x':'z',alongX?z:x,alongX?x:z,1.6);

  let accessDoorId=null,doorType='open';
  if(kind==='ward'){
    accessDoorId='room_'+id;doorType='knob';
    new KeyedKnobDoor(zone,{id:accessDoorId,x,z,yaw:alongX?0:Math.PI/2,width:1.6,title:id+' 病房'});
  }else if(kind==='storage'){
    accessDoorId='storage_'+id;doorType='card';
    new AccessDoor(zone,{id:accessDoorId,x,z,yaw:alongX?0:Math.PI/2,width:1.6,title:'儲藏室',material:zone.gf.materials.doorWood,readerSide:1});
  }else{
    const opening=Doorway.build({scene:zone.zoneGroup,colliders:zone.colliders,x,z,width:1.6,height:2.4,wallHeight:3.2,isAlongX:alongX,isOpen:true,doorMaterial:zone.gf.materials.doorWood});
    opening.name=`RoomDoor_${id}`;
    for(const child of opening.children)if(child.geometry?.parameters.height===2.35){opening.updateWorldMatrix(true,true);zone.colliders.push(new THREE.Box3().setFromObject(child));}
  }

  const outward=side==='north'?[0,-1]:side==='south'?[0,1]:side==='west'?[-1,0]:[1,0];
  const corridor=[x+outward[0]*1.1,1.7,z+outward[1]*1.1];
  const point=kind==='ward'?(alongX?[x,1.7,cz]:[cx,1.7,z]):[x-outward[0]*1.25,1.7,z-outward[1]*1.25];
  const yaw=side==='north'?Math.PI:side==='south'?0:side==='west'?-Math.PI/2:Math.PI/2;
  SignAnchor.buildWallPlaque({scene:zone.zoneGroup,x:x+(alongX?-1.1:outward[0]*.15),y:1.75,z:z+(alongX?outward[1]*.15:-1.1),rotationY:yaw,width:1,height:.34,code:id,title:label.replace(id,'').trim(),subtitle:'',header:''});

  if(kind==='ward'){
    const dx=Math.min(1.4,(x2-x1)*.28),dz=Math.min(2.2,(z2-z1)*.28);
    const spots=[[cx-dx,cz-dz],[cx+dx,cz-dz],[cx-dx,cz+dz],[cx+dx,cz+dz]];
    const letters=['A','B','C','D'],roomOrdinal=Math.max(1,Number(id)%100);
    zone.bedAreas??=[];
    spots.forEach(([bx,bz],index)=>{
      const bedIndex=index+1,bedInRoom=letters[index],bedId=`${id}${bedInRoom}`,wardBedNumber=(roomOrdinal-1)*4+bedIndex;
      const model=asset(zone.zoneGroup,'hospitalBed',[bx,0,bz],[1,1,1]);
      if(model){model.name=`Bed_${bedId}`;model.userData={...model.userData,roomId:id,bedInRoom,bedIndex,bedId,wardBedNumber};}
      CollisionFactory.addBox(zone.colliders,bx,.5,bz,1.15,1,2.15);
      const plaque=mountBedWallPlaque(zone,{rect,bx,bz,roomId:id,bedInRoom});
      zone.bedAreas.push({id:bedId,roomId:id,bedInRoom,bedIndex,wardBedNumber,position:[bx,0,bz],plaque});
    });
  }

  zone.roomAreas.push({id,label,rect,door:[x,1.7,z],point,corridor,protectedArea,kind,accessDoorId,doorType});
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

/** Identical protected staff-station module used by legacy wards. Front faces local -Z. */
export function nursingStation(zone,{x,z,yaw=0,id,rearEntry=false}) {
  const sub={gf:zone.gf,zoneGroup:new THREE.Group(),colliders:[],walkables:[],interactables:[],workstations:[]};
  sub.zoneGroup.name='NursingStation_STANDARD_6x6';sub.zoneGroup.position.set(x,0,z);sub.zoneGroup.rotation.y=yaw;zone.zoneGroup.add(sub.zoneGroup);
  const m=zone.gf.materials;
  solid(sub.zoneGroup,m.wallDark,[-.7,.53,0],[4.5,1.06,.6]);solid(sub.zoneGroup,m.counterTop,[-.7,1.1,0],[4.6,.08,.72]);
  CollisionFactory.addBox(sub.colliders,-.7,1.5,0,4.6,3,.72);
  const glass=m.glass.clone();glass.side=THREE.DoubleSide;glass.transparent=true;glass.opacity=.23;glass.depthWrite=false;
  solid(sub.zoneGroup,glass,[-.7,1.95,0],[4.5,1.6,.035]);
  for(const sx of [-3,1.6,3])solid(sub.zoneGroup,m.doorWood,[sx,1.55,0],[.10,3.1,.14]);
  solid(sub.zoneGroup,m.doorWood,[0,2.92,0],[6.1,.36,.25]);
  zone.gf.buildWall(sub.zoneGroup,sub.colliders,-3,1.6,3,.2,3.2,6);
  zone.gf.buildWall(sub.zoneGroup,sub.colliders,3,1.6,3,.2,3.2,6);
  if(!rearEntry)zone.gf.buildWall(sub.zoneGroup,sub.colliders,0,1.6,6,6.2,3.2,.2);
  workstation(sub,{x:-1.8,z:3.8,yaw:0,id:id+'_A'});workstation(sub,{x:1.8,z:3.8,yaw:0,id:id+'_B'});
  asset(sub.zoneGroup,'storageCabinet',[-1.7,0,5.6],[1,1,1],Math.PI);asset(sub.zoneGroup,'printer',[1.8,.8,3.8],[.7,.7,.7]);
  SignAnchor.buildWallPlaque({scene:sub.zoneGroup,x:0,y:2.88,z:-.15,rotationY:Math.PI,width:1.5,height:.3,code:'',title:'護理站',subtitle:'',header:''});
  sub.zoneGroup.updateWorldMatrix(true,true);
  const matrix=sub.zoneGroup.matrixWorld;
  for(const c of sub.colliders)zone.colliders.push(c.applyMatrix4(matrix));
  for(const item of sub.workstations){const chair=new THREE.Vector3(...item.chair).applyMatrix4(matrix);zone.workstations.push({...item,chair:chair.toArray(),yaw:item.yaw+yaw});}
  const p=new THREE.Vector3(2.3,0,0).applyMatrix4(matrix);
  new AccessDoor(zone,{id:id+'_staff',x:p.x,z:p.z,yaw,width:1.3,title:'護理站工作門',material:m.metal,readerSide:-1});
  zone.station={id,module:'NursingStation_STANDARD_6x6',position:[x,z],yaw};
}

/** V5.2 nursing station: all four sides use a solid lower wall and reinforced upper glass.
 * The south inner iron gate enters the station; the north iron access door opens to the ward and faces x06.
 */
export function nursingStationV5(zone,{x,z=-4.3,id}){
  const m=zone.gf.materials,halfW=4.6,south=0,north=-8.6,west=x-halfW,east=x+halfW,wardExitX=x+4.0;
  const lowerH=1.08,glassH=1.72,glassY=lowerH+glassH/2,thickness=.16;
  const glass=m.glass.clone();glass.side=THREE.DoubleSide;glass.transparent=true;glass.opacity=.24;glass.depthWrite=false;

  const glazedSegment=(axis,at,a,b)=>{
    if(b-a<.05)return;
    const alongX=axis==='x',cx=alongX?(a+b)/2:at,cz=alongX?at:(a+b)/2;
    const sx=alongX?b-a:thickness,sz=alongX?thickness:b-a;
    solid(zone.zoneGroup,m.wall,[cx,lowerH/2,cz],[sx,lowerH,sz]);
    solid(zone.zoneGroup,glass,[cx,glassY,cz],[sx,glassH,sz*.22+.025]);
    solid(zone.zoneGroup,m.metal,[cx,lowerH+.02,cz],[sx+.02,.06,sz+.02]);
    solid(zone.zoneGroup,m.metal,[cx,lowerH+glassH+.05,cz],[sx+.02,.10,sz+.02]);
    CollisionFactory.addBox(zone.colliders,cx,1.42,cz,sx,2.84,sz);
  };

  // South face: leave the 2.4 m inner iron-gate aperture at centre.
  glazedSegment('x',south,west,x-1.2);
  glazedSegment('x',south,x+1.2,east);

  // North face: leave a 1.4 m iron-door aperture aimed at room x06.
  glazedSegment('x',north,west,wardExitX-.7);
  glazedSegment('x',north,wardExitX+.7,east);

  // West/east faces are continuously glazed above a lower protective wall.
  glazedSegment('z',west,north,south);
  glazedSegment('z',east,north,south);

  workstation(zone,{x:x-1.75,z:-3.8,yaw:Math.PI,id:id+'_A'});
  workstation(zone,{x:x+1.75,z:-3.8,yaw:Math.PI,id:id+'_B'});
  asset(zone.zoneGroup,'storageCabinet',[x-3.6,0,-1.2],[1,1,1],Math.PI/2);
  asset(zone.zoneGroup,'printer',[x+1.75,.8,-3.8],[.7,.7,.7]);
  zone.gf.buildCeilingLight(zone.zoneGroup,x,3.15,-4.3,.8,8);

  SignAnchor.buildWallPlaque({scene:zone.zoneGroup,x:x-2.0,y:2.64,z:north+.10,rotationY:0,width:1.7,height:.32,code:'',title:'護理站',subtitle:'',header:''});

  // Station -> ward activity hall uses a normally-closed metal access door.
  new AccessDoor(zone,{id:id+'_ward',x:wardExitX,z:north,width:1.4,title:'護理站病房感應鐵門',material:m.metal,readerSide:1});

  zone.station={
    id,module:'NursingStation_V5_2_GLASS_BOX',position:[x,-4.3],
    bounds:[west,north,east,south],entryDoor:[x,south],wardDoor:[wardExitX,north],
    facesRoom:String(zone.floor*100+6),glazedSides:['south','north','west','east'],
    lowerWallHeight:lowerH,upperGlassHeight:glassH,wardDoorMaterial:'metal'
  };
  return zone.station;
}
