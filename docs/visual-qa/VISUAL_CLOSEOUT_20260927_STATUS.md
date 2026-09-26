# DutyNight visual/loading/cinematic closeout status

Current status: **IN_PROGRESS**. `DEPLOYED_AND_VISUALLY_VERIFIED` is reserved for the full gate in [the current closeout specification](../DUTYNIGHT_VISUAL_LOADING_CG_CLOSEOUT_20260927.md). This file records current evidence and gaps so the GitHub repository remains the long-term handoff source.

## Source and scope

- Starting remote `master`: `a82cf1b5c186f69a9ba92162c345e96d3a56d12b` (verified by `git ls-remote origin refs/heads/master` on 2026-09-27).
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
| M1–M9 browser story | Reaches M9 and accepts true name; a clean run against the corrected 27-frame manifest is running. | Pending final PASS |
| Material runtime | `prototype/qa-results/material-runtime.json` reports mapped and decoded PBR surfaces over 11 zone visits. | Local PASS; repeat on final revision |
| GPU resources | `prototype/.visual-work/browser-resources.json`: four whole-world cycles, 651 geometry / 32 texture each. | Local PASS; repeat on final revision |
| Cold/warm loading | `prototype/qa-results/LOADING_PERFORMANCE_BEFORE.csv` and `LOADING_PERFORMANCE_AFTER.csv` contain baseline and local measurements. The old public transitions timed out; final revision and remaining routes need measurement. | Partial |
| Before/after images | 108 captures each under `prototype/qa-results/visual-before` and `visual-after`; the capture gate flagged pond detail framing, plus old 4F duty detail. | FAIL; recapture and review |
| Skybridge return | `prototype/qa-results/bridge-horror/` has outbound, return stage 1 and stage 3 frames and state audit. Visual contrast remains conservative. | Partial art pass |
| Eight in-engine CG beats | Not yet implemented or QA verified. | Open release blocker |
| Public Pages | Existing Pages still serves the starting master. | Not deployed/verified |

No merge to `master`, Pages deployment, or `DEPLOYED_AND_VISUALLY_VERIFIED` claim is authorized by the current evidence.

Correction to the before/after row: the original 108-frame script teleported across coordinates without loading each destination zone. Some named captures, including pond detail, show the wrong scene. These image sets are not accepted as complete visual evidence. The script now verifies the loaded zone and lists unregistered spawns; a fresh before/after run is required.
