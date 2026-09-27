# DutyNight — Character Identity Visual Guide

Status: **APPROVED VISUAL DIRECTION / CANON LOCK**
Date: 2026-09-27

This guide translates the current Character Identity Pass into a stable visual production target.

> Important: the AI-generated presentation board shown during review is **concept art only**. Some labels and employee IDs rendered inside that image are not canonical. Do not copy text or IDs from the generated board into production. Canon values come only from `prototype/src/story/CharacterBible.js` and `prototype/src/story/NarrativeV22.js`.

## Goal

The player should remember people, not just employee IDs.

By the time the player reaches B2 and the final 316 identity reconstruction, the four doctors should feel like four distinct colleagues with recognizable habits, objects, speech patterns, and relationships.

## Canon core cast

| Character | Canon ID | Role | Visual anchor | Behavioral anchor |
|---|---|---|---|---|
| 張守恆 | MED-870409 | 第一線住院醫師 | 黑咖啡、舊聽診器、較鬆的白袍 | 先核對病人身分、床號與原始紀錄 |
| 李承禮 | MED-820316 | 夜間總醫師 | 腕錶、紅筆、整齊文件夾 | 看錶、改紀錄、制度與程序語言 |
| 周啟文 | MED-880217 | 第二線住院醫師 | 便條紙、底片相機、較鬆開的白袍 | 欲言又止、回頭、試圖把警告送出去 |
| 陳柏勳 | MED-890605 | 第二院區支援醫師 | 轉院文件、路線資料 | 邊走邊看文件、先讓流程繼續 |
| 林婉真 | NUR-900033 | 夜班護理師 | 綠病歷、計時錶 | 整理後再說、精準記床位與文件狀態 |
| 王世榮 | SEC-760117 | 夜間警衛／門禁管理 | B-Panel 紫牌鑰匙、保溫杯、值勤簿 | 先看規章、門禁與紀錄 |
| 謝玉琴 | ADM-851104 | 行政／文史檔案 | 老照片、索引卡、鉛筆 | 重新排序文件、注意缺頁與塗改 |
| 劉志遠 | ENG-860214 | 工務機電技師 | 工具箱、工務吊牌 | 急走、指設備、直接談工程危機 |

## Visual hierarchy

### 1. Archival portraits and memory frames
Do not render named people as identical circle-head / rectangle-body figures.

Named characters must differ in:
- head / hair silhouette
- height and build
- coat or workwear treatment
- pose
- prop
- gesture

Current implementation:
- `prototype/src/art/CharacterPortraitArt.js`
- `prototype/src/story/MemoryInstallations.js`
- `prototype/src/ui/UIManager.js`

### 2. 3F personnel archive
The 3F history/archive room contains:

**1998 夜班核心人員名錄｜4+3**

Each profile must include:
- name
- employee ID
- role
- introduction
- personality
- hobby
- signature line
- relationship note

This is world-building and identity reinforcement, not a highlighted answer sheet.

### 3. Memory Sequence staging
Memory Sequence should evolve from a text slideshow into a lightweight character vignette.

Target example — duty-room memory:
- 張守恆: black mug, looking down at a chart
- 周啟文: friendly shoulder tap / note
- 李承禮: slightly behind the group, checking his watch
- 陳柏勳: transfer folder already in hand, body angled as if about to leave

A single frame should communicate personality before the player reads the caption.

### 4. Identity matrix
B2 identity comparison should reinforce remembered character cues.

The player should think:
> “I know how these people behave. I am not them.”

Not:
> “Which row has the matching employee ID?”

## Character relationship thesis

### 張守恆 vs 李承禮
Fact / patient identity vs institutional order.

### 張守恆 and 周啟文
The closest peer relationship; the undelivered warning should feel personal.

### 張守恆 vs 陳柏勳
Not hero vs villain. It is:
- confirm first
vs
- keep care/workflow moving first

### 林婉真
Clinical reality anchor. Her certainty about ward state and paperwork gives later contradictions weight.

### 王世榮
Access-control memory and institutional boundary.

### 謝玉琴
Document provenance and institutional memory.

### 劉志遠
Engineering reality and the earliest direct warning about B-Panel / smoke-control failure.

## Repetition rule

Each major character should be reinforced at least three times with the same visual/behavioral grammar.

Example — 張守恆:
1. archive/memory: black mug + record-check posture
2. ER memory: refuses to create a new chart before identity is checked
3. 6F / late identity chain: engraved stethoscope + MED-870409

Do not invent a new signature object every scene.

## UI / visual tone

Character presentation should remain consistent with DutyNight:
- late-1990s hospital documentation
- sepia archival photos
- green-gray CCTV
- restrained film grain
- no flashy character-card UI during normal gameplay
- no anime / gacha visual treatment
- no modern social-media profile aesthetic

## Performance rule

Do not solve character readability by adding eight large human GLBs at once.

Current preferred order:
1. procedural archive portrait
2. repeated props / poses / dialogue
3. 2.5D or in-engine memory staging
4. only later consider selective hero human models if profiling allows

## Acceptance test

Before B2, a player should be able to answer most of these without reading employee IDs:

- Who always checks identity first? → 張守恆
- Who checks the time and trusts procedure? → 李承禮
- Who keeps trying to deliver a warning? → 周啟文
- Who prioritizes keeping the transfer/workflow moving? → 陳柏勳
- Who remembers ward/document details? → 林婉真
- Who controls the B-Panel key? → 王世榮
- Who manages old files/photos? → 謝玉琴
- Who carries the engineering warning? → 劉志遠

Target: **5–6 or more correct before final identity reconstruction.**

## Generated concept-board handling

The review board is useful for:
- composition
- tone
- archival-photo direction
- visual differentiation
- memory vignette layout
- 3F personnel archive layout
- B2 identity UI layout

It is **not** a text/canon source.

Before committing any generated board image as final art:
1. replace all rendered names/IDs with canon values above
2. verify every role
3. remove any invented dates or wording
4. mark it as concept/reference art, not an in-game screenshot
