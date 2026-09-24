# ============================================================
# DUTYNIGHT — FINAL M1–M9 REWORK MASTER DIRECTIVE
# Taiwanese Medical Mystery / Horror World Rework
# Date: 2026-09-25
# ============================================================

REPOSITORY:
https://github.com/hsushuhao-lab/DutyNight

LIVE BUILD:
https://hsushuhao-lab.github.io/DutyNight/

Observed master SHA when this directive was prepared:
10769dfd068ef2dbebb44d63b60943e36ca1e7b2

IMPORTANT:
This SHA is only a reference point.
Always work from the CURRENT origin/master, never reset newer work back to it.

# ============================================================
# 0. FIRST ACTION — SYNC, AUDIT, THEN IMPLEMENT
# ============================================================

Before touching code:

git fetch origin master
git checkout master
git pull --ff-only
git status
git rev-parse HEAD
git log -n 8 --oneline

Do NOT:
- reset newer commits
- force push
- replace master with an older snapshot
- delete unrelated code
- perform broad refactors

Work in small, testable changes.

# ============================================================
# 1. ALL AUTHORITATIVE IMPLEMENTATION MATERIALS ARE IN GITHUB
# ============================================================

All implementation-authoritative project material must be taken from:

hsushuhao-lab/DutyNight

The repository contains:
- playable source code
- current state/story logic
- tests
- browser playthrough QA
- art helpers
- environment definitions
- historical story specifications
- approved art references
- GitHub Pages deployment
- CI workflows

PRIMARY EXECUTABLE IMPLEMENTATION:
  prototype/

This is the live Three.js + Vite game and is the main implementation target.

DO NOT treat these older trees as the current runtime:
  Source/
  SONGDE_NIGHT_DUTY_ACT1_HANDOFF_v0.1/

They are reference/history unless a current prototype dependency explicitly uses them.

Relevant historical design material already stored in GitHub includes:
  README.md
  DESIGN.md
  SONGDE_NIGHT_DUTY_ACT1_HANDOFF_v0.1/00_README/
  SONGDE_NIGHT_DUTY_ACT1_HANDOFF_v0.1/01_DESIGN/
  SONGDE_NIGHT_DUTY_ACT1_HANDOFF_v0.1/02_ART/APPROVED_REFERENCES/

IMPORTANT:
Some older documents were written when only Act 1 existed.
They contain historical statements such as:
- Bed 33 not yet implemented
- Floor 6 not yet implemented
- later horror not yet implemented

Those old scope restrictions are SUPERSEDED by the current authorized M1–M9 game.

Preserve their useful design principles:
  NORMALITY FIRST. HORROR SECOND.
  believable Taiwanese hospital
  fictionalized topology
  readable medical workflow
  restrained early horror

Do NOT revert the current M1–M9 story back to the old Act-1-only scope.

The user's newest mood-reference image is not required as a binary dependency.
Its intended visual characteristics are fully encoded in this directive.

Do NOT request external files if the required implementation information already
exists in GitHub or in this directive.

If a required source is genuinely missing:
REPORT IT.
Do not invent hidden source material.

# ============================================================
# 2. COMMIT THIS REWORK SPEC BACK INTO GITHUB
# ============================================================

Before or together with implementation, create:

docs/20260925_m1_m9_rework/

Store at minimum:

docs/20260925_m1_m9_rework/MASTER_REWORK_SPEC.md
docs/20260925_m1_m9_rework/TRUE_NAME_CLUE_MATRIX.md
docs/20260925_m1_m9_rework/SCENE_REWORK_MATRIX.md
docs/20260925_m1_m9_rework/QA_ACCEPTANCE.md

After implementation also create:

docs/20260925_m1_m9_rework/IMPLEMENTATION_REPORT.md

Purpose:
future Agents must not depend on ChatGPT conversation history to understand the
current story or design.

All durable implementation decisions must therefore end up in GitHub.

# ============================================================
# 3. SOURCE-OF-TRUTH PRECEDENCE
# ============================================================

When sources conflict, use this order:

1. THIS MASTER DIRECTIVE
2. current origin/master executable behavior in prototype/
3. current automated QA contracts
4. current GitHub README / DESIGN
5. historical SONGDE_NIGHT_DUTY_ACT1_HANDOFF_v0.1 documents

Do NOT silently choose a historical behavior over this directive.

# ============================================================
# 4. CORE RULE: PRESERVE THE ORIGINAL STORY MAINLINE
# ============================================================

