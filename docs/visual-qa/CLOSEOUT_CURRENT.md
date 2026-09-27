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
