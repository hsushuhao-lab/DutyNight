// CharacterBible.js — Runtime-facing character identity source for DutyNight.
// Story IDs and chronology remain in NarrativeV22.js; this file owns visual/behavioral identity.

const freeze = value => Object.freeze(value);

export const CHARACTER_PROFILES = freeze({
  ZHANG_SHOUHENG: freeze({
    id:'ZHANG_SHOUHENG', name:'張守恆', employeeId:'MED-870409', role:'第一線住院醫師',
    age1998:29,
    introduction:'年輕的第一線值班醫師，習慣先核對病人身分、床位與原始紀錄，再做處置。',
    personality:'安靜、觀察細、固執但謹慎；涉及病人安全時不願因上級壓力省略核對。',
    hobby:'黑咖啡、閱讀舊病例與醫學書籍。',
    signatureQuote:'先確認他是誰。',
    relationship:'與周啟文最親近；對李承禮的制度優先作風逐漸產生衝突。',
    visual:freeze({
      height:1.00, build:.90, face:'oval', hair:'short_soft', coat:'loose',
      accent:'#2b2a26', undershirt:'#718276', prop:'black_mug', gesture:'record_check'
    })
  }),
  LI_CHENGLI: freeze({
    id:'LI_CHENGLI', name:'李承禮', employeeId:'MED-820316', role:'夜間總醫師',
    age1998:41,
    introduction:'夜間總醫師，負責制度、門禁與跨單位決策，極度重視紀錄與程序的一致。',
    personality:'果斷、權威、控制感強；傾向相信制度與標準流程比個人直覺可靠。',
    hobby:'圍棋、鋼筆、整理文件。',
    signatureQuote:'先照程序做。',
    relationship:'張守恆的上級；兩人對「事實」與「制度紀錄」的優先順序不同。',
    visual:freeze({
      height:1.03, build:1.02, face:'square', hair:'side_part', coat:'tailored',
      accent:'#363b3a', undershirt:'#4b4f53', prop:'red_pen_watch', gesture:'watch_check'
    })
  }),
  ZHOU_QIWEN: freeze({
    id:'ZHOU_QIWEN', name:'周啟文', employeeId:'MED-880217', role:'第二線住院醫師',
    age1998:31,
    introduction:'第二線支援醫師，常替第一線補位與跨單位溝通，曾多次試圖把警告送到張守恆手上。',
    personality:'溫和、有同理心，說話前常先停一下；重大衝突時容易遲疑。',
    hobby:'底片攝影、聽廣播。',
    signatureQuote:'守恆，等一下。',
    relationship:'張守恆最像朋友的同事；未送達的警告是兩人關係的核心遺憾。',
    visual:freeze({
      height:1.05, build:.94, face:'long', hair:'messy_side', coat:'open',
      accent:'#4c4f46', undershirt:'#76817a', prop:'note_camera', gesture:'half_turn'
    })
  }),
  CHEN_BOXUN: freeze({
    id:'CHEN_BOXUN', name:'陳柏勳', employeeId:'MED-890605', role:'第二院區支援醫師',
    age1998:34,
    introduction:'第二院區支援醫師，熟悉跨院區轉送與天橋流程，習慣先讓系統與醫療流程繼續運作。',
    personality:'務實、有效率、情緒表達少；遇到混亂時先處理流程，再處理爭議。',
    hobby:'騎自行車、研究地圖與路線。',
    signatureQuote:'病人先處理，資料等等補。',
    relationship:'與張守恆不是敵對，而是「先處理」與「先確認」的工作哲學衝突。',
    visual:freeze({
      height:1.01, build:.98, face:'angular', hair:'short_neat', coat:'open',
      accent:'#566052', undershirt:'#68776d', prop:'transfer_folder', gesture:'walking_read'
    })
  }),
  LIN_WANZHEN: freeze({
    id:'LIN_WANZHEN', name:'林婉真', employeeId:'NUR-900033', role:'夜班護理師',
    age1998:33,
    introduction:'四樓夜班護理師，熟悉每張床、每份交班與現場照護細節，是最可靠的臨床現實錨點。',
    personality:'細心、有耐性，遇到病人安全問題會直接表達意見；對異常文件特別敏感。',
    hobby:'照顧植物、編織。',
    signatureQuote:'這張不是我印的。',
    relationship:'與張守恆合作默契最好；她的記憶與現場觀察常用來驗證系統是否說謊。',
    visual:freeze({
      height:.96, build:.90, face:'round', hair:'bob_tied', coat:'nurse',
      accent:'#5a756a', undershirt:'#d5ddd6', prop:'green_chart_timer', gesture:'organize'
    })
  }),
  WANG_SHIRONG: freeze({
    id:'WANG_SHIRONG', name:'王世榮', employeeId:'SEC-760117', role:'夜間警衛／門禁管理',
    age1998:48,
    introduction:'第一院區夜間警衛，負責巡查、CCTV、B-Panel 與機房鑰匙，是「誰曾經過這裡」的活紀錄。',
    personality:'保守、守規矩、記人很準；不喜歡沒有書面依據的臨時通融。',
    hobby:'修理收音機、泡茶。',
    signatureQuote:'沒有書面批示，我不能交鑰匙。',
    relationship:'與周啟文、劉志遠都因門禁規則發生衝突，但他的記錄後來成為重要證據。',
    visual:freeze({
      height:.98, build:1.08, face:'broad', hair:'receding', coat:'security',
      accent:'#314036', undershirt:'#3c4942', prop:'purple_key_thermos', gesture:'ledger_guard'
    })
  }),
  XIE_YUQIN: freeze({
    id:'XIE_YUQIN', name:'謝玉琴', employeeId:'ADM-851104', role:'行政／文史檔案',
    age1998:38,
    introduction:'三樓行政與文史檔案承辦，熟悉名冊、老照片與索引位置，最容易發現資料被塗改或錯置。',
    personality:'細心、好奇、記憶力強；看到缺頁、補貼與錯誤索引時很難當作沒看到。',
    hobby:'地方史、整理老照片與剪報。',
    signatureQuote:'這一頁不是漏印，是被改過。',
    relationship:'她保存下來的行政痕跡，讓後來的張守恆有機會反查真正身分。',
    visual:freeze({
      height:.95, build:.94, face:'soft_square', hair:'short_wave', coat:'admin',
      accent:'#6b5146', undershirt:'#887467', prop:'photo_index_pencil', gesture:'sort_files'
    })
  }),
  LIU_ZHIYUAN: freeze({
    id:'LIU_ZHIYUAN', name:'劉志遠', employeeId:'ENG-860214', role:'工務機電技師',
    age1998:36,
    introduction:'院內工務機電技師，最早察覺排煙與 B-Panel 異常，出事後仍試圖讓門禁與設備恢復運作。',
    personality:'直接、急、實務導向；面對設備危機時不耐官樣程序，但不是莽撞。',
    hobby:'修機車、收藏舊工具。',
    signatureQuote:'不要拉三個，先看紫色備援。',
    relationship:'與王世榮的門禁規則衝突，卻留下最直接的工程危機線索。',
    visual:freeze({
      height:1.00, build:1.08, face:'rect', hair:'crew', coat:'engineer',
      accent:'#5e543f', undershirt:'#6e6250', prop:'toolbox_tag', gesture:'urgent_point'
    })
  })
});

