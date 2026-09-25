# DutyNight 2.0 — MASTER UPGRADE DIRECTIVE
## M1–M9 Master Walkthrough Bible v3.1 / Indoor Horror Rebuild
Date: 2026-09-25

REPOSITORY
https://github.com/hsushuhao-lab/DutyNight

LIVE
https://hsushuhao-lab.github.io/DutyNight/

Observed master when this directive was prepared:
ae7d98dce998f0b36ed30ebeafde6cbdbc85db25

This SHA is reference only. Always work from current origin/master.

============================================================
0. FIRST ACTION / SOURCE OF TRUTH
============================================================

Run:
git fetch origin master
git checkout master
git pull --ff-only
git status
git rev-parse HEAD
git log -n 10 --oneline

Do NOT reset to the observed SHA.
Do NOT force-push.
Do NOT delete unrelated or legacy files merely because they are unused.

Executable implementation authority:
  prototype/

Current durable M1–M9 docs:
  docs/20260925_m1_m9_rework/

Historical Act-1-only files remain reference/history and must NOT override this directive.

SOURCE PRECEDENCE:
1. this DutyNight 2.0 directive
2. current origin/master executable behavior in prototype/
3. current QA
4. docs/20260925_v2_upgrade/ after created
5. docs/20260925_m1_m9_rework/
6. older README/DESIGN/Act1 handoff history

============================================================
1. MANDATORY ART-HANDOFF INGEST
============================================================

A handoff package named:
  DutyNight_V2_ART_HANDOFF.zip

contains the latest generated environment concept boards plus:
  ANNIE_FINAL_IDENTITY.md
  README.md

If the handoff attachment is available, unpack and commit it FIRST into:

  docs/20260925_v2_upgrade/art_reference/

Do not use the generated Chinese text inside concept images as narrative authority.
The images are mood/composition/material references only.

Important visual exceptions:
- clocks shown in concept art are NOT canonical
- outdoor hillside/ecology imagery is DEPRECATED for production gameplay
- REFERENCE_ONLY_SUPERSEDED_ANNIE.png is wardrobe/mood reference only;
  Annie is NOT a real female resident doctor

Create:
  docs/20260925_v2_upgrade/MASTER_WALKTHROUGH_BIBLE_V3_1.md
  docs/20260925_v2_upgrade/ANNIE_IDENTITY_BIBLE.md
  docs/20260925_v2_upgrade/INDOOR_WORLD_SCOPE.md
  docs/20260925_v2_upgrade/ART_DIRECTION_V2.md
  docs/20260925_v2_upgrade/QA_V2.md
  docs/20260925_v2_upgrade/IMPLEMENTATION_REPORT.md

Update README with a short pointer to this V2 authority.
Do not erase historical documents.

============================================================
2. DUTYNIGHT 2.0 GOAL
============================================================

Upgrade DutyNight from a functionally playable prototype into a believable,
dense, oppressive Taiwanese-hospital psychological horror game while preserving
the existing M1–M9 identity mystery.

The two core player experiences remain:

SURFACE GAME:
  complete one night of hospital duty

UNDERLYING GAME:
  refuse each attempt to convert the doctor into a patient,
  recover the erased identity:
    張守恆
    員編 MED-870409
  and finally complete the true handoff

The upgrade is NOT a new story.
It is a major atmosphere, spatial-credibility, narrative-coherence and QA pass.

============================================================
3. AUTHORITATIVE WORLD-SCOPE CHANGE: PURE INDOOR CLOSED BOX
============================================================

The production game is now PURELY INDOOR / ENCLOSED.

REMOVE from production traversal:
  hillside_route
  ecology_pond
  outdoor return gameplay
  any task text offering the ecology-pond/hillside alternative

Do not necessarily delete the source files.
Prefer to make them unreachable from production routes and UI unless safe deletion
is explicitly necessary.

The skybridge is the ONLY normal connection between the two campuses.

Allowed exterior:
- views through windows
- distant night hospital exterior
- rain / darkness / trees as backdrop
- NO playable exterior path

