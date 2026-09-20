import {DUTY_VERSION,START,END,F4,ER,NORMAL_EVENTS,SECOND_CASE_POOL,STAGE_INFO,template} from './normalDutyData.js';

export class GameClock {
  constructor(minutes=START) { this.minutes=minutes; }
  tick(seconds,ceiling,rate=.5) { this.minutes=Math.min(ceiling,this.minutes+Math.max(0,seconds)*rate); }
  advanceTo(minutes) { this.minutes=Math.max(this.minutes,minutes); }
  get text() { const m=Math.floor(this.minutes);return `${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`; }
}
export class TaskManager {
  constructor(done=[]) { this.done=new Set(done); }
  complete(id) { if(this.done.has(id))return false;this.done.add(id);return true; }
  has(id) { return this.done.has(id); }
}
export class DutyEventManager {
  constructor(seed) {
    // Seed controls only ordinary scenario/ward selection, never spatial topology.
    const n=seed>>>0;
    this.events=[
      {id:'case1',templateId:'INSOMNIA',ward:'4A',zone:F4,at:1080,status:'QUEUED'},
      {id:'case2',templateId:SECOND_CASE_POOL[n%SECOND_CASE_POOL.length],ward:n%2?'4B':'4C',zone:F4,at:1140,status:'QUEUED'},
      {id:'er',templateId:'NEW_ADMISSION',ward:'急診',zone:ER,at:1200,status:'QUEUED'}
    ];
  }
  get(id) { return this.events.find(event=>event.id===id); }
}
export class PhoneManager {
  constructor() { this.call=null; }
  ring(event,minute) { this.call={eventId:event.id,source:event.ward,at:minute,status:'RINGING',seconds:0,misses:0};event.status='RINGING'; }
  tick(seconds) {
    if(!this.call||this.call.status!=='RINGING')return false;
    this.call.seconds+=seconds;
    if(this.call.seconds<20)return false;
    this.call.status='MISSED';this.call.misses++;return true;
  }
  miss() { if(!this.call||this.call.status!=='RINGING')return false;this.call.status='MISSED';this.call.misses++;return true; }
  answer() { if(!this.call||!['RINGING','MISSED'].includes(this.call.status))return false;this.call.status='ANSWERED';return true; }
}
export class RestManager {
  constructor() { this.sleeping=false;this.waiting=false;this.interrupted=false;this.state='TIRED'; }
  start(sleep) { this.sleeping=sleep;this.waiting=!sleep;this.state=sleep?'RESTING':'TIRED'; }
  wake(byPhone=false) { const wasSleeping=this.sleeping,interrupted=wasSleeping&&byPhone;this.sleeping=false;this.waiting=false;this.interrupted ||= interrupted;this.state=interrupted?'SLEEP_INTERRUPTED':wasSleeping?'RESTED':'TIRED';return interrupted; }
}