This task is a REWORK, not a total narrative rewrite.

Do NOT replace the central story.
Do NOT invent a new protagonist.
Do NOT change the hospital name.
Do NOT remove the loop structure.
Do NOT replace the 409 / 316 / 21:17 / 00:33 / 02:17 identity mystery.

The current story backbone must remain recognizable.

Canonical fictional hospital:
  青嶺醫療中心

Initial presented identity:
  李住院醫師

True identity:
  張守恆

True employee number:
  MED-870409

Use Taiwanese hospital terminology:
  員工編號
  員編

NEVER show "工號" in player-facing text.

Internal variable names such as:
  frag_employeePrefix
  frag_employeeFull
may remain unchanged.

# ============================================================
# 5. CANONICAL M1–M9 MAINLINE TO PRESERVE
# ============================================================

M1 — 3F / beginning of night duty
- protagonist reports for night duty
- senior resident leaves
- 316 chief-resident office is important
- player learns duty workflow / credentials / handoff
- administrative identity inconsistency begins
- first UNREGISTERED MESSAGE may appear
- 302 / archive / older institutional records remain part of mystery

M2 — 4F ordinary ward duty -> Bed 33
- realistic psychiatric night-duty routine comes first
- 403 insomnia remains
- 408C knocking becomes major foreshadowing
- official census is 32 beds
- 409 is sealed and absent from normal census
- 409A appears as impossible bed 33
- accepting 409A causes identity override / loop danger

M3 — ER / 21:17 / 00:33
- ordinary duty continues before horror escalates
- 21:17 contradiction sends player back through 3F evidence
- player is actively pushed back to the 4F duty room
- later ER phone call occurs
- 00:33 legacy registration anomaly appears
- 1998-ER-0217 is recovered
- 316 legacy terminal decodes the first authoritative identity fragments

M4 — second campus chest-pain consult
- 316 phone itself initiates transition
- protagonist realizes someone knows they are inside 316
- second-campus patient is medically ordinary / anxiety-driven
- horror comes from a transfer form already completed in advance
- destination on form is 409A
- identity clue "守" is physically discoverable

M5 — return route / Annie
- bridge route OR hillside/ecology-pond route
- both are valid
- bridge becomes one-way only after player commits past midpoint
- Annie becomes a recurring visual presence
- both routes must allow collection of the equivalent "恆" identity clue

M6 — Phantom 6F
- 6F is NOT pre-announced
- next eligible elevator journey is hijacked
- elevator unexpectedly reaches 6F
- Annie is present in white coat performing repetitive CPR
- correct survival behavior is not to chase her

M7 — 02:17 / first-campus 1F / B2
- restored old guard post makes spatial clue believable
- hidden service door / B-Panel path remains
- B2 mirror-316 archive is reached
- full identity record is found
- MED-870409 becomes explicit and required

M8 — identity takeover
- Doppelgänger / false "李醫師" continues taking over duty identity
- hospital systems treat protagonist as invalid or displaced
- protagonist must return to 316 before final handoff

M9 — true handoff
- final confrontation returns to 316
- player verifies both:
    張守恆
    MED-870409
- correct identity breaks the shift

Do NOT remove or reorder these major milestones unless an existing technical
dependency absolutely requires a small adjustment.

# ============================================================
# 6. AUTHORIZED STORY CHANGES — THESE ARE REQUIRED
# ============================================================

The following are intentional corrections to the existing mainline.

They are NOT permission to rewrite unrelated story sections.

1. 4F official capacity becomes exactly 32 beds.

2. 408C old gentleman repeatedly reports knocking from next door.

3. Knock pattern:
   four knocks
   pause
   nine knocks

4. 409 becomes stronger because it lies OUTSIDE the official 32-bed census.

5. 409A remains impossible bed 33.

6. "交班資料已接收" appears only once persistently.

7. 316 phone dialogue evolves by loop count.

8. ER/316 phone calls must have audible telephone ringing.

9. after 316 legacy index lookup:
   316 telephone rings
   protagonist says:
   「……怎麼知道我在 316 辦公室？」
   only then is second-campus consult assigned.

10. second-campus chest-pain patient is not a new anonymous ghost case.
    Assessment supports anxiety / hyperventilation rather than an acute cardiac
    horror case.

11. horror comes from the already-completed transfer document.

12. transfer destination:
    第一院區 409A

13. bridge becomes one-way after midpoint commitment.

14. second-campus 1F exterior access becomes controlled sensor access.