Second-campus 1F hillside exit:
- not part of the production mainline
- may remain physically closed / inaccessible background
- must not provide a route around M5

First-campus ER exterior hillside route:
- remove from production traversal contract
- existing geometry may remain background if removing it risks regressions
- no live portal may take the player outdoors

Add static QA proving no production route reaches:
  hillside_route
  ecology_pond

============================================================
4. ANNIE — FINAL IDENTITY
============================================================

Annie is NOT a dead female doctor.
Annie is NOT 張守恆.
Annie is NOT the primary enemy.

PHYSICAL IDENTITY:
- old late-1990s CPR training mannequin
- hospital staff nickname: 「安妮」
- generic fictional training mannequin; no real manufacturer branding
- female-coded training face, but clearly a mannequin on close inspection

VISUAL TRAITS:
- pale molded synthetic skin
- faint jaw / neck mold seams
- one small molded nose only; no eyes, sockets, brows, pupils, lashes, mouth, or airway opening
- stiff shoulder/elbow/wrist behavior
- slightly oversized yellowed white coat
- removed/blank staff badge area
- no attached chest decoration or prop; Zhang's engraved stethoscope is staged nearby as a separate clue object

NARRATIVE IDENTITY:
Annie is a BODY WITHOUT A NAME.

The hospital erased 張守恆's professional identity and converted him into a
"patient". The mannequin is the thematic opposite:
a body that never possessed a legal identity but gradually becomes the container
for the identity traces the institution erased.

Therefore Annie functions as:
- memory vessel
- identity echo
- omen
- silent guide
- physical carrier of lost professional objects

She is not the agent doing the institutional "override".
The hostile force is:
  the hospital's identity-overwrite mechanism
  + Doppelgänger / false 李醫師 identity

When the player breaks a rule, Annie may appear closer or become uncanny,
but the actual game-over should resolve through institutional capture /
patientization / record override rather than "Annie attacks like a monster".

ZHANG SHOU-HENG RELATION:
The yellowed white coat and engraved stethoscope belong to 張守恆, NOT Annie.

After the 1998 incident and forced patientization, his staff possessions were
removed. The old coat remained on the mannequin while the stethoscope was
staged separately beside the 3F training cart and at the M5 relic site.

Stethoscope engraving:
  「祝 守恆 醫師　1997 執業誌慶」

This is why Annie carries a True Name clue without being 張守恆.

Optional B2 archival prop can explain:
  1998 training equipment inventory
  CPR training mannequin "ANNIE"
  white coat / stethoscope logged as unidentified staff property after incident

M6 SYMBOLIC INVERSION:
The object designed to RECEIVE CPR is now mechanically PERFORMING CPR.

Its repeated compression sound should resemble:
- old training spring
- stiff mechanism
rather than gore/bone-breaking.

============================================================
5. ANNIE ESCALATION
============================================================

M1 / 3F STORAGE:
- ordinary-looking static CPR mannequin
- seated on a round stool, back partly toward corridor
- yellowed white coat draped/worn
- clear mannequin chest; separate stethoscope clue beside the training cart
- player can plausibly dismiss it as staff training equipment
- no overt movement

POST-21:17 OPTIONAL 4F STORAGE:
- if revisited, the same mannequin may appear in another storage room
- impossible relocation is the horror
- use sparingly; do not interrupt required tasks

M5 / SKYBRIDGE RETURN:
- near-human manifestation
- same face / coat / proportions
- intermittent fluorescent light makes mannequin traits alternate between
  "almost human" and "obviously synthetic"
- mechanically performs empty CPR-like compressions / kneeling movement
- does not speak normally
- leaves/reveals 張守恆's stethoscope at the first-campus end

M6 / PHANTOM 6F:
- full manifestation
- kneels beside a scorched bed / body silhouette
- repetitive CPR
- compression mechanism sound
- player must not chase or step out

Create one shared visual builder instead of three unrelated white figures.

