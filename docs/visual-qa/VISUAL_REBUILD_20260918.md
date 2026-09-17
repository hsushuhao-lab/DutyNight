# DutyNight visual reconstruction evidence

Baseline: `31f9e1b039a42317989291a1657b9901a673e748` on master, fast-forward pull already up to date. Supplied visual ZIP SHA-256: `eeb1d13761a4fd2f21f12c4de26a883bc30a749205eb7787df9c5830fc281ec3`. All eight documents were read in the requested order; supplied archives and pre-existing untracked files are preserved.

## Acceptance

| Gate | Current status |
|---|---|
| MODEL_LOCK | PASS for the original suite and explicitly authorized defect repairs; see model-diff.json |
| VISUAL_LOCK | FAIL; remaining reference-fidelity issues are not waived |
| Public deployment | Tracked separately by the pushed commit’s GitHub Pages workflow; not visual acceptance |

The user authorized three bounded exceptions after reproduction: eight ER wall/collider returns; eight hillside path rotations (two source expressions); four 8F/Lobby wall/collider returns. All original collider boxes remain identical. All walkable counts, dimensions and positions remain identical; only the eight approved hillside rotations changed. Original interaction identifiers remain, with a closable duty-room door added. The structural differential is executable through `node prototype/scripts/compare-model-lock.mjs` and binds to the baseline commit above.

## Implemented

- Local GLTF/PBR caches, physical material repeats, fixed SSAO sampling, ACES output, zone lighting and shared-resource ownership.
- 3F sealed real glazing and campus context, 316 furniture/office details and inside-only duty instructions.
- 4F station work surfaces, care frontage, separate duty room, closable door with clearance protection and return-state persistence, bed/storage/bathroom details.
- HIS production interface retains existing clinical content; responsive layout and actual key/log/handoff actions verified in Chrome.
- ER curtains, beds, charting and mounted signage; approved boundary repairs.
- Lobby reception/seating, bridge visible connections/campus context, second-campus counters/door hardware/adjacent stair landing.
- Hillside surface correction, drainage/curbs/PBR ground; pond real planar scene reflection and supported deck/rail details.
- Production debug UI hidden; opt-in `?debug=1` remains for QA. No Act 2 or horror variants added.

## Engineering and browser verification

Original counts: spawn 25/25; traversal 18/18; doorway 8/8; wall containment 13/13; interaction reachability 5/5; cleanup 1/1 (20 cycles / 220 zone builds); state persistence 1/1. Extra tests cover ER 8/8, entry returns 4/4, hillside eight segments / 321 downward raycasts, door lifecycle, and shared GPU resource disposal contracts. Final verification at source commit `dcd4d1ca6c85ac81d3b6700a8ddd5b0bb069aff6`: all listed tests and build PASS; 100 captures with zero console, page or HTTP errors. Four full 11-zone revisits stabilize at 392 geometries / 49 textures. Runtime bundle `index-Cttcdlfd.js`, SHA-256 `fd5c33fbd40cf5b6637e88d6b95c42351f9851d2428bc45ba0654bfcbd3829ea`. See [verification record](evidence/verification.json).

`capture-visual-qa.mjs` captures all 25 spawn points in four views, 1440×900 Chrome. Detail is a narrower FOV at the same standing position; junction is a rotated camera, not a new collision test. It checks public debug visibility, browser errors, failed HTTP requests and severely blank frames. These checks do not establish visual acceptance.

`test-browser-flow.mjs` exercises E-key pickup, duty-log signing, HIS signing, duty-door closing and zone-return persistence. HIS screenshots cover 1440, 768 and 375px widths.

## Comparison evidence and limits

[Matched before/after comparison](comparison/index.html) contains 25 entrance pairs from identical camera poses. Full before/after four-view PNG matrices are retained locally under `.visual-work/`; final capture manifests and selected evidence are published with this report. Intermediate black composer captures (`after-4f`, `after-3f-contact`) are invalid and superseded, not acceptance evidence.

The latest ER exterior and bridge-end regression are repaired and visually rechecked. Remaining visual debt must be reviewed honestly: original furniture is authored mid-detail rather than scanned; some counters, doors and distant campus buildings still have simple silhouettes; workstation density and restrained wear are below the supplied photoreal references. Do not infer complete photorealism from this report, asset format or engineering results.

## Reproduce

From repository root, run the original two QA scripts, `prototype/test_duty_room_door_qa.js`, `prototype/test_er_boundary_qa.js`, `prototype/test_entry_boundary_qa.js`, `prototype/test_hillside_surface_qa.js`, `prototype/test_art_resources_qa.js`, and `prototype/scripts/compare-model-lock.mjs`. Build with `npm --prefix prototype run build`. Then run the browser capture/flow/resource scripts sequentially because each uses local port 4173. Chrome is required by those scripts.

## Final acceptance boundary

This is a tested reconstruction candidate, not a completed visual release. MODEL_LOCK = PASS and VISUAL_LOCK = FAIL. The unresolved work is to replace simplified hero furniture and cabinetry with higher-fidelity assets, improve workplace density and material variation, remove the distant terrain repetition and establish more convincing campus planting. Night-state and later horror acceptance remain deferred until the ordinary baseline passes. See [independent visual review](FINAL_VISUAL_REVIEW_20260918.md).
