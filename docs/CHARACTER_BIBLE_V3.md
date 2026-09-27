# DutyNight — CHARACTER BIBLE V3

Status: **ACTIVE CHARACTER IDENTITY CONTRACT**

This document governs the recurring visual, verbal, prop, and relationship identity of the core 1998 cast.
Story chronology remains in `prototype/src/story/NarrativeV22.js`.
Runtime-facing character traits live in `prototype/src/story/CharacterBible.js`.

## Design goal

Players should recognize major characters without relying on employee IDs.

Every core character must carry the same five identity channels across archive photos, memory frames, CCTV, props, dialogue, and late-game identity reconstruction:

1. **Silhouette**
2. **Signature prop**
3. **Signature gesture**
4. **Speech rhythm / repeated phrase**
5. **Relationship to 張守恆**

The mystery should resolve as: **“I know who these people are, therefore I know who I am.”**
It should not degrade into reading four employee IDs and choosing the only non-contradictory row.

---

## 張守恆 — MED-870409

**Role:** 第一線住院醫師  
**Age in 1998:** 29

- Visual: younger, slim, slightly loose white coat, dark mug, old stethoscope clue.
- Gesture: lowers his gaze to the record before answering; checks names/bed numbers twice.
- Speech: short, factual, cautious.
- Signature line: **「先確認他是誰。」**
- Personality: quiet, observant, stubbornly careful around patient safety.
- Hobby: black coffee, old charts and medical books.
- Core conflict: fact/patient identity before institutional convenience.
- Relationship: closest to 周啟文; increasingly conflicts with 李承禮’s procedural certainty.

## 李承禮 — MED-820316

**Role:** 夜間總醫師  
**Age in 1998:** 41

- Visual: structured coat, dark tie/underlayer, wristwatch, red pen, orderly folder.
- Gesture: checks his watch, edits records, stands slightly behind the group.
- Speech: complete, calm, institutional language.
- Signature line: **「先照程序做。」**
- Personality: decisive, authoritative, control-oriented.
- Hobby: Go, fountain pens, organizing records.
- Core conflict: institutional order and record consistency before individual intuition.
- Relationship: Zhang’s superior and ideological counterweight.

## 周啟文 — MED-880217

**Role:** 第二線住院醫師  
**Age in 1998:** 31

- Visual: taller, coat slightly open, note paper / camera.
- Gesture: half-turns back, hesitates before speaking, leaves notes.
- Speech: warmer, more conversational, often begins with a pause.
- Signature line: **「守恆，等一下。」**
- Personality: empathetic, cautious, conflict-averse at the worst moment.
- Hobby: film photography, radio.
- Core conflict: knows something is wrong but does not deliver the warning in time.
- Relationship: Zhang’s closest colleague/friend.

## 陳柏勳 — MED-890605

**Role:** 第二院區支援醫師  
**Age in 1998:** 34

- Visual: transfer folder, route/map material, moving posture.
- Gesture: reads while walking; rarely settles in one spot.
- Speech: fast, work-oriented.
- Signature line: **「病人先處理，資料等等補。」**
- Personality: pragmatic, efficient, emotionally restrained.
- Hobby: cycling, maps/routes.
- Core conflict: workflow continuity before certainty.
- Relationship: not Zhang’s enemy; represents a different clinical priority.

## 林婉真 — NUR-900033

**Role:** 夜班護理師  
**Age in 1998:** 33

- Visual: green chart, timer, orderly nursing work surfaces.
- Gesture: organizes before speaking, remembers exact bed and document state.
- Speech: concise, grounded, human.
- Signature line: **「這張不是我印的。」**
- Personality: patient, meticulous, direct about safety.
- Hobby: plants, knitting.
- Story function: clinical reality anchor. If Lin says a document is wrong, the player should trust that observation.

## 王世榮 — SEC-760117

**Role:** 夜間警衛／門禁管理  
**Age in 1998:** 48

- Visual: purple B-Panel key tag, thermos, guard ledger.
- Gesture: sits squarely, points to written rules, checks logs.
- Speech: slow, rule-based.
- Signature line: **「沒有書面批示，我不能交鑰匙。」**
- Personality: conservative, rule-bound, excellent memory for who passed a checkpoint.
- Hobby: radio repair, tea.
- Story function: human access-control log.

## 謝玉琴 — ADM-851104

**Role:** 行政／文史檔案  
**Age in 1998:** 38

- Visual: old photographs, index cards, pencil.
- Gesture: reorders files and notices missing/altered pages.
- Speech: precise and contextual.
- Signature line: **「這一頁不是漏印，是被改過。」**
- Personality: meticulous, curious, strong memory for document provenance.
- Hobby: local history, old photographs, clipping archives.
- Story function: preserves traces that the institution tried to erase.

## 劉志遠 — ENG-860214

**Role:** 工務機電技師  
**Age in 1998:** 36

- Visual: toolbox, maintenance tag, practical work clothes, soot/grease traces.
- Gesture: moves quickly, points at equipment, uses tools while speaking.
- Speech: urgent, fragmented, direct.
- Signature line: **「不要拉三個，先看紫色備援。」**
- Personality: practical and impatient with bureaucracy during equipment failure.
- Hobby: motorcycle repair, old tools.
- Story function: earliest direct witness to the smoke-exhaust / B-Panel engineering crisis.

---

## Visual repetition rule

A character should be reinforced at least three times using the same identity grammar.

Example — 張守恆:

1. Archive/memory: black mug + record-check posture.
2. ER memory: stops a new chart from being created until identity is checked.
3. 6F / final identity chain: engraved stethoscope + MED-870409 resolution.

Do not invent a completely new visual signature for each scene.

## Dialogue rule

Character personality should be expressed by what they say, not only by narrator description.

Avoid:
> 李承禮很重視制度。

Prefer recurring language:
> 「先照程序做。」

Avoid making every character speak with the same polished exposition voice.

## Archive / CCTV rule

The procedural archival renderer must use character-specific silhouettes, wardrobe, props and gestures.
Generic identical circle-head / rectangle-body figures are not acceptable for named core characters.

## Performance rule

This pass is deliberately procedural and lightweight:

- no eight-person hero GLB package
- no new blocking texture set
- no new global preload
- no facial animation dependency

Hero human GLBs may be considered later, but they are not required for this character identity pass.

## QA

Before shipping:

- All four doctors must have different signature props, gestures and quotes.
- 4+3 personnel archive must contain identity, introduction, personality and hobby.
- Named people in memory frames must render different silhouettes.
- B2 identity candidate UI must reinforce remembered character cues.
- Existing Annie identity remains separate and unchanged.
- Existing M1–M9 chronology and puzzle answers remain unchanged.
