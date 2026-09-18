import {Doorway} from './Doorway.js';
import {SignAnchor} from './SignAnchor.js';
import {CollisionFactory} from './CollisionFactory.js';
import {asset} from '../../art/ArtDetails.js';

/** A sealed clinical wing with a west entry and paired rooms off one corridor. */
export function buildRoomWing(zone,{x,z,rooms,height=3.2}) {
  const {gf,zoneGroup:group,colliders,walkables}=zone;
  const width=6,depth=5.6,half=1.8,length=Math.ceil(rooms.length/2)*width;
  const wall=(cx,cz,w,d)=>gf.buildWall(group,colliders,cx,height/2,cz,w,height,d);
  gf.buildFloor(group,walkables,x+length/2,0,z,length+.04,half*2+.04,gf.materials.floor);
  gf.buildCeiling(group,x+length/2,height,z,length,half*2);
  wall(x+length,z,.3,half*2);
  for(const side of [-1,1])wall(x,z+side*(half+1.2)/2,.3,half-1.2);
  Doorway.build({scene:group,colliders,x,z,width:2.4,height:2.4,wallHeight:height,isAlongX:false,isOpen:true,frameMaterial:gf.materials.metal});
  const areas=[];
  for(let index=0;index<Math.ceil(rooms.length/2)*2;index++) {
    const room=rooms[index],side=index%2===0?-1:1,cx=x+(Math.floor(index/2)+.5)*width,edge=z+side*half;
    if(!room){wall(cx,edge,width,.3);continue;}
    const cz=edge+side*depth/2;
    gf.buildFloor(group,walkables,cx,0,cz,width+.04,depth+.04,gf.materials.floor);
    gf.buildCeiling(group,cx,height,cz,width,depth);
    wall(cx,edge+side*depth,width,.3);
    wall(cx-width/2,cz,.3,depth);wall(cx+width/2,cz,.3,depth);
    for(const sign of [-1,1])wall(cx+sign*(width/4+.35),edge,width/2-.7,.3);
    Doorway.build({scene:group,colliders,x:cx,z:edge,width:1.4,height:2.4,wallHeight:height,isAlongX:true,isOpen:true,doorMaterial:gf.materials.doorWood});
    SignAnchor.buildWallPlaque({scene:group,x:cx-1.35,y:1.9,z:edge-side*.18,rotationY:side===-1?0:Math.PI,code:room.code,title:room.label,subtitle:'',header:'院內功能區'});
    const furnitureZ=edge+side*(depth-1.1),furnitureX=cx+1.25;
    const bed=room.kind==='ward'||room.kind==='treatment';
    asset(group,bed?'hospitalBed':'workDesk',[furnitureX,0,furnitureZ],[1,1,1]);
    CollisionFactory.addBox(colliders,furnitureX,.55,furnitureZ,bed?1.15:1.5,1.1,bed?2.15:.8);
    gf.buildCeilingLight(group,cx,height-.05,cz);
    areas.push({id:room.code,label:room.label,point:[cx,1.7,cz],door:[cx,1.7,edge],corridor:[cx,1.7,z]});
  }
  for(let cx=x+3;cx<x+length;cx+=6)gf.buildCeilingLight(group,cx,height-.05,z);
  zone.roomAreas=[...(zone.roomAreas||[]),...areas];
  return {entry:[x,1.7,z],end:[x+length,1.7,z],areas};
}
