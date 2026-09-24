export const NORMAL_DUTY_STEPS = [
  ['P1_316_COMPLETE','17:10'],
  ['P1_4F_REPORT','17:15'],
  ['P1_DUTY_ROOM_READY','17:30'],
  ['P1_ROUND_COMPLETE','18:00'],
  ['P1_INSOMNIA_DONE','18:30'],
  ['P1_NORMAL_EVENT_DONE','19:30'],
  ['P1_REST_DONE','20:00'],
  ['P1_ER_ASSESSMENT_DONE','20:25'],
  ['P1_ER_NOTE_DONE','20:30'],
  ['P1_RETURN_4F','20:40'],
  ['ACT1_NORMAL_FLOW','21:00']
];

export const NORMAL_EVENT_POOL = [
  {id:'HEADACHE',label:'頭痛',line:'病人主訴頭痛，生命徵象穩定，依既有醫囑處理並觀察。'},
  {id:'ABDOMINAL_DISCOMFORT',label:'腹部不適',line:'病人主訴輕微腹部不適，完成症狀詢問後持續觀察。'},
  {id:'ANXIETY',label:'焦慮',line:'病人晚間焦慮增加，簡短支持性會談後情緒較穩定。'},
  {id:'BP_RECHECK',label:'血壓追蹤',line:'依交班重新量測生命徵象，無急性不適，持續觀察。'},
  {id:'PRN_REQUEST',label:'PRN request',line:'病人詢問既有 PRN，完成原因確認後依原醫囑處理。'},
  {id:'ROOMMATE_CONFLICT',label:'室友衝突',line:'兩位病人因生活作息爭執，分開後完成簡短溝通。'}
];

export class DutyEventManager {
  constructor(gameState){this.gameState=gameState;this.normalEvent=NORMAL_EVENT_POOL[2];}
  complete(taskId,time){this.gameState.markTaskComplete(taskId);this.gameState.setGameTime(time);}
  onZoneEntered(zoneId){
    if(zoneId==='first_campus_4f' && this.gameState.isTaskComplete('E_HANDOFF') && !this.gameState.isTaskComplete('P1_4F_REPORT')){
      this.gameState.setGameTime('17:15');
      return {speaker:'晚班護理師',text:'「李醫師，你來啦。今晚 4F 滿床，總共 36 床。403 床老先生一直說隔壁在敲牆壁，待會巡房麻煩你幫忙看一下。」'};
    }
    if(zoneId==='first_campus_2f' && this.gameState.isTaskComplete('P1_REST_DONE') && !this.gameState.isTaskComplete('P1_ER_ASSESSMENT_DONE')){
      this.gameState.setGameTime('20:05');
      if(this.gameState.getFlag('HOOK_0217')){
        return {speaker:'急診護理師',text:'「李醫師，這位無名氏沒有證件，只有一條 1998 年格式的舊手圈。現行 HIS 讀不出來，先麻煩你完成精神科評估。」'};
      }
      return {speaker:'急診護理師',text:'「醫師您好，這位病人最近壓力大、兩天沒睡好，今晚心悸焦慮，所以來急診。」'};
    }
    if(zoneId==='first_campus_4f' && this.gameState.isTaskComplete('P1_ER_NOTE_DONE') && !this.gameState.isTaskComplete('P1_RETURN_4F')){
      this.complete('P1_RETURN_4F','20:40');
      return {speaker:'晚班護理師',text:'「醫師辛苦了，目前病房都還好，可以先回值班室休息。」'};
    }
    if(zoneId==='first_campus_3f' && this.gameState.getFlag('NIGHT_PATROL_RETURN_3F') && !this.gameState.getFlag('BOOTSTRAP_2117_RESOLVED')){
      this.gameState.setGameTime('21:16');
      return {speaker:'李醫師',text:'「我一直在 4F……三樓卻說剛才看見我。先去查哨點確認那份紀錄。」'};
    }
    if(zoneId==='first_campus_2f'
      && this.gameState.getFlag('GHOST_REGISTRATION_ARMED')
      && this.gameState.getFlag('BOOTSTRAP_2117_RESOLVED')
      && this.gameState.isTaskComplete('P1_ER_NOTE_DONE')
      && !this.gameState.getFlag('GHOST_REGISTRATION_AVAILABLE')
      && !this.gameState.getFlag('LEGEND_ER0033_RESOLVED')){
      this.gameState.setFlag('GHOST_REGISTRATION_AVAILABLE',true);
      this.gameState.setGameTime('00:33');
      return {speaker:'急診掛號系統',text:'「00:33｜新增掛號 1 筆。來源：查無送入紀錄。」'};
    }
    return null;
  }
}