Preferred new helper:
  prototype/src/art/AnnieArt.js

Suggested exports:
  buildAnnieManikin(...)
  buildAnnieStethoscopeRelic(...)
  setAnnieState(...)

States:
  STORAGE_STATIC
  BRIDGE_MANIFEST
  FLOOR6_CPR

Minimize unrelated refactors.

============================================================
6. CORE MAINLINE — PRESERVE, BUT APPLY THESE CORRECTIONS
============================================================

M1 17:00–17:30 / 3F
- arrive and receive duty
- guard checkpoint -> 316 backup key
- 316 manual -> 1700 locker -> Staff Card + 4F duty-room key
- desk drawer -> HIS credentials
- first electronic handoff
- UNREGISTERED MESSAGE / 3F only once persistently
- 316 phone:
    loop 0: 「……你還在三樓嗎？」
    loop 1: 「嘻嘻，你還在三樓。」
    loop 2: 「嘻嘻，你逃不掉的。」
    loop >=3: 「你又回來了。」
- optional admin roster reveals 「住院醫師 張○○」
- 3082 -> 302 -> 文史 key -> unindexed record
- codes 02:17 / 03:16 / 04:09
- static Annie mannequin in 3F storage
- elevator panel glitch to 4F remains

M2 17:30–19:30 / 4F
- official capacity EXACTLY 32
- 401–408, four beds each
- 408C = bed 31
- 408D = bed 32
- 409 not part of official census
- 409A = impossible bed 33
- 403 = insomnia ONLY
- 408C = knocking complaint ONLY
- knock pattern 4 / pause 1.5 sec / 9
- sealed 409
- reject 409A assignment
- SPACE_PROOF_FRAGMENT_1
- M2 may visually hint MED-87 on forged authorization, but do NOT make M2 the
  authoritative fragment source; M3 must still grant MED-87

20:00–21:17 PRELUDE
- 20:05 ER call MUST audibly ring
- Jane Doe prelude
- B-Panel cross key
- old wristband 1998-ER-0217
- return to duty room
- 21:15 call -> 3F guard checkpoint
- 21:17 completes the causal loop

IMPORTANT:
Do NOT reintroduce a permanent physical wall clock.
If a 21:17 timestamp is shown, use a temporary electronic checkpoint display /
HUD-linked digital timestamp, not a static wall clock.

At 21:17:
- regular task UI may visually glitch/collapse briefly
- BUT story propulsion must continue
- "sandbox" means freedom of movement, NOT absence of triggers
- player must still be pushed back to the duty room and then toward 00:33

M3 00:33 / ER -> 316
- ghost registration slip
- only here use 無名氏 as the special anomaly
- reject new-record creation
- carry 1998-ER-0217 to 316
- legacy terminal:
    張○○
    員編 MED-87xxxx
- mandatory:
    surname 張
    prefix MED-87
    TIME proof
- physical 316 phone rings AFTER decode
- protagonist:
    「……怎麼知道我在 316 辦公室？」
- only after phone answer unlock second-campus assignment

M4 ~01:15 / SECOND CAMPUS 5F
- outbound trip uses skybridge
- trip 1 should be stable enough to establish a baseline
- patient is an ordinary registered person with anxiety/hyperventilation
- no new anonymous ghost
- no disappearing patient on correct path
- horror is administrative:
    transfer form already completed
    destination 第一院區 409A
    false/invalid 李 identity
- nurse asks why form already exists
- reject signing
- patient remains physically present and calms; do NOT supernaturalize the patient
- physical roster fragment:
    第一線：張 守 [墨漬]
    「守住 409 的門」
- collect -> 守

BAD M4:
Because V2 is indoor-only, DO NOT use an ambulance/outdoor transfer.
Wrong signing triggers internal patient transfer:
- transport stretcher / ward orderlies
- closed institutional route
- skybridge/internal transport
- player is converted into transfer patient -> 409A -> loop

M5 ~01:45 / SKYBRIDGE RETURN ONLY
This is the only return route.

