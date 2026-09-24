import * as THREE from 'three';
import { solid, asset, wallClock } from '../../art/ArtDetails.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { PlanWalls, ordinaryRoom, nursingStationV5, workstation } from './PlanArchitecture.js';
import { AccessDoor } from './AccessDoor.js';
import { KeyedKnobDoor } from './KeyedKnobDoor.js';
import { CollisionFactory } from './CollisionFactory.js';
import { SignAnchor } from './SignAnchor.js';

/** September 22 V5 user floorplan. Units are gameplay metres, not a real hospital survey. */
export class WardFloorplan {
  constructor(scene,gf,{campus='first',floor=4}={}){
    Object.assign(this,{scene,gf,campus,floor});this.colliders=[];this.walkables=[];this.interactables=[];this.roomAreas=[];this.bedAreas=[];this.workstations=[];this.clinicalProps=[];this.accessDoors={};this.keyedDoors={};
    this.layoutVersion='USER_PLAN_20260923_IMAGE_V5_2';this.activityHall=null;this.layoutPlan=null;
    this.zoneGroup=new THREE.Group();this.zoneGroup.name=`${campus}_${floor}F_PLAN_V5_2`;
  }
  build(){this.scene.add(this.zoneGroup);const second=this.campus==='second',o=second?72:0,walls=new PlanWalls(this);this.planOrigin=o;
    this.gf.buildFloor(this.zoneGroup,this.walkables,o,0,-10,24,24,this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup,o,3.2,-10,24,24);

    // V5.1: outer gate -> vestibule. Straight through the inner gate enters the nursing station.
    // From the vestibule, move right then turn left/north through the glass bypass into the ward.
    walls.rect(o-12,-22,o+12,2);walls.cut('x',2,o,2.4);
    // Room/storage walls already cover x<=-7 and x>=7 at z=0.
    // Only bridge the gaps to the glass-box station; keep the station's south face glazed.
    walls.line('x',0,o-7,o-4.6);
    walls.line('x',0,o+4.6,o+7);walls.cut('x',0,o+6.0,1.4);

    const room=(n,r,side,d,kind='ward',label)=>ordinaryRoom(this,walls,{id:String(this.floor*100+n),label,rect:[r[0]+o,r[1],r[2]+o,r[3]],side,door:d+(side==='north'||side==='south'?o:0),kind});
    const roomIds=Array.from({length:9},(_,i)=>String(this.floor*100+i+1));

    // V5 perimeter geometry: 401/501 bottom-left -> 403/503 upper-left,
    // 404/504–406/506 across the top, 407/507 upper-right -> 409/509 bottom-right.
    room(1,[-12,-6,-8,0],'east',-3);
    room(2,[-12,-12,-8,-6],'east',-9);
    room(3,[-12,-22,-8,-12],'east',-13);
    room(4,[-8,-22,-3,-16],'south',-5.5);
    room(5,[-3,-22,2,-16],'south',-.5);
    room(6,[2,-22,7,-16],'south',4.5);
    room(7,[7,-22,12,-12],'west',-13);
    room(8,[7,-12,12,-6],'west',-9);
    room(9,[7,-6,12,0],'west',-3);

    // Entrance vestibule storage room on the left, plant bay on the right.
    ordinaryRoom(this,walls,{id:'STORE_ENTRY',label:'儲藏室',rect:[o-12,0,o-7,2],side:'east',door:1,kind:'storage',protectedArea:false});
    const plant=asset(this.zoneGroup,'plant',[o+9.4,0,1],[1.15,1.15,1.15]);
    if(plant){plant.name=`${second?'Second':'First'}WardEntrancePlant`;plant.userData={...plant.userData,fixture:'WARD_ENTRY_PLANT'};}
    CollisionFactory.addBox(this.colliders,o+9.4,.45,1,.9,.9,.9);
    this.entrancePlant=[o+9.4,0,1];

    // Central station: the inner iron gate opens directly into it.
    nursingStationV5(this,{x:o,z:-4.3,id:second?'second_station':'first_station'});

    this.wardDoor=new AccessDoor(this,{id:second?'second_ward':'first_ward',x:o,z:2,width:2.4,title:'感應式鐵門'});
    this.innerWardDoor=new AccessDoor(this,{id:second?'second_ward_inner':'first_ward_inner',x:o,z:0,width:2.4,title:'感應式鐵門2'});
    this.glassBypassDoor=new AccessDoor(this,{id:second?'second_ward_glass':'first_ward_glass',x:o+6.0,z:0,width:1.4,title:'感應玻璃門',material:this.gf.materials.glass,readerSide:1});
    this.wardGateCollider=this.wardDoor.closedBox;this.wardGateClosed=true;this.innerWardGateClosed=true;this.glassBypassClosed=true;

    this.activityHall={id:'ACTIVITY_HALL',label:'病房公共區',bounds:[o-7,-16,o+7,0],center:[o,1.7,-13]};
    this.layoutVersion='USER_PLAN_20260923_IMAGE_V5_2';
    this.layoutPlan={
      rooms:roomIds,
      storage:['STORE_ENTRY'],
      centralStation:true,
      nursingStationFourSideGlass:true,
      nursingStationLowerWallUpperGlass:true,
      patientRoomDoorType:'traditional_knob',
      bedPlaquesWallMounted:true,
      dualGate:true,
      glassBypassDoor:true,
      stationWardDoor:true,
      stationWardDoorFaces:roomIds[5],
      stationWardDoorReaderSide:-1,
      stationWorkstationCount:4,
      stationClinicalProps:true,
      entrancePlant:true,
      bedCapacity:36,
      bedLabels:['A','B','C','D'],
      bed33Room:roomIds[8],
      bed33Id:roomIds[8]+'A',
      allControlledDoorsDefaultClosed:true,
      dutyRoomOutsideWard:true,
      narrowStationStrip:false
    };

    if(!second){
      this.buildDutyRoom();
      if(this.floor===4)this.buildBed33Legend();
    }else{
      this.buildSecondDutyRoom(o);
      if(this.floor===5)this.buildSecondCampusChestLegend(o);
    }

    this.entryPoint=[o,1.7,3.2];this.vestibulePoint=[o,1.7,1];this.hallPoint=[o,1.7,-1.2];

    walls.build();
    // Solid sill spans the outer ward/core seam; no sub-pixel support crack at z=2.
    this.gf.buildFloor(this.zoneGroup,this.walkables,o,.002,2,2.4,.36,this.gf.materials.stainless);
    for(const [x,z] of [[o,1],[o,-12],[o-6,-4],[o+6,-4],[o,-18]]) this.gf.buildCeilingLight(this.zoneGroup,x,3.15,z,.7,8);
    SignAnchor.buildHangingSign({scene:this.zoneGroup,x:o,y:2.7,z:1.6,ceilingY:3.2,rotationY:0,text:second?`${this.floor}F 病房`:'4F 病房'});
    this.zoneGroup.updateWorldMatrix(true,true);return this;
  }
  buildDutyRoom(){
    const w=new PlanWalls(this);w.rect(-14,2,-8,10);w.cut('z',-8,6,1.4);
    this.gf.buildFloor(this.zoneGroup,this.walkables,-11,0,6,6,8,this.gf.materials.floorWood);
    this.gf.buildCeiling(this.zoneGroup,-11,3.2,6,6,8);
    this.dutyDoor=new KeyedKnobDoor(this,{id:'duty_room',x:-8,z:6,yaw:Math.PI/2,width:1.4,title:'醫師值班室',openDirection:1});
    this.dutyDoor.setClosed(true);this.dutyDoorClosed=true;
    SignAnchor.buildWallPlaque({scene:this.zoneGroup,x:-7.885,y:1.78,z:4.95,rotationY:Math.PI/2,width:1.18,height:.34,code:'4F',title:'醫師值班室',subtitle:'ON-CALL ROOM',header:''});
    asset(this.zoneGroup,'hospitalBed',[-12.5,0,7.8],[1.2,.95,.97]);CollisionFactory.addBox(this.colliders,-12.5,.45,7.8,1.4,.9,2.2);
    solid(this.zoneGroup,this.gf.materials.doorWood,[-11.25,.28,8.1],[.5,.56,.5]);
    solid(this.zoneGroup,this.gf.materials.lightWarm,[-11.25,.76,8.1],[.19,.24,.19]);
    workstation(this,{x:-10.0,z:3.1,id:'duty_desk'});
    const coffeeCup=new THREE.Group();coffeeCup.name='DutyRoom_HotCoffee';coffeeCup.position.set(-9.45,.82,3.05);this.zoneGroup.add(coffeeCup);
    const cupBody=new THREE.Mesh(new THREE.CylinderGeometry(.07,.06,.13,18),this.gf.materials.bedSheet);cupBody.position.y=.065;coffeeCup.add(cupBody);
    const coffee=new THREE.Mesh(new THREE.CircleGeometry(.055,18),new THREE.MeshBasicMaterial({color:0x3b2417,side:THREE.DoubleSide}));coffee.rotation.x=-Math.PI/2;coffee.position.y=.132;coffeeCup.add(coffee);
    const handle=new THREE.Mesh(new THREE.TorusGeometry(.045,.012,8,16,Math.PI),this.gf.materials.bedSheet);handle.rotation.y=Math.PI/2;handle.position.set(.07,.075,0);coffeeCup.add(handle);
    const steamMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.16,depthWrite:false});
    for(const [dx,dy] of [[-.018,.19],[.016,.25]]){const s=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),steamMat);s.scale.set(.65,1.8,.65);s.position.set(dx,dy,0);coffeeCup.add(s);}
    this.dutyCabinetAnchor=[-8.8,0,9.3];this.dutyCabinetYaw=Math.PI;
    asset(this.zoneGroup,'storageCabinet',this.dutyCabinetAnchor,[1,1,1],this.dutyCabinetYaw);

    // Enclosed duty-room bathroom with a real knob door, toilet, sink, mirror and dedicated light.
    w.rect(-14,2,-11.5,5.2);w.cut('z',-11.5,4.0,1.1);
    this.gf.buildFloor(this.zoneGroup,this.walkables,-12.75,.006,3.6,2.5,3.2,this.gf.materials.floorTile);
    this.gf.buildCeiling(this.zoneGroup,-12.75,3.2,3.6,2.5,3.2);
    this.dutyBathroomDoor=new KeyedKnobDoor(this,{id:'duty_bathroom',x:-11.5,z:4.0,yaw:Math.PI/2,width:1.1,title:'值班室洗手間',openDirection:1});
    this.dutyBathroomDoor.setClosed(true);
    SignAnchor.buildWallPlaque({scene:this.zoneGroup,x:-11.385,y:1.72,z:4.85,rotationY:Math.PI/2,width:.95,height:.30,code:'',title:'洗手間',subtitle:'',header:''});

    // Toilet with cistern and seat.
    solid(this.zoneGroup,this.gf.materials.bedSheet,[-13.25,.34,4.05],[.58,.68,.78]);
    solid(this.zoneGroup,this.gf.materials.bedSheet,[-13.25,.73,4.36],[.50,.52,.20]);
    solid(this.zoneGroup,this.gf.materials.stainless,[-13.25,.74,4.23],[.34,.035,.32]);

    // Compact sink/vanity against the south wall.
    solid(this.zoneGroup,this.gf.materials.wall,[-12.35,.42,2.55],[.78,.78,.46]);
    solid(this.zoneGroup,this.gf.materials.stainless,[-12.35,.84,2.55],[.84,.08,.50]);
    solid(this.zoneGroup,this.gf.materials.bedSheet,[-12.35,.88,2.55],[.48,.10,.30]);
    solid(this.zoneGroup,this.gf.materials.metal,[-12.35,1.05,2.48],[.05,.28,.05]);

    // Wall-mounted mirror, towel rail and floor drain.
    solid(this.zoneGroup,this.gf.materials.glass,[-12.35,1.65,2.20],[.78,.82,.025]);
    solid(this.zoneGroup,this.gf.materials.metal,[-13.35,1.20,2.35],[.48,.05,.05]);
    solid(this.zoneGroup,this.gf.materials.metal,[-12.8,.015,4.65],[.22,.03,.22]);

    // Refined tile wainscot and framed mirror; geometry stays inside the existing bathroom bounds.
    solid(this.zoneGroup,this.gf.materials.bedSheet,[-13.88,1.02,3.62],[.025,1.98,2.90]);
    solid(this.zoneGroup,this.gf.materials.bedSheet,[-12.75,1.02,2.12],[2.20,1.98,.025]);
    solid(this.zoneGroup,this.gf.materials.bedSheet,[-12.75,1.02,5.08],[2.20,1.98,.025]);
    for(const yy of [.52,1.02,1.52])solid(this.zoneGroup,this.gf.materials.wallBumper,[-13.865,yy,3.62],[.012,.018,2.86],.001);
    solid(this.zoneGroup,this.gf.materials.metal,[-12.35,2.08,2.185],[.86,.035,.04]);
    solid(this.zoneGroup,this.gf.materials.metal,[-12.35,1.22,2.185],[.86,.035,.04]);
    solid(this.zoneGroup,this.gf.materials.metal,[-12.79,1.65,2.185],[.035,.86,.04]);
    solid(this.zoneGroup,this.gf.materials.metal,[-11.91,1.65,2.185],[.035,.86,.04]);
    solid(this.zoneGroup,this.gf.materials.bedSheet,[-11.93,1.24,2.18],[.18,.28,.12]);
    solid(this.zoneGroup,this.gf.materials.metal,[-13.86,.95,3.28],[.06,.08,.42]);
    const paper=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.28,20),this.gf.materials.bedSheet);
    paper.rotation.x=Math.PI/2;paper.position.set(-13.80,.95,3.28);this.zoneGroup.add(paper);
    const bin=new THREE.Mesh(new THREE.CylinderGeometry(.15,.18,.42,20),this.gf.materials.stainless);
    bin.position.set(-13.20,.21,2.78);this.zoneGroup.add(bin);
    solid(this.zoneGroup,this.gf.materials.metal,[-13.25,.88,4.38],[.12,.06,.03]);
    solid(this.zoneGroup,this.gf.materials.wallDark,[-13.20,2.63,2.16],[.52,.28,.035]);
    for(let i=0;i<5;i++)solid(this.zoneGroup,this.gf.materials.stainless,[-13.38+i*.09,2.63,2.135],[.015,.20,.01],.001);
    solid(this.zoneGroup,this.gf.materials.wallBumper,[-12.55,.018,3.55],[.90,.025,.58]);
    this.gf.buildCeilingLight(this.zoneGroup,-12.75,3.15,3.6,.48,5,0xfff2dc);

    this.dutyBathroom={
      door:[-11.5,1.7,4.0],bounds:[-14,2,-11.5,5.2],
      fixtures:['toilet','sink','mirror','towel_rail','floor_drain'],
      details:['tile_wainscot','mirror_frame','soap_dispenser','toilet_paper','waste_bin','flush_button','exhaust_grille','bath_mat'],
      visualRefinement:'V5_2_DUTY_BATHROOM_REFINEMENT'
    };
    w.build();this.gf.buildCeilingLight(this.zoneGroup,-11,3.15,6,.7,7,0xffebce);
    wallClock(this.zoneGroup,this.gf.materials,-10,2.1,2.15);
    this.dutyRoom={door:[-8,1.7,6],inside:[-9.5,1.7,6],outside:[-6.5,1.7,6],bounds:[-14,2,-8,10]};
    this.interactables.push(
      {type:'p1_action',action:'NURSE_REPORT',label:'向護理站報到',position:new THREE.Vector3(0,1.4,-4.3),radius:1.8},
      {type:'p1_action',action:'DUTY_ROOM_PREP',label:'整理值班室',position:new THREE.Vector3(-10.0,1.2,6.0),radius:1.8},
      {type:'p1_action',action:'WARD_ROUND',label:'完成晚間巡房',position:new THREE.Vector3(0,1.4,-12.0),radius:2.0},
      {type:'p1_action',action:'INSOMNIA_403',label:'評估 403 睡眠問題',position:new THREE.Vector3(-6.4,1.2,-17.0),radius:1.8},
      {type:'p1_action',action:'NORMAL_EVENT',label:'處理一般病房事件',position:new THREE.Vector3(5.8,1.2,-9.0),radius:1.8},
      {type:'p1_action',action:'REST',label:'短暫休息',position:new THREE.Vector3(-12.5,1.0,7.8),radius:1.8},
      {type:'p1_action',action:'END_SHIFT',label:'回值班室休息',position:new THREE.Vector3(-10.0,1.1,3.1),radius:1.8}
    );
  }
  buildBed33Legend(){
    const m=this.gf.materials;

    // Legend 01 clue board: a single old slot claims bed 33 = 409A.
    const boardCanvas=document.createElement('canvas');boardCanvas.width=760;boardCanvas.height=520;
    const ctx=boardCanvas.getContext('2d');
    ctx.fillStyle='#e9ece7';ctx.fillRect(0,0,760,520);ctx.fillStyle='#435b4f';ctx.fillRect(0,0,760,62);
    ctx.fillStyle='#fff';ctx.font='bold 28px sans-serif';ctx.fillText('4F 晚間床位板',24,42);
    ctx.fillStyle='#34443b';ctx.font='22px monospace';
    ['29  408A','30  408B','31  408C','32  408D'].forEach((t,i)=>ctx.fillText(t,52,122+i*62));
    ctx.fillStyle='#8a332b';ctx.font='bold 25px monospace';ctx.fillText('33  409A',420,308);
    ctx.font='16px sans-serif';ctx.fillStyle='#777';ctx.fillText('舊卡片／未列入現行床位統計',420,344);
    const boardTex=new THREE.CanvasTexture(boardCanvas);boardTex.colorSpace=THREE.SRGBColorSpace;
    const board=new THREE.Mesh(new THREE.PlaneGeometry(1.55,1.05),new THREE.MeshStandardMaterial({map:boardTex,roughness:.92}));
    board.position.set(-4.47,1.62,-4.4);board.rotation.y=Math.PI/2;
    board.name='Bed33_WardBoard';
    board.userData={
      interactable:true,id:'BED33_BOARD',type:'bed33_board',label:'查看 4F 晚間床位板',
      documentTitle:'4F 晚間床位板',
      pages:['現行床位表列至 32 床後，右側卻夾著一張褪色舊卡：\n\n33　409A\n\n旁註：「未列入現行床位統計」。']
    };
    this.zoneGroup.add(board);this.interactables.push(board);

    // Printed HIS discrepancy sits physically on workstation B instead of floating in open space.
    const stationDeskTopY=.82;
    const hisSheet=solid(this.zoneGroup,m.lightWarm,[-1.28,stationDeskTopY+.009,-2.16],[.38,.018,.28]);
    hisSheet.rotation.y=-.12;hisSheet.name='Bed33_HIS409Sheet';
    hisSheet.userData={
      interactable:true,id:'BED33_HIS_409',type:'bed33_his_status',label:'查看 409 系統狀態列印',
      documentTitle:'HIS 房室狀態查詢',
      pages:['房號：409\n狀態：整修封閉\n可用床數：0\n現行住院床統計：不計入\n\n然而護理站舊卡卻仍列著「33／409A」。']
    };
    this.interactables.push(hisSheet);

    // Temporary assignment form is placed on workstation A; it must never float beside the station island.
    const assignment=solid(this.zoneGroup,m.lightWarm,[-3.22,stationDeskTopY+.009,-2.18],[.40,.018,.30]);
    assignment.rotation.y=.08;assignment.name='Bed33_AssignmentForm';
    assignment.userData={interactable:true,id:'BED33_ASSIGNMENT',type:'bed33_assignment',label:'查看臨時床位分配單'};
    this.interactables.push(assignment);

    // 409 sealed-room presentation. The existing knob door remains physically closed;
    // warning tape is render-only and the interaction is intercepted by main.js.
    for(const y of [1.02,1.42]){
      const tape=solid(this.zoneGroup,m.wallBumper,[6.88,y,-3.0],[.025,.09,1.45]);
      tape.rotation.x=(y>1.2?.16:-.13);tape.name='Bed33_409_WarningTape';
    }
    const sealedHit=new THREE.Mesh(new THREE.BoxGeometry(.55,2.1,1.75),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    sealedHit.position.set(6.72,1.18,-3.0);
    sealedHit.userData={
      interactable:true,id:'BED33_409_SEALED',type:'bed33_409_sealed',label:'查看 409 整修封條',
      documentTitle:'409 病房',
      pages:['門把纏著黃色封條：「院區整修，暫停使用」。\n\n透過門上視窗只能看見一張鋪得過分平整的空病床。']
    };
    this.zoneGroup.add(sealedHit);this.interactables.push(sealedHit);

    this.bed33Legend={
      id:'LEGEND_BED33',
      bedId:'409A',
      wardBedNumber:33,
      boardId:'BED33_BOARD',
      hisStatusId:'BED33_HIS_409',
      sealedDoorId:'BED33_409_SEALED',
      assignmentId:'BED33_ASSIGNMENT',
      checkpoint:'CP_EXIT_403'
    };
  }

  buildSecondDutyRoom(o){
    const w=new PlanWalls(this);w.rect(o+8,2,o+14,10);w.cut('z',o+8,6,1.4);
    this.gf.buildFloor(this.zoneGroup,this.walkables,o+11,0,6,6,8,this.gf.materials.floorWood);
    this.gf.buildCeiling(this.zoneGroup,o+11,3.2,6,6,8);
    workstation(this,{x:o+11,z:3.5,id:'second_duty_desk'});
    const door=new AccessDoor(this,{id:'second_duty_room',x:o+8,z:6,yaw:Math.PI/2,width:1.4,title:'值班室'});door.setClosed(true);
    asset(this.zoneGroup,'hospitalBed',[o+12.3,0,7.7],[1.1,.95,.97]);CollisionFactory.addBox(this.colliders,o+12.3,.45,7.7,1.3,.9,2.1);
    asset(this.zoneGroup,'storageCabinet',[o+9.4,0,8.7],[1,1,1],Math.PI);
    w.build();this.gf.buildCeilingLight(this.zoneGroup,o+11,3.15,6,.75,7);
    this.roomAreas.push({id:'SECOND_DUTY',label:'值班室',point:[o+9.5,1.7,6],door:[o+8,1.7,6],corridor:[o+6.5,1.7,6],protectedArea:false,kind:'duty_room',accessDoorId:'second_duty_room'});
  }
  buildSecondCampusChestLegend(o){
    const m=this.gf.materials;
    const bx=o,bz=-13.0;
    const bed=asset(this.zoneGroup,'hospitalBed',[bx,0,bz],[1,1,1],Math.PI/2);
    if(bed)bed.name='SecondCampus_ExtraChestPainBed';
    CollisionFactory.addBox(this.colliders,bx,.45,bz,2.15,.9,1.15);

    const cardCanvas=document.createElement('canvas');cardCanvas.width=620;cardCanvas.height=360;
    const ctx=cardCanvas.getContext('2d');ctx.fillStyle='#f2eee3';ctx.fillRect(0,0,620,360);
    ctx.fillStyle='#40584c';ctx.fillRect(0,0,620,60);ctx.fillStyle='#fff';ctx.font='bold 28px sans-serif';ctx.fillText('第二院區｜臨時留置床',24,40);
    ctx.fillStyle='#2f3934';ctx.font='24px sans-serif';ctx.fillText('主訴：胸痛',34,118);ctx.fillText('姓名：查無正式住院資料',34,170);
    ctx.fillStyle='#8b2f29';ctx.font='bold 24px monospace';ctx.fillText('SOURCE: 00:33 / LEGACY',34,230);
    ctx.font='18px sans-serif';ctx.fillStyle='#6b6e69';ctx.fillText('護理交班：李醫師已評估？',34,286);
    const tex=new THREE.CanvasTexture(cardCanvas);tex.colorSpace=THREE.SRGBColorSpace;
    const card=new THREE.Mesh(new THREE.PlaneGeometry(1.05,.62),new THREE.MeshBasicMaterial({map:tex}));
    card.position.set(o+1.25,1.45,bz+.35);card.rotation.y=-Math.PI/2;this.zoneGroup.add(card);

    const patientHit=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.6,1.5),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    patientHit.position.set(bx,1.0,bz);
    patientHit.userData={interactable:true,id:'SECOND_CHEST_PATIENT',type:'second_chest_patient',label:'評估多出來的胸痛病人'};
    this.zoneGroup.add(patientHit);this.interactables.push(patientHit);

    // The transfer form sits on the second-campus nursing-station workstation, not in mid-air.
    const form=solid(this.zoneGroup,m.lightWarm,[o-1.28,.829,-2.18],[.42,.018,.30]);
    form.name='SecondCampus_ChestTransferForm';
    form.userData={interactable:true,id:'SECOND_CHEST_TRANSFER',type:'second_chest_transfer',label:'查看胸痛病人轉院單'};
    this.interactables.push(form);

    this.secondCampusLegend={id:'LEGEND_CHEST_PAIN',patient:'SECOND_CHEST_PATIENT',form:'SECOND_CHEST_TRANSFER'};
  }

  setWardGateClosed(closed){this.wardDoor.setClosed(closed);this.wardGateClosed=closed;}
  setInnerWardGateClosed(closed){if(this.innerWardDoor)this.innerWardDoor.setClosed(closed);this.innerWardGateClosed=closed;}
  setGlassBypassClosed(closed){if(this.glassBypassDoor)this.glassBypassDoor.setClosed(closed);this.glassBypassClosed=closed;}
  toggleWardGate(p){const ok=this.wardDoor.toggle(p);this.wardGateClosed=this.wardDoor.closed;return ok;}
  setDutyDoorClosed(closed){if(this.dutyDoor)this.dutyDoor.setClosed(closed);this.dutyDoorClosed=closed;}
  toggleDutyDoor(p){if(!this.dutyDoor)return false;const ok=this.dutyDoor.toggle(p);this.dutyDoorClosed=this.dutyDoor.closed;return ok;}
  cleanup(){this.scene.remove(this.zoneGroup);disposeZoneArt(this.zoneGroup);this.colliders=[];this.walkables=[];this.interactables=[];this.roomAreas=[];this.bedAreas=[];this.workstations=[];this.accessDoors={};this.keyedDoors={};}
}
