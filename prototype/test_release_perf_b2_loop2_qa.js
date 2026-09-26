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
assert(main.includes('requestIdleCallback(deferredHospitalAssets'),'indoor quality assets must preload after first paint');

// Batch split: outdoor assets and textures are not part of the indoor preload.
assert(assets.includes("outdoorAssets = new Set(['shrub', 'fern', 'campusTree'])"),'outdoor GLTF split missing');
assert(materials.includes("outdoorSurfaces = new Set(['ground', 'asphalt'])"),'outdoor PBR split missing');
assert(campus.includes('preloadCampusBackdropAssets'),'campus backdrop preload hook missing');

// Transition prefetch: destination resources begin loading while elevator/stair transition is visible.
assert(ui.includes("openTravelSelector(destinations, currentZone, onSelect, kind = 'elevator', onPrefetch = null)"),'travel prefetch callback missing');
assert(ui.includes('const preloadPromise=Promise.resolve(onPrefetch?.(destination))'),'destination preload must start at transition start');
assert(ui.includes('await preloadPromise'),'arrival must wait for required destination assets');
for(const zone of ['first_campus_1f','first_campus_2f','first_campus_8f']) {
  assert(main.includes(zone),zone+' must be included in campus backdrop prefetch destinations');
}
assert(main.includes('prefetchDestinationAssets'),'main travel flow must provide destination prefetch');
assert(main.includes('prefetchDestinationAssets = destination => Promise.all(['),'destination prefetch must await all staged asset groups');
assert(main.includes('preloadAssets()')&&main.includes('preloadMaterials()'),'travel transition must finish pending indoor assets before arrival');

// B2: terminal + one-way door, no staircase, exit lands behind 1F guard post and cannot be re-entered.
assert(b2.includes("type:'b2_exit_door'")&&!b2.includes('B2_EscapeStairwell'),'B2 must have a door exit and no stairwell');
assert(routes.includes("first_1f_guard_back"),'B2 return spawn must be behind the 1F guard post');
assert(main.includes("B2_EXITED_PERMANENTLY"),'B2 one-way exit lockout missing');
assert(main.includes("M7_IDENTITY_RESOLVED_AT_316"),'B2 fail-forward must allow deferred identity reconstruction at 316');
assert(main.includes("getDeferred316IdentityMissing"),'deferred 316 evidence audit missing');
assert(!ui.includes('沿 B2 逃生梯返回'),'B2 task board must not tell the player to use a removed staircase');
assert(!ui.includes('沿逃生梯離開封存層'),'B2 completion task must use the one-way door, not a staircase');
const b2FailForward=ui.indexOf("B2_EXITED_PERMANENTLY");
const b2ReopenPrompt=ui.indexOf("M6_FLOOR6_RESOLVED");
assert(b2FailForward>=0&&b2FailForward<b2ReopenPrompt,'permanent B2 exit must take precedence over the service-door objective');

// Loop 2: fast path can skip chores but cannot hide the admin evidence.
const adminBranch=main.slice(main.indexOf("['admin_roster_3f','admin_printer_doc_3f','admin_drawer_manual_3f']"),main.indexOf("} else if (interactable.type === 'spare_key_316')"));
assert(adminBranch.includes('openArchiveDocument'),'admin documents must remain readable after loop reset');
assert(!adminBranch.includes("if(gameState.getFlag('FAST_PATH_3F'))"),'FAST_PATH_3F must not suppress admin evidence');

console.log('LOADING / B2 / LOOP2 REGRESSION QA PASS');
