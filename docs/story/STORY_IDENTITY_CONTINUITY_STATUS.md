# Story identity continuity patch — current status

Authority: STORY_IDENTITY_CONTINUITY_20260927.md supersedes historical B2 return and 21:17 pacing descriptions. Preserve all later game routes; historical ACT1 scope is not a rollback instruction.

Implemented:
- 408C clinical assessment with E-driven questions; no bedside knocking; faint pattern only after inspecting sealed 409.
- 劉志遠 / ENG-860214 / 工務機電技師 revealed on assessment, retained in labels, notes, 00:33 record and 316 archive query. Previously saved engineer note is migrated.
- Exactly seven personnel pages using canonical CharacterBible profiles.
- Single visible 3F Annie: storage -> history entrance -> history inside after failed B2 -> 316 after source review/success.
- 21:17/316/409 desk record appears before time advances and ER phone rings. ACT II follows this recap.
- Pre-6F guard interaction and direct handlers blocked; 6F returns to first_1f_lift.
- B2 physical hinged fire door closes before direct 3F transition. Failure requires history review; success proceeds to 316. Record overwrite replaces deadline wording.
- 4F report interaction belongs to the information board; 5F doctor-room bilingual sign; second-campus 2F shelf moved away from desk chair.
- E-captured clinical, second-campus phone and final permission dialogue. Final code remains text 0409.

Verified at public revision ad132725eaa7ecba4f535ab050a8872a95971668:
- Pages workflow 36309357851 SUCCESS; public build fingerprint matched.
- Public browser identity regression: 14 checks PASS, zero page errors.
- Public B2 failure -> direct 3F -> seven-page review -> 316 -> 0409 success: PASS, zero browser errors; 885 cinematic frames with zero input-lock violations.
- All 17 deployment structural tests and production build PASS.
- Missing-leading-zero code 409 rejected; loop2 report-only and 6F lift return checked.

Follow-up visual corrections (Pages e681ecad7002a8708acd73124cc7b3388035b069 verified; workflow 36310509672 SUCCESS):
- Move 5F duty-room sign to the corridor-facing wall surface.
- Remove the clinical sharps box that obscured the shared 4F/5F handover board.
- Floorplan regression asserts both sign mounting side and absence of the blocking box. PASS.
- Fresh visual captures use a settled render delay; earlier capture frames are not acceptance evidence.

Status: DEPLOYED_WITH_VERIFICATION_PENDING, not DEPLOYED_AND_VISUALLY_VERIFIED.
Full M1-M9, all cinematics and current loading/material audits still require verification. Previous public 8e1be87 material audit timed out on exterior surfaces; its visual batch flagged an underexposed 4F detail frame. Those failures must not be represented as PASS.

Visual review: all 16 local scene/document captures inspected. Integrity pass approved within scope; CJK review requested fixes to three orphan lines and sign capture framing. text-wrap:pretty and corrected 5F camera coordinates applied; fresh review pending. These are local visual checks, not the full public release gate.

## Current public recheck — 2026-09-27

- Public build `b5d41e1ae5d9657af1266a9f020f417ba03099ab`: 15 focused browser checks PASS, no page errors (`qa-20260927/identity-reentry-public-b5d41e1.json`). This includes retained 劉志遠／ENG-860214 after zone re-entry with the current-loop reveal flag cleared; the permanent journal supplies the known identity.
- Added a production-handler regression for 408C audio: an early 409 inspection is silent; the six-line assessment asks about voices, other witnesses and environmental sounds without concluding; only subsequent sealed-409 inspection plays the faint pattern, once. Added to the Pages structural gate.
- These focused results do not close the full visual release gate. M1–M9, loading, all cinematics and before/after evidence remain independently required. The public 6F-preview travel test timed out while waiting for arrival and is not a PASS.