15. first-campus ER hillside night entrance preserves one-way night logic:
    hillside -> ER allowed
    ER -> hillside blocked

16. first-campus 1F guard post must visibly exist again.

17. 6F must not appear in task HUD beforehand.

18. 6F must not appear as an ordinary selectable floor.

19. Phantom 6F is an elevator hijack.

20. Annie is redesigned as one consistent recurring figure:
    white coat
    pale appearance
    disordered hair
    escalating recurrence
    full CPR manifestation on 6F

21. Annie also appears:
    - 4F storage
    - skybridge
    - ecology-pond path
    - Phantom 6F

22. True Name clues must become physical and comprehensible.

23. M9 verifies BOTH name and 員編.

# ============================================================
# 7. BED ARITHMETIC — HARD CONTRACT
# ============================================================

Official 4F beds:

401A-D = 1–4
402A-D = 5–8
403A-D = 9–12
404A-D = 13–16
405A-D = 17–20
406A-D = 21–24
407A-D = 25–28
408A   = 29
408B   = 30
408C   = 31
408D   = 32

409:
  physical sealed/renovation room
  NOT included in normal bed census
  NOT four ordinary active beds

409A:
  anomalous "33"

Do not merely change UI text.
Data structure, geometry, bed generation and QA must all agree.

Current known incorrect legacy behavior includes:
  bedCapacity:36
  normal beds generated through 409

Fix the underlying model.

# ============================================================
# 8. TRUE NAME / EMPLOYEE NUMBER CLUE SYSTEM
# ============================================================

Canonical:
  姓名：張守恆
  員編：MED-870409
  職級：住院醫師

M1 — optional foreshadow
3F official roster:
  修正液下可辨：
  「住院醫師 張○○」

M1 is optional.
Skipping M1 must NOT make the ending impossible.

M3 — mandatory surname + prefix
316 legacy terminal:
  1998 責任醫師：張○○
  員編：MED-87xxxx

Unlock:
  frag_surname = 張
  frag_employeePrefix = MED-87

M4 — mandatory 「守」
Physical old roster fragment near/under second-campus patient's pillow:

  第一線：張 守 [墨漬]

Optional handwriting:
  「守住 409 的門」

Only inspecting/collecting this physical clue unlocks:
  frag_givenName_1 = 守

Do not award 「守」 merely because the player clicked a dialogue option.

M5 — mandatory 「恆」
Annie-linked physical relic:
  old stethoscope / commemorative metal plate

Engraving:
  「祝 守恆 醫師　1997 執業誌慶」

BOTH routes:
  skybridge
  ecology pond / hillside

must expose an equivalent recoverable clue.

Unlock:
  frag_givenName_2 = 恆

M7 — mandatory full employee number
B2 mirror-316 archive:

  員編：MED-870409
  姓名：張守恆
  職級：住院醫師

Unlock:
  frag_employeeFull = MED-870409
  frag_title = 住院醫師

PersistentMemory.canReconstructTrueName() MUST require:

  frag_employeePrefix === 'MED-87'
  frag_surname === '張'
  frag_givenName_1 === '守'
  frag_givenName_2 === '恆'
  frag_title === '住院醫師'
  frag_employeeFull === 'MED-870409'

No full employee number -> no completed identity reconstruction.

# ============================================================
# 9. M9 FINAL IDENTITY VERIFICATION
# ============================================================

Current name-only completion is insufficient.

Final UI must require:

  姓名：[________]
  員編：[________]

Correct:
  張守恆
  MED-870409

Accept:
  only both correct

Reject:
  correct name + wrong 員編
  wrong name + correct 員編
  wrong both

Success:

  CURRENT DUTY PHYSICIAN VERIFIED

Use existing journal / UI systems.
Do not build a large RPG inventory system.

Journal should make collected identity evidence reviewable.

# ============================================================
# 10. ANONYMOUS-PATIENT TERMINOLOGY
# ============================================================

"無名氏" should remain a special anomaly, not become a generic label for
multiple later patients.

Canonical anomaly line:

  「李醫師，有一位無名氏資料卡住，麻煩你下來看一下。」

Use:
  無名氏

Never:
  無民氏

The later second-campus chest-pain/anxiety patient is an ordinary named/registered
clinical encounter, not another "無名氏" apparition.

Preserve existing story dependencies such as B-Panel evidence, but do not reuse
the anonymous-ghost concept unnecessarily.

# ============================================================
# 11. 4F SPATIAL REWORK
# ============================================================

