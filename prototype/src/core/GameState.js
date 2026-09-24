// GameState.js - Mirrored from SongdeRunStateSubsystem and Act1Director
export class GameState {
  constructor() {
    this.duty = 0;
    this.evidence = 0;
    this.identity = 3;
    this.fatigue = 0;
    this.gameTime = '17:00';
    this.gamePhase = 'Phase0_1700_FirstArrival';

    this.requiredTasks = [
      'KEY_PICKUP',
      'DUTY_LOG',
      'E_HANDOFF'
    ];

    this.completedTasks = new Set();
    this.flags = new Map();
    this.listeners = [];

    // Initial state
    this.flags.set('ACT1_STARTED', true);
    this.flags.set('CURRENT_FLOOR', '3F');
    this.flags.set('SUPERNATURAL_ENABLED', false);
    this.flags.set('STAFF_ACCESS_CARD', false);
    this.flags.set('FOUND_316_SPARE_KEY', false);
    this.flags.set('OPENED_316', false);
    this.flags.set('LOCKER_OPENED', false);
    this.flags.set('HIS_CREDENTIALS', false);
    this.flags.set('ARCHIVE_OBJECTIVE', false);
    this.flags.set('ARCHIVE_LOCKED_SEEN', false);
    this.flags.set('ARCHIVE_ACCESS_KEY', false);
    this.flags.set('ARCHIVE_KEY_CLUE_4F', false);
    this.flags.set('OFFICE_302_UNLOCKED', false);
    this.flags.set('INTERACTED_302', false);
    this.flags.set('FOUND_302_CODE', false);
    this.flags.set('PHONE_RING_ACTIVE', false);
    this.flags.set('PHONE_ANSWERED', false);
    this.flags.set('HIS_ANOMALY_SEEN', false);
    this.flags.set('ANOMALY_ACKNOWLEDGED', false);
    this.flags.set('ANNE_STAGE', 0);
    this.flags.set('GUARD_FUTURE_ENTRY', false);
    this.flags.set('HOOK_409_ZERO_ROOM', false);
    this.flags.set('HOOK_1F_HIDDEN_DOOR', false);
    this.flags.set('HOOK_0217', false);
    this.flags.set('HOOK_0316_COMMAND_POINT', false);
    this.flags.set('ER_JANE_DOE_WRISTBAND', false);
    this.flags.set('FIRST_FLOOR_GUARD_KEY', false);
    this.flags.set('STAIR_SHORTCUT_3F_4F', false);
    this.flags.set('FORCE_3F_ELEVATOR_STOP', false);
    this.flags.set('FORCED_3F_ELEVATOR_STOP_DONE', false);
    this.flags.set('NIGHT_PATROL_RETURN_3F', false);
    this.flags.set('HIDDEN_SERVICE_DOOR_DISCOVERED', false);
    this.flags.set('CLUE_403_0409', false);
    this.flags.set('ADMIN_ROSTER_CHECKED', false);
    this.flags.set('ADMIN_PRINTER_DOC_CHECKED', false);
    this.flags.set('ADMIN_DRAWER_MANUAL_CHECKED', false);
    this.flags.set('ADMIN_IDENTITY_PUZZLE_RESOLVED', false);
    this.flags.set('ECHO_2117_KNOWN', false);
    this.flags.set('ADMIN_OFFICE_ENTERED', false);
  }

  addListener(fn) {
    this.listeners.push(fn);
  }

  notify(event, data) {
    for (const fn of this.listeners) {
      fn(event, data, this);
    }
  }

  markTaskComplete(taskId) {
    if (!this.completedTasks.has(taskId)) {
      this.completedTasks.add(taskId);
      this.flags.set(taskId, true);
      if (taskId === 'KEY_PICKUP') this.flags.set('STAFF_ACCESS_CARD', true);
      this.duty += 1;
      this.notify('task_completed', taskId);
      console.log('[GameState] Task Completed: ' + taskId + ' | Duty: ' + this.duty);
    }
  }

  isTaskComplete(taskId) {
    return this.completedTasks.has(taskId);
  }

  areRequiredTasksComplete() {
    for (const task of this.requiredTasks) {
      if (!this.completedTasks.has(task)) return false;
    }
    return true;
  }

  setGamePhase(phase) {
    if (!phase || this.gamePhase === phase) return;
    this.gamePhase = phase;
    this.notify('phase_changed', phase);
  }

  getGamePhase() {
    return this.gamePhase;
  }

  setGameTime(time) {
    if (this.gameTime === time) return;
    this.gameTime = time;
    this.notify('time_changed', time);
  }

  setFlag(flag, val = true) {
    this.flags.set(flag, val);
    this.notify('flag_changed', { flag, val });
  }

  getFlag(flag) {
    return this.flags.get(flag) || false;
  }

  addEvidence(delta) {
    this.evidence += delta;
    this.notify('evidence_changed', this.evidence);
  }

  addFatigue(delta) {
    this.fatigue += delta;
    this.notify('fatigue_changed', this.fatigue);
  }

  addIdentity(delta) {
    this.identity += delta;
    this.notify('identity_changed', this.identity);
  }

  resetForLoop() {
    const listeners=this.listeners;
    const fresh=new GameState();
    Object.assign(this,fresh);
    this.listeners=listeners;
    this.notify('loop_reset',null);
  }
}

export const gameState = new GameState();
