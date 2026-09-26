// NarrativeV22.js — Design Freeze: The Repeated Error
export const PERSONNEL_V22=Object.freeze({
  doctors:Object.freeze([
    Object.freeze({id:'ZHANG_SHOUHENG',name:'張守恆',employeeId:'MED-870409',role:'第一線住院醫師',motif:'黑咖啡／拒絕 409-A／確認病人身分'}),
    Object.freeze({id:'LI_CHENGLI',name:'李承禮',employeeId:'MED-820316',role:'夜間總醫師',motif:'制度／封鎖／覆寫'}),
    Object.freeze({id:'ZHOU_QIWEN',name:'周啟文',employeeId:'MED-880217',role:'第二線住院醫師',motif:'關心／遲疑／未送達的警告'}),
    Object.freeze({id:'CHEN_BOXUN',name:'陳柏勳',employeeId:'MED-890605',role:'第二院區支援醫師',motif:'流程優先／跨院區轉送'})
  ]),
  witnesses:Object.freeze([
    Object.freeze({id:'LIN_WANZHEN',name:'林婉真',employeeId:'NUR-900033',role:'夜班護理師'}),
    Object.freeze({id:'WANG_SHIRONG',name:'王世榮',employeeId:'SEC-760117',role:'夜間警衛／門禁管理'}),
    Object.freeze({id:'XIE_YUQIN',name:'謝玉琴',employeeId:'ADM-851104',role:'行政／文史檔案'})
  ]),
  engineer:Object.freeze({id:'LIU_ZHIYUAN',name:'劉志遠',employeeId:'ENG-860214',role:'工務機電技師'})
});

export const IDENTITY_CANDIDATES=Object.freeze([
  Object.freeze({id:'LI_CHENGLI',name:'李承禮',employeeId:'MED-820316',role:'總醫師',contradiction:'CONTRADICTION｜02:17 李承禮位於 1F B-Panel；你的記憶卻包含 409-A 四點約束與第一線臨床決策。'}),
  Object.freeze({id:'ZHOU_QIWEN',name:'周啟文',employeeId:'MED-880217',role:'第二線住院醫師',contradiction:'CONTRADICTION｜00:50 後周啟文前往警衛台爭取門禁；你的記憶則留在 408C、急診與 409-A 拒簽。'}),
  Object.freeze({id:'CHEN_BOXUN',name:'陳柏勳',employeeId:'MED-890605',role:'第二院區支援醫師',contradiction:'CONTRADICTION｜陳柏勳屬第二院區支援編制，沒有第一院區 409-A 拒簽與 316 第一線交班軌跡。'}),
  Object.freeze({id:'ZHANG_SHOUHENG',name:'張守恆',employeeId:'MED-870409',role:'第一線住院醫師',contradiction:null})
]);

