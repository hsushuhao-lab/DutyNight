# M1–M9 QA Acceptance

This file defines acceptance for the current playable `prototype/`; it does not restore the historical Act-1-only scope. Run against the exact current `master` revision and report each gate separately.

## Data and story contracts

- Official 4F census has exactly 32 beds: 408A=29, 408B=30, 408C=31, 408D=32; 409 contributes zero ordinary beds; 409A is anomalous 33.
- M1–M9 milestones remain ordered and playable. Routine duty precedes horror escalation.
- 408C physically anchors the four-knock / pause / nine-knock report and audible knock sequence.
- Persistent one-time observation 「交班資料已接收」 appears only once across loops. 316 phone lines are deterministic by loop: 0 / 1 / 2 / >=3.
- ER and 316 calls audibly ring. After M3 terminal lookup, the 316 phone and line 「……怎麼知道我在 316 辦公室？」 precede the second-campus assignment.
- M4 patient is an ordinary anxiety/hyperventilation case. Pre-completed transfer targets 第一院區 409A; inspectable physical clue grants 守.
- Both M5 routes yield equivalent physical 恆 evidence; bridge only locks after midpoint commitment.
- True-name reconstruction requires 張, 守, 恆, MED-87, MED-870409 and 住院醫師. M9 accepts only 張守恆 plus MED-870409; either mismatch fails.
- First-campus ER hillside entrance is hillside→ER allowed and ER→hillside blocked. Second-campus 1F access is controlled.
- First-campus 1F guard post exists and supports the later hidden service path.
- Before the elevator anomaly, task HUD never mentions 6F and ordinary floor selection never offers it. The next eligible elevator ride can hijack; stairs cannot.
- Annie is one consistent recurring white-coated, pale figure; storage, either return route, and phantom scene each support escalation. Phantom scene presents repetitive CPR; safe behavior is not to chase.
- Player-facing UI uses 員編 / 員工編號, never 工號; only the special anomaly uses 無名氏.

## Spatial and visual contracts

- 4F furniture clearances, duty-room path, sign mounting, bed-board visibility and interaction reachability are checked.
- ER nurse station has work props; monitor is separate from glass. Rails stop at door openings; signs are flush and do not obstruct circulation.
- No major-scene floating/clipping props, blocked interactions, furniture intersections or geometry hidden by darkness.
- Lighting evolves from warm/neutral ordinary duty to shadowed post-21:17, stronger green/local practical mood after 00:33, and claustrophobic 02:00/B2 contrast.
- Inspect fresh screenshots for 4F nursing station, duty room, 409, ER, 1F guard post, second-campus M4, Annie on both possible route surfaces, phantom CPR scene, B2 and M9.

## Commands and reporting

Run the static QA scripts listed in MASTER_REWORK_SPEC.md, `npm run build`, and `node scripts/test-story-playthrough.mjs qa-results/story-local`. Preserve exact per-command outcomes. A passing static test or build is not a browser playthrough pass. Check public Pages only after a green local playthrough and push; report public deployment separately. Never claim full completion when browser or deployed evidence is missing.
