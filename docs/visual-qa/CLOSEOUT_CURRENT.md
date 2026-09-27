# DutyNight visual closeout — current evidence

Status: IN_PROGRESS. No deployment or complete visual acceptance claim.

## Source and completed checks

- Integrated remote master `2d3a1ac3ec2ec62ad955eca84011f0f65ff1f62a` without reverting character/three-act changes.
- `cb9d1e532209cae3786af39b5d64f21fc81c50e7`: M1–M9 browser run passed (`prototype/qa-results/unified-story/result.json`).
- B2 browser checks passed: single identity attempt, retry blocked, permanent exit, required history review, then 316 text input `0409` (`prototype/qa-results/closeout-b2/result.json`).
- Material and loading checks: `prototype/qa-results/unified-material.json` and `unified-loading.json`. Loading currently covers five elevator routes plus boot, cold/warm; the remaining named special-route performance coverage must still be audited.
- Four bridge states passed (`prototype/qa-results/closeout-bridge/result.json`).
- Distant pond/hillside production-scene assertions and three time-of-day captures completed (`prototype/qa-results/closeout-landscape/`). No pond gameplay zone was restored.
- 00:33 and erased-6F elevator cinematic travel passed (`prototype/qa-results/closeout-cinematic-travel/result.json`).

## Independent review and corrections

Review of 88 ordinary scene captures and 27 story captures found overlapping displays at 8F, the 3F administrative roster and the 1F guard desk. Poster positions and the guard playback plaque were separated; a fresh 88-capture set is in `docs/visual-qa/evidence/20260927/visual-overlap-fix/`.

The older opening title card obscured the initial corridor screenshot. Capture tooling now checks production debug visibility, then uses explicit capture mode for scene evidence. Comparison prose no longer claims a hardcoded, incorrect screenshot count.

409 patientization previously relied on the text overlay. It now renders an isolated Three.js bed scene with restrained forearms, patient wristband, camera movement and light fade. Browser checks cover natural completion and skip, each producing exactly one loop reset, restored controls and renderer cleanup (`prototype/qa-results/closeout-patientization/result.json`).

## Remaining release gates

1. M1–M9 passed on `5dd0d2e` (`prototype/qa-results/closeout-story/result.json`). Later final-recap change passed the B2-to-history-to-316 browser regression; full public replay remains required.
2. Review fresh corrected display captures and the complete required cinematic/night screenshot matrix.
3. Verify production three-act presentation separately from QA-mode story playback.
4. Complete special-route cold/warm coverage and exact final-revision material checks.
5. Commit the final evidence index, push, run the existing Pages workflow, and verify public build fingerprint and browser behavior.
6. Only then use `DEPLOYED_AND_VISUALLY_VERIFIED`.

Local evidence paths are working artifacts, not proof of public deployment. Older successful runs must not be described as verification of later production changes.

## Latest continuation

- `8e9a8c8`: distant pond grounded below the bridge, skyline and stars exposed.
- `4202714`: six cold/warm special-route samples passed through real entry handlers; scene-ready time is separate from cinematic/control-return time.
- `f14307b`: 316 identity recap now lasts five seconds and renders the conflict/evidence on the actual terminal before allowing input. B2 fail-forward browser regression passed, including `0409`.
- `7456966`: separated the side-wall administrative photograph from the attendance poster.
- `9613926`: production opening (no QA bridge) and targeted act2/act3/outro presentation tests passed; landscape captures standardized to1440x900.
- Fresh full scene capture: `docs/visual-qa/evidence/20260927/final-9613926` contains88 captures, five excluded route anchors, zero errors.
- Latest landscape evidence: `prototype/qa-results/landscape-final`.
- Independent review rejected previous cinematic screenshots (wrong moments/framing). Corrected316 recap screenshot is in `prototype/qa-results/b2-recap-current`; B2 closure,00:33 and6F cinematic framing still need refreshed evidence.

Publication may proceed for user playtesting as authorized, but release status remains IN_PROGRESS until all public and visual gates pass.

