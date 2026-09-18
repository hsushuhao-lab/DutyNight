import {DEBUG_SPAWN_POINTS} from './DebugSpawnPoints.js';
export const FIRST_FLOORS=[1,2,3,4,8];
export const SECOND_FLOORS=[1,2,3,4,5,6,7,8];
export const WORLD_SPAWNS={...DEBUG_SPAWN_POINTS};
const add=(id,zoneId,pos,yaw,name)=>{WORLD_SPAWNS[id]={zoneId,pos,yaw,name,milestone:'BASELINE'};};
for(const f of FIRST_FLOORS)add(`first_${f}f_lift`,`first_campus_${f}f`,[f===1?-11.5:-9.5,1.7,0],-Math.PI/2,`第一院區 ${f}F 電梯`);
for(const f of SECOND_FLOORS)add(`second_${f}f_lift`,`second_campus_${f}f`,f===1?[74,1.7,.2]:f===2?[78,1.7,-1.8]:[77.5,1.7,-1.3],f===1?0:f===2?Math.PI/2:Math.PI,`第二院區 ${f}F 電梯`);
add('first_bridge_return','first_campus_8f',[-1.6,1.7,0],Math.PI/2,'返回第一院區 8F');
add('bridge_from_first','skybridge',[1.6,1.7,0],-Math.PI/2,'天橋第一院區端');
add('bridge_from_second','skybridge',[58.4,1.7,0],Math.PI/2,'天橋第二院區端');
add('second_bridge_return','second_campus_2f',[61.6,1.7,0],-Math.PI/2,'第二院區 2F 連通口');
add('second_outdoor_return','second_campus_1f',[72,1.55,-15.5],Math.PI,'返回第二院區 1F');
add('hill_from_second','hillside_route',[70.3,1.27,-18.5],Math.PI/2,'山路第二院區端');
add('hill_from_first','hillside_route',[11.5,1.27,-34.55],-Math.PI/2,'山路第一院區端');
add('first_er_return','first_campus_2f',[28.2,1.7,0],Math.PI/2,'第一院區 2F 山側入口');
add('pond_from_hill','ecology_pond',[53,1.12,-36.8],0,'生態池步道入口');
add('hill_from_pond','hillside_route',[48.8,1.195,-33.5],.67,'返回山路叉路');
add('first_3f_stairs','first_campus_3f',[19,1.7,4.6],0,'3F 樓梯前室');
add('first_4f_stairs','first_campus_4f',[37,1.7,4.6],0,'4F 樓梯前室');
export const ROUTE_PORTALS=[
 {id:'first_to_bridge',from:'first_campus_8f',spawn:'bridge_from_first',bounds:[[-.75,-1,-1],[.2,3,1]]},
 {id:'bridge_to_first',from:'skybridge',spawn:'first_bridge_return',bounds:[[-.2,-1,-1],[.75,3,1]]},
 {id:'bridge_to_second',from:'skybridge',spawn:'second_bridge_return',bounds:[[59.2,-1,-1],[60.2,3,1]]},
 {id:'second_to_bridge',from:'second_campus_2f',spawn:'bridge_from_second',bounds:[[59.8,-1,-1],[60.8,3,1]]},
 {id:'second_to_hill',from:'second_campus_1f',spawn:'hill_from_second',bounds:[[70,-1,-17],[74,3,-16.3]]},
 {id:'hill_to_second',from:'hillside_route',spawn:'second_outdoor_return',bounds:[[71,-1,-19.1],[73,3,-17]]},
 {id:'er_to_hill',from:'first_campus_2f',spawn:'hill_from_first',bounds:[[29,-1,-2],[30.3,3,2]]},
 {id:'hill_to_er',from:'hillside_route',spawn:'first_er_return',bounds:[[9,-1,-36],[10.8,3,-34.2]]},
 {id:'hill_to_pond',from:'hillside_route',spawn:'pond_from_hill',bounds:[[49.3,-1,-35.8],[51,3,-34.3]]},
 {id:'pond_to_hill',from:'ecology_pond',spawn:'hill_from_pond',bounds:[[52,-1,-35.95],[54,3,-34.8]]},
];
export const LIFT_PANELS={
 first_campus_1f:{position:[-13.41,1.35,.8],yaw:Math.PI/2},
 first_campus_2f:{position:[-11.51,1.35,.8],yaw:Math.PI/2},
 first_campus_4f:{position:[-11.51,1.35,.8],yaw:Math.PI/2},
 first_campus_8f:{position:[-11.51,1.35,.8],yaw:Math.PI/2},
 second_campus_1f:{position:[74.75,1.35,1.57],yaw:Math.PI},
 second_campus_2f:{position:[79.57,1.35,-1.2],yaw:-Math.PI/2},
 second_campus_std:{position:[76.75,1.35,-2.57],yaw:0},
};
for(const f of [3,4,5,6,7,8])LIFT_PANELS[`second_campus_${f}f`]=LIFT_PANELS.second_campus_std;
