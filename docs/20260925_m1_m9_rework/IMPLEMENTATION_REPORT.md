# M1–M9 Rework Implementation Report

## Outcome

Implemented the authorized M1–M9 rework on the current `master` checkout. The historical Act 1-only statements remain historical; the 409A, 6F, B2, identity-takeover, and true-handoff sequence remains playable.

Durable source-of-truth documents:

- `MASTER_REWORK_SPEC.md` — canonical scope and design rules
- `TRUE_NAME_CLUE_MATRIX.md` — identity evidence and gates
- `SCENE_REWORK_MATRIX.md` — scene intent and visual progression
- `QA_ACCEPTANCE.md` — behavior, spatial, and release contracts

`README.md` links to this folder and warns agents not to treat Act 1 / v0.1 as the current scope.

## Implemented

- 4F census is 32 official beds; 408A–D are beds 29–32 and 409A remains an anomalous, non-census bed 33 behind a sealed 409 room.
- 403 normal-duty assessment, 408C four/pause/nine knock foreshadowing, Bed 33 evidence, and the one-time coffee observation are wired into persistent loop behavior.
- M3's legacy terminal now rings the physical 316 phone; answering it produces the identity contradiction before second-campus access is granted.
- M4 remains an ordinary anxiety/hyperventilation case. Its pre-filled 409A transfer is rejected through the normal clinical decision, and the `守` fragment comes from the physical roster clue.
- Either M5 route leads to Annie's equivalent physical stethoscope engraving. The clue is required before M5 completes; the skybridge locks only after midpoint commitment.
- The eligible elevator ride can divert to the phantom 6F; stairs do not. The lift spawn now faces the CPR scene. Ordinary HUD and floor selection do not reveal 6F early.
- Added the first-campus 1F guard-post fixture cluster and closed, permission-gated second-campus 1F access.
- True-name reconstruction requires all fragments plus `MED-870409`; M9 requires both `張守恆` and `MED-870409`.
- Lighting progresses from warm/neutral duty into darker late-night practicals and localized green spill. The phantom scene has a charred bed, recurring white-coated Annie, animated CPR, and compression sound.

## Verification

- All 14 static QA scripts in `MASTER_REWORK_SPEC.md` passed.
- `npm run build` passed (67 modules). Vite reports the production JS chunk is 1,140.58 kB, above its 1,000 kB advisory threshold.
- `node scripts/test-story-playthrough.mjs qa-results/story-local` passed M2–M9, including the override loop, 21:17/00:33 sequence, 316 phone gate, M4 clue pickup, both M5 route variants, phantom floor, B2 identity verification, and successful two-field M9 handoff.
- Browser result: `prototype/qa-results/story-local/result.json`; verdict `PASS`, 20 screenshots listed, zero screenshot warnings, and zero browser errors. Screenshot images are stored beside the result.
- `git diff --check` passed.

The browser playthrough uses the opt-in `?qa=story` bridge for checkpoint setup so it can test later milestones without skipping their runtime interaction handlers. Public mode was separately checked not to expose that bridge.

## Notes

Visuals remain stylized Three.js geometry rather than photorealistic assets. The pass improves time-of-night lighting, clinical set dressing, the 409 seal, the guard post, Annie's continuity, and the phantom CPR focal point while preserving the existing floorplan. Further art-asset work can build on these retained references and screenshots.
