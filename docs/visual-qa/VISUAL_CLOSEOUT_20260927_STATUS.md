# DutyNight visual/loading/cinematic closeout status

Current status: **IN_PROGRESS — PUBLIC VALIDATION PENDING**. `DEPLOYED_AND_VISUALLY_VERIFIED` is reserved for one release application SHA that passes M1–M9, WebGL material runtime audit, cold/warm loading, reviewed before/after visuals, and public Pages fingerprint plus public visual/story checks. A successful push or deploy workflow alone is not completion. This is also required by the [closeout specification](../DUTYNIGHT_VISUAL_LOADING_CG_CLOSEOUT_20260927.md).

## Source and scope

- Starting remote `master`: `a82cf1b5c186f69a9ba92162c345e96d3a56d12b` (verified by `git ls-remote origin refs/heads/master` on 2026-09-27). Work commit `1eede462362abb3facab7e4b4d20eb7a9ca18a59` was pushed to the feature branch; `master` and Pages remain on the starting revision.
- Work branch: `fix/visual-loading-closeout`; current application commit: `f0d66e8b7f12fbe2034b3614fdd06e613e84b327`. The original dirty `DutyNight` checkout was not modified.
- Historical ACT1 specifications do not remove the completed M1–M9, Bed 33, 6F, B2, Annie, or second-campus content. The current story contracts remain in [DN_V2_REMAINING_GAPS_CLOSEOUT_01.md](../DN_V2_REMAINING_GAPS_CLOSEOUT_01.md).
- The public Pages `build-info.json` was observed at the starting SHA before this work; no current work-branch release is claimed.

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
| M1–M9 browser story | `docs/visual-qa/evidence/20260927/story-playthrough-f0d66e8/result.json`: 11 milestones, 27 story frames, 5 motion frames, 3 functional frames, 4 interaction flows, zero errors/warnings; true-name handoff accepted. `sourceSha` is the application commit above. | Local PASS |
| Elevator travel cinematics | `docs/visual-qa/evidence/20260927/cinematic-travel-flows-f0d66e8/result.json`: 00:33 arrival from 4F→2F and erased-6F stop from 3F→4F; both finished, controls restored, no errors. `sourceSha` is the application commit above. | Local PASS |
| Material runtime | `docs/visual-qa/evidence/20260927/material-runtime.json`: PBR texture channels decoded and audited over 11 zone visits, zero errors. Run against the built application commit above. | Local PASS |
| GPU resources | `prototype/qa-results/browser-resources-final.json`: four whole-world cycles, 651 geometry / 32 texture each. | Local PASS; repeat on final revision |
| Cold/warm loading | `docs/visual-qa/evidence/20260927/loading-cold-warm.csv` and `.json`: 12 route samples, 0 errors/timeouts. | Local PASS |
| Before/after images | `docs/visual-qa/comparison/` contains 25 matched views. Current build capture: `docs/visual-qa/evidence/20260927/visual-after-f0d66e8/capture-manifest.json` records 88 captures, zero errors, and five skipped hillside/pond spawns not registered as playable zones. The original public baseline is pinned to `a82cf1b5c186f69a9ba92162c345e96d3a56d12b`; its single 4F duty-room detail capture warning is retained as baseline evidence. The 25-pair sheet was visually reviewed; current after frames have no capture warnings. | Local PASS |
| Skybridge return | `prototype/qa-results/bridge-horror/` has outbound, return stage 1 and stage 3 frames and state audit. The return white-coat runtime trigger is covered in M1–M9, but final public visual comparison remains pending. | Local pass; public check pending |
| Eight in-engine CG beats | Runtime paths exist for 21:17, 00:33, first 409/Bed 33, skybridge return, B2 closure, Patientization, true-name finale and erased-6F elevator stop. Current local evidence directly asserts the first 409 beat, 00:33 travel and erased-6F travel; a complete trigger-by-trigger cinematic matrix is still open. | Partial; public checks pending |
| Public Pages | Before release, `verify-live-build.mjs` confirmed the site served starting SHA `a82cf1b5c186f69a9ba92162c345e96d3a56d12b`. The application commit is approved for publication so the user can play it; exact public build fingerprint and public story/visual checks are still pending. | Publish now; final gate pending |

Publication is authorized. Keep the release status `IN_PROGRESS` until the public Pages fingerprint matches the application SHA and the public M1–M9, material runtime, cold/warm loading and visual before/after checks pass on that deployed version.

The five skipped hillside/pond debug spawns are not routes registered by `WorldRouter`; they are not counted as missing captures of playable zones. Keep every public check tied to the deployed application SHA; a successful push or Pages workflow alone does not close the gate.