PRIMARY:
  prototype/src/world/shared/WardFloorplan.js
  prototype/src/world/shared/PlanArchitecture.js
  prototype/src/world/shared/SignAnchor.js
  prototype/src/world/shared/KeyedKnobDoor.js
  prototype/src/world/shared/AccessDoor.js

FirstCampus4F.js is only a thin wrapper.

--------------------------------
4F duty room
--------------------------------

Keep:
- private bathroom
- bed
- desk
- computer
- extension phone
- cabinet

Remove:
- wall clock
- public "洗手間" plaque inside duty room

Do NOT delete wallClock() utility globally.
Just remove story-scene usage where required.

Move computer desk beside bed.

Target:
bed + desk + extension phone reads as one believable resident on-call workspace.

Maintain approx. 0.8 m readable circulation path.

No:
- cabinet/chair intersection
- desk/bed intersection
- doorway obstruction

Duty-room sign:
  4F 醫師值班室

Move ABOVE door.
Flush to wall.
No corridor protrusion.

--------------------------------
4F entrance storage
--------------------------------

For FIRST CAMPUS 4F storage specifically:

use normal keyed knob door / 喇叭鎖語意.

Do not globally convert all storage doors.

Storage sign:
  儲藏室

Mount ABOVE door.
Flush to wall.

Add low-intensity Annie presence inside.

--------------------------------
4F nursing station
--------------------------------

Preserve:
- four-side protected station
- lower wall
- upper glass
- multiple computers
- medication/treatment equipment
- IV pole
- sharps
- files
- clinical props

Fix:
- green cabinet intersecting chair
- chair trapped inside desk/cabinet
- floating white panel
- obstructed bed board
- unreachable workstation space

Furniture must have believable pull-out / walking clearance.

--------------------------------
4F bed board
--------------------------------

Must visibly show:

29 408A
30 408B
31 408C
32 408D

Anomalous old card:

33 409A

Place where:
- visible from approach
- not behind cabinet
- not inside glass
- interaction reachable

# ============================================================
# 12. 4F ROUTINE / 408C
# ============================================================

PRIMARY:
  prototype/src/core/DutyEventManager.js
  prototype/src/main.js
  prototype/src/audio/SoundManager.js

17:15 handoff:

「李醫師，今晚四樓滿床，總共 32 床。
  403 說睡不好。
  另外 408C 的老先生一直說隔壁有人敲牆，
  待會巡房麻煩你幫忙看看。」

408C:

「李醫師！隔壁又在敲了！
  每次都敲四下，停一下，又敲九下……」

Audio:
  knock x4
  pause
  knock x9

Use SoundManager.

Do not rely only on subtitle.

Re-anchor interaction to actual 408C bed position.

403 remains insomnia.

# ============================================================
# 13. 409 PRESENTATION
# ============================================================

409 is a major environmental storytelling anchor.

Required:
- clearly sealed room
- 3 bands / visual layers of caution tape around access region
- official flat-mounted notice:

  【環境消毒與管線重置　暫停使用】

- faint cold illumination through peephole/window if geometry supports it
- no normal patient beds generated there

Do not overdecorate.
The emptiness behind 409 should feel intentional.

# ============================================================
# 14. ONE-TIME EVENT GOVERNANCE
# ============================================================

PRIMARY:
  prototype/src/core/PersistentMemory.js
  prototype/src/core/GameState.js
  prototype/src/main.js

Use small explicit persistent booleans/state.
Do not construct a huge new framework.

Persist across loops:
- first UNREGISTERED MESSAGE / 3F
- first duty-room hot coffee observation
- first 316 whisper call
- other explicitly once-only environmental remarks

"交班資料已接收"
must appear only the first time in persistent history.

Do not replay every room observation each revisit.

# ============================================================
# 15. 316 PHONE PROGRESSION
# ============================================================

Use deterministic loop progression.

loopCount 0:
  「……你還在三樓嗎？」

loopCount 1:
  「嘻嘻，你還在三樓。」

loopCount 2:
  「嘻嘻，你逃不掉的。」

loopCount >= 3:
  「你又回來了。」

No random choice.
Must be QA-testable.

# ============================================================
# 16. 316 -> SECOND CAMPUS STORY HANDOFF
# ============================================================

After M3 legacy terminal decodes 1998-ER-0217:

Do NOT silently unlock the second-campus objective.

Sequence:

