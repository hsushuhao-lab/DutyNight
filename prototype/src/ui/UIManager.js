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
    this.elevatorCutscene = document.getElementById('elevator-cutscene');
    this.debugPanel = document.getElementById('debug-panel');

    this.initEvents();
    this.updateTasks();
    this.showInitialDialogue();

    this.gameState.addListener((evt) => {
      if (evt === 'task_completed') {
        this.updateTasks();
        this.updateDebug();
      }
    });
  }

  initEvents() {
    // Workstation sign & close button
    const btnSignHandoff = document.getElementById('btn-sign-handoff');
    if (btnSignHandoff) {
      btnSignHandoff.addEventListener('click', () => {
        soundManager.playComputerBeep();
        this.gameState.markTaskComplete('E_HANDOFF');
        this.closeWorkstation();
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
        '「今天你值班。先到 316 拿鑰匙、簽值班本，再用旁邊電腦完成交班。晚點直接上 4F。」',
        8000
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

  updateTasks() {
    const t01 = this.gameState.isTaskComplete('KEY_PICKUP');
    const t02 = this.gameState.isTaskComplete('DUTY_LOG');
    const t03 = this.gameState.isTaskComplete('E_HANDOFF');
    const readyFor4F = t01 && t02 && t03;
    const enteredWard = this.gameState.isTaskComplete('WARD_ENTRY');

    document.getElementById('task-key').className = t01 ? 'task-item completed' : 'task-item pending';
    document.getElementById('task-log').className = t02 ? 'task-item completed' : 'task-item pending';
    document.getElementById('task-handoff').className = t03 ? 'task-item completed' : 'task-item pending';
    document.getElementById('task-elevator').className = enteredWard ? 'task-item completed' : readyFor4F ? 'task-item ready' : 'task-item locked';

    const elevatorLabel = document.getElementById('task-elevator-label');
    if (enteredWard) {
      elevatorLabel.textContent = '已抵達 4F 病房區';
    } else if (readyFor4F) {
      elevatorLabel.textContent = '搭乘電梯前往 4F 病房區';
    } else {
      elevatorLabel.textContent = '搭乘電梯前往 4F 病房區（待交班完成）';
    }
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
