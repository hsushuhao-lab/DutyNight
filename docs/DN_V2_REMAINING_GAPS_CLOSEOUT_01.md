# DutyNight 2.0 Remaining Gaps Closeout 01

This document is the repository source of truth for the 2026-09-26 closeout pass. Historical ACT1 specifications must not be used to remove or regress completed Bed 33, hidden 6F, B2, Annie, or second-campus content.

## Fixed narrative contracts

- M3 resolves only after the 00:33 registration slip is decoded at the 316 legacy terminal and the physical 316 phone is answered.
- Answering the call enables `SECOND_CAMPUS_ACCESS`, `BRIDGE_ACCESS`, and `SECOND_CAMPUS_OBJECTIVE_ACTIVE`, then immediately publishes `01:15 前往第二院區 5F 護理站報到`.
- The second-campus call explicitly says the skybridge access is on 8F.
- Completing hidden 6F sends the player to the first-campus 1F guard post to verify night access and surveillance records.
- B2 is reached through the concealed single door and `b2_archive_stairs`. The retired lift route and player-facing lift wording must not return.
- B2 verifies administrative, historical, 316 legacy-terminal, guard/security, and true-name sources. Missing categories give a directional hint and the single escape stair remains available.
- A 3F archive key opens the archive door regardless of task order.

## Fixed world contracts

- Physical doors close whenever a zone is left or reloaded. Story unlock flags and collected keys remain persistent.
- The 316 and B2 archive terminals share `buildLegacyArchiveTerminal`.
- B2 has one physical return door with EXIT / 逃生梯 / 返回 1F identification and a tight matching interaction volume.
- Second-campus 1F and 2F security areas use the same security-post visual family as first-campus 1F.
- Second-campus 2F contains a bridge lobby, guard post, guard rest room, CCTV support room, and doctor duty room with a compact private toilet.
- The CCTV room has an optional `查看監視畫面` encounter that records `CCTV_SELF_DUPLICATE_SEEN` without gating progression.
- First-campus 2F ER contains three work seats, multiple monitors and records, treatment carts and cabinets, and a layered observation waiting area.
- Skybridge portraits occupy the north wall and era posters occupy the south wall to avoid overlap.

## Release verification

Required before publication:

1. Every `prototype/test_*.js` contract passes.
2. `npm run build` passes.
3. `scripts/test-story-playthrough.mjs` reaches M9 with verdict PASS on the exact revision.
4. The public GitHub Pages revision is checked independently after deployment.
