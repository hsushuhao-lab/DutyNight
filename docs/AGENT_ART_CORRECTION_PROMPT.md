# AGENT ART CORRECTION PROMPT — HARD GATE

You are working on `hsushuhao-lab/DutyNight`.

Before changing any scene, read `docs/ART_STYLE_LOCK.md` and treat it as a **hard constraint**, not a suggestion.

## Goal

Improve the current playable prototype so Act 1 feels like a believable, warm, realistic psychiatric-hospital night-duty opening. Do **not** expand the story. Do **not** advance to Act 2.

## Current correction priorities

1. Preserve warm normality in 17:00–21:00.
2. Replace generic / greybox / gamey presentation with grounded hospital materials and lived-in props.
3. Keep the closed psychiatric ward controlled but humane; avoid prison-like red-warning visual language.
4. Keep the duty room as a private independent room with a real door and safe-room feeling.
5. Keep HIS utilitarian and fictionalized.
6. Never add or expose Bed 33 in Act 1 normal records.
7. Never invent a duty-room number such as 422 without PI approval.
8. Do not use the real hospital name in public-game UI; use `松德醫療中心`.

## Required workflow

- Inspect current online build and current QA screenshots.
- Make one visually testable change per commit.
- Rebuild with `npm run build` after each meaningful batch.
- Regenerate screenshots:
  - 3F corridor
  - 316 office
  - HIS workstation
  - elevator lobby
  - 4F ward gate
  - duty room
- Compare against `docs/ART_STYLE_LOCK.md`.
- Stop if a requested art change requires a structural rewrite of gameplay systems.

## Automatic FAIL conditions

- Act 1 looks horror-blue or abandoned.
- Excessive orange / fantasy lighting replaces believable hospital lighting.
- Psychiatric ward becomes a prison/cage/security-horror caricature.
- HIS becomes sci-fi or arcade-like.
- Bed 33 appears in Act 1 records, boards, signage or handoff UI.
- Real hospital-identifying UI appears in the public build.
- Unapproved duty-room number appears.
- Existing movement/interactions regress.

## Required completion report

Return:

- commit log
- files changed
- `npm run build` result
- before/after screenshots
- PASS/FAIL table against every item in `docs/ART_STYLE_LOCK.md`
- remaining visual debt

Do not mark the art pass complete unless every hard rule passes.
