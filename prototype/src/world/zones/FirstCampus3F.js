// FirstCampus3F.js - Milestone M0: First Campus 3F Doctor Administrative Area & Room 316
import * as THREE from 'three';
import { gameState } from '../../core/GameState.js';
import { buildRoomWing } from '../shared/RoomWing.js';
import { Level3FBlockout } from '../Level3FBlockout.js';
import { disposeZoneArt } from '../../art/ArtResources.js';
import { applyFirstFloorArt } from '../../art/FirstFloorArt.js';
import { applyAct1CollisionHotfix } from '../CollisionHotfix.js';
import { AccessDoor } from '../shared/AccessDoor.js';
import { asset, solid } from '../../art/ArtDetails.js';

export class FirstCampus3F {
  constructor(scene, geometryFactory) {
    this.scene = scene;
    this.geometryFactory = geometryFactory;
    this.gf = geometryFactory;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
    this.zoneGroup = new THREE.Group();
    this.zoneGroup.name = 'FirstCampus3F_Zone';
    this.levelInstance = null;
  }

  build() {
    this.scene.add(this.zoneGroup);
    // Pass zoneGroup so all meshes, lights, signs are children of zoneGroup, not global scene
    this.levelInstance = new Level3FBlockout(this.zoneGroup);
    applyAct1CollisionHotfix(this.levelInstance);
    applyFirstFloorArt(this.levelInstance);

    this.colliders = this.levelInstance.colliders;
    this.walkables = this.levelInstance.walkables;
    this.interactables = this.levelInstance.interactables;

    buildRoomWing(this,{x:16,z:0,rooms:[
      {code:'3F_ARCHIVE',label:'文件保管室',kind:'office'},
    ]});
    this.accessDoors={};
    this.archiveDoor=new AccessDoor(this,{id:'3F_ARCHIVE_DOOR',x:16,z:0,yaw:Math.PI/2,width:2.4,title:'文件保管室',material:this.gf.materials.doorWood,readerSide:-1});
    this.archiveDoor.setClosed(true);
    const shelfMat=this.gf.materials.floorWood,folderMat=this.gf.materials.doorWood;
    const buildShelf=(id,x,z,yaw=0)=>{
      const g=new THREE.Group();g.name=`ArchiveShelf_${id}`;g.position.set(x,0,z);g.rotation.y=yaw;this.zoneGroup.add(g);
      solid(g,shelfMat,[-.72,1.12,0],[.10,2.24,.38]);solid(g,shelfMat,[.72,1.12,0],[.10,2.24,.38]);
      solid(g,shelfMat,[0,1.12,-.17],[1.54,2.24,.05]);
      for(const y of [.12,.58,1.04,1.50,1.96])solid(g,shelfMat,[0,y,0],[1.54,.08,.42]);
      for(let row=0;row<4;row++)for(let col=0;col<7;col++){
        const mat=(row+col)%3===0?this.gf.materials.wallBumper:(row+col)%3===1?folderMat:this.gf.materials.wallDark;
        solid(g,mat,[-.55+col*.18,.34+row*.46,.07],[.14,.34,.22]);
      }
      g.updateWorldMatrix(true,true);this.colliders.push(new THREE.Box3().setFromObject(g));return g;
    };
    const shelves=[
      buildShelf('W1',16.38,-3.05,Math.PI/2),
      buildShelf('W2',16.38,-5.05,Math.PI/2),
      buildShelf('E1',21.62,-3.05,-Math.PI/2),
      buildShelf('E2',21.62,-5.05,-Math.PI/2)
    ];

    const documents=[
      {
        id:'ARCHIVE_NIGHT_RECORD',shelf:shelves[0],x:.26,y:1.66,
        title:'夜間值勤異常紀錄｜2001–2004',
        pages:[
          '【院內機密】夜間值勤異常紀錄彙整。\n\n多起紀錄提到凌晨 02:10–02:30 間，舊行政區電話曾收到沒有分機來源的內線。工程單位檢查後未發現線路故障。',
          '值勤紀錄 2002/11：\n「查房回程時，3F 安全梯門已自行關閉。門禁紀錄沒有刷卡資料。」\n\n值班人員於備註欄手寫：不要單獨確認第二次聲響。',
          '2004 年後同類紀錄停止列入正式交班，改以「設備異常」歸檔。\n\n頁尾蓋章：資料保密・禁止外洩。'
        ]
      },
      {
        id:'ARCHIVE_BUILDING_NOTE',shelf:shelves[1],x:-.18,y:1.20,
        title:'舊院區工程圖附註｜缺頁',
        pages:[
          '【本院專屬】工程圖冊索引顯示本冊原有 48 頁，目前僅存 41 頁。缺頁範圍集中於舊三樓與地下連通空間。',
          '手寫附註：\n「實際牆體位置與竣工圖不符。西側封閉空間深度多出約 2.4 公尺。」\n\n旁註日期已模糊。',
          '後續勘查申請被劃線取消。取消原因欄僅寫：\n「維持現況，不再開啟。」'
        ]
      },
      {
        id:'ARCHIVE_PHOTO_ENVELOPE',shelf:shelves[2],x:.08,y:.74,
        title:'未編目照片袋｜夜間巡視',
        pages:[
          '牛皮紙袋外側只寫著「3F／夜間」。沒有拍攝者姓名。',
          '第一張照片：空的電梯前廳，時鐘顯示 02:17。遠端安全梯門似乎半開。\n\n照片背面寫著：「門當時是鎖著的。」',
          '最後一張照片只拍到文件保管室門牌。照片邊緣有一行鉛筆字：\n「第一次看到它時，這裡沒有這個房間。」'
        ]
      }
    ];
    for(const d of documents){
      const folder=solid(d.shelf,this.gf.materials.lightWarm,[d.x,d.y,.25],[.28,.36,.05]);
      folder.name=d.id;folder.userData={interactable:true,id:d.id,type:'archive_document',label:`翻閱：${d.title}`,documentTitle:d.title,pages:d.pages};
      this.interactables.push(folder);
    }

    const lore=document.createElement('canvas');lore.width=760;lore.height=300;const ctx=lore.getContext('2d');
    ctx.fillStyle='#d8d0bc';ctx.fillRect(0,0,760,300);ctx.fillStyle='#4a2f28';ctx.font='bold 34px sans-serif';ctx.fillText('文件保管室｜封存索引',28,50);
    ctx.font='23px sans-serif';ctx.fillStyle='#302b27';['資料保密・禁止外洩','工程紀錄／夜間紀錄／照片封存','調閱後請依原位置歸檔'].forEach((t,i)=>ctx.fillText('• '+t,42,112+i*55));
    const tex=new THREE.CanvasTexture(lore);tex.colorSpace=THREE.SRGBColorSpace;
    const board=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.95),new THREE.MeshStandardMaterial({map:tex,roughness:.95}));board.position.set(21.79,1.55,-6.25);board.rotation.y=-Math.PI/2;this.zoneGroup.add(board);
    this.secretArchive={id:'3F_ARCHIVE',doorId:'3F_ARCHIVE_DOOR',requires:'STAFF_ACCESS_CARD',bookshelfCount:4,documentIds:documents.map(d=>d.id),lore:['night_anomaly_records','missing_floorplans','unlabelled_photos']};

    // References for gameplay state
    this.keyMesh = this.levelInstance.keyMesh;
    this.workstationMesh = this.levelInstance.workstationMesh;
    this.dutyLogMesh = this.levelInstance.dutyLogMesh;
    this.elevatorLight = this.levelInstance.elevatorLight;
    const keyAvailable = !gameState.isTaskComplete('KEY_PICKUP');
    this.keyMesh.visible = keyAvailable;
    this.keyMesh.userData.targetGroup.visible = keyAvailable;
    this.keyMesh.userData.interactable = keyAvailable;
    this.updateElevatorLight(gameState.areRequiredTasksComplete());

    return this;
  }

  updateElevatorLight(isReady) {
    if (this.levelInstance) {
      this.levelInstance.updateElevatorLight(isReady);
    }
  }

  cleanup() {
    if (this.zoneGroup) {
      this.scene.remove(this.zoneGroup);
      disposeZoneArt(this.zoneGroup);
    }
    this.levelInstance = null;
    this.colliders = [];
    this.walkables = [];
    this.interactables = [];
  }
}
