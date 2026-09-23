// UIManager.js - Handles HUD, HIS computer terminal, Duty Log, and Elevator transition
import { soundManager } from '../audio/SoundManager.js';

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
    this.lockerModal = document.getElementById('locker-modal');
    this.anomalyModal = document.getElementById('anomaly-modal');
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
        this.closeWorkstation();
        setTimeout(()=>this.showAnomalyMessage(),180);
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
      status.textContent='綠燈亮起：櫃門已解鎖';
      document.getElementById('locker-contents')?.classList.add('revealed');
      this.gameState.setFlag('LOCKER_OPENED',true);
      this.gameState.setFlag('HIS_CREDENTIALS',true);
      this.gameState.markTaskComplete('LOCKER_OPENED');
      this.gameState.markTaskComplete('KEY_PICKUP');
      window.worldRouter?.activeZoneInstance?.markLockerOpen?.();
      soundManager.playKeyPickup();
      this.updateTasks();
    });
    document.getElementById('btn-ack-anomaly')?.addEventListener('click',()=>{
      this.gameState.setFlag('ARCHIVE_OBJECTIVE',true);
      this.anomalyModal?.classList.remove('active');
      this.updateTasks();
      this.onTerminalClose?.();
    });

    // Debug toggle with Backquote (~)
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Backquote' && (import.meta.env.DEV || new URLSearchParams(location.search).get('debug') === '1')) {
        this.toggleDebug();
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
        if (this.lockerModal?.classList.contains('active')) this.closeLocker();
        if (this.anomalyModal?.classList.contains('active')) {
          this.anomalyModal.classList.remove('active');
          this.onTerminalClose?.();
        }
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
      this.showSubtitle(
        '學長 (資深住院醫師)',
        '「我先走了。想辦法進 316 完成交班，把今晚的鑰匙拿到手。」',
        6500
      );
    }, 1200);
  }

  openWorkstation() {
    document.exitPointerLock();
    soundManager.playComputerBeep();
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
    this.lockerModal?.classList.add('active');
  }

  closeLocker() {
    this.lockerModal?.classList.remove('active');
    this.onTerminalClose?.();
  }

  showAnomalyMessage() {
    document.exitPointerLock();
    this.anomalyModal?.classList.add('active');
    soundManager.playComputerBeep();
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
    document.getElementById('elevator-status-text').textContent=`${kind==='stairs'?'安全梯':'電梯'} ${fromFloor}F → ${destination.floorNum}F`;
    if(kind==='stairs')soundManager.playClick();else soundManager.playElevatorMotor();
    this.travelTimer=setTimeout(()=>{
      try {onSelect(destination);soundManager.playElevatorChime();}
      finally {this.elevatorCutscene.dataset.travelling='false';this.closeTravelSelector();}
    },kind==='stairs'?1100:1700);
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
    if (this.timeEl) this.timeEl.textContent = `${this.gameState.gameTime} ｜ 第一線值班：李住院醫師`;
  }

  renderTaskBoard(header, items) {
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

    const hasSpare=this.gameState.getFlag('FOUND_316_SPARE_KEY');
    const opened316=this.gameState.getFlag('OPENED_316');
    const archiveObjective=this.gameState.getFlag('ARCHIVE_OBJECTIVE');
    const archiveLockedSeen=this.gameState.getFlag('ARCHIVE_LOCKED_SEEN');
    const archiveKey=this.gameState.getFlag('ARCHIVE_ACCESS_KEY');
    const currentZone=window.worldRouter?.activeZoneId || '';
    const readyFor4F = this.gameState.areRequiredTasksComplete();

    if(done('E_HANDOFF') && !archiveObjective){
      this.renderTaskBoard('異常訊息｜3F',[
        {id:'task-anomaly',text:'閱讀交班後出現的異常訊息',state:'ready'},
        {id:'task-elevator',text:'4F 已可前往',state:readyFor4F?'ready':'locked'}
      ]);
      return;
    }

    if(archiveObjective && !done('ARCHIVE_CLUE_FOUND')){
      if(!archiveLockedSeen){
        this.renderTaskBoard('異常訊息｜3F 文史館',[
          {id:'task-archive-door',text:'前往 3F 文史館確認異常訊息',state:'ready'},
          {id:'task-elevator',text:'4F 病房已可前往',state:readyFor4F?'ready':'locked'}
        ]);
      }else if(!archiveKey){
        this.renderTaskBoard('文史館門鎖｜尋找專用鑰匙',[
          {id:'task-archive-key',text:'前往第一院區 4F 值班室尋找文史館備用鑰匙',state:'ready'},
          {id:'task-return-museum',text:'取得後返回 3F 文史館',state:'locked'}
        ]);
      }else{
        this.renderTaskBoard('文史館調查',[
          {id:'task-return-museum',text:currentZone==='first_campus_3f'?'使用專用鑰匙進入文史館':'返回 3F 文史館',state:'ready'},
          {id:'task-archive-clue',text:'找到未編目的交班紀錄',state:currentZone==='first_campus_3f'?'ready':'locked'}
        ]);
      }
      return;
    }

    if(done('ARCHIVE_CLUE_FOUND') && currentZone==='first_campus_3f' && done('WARD_ENTRY')){
      this.renderTaskBoard('文史館調查完成',[
        {id:'task-archive-complete',text:'已找到未編目交班紀錄',state:'completed'},
        {id:'task-return-4f',text:'返回 4F 病房繼續值班',state:'ready'}
      ]);
      return;
    }

    if (!done('WARD_ENTRY')) {
      this.renderTaskBoard('今日夜班手續（17:00 交接）',[
        {id:'task-find-key',text:'想辦法進入 316 總醫師辦公室',state:opened316?'completed':hasSpare?'ready':'pending'},
        {id:'task-spare',text:'尋找 316 的備援鑰匙盒',state:hasSpare?'completed':opened316?'completed':'ready'},
        {id:'task-log',text:'查看值班手冊，找出密碼提示',state:done('DUTY_LOG')?'completed':opened316?'ready':'locked'},
        {id:'task-locker',text:'解開 316 值班物品櫃',state:done('KEY_PICKUP')?'completed':done('DUTY_LOG')?'ready':'locked'},
        {id:'task-handoff',text:'用取得的帳密登入 HIS 完成交班',state:done('E_HANDOFF')?'completed':done('KEY_PICKUP')?'ready':'locked'},
        {id:'task-elevator',text:readyFor4F?'搭乘電梯前往 4F 病房區':'4F 尚未開放',state:readyFor4F?'ready':'locked'}
      ]);
      return;
    }

    if (done('ACT1_NORMAL_FLOW')) {
      this.renderTaskBoard('夜班進度（21:00）', [
        {id:'task-normal-flow-complete',text:'正常值班流程完成｜目前可在值班室休息',state:'completed'}
      ]);
      return;
    }

    if (done('P1_RETURN_4F')) {
      this.renderTaskBoard('4F 病房｜20:40–21:00', sequential([
        {id:'task-return-4f',task:'P1_RETURN_4F',text:'20:40 已返回 4F 病房'},
        {id:'task-end-shift',task:'ACT1_NORMAL_FLOW',text:'21:00 回值班室休息'}
      ]));
      return;
    }

    if (done('P1_REST_DONE')) {
      this.renderTaskBoard('2F 急診會診｜20:00–20:40', sequential([
        {id:'task-er-assess',task:'P1_ER_ASSESSMENT_DONE',text:'20:05 前往 2F 急診完成精神科評估'},
        {id:'task-er-note',task:'P1_ER_NOTE_DONE',text:'20:30 完成急診評估紀錄'},
        {id:'task-return-4f',task:'P1_RETURN_4F',text:'返回 4F 病房'}
      ]));
      return;
    }

    this.renderTaskBoard('4F 病房值班｜17:15–20:00', sequential([
      {id:'task-4f-report',task:'P1_4F_REPORT',text:'17:15 向護理站報到並確認交班重點'},
      {id:'task-duty-room',task:'P1_DUTY_ROOM_READY',text:'17:30 開啟值班室、放置物品並確認值班電話'},
      {id:'task-round',task:'P1_ROUND_COMPLETE',text:'18:00 完成 401–409 晚間巡房'},
      {id:'task-403',task:'P1_INSOMNIA_DONE',text:'18:30 評估 403 睡眠問題'},
      {id:'task-normal-event',task:'P1_NORMAL_EVENT_DONE',text:'19:30 處理一般病房事件'},
      {id:'task-rest',task:'P1_REST_DONE',text:'20:00 回值班室短暫休息並等待急診通知'}
    ]));
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