## Public verification continuation (2026-09-27)

- Public Pages workflow36302734768 deployed `ab714894276c1e373941f26e8649fdc5da5500be`; fingerprint verified.
- Public material runtime audit:11 visits PASS,159636ms total. This proves eventual material correctness, not loading performance.
- CI story workflow36302734770 stopped at M6 after its30-minute step limit. M7–M9/public steps did not pass in that run.
- Local `c84adc9` separates the once-only6F preview from the later required6F visit, as explicitly selected by the user. Browser travel regression passed both paths. Not yet deployed.
- Loading measurement now waits for source-zone core PBR readiness and records that preparation separately. It allows a slow cold transition to finish before warming;10seconds remains the failure threshold. Local12 samples PASS (`prototype/qa-results/loading-corrected-local.csv`). Public corrected audit is still running; no PASS claim.
- Exterior ground/asphalt surfaces are being moved to background priority, retaining unchanged full-resolution PBR assets. Indoor core PBR remains essential. This follows specification section8; the previous test wording incorrectly demanded distant-ground readiness before scene build. Runtime/visual verification of this change remains required.

- Background-priority working tree: build PASS; actual imported manifest assertions PASS (core PBR essential, distant ground/asphalt optional, no essential campusTree); material runtime11visits PASS (`prototype/qa-results/material-background-priority.json`); cinematic travel3flows PASS (`prototype/qa-results/travel-background-priority/result.json`). These targeted checks do not prove the full00:33 visual sequence or final public acceptance.

-00:33 capture review confirmed the old arrival camera faced a wall. The cinematic now starts automatically inside the diagnostic room, displays real terminal fields in stages and restores control. `prototype/qa-results/registration-visible-trigger/result.json` PASS; its1440x900 active screenshot was inspected and shows the terminal. Remaining: full narrative-state screenshot and printer staging.
-Loading audit now persists IN_PROGRESS/FAIL checkpoints and partial samples. Previous public corrected run ended without output; no pass inferred. Replacement logged audit: `prototype/qa-results/public-loading-diagnostic.*`.

## Revision8e1be87 public checkpoint

-Pages workflow36306345103 SUCCESS; public build-info commit `8e1be8710b407a55b66dbc2a1f341abfdf0051f2` verified2026-09-27T08:32:44Z.
-Full local story run `story-8e1be87-local` failed because the old assertion checked restored controls when ringing began, before the approved3.8-second cinematic finished. The assertion is retained after explicitly waiting for its PLAYED flag (10-second bound). New run `story-8e1be87-timing` remains in progress.
-Public loading `public-8e1be87-loading` records each sample's build fingerprint and production module hash. Partial timings:3F→4F cold8222ms/warm3298ms;4F→2F cold4349ms/warm2450ms. Source preparation64190ms and40087ms remains unacceptable for claiming overall performance completion. Remaining routes pending; no full PASS claimed.

## Local archive handoff — 2026-09-27

- User requested uploading local files before removing this checkout. Commit `1a159b0dedf5922038cd47276b34e0c84f63a1a7` is the published master snapshot; Pages deployment workflow36318074693 succeeded for that SHA.
- This archive adds local visual comparison captures, all retained `prototype/qa-results` outputs (including ignored files), `.omo/evidence` reviews, and this handoff record. See `LOCAL_ARCHIVE_MANIFEST_20260927.csv` for SHA-256 and byte size per archived file.
- Build output (`prototype/dist`), dependencies (`prototype/node_modules`), and transient Vite work (`prototype/.visual-work`) are generated/recreatable and not archived.
- QA outputs cover multiple earlier revisions. Their embedded build fingerprints and per-run verdict remain authoritative; archival does not imply every run passed or that all evidence belongs to latest master.
- The active closeout goal remains incomplete: M1–M9, full current material runtime audit, cold/warm route matrix, fixed before/after, cinematic review, and current public Pages visual verification have not all passed on one revision.
