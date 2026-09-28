// PatientizationRecovery.js
// Explicit story-memory anchors used after the first full 17:00 Patientization.
// These are authored story presets, not generic world serialization.

const BASE_TASKS=Object.freeze([
  'KEY_PICKUP','DUTY_LOG','E_HANDOFF','WARD_ENTRY','P1_4F_REPORT','P1_NORMAL_EVENT_DONE'
]);

const M2_RECOVERY_TASKS=Object.freeze([
  'KEY_PICKUP','DUTY_LOG','E_HANDOFF','WARD_ENTRY'
]);

const POST_BED33_TASKS=Object.freeze([
  ...BASE_TASKS,'LEGEND_BED33_RESOLVED','P1_ER_CALL_RECEIVED','P1_ER_ASSESSMENT_DONE',
  'P1_ER_NOTE_DONE','P1_RETURN_4F','ACT1_NORMAL_FLOW'
]);

const BASE_FLAGS=Object.freeze({
  FAST_PATH_3F:false,
  STAFF_ACCESS_CARD:true,
  FOUND_316_SPARE_KEY:true,
  OPENED_316:true,
  LOCKER_OPENED:true,
  HIS_CREDENTIALS:true,
  HIS_AUTHENTICATED:true,
  M1_HANDOFF_CHOICE_RESOLVED:true
});

const POST_BED33_FLAGS=Object.freeze({
  ...BASE_FLAGS,
  BED33_RESOLVED:true,
  FOURF_409_SEAL_CHECKED_AFTER_408C:true,
  P1_ER_CALL_ANSWERED:true,
  NIGHT_PATROL_RETURN_3F:true,
  GUARD_SIGN_EXAMINED:true,
  BOOTSTRAP_2117_RESOLVED:true,
  POST_2117_RETURN_TO_DUTY_ROOM:true,
  POST_2117_DUTY_ROOM_TRIGGERED:true,
  POST_2117_DUTY_CALL_DONE:true,
  TIME_PROOF_FRAGMENT:true
});

const POST_ER0033_FLAGS=Object.freeze({
  ...POST_BED33_FLAGS,
  GHOST_REGISTRATION_ARMED:true,
  GHOST_REGISTRATION_AVAILABLE:false,
  ER0033_SLIP_COLLECTED:true,
  M3_316_DECODED:true,
  LEGEND_ER0033_RESOLVED:true,
  B2_LEGACY_SOURCE:true,
  SECOND_CAMPUS_ACCESS:true,
  SECOND_CAMPUS_OBJECTIVE_ACTIVE:true,
  BRIDGE_ACCESS:true
});

