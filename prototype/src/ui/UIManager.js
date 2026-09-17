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

  triggerElevatorTransition(targetFloor, onTeleport, onFinish) {
    document.exitPointerLock();
    soundManager.playElevatorChime();
    this.elevatorCutscene.classList.add('active');

    const isGoingUp = targetFloor === '4F';
    const displayEl = document.querySelector('.elevator-display');
    const statusEl = document.getElementById('elevator-status-text');

    if (displayEl) {
      displayEl.innerHTML = [
        '<span class="arrow-up">' + (isGoingUp ? '▲' : '▼') + '</span>',
        '<span class="floor-digit">' + targetFloor + '</span>'
      ].join('');
    }

    if (statusEl) {
      statusEl.innerHTML = [
        '<p>電梯門緩緩關閉……</p>',
        '<p class="sub-text">電梯' + (isGoingUp ? '上行中：3F ➔ 4F 閉鎖病房' : '下行中：4F ➔ 3F 行政區') + '</p>'
      ].join('');
    }

    setTimeout(() => {
      soundManager.playElevatorMotor();
    }, 800);

    setTimeout(() => {
      if (onTeleport) onTeleport();

      const locEl = document.querySelector('.hud-location');
      const timeEl = document.querySelector('.hud-time');
      if (locEl) {
        locEl.textContent = isGoingUp
          ? '4F 精神科閉鎖病房區 ｜ 獨立值班室前室'
          : '3F 醫師辦公行政區';
      }
      if (timeEl) {
        timeEl.textContent = isGoingUp
          ? '17:35 (暮色將至) ｜ 第一線值班：李住院醫師'
          : '17:05 (夕陽餘暉) ｜ 第一線值班：李住院醫師';
      }
    }, 2200);

    setTimeout(() => {
      soundManager.playElevatorChime();
      this.elevatorCutscene.classList.remove('active');
      if (onFinish) onFinish();
    }, 3200);
  }

  updateTasks() {
    const t01 = this.gameState.isTaskComplete('KEY_PICKUP');
    const t02 = this.gameState.isTaskComplete('DUTY_LOG');
    const t03 = this.gameState.isTaskComplete('E_HANDOFF');
    const t04 = this.gameState.isTaskComplete('WARD_ENTRY');
    const t05 = this.gameState.isTaskComplete('DUTY_ROOM_SETUP');
    const readyFor4F = t01 && t02 && t03;

    const elKey = document.getElementById('task-key');
    const elLog = document.getElementById('task-log');
    const elHandoff = document.getElementById('task-handoff');
    const elElevator = document.getElementById('task-elevator');
    const elElevatorLabel = document.getElementById('task-elevator-label');
    const elDutyRoom = document.getElementById('task-dutyroom');

    if (elKey) elKey.className = t01 ? 'task-item completed' : 'task-item pending';
    if (elLog) elLog.className = t02 ? 'task-item completed' : 'task-item pending';
    if (elHandoff) elHandoff.className = t03 ? 'task-item completed' : 'task-item pending';
    
    if (elElevator) {
      if (t04) {
        elElevator.className = 'task-item completed';
        if (elElevatorLabel) elElevatorLabel.textContent = '搭乘電梯前往 4F (已抵達)';
      } else if (readyFor4F) {
        elElevator.className = 'task-item ready';
        if (elElevatorLabel) elElevatorLabel.textContent = '搭乘電梯前往 4F (可出發)';
      } else {
        elElevator.className = 'task-item locked';
        if (elElevatorLabel) elElevatorLabel.textContent = '搭乘電梯前往 4F (待交班手續完成)';
      }
    }

    if (elDutyRoom) {
      if (t05) {
        elDutyRoom.className = 'task-item completed';
      } else if (t04) {
        elDutyRoom.className = 'task-item ready';
      } else {
        elDutyRoom.className = 'task-item locked';
      }
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
