// Fictional, non-prescriptive work scenarios. No real patient data or treatment doses.
export const DUTY_VERSION = 1;
export const START = 17 * 60;
export const END = 21 * 60;
export const F4 = 'first_campus_4f';
export const ER = 'first_campus_2f';
export const NORMAL_EVENTS = [
  ['INSOMNIA','睡前不安','病人擔心今晚又睡不著，請你一起了解情況。'],
  ['HEADACHE','頭部不適','病人說頭有些不舒服，請來與護理師共同確認。'],
  ['ABDOMINAL_DISCOMFORT','腹部不適','病人反映腹部不適，需要值班醫師到場了解。'],
  ['NAUSEA','噁心','病人覺得噁心，請到場核對交班與目前狀況。'],
  ['CONSTIPATION','排便困擾','病人想談排便困擾，請協助了解並留下紀錄。'],
  ['FEVER','體溫異常回報','護理師回報體溫異常，請醫師到場評估。'],
  ['ABNORMAL_BP','量測數值複核','護理師希望你到場確認量測紀錄與病人的感受。'],
  ['FALL','跌倒事件回報','病房回報跌倒事件，需要醫師到場共同處理與紀錄。'],
  ['CHEST_DISCOMFORT','胸部不適','病人反映胸部不適，護理師請醫師立即到場評估。'],
  ['ANXIETY','焦慮與陪伴','病人因明天的安排感到焦慮，想找人說說話。'],
  ['AGITATION','情緒升高','病人情緒升高，護理師邀請醫師一起協助溝通。'],
  ['ROOMMATE_CONFLICT','室友間的困擾','兩位病人對熄燈時間有不同想法，需要協助溝通。'],
  ['PRN_REQUEST','臨時用藥需求確認','護理師回報臨時用藥需求，請核對既有紀錄並評估。'],
  ['ECG_REQUEST','心電圖工作協作','請到場與護理師核對心電圖工作及紀錄是否完成。'],
  ['BLOOD_DRAW','檢體工作協作','護理師請你協助確認檢體工作及相關紀錄。'],
  ['ER_ASSIST','急診支援','急診需要值班醫師支援問診與交班紀錄。'],
  ['NEW_ADMISSION','新病人到院','新病人與家屬已到急診，請來了解狀況並完成初步紀錄。'],
  ['CHART_CORRECTION','紀錄待補','有一份正常交班紀錄待補，請與護理師核對。'],
  ['ECT_PREPARATION','翌日 ECT 準備核對','請在急診治療室核對翌日準備清單；不操作治療機器。'],
  ['MEDICATION_CHECK','既有醫囑核對','護理師希望與醫師一起核對既有醫囑及交班事項。']
].map(([id,title,message])=>({id,title,message,type:'NORMAL',fictional:true}));
export const SECOND_CASE_POOL = ['HEADACHE','ANXIETY','ABDOMINAL_DISCOMFORT','ABNORMAL_BP'];
export const STAGE_INFO = {
  HANDOFF: ['完成 316 的鑰匙、值班本與電子交班', 1030],
  CHECKIN: ['前往 4F 護理站報到，確認晚餐', 1040],
  ROOM: ['回獨立值班室：放物品、鋪床、確認電話', 1055],
  ROUNDS: ['刷卡進入病房，完成 4A／4B／4C／4D 巡視', 1080],
  CALL1: ['接聽值班電話（P），未接可回撥', 1090],
  ASSESS1: ['前往 4A，與病人及護理師共同確認狀況', 1100],
  DOCUMENT1: ['回 4F 護理站，使用值班紀錄簿完成紀錄', 1110],
  CALL2: ['接聽下一通一般病房來電（P）', 1140],
  ASSESS2: ['前往來電病房，完成到場確認', 1155],
  DOCUMENT2: ['回 4F 護理站補上這次值班紀錄', 1170],
  DINNER: ['晚餐送到了，到 4F 護理站領取', 1170],
  REST: ['回值班室選擇短暫休息，或保持清醒待命', 1200],
  ER_CALL: ['急診來電：接聽／回撥（P）', 1205],
  ER_ASSESS: ['前往 2F 急診，刷卡後到留觀床位支援', 1220],
  ER_DOCUMENT: ['到急診護理站完成紀錄與交接', 1230],
  RETURN: ['返回 4F 值班室，在床邊核對本幕工作', 1260],
  COMPLETE: ['第一幕完成：今晚的值班還沒結束', 1260]
};
export const NORMAL_STAFF = [
  {zone:'first_campus_3f',role:'行政同仁',position:[7.5,0,7.3],until:1080},
  {zone:F4,role:'病房護理師',position:[7.5,0,3.8],until:1261},
  {zone:ER,role:'急診護理師',position:[2.1,0,5.2],until:1261}
];
export function template(id) { return NORMAL_EVENTS.find(event=>event.id===id); }
