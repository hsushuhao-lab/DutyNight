import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync('./src/main.js','utf8');
const ward=readFileSync('./src/world/shared/WardFloorplan.js','utf8');
const floor3=readFileSync('./src/world/zones/FirstCampus3F.js','utf8');

// 4F and second-campus 5F reporting must be completed by opening a ward access door.
assert(main.includes('function completeFirstCampus4FWardReport()'),'4F door-report helper missing');
assert(main.includes('function completeSecondCampus5FWardReport()'),'second-campus 5F door-report helper missing');
assert(main.includes("if(worldRouter.activeZoneId==='first_campus_4f')completeFirstCampus4FWardReport()"),'4F access-door opening must complete report');
assert(main.includes("if(worldRouter.activeZoneId==='second_campus_5f')completeSecondCampus5FWardReport()"),'second-campus 5F access-door opening must complete report');
assert(main.includes('const openedNow=changed&&wasClosed&&!door.closed'),'door-report must fire only when a closed access door is actually opened');
assert(main.includes('door===zone.wardDoor')&&main.includes('door===zone.innerWardDoor')&&main.includes('door===zone.glassBypassDoor'),'all supported ward access routes must count as arrival/report');

assert(ward.includes("id:'4F_NURSING_REPORT_BOARD',type:'decorative'"),'4F nursing information board should remain visual, not a required report hotspot');
assert(!ward.includes("action:'NURSE_REPORT',label:'查看值班資訊並向護理站報到'"),'old 4F manual nursing-report interaction must be removed');
assert(ward.includes("interactable:false,id:'SECOND_5F_NURSING_REPORT',type:'decorative'"),'second-campus 5F manual report hotspot must be disabled');
assert(!ward.includes("this.interactables.push(report);this.secondCampusNursingReport=report"),'second-campus manual report hotspot must not be registered');

// 3F guard checkpoint sensors must sit directly on the visible board.
assert(floor3.includes("patrolFace.position.set(19,1.38,1.625)"),'visible 3F patrol board anchor drifted');
assert(floor3.includes("new THREE.BoxGeometry(.66,.58,.18)"),'checkpoint board sensor should be compact and board-sized');
assert(floor3.includes("patrolHit.position.set(19,1.38,1.58)"),'initial checkpoint interaction must be on the board');
assert(floor3.includes("futureSignHit.position.set(19,1.38,1.58)"),'21:17 checkpoint interaction must reuse the board position');
assert(floor3.includes("guardPatrolPoint={id:'3F_GUARD_PATROL_POINT',position:[19,1.38,1.625]"),'patrol metadata must match the visible board');

console.log('WARD DOOR REPORT / 3F CHECKPOINT ALIGNMENT QA PASS');
