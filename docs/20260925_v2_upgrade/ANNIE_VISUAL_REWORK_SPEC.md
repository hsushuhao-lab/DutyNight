# ART-CHAR-ANNIE-HERO-V2 — Procedural Mannequin Release Contract

Priority: P0 — procedural art release
Revision: 2026-09-25
Status: `LOCAL_QA_PASS / PUBLIC_PAGES_PENDING`

This specification defines the shippable Annie V2 Procedural Mannequin for the current release. It supersedes the previous rule that required an external Hero GLB. A Hero GLB and license research are not needed for this release; they are optional `FUTURE ART POLISH`. The M1–M9 story, Annie's identity, and her narrative role remain unchanged.

## Read at a glance

Annie reads as a 165 cm clothing mannequin / old CPR training dummy in 張守恆's aged white coat. Use normal adult proportions and smooth, rounded Sphere/Capsule/Cylinder/Lathe/Torus geometry. Annie's body, coat, limbs, hands, and shoes must not use `BoxGeometry`. Her gray-ivory synthetic plastic, minimal fixed face, small artificial airway, mold seams, rigid posture, and repeated presence carry the horror; do not pursue realistic skin or distort her face into a monster.

The dread comes from the mannequin's posture, CPR motion, fixed gaze, repeated appearances, and wrong presence. Do not distort or grotesquely exaggerate her facial features.

The old yellowed white coat belongs to 張守恆. A worn stethoscope hangs at Annie's neck. Its metal name plate carries the exact inscription:

> 祝 守恆 醫師 1997 執業誌慶

The stethoscope and inscription are property/clue evidence from 張守恆; Annie is not 張守恆 and is not a dead doctor.

## Model and materials

- Use one shared model with `STORAGE_STATIC`, `BRIDGE_MANIFEST`, and `FLOOR6_CPR` poses.
- Face: softly rounded vinyl shell, slightly molded facial details, subdued cloudy eyes, centered pupils that never track the player, a small dark airway opening with a pale molded rim, and visible but fine mold seams.
- Hair: modestly messy dark mannequin wig, kept clear of the face; no ghost styling, blood, wounds, or spectral eye glow.
- Body and hands: natural adult proportions, stiff pose, visible neck/wrist mold seams, articulated teaching joints, and grounded old work shoes.
- Clothing: loose, aged yellow-white coat over muted gray-green scrubs; cloth reads differently from the smooth vinyl.
- Stethoscope: worn rubber tubing and oxidized metal, worn at the neck. Its attached plate visibly carries exactly `祝 守恆 醫師 1997 執業誌慶`.

## Motion and staging

- `STORAGE_STATIC`: seated on its stool and completely still. This is ordinary training equipment on first inspection.
- `BRIDGE_MANIFEST`: rigid standing pose, both arms extended forward with overlapped hands held at chest height; no hanging arms. Only tiny mechanical settling; no camera tracking.
- `FLOOR6_CPR`: kneeling beside the scorched bed and pressing both overlapped teaching hands into the bed-side patient silhouette at 110 compressions/minute. Shoulders, arms, hands, and chest contact move together; no gore or impact animation.
- The face remains composed and almost empty through every state. The horror is in what the body is doing and where it appears.

## Lighting and inspection

Keep the coat, vinyl face, hinge seams, mouth aperture, and chest stethoscope readable under local practical light. 6F may use dirty green/cyan spill, warm aged highlights on the metal, and deep surrounding shadow, while retaining the mannequin's face and CPR movement in view. Do not hide anatomy or defects by crushing the figure into black.

Browser evidence must include an M1 close inspection showing the molded face and neck-worn engraved stethoscope, plus an M6 CPR wide shot and a closer CPR view. QA checks should verify the three shared states, static storage, active CPR movement, airway, synthetic face material, and the exact inscription.

## Durable authority

This file is linked from [`MASTER_UPGRADE_DIRECTIVE.md`](MASTER_UPGRADE_DIRECTIVE.md), [`ANNIE_IDENTITY_BIBLE.md`](ANNIE_IDENTITY_BIBLE.md), and [`ART_DIRECTION_V2.md`](ART_DIRECTION_V2.md). Future agents should read this file before changing Annie's mesh, materials, rig, animation, light treatment, or close-up shots.

## Task authority and current implementation status

Task ID: `ART-CHAR-ANNIE-HERO-V2`. Repository: `hsushuhao-lab/DutyNight`; runtime target: `prototype/`. The latest explicit user direction and this contract supersede older descriptions of Annie wherever they conflict. Narrative canon and the M1–M9 order do not change.

