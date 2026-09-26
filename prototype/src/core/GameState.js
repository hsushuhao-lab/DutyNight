const STORY_TIME_SEQUENCE=Object.freeze([
  '17:00','17:10','17:15','17:30','18:00','18:30','19:30','20:00','20:05','20:25','20:30','20:40',
  '21:00','21:15','21:16','21:17','23:55','00:30','00:33','01:15','01:45','02:00','02:17','03:30','04:05'
]);
const STORY_TIME_INDEX=new Map(STORY_TIME_SEQUENCE.map((value,index)=>[value,index]));
const MIDNIGHT_STORY_INDEX=STORY_TIME_INDEX.get('00:30');

// GameState.js - Mirrored from SongdeRunStateSubsystem and Act1Director
export class GameState {
  constructor() {
    this.duty = 0;
    this.evidence = 0;
    this.identity = 3;
    this.fatigue = 0;
    this.gameTime = '17:00';
    this.storyTimeIndex = STORY_TIME_INDEX.get('17:00');
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
    this.flags.set('PHONE_CALL_KIND', null);
    this.flags.set('P1_ER_CALL_ANSWERED', false);
    this.flags.set('P1_ER_CALL_RECEIVED', false);
    this.flags.set('FOURF_409_SEAL_CHECKED_AFTER_408C', false);
    this.flags.set('ER_JANE_PRESENT', false);
    this.flags.set('FAST_PATH_3F', false);
    this.flags.set('FAST_PATH_316_ENTERED', false);
    this.flags.set('FAST_PATH_316_CALL_DONE', false);
    this.flags.set('STORAGE_ANNE_VISIT_COUNT', 0);
    this.flags.set('FLOOR6_STETHOSCOPE_FOUND', false);
    this.flags.set('FLOOR6_STETHOSCOPE_INSPECTED', false);
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
    this.flags.set('B_PANEL_CLUE_KNOWN', false);
    this.flags.set('B_PANEL_KEY', false);
    this.flags.set('CLUE_403_0409', false);
    this.flags.set('ADMIN_ROSTER_CHECKED', false);
    this.flags.set('ADMIN_PRINTER_DOC_CHECKED', false);
    this.flags.set('ADMIN_DRAWER_MANUAL_CHECKED', false);
    this.flags.set('ADMIN_IDENTITY_PUZZLE_RESOLVED', false);
    this.flags.set('ECHO_2117_KNOWN', false);
    this.flags.set('ADMIN_OFFICE_ENTERED', false);

    // Canonical staged-story flags. Keep all false at loop start so browser/runtime
    // logic never has to distinguish "missing" from false.
    this.flags.set('GUARD_SIGN_EXAMINED', false);
    this.flags.set('BOOTSTRAP_2117_RESOLVED', false);
    this.flags.set('GHOST_REGISTRATION_ARMED', false);
    this.flags.set('GHOST_REGISTRATION_AVAILABLE', false);
    this.flags.set('SANDBOX_MODE', false);
    this.flags.set('ER0033_SLIP_COLLECTED', false);
    this.flags.set('M3_316_DECODED', false);
    this.flags.set('LEGEND_ER0033_RESOLVED', false);
    this.flags.set('SECOND_CAMPUS_ACCESS', false);
    this.flags.set('SECOND_CAMPUS_OBJECTIVE_ACTIVE', false);
    this.flags.set('SECOND_CAMPUS_5F_REPORTED', false);
    this.flags.set('BRIDGE_ACCESS', false);
    this.flags.set('M4_CHEST_RESOLVED', false);
    this.flags.set('M5_BRIDGE_RESOLVED', false);
    this.flags.set('M5_ROUTE_RESOLVED', false);
    this.flags.set('M5_ROUTE_CHOICE_RESOLVED', false);
    this.flags.set('M5_NAME_CLUE_FOUND', false);
    this.flags.set('M5_BRIDGE_COMMITTED', false);
    this.flags.set('BRIDGE_REFLECTION_NOTICE_PENDING', false);
    this.flags.set('BRIDGE_REFLECTION_NOTICE_SEEN', false);
    this.flags.set('BRIDGE_OVERRIDE_PENDING', false);
    this.flags.set('SECOND_CAMPUS_PHONE_PENDING', false);
    this.flags.set('FLOOR6_AVAILABLE', false);
    this.flags.set('M6_FLOOR6_RESOLVED', false);
    this.flags.set('SECURITY_RECORD_OBJECTIVE', false);
    this.flags.set('B2_ADMIN_SOURCE', false);
    this.flags.set('B2_HISTORY_SOURCE', false);
    this.flags.set('B2_LEGACY_SOURCE', false);
    this.flags.set('B2_SECURITY_SOURCE', false);
    this.flags.set('CCTV_SELF_DUPLICATE_SEEN', false);
    this.flags.set('M7_B2_OPEN', false);
    this.flags.set('M7_B2_RESOLVED', false);
    this.flags.set('M8_IDENTITY_BATTLE_ACTIVE', false);
    this.flags.set('LAST_CALL_SEEN', false);
    this.flags.set('GAME_COMPLETE', false);
    this.flags.set('POST_2117_RETURN_TO_DUTY_ROOM', false);
    this.flags.set('POST_2117_DUTY_ROOM_TRIGGERED', false);
    this.flags.set('POST_2117_DUTY_CALL_DONE', false);
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
    if (this.gameTime === time) return true;
    const nextIndex=STORY_TIME_INDEX.get(time);
    if(nextIndex===undefined){
      console.warn('[GameState] Unknown story time ignored:',time);
      return false;
    }
    if(nextIndex<this.storyTimeIndex){
      console.warn('[GameState] Backward story time rejected:',this.gameTime,'->',time);
      return false;
    }
    this.storyTimeIndex=nextIndex;
    this.gameTime=time;
    this.notify('time_changed', time);
    return true;
  }

  getDisplayTime() {
    return this.storyTimeIndex>=MIDNIGHT_STORY_INDEX?'翌日 '+this.gameTime:this.gameTime;
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