1. legacy lookup finishes
2. brief pause
3. physical 316 phone rings
4. protagonist:
   「……怎麼知道我在 316 辦公室？」
5. answer phone
6. nurse:
   「第二院區 5F 有一位胸痛病人需要精神科評估，
     天橋門禁已經幫你開了。」
7. SECOND_CAMPUS_ACCESS becomes available
8. objective updates

The telephone call is the narrative transition.

# ============================================================
# 17. SECOND-CAMPUS CHEST CASE
# ============================================================

PRIMARY:
  prototype/src/world/shared/WardFloorplan.js
  prototype/src/main.js

Remove supernatural identity-card text from this patient such as:
  SOURCE: 00:33 / LEGACY
  查無正式住院資料

This patient is clinically ordinary.

Presentation:
- chest discomfort
- anxious
- hyperventilation
- reassuring findings
- story conclusion: anxiety rather than acute cardiac disease

Nurse after assessment:

「李醫師，既然只是焦慮，那轉院單怎麼辦？」

Transfer form was ALREADY completed.

It shows:
  轉院目的地：第一院區 409A
  開立醫師：李○○

plus an identity/system inconsistency.

Nurse:
「李醫師，單子不是你早就填好的嗎？快補簽名吧。」

Correct action:
refuse to sign.

Then allow discovery of the physical 「守」 roster fragment.

# ============================================================
# 18. SKYBRIDGE / ECOLOGY POND
# ============================================================

PRIMARY:
  prototype/src/world/zones/Skybridge.js
  prototype/src/world/zones/EcologyPond.js
  prototype/src/world/shared/WorldRoutes.js
  prototype/src/main.js

Before route commitment:
both paths remain valid.

Skybridge:
after crossing midpoint:
  first-side route locks
  player cannot simply turn around and exit

Do not make the bridge permanently one-way before commitment.

Annie appears.

Safe completion:
physical engraved clue allows 「恆」.

Ecology pond:
retain asynchronous reflection horror.

Its route must provide an equivalent physical identity relic.

Do not make True Name depend on choosing only the bridge.

# ============================================================
# 19. SECOND CAMPUS 1F
# ============================================================

PRIMARY:
  prototype/src/world/zones/SecondCampus1F.js

Current permanently open exterior Doorway is not acceptable.

Replace gameplay behavior with controlled sensor/access door.

It should:
- look closed normally
- open through appropriate story authorization
- remain compatible with hillside route

# ============================================================
# 20. FIRST-CAMPUS ER NIGHT ENTRANCE
# ============================================================

PRIMARY:
  prototype/src/world/zones/FirstCampus2FER.js
  prototype/src/world/shared/WorldRoutes.js

Canonical night rule:

  hillside -> ER = allowed
  ER -> hillside = blocked

"此門只進不出" remains intentional.

Do not accidentally make the ER hillside door freely bidirectional.

# ============================================================
# 21. FIRST-CAMPUS 1F GUARD POST
# ============================================================

PRIMARY:
  prototype/src/world/zones/FirstCampus1F.js

Restore visible old security post.

Include:
- guard counter
- old CCTV monitor
- security radio
- night logbook
- key storage / cabinet
- restrained believable clutter

Later objective:

  「舊警衛台後方的隱藏服務門」

must make spatial sense.

Do not obstruct primary circulation.

# ============================================================
# 22. PHANTOM 6F — ZERO SPOILER
# ============================================================

PRIMARY:
  prototype/src/ui/UIManager.js
  prototype/src/world/WorldRouter.js
  prototype/src/main.js
  prototype/src/world/zones/Phantom6F.js

CURRENT WRONG BEHAVIOR:
- right-side task text mentions 6F
- floorDestinations() exposes a normal 6F button

REMOVE BOTH.

After M5:
task may say:
  「返回第一院區」
or:
  「返回 3F 總醫師辦公室」

Never:
  6F

Next eligible ELEVATOR ride:
- begins normally
- normal destination is interrupted
- elevator flickers
- display unexpectedly becomes:
    6
- doors open automatically
- load phantom_6f

STAIRS MUST NOT TRIGGER 6F.

# ============================================================
# 23. ANNIE — ONE CONSISTENT CHARACTER LANGUAGE
# ============================================================

Relevant:
  WardFloorplan.js
  Skybridge.js
  EcologyPond.js
  Phantom6F.js
  art helpers / existing asset registry

Do not create unrelated white figures.

Annie escalation:

Stage 1:
4F storage room
- partially hidden
- ambiguous

