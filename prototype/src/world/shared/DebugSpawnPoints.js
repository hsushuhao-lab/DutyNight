// DebugSpawnPoints.js - Central registry of spawn coordinates and metadata for modeling QA
import * as THREE from 'three';

export const DEBUG_SPAWN_POINTS = {
  // M0: First Campus 3F
  'm0_3f_corridor': {
    zoneId: 'first_campus_3f',
    name: '3F 行政區走廊',
    pos: [0.0, 1.7, 0.0],
    yaw: -Math.PI / 2, // Facing East down corridor
    pitch: 0.0,
    milestone: 'M0'
  },
  'm0_316_entrance': {
    zoneId: 'first_campus_3f',
    name: '316 總醫師室門口',
    pos: [2.1, 1.7, 0.4],
    yaw: Math.PI, // Facing North into 316
    pitch: 0.0,
    milestone: 'M0'
  },
  'm0_316_office': {
    zoneId: 'first_campus_3f',
    name: '316 總醫師室內（值班桌）',
    pos: [5.6, 1.7, 5.0],
    yaw: Math.PI, // Facing desk
    pitch: -0.15,
    milestone: 'M0'
  },

  // M1, M2, M3: First Campus 4F
  'm1_4f_lobby': {
    zoneId: 'first_campus_4f',
    name: '4F 電梯大廳抵達',
    pos: [-8.0, 1.7, 0.0],
    yaw: -Math.PI / 2, // Facing East toward corridor
    pitch: 0.0,
    milestone: 'M1'
  },
  'm2_4f_duty_room': {
    zoneId: 'first_campus_4f',
    name: '4F 獨立值班室套房',
    pos: [5.4, 1.7, -3.4],
    yaw: 0.0, // Looking South into the private duty room suite
    pitch: -0.05,
    milestone: 'M2'
  },
  'm3_4f_nursing_station': {
    zoneId: 'first_campus_4f',
    name: '4A 護理站工作區',
    pos: [8.0, 1.7, 5.8],
    yaw: 0.0, // Facing corridor from behind counter
    pitch: 0.0,
    milestone: 'M3'
  },
  'm3_4f_ward_gate': {
    zoneId: 'first_campus_4f',
    name: '4A 閉鎖病房門禁門前',
    pos: [12.5, 1.7, 0.0],
    yaw: -Math.PI / 2, // Facing East into ward gate
    pitch: 0.0,
    milestone: 'M3'
  },

  // M4: First Campus 2F ER
  'm4_2f_er_arrival': {
    zoneId: 'first_campus_2f',
    name: '2F 急診到勤走廊',
    pos: [-4.0, 1.7, 0.0],
    yaw: -Math.PI / 2,
    pitch: 0.0,
    milestone: 'M4'
  },
  'm4_2f_er_triage': {
    zoneId: 'first_campus_2f',
    name: '2F 急診檢傷護理台',
    pos: [3.5, 1.7, 5.0],
    yaw: 0.0,
    pitch: -0.05,
    milestone: 'M4'
  },
  'm4_2f_er_bays': {
    zoneId: 'first_campus_2f',
    name: '2F 急診留觀床位區',
    pos: [14.0, 1.7, 5.5],
    yaw: Math.PI / 2,
    pitch: -0.05,
    milestone: 'M4'
  },
  'm4_2f_er_treatment': {
    zoneId: 'first_campus_2f',
    name: '2F 急診處置室（ECT前處置）',
    pos: [2.0, 1.7, -6.5],
    yaw: -Math.PI / 2, // Standing beside treatment table
    pitch: -0.05,
    milestone: 'M4'
  },
  'm4_2f_er_exterior': {
    zoneId: 'first_campus_2f',
    name: '2F 救護車道山側出入口',
    pos: [20.5, 1.7, 0.0],
    yaw: -Math.PI / 2,
    pitch: 0.0,
    milestone: 'M4'
  },

  // M5: First Campus 1F Lobby
  'm5_1f_lobby_entrance': {
    zoneId: 'first_campus_1f',
    name: '1F 醫院正門大廳',
    pos: [0.0, 1.7, -6.0],
    yaw: Math.PI,
    pitch: 0.05,
    milestone: 'M5'
  },
  'm5_1f_reception': {
    zoneId: 'first_campus_1f',
    name: '1F 服務台與掛號批價',
    pos: [2.0, 1.7, -2.8],
    yaw: Math.PI, // Facing reception desk
    pitch: -0.05,
    milestone: 'M5'
  },

  // M6: First Campus 8F Bridge Entry
  'm6_8f_bridge_entry': {
    zoneId: 'first_campus_8f',
    name: '8F 空中連通道入口前廳',
    pos: [-4.0, 1.7, 0.0],
    yaw: -Math.PI / 2,
    pitch: 0.0,
    milestone: 'M6'
  },

  // M7: Skybridge
  'm7_skybridge_start': {
    zoneId: 'skybridge',
    name: '連通道 起點（近第一院區）',
    pos: [3.0, 1.7, 0.0],
    yaw: -Math.PI / 2,
    pitch: 0.0,
    milestone: 'M7'
  },
  'm7_skybridge_mid': {
    zoneId: 'skybridge',
    name: '連通道 中央長廊（兩側大窗）',
    pos: [30.0, 1.7, 0.0],
    yaw: -Math.PI / 2,
    pitch: 0.0,
    milestone: 'M7'
  },
  'm7_skybridge_end': {
    zoneId: 'skybridge',
    name: '連通道 終點（近第二院區）',
    pos: [57.0, 1.7, 0.0],
    yaw: -Math.PI / 2,
    pitch: 0.0,
    milestone: 'M7'
  },

  // M8, M9: Second Campus 2F & Standard Ward Floor
  'm9_second_campus_2f': {
    zoneId: 'second_campus_2f',
    name: '第二院區 2F 連通道抵達大廳',
    pos: [63.0, 1.7, 0.0],
    yaw: -Math.PI / 2,
    pitch: 0.0,
    milestone: 'M9'
  },
  'm8_second_campus_std': {
    zoneId: 'second_campus_5f',
    name: '第二院區 5F 病房層（電梯對護理站）',
    pos: [76.0, 1.7, 0.0],
    yaw: Math.PI,
    pitch: 0.0,
    milestone: 'M8'
  },

  // M10: Second Campus 1F Exit
  'm10_second_campus_1f': {
    zoneId: 'second_campus_1f',
    name: '第二院區 1F 山側後門出入口',
    pos: [72.0, 1.7, -4.0],
    yaw: 0.0,
    pitch: 0.0,
    milestone: 'M10'
  },

  // M11: Hillside Route
  'm11_hillside_main': {
    zoneId: 'hillside_route',
    name: '山側步道 主徑起點',
    pos: [68.0, 1.7, -18.0],
    yaw: Math.PI / 2,
    pitch: -0.05,
    milestone: 'M11'
  },
  'm11_hillside_branch': {
    zoneId: 'hillside_route',
    name: '山側步道 生態池叉路口',
    pos: [42.0, 1.7, -25.0],
    yaw: -Math.PI * 0.75,
    pitch: -0.05,
    milestone: 'M11'
  },

  // M12: Ecological Pond
  'm12_pond_approach': {
    zoneId: 'ecology_pond',
    name: '生態池 步道入口',
    pos: [53.0, 1.15, -38.0],
    yaw: -Math.PI * 0.75,
    pitch: -0.05,
    milestone: 'M12'
  },
  'm12_pond_deck': {
    zoneId: 'ecology_pond',
    name: '生態池 觀景木棧台',
    pos: [61.0, 1.23, -42.5],
    yaw: 0.0,
    pitch: -0.08,
    milestone: 'M12'
  },
  'm12_pond_waterside': {
    zoneId: 'ecology_pond',
    name: '生態池 親水棧道平台',
    pos: [61.5, 0.84, -50.8],
    yaw: Math.PI,
    pitch: -0.05,
    milestone: 'M12'
  }
};
