# Final visual acceptance review — 2026-09-18

**VISUAL_LOCK = FAIL.** This is a visual review of the refreshed final capture set, not an engineering verdict. No source code or browser session was changed during review.

## Current artifact binding and scope

- Commit: `dcd4d1ca6c85ac81d3b6700a8ddd5b0bb069aff6`. Bridge-end and ER-exterior captures were re-inspected after the backdrop repair.
- Runtime: `prototype/dist/assets/index-Cttcdlfd.js`
- SHA256: `fd5c33fbd40cf5b6637e88d6b95c42351f9851d2428bc45ba0654bfcbd3829ea`
- Capture manifest: `.visual-work/final/capture-manifest.json` (filesystem timestamp 2026-09-18 01:37).
- Inspected `.visual-work/contact-0.png`, `contact-1.png`, `contact-2.png` covering 25 primary views; full-resolution duty-room detail, ER exterior entrance and skybridge-end entrance listed below. This does not claim individual inspection of all 100 images.
- Canonical reference root: `DutyNight_CODEX_VISUAL_MASTER_20260917/06_VISUAL_REFERENCES/`; authority: `REFERENCE_INDEX.md`. ACT1_NORMAL references inform material, density and architectural credibility; their literal generated labels and nighttime illumination are not requirements to copy into 17:05.

## Remaining findings

| Priority | Screenshot evidence | Finding and reference |
|---|---|---|
| P1 reference fidelity | `.visual-work/contact-2.png`, specifically `m11_hillside_main`, `m11_hillside_branch`, `m12_pond_approach`, `m12_pond_deck` | Ground repetition forms conspicuous regular bands; sparse similar trees sit on broad uniformly textured slopes. Added ground plants improve the route but do not establish the layered, humid urban hillside character of `ACT1_NORMAL/A12_hillside_to_pond.png`. This is independent of the time-of-day difference. |
| P1 reference fidelity | `.visual-work/contact-0.png` (`m3_4f_nursing_station`, ER views), `.visual-work/contact-1.png` (Lobby), `.visual-work/contact-2.png` (`m8_second_campus_std`, `m9_second_campus_2f`) | Repeated desks/monitors/binders and large blank walls still read as a sparsely furnished visualization. Material variation, clinical equipment and signs of ordinary staffing/activity are substantially below `ACT1_NORMAL/A02_4F_nursing_station.png`, `A06_ER_nursing_station.png` and `A08_second_campus_2F.png`. No individual NPC count is inferred as a formal requirement. |
| P2 close-up fidelity | `.visual-work/final/m2_4f_duty_room_detail.png`, `.visual-work/contact-0.png` duty-room view | Coat is now visible and volumetric, but tubular sleeves and regular body folds retain a simplified modeled appearance. Bedding is improved but similarly regular. Private-room detail density and cloth realism remain below `ACT1_NORMAL/A04_4F_duty_room.png`. |

## Historical findings resolved in current captures

- `.visual-work/final/m7_skybridge_end_entrance.png`: the large green volume previously crossing the bridge-end passage is absent. The floor is visually clear up to the end door. This closes the physical intrusion reported against intermediate bundle `index-BkKazq8E.js` (SHA256 `9be309dc5d4e74a7137741bfc7a66ab0f377e0fe266aff4b1ea4efc04965c40d`).

## Confirmed improvements and limits

- `.visual-work/final/m4_2f_er_exterior_entrance.png` now shows a courtyard, paving and a more distant neighboring building; the previously reported blank exterior opening is resolved in this view.
- Duty-room coat, clock, bedding and local bedside illumination are visibly improved. First-campus 3F now has directional daylight patches rather than the earlier entirely uniform illumination.
- Earlier narrow shell gaps, backward station monitors and interior hillside penetration are not reproduced in the reviewed primary views. This statement is limited to those views.
- The reviewed images remain normal and non-horror. Passing engineering, capture, build or resource checks cannot establish photorealistic visual acceptance.

The two re-inspected views introduce no newly identified physical visual defect. The remaining reference-fidelity findings above still prevent acceptance.

The current artifact must not be represented as a completed visual lock. Any runtime rebuild invalidates this artifact binding and requires a corresponding refreshed visual review.