CORE SEMANTIC PARADOX:
"往回走" is not the same as "回頭看".

The player is physically returning toward first campus,
but must not rotate their view back toward second campus after committing.

Implementation contract:
- M5 return event only activates entering bridge from second-campus side AFTER M4
- crossing/committing past return threshold locks second-campus door
- define intended forward heading toward first campus
- count a look-back only when camera yaw deviates > ~110 degrees from forward
  continuously for >= ~0.45 sec
- after one look-back event, camera must return under ~70 degrees before another
  can count
- 1st violation: audio whisper / lights react
- 2nd violation: Annie appears closer
- 3rd violation: institutional override / loop
- do not show a numeric violation counter in HUD

Correct:
- keep facing first-campus direction
- pass Annie
- retrieve engraved stethoscope
- collect 恆
- journal now reconstructs 張 / 守 / 恆

M6 ~02:00 / HIJACKED ELEVATOR
- HUD only says return to 3F / first campus
- no 6F spoiler
- no normal 6F floor button
- stairs never trigger
- next eligible elevator ride hijacks
- display flashes 6
- Phantom 6F
- Annie CPR
- player must not step out
- no need to build a full camera subsystem:
  use E / inspect interaction from elevator threshold to "photograph/record"
  the mirrored evacuation diagram
- obtain SPACE_PROOF_FRAGMENT_2 / B2 mirror diagram

M7 02:17 / 1F -> B2
- old guard post visible and believable
- B-Panel cross key
- old instruction 1-3-4 is trap
- choose B-Panel purple inspection circuit
- concealed service door appears
- 0316
- B2 mirror 316
- final archive:
    姓名 張守恆
    員編 MED-870409
    職級 住院醫師
- 0409 is the final FOUR digits after MED-87, not "three digits"
- True Name reconstruction requires full employee number

M8 03:30–04:00
- system rejects MED-870409
- false 李 identity active at 316
- security / restraint threat
- use indoor stair / service shortcuts
- no outdoor route
- race back to 316

M9 04:05
Final handoff fields:
  姓名
  員編

Only:
  張守恆
  MED-870409
succeeds.

============================================================
7. KNOWN INCOMPLETE ITEMS FROM LAST AUDIT — MUST FIX
============================================================

A. DutyEventManager still contains old:
  "36床"
  "403敲牆"

Fix:
- 32 beds
- 403 insomnia
- 408C knocking

B. main.js still contains an 18:00 nursing call saying:
  403 old man hears knocking

Fix to 408C.
Remove/retire KNOCK_403_49 semantics.
Do not leave two conflicting knock sources.

C. 4F task still uses generic:
  NORMAL_EVENT / 一般病房事件

Re-anchor and rename for 408C:
  查看 408C 反映的敲牆聲
or equivalent.

D. Duty room still has public 洗手間 plaque.
REMOVE the plaque only.
Keep bathroom.

E. Duty-room workstation still sits far from bed.
Actually relocate desk + chair + extension phone beside bed with clear circulation.

F. 20:05 ER notification currently has subtitle only.
Add:
  soundManager.playPhoneRingPattern()
before the call line.

G. Hospital art V2 set dressing is incomplete.
Current ArtDetails was not upgraded enough.
Implement whiteboards/posters/desk life.

H. Visual screenshot QA currently allows screenshot timeouts as warnings.
This is NOT acceptable.

Make screenshot failure a release failure:
- no swallowed timeout warnings
- final assert screenshotWarnings.length === 0
- each required visual shot must exist

I. Current visual screenshots are badly framed.
Create explicit ART_QA spawns/camera targets.
Each screenshot must actually contain its named scene anchor.

J. IMPLEMENTATION_REPORT previously claimed screenshot completeness inconsistent
with artifact evidence.
Replace report after true visual QA.

============================================================
8. VISUAL 2.0 — ART DIRECTION
============================================================

Target:
credible Taiwanese hospital first,
oppressive horror second.

Do NOT make 17:00 a haunted house.