/** Authoritative, serializable normal-duty progression. No renderer, DOM, or clinical prescription. */
export class NormalDutyRun {
  constructor(seed=Date.now()) {
    this.seed=seed>>>0;this.clock=new GameClock();this.tasks=new TaskManager();
    this.events=new DutyEventManager(this.seed);this.phone=new PhoneManager();this.rest=new RestManager();
    this.stage='HANDOFF';this.history=[];this.choices={};this.fatigue=0;this.revision=0;
  }
  log(type,details={}) { this.history.push({minute:Math.floor(this.clock.minutes),time:this.clock.text,type,...details});this.revision++; }
  move(stage,minute) { this.stage=stage;this.clock.advanceTo(minute);this.log('stage',{stage}); }
  finishHandoff() { if(this.stage!=='HANDOFF')return false;this.tasks.complete('HANDOFF');this.move('CHECKIN',1030);return true; }
  checkin(meal) {
    if(this.stage!=='CHECKIN'||!['regular','vegetarian'].includes(meal))return false;
    this.choices.meal=meal;this.tasks.complete('CHECKIN');this.move('ROOM',1040);return true;
  }
  setup(id) {
    if(this.stage!=='ROOM'||!['BAG','BED','PHONE'].includes(id)||!this.tasks.complete(id))return false;
    this.log('room_setup',{id});
    if(['BAG','BED','PHONE'].every(k=>this.tasks.has(k)))this.move('ROUNDS',1055);
    return true;
  }
  round(ward) {
    if(this.stage!=='ROUNDS'||!['4A','4B','4C','4D'].includes(ward)||!this.tasks.complete(`ROUND_${ward}`))return false;
    this.log('round',{ward});
    if(['4A','4B','4C','4D'].every(w=>this.tasks.has(`ROUND_${w}`))){this.move('CALL1',1080);this.call('case1');}
    return true;
  }
  call(id) { const event=this.events.get(id);if(event.status!=='QUEUED')return false;this.phone.ring(event,this.clock.minutes);this.log('phone_ringing',{eventId:id,ward:event.ward});return true; }
  get activeEvent() { return this.phone.call?this.events.get(this.phone.call.eventId):null; }
  answer() {
    if(!this.phone.answer())return false;
    const event=this.activeEvent;event.status='ACTIVE';event.answeredAt=this.clock.minutes;
    this.log('phone_answered',{eventId:event.id,responseMinutes:+(this.clock.minutes-this.phone.call.at).toFixed(2),misses:this.phone.call.misses});
    this.move({case1:'ASSESS1',case2:'ASSESS2',er:'ER_ASSESS'}[event.id],event.at);return true;
  }
  miss() { if(!this.phone.miss())return false;this.log('phone_missed',{eventId:this.phone.call.eventId});return true; }
  assess(ward,method) {
    const event=this.activeEvent;
    if(!event||event.status!=='ACTIVE'||ward!==event.ward||!['chart_first','nurse_first'].includes(method))return false;
    event.status='ASSESSED';this.choices[event.id]=method;this.log('assessment',{eventId:event.id,ward,method});
    this.move({case1:'DOCUMENT1',case2:'DOCUMENT2',er:'ER_DOCUMENT'}[event.id],{case1:1095,case2:1155,er:1215}[event.id]);return true;
  }
  document(zone) {
    const event=this.activeEvent;
    if(!event||event.status!=='ASSESSED'||zone!==event.zone)return false;
    event.status='COMPLETED';event.completedAt=this.clock.minutes;this.tasks.complete(event.id);this.log('documented',{eventId:event.id,zone});
    this.phone.call=null;
    if(event.id==='case1'){this.move('CALL2',1140);this.call('case2');}
    else if(event.id==='case2')this.move('DINNER',1170);
    else this.move('RETURN',1230);
    return true;
  }
  dinner() { if(this.stage!=='DINNER')return false;this.tasks.complete('DINNER');this.log('dinner',{meal:this.choices.meal});this.move('REST',1170);return true; }
  startRest(sleep) {
    if(this.stage!=='REST'||this.rest.sleeping||this.rest.waiting)return false;
    this.choices.rest=sleep?'sleep':'stay_awake';this.tasks.complete('REST_CHOICE');this.rest.start(sleep);this.log('rest_started',{sleep});return true;
  }
  wakeEarly() { if(!this.rest.sleeping&&!this.rest.waiting)return false;this.rest.wake(false);this.log('rest_ended_early');return true; }
  tick(seconds,paused=false) {
    if(paused||this.stage==='COMPLETE')return;
    const elapsed=Math.max(0,Math.min(seconds,.25));
    this.clock.tick(elapsed,STAGE_INFO[this.stage][1],this.rest.sleeping||this.rest.waiting?6:.5);
    this.fatigue=Math.max(0,this.fatigue+elapsed*(this.rest.sleeping?-.12:.02));
    if(this.phone.tick(elapsed))this.log('phone_missed',{eventId:this.phone.call.eventId});
    // This scheduled call also wakes a sleeping doctor; modal/hidden-tab pause never skips it.
    if(this.stage==='REST'&&this.tasks.has('REST_CHOICE')&&this.clock.minutes>=1200){
      const interrupted=this.rest.wake(true);this.log('rest_ended',{interrupted});this.move('ER_CALL',1200);this.call('er');
    }
  }
  finish() {
    if(this.stage!=='RETURN'||this.events.events.some(e=>e.status!=='COMPLETED')||!this.tasks.has('DINNER')||!this.tasks.has('REST_CHOICE'))return false;
    this.tasks.complete('RETURN');this.move('COMPLETE',END);this.log('act1_normal_complete');return true;
  }
  get objective() {
    if(this.stage==='ROOM')return '值班室準備：'+[['BAG','放物品'],['BED','鋪床'],['PHONE','確認電話']].map(([id,t])=>`${this.tasks.has(id)?'✓':'□'}${t}`).join('　');
    if(this.stage==='ROUNDS')return '巡房：'+['4A','4B','4C','4D'].map(w=>`${this.tasks.has(`ROUND_${w}`)?'✓':'□'}${w}`).join('　');
    if(this.stage==='ASSESS2')return `前往 ${this.activeEvent.ward}：${template(this.activeEvent.templateId).title}`;
    return STAGE_INFO[this.stage][0];
  }
  snapshot() { return {version:DUTY_VERSION,seed:this.seed,stage:this.stage,minutes:this.clock.minutes,tasks:[...this.tasks.done],events:this.events.events,phone:this.phone.call,rest:{...this.rest},choices:this.choices,fatigue:this.fatigue,history:this.history}; }
  static restore(data) {
    if(!data||data.version!==DUTY_VERSION||!STAGE_INFO[data.stage]||!Array.isArray(data.tasks)||!Array.isArray(data.events)||data.events.length!==3||!Array.isArray(data.history)||!Number.isFinite(data.minutes)||data.minutes<START||data.minutes>END)throw Error('此存檔版本無法讀取');
    if(data.events.some(e=>!template(e.templateId)))throw Error('存檔的事件資料不完整');
    const run=new NormalDutyRun(data.seed);run.stage=data.stage;run.clock=new GameClock(data.minutes);run.tasks=new TaskManager(data.tasks);
    run.events.events=structuredClone(data.events);run.phone.call=structuredClone(data.phone);
    Object.assign(run.rest,data.rest);run.rest.sleeping=false;run.rest.waiting=false;
    run.choices={...data.choices};run.fatigue=data.fatigue;run.history=structuredClone(data.history);run.log('resume');return run;
  }
}
