# DutyNight visual contract

## 1. Authority and audience
The supplied DutyNight_CODEX_VISUAL_MASTER_20260917 package is canonical. Its images define material, mood and furniture detail, never literal floorplans, labels or patient identifiers. The player is an on-call physician in an ordinary Taiwanese hospital. Model topology, interaction anchors, routes and tests remain locked at 31f9e1b039a42317989291a1657b9901a673e748.

## 2. Material tokens
Warm ivory painted walls; sage accents; subdued resilient vinyl; terrazzo public floors; oak protection rails; brushed stainless hardware; aluminum window frames; mineral acoustic ceilings. Use local 2K albedo/normal/roughness maps with documented source, real-world UV scale, restrained wear. Preserve diffuse surface detail in highlights. No flat hero furniture, mirror floors or theatrical orange/blue wash.

## 3. Typography and signage
Traditional Chinese system sans-serif with English secondary text. Physical signs have backing thickness and supports, wood/aluminum mounts, restrained ivory/sage palette. No emoji. Repository room identities govern. No 402, 422, 4A33 or Bed 33 in Act 1. Duty rules are inside 316.

## 4. Spatial rhythm
Keep exact collision and walkable coordinates except the user-authorized, reproduced ER eight boundary returns, Lobby/8F four returns, and eight hillside segment rotations. The executable baseline differential records these bounded repairs. Render art is separately owned per zone. Prioritize realistic frames, joints, baseboards, rails, ceiling grids, cabinet handles and furniture silhouettes before tiny props. Never hide gaps with props, darkness or fog.

## 5. Reusable primitives and states
AssetRegistry caches GLTF furniture; MaterialRegistry owns reusable PBR materials; per-zone ArtRoot owns visible additions; VisualProfile owns bounded lighting. Shared resources survive zone cleanup. Private duty room uses bed, desk, locker, lamp, bathroom and closable door. All baseline states are ordinary; later horror remains unimplemented until baseline lock.

## 6. Lighting and motion
ACT1_DUSK_NORMAL: 3500–4200K visual feeling, localized window daylight, restrained fill, emissive fixtures and a small bounded set of actual lights. NIGHT_NORMAL: maintained neutral interiors and practical exterior lamps. ACES, stable exposure, no global sunset wash. No decorative HUD motion. Existing gameplay controls remain intact.

## 7. Accessibility and UI
Small legible interaction prompts; HIS retains readable dense administrative information. Debug selector available only in DEV or explicit debug=1. Production location labels contain no milestone/debug metadata. Responsive UI must not obstruct first-person view.

## 8. Acceptance and debt
Engineering: 25 spawns, 18 routes, 8 doors, 13 walls, 5 interactions, cleanup/state, build all PASS after each zone. Visual: entrance/mid/detail/oblique comparisons for each zone; every hard-fail in package is blocking. Screenshots from the real production browser are evidence, test counts alone cannot confer VISUAL_LOCK. No accepted placeholder debt. Current VISUAL_LOCK is NOT PASS.

### UI implementation tokens
HUD: background rgba(24,31,28,.65), text #f3f1e9, sage #b4c7b8, border #658b76; 12px body/14px location, 8px/12px padding, 16px screen margin. Task width 288px. HIS: #355342 title bar, #e1e8e3 header, #cfdbd3 table heading, 13px operational type, squared 2px corners. Small-screen HIS scrolls its content with footer accessible; no new fictional medical content.