COLOR / LIGHTING PROGRESSION

17:00–20:40 NORMAL:
- warm-neutral hospital practicals
- slightly aged ivory walls
- institutional sage green
- terrazzo / resilient floors
- dark wood doors
- readable shadows
- no heavy horror green cast

21:17–00:33 UNEASE:
- reduce ambient comfort
- more local pools of fluorescent light
- darker corridor ends
- restrained green emergency spill
- small inconsistent/failing fixtures
- no global teal filter

00:33–02:00 NIGHT HORROR:
- stronger contrast
- deeper peripheral darkness
- green EXIT influence
- desk lamps / phone lights become local warm anchors
- glass reflections more visible
- institutional spaces remain readable

6F / B2 MAXIMUM:
- practical lights only
- near-black peripheral zones
- dirty green/cyan emergency light
- occasional warm tungsten archival desk light
- scorched, wet, oxidized material response
- high contrast without hiding geometry bugs

Suggested palette direction:
- aged hospital ivory
- desaturated institutional sage
- oxidized teal
- terrazzo grey
- dark stained wood
- stainless steel
- warm amber desk lamps
- deep charcoal shadow

============================================================
9. ENVIRONMENTAL DENSITY / SET DRESSING
============================================================

Create a small reusable procedural hospital set-dressing helper.

Preferred:
  prototype/src/art/HospitalSetDressing.js
or tightly-scoped additions to ArtDetails.js

Support:
  hospital whiteboard
  acrylic policy poster
  paper notice
  sticky note
  pen cup
  binders
  tissue box
  coffee cup
  clipboards
  security logbook
  key cabinet labels

Use CanvasTexture.
Do not rely on external real-hospital photos.

4F nursing station:
- big duty whiteboard
  【今日值班】第一線：李住院醫師 ｜ 總醫師：316室
  【病房現況】滿床 32 床 ｜ 408C：防跌倒、易躁動
  【特別交班】409 封閉整修，禁止推床入內
- posters:
  精神衛生法保護宣導
  落實洗手五時機
  急性病房危險物品管制規範
- desk:
  pens
  green/blue binders
  tissue
  coffee
  sticky note:
    HIS 系統每日 00:00 自動備份
- all props surface-snapped
- no clutter blocking chairs

4F corridor:
- green wall protection rails
- rails cut cleanly at doors
- framed institutional notices
- EXIT box with subtle green spill
- 409 is visual focal point

409:
- three caution bands / layers
- flat official notice:
  環境消毒與管線重置
  暫停使用
- faint cold peephole/window glow
- no ordinary beds

4F duty room:
- no wall clock
- no washroom plaque
- bed + bedside workstation
- extension phone
- desk lamp
- folders / notes
- believable 0.8m-ish circulation

2F ER:
- richer nursing station
- workstations behind glass, not intersecting glass
- printer
- files
- carts
- sharps
- IV / supplies
- phone
- registration/triage details
- no empty white-box feeling

1F guard post:
- old CCTV
- radio
- logbook
- key cabinet
- lamp
- paper notices
- hidden service door nearby

Second campus 5F:
- ordinary clinical ward
- patient bed / vitals
- pre-filled transfer paperwork is the horror focal point
- keep patient human/ordinary

Skybridge:
- enclosed
- cold fluorescent baseline outbound
- return trip has intermittent fixture failures
- reflections in glass
- first/second campus doors
- no outdoor playable path

6F/B2:
- severe but still navigable
- charred surfaces
- broken ceiling
- wet reflective patches
- abandoned carts
- archive terminal
- Annie CPR focal composition

============================================================
10. SIGNS / FURNITURE / COLLISION — ZERO TOLERANCE
============================================================

No:
- floating sign
- wall penetration
- sign projecting into walkway
- chair fused into cabinet
- cabinet occupying chair pull-out
- monitor through glass
- floating paper
- rail crossing doorway
- board hidden behind furniture
- invisible task point in arbitrary empty floor

