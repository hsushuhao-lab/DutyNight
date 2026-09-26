# DutyNight visual/loading/cinematic closeout status

Current status: **IN_PROGRESS**. `DEPLOYED_AND_VISUALLY_VERIFIED` is reserved for the full gate in [the current closeout specification](../DUTYNIGHT_VISUAL_LOADING_CG_CLOSEOUT_20260927.md). This file records current evidence and gaps so the GitHub repository remains the long-term handoff source.

## Source and scope

- Starting remote `master`: `a82cf1b5c186f69a9ba92162c345e96d3a56d12b` (verified by `git ls-remote origin refs/heads/master` on 2026-09-27). Work commit `1eede462362abb3facab7e4b4d20eb7a9ca18a59` was pushed to the feature branch; `master` and Pages remain on the starting revision.
- Work branch: `fix/visual-loading-closeout` in a clean worktree. The original dirty `DutyNight` checkout was not modified.
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
| M1–M9 browser story | `prototype/qa-results/story-playthrough-final/result.json`: 11 milestones, 27 story frames, 5 motion frames, 3 functional frames, 4 flows, zero errors or screenshot warnings; true-name handoff accepted. This is a local browser run against the work tree before the commit was made, not SHA-pinned public evidence. | Local PASS; repeat on final revision |
| Material runtime | `prototype/qa-results/material-runtime.json`: mapped and decoded PBR surfaces over 11 zone visits. | Local PASS; repeat on final revision |
| GPU resources | `prototype/qa-results/browser-resources-final.json`: four whole-world cycles, 651 geometry / 32 texture each. | Local PASS; repeat on final revision |
| Cold/warm loading | `prototype/qa-results/LOADING_PERFORMANCE_FINAL.csv`: 12 browser rows, zero errors; cold opening 3.424 s and slowest measured transition 5.428 s. Warm 2F/1F transfers still account for about 16.4 MB, so resource attribution needs review before calling the optional load budget fully clean. | Local timing PASS; byte-budget review open |
| Before/after images | Corrected zone-aware local capture: `prototype/qa-results/visual-after-corrected/capture-manifest.json` records 88 frames, zero errors, and five explicitly skipped unregistered hillside/pond spawns. Public baseline captured 88 frames but flagged an underexposed 4F duty-room detail. The earlier 108-frame sets are invalid because they did not switch zones. The new fixed-spawn images still start at 17:00 and some detail views face a wall, so they are not a complete story-state visual review. | Partial; curated comparison and visual fixes open |
| Skybridge return | `prototype/qa-results/bridge-horror/` has outbound, return stage 1 and stage 3 frames and state audit. Visual contrast remains conservative. | Partial art pass |
| Eight in-engine CG beats | Not yet implemented or QA verified. | Open release blocker |
| Public Pages | Existing Pages still serves the starting master. | Not deployed/verified |

No merge to `master`, Pages deployment, or `DEPLOYED_AND_VISUALLY_VERIFIED` claim is authorized by the current evidence.

The five skipped hillside/pond debug spawns are not routes registered by `WorldRouter`; they are not counted as missing captures of playable zones. The full visual gate still requires time- and story-state-specific comparison, especially the return skybridge and eight requested in-engine CG beats.
