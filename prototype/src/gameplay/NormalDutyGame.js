import * as THREE from 'three';
import {NormalDutyRun} from './NormalDutyCore.js';
import {F4,ER,NORMAL_STAFF,template} from './normalDutyData.js';
import './normalDuty.css';

const SAVE_KEY='dutynight.normal-duty.v1';
const element=(tag,text,className)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};

/** Thin scene/UI adapter. Existing geometry, routes, door policies and HIS remain authoritative. */
export class NormalDutyGame {
  constructor(router,gameState,ui,sound) {
    this.router=router;this.controller=router.controller;this.gs=gameState;this.ui=ui;this.sound=sound;
    this.run=new NormalDutyRun();this.currentZone=null;this.started=false;this.modalOpen=false;this.lastSave=0;this.lastRevision=-1;this.lastRing=-Infinity;
    this.hud=element('section',null,'normal-duty-hud');this.hud.id='normal-duty-hud';
    this.heading=element('strong','第一幕 · 正常值班');this.objective=element('p');this.phoneHint=element('p',null,'normal-phone-hint');
    const controls=element('div',null,'normal-controls');
    for(const [text,fn] of [['P 電話',()=>this.phone()],['J 值班紀錄',()=>this.journal()],['暫停',()=>this.pause()]]){
      const b=element('button',text);b.onclick=fn;controls.append(b);
    }
    this.hud.append(this.heading,this.objective,this.phoneHint,controls);document.body.append(this.hud);
    this.overlay=element('div',null,'normal-duty-overlay');this.overlay.hidden=true;this.overlay.id='normal-duty-modal';
    this.overlay.setAttribute('role','dialog');this.overlay.setAttribute('aria-modal','true');document.body.append(this.overlay);
    this.sleepLayer=element('div',null,'normal-sleep');this.sleepLayer.hidden=true;this.sleepLayer.append(element('h2','短暫休息'),element('p','你閉上眼睛。值班電話仍然開著。'));
    const wake=element('button','醒來');wake.id='normal-wake';wake.onclick=()=>{this.run.wakeEarly();this.controller.enabled=true;};this.sleepLayer.append(wake);document.body.append(this.sleepLayer);
    document.addEventListener('keydown',e=>{
      if(e.repeat||!this.started||this.legacyModal())return;
      if(e.code==='KeyP'){e.preventDefault();if(!this.modalOpen)this.phone();}
      if(e.code==='KeyJ'){e.preventDefault();if(!this.modalOpen)this.journal();}
      if(e.code==='Escape'){e.preventDefault();if(this.modalOpen)this.close();else this.pause();}
    });
    // Read-only acceptance/diagnostic snapshot. No task completion or teleport controls exposed.
    window.dutyNightStatus=()=>JSON.parse(JSON.stringify({
      ...this.run.snapshot(),objective:this.run.objective,started:this.started,modal:this.modalOpen,
      saveAvailable:!this.saveError,zone:this.router.activeZoneId,anchors:this.anchorInfo||[]
    }));
    let saved=null;
    try{saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');}catch{this.saveError=true;}
    const choices=[['start','開始新的值班',()=>{this.started=true;this.sound.init();this.run.log('start');this.save();}]];
    if(saved?.run?.version===1)choices.unshift(['resume','繼續上次的值班',()=>this.resume(saved)]);
    this.show('17:00　夜班開始',['先到 316 拿鑰匙、簽值班本，完成電子交班。','接著到護理站報到、鋪床、巡房，再處理來電。P 開啟電話，J 查看工作紀錄。','這一幕只到 21:00，沒有超自然事件。病人及醫療工作均為虛構、簡化互動。'],choices,false);
  }
  legacyModal() { return ['workstation-modal','dutylog-modal','elevator-cutscene'].some(id=>document.getElementById(id)?.classList.contains('active')); }
  clearInput() { for(const key of Object.keys(this.controller.keys))this.controller.keys[key]=false;this.controller.cancelAutoMove();this.controller.velocity.set(0,0,0); }
  show(title,paragraphs,choices=[],cancel=true) {
    if(this.legacyModal())return;
    this.modalOpen=true;this.clearInput();this.controller.enabled=false;document.exitPointerLock();
    this.overlay.replaceChildren();this.overlay.hidden=false;
    const card=element('section',null,'normal-duty-card'),h=element('h2',title);h.id='normal-duty-title';this.overlay.setAttribute('aria-labelledby',h.id);card.append(h);
    for(const text of paragraphs)card.append(element('p',text));
    const buttons=element('div',null,'normal-duty-buttons');
    for(const [id,label,fn] of choices){const b=element('button',label);b.dataset.dutyAction=id;b.onclick=()=>{this.close();fn();this.save();this.render();};buttons.append(b);}
    if(cancel){const b=element('button','返回（Esc）');b.dataset.dutyAction='close';b.onclick=()=>this.close();buttons.append(b);}
    card.append(buttons);this.overlay.append(card);buttons.querySelector('button')?.focus();
  }
  close() { this.modalOpen=false;this.overlay.hidden=true;this.clearInput();this.controller.enabled=!this.run.rest.sleeping&&!this.run.rest.waiting; }
  pause() {
    if(this.modalOpen||this.legacyModal())return;
    this.show('值班暫停',[`${this.run.clock.text}　${this.run.objective}`,'此畫面與切到其他分頁時，遊戲時間、來電倒數都暫停。'],[
      ['save','儲存並繼續',()=>this.save()],
      ['restart','重新開始這一幕',()=>this.show('重新開始？',['目前的正常值班進度會被這個新存檔取代。'],[['confirm-restart','確認重新開始',()=>{try{localStorage.removeItem(SAVE_KEY);}catch{}location.reload();}]])]
    ]);
  }
  journal() {
    if(this.modalOpen||this.legacyModal())return;
    const lines=this.run.history.slice(-12).map(h=>`${h.time}　${({start:'開始值班',stage:'工作更新',room_setup:'值班室準備',round:'巡房',phone_ringing:'來電',phone_missed:'未接，保留回撥',phone_answered:'已接聽',assessment:'到場確認',documented:'完成紀錄',dinner:'領取晚餐',rest_started:'開始休息／待命',rest_ended:'休息／待命結束',resume:'讀取存檔',act1_normal_complete:'第一幕完成'})[h.type]||h.type}　${h.ward||h.eventId||h.id||''}`);
    this.show('值班工作紀錄',[this.run.objective,...lines,this.saveError?'本瀏覽器無法儲存；本局仍可繼續。':'工作完成與換區時自動儲存；重新開啟可選擇繼續。']);
  }
  phone() {
    if(this.modalOpen||this.legacyModal())return;
    if(this.run.rest.sleeping||this.run.rest.waiting){this.run.wakeEarly();this.controller.enabled=true;}
    const call=this.run.phone.call,event=this.run.activeEvent;
    if(!call||!['RINGING','MISSED'].includes(call.status))return this.show('值班電話',['目前沒有未接或待接來電。已接任務請查看值班紀錄。']);
    const info=template(event.templateId);
    const missed=call.status==='MISSED';
    const choices=[['answer',missed?'回撥護理站':'接聽',()=>{
      this.run.answer();this.show(`${event.ward} 護理師`,[info.message,`「麻煩醫師過來。我們會在${event.ward==='急診'?'留觀區':'病房'}等你。」`],[['acknowledge','了解，我現在過去',()=>{}]],false);
    }]];
    if(!missed)choices.push(['later','稍後回撥',()=>this.run.miss()]);
    this.show(missed?'未接來電 · 可回撥':'值班電話響了',[`${event.ward} 護理站　${this.run.clock.text}`,missed?'這通工作不會被消除，仍需回撥確認。':'先接聽了解工作內容。'],choices,false);
  }
  handleInteract(data) {
    if(data.type==='workstation'&&this.run.stage!=='HANDOFF'){
      this.show('電子交班已完成',['17:00 電子交班已確認。後續工作請依目前任務，到指定護理站的值班紀錄簿完成紀錄。']);return true;
    }
    if(data.type!=='normal_duty')return false;
    if(this.modalOpen||this.legacyModal())return true;
    const action=data.action,stage=this.run.stage;
    if(action==='station'){
      if(stage==='CHECKIN')this.show('4F 護理師',['「醫師你來了。剛才交班都在紀錄裡，目前大致穩定。」','「先把值班室整理好，再幫忙巡一下四個病房。晚餐要一起訂嗎？」'],[
        ['meal-regular','一起訂一般餐',()=>this.run.checkin('regular')],['meal-vegetarian','一起訂素食餐',()=>this.run.checkin('vegetarian')]
      ]);
      else this.show('病房護理師',['「有事會打值班電話，辛苦了。」',this.run.objective]);
    }else if(action==='bag')this.setup('BAG','放好隨身物品','把包放到值班室書桌旁，識別證與值班電話留在身上。');
    else if(action==='phone-check'){
      if(stage==='ROOM')this.setup('PHONE','確認值班電話','確認來電鈴聲、回撥與聯絡方式；離開房間時會攜帶值班電話。');
      else this.phone();
    }else if(action==='bed'){
      if(stage==='ROOM')this.setup('BED','自己鋪好床單與枕頭套','把乾淨床單拉平，再替枕頭套上枕頭套。床已經可以休息。');
      else if(stage==='REST')this.show('19:30　暫時沒有急事',['晚餐吃完了，下一通電話還沒響。你可以睡一下，也可以保持清醒待命。','休息／待命會快轉時間；來電一定會把睡著的你叫醒。'],[
        ['sleep','躺下，短暫休息',()=>this.run.startRest(true)],['stay-awake','不睡，坐著待命',()=>this.run.startRest(false)]
      ]);
      else if(stage==='RETURN')this.show('回到自己的值班室',['病房工作與急診紀錄已完成。確認電話開著，沒有待補的本幕紀錄。'],[['finish','核對完成，結束這一幕',()=>{if(this.run.finish())this.summary();}]],false);
      else this.show('值班室的床',[this.run.tasks.has('BED')?'床鋪已整理好。':'床單和枕頭套還沒整理。',this.run.objective]);
    }else if(action==='ward'){
      const ward=data.ward,event=this.run.activeEvent;
      if(stage==='ROUNDS'&&!this.run.tasks.has(`ROUND_${ward}`))this.show(`${ward}　晚間巡房`,['護理師拿出交班摘要，與你確認病人的近況。','病人：「醫師晚安。明天的安排，我白天再跟團隊討論就可以嗎？」','你停下來聽完，再把需要接續關注的事項記下。'],[['round','完成這區巡視與交班核對',()=>this.run.round(ward)]]);
      else if(event?.ward===ward&&event.status==='ACTIVE')this.assessment(ward);
      else this.show(`${ward}　病房`,['這裡是正常的病房巡視點。',this.run.objective]);
    }else if(action==='er-patient'){
      if(stage==='ER_ASSESS')this.assessment('急診');
      else this.show('急診留觀區',['護理師正在照顧到診病人。',this.run.objective]);
    }else if(action==='chart'){
      const event=this.run.activeEvent;
      if(event?.status==='ASSESSED'&&event.zone===this.router.activeZoneId)this.show('值班紀錄',[`${event.ward}｜${template(event.templateId).title}`,'記下到場確認、與護理師核對及接續交班事項。這是簡化的遊戲紀錄，不提供真實處方。'],[['document','完成紀錄並交回護理站',()=>this.run.document(this.router.activeZoneId)]]);
      else this.show('值班紀錄簿',['先完成到場確認，再留下紀錄。',this.run.objective]);
    }else if(action==='dinner'){
      if(stage==='DINNER')this.show('晚餐到了',[this.run.choices.meal==='vegetarian'?'護理師替你留了素食餐。':'護理師替你留了晚餐。','「先吃一點吧，等下不一定有空。」'],[['dinner','領取晚餐，回值班室',()=>this.run.dinner()]]);
      else this.show('晚餐代訂',['晚餐會由護理站代訂與留餐。',this.run.objective]);
    }
    return true;
  }
  setup(id,title,text) {
    if(this.run.stage!=='ROOM'||this.run.tasks.has(id))return this.show(title,['這項準備已確認。',this.run.objective]);
    this.show(title,[text],[['setup', '完成',()=>{if(this.run.setup(id))this.sound.playPaperSign();}]]);
  }
  assessment(ward) {
    const event=this.run.activeEvent,info=template(event.templateId);
    this.show(`${ward}｜${info.title}`,[info.message,'你已到場。接下來要先核對交班，還是先聽病人與護理師說明？'],[
      ['chart-first','先核對交班摘要',()=>this.assessmentEnd(ward,'chart_first')],
      ['nurse-first','先聽病人與護理師說明',()=>this.assessmentEnd(ward,'nurse_first')]
    ]);
  }
  assessmentEnd(ward,method) {
    this.show('共同確認與接續工作',[
      method==='chart_first'?'你先讀過交班重點，再與病人及護理師確認目前狀況。':'你先聽完病人的感受，再與護理師一起核對交班資訊。',
      '護理師：「了解，接續需要注意的事項我會交給同班同仁。也請醫師補上紀錄。」'
    ],[['assess','完成到場確認，準備補紀錄',()=>this.run.assess(ward,method)]]);
  }
  summary() {
    const misses=this.run.history.filter(h=>h.type==='phone_missed').length;
    this.show('21:00　第一幕完成',[
      '四區巡房、兩次病房來電、一次急診支援與紀錄都已完成。',
      this.run.rest.interrupted?'你睡了一會，又被急診電話叫醒。工作結束後，才重新回到這張床。':'你選擇保持清醒，接起急診電話，再回到值班室。',
      `未接來電 ${misses} 次，所有工作均已回覆與完成。`,
      '這只是正常值班的開場。後續傳說尚未啟用；本版停在這裡。'
    ],[['journal','查看值班紀錄',()=>this.journal()]],false);
  }
  syncZone() {
    const zone=this.router.activeZoneInstance;if(!zone||zone===this.currentZone)return;
    this.currentZone=zone;this.anchorInfo=[];this.staff=[];
    const root=new THREE.Group();root.name='NormalDutyGameplay';zone.zoneGroup.add(root);this.root=root;
    const add=(id,label,action,pos,ward=null)=>{
      // Desk-height, visible clipboard/handset targets. They add no architectural collider.
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(.32,.26,.08),new THREE.MeshStandardMaterial({color:action==='phone-check'?0x364c43:0xebe6d6,roughness:.8}));
      mesh.position.set(...pos);mesh.name=`NormalDuty/${id}`;
      mesh.userData={interactable:true,id,label,type:'normal_duty',action,ward};root.add(mesh);zone.interactables.push(mesh);
      this.anchorInfo.push({id,label,action,ward,position:pos});return mesh;
    };
    if(this.router.activeZoneId===F4){
      add('DUTY_STATION','與護理師報到／詢問','station',[8.75,1.3,2.1]);
      add('DUTY_CHART','值班紀錄簿','chart',[10.8,1.25,2.1]);
      add('DUTY_DINNER','護理站晚餐','dinner',[6.4,1.23,2.1]);
      add('DUTY_BAG','放置隨身物品','bag',[7.25,.9,-4.58]);
      add('DUTY_PHONE','確認／使用值班電話','phone-check',[7.8,.98,-4.33]);
      add('DUTY_BED','整理床鋪／休息／返回核對','bed',[3.8,.86,-6.25]);
      for(const room of zone.roomAreas||[])if(/^4[A-D]$/.test(room.id)){
        const pos=[room.point[0]+1.05,1.2,room.point[2]];
        add(`DUTY_ROUND_${room.id}`,`${room.id} 巡房／到場確認`,'ward',pos,room.id);
        const pole=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.15,8),zone.gf.materials.metal);pole.position.set(pos[0],.575,pos[2]);root.add(pole);
      }
    }
    if(this.router.activeZoneId===ER){
      add('DUTY_ER_PATIENT','急診新病人：共同確認','er-patient',[10.5,1.15,5.8]);
      add('DUTY_ER_CHART','急診值班紀錄簿','chart',[5.2,1.25,3.03]);
    }
    for(const person of NORMAL_STAFF.filter(p=>p.zone===this.router.activeZoneId)){
      const staff=new THREE.Group();staff.name=`NormalDutyStaff/${person.role}`;staff.position.set(...person.position);root.add(staff);
      const fabric=new THREE.MeshStandardMaterial({color:0x718e84,roughness:1}),skin=new THREE.MeshStandardMaterial({color:0xc7a78c,roughness:1}),hair=new THREE.MeshStandardMaterial({color:0x302b29,roughness:1});
      const torso=new THREE.Mesh(new THREE.CylinderGeometry(.16,.20,.50,12),fabric);torso.position.y=.88;staff.add(torso);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.125,16,12),skin);head.position.y=1.26;staff.add(head);
      const cap=new THREE.Mesh(new THREE.SphereGeometry(.128,16,8,0,Math.PI*2,0,Math.PI*.55),hair);cap.position.y=1.285;staff.add(cap);
      for(const x of [-.19,.19]){const arm=new THREE.Mesh(new THREE.CylinderGeometry(.048,.045,.42,10),fabric);arm.position.set(x,.85,.04);staff.add(arm);const hand=new THREE.Mesh(new THREE.SphereGeometry(.052,10,8),skin);hand.position.set(x,.65,.04);staff.add(hand);}
      this.staff.push({mesh:staff,until:person.until});
    }
    root.updateMatrixWorld(true);this.save();
  }
  ringTone() {
    const ctx=this.sound.ctx;if(!ctx||this.sound.isMuted||ctx.state!=='running')return;
    for(const delay of [0,.22]){
      const osc=ctx.createOscillator(),gain=ctx.createGain(),at=ctx.currentTime+delay;
      osc.type='sine';osc.frequency.value=660;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.035,at+.02);gain.gain.linearRampToValueAtTime(0,at+.14);
      osc.connect(gain);gain.connect(ctx.destination);osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+.16);
    }
  }
  update(delta) {
    this.syncZone();
    if(this.started&&this.run.stage==='HANDOFF'&&this.gs.areRequiredTasksComplete())this.run.finishHandoff();
    const paused=!this.started||this.modalOpen||this.legacyModal()||document.hidden;
    const wasRest=this.run.rest.sleeping||this.run.rest.waiting;
    this.run.tick(delta,paused);this.gs.fatigue=this.run.fatigue;
    if(wasRest&&!this.run.rest.sleeping&&!this.run.rest.waiting){this.controller.enabled=true;this.ui.showSubtitle('值班電話','急診護理師來電。按 P 接聽。',6000);}
    if(!paused&&(this.run.rest.sleeping||this.run.rest.waiting))this.controller.enabled=false;
    const now=performance.now();
    if(!paused&&this.run.phone.call?.status==='RINGING'&&now-this.lastRing>2400){this.lastRing=now;this.ringTone();}
    for(const staff of this.staff||[])staff.mesh.visible=this.run.clock.minutes<staff.until;
    if(this.started&&(this.lastRevision!==this.run.revision||now-this.lastSave>5000))this.save();
    this.render();
  }
  render() {
    document.querySelector('.hud-time').textContent=`${this.run.clock.text} ｜ 第一線值班：李住院醫師`;
    document.getElementById('task-panel').hidden=this.run.stage!=='HANDOFF';
    this.hud.hidden=!this.started;this.objective.textContent=this.run.objective;
    const call=this.run.phone.call;
    this.phoneHint.textContent=call&&['RINGING','MISSED'].includes(call.status)?`${call.status==='MISSED'?'未接，請回撥':'來電'}：${call.source}護理站　[P]`:'P 電話　J 工作紀錄　Esc 暫停';
    this.phoneHint.classList.toggle('ringing',call?.status==='RINGING');
    this.sleepLayer.hidden=!this.run.rest.sleeping&&!this.run.rest.waiting;
    this.sleepLayer.querySelector('h2').textContent=this.run.rest.sleeping?'短暫休息':'清醒待命';
    this.sleepLayer.querySelector('p').textContent=this.run.rest.sleeping?`${this.run.clock.text}　電話仍然開著。`:`${this.run.clock.text}　你坐在床邊等待下一通電話。`;
  }
  save() {
    if(!this.started||!this.router.activeZoneId)return;
    const zone=this.router.activeZoneInstance;
    const data={run:this.run.snapshot(),inventory:[...this.gs.completedTasks],world:{zone:this.router.activeZoneId,position:this.controller.position.toArray(),yaw:this.controller.yaw,
      wardClosed:zone.wardGateClosed??this.router.wardGateClosed,acuteClosed:zone.acuteGateClosed??this.router.acuteGateClosed,dutyClosed:zone.dutyDoorClosed??this.router.dutyDoorClosed}};
    try{localStorage.setItem(SAVE_KEY,JSON.stringify(data));this.saveError=false;}catch{this.saveError=true;}
    this.lastSave=performance.now();this.lastRevision=this.run.revision;
  }
  resume(saved) {
    try{
      this.run=NormalDutyRun.restore(saved.run);
      this.gs.completedTasks=new Set(saved.inventory);for(const id of saved.inventory)this.gs.flags.set(id,true);this.gs.duty=this.gs.completedTasks.size;this.gs.notify('task_completed');
      const w=saved.world;this.router.wardGateClosed=w.wardClosed;this.router.acuteGateClosed=w.acuteClosed;this.router.dutyDoorClosed=w.dutyClosed;
      this.router.loadZone(w.zone);const p=w.position;
      if(p?.length===3&&p.every(Number.isFinite)&&!this.controller.checkCollision(p[0],p[2])&&this.controller.supportedHeight(p[0],p[2])!==null)this.controller.teleport(...p,w.yaw||0);
      this.started=true;this.sound.init();if(this.run.stage==='COMPLETE')this.summary();
    }catch{this.show('無法讀取這份存檔',['存檔版本或內容不完整，尚未覆寫原存檔。請開始新的值班。'],[['start','開始新的值班',()=>{this.run=new NormalDutyRun();this.started=true;this.sound.init();}]],false);}
  }
}