const ALIASES = freeze({
  '張守恆':'ZHANG_SHOUHENG',
  '李承禮':'LI_CHENGLI',
  '周啟文':'ZHOU_QIWEN',
  '陳柏勳':'CHEN_BOXUN',
  '林婉真':'LIN_WANZHEN',
  '王世榮':'WANG_SHIRONG',
  '謝玉琴':'XIE_YUQIN',
  '劉志遠':'LIU_ZHIYUAN',
  '不詳男':'LIU_ZHIYUAN',
  '未知醫師':'ZHANG_SHOUHENG',
  '被刪除的醫師':'ZHANG_SHOUHENG'
});

export function getCharacterProfile(nameOrId){
  if(!nameOrId)return null;
  const id=CHARACTER_PROFILES[nameOrId]?nameOrId:ALIASES[nameOrId];
  return id?CHARACTER_PROFILES[id]:null;
}

export function getCorePersonnelProfiles(){
  return [
    CHARACTER_PROFILES.ZHANG_SHOUHENG,
    CHARACTER_PROFILES.LI_CHENGLI,
    CHARACTER_PROFILES.ZHOU_QIWEN,
    CHARACTER_PROFILES.CHEN_BOXUN,
    CHARACTER_PROFILES.LIN_WANZHEN,
    CHARACTER_PROFILES.WANG_SHIRONG,
    CHARACTER_PROFILES.XIE_YUQIN
  ];
}

export function getAllCharacterProfiles(){
  return Object.values(CHARACTER_PROFILES);
}