4F duty-room and storage signs:
mount above the door, flush to wall.

Storage:
use knob-door semantics where specified.

Do not hide geometry mistakes with darkness.

============================================================
11. AUDIO 2.0
============================================================

Use procedural/current SoundManager where possible.

Required audible beats:
- M1 316 phone
- 20:05 ER call
- 21:15 urgent call
- 00:30/00:33 ER call
- M3->M4 316 phone
- 408C 4 / pause / 9 wall knocks
- elevator 6F metal scrape
- skybridge door lock slam
- intermittent fluorescent buzz
- Annie CPR mechanism click
- M8 alarm / access-denied sounds

Audio should support story triggers, not replace visual clarity.

============================================================
12. TRUE NAME / IDENTITY GATES
============================================================

M1:
  張○○ optional only

M3 mandatory:
  張
  MED-87

M4 mandatory:
  守

M5 mandatory:
  恆

M7 mandatory:
  MED-870409
  住院醫師

PersistentMemory.canReconstructTrueName() must require:
  frag_employeePrefix === 'MED-87'
  frag_surname === '張'
  frag_givenName_1 === '守'
  frag_givenName_2 === '恆'
  frag_title === '住院醫師'
  frag_employeeFull === 'MED-870409'

Player-facing:
  員編
never:
  工號

============================================================
13. FILE MAP
============================================================

Story/state:
  prototype/src/main.js
  prototype/src/core/GameState.js
  prototype/src/core/PersistentMemory.js
  prototype/src/core/DutyEventManager.js
  prototype/src/ui/UIManager.js
  prototype/src/audio/SoundManager.js

Art:
  prototype/src/art/VisualProfile.js
  prototype/src/art/ArtDetails.js
  prototype/src/art/AssetRegistry.js
  new: prototype/src/art/AnnieArt.js
  optional new: prototype/src/art/HospitalSetDressing.js

World:
  prototype/src/world/shared/WardFloorplan.js
  prototype/src/world/shared/PlanArchitecture.js
  prototype/src/world/shared/SignAnchor.js
  prototype/src/world/shared/KeyedKnobDoor.js
  prototype/src/world/shared/AccessDoor.js
  prototype/src/world/shared/WorldRoutes.js
  prototype/src/world/shared/DebugSpawnPoints.js
  prototype/src/world/WorldRouter.js

Zones:
  prototype/src/world/zones/FirstCampus3F.js
  prototype/src/world/zones/FirstCampus4F.js
  prototype/src/world/zones/FirstCampus2FER.js
  prototype/src/world/zones/FirstCampus1F.js
  prototype/src/world/zones/FirstCampus8FBridgeEntry.js
  prototype/src/world/zones/Skybridge.js
  prototype/src/world/zones/SecondCampus2F.js
  prototype/src/world/zones/SecondCampusStandardFloor.js
  prototype/src/world/zones/SecondCampus1F.js
  prototype/src/world/zones/Phantom6F.js
  prototype/src/world/zones/B2Archive.js

Deprecated from production route:
  prototype/src/world/zones/HillsideRoute.js
  prototype/src/world/zones/EcologyPond.js

Keep files unless safe deletion is explicitly authorized.
Just remove production reachability.

============================================================
14. TEST-FIRST CONTRACT
============================================================

Before declaring completion, update/add tests.

A. story consistency
- no player-facing "36床"
- no 403 knocking dialogue
- 403 insomnia only
- 408C knocking only
- no "工號"

B. bed model
- exactly 32 official beds
- 408C 31
- 408D 32
- 409 not ordinary census
- 409A anomalous 33

C. indoor scope
- no production route to hillside_route
- no production route to ecology_pond
- no task text offering outdoors
- M4 outbound and M5 return both use skybridge

D. Annie identity
- shared Annie builder exists
- M1 static mannequin
- M5 manifestation
- M6 CPR
- stethoscope engraving
- no code/text defining Annie as a real female doctor

E. 6F
- not in task board beforehand
- not in normal elevator floor list
- elevator hijack only
- stairs never trigger

