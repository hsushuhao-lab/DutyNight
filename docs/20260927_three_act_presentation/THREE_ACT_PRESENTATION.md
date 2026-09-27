# DutyNight — Three-Act Presentation Pass

Status: IMPLEMENTED / QA REQUIRED
Date: 2026-09-27

## Goal

Give the current story a clear three-act emotional structure without rewriting M1–M9, adding new story flags, or competing with existing gameplay agents.

This pass is intentionally a **presentation layer**. It watches existing story states and adds title cards / opening orientation / success credits. It must not own story progression.

## Act I — 正常值班

Tone:
- relatively warm
- ordinary hospital work
- mildly lively rather than ominous
- no horror exposition

Opening animation:
1. ACT I title / 青嶺醫療中心 17:00
2. quick campus orientation
3. simple night-duty workflow
4. handoff into the first active objective: enter 316 and complete shift handoff

The opening is shown only on a fresh run, not every time the player is Patientized and looped back to 17:00.

## Act II — 21:17 之後

Trigger:
- existing `BOOTSTRAP_2117_RESOLVED`

Tone:
- visual temperature turns green/dark
- mild scanline / brief glitch
- contradictions become the thematic center

Copy thesis:
- the same time leaves different records
- the same place accumulates impossible traces
- 21:17 / 316 / 409 / 00:33 begin to interlock

No new clue or story answer is granted by this presentation.

## Act III — 最後交班

Trigger:
- existing `M8_IDENTITY_BATTLE_ACTIVE`
- or existing `M8_CODE_BLACK_ANNOUNCED`

Tone:
- terminal
- identity-centered
- no longer about solving an isolated legend

Copy thesis:
> 你要證明的，不是「今晚誰應該值班」，而是你到底是誰。

The third act contains the already-existing two possible outcomes:
- wrong choice / historical error → Patientization / loop
- successful identity handoff → ending

## Success outro / credits

Trigger:
- existing `GAME_COMPLETE`

The existing final success record remains visible first.
After a short delay, a separate full-screen credit animation plays.

Credits resolve:
- 張守恆 / MED-870409
- 409-A Patientization order invalidated
- historical overwrite revoked
- eight victim names restored to the record
- 林婉真 final line
- end lockup: **「同樣的值班，不同的自己。」**

After credits, the player can press E / Esc to return to the existing final handoff record.

## Conflict-minimizing architecture

New isolated file:
- `prototype/src/story/ActPresentationDirector.js`

Minimal integration only:
- one import in `main.js`
- one instance
- one `update()` call in the existing animation loop

No changes to:
- M1–M9 progression
- objective flags
- PersistentMemory ending state
- LoopManager Patientization logic
- UIManager story logic
- WorldRouter
- floorplan / scene files
- Night Horror art files

## QA

`prototype/test_three_act_presentation_qa.js` locks:
- three act titles
- existing-state triggers
- success credits
- no story flag writes from presentation layer
- no ownership of `completeGame()`

Browser QA should verify:
1. fresh boot plays Act I opening
2. QA/camera URLs do not play the opening
3. loops do not replay opening
4. after 21:17, Act II card appears once
5. finale state triggers Act III once
6. GAME_COMPLETE triggers credits
7. E/Space/Esc skip works without triggering world interactions
8. credits return to the existing final handoff record
