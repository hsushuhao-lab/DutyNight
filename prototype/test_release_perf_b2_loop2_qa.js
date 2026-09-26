import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync('./src/main.js','utf8');
const ui=readFileSync('./src/ui/UIManager.js','utf8');
const assets=readFileSync('./src/art/AssetRegistry.js','utf8');
const materials=readFileSync('./src/art/MaterialRegistry.js','utf8');
const campus=readFileSync('./src/art/CampusBackdrop.js','utf8');
const b2=readFileSync('./src/world/zones/B2Archive.js','utf8');
const routes=readFileSync('./src/world/shared/WorldRoutes.js','utf8');

// Startup: no heavyweight synchronous preload before the first frame.
assert(!main.includes('await Promise.all([preloadAssets(), preloadMaterials()])'),'startup must not block on full GLTF/PBR preload');
assert(main.includes('await preloadCriticalAssets()'),'opening scene must wait only for critical 3F furniture');
for(const asset of ['officeChair','storageCabinet','workDesk','printer','bench','plant'])assert(assets.includes(`'${asset}'`),'opening critical asset missing: '+asset);
assert(main.includes('requestIdleCallback(deferredHospitalAssets'),'indoor quality assets must preload after first paint');
assert(main.includes('preloadCampusBackdropAssets()'),'3F backdrop assets must also begin deferred preload after first paint');
assert(main.includes('prepareLoopReset:()=>Promise.all([preloadAssets(),preloadMaterials(),preloadCampusBackdropAssets()])'),'loop reset must prepare complete 3F art before rebuilding');
const loopManager=readFileSync('./src/core/LoopManager.js','utf8');
assert(loopManager.includes('await this.loopResetPreparation'),'loop reset must await art/material readiness before loadZone');
assert(ui.includes('async finishLoopCutscene()')&&ui.includes("body.textContent='場景重建中……'")&&ui.includes('await result'),'patientization cutscene must remain active while loop art finishes loading');
assert(ui.includes("if(el===this.loopCutscene)return;"),'loop reset overlay cleanup must not expose the old scene before the rebuilt 3F is ready');

// Batch split: outdoor assets and textures are not part of the indoor preload.
assert(assets.includes("outdoorAssets = new Set(['shrub', 'fern', 'campusTree'])"),'outdoor GLTF split missing');
assert(materials.includes("outdoorSurfaces = new Set(['ground', 'asphalt'])"),'outdoor PBR split missing');
assert(campus.includes('preloadCampusBackdropAssets'),'campus backdrop preload hook missing');

// Transition prefetch: destination resources begin loading while elevator/stair transition is visible.
assert(ui.includes("openTravelSelector(destinations, currentZone, onSelect, kind = 'elevator', onPrefetch = null)"),'travel prefetch callback missing');
assert(ui.includes('const preloadPromise=Promise.resolve(onPrefetch?.(destination))'),'destination preload must start at transition start');
assert(ui.includes('await preloadPromise'),'arrival must wait for required indoor assets and PBR before zone construction');
assert(!ui.includes('preloadDeadline'),'required indoor art must never be bypassed by an arbitrary timeout');
for(const zone of ['first_campus_1f','first_campus_2f','first_campus_8f']) {
  assert(main.includes(zone),zone+' must be included in campus backdrop prefetch destinations');
}
assert(main.includes('prefetchDestinationAssets'),'main travel flow must provide destination prefetch');
assert(main.includes("blockingCampusBackdropZones = new Set(['first_campus_1f','first_campus_8f'])"),'1F/8F may await full campus backdrop');
assert(main.includes("nonBlockingCampusBackdropZones = new Set(['first_campus_2f'])"),'2F ER backdrop must be non-blocking');
assert(main.includes("void preloadCampusBackdropAssets().catch"),'2F ER should start outdoor backdrop loading without awaiting it');
assert(main.includes('preloadAssets()')&&main.includes('preloadMaterials()'),'travel transition must finish pending indoor assets before arrival');

// B2: terminal + one-way door, no staircase, exit lands behind 1F guard post and cannot be re-entered.
assert(b2.includes("type:'b2_exit_door'")&&!b2.includes('B2_EscapeStairwell'),'B2 must have a door exit and no stairwell');
assert(routes.includes("first_1f_guard_back"),'B2 return spawn must be behind the 1F guard post');
assert(main.includes("B2_EXITED_PERMANENTLY"),'B2 one-way exit lockout missing');
assert(main.includes("M7_IDENTITY_RESOLVED_AT_316"),'B2 fail-forward must allow deferred identity reconstruction at 316');
assert(main.includes("getDeferred316IdentityMissing"),'deferred 316 evidence audit missing');
assert(!ui.includes('沿 B2 逃生梯返回'),'B2 task board must not tell the player to use a removed staircase');
assert(!ui.includes('沿逃生梯離開封存層'),'B2 completion task must use the one-way door, not a staircase');
const b2FailForward=ui.indexOf("this.gameState.getFlag('B2_EXITED_PERMANENTLY')&&!this.gameState.getFlag('M7_B2_RESOLVED')");
const b2ReopenPrompt=ui.indexOf("this.gameState.getFlag('M6_FLOOR6_RESOLVED')&&!this.gameState.getFlag('M7_B2_OPEN')");
assert(b2FailForward>=0&&b2ReopenPrompt>=0&&b2FailForward<b2ReopenPrompt,'permanent B2 exit must take precedence over the service-door objective');

// Loop 2: fast path can skip chores but cannot hide the admin evidence.
const adminBranch=main.slice(main.indexOf("['admin_roster_3f','admin_printer_doc_3f','admin_drawer_manual_3f']"),main.indexOf("} else if (interactable.type === 'spare_key_316')"));
assert(adminBranch.includes('openArchiveDocument'),'admin documents must remain readable after loop reset');
assert(!adminBranch.includes("if(gameState.getFlag('FAST_PATH_3F'))"),'FAST_PATH_3F must not suppress admin evidence');
assert(main.includes("if(!gameState.getFlag('FOUND_316_SPARE_KEY'))"),'loop fast path must still require the patrol-point spare key');
assert(main.includes("prefetchDestinationAssets({zoneId:'first_campus_4f'})"),'316 fast-path phone must preload 4F before card pickup');
const fastPhone=main.slice(main.indexOf("gameState.getFlag('FAST_PATH_3F')&&gameState.getFlag('PHONE_RING_ACTIVE')"),main.indexOf("}else if(gameState.getFlag('SECOND_CAMPUS_PHONE_PENDING'))"));
assert(!fastPhone.includes("markTaskComplete('KEY_PICKUP')")&&!fastPhone.includes("setFlag('STAFF_ACCESS_CARD',true)"),'fast phone must leave key and card in the locker');

console.log('LOADING / B2 / LOOP2 REGRESSION QA PASS');
