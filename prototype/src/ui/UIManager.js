// UIManager.js - Handles HUD, HIS computer terminal, Duty Log, and Elevator transition
import { soundManager } from '../audio/SoundManager.js';
import { persistentMemory } from '../core/PersistentMemory.js';

export class UIManager {
  constructor(gameState, onTerminalClose, onElevatorTransitionComplete) {
    this.gameState = gameState;
    this.onTerminalClose = onTerminalClose;
    this.onElevatorTransitionComplete = onElevatorTransitionComplete;

    this.promptEl = document.getElementById('interaction-prompt');
    this.crosshairEl = document.getElementById('crosshair');
    this.subtitleEl = document.getElementById('subtitle-box');
    this.subtitleSpeakerEl = document.getElementById('subtitle-speaker');
    this.subtitleTextEl = document.getElementById('subtitle-text');
    this.workstationModal = document.getElementById('workstation-modal');
    this.dutyLogModal = document.getElementById('dutylog-modal');
    this.archiveModal = document.getElementById('archive-modal');
    this.posterModal = document.getElementById('poster-modal');
    this.posterTitleEl = document.getElementById('poster-title');
    this.posterCategoryEl = document.getElementById('poster-category');
    this.posterImageEl = document.getElementById('poster-image');
    this.posterCommentaryEl = document.getElementById('poster-commentary');
    this.lockerModal = document.getElementById('locker-modal');
    this.anomalyModal = document.getElementById('anomaly-modal');
    this.office302Modal = document.getElementById('office302-modal');
    this.inspect302Modal = document.getElementById('inspect302-modal');
    this.inspect302Board = document.getElementById('inspect302-board');
    this.inspect302Clue = document.getElementById('inspect302-clue');
    this.inspect302FocusTimer = null;
    this.journalModal = document.getElementById('journal-modal');
    this.bed33Modal = document.getElementById('bed33-modal');
    this.loopCutscene = document.getElementById('loop-cutscene');
    this.storyChoiceModal = document.getElementById('story-choice-modal');
    this.finalHandoffModal = document.getElementById('final-handoff-modal');
    this.finalSuccessModal = document.getElementById('final-success-modal');
    this.storyChoiceHandlers = null;
    this.finalHandoffHandler = null;
    this.bed33Handlers = null;
    this.loopCutsceneTimers = [];
    this.archiveTitleEl = document.getElementById('archive-document-title');
    this.archivePageEl = document.getElementById('archive-document-page');
    this.archiveIndicatorEl = document.getElementById('archive-page-indicator');
    this.archivePages = [];
    this.archivePageIndex = 0;
    this.elevatorCutscene = document.getElementById('elevator-cutscene');
    this.debugPanel = document.getElementById('debug-panel');
    this.timeEl = document.querySelector('.hud-time');

    this.initEvents();
    this.updateTasks();
    this.showInitialDialogue();

    this.gameState.addListener((evt) => {
      if (evt === 'task_completed') {
        this.updateTasks();
        this.updateDebug();
      }
      if (evt === 'time_changed') this.updateTime();
      if (evt === 'flag_changed') this.updateTasks();
      if (evt === 'loop_reset') {
        this.updateTasks();
        this.updateTime();
        this.closeAllTransientOverlays();
      }
    });
    this.updateTime();
  }

