# ER boundary audit and authorized repair

The supplied model lock passed the original engineering suite, but the ER corridor had six open shell boundaries. User explicitly authorized reproducing these defects and repairing only their boundaries while preserving all existing checks.

## Source and scope

`prototype/src/world/zones/FirstCampus2FER.js` creates the main corridor floor/ceiling at lines 57–58 (x −4…22, z −3.5…3.5). Adjacent rooms cover x 0…7 and 9…20 north, x 0…7 and 9…16 south. Their noncontiguous footprints left the following shell boundaries absent:

| Segment | x extent | z | Added centre / width |
|---|---:|---:|---|
| South arrival return | −4…0 | −3.5 | −2 / 4 m |
| North arrival return | −4…0 | 3.5 | −2 / 4 m |
| Treatment/charting junction | 7…9 | −3.5 | 8 / 2 m |
| Triage/observation junction | 7…9 | 3.5 | 8 / 2 m |
| South ambulance approach | 16…22 | −3.5 | 19 / 6 m |
| North ambulance approach | 20…22 | 3.5 | 21 / 2 m |

Repair loop immediately after corridor floor/ceiling adds only these full-height 3.2 m walls, 0.4 m thick, with matching colliders. Original collider coordinates, walkables and interactions remain intact.

## Reproduction and validation

`prototype/test_er_boundary_qa.js` samples each span every 0.25 m using player-height collision probes plus raycasts requiring a visible full-height shell. The pre-repair run fails all six. The first repair passed those six. Screenshot review then reproduced two room-side return omissions in the same x 7…9 shaft; the authorized final repair passes all eight.

Evidence:

- `.visual-work/er-boundary-before-fail.log`
- `.visual-work/er-boundary-after-pass.log`
- `.visual-work/er-authorized-model-diff.log` proves no removed original colliders, exactly eight expected additions, unchanged walkables/interactions.
- `.visual-work/er-model-qa.log`: 25/25 spawn.
- `.visual-work/er-traversal-qa.log`: 18/18 route, 8/8 door, 13/13 wall, 5/5 interaction, cleanup/state PASS.
- `.visual-work/er-build.log`: production build PASS.
- `.visual-work/after-er-final/capture-manifest.json`: 20 real production screenshots, no page/network errors, production debug hidden.

## Room-side shaft finding and authorized follow-up

The observation-room view still sees the nonwalkable x 7…9 void sideways: the observation footprint starts at x=9 but has no west return wall from z=3.5…9.5. Charting has the analogous missing west return x=9,z=−9.5…−3.5. The user-authorized same-gap boundary repair was confirmed by root. Added only west return walls at x=9, y=1.6, z=±6.5 with dimensions 0.4 × 3.2 × 6 m. The new regression failed both before repair (`.visual-work/er-return-before-fail.log`); the combined eight-boundary test now passes. Original colliders remain unchanged, with exactly eight matching additions; no walkable or interaction changes.

Screenshots show credible pleated curtains, supported signs and GLTF beds; they do not establish photorealistic reference fidelity. VISUAL_LOCK remains pending.

Final visual inspection: `after-er-final/m4_2f_er_bays_entrance.png` shows the former west-side sky/floor void replaced with a wall joined to ceiling and skirting. `triage_front.png` and `observation_front.png` are supplemental corridor viewpoints, using controller teleport rather than camera-only placement. The triage plaque is attached to the timber header and counter trim; curtains have actual pleats, rings and ceiling suspension. Remaining fidelity caveats: furniture is authored mid-detail rather than scanned photoreal assets; nursing work-area density and localized daylight are less rich than the supplied reference. These are not accepted VISUAL_LOCK debt.
