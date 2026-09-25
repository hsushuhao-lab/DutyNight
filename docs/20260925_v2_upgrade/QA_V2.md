# DutyNight 2.0 QA and release gate

No single state-machine PASS is sufficient. A release requires the current static suite, explicit V2 regression tests, production build, complete local and public browser playthroughs, required screenshot validation, independent visual/code review, and exact SHA deployment verification.

## Automated behavior and geometry

- `32` official first-campus 4F beds only: 401A–408D; 408C=31, 408D=32; 409 absent from census; 409A is anomalous bed 33.
- 403 insomnia only; 408C is the only knock complaint and plays four knocks / 1.5s pause / nine knocks.
- No player-facing 36-bed claim, 403 knock source, `KNOCK_403_49`, or `工號`.
- 20:05 ER phone audibly rings before its call line; ring also remains audible for 316, 21:15, 00:30/00:33, elevator, bridge lock, and identity alarms.
- No production portal, task, selector, or story choice reaches `hillside_route` or `ecology_pond`; M4 outbound and M5 return both use skybridge.
- M4 ordinary patient remains present and calms; only physical roster inspection grants 守; reject signature and keep correct-path treatment ordinary.
- M5 return threshold and look-back debounce/punishment progression; relic grants 恆 only on pickup.
- One shared Annie mannequin builder across static storage, bridge manifestation, and 6F CPR; synthetic face, training airway, jointed hands, rigid idle pose, CPR motion, and exact neck stethoscope inscription correct.
- 6F is elevator-hijack-only and absent from ordinary floors/task text; B2 grants full employee number; reconstruction and M9 require the complete exact identity pair.
- Duty-room washroom plaque absent, bathroom retained; no permanent wall clocks in key story spaces; bedside desk/phone and 0.8m circulation; no floating/occluded/penetrating props; ER monitor is separated from glass.

Run the existing mandatory suite from `prototype/` plus all V2 tests, then `npm run build`.

## Required fresh screenshots, local and public

Capture exactly these 24 named visual states at their explicit ART_QA spawns/camera targets:

1. M1 3F admin / 316
2. M1 3F storage Annie static
3. M1 Annie close inspection (vinyl face and neck stethoscope)
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
16. M5 stethoscope relic
17. M6 elevator display 6
18. M6 Annie CPR wide
19. M6 Annie CPR close
20. M7 first-campus 1F guard post
21. M7 B-Panel / concealed door
22. M7 B2 mirror 316
23. M9 dual identity form
24. M9 successful dawn ending

Screenshot timeout is a hard failure. Do not catch-and-warn or drop missing files. Every image must be a valid, fully rendered image at the requested viewport. Before capture, assert the named scene anchor is in the camera frustum and has a non-empty projected rectangle. Require the exact 24-file manifest, zero warnings, zero browser errors, and all 11 story milestones.

## Visual review

Review all 24 captures against the concept references and live scene anchors. Check wall/floor material, lighting phase, signage, furniture circulation, rail/door clipping, mannequin identity, framed subject, and Traditional-Chinese legibility. Hard failures are blockers. A focused code/design-system review and independent screenshot review must pass on the same source revision.

## P0 Annie Hero asset gate

This gate is additional to the 24 story screenshots above. The current procedural Annie is a development fallback; the formal Hero asset status remains `FUNCTIONAL_FALLBACK_READY / ART_HERO_ASSET_PENDING` until this gate passes. Run `node test_annie_hero_asset_qa.js` from `prototype/`. While either registered GLB is absent, the required result is `BLOCKED_BY_HERO_ASSET` with a nonzero exit code. That result is a truthful open release blocker, not a test-suite PASS and not permission to replace the Hero asset with scene-local primitives.

After both registered GLBs and the shared asset factory are present, capture the following eight additional 1440 × 900 browser images locally and on public Pages. Record the source SHA, asset SHA-256, camera transform, measured distance to the visible subject, viewport, and screenshot SHA-256 for every image.

| Required image | State | Camera distance | Required read |
|---|---|---:|---|
| `annie_storage_long.png` | M1 storage static | 8–12 m | Adult-sized white-coated figure; complete silhouette and grounded feet. |
| `annie_storage_close.png` | M1 storage static | 0.8–1.5 m | Smooth vinyl face, fixed unfocused eyes, airway, fine mold seam, coat fabric, and neck stethoscope. |
| `annie_bridge_long.png` | M5 bridge manifestation | 8–12 m | Same mannequin silhouette and coat as M1; empty-CPR staging reads in the bridge. |
| `annie_bridge_mid.png` | M5 bridge manifestation | 3–5 m | Rigid elongated posture and machine-like CPR action. |
| `annie_bridge_close.png` | M5 bridge manifestation | 0.8–1.5 m | Molded face and joints remain legible under the localized practical light. |
| `annie_floor6_cpr_long.png` | M6 floor 6 CPR | 8–12 m | Kneeling full-body pose, bed relation, and contact with the human-shaped burn silhouette. |
| `annie_floor6_cpr_close.png` | M6 floor 6 CPR | 0.8–1.5 m | Overlapped hands, locked elbows, fixed eyes, and synchronized compression motion. |
| `stethoscope_inspect.png` | M5 relic inspection | 0.3–0.6 m | Separate pickup prop; exact engraved inscription is readable and matches the neck-worn prop. |

All eight captures must succeed; timeout, absent anchor, occlusion, wrong distance, or unreadable required detail is FAIL. Review one 30-second CPR sample and record its measured compression rate, runtime frame time, draw calls, rendered triangles, and texture memory in ordinary 4F, Skybridge M5, and M6. Do not claim the Hero asset gate or visual release complete until the formal GLBs, asset QA, all eight local/public captures, current story QA, build, and exact public SHA verification pass together.

## Release proof

1. Local build/static suite and all 24 local shots pass on the candidate revision.
2. Fast Deploy Pages passes for the pushed commit.
3. Public `build-info.json` exact commit SHA matches the expected SHA; production module loads.
4. Public browser playthrough passes all story milestones and captures all 24 required images with zero screenshot warnings/errors.
5. Final `HEAD` and `origin/master` match; record commit SHA, workflow URLs, counts, artifact paths, and any remaining blocker.

Do not report COMPLETE if any functional, geometry, screenshot, visual-review, deployment, or SHA gate is missing or failed.