  initEvents() {
    const loginButton=document.getElementById('btn-his-login');
    loginButton?.addEventListener('click',()=>{
      const a=document.getElementById('his-account')?.value.trim();
      const p=document.getElementById('his-password')?.value;
      const hasCredentials=this.gameState.getFlag('HIS_CREDENTIALS');
      const ok=hasCredentials&&a==='night403'&&p==='QL1700';
      document.getElementById('his-login-status').textContent=!hasCredentials?'尚未取得今晚的系統帳密':ok?'登入成功｜可讀取夜班交班':'帳號或密碼錯誤';
      document.getElementById('his-handoff-content')?.classList.toggle('unlocked',ok);
      if(ok)this.gameState.setFlag('HIS_AUTHENTICATED',true);
      soundManager.playComputerBeep();
    });

    // Workstation sign & close button
    const btnSignHandoff = document.getElementById('btn-sign-handoff');
    if (btnSignHandoff) {
      btnSignHandoff.addEventListener('click', () => {
        if(!this.gameState.getFlag('HIS_AUTHENTICATED')){document.getElementById('his-login-status').textContent='請先用值班本上的帳密登入';return;}
        soundManager.playComputerBeep();
        this.gameState.markTaskComplete('E_HANDOFF');
        btnSignHandoff.disabled=true;
        btnSignHandoff.textContent='交班資料送出中…';
        document.querySelector('.his-system-msg').textContent='正在寫入夜間交班資料…';
        setTimeout(()=>{
          this.closeWorkstation();
          btnSignHandoff.disabled=false;
          btnSignHandoff.textContent='確認電子交班';
          document.querySelector('.his-system-msg').textContent='系統連線正常 ｜ 資料庫版本 2026.09.21-1700';
          this.showAnomalyMessage();
        },1200);
      });
    }

    const btnCloseTerminal = document.getElementById('btn-close-terminal');
    if (btnCloseTerminal) {
      btnCloseTerminal.addEventListener('click', () => {
        soundManager.playClick();
        this.closeWorkstation();
      });
    }

    // Duty log modal buttons
    const btnSignLog = document.getElementById('btn-sign-log');
    if (btnSignLog) {
      btnSignLog.addEventListener('click', () => {
        soundManager.playPaperSign();
        this.gameState.markTaskComplete('DUTY_LOG');
        this.closeDutyLog();
      });
    }

    const btnCloseLog = document.getElementById('btn-close-log');
    if (btnCloseLog) {
      btnCloseLog.addEventListener('click', () => {
        soundManager.playClick();
        this.closeDutyLog();
      });
    }

    document.getElementById('btn-close-archive')?.addEventListener('click',()=>this.closeArchiveDocument());
    document.getElementById('btn-close-poster')?.addEventListener('click',()=>this.closePoster());
    document.getElementById('btn-archive-prev')?.addEventListener('click',()=>{
      if(this.archivePageIndex>0){this.archivePageIndex--;this.renderArchivePage();soundManager.playClick();}
    });
    document.getElementById('btn-archive-next')?.addEventListener('click',()=>{
      if(this.archivePageIndex<this.archivePages.length-1){this.archivePageIndex++;this.renderArchivePage();soundManager.playPaperSign();}
    });

    document.getElementById('btn-close-locker')?.addEventListener('click',()=>this.closeLocker());
    document.getElementById('btn-unlock-locker')?.addEventListener('click',()=>{
      const value=document.getElementById('locker-code')?.value.trim();
      const status=document.getElementById('locker-status');
      if(value!=='1700'){status.textContent='紅燈閃爍：密碼錯誤';soundManager.playClick();return;}
      persistentMemory.learnCode('pass_1700');
      status.textContent='綠燈亮起：櫃門已解鎖';
      document.getElementById('locker-contents')?.classList.add('revealed');
      this.gameState.setFlag('LOCKER_OPENED',true);
      this.gameState.markTaskComplete('LOCKER_OPENED');
      this.gameState.markTaskComplete('KEY_PICKUP');
      window.worldRouter?.activeZoneInstance?.markLockerOpen?.();
      soundManager.playKeyPickup();
      this.updateTasks();
    });
    document.getElementById('btn-ack-anomaly')?.addEventListener('click',()=>this.acknowledgeAnomaly());

    document.getElementById('btn-close-302')?.addEventListener('click',()=>this.close302Keypad());
    document.getElementById('btn-unlock-302')?.addEventListener('click',()=>{
      const code=document.getElementById('office302-code')?.value.trim();
      const status=document.getElementById('office302-status');
      if(code!=='3082'){status.textContent='ACCESS DENIED';soundManager.playClick();return;}
      persistentMemory.learnCode('pass_3082');
      status.textContent='ACCESS GRANTED';
      this.gameState.setFlag('OFFICE_302_UNLOCKED',true);
      window.worldRouter?.activeZoneInstance?.unlock302?.();
      soundManager.playComputerBeep();
      setTimeout(()=>this.close302Keypad(),350);
    });
    document.getElementById('btn-close-inspect302')?.addEventListener('click',()=>this.close302Inspect());
    this.inspect302Board?.addEventListener('pointermove',(e)=>this.update302InspectParallax(e));
    this.inspect302Clue?.addEventListener('pointerenter',()=>this.begin302ClueFocus());
    this.inspect302Clue?.addEventListener('pointerleave',()=>this.cancel302ClueFocus());

    document.getElementById('btn-close-journal')?.addEventListener('click',()=>this.closeJournal());
    document.getElementById('btn-bed33-defer')?.addEventListener('click',()=>{
      this.closeBed33Assignment();
      this.bed33Handlers?.onDefer?.();
    });
    document.getElementById('btn-bed33-reject')?.addEventListener('click',()=>{
      this.closeBed33Assignment();
      this.bed33Handlers?.onReject?.();
    });
    document.getElementById('btn-bed33-confirm')?.addEventListener('click',()=>{
      this.closeBed33Assignment(false);
      this.bed33Handlers?.onConfirm?.();
    });
    document.getElementById('btn-loop-skip')?.addEventListener('click',()=>this.finishLoopCutscene());
    document.getElementById('btn-story-primary')?.addEventListener('click',()=>{
      const fn=this.storyChoiceHandlers?.primary;this.closeStoryChoice(false);fn?.();
    });
    document.getElementById('btn-story-secondary')?.addEventListener('click',()=>{
      const fn=this.storyChoiceHandlers?.secondary;this.closeStoryChoice(false);fn?.();
    });
    document.getElementById('btn-close-final-handoff')?.addEventListener('click',()=>this.closeFinalHandoff());
    document.getElementById('btn-submit-final-handoff')?.addEventListener('click',()=>{
      const name=document.getElementById('final-true-name')?.value.trim()||'';
      const employeeId=document.getElementById('final-employee-id')?.value.trim()||'';
      this.finalHandoffHandler?.({name,employeeId});
    });

    // Debug toggle with Backquote (~)
    document.addEventListener('keydown', (e) => {
      if(e.code==='Tab'){
        e.preventDefault();
        if(this.journalModal?.classList.contains('active'))this.closeJournal();
        else this.openJournal();
        return;
      }
      if (e.code === 'Backquote' && (import.meta.env.DEV || new URLSearchParams(location.search).get('debug') === '1')) {
        this.toggleDebug();
      }
      if(e.code==='Space'&&this.inspect302Modal?.classList.contains('active')){
        e.preventDefault();this.close302Inspect();return;
      }
      if (e.code === 'Escape') {
        if(this.elevatorCutscene.dataset.selecting==='true')this.closeTravelSelector();
        if (this.workstationModal.classList.contains('active')) {
          this.closeWorkstation();
        }
        if (this.dutyLogModal.classList.contains('active')) {
          this.closeDutyLog();
        }
        if (this.archiveModal?.classList.contains('active')) this.closeArchiveDocument();
        if (this.posterModal?.classList.contains('active')) this.closePoster();
        if (this.lockerModal?.classList.contains('active')) this.closeLocker();
        if (this.office302Modal?.classList.contains('active')) this.close302Keypad();
        if (this.inspect302Modal?.classList.contains('active')) this.close302Inspect();
        if (this.anomalyModal?.classList.contains('active')) this.acknowledgeAnomaly();
        if (this.journalModal?.classList.contains('active')) this.closeJournal();
        if (this.bed33Modal?.classList.contains('active')) this.closeBed33Assignment();
        if (this.storyChoiceModal?.classList.contains('active')) this.closeStoryChoice();
        if (this.finalHandoffModal?.classList.contains('active')) this.closeFinalHandoff();
      }
    });
  }

  showPrompt(text) {
    if (text) {
      this.promptEl.textContent = text;
      this.promptEl.style.display = 'block';
      this.crosshairEl.classList.add('active');
    } else {
      this.promptEl.style.display = 'none';
      this.crosshairEl.classList.remove('active');
    }
  }

