# Repository Map

## Production
- `prototype/src/` — active game code
- `prototype/public/assets/` — runtime assets copied into the web build
- `.github/workflows/deploy-pages.yml` — production GitHub Pages deployment

## Current documentation
Use dated folders under `docs/` as implementation records. The most recent narrative/design material should be treated as authoritative over older root-level reports.

## Legacy / historical material
- `SONGDE_NIGHT_DUTY_ACT1_HANDOFF_v0.1/` — historical handoff package
- root-level ACT1 reports — legacy snapshots
- duplicated root `assets/A01...A08` — reference copies, not the canonical runtime source

## Rule
New runtime files belong under `prototype/`. New project documentation belongs under `docs/YYYYMMDD_topic/`. Do not add new reports or screenshots to repository root.