export const PATIENTIZATION_RECOVERY_ANCHORS=Object.freeze({
  HANDOFF_DEFAULT:Object.freeze({
    id:'HANDOFF_DEFAULT',
    label:'17:00｜316 值班物品櫃',
    time:'17:00',
    phase:'Phase0_1700_FirstArrival',
    zoneId:'first_campus_3f',
    spawnId:'m0_316_entrance',
    trace:['17:00'],
    tasks:['FOUND_316_SPARE_KEY','HIS_CREDENTIALS_FOUND','DUTY_LOG','E_HANDOFF'],
    flags:{
      FAST_PATH_3F:false,
      FOUND_316_SPARE_KEY:true,
      OPENED_316:true,
      LOCKER_OPENED:false,
      HIS_CREDENTIALS:true,
      HIS_AUTHENTICATED:true,
      M1_HANDOFF_CHOICE_RESOLVED:true,
      FAST_PATH_316_ENTERED:true,
      FAST_PATH_316_CALL_DONE:true,
      PHONE_RING_ACTIVE:false,
      PHONE_ANSWERED:true,
      STAFF_ACCESS_CARD:false
    }
  }),
  BED33:Object.freeze({
    id:'BED33',
    label:'19:30｜4F 護理站報到',
    time:'19:30',
    phase:'Phase0_1700_FirstArrival',
    zoneId:'first_campus_4f',
    spawnId:'m3_4f_ward_gate',
    trace:['17:00','19:30'],
    tasks:[...M2_RECOVERY_TASKS],
    flags:{
      ...BASE_FLAGS,
      FAST_PATH_3F:true,
      FOURF_409_SEAL_CHECKED_AFTER_408C:false,
      BED33_UNDERSTOOD:true,
      WHERE_0409:true,
      BED33_RESOLVED:false
    }
  }),
  ER0033:Object.freeze({
    id:'ER0033',
    label:'00:33｜2F 異常掛號決策前',
    time:'00:33',
    phase:'Phase3_2117_NightPatrol',
    zoneId:'first_campus_2f',
    spawnId:'recovery_er0033',
    trace:['17:00','21:17','00:33'],
    tasks:[...POST_BED33_TASKS],
    flags:{
      ...POST_BED33_FLAGS,
      GHOST_REGISTRATION_ARMED:true,
      GHOST_REGISTRATION_AVAILABLE:true,
      ER0033_SLIP_COLLECTED:false,
      LEGEND_ER0033_RESOLVED:false
    }
  }),
  CHEST:Object.freeze({
    id:'CHEST',
    label:'01:15｜第二院區 5F／504B',
    time:'01:15',
    phase:'Phase3_2117_NightPatrol',
    zoneId:'second_campus_5f',
    spawnId:'recovery_chest_patient',
    trace:['17:00','21:17','00:33','01:15'],
    tasks:[...POST_BED33_TASKS],
    flags:{
      ...POST_ER0033_FLAGS,
      SECOND_CAMPUS_5F_REPORTED:true,
      SECOND_CHEST_PATIENT_SEEN:false,
      M4_CHEST_RESOLVED:false
    }
  }),
  BRIDGE:Object.freeze({
    id:'BRIDGE',
    label:'01:45｜天橋回程倒影決策前',
    time:'01:45',
    phase:'Phase3_2117_NightPatrol',
    zoneId:'skybridge',
    spawnId:'m7_skybridge_end',
    trace:['17:00','21:17','00:33','01:15','01:45'],
    tasks:[...POST_BED33_TASKS],
    flags:{
      ...POST_ER0033_FLAGS,
      SECOND_CAMPUS_5F_REPORTED:true,
      SECOND_CHEST_PATIENT_SEEN:true,
      M4_CHEST_RESOLVED:true,
      CHEST_RECORD_MATCH:true,
      M5_CCTV_RESOLVED:true,
      CCTV_SELF_DUPLICATE_SEEN:true,
      M5_BRIDGE_RESOLVED:false,
      M5_BRIDGE_COMMITTED:false,
      M5_ROUTE_CHOICE_RESOLVED:false,
      M5_ROUTE_RESOLVED:false,
      BRIDGE_REFLECTION_NOTICE_PENDING:false,
      BRIDGE_REFLECTION_NOTICE_SEEN:false,
      BRIDGE_NO_LOOKBACK_RULE_ACTIVE:false,
      BRIDGE_MANUAL_LOOKBACK_AFTER_SAFE_CHOICE:false
    }
  }),
  TIMELOOP:Object.freeze({
    id:'TIMELOOP',
    label:'02:17｜1F B-Panel 決策前',
    time:'02:17',
    phase:'Phase3_2117_NightPatrol',
    zoneId:'first_campus_1f',
    spawnId:'first_1f_guard_back',
    trace:['17:00','21:17','00:33','01:15','01:45','02:00','02:17'],
    tasks:[...POST_BED33_TASKS],
    flags:{
      ...POST_ER0033_FLAGS,
      SECOND_CAMPUS_5F_REPORTED:true,
      SECOND_CHEST_PATIENT_SEEN:true,
      M4_CHEST_RESOLVED:true,
      CHEST_RECORD_MATCH:true,
      M5_CCTV_RESOLVED:true,
      M5_BRIDGE_RESOLVED:true,
      M5_BRIDGE_COMMITTED:true,
      M5_ROUTE_CHOICE_RESOLVED:true,
      M5_ROUTE_RESOLVED:true,
      FLOOR6_AVAILABLE:false,
      M6_FLOOR6_RESOLVED:true,
      FLOOR6_STETHOSCOPE_FOUND:true,
      FLOOR6_STETHOSCOPE_INSPECTED:true,
      SIX_FLOOR_HISTORY_CONFIRMED:true,
      SECURITY_RECORD_OBJECTIVE:false,
      HIDDEN_SERVICE_DOOR_DISCOVERED:true,
      B_PANEL_CLUE_KNOWN:true,
      B_PANEL_KEY:true,
      M7_B2_OPEN:false
    }
  })
});

export function getPatientizationRecoveryAnchor(id){
  return PATIENTIZATION_RECOVERY_ANCHORS[id]||null;
}

export function applyPatientizationRecoveryAnchor(gameState,id){
  const anchor=getPatientizationRecoveryAnchor(id);
  if(!anchor)return null;
  for(const task of anchor.tasks||[])gameState.markTaskComplete(task);
  for(const [flag,value] of Object.entries(anchor.flags||{}))gameState.setFlag(flag,value);
  gameState.setGamePhase(anchor.phase);
  gameState.setGameTime(anchor.time);
  gameState.setFlag('PATIENTIZATION_RECOVERY_ANCHOR',anchor.id);
  return anchor;
}