The shared implementation lives in `prototype/src/art/AnnieArt.js`. 3F storage, the skybridge, and 6F instantiate this factory with only `STORAGE_STATIC`, `BRIDGE_MANIFEST`, or `FLOOR6_CPR` changing the pose. It owns the model, materials, rig, stethoscope, light, and contact shadows. `prototype/src/world/shared/AnnieMannequin.js` is only an import bridge and contains no second model implementation.

## Current procedural release acceptance

- All three scenes use the single `AnnieArt.js` factory and preserve the same silhouette/material identity.
- The 165 cm standing-reference model is smoothly rounded; no Annie body mesh uses `BoxGeometry`.
- The face is synthetic gray-ivory vinyl, minimally molded and fixed; CPR airway, neck/wrist seams, stiff joints, loose aged coat, gray-green scrubs, and worn shoes are visible at close range.
- The bridge pose has lifted extended arms and overlapped hands. 6F is kneeling with stacked hands centered on the patient chest; the patient contour follows the same mechanical 110/min press/release phase. Storage is completely still.
- The old neck stethoscope is individually inspectable and its exact inscription is readable in close view.
- Local cool-white light, cast/contact shadows, correct scale/yaw, grounded soles/knees, and long/mid/close captures all pass browser review.
- The current 26 story captures cover storage medium/close, bridge long/mid/close, the stethoscope clue, and 6F long/medium/close. All required story milestones pass, the production build succeeds, and public Pages serves the exact verified release SHA.

## FUTURE ART POLISH — Optional Hero GLB engineering contract

The following GLB requirements describe a later quality upgrade only. Missing model files, manifest entries, external authorization, or GLB validation do not block the current procedural release.

Formal assets:

- `prototype/public/assets/models/characters/annie_cpr_hero.glb`
- `prototype/public/assets/models/props/zhang_stethoscope_1997.glb` (a separately authored stethoscope node inside the character GLB is acceptable only if it remains independently inspectable and instantiable)

Extend `prototype/src/art/AssetRegistry.js`; keep its `GLTFLoader` and existing asset manifest/cache. Register `annieHero: 'characters/annie_cpr_hero.glb'` and `zhangStethoscope: 'props/zhang_stethoscope_1997.glb'` when the files are added. Do not create another global asset cache. Preserve each GLB material and texture assignments; do not normalize imported materials to one roughness or metalness value.

Skinned character instances must be cloned with `SkeletonUtils.clone()`, not `scene.clone(true)`. Every Annie instance owns its own `THREE.AnimationMixer`. Shared immutable geometry and textures may remain shared; a skeleton or mixer may not be shared between 3F, Skybridge, and 6F instances. The scene factory belongs in `prototype/src/art/AnnieArt.js` and returns the requested state, position, yaw, and optional neck stethoscope using the registered asset.

## Modeling source, coordinate system, and export contract

The runtime deliverables are glTF 2.0 binary files (`.glb`). Keep the editable source scene and its authored textures beside the project under `prototype/art-source/annie/`; record the DCC application/version, exporter/version, and export settings in `prototype/public/assets/models/characters/README.md`. The source scene is the provenance and repair source; the game loads only the registered GLB files.

Use meters, Y-up, and one character forward axis (+Z). The character root is at world origin, centered between the feet; both shoe soles rest at Y=0 in the neutral standing pose. The unscaled model height is 1.65 m, with an accepted range of 1.62–1.68 m. Apply object transforms before export. Put scene placement and yaw on the game-side wrapper, not on the skinned mesh or animated root.

Required named mesh nodes are `Annie_Face_Vinyl`, `Annie_Eye_L`, `Annie_Eye_R`, `Annie_Mouth_Airway`, `Annie_Hair_Wig`, `Annie_Coat`, `Annie_Scrubs`, `Annie_Shoe_L`, `Annie_Shoe_R`, and `Annie_Stethoscope_1997`. Required material names are `Annie_Mat_Vinyl`, `Annie_Mat_Coat`, `Annie_Mat_Scrubs`, `Annie_Mat_Stethoscope_Rubber`, and `Annie_Mat_Stethoscope_Metal`. The stethoscope must be one independently addressable object in the character asset and one independently loadable pickup asset; both representations must use the same source mesh/materials and must not drift visually. The pickup GLB node is `Zhang_Stethoscope_1997`.

Use clean quad-based deformation topology at joints; triangulate at export. Do not export n-gons, unapplied negative scale, hidden high-poly source meshes, or duplicate unused materials. Each skinned vertex has one to four non-zero bone influences whose weights sum to 1.0 within 0.001. No facial expression blendshapes are required. Preserve the neutral, rigid dummy pose as the bind pose.

Keep the GLB self-contained where possible. If Draco, Meshopt, KTX2, or another optional glTF extension is used, configure its decoder/transcoder through the existing `AssetRegistry.js` loader path and include that exact extension in build and browser QA. Do not ship a compressed asset that the current public runtime cannot decode. The exported files must pass the Khronos glTF Validator with no errors; warnings must be reviewed and recorded with the asset provenance.