  showSubtitle(speaker, text, duration = 6500) {
    this.subtitleSpeakerEl.textContent = speaker;
    this.subtitleTextEl.textContent = text;
    this.subtitleEl.classList.add('visible');

    if (this.subtitleTimer) clearTimeout(this.subtitleTimer);
    this.subtitleTimer = setTimeout(() => {
      this.subtitleEl.classList.remove('visible');
    }, duration);
  }

  showInitialDialogue() {
    setTimeout(() => {
      if(persistentMemory.data.loopCount>0){
        this.showSubtitle('李醫師','「……又是這裡。316、1700、3082。我記得。」',3600);
        return;
      }
      this.showSubtitle(
        '學長 (資深住院醫師)',
        '「我先走了，先把 316 鎖了，自己想辦法進去把今晚的交班做完吧，值班交給你了。」\n「有問題就去警衛查哨點看看。」',
        7800
      );
    }, 1200);
  }

  openWorkstation() {
    document.exitPointerLock();
    soundManager.playComputerBeep();
    if(this.gameState.getFlag('HIS_CREDENTIALS')){
      const a=document.getElementById('his-account'),p=document.getElementById('his-password');
      if(a)a.value='night403';
      if(p)p.value='QL1700';
      this.gameState.setFlag('HIS_AUTHENTICATED',true);
      document.getElementById('his-login-status').textContent='憑證已讀取｜登入成功';
      document.getElementById('his-handoff-content')?.classList.add('unlocked');
    }else{
      this.gameState.setFlag('HIS_AUTHENTICATED',false);
      document.getElementById('his-login-status').textContent='尚未取得今晚的系統帳密';
      document.getElementById('his-handoff-content')?.classList.remove('unlocked');
    }
    this.workstationModal.classList.add('active');
  }

  closeWorkstation() {
    this.workstationModal.classList.remove('active');
    if (this.onTerminalClose) this.onTerminalClose();
  }

  openDutyLog() {
    document.exitPointerLock();
    soundManager.playClick();
    this.dutyLogModal.classList.add('active');
  }

  closeDutyLog() {
    this.dutyLogModal.classList.remove('active');
    if (this.onTerminalClose) this.onTerminalClose();
  }

  openLocker() {
    document.exitPointerLock();
    const opened=this.gameState.getFlag('LOCKER_OPENED');
    const contents=document.getElementById('locker-contents');
    contents?.classList.toggle('revealed',opened);
    document.getElementById('locker-status').textContent=opened?'櫃門已解鎖｜可再次查看值班物品':'櫃門鎖定中';
    const input=document.getElementById('locker-code');
    if(input&&!opened&&persistentMemory.data.knownCodes.pass_1700)input.value='1700';
    this.lockerModal?.classList.add('active');
  }

  closeLocker() {
    this.lockerModal?.classList.remove('active');
    this.onTerminalClose?.();
  }

  showAnomalyMessage() {
    document.exitPointerLock();
    this.gameState.setFlag('ARCHIVE_OBJECTIVE',true);
    this.gameState.setFlag('HIS_ANOMALY_SEEN',true);
    this.gameState.setFlag('ANNE_STAGE',1);
    const firstMessage=persistentMemory.claimOnce('unregisteredMessage3F');
    const handoffTitle=this.anomalyModal?.querySelector('h2');
    if(handoffTitle&&(!firstMessage||!persistentMemory.claimHandoffAcknowledgement()))handoffTitle.textContent='未註冊訊息';
    if(!firstMessage){
      const paragraphs=this.anomalyModal?.querySelectorAll('.anomaly-window p');
      if(paragraphs?.length)paragraphs[0].textContent='你記得先前也看過一則訊息，但內容已不再顯示。';
    }
    document.body.classList.add('his-flicker');
    setTimeout(()=>document.body.classList.remove('his-flicker'),460);
    const win=this.anomalyModal?.querySelector('.anomaly-window');
    win?.classList.remove('anomaly-typing');
    void win?.offsetWidth;
    win?.classList.add('anomaly-typing');
    this.anomalyModal?.classList.add('active');
    soundManager.playComputerBeep();
    this.updateTasks();
  }

  acknowledgeAnomaly() {
    if(!this.anomalyModal?.classList.contains('active'))return;
    this.gameState.setFlag('ANOMALY_ACKNOWLEDGED',true);
    this.anomalyModal.classList.remove('active');
    this.updateTasks();
    this.onTerminalClose?.();
    if(!this.gameState.getFlag('PHONE_ANSWERED')&&!this.gameState.getFlag('PHONE_RING_ACTIVE')){
      setTimeout(()=>{
        this.gameState.setFlag('PHONE_RING_ACTIVE',true);
        soundManager.playPhoneRingPattern();
      },2000);
    }
  }

  open302Inspect() {
    document.exitPointerLock();
    this.inspect302Modal?.classList.add('active');
    if(this.inspect302Clue){
      this.inspect302Clue.classList.toggle('found',this.gameState.getFlag('FOUND_302_CODE'));
      this.inspect302Clue.classList.remove('focused');
    }
  }

  update302InspectParallax(e) {
    if(!this.inspect302Board)return;
    const rect=this.inspect302Board.getBoundingClientRect();
    const nx=((e.clientX-rect.left)/rect.width-.5),ny=((e.clientY-rect.top)/rect.height-.5);
    this.inspect302Board.style.transform=`rotateY(${nx*8}deg) rotateX(${-ny*5}deg) translate3d(${nx*6}px,${ny*4}px,0)`;
    const glare=this.inspect302Board.querySelector('.inspect302-glare');
    if(glare)glare.style.transform=`translateX(${-32+nx*58}%)`;
  }

  begin302ClueFocus() {
    this.inspect302Clue?.classList.add('focused');
    if(this.gameState.getFlag('FOUND_302_CODE'))return;
    clearTimeout(this.inspect302FocusTimer);
    this.inspect302FocusTimer=setTimeout(()=>{
      this.gameState.setFlag('FOUND_302_CODE',true);
      this.inspect302Clue?.classList.add('found');
      this.showSubtitle('李醫師','「……3082 嗎？」',2300);
    },1000);
  }

