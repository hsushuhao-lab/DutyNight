# DutyNight visual/loading/cinematic closeout status

Current status: **IN_PROGRESS — PUBLIC STORY / COLD-WARM VALIDATION OPEN**. `DEPLOYED_AND_VISUALLY_VERIFIED` is reserved for one release application SHA that passes M1–M9, WebGL material runtime audit, cold/warm loading, reviewed before/after visuals, and public Pages fingerprint plus public visual/story checks. A successful push or deploy workflow alone is not completion. This is also required by the [closeout specification](../DUTYNIGHT_VISUAL_LOADING_CG_CLOSEOUT_20260927.md).

## Source and scope

- Current remote `master` and public Pages fingerprint: `3694d7b5167ad956c850bf7a9cc066473927811e`. Fast Deploy run `36278693092` succeeded and verified the public fingerprint at `2026-09-26T23:12:44Z` (scope `floorplan-access-20260920`). The application code is `f0d66e8b7f12fbe2034b3614fdd06e613e84b327`; `3694d7b` adds the release evidence/status documentation.
- Work branch: `fix/visual-loading-closeout`; current application commit: `f0d66e8b7f12fbe2034b3614fdd06e613e84b327`. The original dirty `DutyNight` checkout was not modified.
- Historical ACT1 specifications do not remove the completed M1–M9, Bed 33, 6F, B2, Annie, or second-campus content. The current story contracts remain in [DN_V2_REMAINING_GAPS_CLOSEOUT_01.md](../DN_V2_REMAINING_GAPS_CLOSEOUT_01.md).
- The public Pages build fingerprint is verified at `3694d7b`; this confirms deployment only and does not close the story, loading, or visual release gates.

## Implemented in the work branch

- Hospital PBR material loading uses zone essential manifests and real mesh runtime audit, while large outdoor vegetation loads after entry. Outdoor props use temporary low-cost silhouettes until the model resolves.
- Cold and warm loading measurement uses the visible elevator flow and records bytes and timings.
- Zone cleanup disposes its light shadow maps. The browser GPU test held at 651 geometries and 32 textures over four whole-world cycles.
- Successful B2 verification no longer returns the objective to the old 1F doorframe. The final handoff refreshes a completed objective.
- The story QA debug loader now preloads the selected zone's essential art before direct scene capture. Its expected screenshot manifest includes the existing CCTV playback frame.
- Skybridge return now has staged damaged ceiling fixtures, low-frequency flicker, light attenuation and thin fog. Outdoor sky gets deterministic sparse deep-night stars that fade before dawn. Obsolete pond reflection actor and interaction were removed; pond terrain remains.

## Gate evidence and open work

| Gate | Current evidence | Status |
| --- | --- | --- |
| M1–M9 browser story | The committed local run `docs/visual-qa/evidence/20260927/story-playthrough-f0d66e8/result.json` passed 11 milestones, 27 story frames, 5 motion frames, 3 functional frames, and 4 interaction flows on application SHA `f0d66e8`. CI Story Browser Playthrough `36278693117` on deployed SHA `3694d7b` failed in CPR release-frame sampling (`motionShot`, 10 s wait); the public M2–M9 stage was skipped. | Local PASS; release CI FAIL, fix and repeat |
| Elevator travel cinematics | The committed `cinematic-travel-flows-f0d66e8/result.json` is `FAIL`: it timed out waiting for the 2F elevator option and recorded no flows. The M1–M9 story artifact includes these narrative milestones, but this standalone travel run is not a pass. | FAIL; rerun after fixing its setup/route |
| Material runtime | `docs/visual-qa/evidence/20260927/material-runtime.json`: PBR texture channels decoded and audited over 11 zone visits with zero errors on application SHA `f0d66e8`. A manual public audit on `3694d7b` was observed to pass, but a SHA-pinned public report is not yet committed. | Local PASS; public evidence needs recording |
| GPU resources | `prototype/qa-results/browser-resources-final.json`: four whole-world cycles, 651 geometry / 32 texture each. | Local PASS; repeat on final revision |
| Cold/warm loading | `docs/visual-qa/evidence/20260927/loading-cold-warm.csv` and `.json`: 12 local route samples, zero errors/timeouts on application SHA `f0d66e8`. Public attempts on `3694d7b` were inconsistent: some startup waits exceeded 120 s and a later run completed only part of the route set. | Local PASS; public audit incomplete |
| Before/after images | `docs/visual-qa/comparison/` contains 25 matched views. Current capture `visual-after-f0d66e8/capture-manifest.json` records 88 local captures with zero errors. The pair set was reviewed locally against the baseline pinned to `a82cf1b5c186f69a9ba92162c345e96d3a56d12b`; public visual review against deployed `3694d7b` is not recorded yet. | Local PASS; public review open |
| Skybridge return | `prototype/qa-results/bridge-horror/` has outbound, return stage 1 and stage 3 frames and state audit. The return white-coat runtime trigger is covered in M1–M9, but final public visual comparison remains pending. | Local pass; public check pending |
| Eight in-engine CG beats | Runtime paths exist for 21:17, 00:33, first 409/Bed 33, skybridge return, B2 closure, Patientization, true-name finale and erased-6F elevator stop. Current local evidence directly asserts the first 409 beat, 00:33 travel and erased-6F travel; a complete trigger-by-trigger cinematic matrix is still open. | Partial; public checks pending |
| Public Pages | Fast Deploy run `36278693092` succeeded and `verify-live-build.mjs` observed exact public fingerprint `3694d7b5167ad956c850bf7a9cc066473927811e` at `2026-09-26T23:12:44Z`. The same-SHA story run `36278693117` failed before public M2–M9 ran; public cold/warm and before/after visual checks remain open. | Deployed; visual/story gate incomplete |

Publication is verified at `3694d7b`; keep the release status `IN_PROGRESS` until same-release M1–M9 passes, public material runtime evidence is recorded, public cold/warm and before/after checks pass, and public Pages is reverified for that release.

The five skipped hillside/pond debug spawns are not routes registered by `WorldRouter`; they are not counted as missing captures of playable zones. Keep every public check tied to the deployed application SHA; a successful push or Pages workflow alone does not close the gate.
