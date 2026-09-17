// GameState.js - Mirrored from SongdeRunStateSubsystem and Act1Director
export class GameState {
  constructor() {
    this.duty = 0;
    this.evidence = 0;
    this.identity = 3;
    this.fatigue = 0;

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
}

export const gameState = new GameState();