  cancel302ClueFocus() {
    clearTimeout(this.inspect302FocusTimer);
    if(!this.gameState.getFlag('FOUND_302_CODE'))this.inspect302Clue?.classList.remove('focused');
  }

  close302Inspect() {
    clearTimeout(this.inspect302FocusTimer);
    this.inspect302Modal?.classList.remove('active');
    if(this.inspect302Board)this.inspect302Board.style.transform='';
    this.onTerminalClose?.();
  }

  open302Keypad() {
    document.exitPointerLock();
    const input=document.getElementById('office302-code');
    if(input&&persistentMemory.data.knownCodes.pass_3082)input.value='3082';
    this.office302Modal?.classList.add('active');
  }

  close302Keypad() {
    this.office302Modal?.classList.remove('active');
    this.onTerminalClose?.();
  }

  openArchiveDocument(documentData) {
    document.exitPointerLock();
    this.archivePages = documentData.pages || [''];
    this.archivePageIndex = 0;
    this.archiveTitleEl.textContent = documentData.title || '院內文件';
    this.archiveModal.classList.add('active');
    this.renderArchivePage();
    soundManager.playPaperSign();
  }

  renderArchivePage() {
    if(!this.archivePageEl)return;
    this.archivePageEl.textContent = this.archivePages[this.archivePageIndex] || '';
    this.archiveIndicatorEl.textContent = `${this.archivePageIndex+1} / ${Math.max(1,this.archivePages.length)}`;
    document.getElementById('btn-archive-prev').disabled=this.archivePageIndex===0;
    document.getElementById('btn-archive-next').disabled=this.archivePageIndex>=this.archivePages.length-1;
  }

  closeArchiveDocument() {
    this.archiveModal?.classList.remove('active');
    if(this.onTerminalClose)this.onTerminalClose();
  }

