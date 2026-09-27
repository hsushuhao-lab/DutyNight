# DutyNight — Multi-Agent Coordination Rules

Status: ACTIVE
Date: 2026-09-27

This repository is being edited by multiple agents. Parallel work is allowed, but direct concurrent edits to the same files are high risk.

## Current repository state at coordination start

- default branch: `master`
- coordination base SHA: `9eb7f5420b73b28c4258c9bb242e3a48b4b9f438`
- no open pull requests were visible at the time this document was created
- multiple historical feature/fix branches remain in the repository

Important: GitHub cannot show unpushed local work. Another agent may still be editing locally even when no PR is visible.

## Rule 1 — Never have multiple agents push directly to master

Each agent must use a unique branch.

Recommended pattern:

```
agent/<workstream>-YYYYMMDD
feat/<workstream>-YYYYMMDD
fix/<workstream>-YYYYMMDD
docs/<workstream>-YYYYMMDD
```

Do not reuse another agent's branch.

## Rule 2 — One owner per high-conflict file at a time

High-conflict files currently include:

- `prototype/src/main.js`
- `prototype/src/ui/UIManager.js`
- `prototype/src/story/NarrativeV22.js`
- `prototype/src/story/CharacterBible.js`
- `prototype/src/story/MemoryInstallations.js`
- `prototype/src/world/WorldRouter.js`
- `prototype/src/world/shared/WorldRoutes.js`
- `prototype/src/world/shared/WardFloorplan.js`
- `prototype/src/world/zones/FirstCampus3F.js`
- `prototype/src/world/zones/FirstCampus4F.js`
- `prototype/src/world/zones/Skybridge.js`
- `prototype/src/art/LandscapeArt.js`
- `prototype/src/art/CampusBackdrop.js`
- `prototype/src/art/VisualProfile.js`

If two workstreams need the same file, serialize them:
1. merge the first PR
2. second agent rebases/refreshes from latest master
3. re-run tests
4. then continue

Do not independently rewrite the same file from an older base.

## Rule 3 — Prefer additive files for parallel work

Low-conflict parallel work:
- new docs
- new tests
- new isolated art helpers
- new data/config modules
- new screenshots/evidence
- new sound/texture/model assets with unique paths

Higher-conflict work:
- story flags
- objective routing
- input handling
- UIManager
- main.js
- shared floorplan/world routing

## Rule 4 — Character Identity workstream ownership

Current Character Identity Pass owns these concepts:

- runtime character canon:
  `prototype/src/story/CharacterBible.js`
- procedural archival visuals:
  `prototype/src/art/CharacterPortraitArt.js`
- archival thumbnails / memory evidence:
  `prototype/src/story/MemoryInstallations.js`
- memory frame character rendering and B2 cue display:
  `prototype/src/ui/UIManager.js`
- 3F 4+3 personnel archive:
  `prototype/src/world/zones/FirstCampus3F.js`
- character identity QA:
  `prototype/test_character_identity_pass_qa.js`

Another agent may extend these, but must first read:
- `docs/CHARACTER_BIBLE_V3.md`
- `docs/20260927_character_identity/CHARACTER_IDENTITY_VISUAL_GUIDE.md`

Do not overwrite CharacterBible values from generated concept-art text.

## Rule 5 — Night Horror / exterior workstream

Recommended ownership:
- `Skybridge.js`
- `LandscapeArt.js`
- `CampusBackdrop.js`
- `VisualProfile.js`

If another workstream also needs Skybridge story flags in `main.js`, keep scene visuals in zone/art files and minimize changes to `main.js`.

## Rule 6 — Story-flow workstream

B2 / 316 / loop / ER / 4F story changes should be grouped into one story-flow branch because they frequently touch:
- `main.js`
- `UIManager.js`
- `NarrativeV22.js`
- story regression tests

Do not run a second independent story-flow agent against an older master.

## Rule 7 — Before editing

Every agent must record:

```
git fetch origin
git checkout master
git pull --ff-only
git rev-parse HEAD
```

Then create a fresh branch from that exact SHA.

In connector-based workflows, fetch latest master SHA immediately before branch creation.

## Rule 8 — Before opening PR

Run focused tests plus relevant regressions.

Minimum for story/UI changes:
- `test_m3_m9_story_qa.js`
- `test_persistent_loop_qa.js`
- `test_cross_floor_sequence_qa.js`
- `test_cross_floor_entanglement_qa.js`

For character work:
- `test_character_identity_pass_qa.js`
- `test_3f_archive_qa.js`

For visual/loading work:
- material / visual / loading regression suite currently used by deployment workflow

Do not change a test simply to silence a real regression.

## Rule 9 — Merge discipline

Only merge one high-conflict PR at a time.

After each merge:
1. record new master SHA
2. all active agents refresh/rebase
3. resolve semantic conflicts, not just Git text conflicts
4. rerun affected QA

## Rule 10 — Generated art

AI-generated images may contain:
- wrong text
- wrong employee IDs
- invented labels
- inconsistent props

Therefore:
- use generated art for composition/mood only
- never use rendered text as canon
- validate all names/IDs against source modules before production use

## Practical conflict answer

Parallel agents are safe when:
- different branches
- different file ownership
- PR-based merge
- refresh from master after every merged high-conflict PR

Parallel agents are risky when:
- both touch `main.js` / `UIManager.js`
- both modify the same story flags
- both build from stale master
- both push directly to master
- one agent changes QA expectations while another changes implementation

The preferred model is **parallel by workstream, serialized at shared integration files**.