Stage 2:
bridge / ecology pond
- clearly same woman
- white coat
- pale
- disordered hair

Stage 3:
6F
- unmistakable
- kneeling beside blackened bed
- repeatedly performing CPR
- mechanical repetition
- compression-associated sound

Use the existing internal ANNE_STAGE flag if convenient.
Do not rename broad state systems unnecessarily.

# ============================================================
# 24. VISUAL DIRECTION — REFERENCE IMAGE TRANSLATION
# ============================================================

The desired mood is based on the user's supplied horror reference image.

Do NOT copy:
- shrine
- altar
- religious objects
- literal composition

Translate its ATMOSPHERIC QUALITIES into a hospital:

- dense environment
- strong shadow
- localized practical lighting
- dark peripheral space
- green emergency illumination
- heavy lived-in detail
- claustrophobic framing
- credible human use
- subtle age/wear
- visual storytelling through objects

Final feeling:

「一間真實存在、夜間半熄燈、制度感沉重、
  有人工作，也有人消失過的台灣醫院。」

# ============================================================
# 25. CRITICAL: PRESERVE NORMALITY FIRST / HORROR SECOND
# ============================================================

Do NOT make 17:00 look like full supernatural horror.

Lighting must evolve with story.

17:00–20:40:
- believable hospital
- warm / neutral practical light
- lived-in
- slightly tired institutional environment
- safe enough to establish normal routine

After 21:17:
- gradually reduce comfort
- stronger shadows
- reduced ambient life
- mild green emergency spill

00:33 onward:
- reference-image mood becomes substantially stronger

02:00 / 6F / B2:
- maximum claustrophobic horror contrast

This temporal visual progression is part of the original story identity.

# ============================================================
# 26. LIGHTING REWORK
# ============================================================

Relevant:
  prototype/src/art/VisualProfile.js
  zone-local lighting

Avoid flat white illumination.

Goals:
- lower excess ambient wash
- retain navigation readability
- let corners become dark
- use localized fluorescent practical light
- subtle inconsistent old fixtures
- green EXIT / emergency spill near selected doorways

Approximate ambient target after dark:
  ~0.35–0.45 equivalent

Do not blindly force that value in every phase.
Early Act lighting should remain more comfortable.

Never hide geometry bugs using darkness.

# ============================================================
# 27. TAIWANESE HOSPITAL SET DRESSING
# ============================================================

Use procedural CanvasTexture and existing primitives rather than waiting for
external generative assets.

Preferred helper location:
  prototype/src/art/ArtDetails.js

Possible helpers:
  createTaiwanHospitalPoster()
  createHospitalWhiteboard()
  mountWallGraphic()

4F nursing station whiteboard:

【今日值班】
第一線：李住院醫師
總醫師：316室

【病房現況】
滿床 32 床
408C：防跌倒、易躁動

【特別交班】
409 封閉整修，禁止推床入內

Poster categories:
- 精神衛生法保護宣導
- 落實洗手五時機
- 急性病房危險物品管制規範

Desk props:
- pen holder
- blue/red pens
- thick chart binders
- paper coffee cup
- tissue box
- sticky note:
  「HIS 系統每日 00:00 自動備份」

All must be:
- surface snapped
- believable
- non-floating
- non-intersecting

# ============================================================
# 28. ZERO-TOLERANCE SPATIAL QUALITY
# ============================================================

No release if any major story scene has:

- floating signs
- signs penetrating walls
- signs blocking corridors
- chairs inside cabinets
- cabinets inside chairs
- monitor through glass
- floating documents
- railings crossing door openings
- critical board hidden by furniture
- invisible task point floating in meaningless empty floor
- obvious collision in player path

For every important scene define:
1. circulation path
2. work surface
3. storage edge
4. interaction focus
5. horror focal point

# ============================================================
# 29. 4F / ER ENVIRONMENT DETAILS
# ============================================================

4F ward:
- richer nursing station
- clear bed board
- policy posters
- lived-in desk detail
- realistic clinical clutter
- door hardware
- wall rails / bumpers
- signage mounted correctly

Corridor protection rails:
- around ~0.85 m visual height
- MUST stop at doors
- never pass through door openings

ER:
- repair monitor/glass collision
- enrich nurse station
- files
- printer
- carts
- supplies
- credible night work environment

Do not make ER an empty white room.

# ============================================================
# 30. DO NOT RECONSTRUCT A REAL HOSPITAL
# ============================================================

Hospital is fictional.

Preserve:
  青嶺醫療中心