  openPoster(posterData) {
    if(!posterData||!this.posterModal)return;
    document.exitPointerLock();
    if(this.posterTitleEl)this.posterTitleEl.textContent=posterData.title||'院內年代海報';
    if(this.posterCategoryEl){
      const label={TRUE_CLUE:'院內年代資料｜可能是真線索',AMBIGUOUS:'院內年代資料｜內容待判讀',FALSE_CLUE:'院內年代資料｜可能是體制性誤導'}[posterData.category]||'院內年代資料';
      this.posterCategoryEl.textContent=label;
    }
    if(this.posterImageEl){
      const base=import.meta.env?.BASE_URL ?? '/';
      this.posterImageEl.src=base+(posterData.inspectTexture||posterData.displayTexture||'').replace(/^\//,'');
      this.posterImageEl.alt=posterData.title||'院內年代海報';
    }
    if(this.posterCommentaryEl){
      this.posterCommentaryEl.textContent=posterData.commentary||'';
      this.posterCommentaryEl.style.display=posterData.commentary?'block':'none';
    }
    this.posterModal.classList.add('active');
    soundManager.playPaperSign();
  }

  closePoster() {
    this.posterModal?.classList.remove('active');
    if(this.posterImageEl)this.posterImageEl.removeAttribute('src');
    this.onTerminalClose?.();
  }

  setBed33Handlers(handlers){this.bed33Handlers=handlers;}

  openJournal(){
    document.exitPointerLock();
    const notes=document.getElementById('journal-notes');
    const count=document.getElementById('journal-loop-count');
    if(count)count.textContent=persistentMemory.data.loopCount===0?'這是第一次值班。':`已經回到這個夜班 ${persistentMemory.data.loopCount} 次。`;
    if(notes){
      notes.replaceChildren();
      if(!persistentMemory.data.journalNotes.length){
        const empty=document.createElement('div');empty.className='journal-empty';empty.textContent='除了印好的醫療換算表，沒有其他筆記。';notes.appendChild(empty);
      }else{
        for(const item of persistentMemory.data.journalNotes){
          const row=document.createElement('div');row.className='journal-note';row.textContent=item.text;notes.appendChild(row);
        }
      }
    }
    this.journalModal?.classList.add('active');
  }

  closeJournal(){
    this.journalModal?.classList.remove('active');
    this.onTerminalClose?.();
  }

  openBed33Assignment({canReject=false,rememberedRule=false}={}){
    document.exitPointerLock();
    const reject=document.getElementById('btn-bed33-reject');
    if(reject)reject.hidden=false;
    const defer=document.getElementById('btn-bed33-defer');
    if(defer)defer.hidden=true;
    const warning=document.getElementById('bed33-warning-text');
    if(warning)warning.textContent='急診留置床系統卡住，請值班醫師確認過床。';
    this.bed33Modal?.classList.add('active');
  }

  closeBed33Assignment(resume=true){
    this.bed33Modal?.classList.remove('active');
    if(resume)this.onTerminalClose?.();
  }

  playLegendOverride({legend='LEGEND OVERRIDE',reason='你已被重新分類。'}={},onComplete){
    document.exitPointerLock();
    this.loopOverrideComplete=onComplete;
    for(const t of this.loopCutsceneTimers)clearTimeout(t);
    this.loopCutsceneTimers=[];
    const title=document.getElementById('loop-stage-title');
    const body=document.getElementById('loop-stage-body');
    const band=document.getElementById('loop-wristband');
    const card=document.getElementById('loop-gameover-card');
    title.textContent='IDENTITY OVERRIDE';
    body.textContent='系統正在重新分類你的身分。';
    band?.classList.remove('visible');card?.classList.remove('visible');
    if(card){
      card.querySelector('strong').textContent=legend;
      card.querySelector('span').textContent=reason;
    }
    this.loopCutscene?.classList.add('active');

    const later=(ms,fn)=>this.loopCutsceneTimers.push(setTimeout(fn,ms));
    later(900,()=>{title.textContent='';body.textContent='日光燈一格一格從視野上方滑過。\n推車輪子壓過地磚，發出規律的咕嚕聲。';});
    later(2500,()=>{band?.classList.add('visible');body.textContent='你的 Staff Card 被拿走，病人手圈套上手腕。\n「33床新收案，自稱是今晚的值班醫師。」';});
    later(4400,()=>{body.textContent='「身分認知混亂，先執行保護性處置。」\n皮帶扣環一個接一個拉緊。';});
    later(6100,()=>{body.textContent='門口站著另一個穿白袍的「李醫師」。\n護理師說：「33床一直說自己才是值班醫師。」\n他只回答：「我知道。」';});
    later(7900,()=>{title.textContent='';body.textContent='視線開始模糊。白噪音蓋過所有聲音。';});
    later(9300,()=>{body.textContent='';card?.classList.add('visible');});
    later(11300,()=>this.finishLoopCutscene());
  }

  finishLoopCutscene(){
    if(!this.loopCutscene?.classList.contains('active'))return;
    for(const t of this.loopCutsceneTimers)clearTimeout(t);
    this.loopCutsceneTimers=[];
    this.loopCutscene.classList.remove('active');
    const cb=this.loopOverrideComplete;this.loopOverrideComplete=null;
    cb?.();
  }

  openStoryChoice({title,body,primaryText='確認',secondaryText='暫緩',onPrimary,onSecondary}){
    document.exitPointerLock();
    document.getElementById('story-choice-title').textContent=title;
    document.getElementById('story-choice-body').textContent=body;
    document.getElementById('btn-story-primary').textContent=primaryText;
    document.getElementById('btn-story-secondary').textContent=secondaryText;
    this.storyChoiceHandlers={primary:onPrimary,secondary:onSecondary};
    this.storyChoiceModal?.classList.add('active');
  }

  closeStoryChoice(resume=true){
    this.storyChoiceModal?.classList.remove('active');
    this.storyChoiceHandlers=null;
    if(resume)this.onTerminalClose?.();
  }

  openFinalHandoff(handler){
    document.exitPointerLock();
    this.finalHandoffHandler=handler;
    const input=document.getElementById('final-true-name');if(input)input.value='';
    const employeeId=document.getElementById('final-employee-id');if(employeeId)employeeId.value='';
    document.getElementById('final-handoff-status').textContent='IDENTITY VERIFICATION REQUIRED';
    this.finalHandoffModal?.classList.add('active');
  }

  setFinalHandoffStatus(text){const el=document.getElementById('final-handoff-status');if(el)el.textContent=text;}

  closeFinalHandoff(resume=true){
    this.finalHandoffModal?.classList.remove('active');this.finalHandoffHandler=null;if(resume)this.onTerminalClose?.();
  }

  showFinalSuccess(name){
    this.finalHandoffModal?.classList.remove('active');
    const last=this.finalSuccessModal?.querySelector('.anomaly-last');if(last)last.textContent=`你第一次記得自己的名字：${name}。`;
    this.finalSuccessModal?.classList.add('active');
  }

  closeAllTransientOverlays(){
    document.querySelectorAll('.modal-overlay.active,.cutscene-overlay.active').forEach(el=>el.classList.remove('active'));
  }

  resetAfterLoop(){
    document.getElementById('locker-contents')?.classList.remove('revealed');
    const locker=document.getElementById('locker-code');if(locker)locker.value='';
    const code302=document.getElementById('office302-code');if(code302)code302.value='';
    const hisA=document.getElementById('his-account');if(hisA)hisA.value='';
    const hisP=document.getElementById('his-password');if(hisP)hisP.value='';
    document.getElementById('his-handoff-content')?.classList.remove('unlocked');
    this.updateTasks();this.updateTime();
  }

  showLoopWakeup(loopCount){
    const el=document.getElementById('loop-wake-flash');
    el?.classList.remove('active');void el?.offsetWidth;el?.classList.add('active');
    setTimeout(()=>this.showSubtitle('學長 (資深住院醫師)','「李醫師？發什麼呆，我先走了……」',3600),850);
    setTimeout(()=>this.showSubtitle('李醫師',`「手腕……這不是夢。這已經是第 ${loopCount+1} 次了。」`,4200),4200);
  }

  openTravelSelector(destinations, currentZone, onSelect, kind = 'elevator') {
    document.exitPointerLock();
    this.elevatorCutscene.dataset.selecting = 'true';
    this.elevatorCutscene.dataset.travelling = 'false';
    this.elevatorCutscene.querySelector('.floor-arrow').textContent = '↕';
    this.elevatorCutscene.classList.add('active');

    const isStairs = kind === 'stairs';
    this.elevatorCutscene.querySelector('.floor-digit').textContent = isStairs ? '樓梯' : '電梯';

    const info = document.getElementById('elevator-status-text');
    info.replaceChildren();

    const titleBox = document.createElement('div');
    titleBox.style.marginBottom = '12px';

    const header = document.createElement('h2');
    header.style.color = '#79d2a6';
    header.style.margin = '0 0 6px 0';
    header.textContent = isStairs ? '安全梯' : '電梯';
    titleBox.appendChild(header);

    // Current floor number parsing
    const curFloorMatch = currentZone.match(/_([0-9])f/);
    const curFloor = curFloorMatch ? Number(curFloorMatch[1]) : (currentZone === 'first_campus_3f' ? 3 : 0);

    const locText = document.createElement('p');
    locText.style.color = '#a0b4aa';
    locText.style.fontSize = '14px';
    locText.style.margin = '0';
    const curLocLabel = window.worldRouter?.zoneLabels?.[currentZone] || currentZone;
    locText.textContent = `目前所在位置：${curLocLabel.replace(/^[0-9]+[.] /, '').split(' (M')[0]}`;
    titleBox.appendChild(locText);
    info.appendChild(titleBox);

    const btnGrid = document.createElement('div');
    btnGrid.style.display = 'flex';
    btnGrid.style.flexDirection = 'column';
    btnGrid.style.gap = '8px';
    btnGrid.style.margin = '14px 0';

    for (const destination of [...destinations].sort((a,b) => b.floorNum-a.floorNum)) {
      const destFloor = destination.floorNum || Number(destination.zoneId.match(/_([0-9])f/)?.[1] || 0);
      const isCurrent = destination.zoneId === currentZone;

      let directionBadge = '';
      if (isCurrent) {
        directionBadge = '【目前樓層】';
      } else if (destFloor > curFloor && curFloor > 0) {
        directionBadge = '▲ 上樓';
      } else if (destFloor < curFloor && curFloor > 0) {
        directionBadge = '▼ 下樓';
      }

      const button = document.createElement('button');
      button.className = 'btn-primary';
      button.dataset.floor = destination.zoneId;
      button.style.display = 'flex';
      button.style.justifyContent = 'space-between';
      button.style.alignItems = 'center';
      button.style.padding = '8px 16px';
      button.style.fontSize = '14px';

      // Mission gating: 4F is special scene requiring 3F duty tasks
      let isLocked = false;
      if (destination.zoneId === 'first_campus_4f' && !isCurrent) {
        if (!this.gameState.areRequiredTasksComplete()) {
          isLocked = true;
        }
      }

      if (isLocked) {
        button.innerHTML = `<span>🔒 ${destination.label}</span> <span style="font-size:12px;color:#e89078;">需先完成 3F 交班手續</span>`;
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
      } else {
        button.innerHTML = `<span>${destination.label}</span> <span style="font-size:12px;color:#79d2a6;">${directionBadge}</span>`;
        button.disabled = isCurrent;
        if (isCurrent) {
          button.style.opacity = '0.6';
          button.style.cursor = 'default';
        } else {
          button.addEventListener('click', () => {
            this.runTravelTransition(destination,curFloor,onSelect,kind);
          });
        }
      }
      btnGrid.appendChild(button);
    }
    info.appendChild(btnGrid);

    const cancel = document.createElement('button');
    cancel.id = 'btn-cancel-travel';
    cancel.className = 'btn-secondary';
    cancel.textContent = '關閉 / 取消 (Esc)';
    cancel.style.marginTop = '6px';
    cancel.addEventListener('click', () => this.closeTravelSelector());
    info.appendChild(cancel);
  }

  runTravelTransition(destination,fromFloor,onSelect,kind) {
    if(this.elevatorCutscene.dataset.travelling==='true')return;
    this.elevatorCutscene.dataset.selecting='false';
    this.elevatorCutscene.dataset.travelling='true';
    const up=destination.floorNum>fromFloor;
    this.elevatorCutscene.querySelector('.floor-arrow').textContent=up?'▲':'▼';
    this.elevatorCutscene.querySelector('.floor-digit').textContent=up?'上行':'下行';
    const statusEl=document.getElementById('elevator-status-text');
    statusEl.textContent=`${kind==='stairs'?'安全梯':'電梯'} ${fromFloor}F → ${destination.floorNum}F`;
    if(kind==='stairs')soundManager.playClick();else soundManager.playElevatorMotor();
    const glitch=kind!=='stairs'&&fromFloor===3&&destination.floorNum===4&&this.gameState.isTaskComplete('ARCHIVE_CLUE_FOUND');
    if(glitch){
      const digit=this.elevatorCutscene.querySelector('.floor-digit');
      const seq=['3','2','1','B1','B2','4'];
      seq.forEach((v,i)=>setTimeout(()=>{digit.textContent=v;},260+i*250));
      setTimeout(()=>{statusEl.textContent='電梯 3F → 4F';},1650);
    }
    this.travelTimer=setTimeout(()=>{
      try {onSelect(destination);soundManager.playElevatorChime();}
      finally {this.elevatorCutscene.dataset.travelling='false';this.closeTravelSelector();}
    },kind==='stairs'?1100:(glitch?2100:1700));
  }

  runDoorTransition(onArrival) {
    document.exitPointerLock();
    this.elevatorCutscene.dataset.selecting='false';
    this.elevatorCutscene.dataset.travelling='true';
    this.elevatorCutscene.classList.add('active');
    this.elevatorCutscene.querySelector('.floor-arrow').textContent='';
    this.elevatorCutscene.querySelector('.floor-digit').textContent='感應通過';
    document.getElementById('elevator-status-text').textContent='門禁確認中';
    soundManager.playClick();
    this.travelTimer=setTimeout(()=>{
      try {onArrival();}
      finally {this.elevatorCutscene.dataset.travelling='false';this.closeTravelSelector();}
    },650);
  }

  closeTravelSelector() {
    if(this.elevatorCutscene.dataset.travelling==='true')return;
    this.elevatorCutscene.dataset.selecting = 'false';
    this.elevatorCutscene.classList.remove('active');
    this.onElevatorTransitionComplete?.();
  }

  triggerElevatorTransition(onComplete) {
    document.exitPointerLock();
    soundManager.playElevatorChime();
    this.elevatorCutscene.classList.add('active');

    setTimeout(() => {
      soundManager.playElevatorMotor();
    }, 800);

    setTimeout(() => {
      soundManager.playElevatorChime();
      const infoEl = document.getElementById('elevator-status-text');
      infoEl.innerHTML = [
        '<div class="arrival-badge">4F 病房區抵達</div>',
        '<h2>交班完成，夜班正式開始</h2>',
        '<ul class="milestone-list">',
        '  <li>下一步：前往護理站確認病房狀態與晚餐代訂。</li>',
        '  <li>再前往值班室放置個人物品，準備晚間巡房。</li>',
        '  <li>後續將進入第一幕病房探索與護理站互動。</li>',
        '</ul>',
        '<button id="btn-continue-explore" class="btn-primary" style="margin-top:20px;">返回 3F 繼續測試</button>'
      ].join('');

      const btnContinue = document.getElementById('btn-continue-explore');
      if (btnContinue) {
        btnContinue.addEventListener('click', () => {
          this.elevatorCutscene.classList.remove('active');
          if (onComplete) onComplete();
        });
      }
    }, 3600);
  }

  updateTime() {
    if (this.timeEl) this.timeEl.textContent = `${this.gameState.getDisplayTime?.()||this.gameState.gameTime} ｜ 第一線值班：李住院醫師`;
  }

  renderTaskBoard(header, items) {
    const panel=document.getElementById('task-panel');
    panel?.classList.remove('no-guidance');
    const headerEl = document.querySelector('#task-panel .task-header');
    const listEl = document.querySelector('#task-panel .task-list');
    if (!headerEl || !listEl) return;
    headerEl.textContent = header;
    listEl.replaceChildren();

    for (const item of items) {
      const row = document.createElement('div');
      row.id = item.id;
      row.className = `task-item ${item.state}`;
      const box = document.createElement('span');
      box.className = 'status-box';
      const label = document.createElement('span');
      label.className = 'task-text';
      label.textContent = item.text;
      row.append(box, label);
      listEl.appendChild(row);
    }
  }

  updateTasks() {
    const done = (id) => this.gameState.isTaskComplete(id);
    const sequential = (defs) => {
      let unlocked = true;
      return defs.map((item) => {
        const isDone = done(item.task);
        const state = isDone ? 'completed' : unlocked ? 'ready' : 'locked';
        if (!isDone) unlocked = false;
        return { id:item.id, text:item.text, state };
      });
    };

    const opened316=this.gameState.getFlag('OPENED_316');
    const currentZone=window.worldRouter?.activeZoneId || '';

    if(this.gameState.getFlag('PHONE_RING_ACTIVE')&&['ER_JANE_2005','NIGHT_PATROL_2115','ER_GHOST_0033','FAST_PATH_316'].includes(this.gameState.getFlag('PHONE_CALL_KIND'))){
      this.renderTaskBoard('',[]);
      return;
    }

    if(this.gameState.getFlag('FAST_PATH_3F')&&!this.gameState.getFlag('FAST_PATH_316_CALL_DONE')){
      this.renderTaskBoard('回溯後的值班',[
        {id:'task-fastpath-316',text:'進入 316，取得感應卡與 4F 值班室鑰匙',state:'ready'}
      ]);
      return;
    }

    if(!done('WARD_ENTRY')){
      const panel=document.getElementById('task-panel');
      if(this.gameState.getFlag('HIS_ANOMALY_SEEN')){
        panel?.classList.add('no-guidance');
        return;
      }
      if(!opened316){
        this.renderTaskBoard('目前',[
          {id:'task-current',text:'想辦法進入 316 總醫師辦公室',state:'ready'}
        ]);
        return;
      }
      if(!done('E_HANDOFF')){
        this.renderTaskBoard('目前',[
          {id:'task-current',text:'完成今晚的電子交班',state:'ready'}
        ]);
        return;
      }
    }

    if(this.gameState.getFlag('NIGHT_PATROL_RETURN_3F')&&!this.gameState.getFlag('BOOTSTRAP_2117_RESOLVED')){
      if(currentZone==='first_campus_3f'){
        const examined=this.gameState.getFlag('GUARD_SIGN_EXAMINED');
        this.renderTaskBoard('21:17｜3F',[
          {id:'task-night-patrol',text:examined?'查看查哨簽名簿':'去警衛查哨點看看',state:'ready'}
        ]);
      }else{
        this.renderTaskBoard('21:15｜護理站來電',[
          {id:'task-night-return',text:'回 3F 一趟',state:'ready'}
        ]);
      }
      return;
    }

    if(this.gameState.getFlag('BOOTSTRAP_2117_RESOLVED')){
      if(!this.gameState.getFlag('POST_2117_DUTY_CALL_DONE')){
        const triggered=this.gameState.getFlag('POST_2117_DUTY_ROOM_TRIGGERED');
        const at4F=currentZone==='first_campus_4f';
        this.renderTaskBoard(triggered?'23:55｜值班室｜異常正在逼近':'21:17 之後｜回值班室',[
          {
            id:'task-post2117-duty',
            text:this.gameState.getFlag('PHONE_RING_ACTIVE')?'接聽值班室電話':(triggered?'把「21:17／316／409」寫進值班紀錄；不要離開，值班電話即將響起':(at4F?'立刻進入值班室；一進門就會觸發下一段事件':'立刻返回 4F 值班室；不要在院區漫遊')),
            state:'ready'
          }
        ]);
      }else if(this.gameState.getFlag('GHOST_REGISTRATION_AVAILABLE')&&!this.gameState.getFlag('ER0033_SLIP_COLLECTED')){
        this.renderTaskBoard('翌日 00:33｜急診掛號異常',[
          {id:'task-post2117-er',text:'前往 2F 急診查看異常掛號紀錄',state:'ready'}
        ]);
      }else if(this.gameState.getFlag('ER0033_SLIP_COLLECTED')&&!this.gameState.getFlag('M3_316_DECODED')){
        this.renderTaskBoard('00:33｜1998-ER-0217',[
          {id:'task-m3-316',text:'把掛號聯帶回 3F 316，用舊終端查封存索引',state:'ready'}
        ]);
      }else if(this.gameState.getFlag('M3_316_DECODED')&&!this.gameState.getFlag('SECOND_CAMPUS_ACCESS')){
        this.renderTaskBoard('等待院內來電',[
          {id:'task-second-call',text:'留意第二院區來電',state:'ready'}
        ]);
      }else if(this.gameState.getFlag('SECOND_CAMPUS_ACCESS')&&!this.gameState.getFlag('M4_CHEST_RESOLVED')){
        const seen=this.gameState.getFlag('SECOND_CHEST_PATIENT_SEEN');
        this.renderTaskBoard('翌日 01:15｜第二院區 5F',[
          {
            id:'task-m4-chest',
            text:seen?'到護理站核對胸痛病人的轉院單':'前往第二院區 5F 病房，找到護理站通知的胸痛病人',
            state:'ready'
          }
        ]);
      }else if(this.gameState.getFlag('M4_CHEST_RESOLVED')&&!this.gameState.getFlag('M5_ROUTE_RESOLVED')){
        this.renderTaskBoard('翌日 01:45｜離開第二院區',[
          {id:'task-m5-route',text:'穿越封閉天橋，返回第一院區',state:'ready'}
        ]);
      }else if(this.gameState.getFlag('M5_ROUTE_RESOLVED')&&!this.gameState.getFlag('M6_FLOOR6_RESOLVED')){
        this.renderTaskBoard('翌日 02:00｜返回第一院區',[
          {id:'task-m6-elevator',text:currentZone==='phantom_6f'?(this.gameState.getFlag('FLOOR6_STETHOSCOPE_FOUND')?'檢視老舊聽診器，翻面或擦去刻字上的灰塵':'翻找焦黑器材，尋找被埋住的金屬物件'):'搭乘一般電梯返回第一院區',state:'ready'}
        ]);
      }else if(this.gameState.getFlag('M6_FLOOR6_RESOLVED')&&!this.gameState.getFlag('M7_B2_OPEN')){
        this.renderTaskBoard('翌日 02:17 前｜B-Panel',[
          {id:'task-m7-service-door',text:this.gameState.getFlag('HIDDEN_SERVICE_DOOR_DISCOVERED')?'檢查警衛台後方浮現的舊門框':'前往第一院區 1F，檢查警衛台',state:'ready'}
        ]);
      }else if(this.gameState.getFlag('M7_B2_OPEN')&&!this.gameState.getFlag('M7_B2_RESOLVED')){
        this.renderTaskBoard('翌日 02:17｜B2',[
          {id:'task-m7-b2-terminal',text:'查看 B2 的「316」舊終端，完成身分驗證',state:'ready'}
        ]);
      }else if(this.gameState.getFlag('M7_B2_RESOLVED')&&!this.gameState.getFlag('LAST_CALL_SEEN')){
        this.renderTaskBoard('B2｜身分驗證完成',[
          {id:'task-m8-b2-exit',text:'搭舊貨梯離開 B2，回到第一院區',state:'ready'}
        ]);
      }else if(this.gameState.getFlag('M8_IDENTITY_BATTLE_ACTIVE')&&!this.gameState.getFlag('GAME_COMPLETE')){
        this.renderTaskBoard('翌日 03:30｜真正的交班',[
          {id:'task-m9-final-handoff',text:'回第一院區 3F 的 316 總醫師辦公室，用工作站完成真正的晨間交班',state:'ready'}
        ]);
      }else if(this.gameState.getFlag('GAME_COMPLETE')){
        this.renderTaskBoard('翌日 04:05｜交班完成',[
          {id:'task-game-complete',text:'張守恆已完成真正的晨間交班',state:'completed'}
        ]);
      }else{
        document.getElementById('task-panel')?.classList.add('no-guidance');
      }
      return;
    }

    if (done('ACT1_NORMAL_FLOW')) {
      this.renderTaskBoard('夜班進度（21:00）', [
        {id:'task-normal-flow-complete',text:'正常值班流程完成',state:'completed'}
      ]);
      return;
    }

    if (done('P1_RETURN_4F')) {
      this.renderTaskBoard('4F 病房｜20:40–21:00', sequential([
        {id:'task-return-4f',task:'P1_RETURN_4F',text:'20:40 已返回 4F 病房'},
        {id:'task-end-shift',task:'ACT1_NORMAL_FLOW',text:'21:00 使用值班室桌上電腦短暫休息'}
      ]));
      return;
    }

    if (done('P1_ER_CALL_RECEIVED')) {
      if(!this.gameState.getFlag('P1_ER_CALL_ANSWERED')){
        this.renderTaskBoard('4F 值班室電話｜20:00', [
          {id:'task-answer-er-call',text:'接聽值班室電話',state:'ready'}
        ]);
      }else{
        this.renderTaskBoard('2F 急診會診｜20:05–20:40', sequential([
          {id:'task-er-assess',task:'P1_ER_ASSESSMENT_DONE',text:'20:05 前往 2F 急診完成精神科評估'},
          {id:'task-er-note',task:'P1_ER_NOTE_DONE',text:'20:30 完成急診評估紀錄'},
          {id:'task-return-4f',task:'P1_RETURN_4F',text:'返回 4F 病房'}
        ]));
      }
      return;
    }

    const dutySteps=[
      {id:'task-4f-report',complete:done('P1_4F_REPORT'),text:'17:15 向護理站報到並確認交班重點'},
      {id:'task-408c-event',complete:done('P1_NORMAL_EVENT_DONE'),text:'19:30 查看 408C 反映的敲牆聲'},
      {id:'task-409-seal',complete:this.gameState.getFlag('FOURF_409_SEAL_CHECKED_AFTER_408C'),text:'確認 409 房門封條與整修狀態'},
      {id:'task-bed33-form',complete:this.gameState.getFlag('BED33_RESOLVED'),text:'回護理站核對 409A 臨時床位分配單'}
    ];
    let nextDutyStep=true;
    const dutyItems=dutySteps.map(step=>{
      const state=step.complete?'completed':nextDutyStep?'ready':'locked';
      if(!step.complete)nextDutyStep=false;
      return {id:step.id,text:step.text,state};
    });
    if(!this.gameState.getFlag('BED33_RESOLVED')){
      this.renderTaskBoard('4F 病房值班｜17:15–20:00',dutyItems);
      return;
    }

    this.renderTaskBoard('4F 病房｜20:00 急診來電', [
      {id:'task-return-duty-room',text:'回值班室開門，接聽急診來電',state:'ready'}
    ]);
  }

  toggleDebug() {
    this.debugPanel.classList.toggle('visible');
    this.updateDebug();
  }

  updateDebug() {
    if (!this.debugPanel) return;
    document.getElementById('dbg-duty').textContent = this.gameState.duty;
    document.getElementById('dbg-evidence').textContent = this.gameState.evidence;
    document.getElementById('dbg-identity').textContent = this.gameState.identity;
    document.getElementById('dbg-fatigue').textContent = this.gameState.fatigue;
    document.getElementById('dbg-tasks').textContent = Array.from(this.gameState.completedTasks).join(', ') || '無';
  }
}
