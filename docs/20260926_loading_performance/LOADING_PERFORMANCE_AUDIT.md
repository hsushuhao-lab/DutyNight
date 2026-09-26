# DutyNight Loading Performance Audit — 2026-09-26

## Executive summary

The startup bottleneck is application-controlled, not simply GitHub Pages latency.

Two blocking patterns were identified:

1. `prototype/src/main.js` awaited `preloadAssets()` and `preloadMaterials()` before scene initialization completed.
2. `prototype/src/world/WorldRouter.js` statically imported every floor/zone, bundling late-game code into the initial JavaScript payload.

## Critical-path asset findings

Largest files present in the deployable prototype assets include:

| File | Size |
|---|---:|
| `campusTree.glb` | 16.43 MB |
| `Ground037_2K-JPG_NormalGL.jpg` | 4.58 MB |
| `Asphalt033_2K-JPG_NormalGL.jpg` | 3.94 MB |
| `Ground037_2K-JPG_Color.jpg` | 3.25 MB |
| `Wood051_2K-JPG_NormalGL.jpg` | 1.92 MB |
| `Terrazzo001_2K-JPG_Color.jpg` | 1.35 MB |

The old startup path eagerly requested 9 model groups, vegetation texture dependencies, and 18 PBR maps (6 surfaces × Color/Normal/Roughness) before gameplay could begin. Outdoor-only assets such as the 16.4 MB campus tree therefore blocked an indoor 3F opening scene.

## Initial bundle finding

The current deployed root bundle is about 543 KB uncompressed JavaScript. Static imports in `WorldRouter.js` pulled all major floor modules into that bundle, including 2F ER, 1F, 8F, skybridge, second campus, phantom 6F and B2 archive.

## Cache assessment

The build already emits hashed Vite asset filenames for JS/CSS, which is cache-friendly. The repeated-load delay is therefore primarily explained by the application re-requesting / decoding a large group of immutable assets at every fresh navigation before the first playable frame, rather than by missing filename hashing.

GitHub Pages response headers cannot be customized from this repository, so optimization should focus on reducing the critical request graph and using immutable hashed build outputs.

## Changes in this PR

- Removed heavyweight GLTF/PBR preload from the blocking startup path.
- Deferred hospital asset preload until after first paint / browser idle time.
- Kept 3F as the only eagerly imported world zone.
- Converted non-opening zones to dynamic imports so Vite can code-split them.

## Repository hygiene findings

The repository is about 133 MB and contains multiple duplicate historical/reference payloads. Examples include the same A01–A08 reference PNGs stored under:
- `assets/`
- `prototype/public/assets/`
- `SONGDE_NIGHT_DUTY_ACT1_HANDOFF_v0.1/02_ART/APPROVED_REFERENCES/`

Large V2 visual references are also mixed into `docs/20260925_v2_upgrade/art_reference/`.

These are not all startup downloads, but they materially increase repository complexity and checkout/deployment footprint.

## Repository organization policy

Do not delete historical evidence blindly. Treat the project as four layers:

- `prototype/` — production web game source and runtime assets only.
- `docs/current/` — current design / QA / implementation truth.
- `docs/archive/` — superseded reports and handoff material.
- external release/archive storage — heavyweight source/reference art that is not required at runtime.

The next cleanup pass should move or remove duplicate root-level reports and duplicated reference art only after verifying that no production import references them.

## Next performance targets

1. Compress / replace `campusTree.glb` (16.4 MB) with Meshopt/Draco or a lower-poly version.
2. Convert 2K JPG PBR maps to WebP/KTX2 where practical.
3. Load vegetation only when entering outdoor zones.
4. Add a CI size budget for the initial JS chunk and runtime asset manifest.
5. Add a browser timing smoke test capturing first-contentful-frame and first-playable-frame.