## Geometry, texture, and payload budgets

| Deliverable | Required budget |
|---|---:|
| Annie Hero geometry | target 30k–70k triangles; maximum about 90k |
| Face/mannequin textures | 2048 × 2048 |
| Coat textures | 2048 × 2048 |
| Scrub textures | 1024–2048 × 1024–2048 |
| Stethoscope textures | 1024 × 1024 |
| Annie Hero GLB transfer payload | ≤8 MB target |
| Character plus Hero Prop package | ≤10 MB target |

Use meshopt or Draco geometry compression and WebP/KTX2 textures when the browser pipeline supports them. Do not damage facial silhouette or seam readability to hit a size target. Record both compressed download size and decoded texture memory.

The triangle budget counts rendered triangles after triangulation across the character's visible LOD. The named face, airway, hands, clothing, shoes, and stethoscope nodes must remain present in the optimized export. Current asset sizes are measured from the exact files fetched by the browser, including any external texture dependencies; do not report only the geometry chunk size.

## PBR material contract

The final Hero asset must use texture-driven PBR maps: Base Color, Normal, Roughness, Metallic, and AO. Pack AO/Roughness/Metallic into ORM when appropriate. No final plain white solid-color coat material.

Follow glTF channel conventions: Base Color textures use sRGB; Normal, Metallic-Roughness, and Occlusion data use linear sampling. When ORM is packed, AO is the red channel, roughness the green channel, and metallic the blue channel. Use a valid UV set for every referenced texture and preserve the tangent basis needed by normal maps. Record texture dimensions, format, color space, and compressed byte size in the asset manifest/report.

| Surface | Material requirements |
|---|---|
| Mannequin skin | Non-human vinyl/PVC/silicone-like appearance; roughness 0.45–0.65, metalness 0; restrained plastic highlight; small-scale roughness and seam-normal variation; no wet human-skin/subsurface look. |
| White coat | Aged gray-yellow/ivory base color, localized cuff/hem grime and wear, cloth normal, roughness 0.75–0.9, loose fit and removed-badge trace. |
| Scrubs | Old muted light-green/gray-green cloth under the coat, with cloth roughness/normal detail. |
| Work shoes | Worn, muted medical work shoes with grounded contact surfaces. |
| Stethoscope rubber | Dark aged tubing, roughness 0.55–0.75, metalness 0, restrained cracking and handling wear. |
| Stethoscope chestpiece | Oxidized and rubbed metal, metalness about 0.8–1.0, with the inscription readable at inspection distance. |

The loader must honor GLB PBR values and maps. Asset-specific correction is allowed only when it fixes a documented import defect; never apply a blanket material override.

## Rig contract

Minimum named hierarchy:

`root`, `pelvis`, `spine_01`, `spine_02`, `neck`, `head`, `upperarm_L`, `upperarm_R`, `forearm_L`, `forearm_R`, `hand_L`, `hand_R`, `thigh_L`, `thigh_R`, `shin_L`, `shin_R`, `foot_L`, `foot_R`.

Keep shoulder, elbow, and wrist behavior deliberately stiff. If finger bones are included, thumb and palm articulation are the minimum useful control. Facial blendshapes are not required; the face must not emote. The stethoscope chestpiece must be a separate named mesh/node for inspection and M5 pickup continuity.

Bone names and parent relationships must match the listed hierarchy exactly; left/right are from Annie's own perspective. Export one skin and one bind pose. Do not animate root scale, detach joints, or use unconstrained IK in the runtime file. The rig QA must report the actual joint count and reject any unweighted vertex or weight sum outside the tolerance above.

## Animation contract

The GLB must include `annie_idle_static`, `annie_head_track_subtle`, `annie_bridge_cpr_empty`, `annie_floor6_cpr`, and `annie_transition_freeze`. Use `THREE.AnimationMixer` per cloned scene instance, `mixer.update(delta)` in that instance's update path, and cross-fades when changing state. Do not teleport bones between poses.

Author at 30 samples per second with seconds-based glTF key times. All loop clips must have matching first/last poses and no visible pop over ten repeated loops. Eye meshes and pupils remain fixed and unfocused relative to the head; there are no eye darts, blinks, or gaze-target constraints. If the head-track clip is used, it starts 250–450 ms after its proximity trigger, turns slowly to at most ±35° yaw, and never snaps; the eyes retain their fixed mannequin stare. Cross-fades between non-loop poses complete within 0.15–0.30 seconds.