const F=(stamp,title,caption,narration,people=[],scene='corridor')=>Object.freeze({stamp,title,caption,narration,people,scene});
export const MEMORY_SEQUENCES=Object.freeze({
  M1_ADMIN_DUTY_PHOTO:Object.freeze({
    id:'M1_ADMIN_DUTY_PHOTO',mode:'ALBUM',title:'照片 02｜值班表前的合照',source:'3F 行政辦公室｜泛黃接觸表',
    frames:Object.freeze([
      F('1998.10.12 16:36','值班表前','謝玉琴站在輪值板前整理紙本名冊。','名冊上仍可看見四位醫師的欄位。',['謝玉琴'],'office'),
      F('16:39','紅筆','李承禮拿著紅筆修改第一線欄位。','這不是漏印；有人正在改動原始資料。',['李承禮','謝玉琴'],'office'),
      F('16:41','等待','周啟文站在旁邊低頭看錶。','他的視線沒有看鏡頭。',['周啟文'],'office'),
      F('16:42','黑咖啡','一名年輕白袍醫師背對鏡頭，手裡拿著黑咖啡。','杯子和今晚值班室那一只很像。',['未知醫師'],'office'),
      F('沖洗後補片','被刮掉的人','同一個位置只剩被刀片與立可帶破壞的輪廓。','不是沒被拍到；是被人故意從照片上刪掉。',['被刪除的醫師'],'office')
    ])
  }),
  M1_ARCHIVE_6F_ALBUM:Object.freeze({
    id:'M1_ARCHIVE_6F_ALBUM',mode:'ALBUM',title:'相簿 03｜臨床技能教學室啟用紀實',source:'3F 文史檔案室｜未編目相簿',
    frames:Object.freeze([
      F('1997.06','門牌','照片清楚拍到「6F 臨床技能教學室」。','現在的樓層圖沒有六樓。',[],'skills'),
      F('啟用日','安妮','全新的 CPR 訓練人偶躺在教學床上。','塑膠臉、人工氣道、關節接縫都清楚可見。',['Annie'],'skills'),
      F('教學紀錄','胸外按壓','林婉真示範 CPR，旁邊放著碼表。','這是技能訓練，不是病房。',['林婉真','Annie'],'skills'),
      F('教學紀錄','住院醫師練習','張守恆與周啟文輪流練習。','兩個名字第一次和這個空間連在一起。',['張守恆','周啟文','Annie'],'skills'),
      F('玻璃窗外','觀看','李承禮站在教學室玻璃外。','他沒有加入演練。',['李承禮'],'skills'),
      F('白板','Code Blue','陳柏勳在白板寫下「Code Blue 模擬情境」。','六樓確實曾經存在，而且四位醫師都來過。',['陳柏勳'],'skills')
    ])
  }),
  M2_DUTYROOM_ALBUM:Object.freeze({
    id:'M2_DUTYROOM_ALBUM',mode:'ALBUM',title:'相簿 01｜1997 夜班交接日常',source:'4F 醫師值班室｜抽屜',
    frames:Object.freeze([
      F('1997','門口合照','四位醫師站在值班室門口。','胸牌太小，看不清楚。',['張守恆','李承禮','周啟文','陳柏勳'],'duty'),
      F('交班前','病歷夾','林婉真把一疊綠色病歷交給值班團隊。','這些人彼此很熟。',['林婉真','張守恆'],'duty'),
      F('17:05','黑咖啡','張守恆雙手捧著黑色馬克杯。','我看著杯子的手勢，竟然覺得熟悉。',['張守恆'],'duty'),
      F('17:06','拍肩','周啟文笑著拍張守恆肩膀。','照片裡不像只是同事。',['周啟文','張守恆'],'duty'),
      F('17:08','看錶','李承禮站在最後面看著腕錶。','他似乎一直在等某個時間。',['李承禮'],'duty'),
      F('17:09','急診來電','陳柏勳從門口探頭，手上夾著急診單。','四個人的路線從這裡開始分開。',['陳柏勳'],'duty')
    ])
  }),
  M3_ER_PHOTO:Object.freeze({
    id:'M3_ER_PHOTO',mode:'ALBUM',title:'照片 04｜急診深夜',source:'2F 急診醫師診療室｜舊照片',
    frames:Object.freeze([
      F('1998.10.12 20:11','綠色終端','林婉真盯著舊式螢幕上的空白姓名欄。','沒有名字，不代表沒有身分。',['林婉真'],'er'),
      F('20:13','查吊牌','張守恆俯身查看一名沾滿煙灰的男性。','男子胸前有工務吊牌。',['張守恆','不詳男'],'er'),
      F('20:14','流程','陳柏勳站在門框邊，示意先建立臨時病歷。','他想讓急診先運作下去。',['陳柏勳'],'er'),
      F('20:15','拒絕','張守恆回頭阻止建新檔。','「先確認他是誰。」',['張守恆'],'er'),
      F('20:16','走廊陰影','李承禮從後方走廊看著眾人。','照片到這裡就斷了。',['李承禮'],'er')
    ])
  }),
  M4_SECOND_DUTY_NOTE:Object.freeze({
    id:'M4_SECOND_DUTY_NOTE',mode:'ALBUM',title:'未送達的便條｜第二院區值班室',source:'第二院區 2F 醫師值班室',
    frames:Object.freeze([
      F('1998.10.12 00:50','寫字','周啟文伏在桌邊急促寫便條。','紙上第一行是「守恆」。',['周啟文'],'duty'),
      F('00:51','等待','張守恆背對鏡頭看向天橋，手邊放著黑咖啡。','他似乎沒有拿到那張紙。',['張守恆'],'duty'),
      F('00:52','轉院單','陳柏勳坐在長椅核對跨院區文件。','文件角落可見 409-A。',['陳柏勳'],'duty'),
      F('00:53','掉落','便條落在門邊。','沒有人注意。',[],'duty'),
      F('00:54','黑皮鞋','一隻黑皮鞋踩過便條，紙面留下鞋印。','警告沒有送達。',['未知白袍'],'duty')
    ])
  }),
  M5_GUARD_REST_LOG:Object.freeze({
    id:'M5_GUARD_REST_LOG',mode:'ALBUM',title:'警衛休息室｜未送出的值勤快照',source:'第二院區 2F 警衛休息室｜抽屜底層',
    frames:Object.freeze([
      F('1998.10.12 01:36','交班桌','王世榮把 B-Panel 十字鑰匙掛回金屬鑰匙櫃。','紫色吊牌上只寫著 B-PANEL。',['王世榮'],'security'),
      F('01:39','工務通報','劉志遠拿著 ENG-860214 吊牌與維修單要求開啟地下排煙通道。','他沒有拿走鑰匙；他只要求警衛解除門禁。',['劉志遠','王世榮'],'security'),
      F('01:41','規章','王世榮指著夜間門禁規章，搖頭拒絕。','「沒有書面批示，我不能交付機房鑰匙。」',['王世榮'],'security'),
      F('01:43','離開','劉志遠轉身往電梯跑。','幾分鐘後，監控拍到電梯樓層顯示「6」。',['劉志遠'],'elevator')
    ])
  }),
  M5_SECURITY_PLAYBACK:Object.freeze({
    id:'M5_SECURITY_PLAYBACK',mode:'CCTV',title:'第二院區監控室｜抽幀回放',source:'SECURITY ARCHIVE / LIVE FEED',
    frames:Object.freeze([
      F('1998-10-12 01:42:10','ELEVATOR 1','劉志遠提著工具箱衝進電梯。','樓層顯示器亮出一個現行院圖不存在的「6」。',['劉志遠'],'elevator'),
      F('01:43:02','1F SECURITY','周啟文和王世榮在警衛台前爭執。','王世榮指著牆上的門禁規章。',['周啟文','王世榮'],'security'),
      F('01:44:18','6F SKILL LAB','Annie 平躺在技能教學床。','畫面下一格，她的頭部位置似乎變了。',['Annie'],'skills'),
      F('LIVE','CAM 202','你正站在監控操作台前。','即時畫面延遲不到一秒。',['值班醫師'],'security'),
      F('LIVE + 00:00:01','CAM 204','另一個穿白袍的值班醫師從天橋另一端走過。','可是你沒有離開監控室。',['另一個值班醫師'],'bridge'),
      F('FACIAL MATCH','SYSTEM','ACCOUNT: LI_CHENG_LI / MED-820316','WARNING: DUPLICATE ON-CALL DOCTOR DETECTED.',['李承禮'],'static')
    ])
  }),
  M6_6F_PLAYBACK:Object.freeze({
    id:'M6_6F_PLAYBACK',mode:'CCTV',title:'6F｜技能教學錄影殘片',source:'TRAINING CAMERA / DAMAGED TAPE',
    frames:Object.freeze([
      F('1998','SKILL LAB','Annie 仰躺在訓練床。','這就是文史相簿裡的同一間教室。',['Annie'],'skills'),
      F('TRAINING 02','CPR','張守恆跪在床邊做胸外按壓。','林婉真在旁邊計時。',['張守恆','林婉真','Annie'],'skills'),
      F('TRAINING 03','進門','周啟文推門進來。','他似乎在找人。',['周啟文'],'skills'),
      F('TRAINING 04','中止','李承禮走入畫面，示意演練停止。','畫面沒有聲音，只剩時間碼。',['李承禮'],'skills'),
      F('CORRIDOR','警告','門外的劉志遠指向配電方向。','他的嘴型反覆像在說「排煙」。',['劉志遠'],'corridor'),
      F('SIGNAL LOST','雪花','畫面被煙霧與磁帶雪花吞沒。','後面幾分鐘的影像全數毀損。',[],'static')
    ])
  }),
  M7_GUARD_0217:Object.freeze({
    id:'M7_GUARD_0217',mode:'CCTV',title:'1F 警衛台｜02:16:48',source:'夜間警衛監視錄影',
    frames:Object.freeze([
      F('02:16:48','值勤簿','王世榮低頭寫夜間紀錄。','B-Panel 鑰匙掛在後方鑰匙櫃。',['王世榮'],'security'),
      F('02:16:51','急奔','周啟文衝進畫面，指向服務門。','他要求解除門禁。',['周啟文','王世榮'],'security'),
      F('02:16:54','追上','張守恆從後方走廊出現，手裡夾著病歷。','四樓仍有人被系統登記在 409-A。',['張守恆'],'security'),
      F('02:16:58','B-Panel','李承禮跑到配電盤前。','他翻開的是舊版緊急工務手冊。',['李承禮'],'security'),
      F('02:17:00','BLACKOUT','畫面瞬間全黑。','舊紀錄到這裡結束。',[],'static')
    ])
  }),
  B2_VICTIM_MAP:Object.freeze({
    id:'B2_VICTIM_MAP',mode:'ALBUM',title:'1998.10.12｜火災罹難者位置圖',source:'B2 封存底稿｜檢方／工務聯合標記',
    frames:Object.freeze([
      F('FINAL MAP 1/4','第一院區','張守恆 MED-870409：4F 409-A；李承禮 MED-820316：1F B-Panel。','兩名醫師最後位置互相矛盾，不可能是同一個人。',['張守恆','李承禮'],'map'),
      F('FINAL MAP 2/4','逃生動線','周啟文 MED-880217：1F–3F 逃生梯；王世榮 SEC-760117：1F 警衛台。','警衛端的時間戳可以排除一個候選。',['周啟文','王世榮'],'map'),
      F('FINAL MAP 3/4','跨院區與行政','陳柏勳 MED-890605：天橋中段；林婉真 NUR-900033：4F 護理站；謝玉琴 ADM-851104：3F 文史室。','當夜 4+3 核心人員全部罹難。',['陳柏勳','林婉真','謝玉琴'],'map'),
      F('FINAL MAP 4/4','工務','劉志遠 ENG-860214：B2 地下排煙道通風口。','共八名罹難者。沒有人從那一晚活著離開。',['劉志遠'],'map')
    ])
  })
});

export function getMemorySequence(id){return MEMORY_SEQUENCES[id]||null;}
export function getIdentityCandidate(id){return IDENTITY_CANDIDATES.find(item=>item.id===id)||null;}