F. M9
- correct name/wrong ID rejects
- wrong name/correct ID rejects
- both correct passes

G. visual geometry
- duty-room washroom plaque absent
- no wallClock use in key story rooms
- duty desk near bed and circulation clear
- station chair/cabinet clear
- ER monitor/glass separated
- bed board visible
- 409 sign/tape present
- first-campus guard post present

H. screenshot QA
- screenshot timeout = FAIL, not warning
- required screenshot file count must match expectation
- no screenshotWarnings
- verify named visual anchor is in camera frustum before each shot

============================================================
15. REQUIRED BROWSER EVIDENCE
============================================================

Capture REAL local + public Pages screenshots for:

1. M1 3F admin / 316
2. M1 3F storage Annie static
3. M2 4F nursing station
4. M2 4F duty room
5. M2 408C
6. M2 sealed 409
7. M3 ER nursing station
8. M3 00:33 registration
9. M3 316 legacy terminal + ringing phone
10. M4 second-campus ordinary patient
11. M4 pre-filled transfer form
12. M4 守 roster clue
13. M5 outbound bridge baseline
14. M5 return bridge Annie
15. M5 stethoscope relic
16. M6 elevator display 6
17. M6 Annie CPR
18. M7 first-campus 1F guard post
19. M7 B-Panel / concealed door
20. M7 B2 mirror 316
21. M9 dual identity form
22. M9 successful dawn ending

Each screenshot must be visually framed to show the named subject.

No "PASS" if only the state machine passes while screenshots fail.

============================================================
16. RELEASE GATES
============================================================

Run current static suite plus any new V2 tests.

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

Run new V2 tests added for:
- indoor world scope
- Annie identity
- visual evidence hard fail

npm run build

Then:
node scripts/test-story-playthrough.mjs qa-results/story-local

After push, require:
- Fast Deploy GitHub Pages SUCCESS
- exact SHA fingerprint match
- Story Browser Playthrough local SUCCESS
- Story Browser Playthrough public Pages SUCCESS
- required screenshots all present
- zero screenshot warnings

============================================================
17. IMPLEMENTATION ORDER
============================================================

Commit 1:
docs: establish DutyNight V2 authority and ingest art references

Commit 2:
story: remove outdoor routes and lock M4/M5 to skybridge round trip

Commit 3:
story: eliminate 36-bed / 403-knock remnants and repair phone triggers

Commit 4:
art: rebuild duty room, nursing station, ER and guard-post spatial semantics

Commit 5:
art: add hospital set dressing and narrative lighting V2

Commit 6:
art/story: unify Annie mannequin identity and stethoscope relic

Commit 7:
story: implement return-bridge look-back rule and 6F/B2 polish

Commit 8:
test: harden visual QA and screenshot evidence

Push only after local full suite is green.

============================================================
18. FINAL STATUS RULE
============================================================

Allowed final status:

COMPLETE
only if:
- functional story passes
- visual geometry passes
- indoor scope passes
- art V2 is implemented
- screenshot evidence is complete
- public Pages exact SHA passes

Otherwise:
BLOCKED / INCOMPLETE

Never use:
"COMPLETE" based only on automated state progression.

Final report must include:
- final SHA
- git status
- changed files
- story fixes
- Annie identity implementation
- indoor-scope proof
- visual V2 summary
- static tests
- build
- local browser result
- public browser result
- screenshot count and warning count
- live URL
- remaining blockers

============================================================
19. FINAL ART / NARRATIVE TEST
============================================================

The opening must still feel like:
"A believable Taiwanese hospital on a tiring night shift."

By M5–M7 it should feel like:
"The same hospital has become a sealed institutional machine that remembers
an erased identity."

Annie should make the player think:
"That is a CPR mannequin wearing somebody else's medical identity."

Then the stethoscope reveals:
"Those things belonged to me."

And the ending answers:
"I was never 李醫師. I am 張守恆, MED-870409."

That is the V2.0 target.