- `annie_idle_static`: no chest breathing; at most a 1–2 degree slow head offset or very small mechanical settling.
- `annie_head_track_subtle`: starts only after a designated proximity trigger; delays response by 250–450 ms; turns slowly to no more than ±35 degrees of yaw. Never snap through 180 degrees.
- `annie_bridge_cpr_empty`: rigid standing/leaning pose, performing exact, empty CPR motions as though compressing an absent patient. The held gaze does not follow the player by default.
- `annie_floor6_cpr`: sustained CPR against the burned-bed human silhouette, with locked elbows, overlapped hands, fixed wrists, shoulder-driven compression, and a mechanically perfect 100–120 compressions per minute.
- `annie_transition_freeze`: controlled stop/hold pose for story transitions; cross-fade into and out of the hold.

No breathing loop, zombie twitch, seizure motion, face change, or scream pose.

The nominal CPR rate is 110 compressions per minute (one compression cycle every 60/110 seconds); the acceptance range is 100–120 per minute measured over 30 seconds. Keep the compression contact point stable on the bed-side silhouette. The compression sound is driven from the same cycle phase as the animation, so no visible press can occur without its paired mechanical click and no click can drift between presses.

## Scene state contract

All three states instantiate the same shared procedural Annie model from `prototype/src/art/AnnieArt.js`:

- `STORAGE_STATIC` in 3F: seated still; coat, scrub underlayer, shoes, and neck stethoscope present; the engraving is not readily legible at normal play distance.
- `BRIDGE_MANIFEST` in M5: distant first read, fixed stare, empty-CPR action. The same rig, silhouette, coat, face, and hair must identify her as the previous mannequin.
- `FLOOR6_CPR` in M6: kneeling beside the scorched bed and performing full CPR on the human-shaped burn silhouette.

Do not build separate white figures in zone files. `Skybridge.js` and `Phantom6F.js` may choose a state and transform, but may not create Annie's body, face, clothing, or stethoscope from scene-local primitive geometry.

## Lighting and camera acceptance

Keep the existing story lighting architecture. Skybridge remains navigable with reduced fill; when Annie appears, use a localized cool-white practical/spot accent from the scene's existing lighting system to reveal the mold seam, fixed eye, coat dirt, and plastic highlight. Use cast shadows on Annie and contact shadows under the feet/knees; floor receives shadows. Do not add an isolated studio rig or brighten the entire scene with flat ambient light.

Required distances measured from the visible body/hero prop to camera:

- LONG: 8–12 m, reads first as a white-coated adult figure.
- MID: 3–5 m, rigid posture and proportions start to feel wrong.
- CLOSE: 0.8–1.5 m, clearly shows vinyl skin, fixed artificial eye, mold seam, training mouth, coat cloth detail, and neck stethoscope.

The production story browser suite records Annie at storage medium/close, bridge long/mid/close, stethoscope inspection, and 6F CPR long/medium/close. These are genuine 1440 × 900 captures in the exact 26-image story manifest. All anchors must be in frame, unobscured, and readable. Screenshot timeout or a hidden/occluded anchor is FAIL.

For each capture, record the source commit, zone/state, camera-to-anchor distance, camera transform, viewport, and screenshot SHA-256 in the QA report. The long and mid shots validate silhouette and staging; close shots must visibly distinguish molded vinyl from human skin, show the airway and fine seam, show cloth wear, and retain the stethoscope on the neck. The stethoscope inspection must show the exact inscription `祝 守恆 醫師 1997 執業誌慶` without substituted or malformed characters. These Annie views are included in the 26-image story manifest; there is no separate asset screenshot gate.

## FUTURE ART POLISH — Hero GLB validator and performance profile

If GLB work is separately scheduled, `test_annie_hero_asset_qa.js` may verify manifest keys and files, size budgets, mesh/node and bone names, animation clips, independent Annie states, stethoscope nodes, and PBR textures. Missing GLBs must remain `FUTURE ART POLISH` and must not reject the procedural release.

Frame time, draw calls, triangles, and texture memory profiling are later optimization work. They are not acceptance criteria for this procedural release.

## FUTURE ART POLISH — Optional provenance and GLB gate

For an external model, record source URL, author, exact license, modification permission, commercial-use status, redistribution status, and source/asset hashes in `prototype/public/assets/models/characters/README.md`. Do not use ripped assets, unclear licenses, or non-redistributable files in the public repository. A custom-created asset must record its creator and source project/export settings as well.

The current `ART-CHAR-ANNIE-HERO-V2` release is `COMPLETE` when the procedural acceptance above passes, including local and public story QA/screenshots and exact-SHA Pages verification. GLB/PBR/rig-export requirements in this section remain `FUTURE ART POLISH`.

Do not reintroduce `BLOCKED_BY_HERO_ASSET` as a blocker for this procedural release. When separately authorized and scheduled, GLB work may use the engineering contract above as its future asset checklist.
