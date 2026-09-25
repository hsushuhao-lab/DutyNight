# DutyNight 2.0 QA and release gate

No single state-machine PASS is sufficient. A release requires the current static suite, explicit V2 regression tests, production build, complete local and public browser playthroughs, required screenshot validation, independent visual/code review, and exact SHA deployment verification.

## Automated behavior and geometry

- `32` official first-campus 4F beds only: 401A–408D; 408C=31, 408D=32; 409 absent from census; 409A is anomalous bed 33.
- 403 insomnia only; 408C is the only knock complaint and plays four knocks / 1.5s pause / nine knocks.
- No player-facing 36-bed claim, 403 knock source, `KNOCK_403_49`, or `工號`.
- 20:05 is a physical Jane Doe with unknown identity; the ER phone rings and must be answered before the consult objective. 00:33 is an existing 1998-ER-0217 registration with no patient in the ER; never reuse Jane Doe or frame it as another unidentified-patient encounter. The 00:30 ER call rings and must be answered before the registration objective.
- All story calls (316, 20:05 ER, 21:15, 00:30/00:33) audibly ring before answer; the 21:15 and 00:33 objectives remain hidden until E answer.
- No production portal, task, selector, or story choice reaches `hillside_route` or `ecology_pond`; M4 outbound and M5 return both use skybridge.
- M4 ordinary patient remains present and calms; only physical roster inspection grants 守; reject signature and keep correct-path treatment ordinary.
- M5 return threshold and look-back debounce/punishment progression; bridge Annie holds both arms straight with hands overlapped, and no true-name relic appears on the bridge. On 6F, search and inspect the separate stethoscope before its inscription grants 恆.
- One shared `prototype/src/art/AnnieArt.js` factory across 3F storage, bridge manifestation, and 6F CPR; rounded mannequin geometry (no Annie `BoxGeometry`), blank synthetic face with one nose only, no eyes/mouth/chest items, mold seams, overlapped bridge/CPR hands, static storage, moving CPR, and exact inscription on the separate stethoscope clue prop.
- 6F is elevator-hijack-only and absent from ordinary floors/task text; B2 grants full employee number; reconstruction and M9 require the complete exact identity pair.
- Duty-room washroom plaque absent, bathroom retained; no permanent wall clocks in key story spaces; bedside desk/phone and 0.8m circulation; no floating/occluded/penetrating props; ER monitor is separated from glass.
- M7 1F guard-post flow must be played from the main-lobby spawn: walk to the physical desk, aim at its CCTV/work surface, confirm `[E] 檢查舊警衛台`, press E, and confirm the objective changes while the frame, lock and purple indicator become visible. Walk to the physical frame, confirm its `[E]` prompt, then press E and reach the 02:17 choice; do not call either interaction handler directly in browser QA.

Run the existing mandatory suite from `prototype/` plus all V2 tests, then `npm run build`.

## Required fresh screenshots, local and public

Capture exactly these 26 named visual states at their explicit ART_QA spawns/camera targets:

1. M1 3F admin / 316
2. M1 3F storage Annie static
3. M1 Annie close inspection (nose-only vinyl face and clear chest)
4. M2 4F nursing station
5. M2 4F duty room
6. M2 408C
7. M2 sealed 409
8. M3 ER nursing station
9. M3 00:33 registration
10. M3 316 legacy terminal + ringing phone
11. M4 second-campus ordinary patient
12. M4 pre-filled transfer form
13. M4 守 roster clue
14. M5 outbound bridge baseline
15. M5 return bridge Annie
16. M5 bridge Annie close
17. M6 elevator display 6
18. M6 Annie CPR long
19. M6 searched stethoscope relic and inscription
20. M6 Annie CPR medium
21. M6 Annie CPR close
22. M7 first-campus 1F guard post
23. M7 B-Panel / concealed door
24. M7 B2 mirror 316
25. M9 dual identity form
26. M9 successful dawn ending

Screenshot timeout is a hard failure. Do not catch-and-warn or drop missing files. Every image must be a valid, fully rendered image at the requested viewport. Before capture, assert the named scene anchor is in the camera frustum and has a non-empty projected rectangle. Require the exact 26-file manifest, zero warnings, zero browser errors, and all 10 recorded story milestones.

## Visual review

Review all 26 captures against the concept references and live scene anchors. Check wall/floor material, lighting phase, signage, furniture circulation, rail/door clipping, mannequin identity, framed subject, and Traditional-Chinese legibility. Hard failures are blockers. A focused code/design-system review and independent screenshot review must pass on the same source revision.

## P0 Annie V2 procedural art release gate

This gate replaces the former Hero GLB gate for this release. `BLOCKED_BY_HERO_ASSET` is not a release status here. Do not wait for external GLBs or run license research. A GLB is optional `FUTURE ART POLISH`.

Run `node test_v2_annie_identity_qa.js` from `prototype/`, then run the full 26-shot story browser playthrough. Use these shots from that manifest as the Annie visual evidence set and save the actual camera-to-subject distance with the release QA record:

| Story capture | State / distance | Required read |
|---|---|---|
| `m1-3f-storage-annie-static.png` | 3F static / room medium | Full seated mannequin, same coat/scrub palette, grounded shoes, readable storage context. |
| `m1-annie-close-inspection.png` | 3F static / close | Smooth vinyl face with one molded nose, no eyes or mouth, fine seam, and clear chest. |
| `m5-outbound-bridge-baseline.png` | Bridge / 8–12 m | Full recognizable white-coated silhouette with arms extended and hands overlapped. |
| `m5-return-bridge-annie.png` | Bridge / 3–5 m | Same geometry/material identity, rigid stance, held gaze, hands still lifted. |
| `m5-bridge-close-annie.png` | Bridge / 0.8–1.5 m | Close blank nose-only face, molded vinyl, lifted overlapped hands, and clear chest. |
| `m6-annie-cpr-long.png` | 6F CPR / 8–12 m | Room context and the kneeling figure at the bedside. |
| `m6-annie-cpr.png` | 6F CPR / medium (about 3.2 m, side view) | Kneeling relation to bed and patient silhouette, contact and contact shadow visible. |
| `m6-annie-cpr-close.png` | 6F CPR / 0.8–1.5 m | Mechanical press/release, stacked hands touching the patient, nose-only blank face, and coat material detail. |

All eight captures must be fresh and composed correctly. Screenshots must be genuine browser captures at 1440 × 900, with valid named anchors in frame, no timeout/warnings/browser errors, and readable Traditional Chinese. The run also saves three bridge-idle frames and three CPR press/release frames with camera distance and SHA-256 evidence. The 26-story suite must pass all story milestones locally and on public Pages; the production build must pass; the deployed build fingerprint must match the exact pushed SHA. These conditions mark the procedural release complete without a Hero GLB.

The old `test_annie_hero_asset_qa.js` and the GLB/PBR/rig/export requirements in `ANNIE_VISUAL_REWORK_SPEC.md` are future-art-polish checks only. Their absence or failure must not block this procedural release.

## Release proof

1. Local build/static suite and all 26 local shots pass on the candidate revision.
2. Fast Deploy Pages passes for the pushed commit.
3. Public `build-info.json` exact commit SHA matches the expected SHA; production module loads.
4. Public browser playthrough passes all story milestones and captures all 26 required images with zero screenshot warnings/errors.
5. Final `HEAD` and `origin/master` match; record commit SHA, workflow URLs, counts, artifact paths, and any remaining blocker.

Do not report COMPLETE if any functional, geometry, screenshot, visual-review, deployment, or SHA gate is missing or failed.
