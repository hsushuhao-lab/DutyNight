export const NORMAL_DUTY_STEPS = [
  ['P1_316_COMPLETE','17:10'],
  ['P1_4F_REPORT','17:15'],
  ['P1_NORMAL_EVENT_DONE','19:30'],
  ['P1_ER_CALL_RECEIVED','20:00'],
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
      return {speaker:'晚班護理師',text:'「醫師，你來啦。今晚 4F 滿床 32 床。408C 的老先生一直說隔壁有人敲牆；409 仍封閉整修。19:30 麻煩你去 408C 確認。」'};
    }
    if(zoneId==='first_campus_4f' && this.gameState.isTaskComplete('P1_ER_NOTE_DONE') && !this.gameState.isTaskComplete('P1_RETURN_4F')){
      this.complete('P1_RETURN_4F','20:40');
      this.gameState.setFlag('ER_JANE_PRESENT',false);
      return {speaker:'晚班護理師',text:'「醫師辛苦了，目前病房都還好，可以先回值班室休息。」'};
    }
    if(zoneId==='first_campus_3f' && this.gameState.getFlag('NIGHT_PATROL_RETURN_3F') && !this.gameState.getFlag('BOOTSTRAP_2117_RESOLVED')){
      this.gameState.setGameTime('21:16');
      return {speaker:'值班醫師',text:'「我一直在 4F……三樓卻說剛才看見我。先去查哨點確認那份紀錄。」'};
    }
    return null;
  }
}