Do NOT reconstruct exact:
- real hospital security layouts
- restricted access-control maps
- real evacuation layouts
- protected institutional material

Use only fictionalized / high-level hospital spatial language already authorized
in the repository.

Do not attempt to recover excluded RESTRICTED_REFERENCE files.

# ============================================================
# 31. KEY IMPLEMENTATION FILE MAP
# ============================================================

STORY / STATE

prototype/src/main.js
- primary interactions
- M3–M9 story logic
- 316 call
- M4 / M5 / M6 / M7 resolutions
- final handoff

prototype/src/core/GameState.js
- loop-local state

prototype/src/core/PersistentMemory.js
- persistent loop state
- True Name
- survival rules
- seen-once state

prototype/src/core/DutyEventManager.js
- ordinary duty timeline
- normal ward / ER event progression

prototype/src/ui/UIManager.js
- HUD task board
- journal
- final identity UI
- elevator interface

prototype/src/audio/SoundManager.js
- phone ring
- knock audio
- procedural sound

WORLD

prototype/src/world/shared/WardFloorplan.js
- first-campus 4F
- 32-bed model
- duty room
- Bed 33 / 409
- second-campus 5F M4 scene

prototype/src/world/shared/PlanArchitecture.js
- ordinary rooms
- bed generation
- workstation
- nursingStationV5
- nursing clinical props

prototype/src/world/shared/SignAnchor.js
- sign mounting

prototype/src/world/shared/KeyedKnobDoor.js
- knob doors

prototype/src/world/shared/AccessDoor.js
- sensor / controlled doors

prototype/src/world/zones/FirstCampus3F.js
- administrative identity clues
- 316 context

prototype/src/world/zones/FirstCampus2FER.js
- ER
- ER station
- night entrance
- ghost-registration event

prototype/src/world/zones/FirstCampus1F.js
- guard post
- hidden service path

prototype/src/world/zones/SecondCampus1F.js
- hillside access

prototype/src/world/zones/Skybridge.js
- one-way bridge
- Annie

prototype/src/world/zones/EcologyPond.js
- alternate Annie route

prototype/src/world/zones/Phantom6F.js
- 6F CPR Annie

prototype/src/world/zones/B2Archive.js
- final archival identity

prototype/src/world/WorldRouter.js
- zones
- floors
- Phantom 6F routing

prototype/src/world/shared/WorldRoutes.js
- route directionality

ART

prototype/src/art/ArtDetails.js
- procedural hospital props / posters
- existing wallClock helper
- do NOT delete common helpers merely because scenes stop using them

prototype/src/art/VisualProfile.js
- lighting profiles

# ============================================================
# 32. TEST-FIRST IMPLEMENTATION
# ============================================================

For each logical defect:
make an automated contract fail first where practical,
then implement until it passes.

At minimum update:

prototype/test_bed33_gold_slice_qa.js

Verify:
- official 32 beds
- 408C = 31
- 408D = 32
- 409 excluded
- 409A = 33

prototype/test_m3_m9_story_qa.js

Verify:
- player-facing 員編
- M3 surname / MED-87
- M4 anxiety case
- physical 守 clue
- both M5 routes yield equivalent 恆 clue
- full MED-870409 required
- M9 name + employee ID
- no pre-announced 6F

prototype/test_visual_geometry_contract_qa.js

Verify:
- major duty-room furniture clearances
- sign mount
- bed board accessible
- ER monitor/glass separation

prototype/test_user_floorplan_qa.js
prototype/test_ward_circulation_qa.js

Verify:
- duty-room path
- station furniture clearance
- door / sign relationship

prototype/test_hospital_access_policy_qa.js
prototype/test_er_boundary_qa.js

Verify:
- hillside -> ER allowed
- ER -> hillside blocked
- second-campus sensor access
- bridge commitment behavior

prototype/test_first_campus_rooms_qa.js

Verify:
- first-campus old guard post exists

prototype/test_second_rooms_qa.js

Verify:
- second-campus controlled entry

# ============================================================
# 33. BROWSER PLAYTHROUGH — RELEASE GATE
# ============================================================

Most important integration test:

prototype/scripts/test-story-playthrough.mjs

Extend it to prove the real mainline still works.

Required evidence:

1. normal M1 opening still works
2. official 4F census = 32
3. 408C knock event occurs
4. 409A = anomalous bed 33
5. ER call audibly triggers
6. 21:17 chain works
7. post-21:17 duty-room push works automatically
8. 00:33 anomaly occurs
9. 316 displays 員編 terminology
10. 316 physical phone initiates M4
11. M4 patient is ordinary anxiety case
12. transfer form already targets 409A
13. player collects 守 clue
14. M5 routes both have access to 恆 clue
15. task HUD does NOT mention 6F before anomaly
16. elevator selector does NOT offer ordinary 6F
17. elevator hijacks into Phantom 6F
18. Annie CPR presentation exists
19. 1F / B2 progression still works
20. B2 yields MED-870409
21. wrong name / correct ID fails
22. correct name / wrong ID fails
23. 張守恆 + MED-870409 succeeds
24. M9 completes

Capture screenshots for:
- 4F nursing station
- duty room
- 409
- ER station
- first-campus guard post
- second-campus M4
- Annie bridge/pond
- Annie 6F
- B2
- M9

# ============================================================
# 34. STATIC QA
# ============================================================

At minimum:

cd prototype
npm ci

node test_privacy_3f_fast_qa.js
node test_3f_archive_qa.js
node test_cross_floor_entanglement_qa.js
node test_cross_floor_sequence_qa.js
node test_persistent_loop_qa.js
node test_bed33_gold_slice_qa.js
node test_m3_m9_story_qa.js
node test_visual_geometry_contract_qa.js
node test_user_floorplan_qa.js
node test_ward_circulation_qa.js
node test_hospital_access_policy_qa.js
node test_er_boundary_qa.js
node test_first_campus_rooms_qa.js
node test_second_rooms_qa.js

npm run build

Browser:

npx playwright install chromium   # only if missing
node scripts/test-story-playthrough.mjs qa-results/story-local

No browser PASS = no completion claim.

# ============================================================
# 35. CI / PAGES
# ============================================================

Relevant:

.github/workflows/deploy-pages.yml
.github/workflows/story-browser-playthrough.yml

If new QA becomes a mandatory release contract:
add it to deploy-pages.yml.

Do not remove or weaken old tests merely to obtain green CI.

After everything passes locally:

git diff --check
git status
git diff

Commit coherent changes.

Push only when local QA is green:

git push origin master

Then verify exact final master SHA against:

Fast Deploy GitHub Pages
Story Browser Playthrough

The Story Browser Playthrough must pass:
- local production
- public GitHub Pages

Do NOT report deployment success merely because git push succeeded.

# ============================================================
# 36. DOCUMENTATION MUST MATCH THE NEW MAINLINE
# ============================================================

After implementation is verified:

Update documentation only where needed so future Agents do not receive
contradictory instructions.

Do NOT erase historical records.

Instead:
- keep old Act1 documents as historical material
- place current M1–M9 authority under docs/20260925_m1_m9_rework/
- optionally add a clear pointer from README to the current M1–M9 spec

Do not rewrite every historical file.

# ============================================================
# 37. REQUIRED FINAL REPORT
# ============================================================

Return:

FINAL STATUS:
  COMPLETE
or
  BLOCKED

Include:

- final master SHA
- git status
- changed-file list
- current story/mainline confirmation
- 32-bed / 409A result
- True Name result
- 員編 result
- phone progression result
- second-campus result
- Annie result
- 6F anti-spoiler result
- spatial QA result
- visual atmosphere result
- static QA results
- npm build result
- local browser playthrough result
- public Pages playthrough result
- live URL
- remaining blockers, if any

Never hide a failure.

# ============================================================
# 38. FINAL SUCCESS DEFINITION
# ============================================================

The project is successful when the EXISTING M1–M9 story has been preserved,
but its approved weak points have been repaired.

The desired result is NOT a different game.

It is the same DutyNight story,
now with:

- coherent 32-bed arithmetic
- stronger 409A meaning
- believable Taiwanese hospital terminology
- clearer True Name inference
- better phone-driven narrative propulsion
- normal M4 clinical case + administrative horror
- fair bridge/pond branch parity
- surprise rather than spoiled 6F
- Annie as a consistent recurring presence
- name + 員編 final payoff
- realistic furniture placement
- no floating / clipping objects
- richer Taiwanese hospital environmental storytelling
- lighting that evolves from ordinary duty into oppressive horror
- full GitHub documentation and reproducible QA

Preserve:
  NORMALITY FIRST.
  HORROR SECOND.

Do not turn the opening shift into a haunted house.
Make the hospital believable first.

Then make the player realize that something is wrong with the hospital,
the records,
and eventually with their own identity.