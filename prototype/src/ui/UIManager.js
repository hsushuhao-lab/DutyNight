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
      if (e.code === 'Backquote') {
        this.toggleDebug();
      }
      if (e.code === 'Escape') {
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
        '「今天你值班喔？鑰匙在老地方，值班本記得簽一下。晚上如果有事，護理站會打給你。」',
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
        '<div class="arrival-badge">4F 閉鎖病房抵達</div>',
        '<h2>【第一階段代理人任務 1~6 項已全數達成】</h2>',
        '<ul class="milestone-list">',
        '  <li>✅ 1. 第一人稱視角移動 (WASD + Mouse Look)</li>',
        '  <li>✅ 2. 3F 行政區空間 Blockout (夕陽暖金照明、走廊、辦公室、電梯大廳)</li>',
        '  <li>✅ 3. 拾取值班室鑰匙 (Key Pickup - 402室)</li>',
        '  <li>✅ 4. 簽署值班名冊 (Duty Logbook)</li>',
        '  <li>✅ 5. 電子交班工作站 (HIS 整合系統完整交班)</li>',
        '  <li>✅ 6. 電梯過場至 4F (Elevator Transition)</li>',
        '</ul>',
        '<button id="btn-continue-explore" class="btn-primary" style="margin-top:20px;">返回 3F 繼續自由探索測試</button>'
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

    document.getElementById('task-key').className = t01 ? 'task-item completed' : 'task-item pending';
    document.getElementById('task-log').className = t02 ? 'task-item completed' : 'task-item pending';
    document.getElementById('task-handoff').className = t03 ? 'task-item completed' : 'task-item pending';
    document.getElementById('task-elevator').className = readyFor4F ? 'task-item ready' : 'task-item locked';

    const elevatorLabel = document.getElementById('task-elevator-label');
    if (readyFor4F) {
      elevatorLabel.textContent = '搭乘電梯前往 4F (可出發)';
    } else {
      elevatorLabel.textContent = '搭乘電梯前往 4F (待交班手續完成)';
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
