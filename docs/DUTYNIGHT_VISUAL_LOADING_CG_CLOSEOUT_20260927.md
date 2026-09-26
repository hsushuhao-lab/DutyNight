> Release scope: preserve the completed M1–M9, Bed 33, hidden 6F, B2, Annie and second-campus story. Historical ACT1_MASTER_SPEC is not the current feature inventory. This document governs the visual/loading/cinematic closeout together with DN_V2_REMAINING_GAPS_CLOSEOUT_01.md.

# DUTYNIGHT — VISUAL RESTORATION + NIGHT HORROR ART PASS 1 + CINEMATIC SYSTEM + PERFORMANCE + DEPLOY

Repository:
https://github.com/hsushuhao-lab/DutyNight

Default branch:
master

Public GitHub Pages:
https://hsushuhao-lab.github.io/DutyNight/

MODE:
GOAL-DRIVEN IMPLEMENTATION

ROLE:
你不是只寫計畫或報告。
你必須：
AUDIT → IMPLEMENT → TEST → VISUAL QA → PERFORMANCE QA → BUILD → DEPLOY → PUBLIC QA。

不要停在「我建議」。
只要沒有真正 blocker，就持續修到 acceptance criteria 全部成立。

============================================================
/GOAL
============================================================

將目前 DutyNight 提升成具有完整材質、可信醫院空間、後期逐步恐怖化、
且具高品質短型 cinematic presentation 的可線上遊玩版本。

本任務包含四個不可拆開的主要目標：

GOAL A — RESTORE VISUAL CORRECTNESS
修復目前各樓層大幅退化成 flat-color / blockout 的 regression。

GOAL B — FIX ZONE-BASED LOADING
修復離開 3F 後跨樓層長時間卡在電梯／transition 的 loading regression，
但不得以降低材質、美術品質或延長 loading screen 解決。

GOAL C — NIGHT HORROR ART PASS 1
重製後期夜間美術，特別是 Skybridge 回程與窗外景色，
讓質感靠近 grounded Taiwanese/Asian psychological horror：
深黑、青綠冷光、局部暖光、潮濕老舊表面、霧、玻璃反射、
強烈暗部層次，而不是單純套綠色 filter。

GOAL D — CINEMATIC SYSTEM
將以下關鍵劇情節點製作成短型 in-engine CG / micro-cutscene，
取代或弱化純文字／選項所造成的節奏中斷：

1. 21:17 值班室啟動
2. 00:33 幽靈掛號
3. 第一次 409／第 33 床異常
4. 天橋回程白袍
5. B2 永久關閉
6. 409 PATIENTIZATION
7. 316 TRUE NAME finale
8. 電梯門異常 micro-CG

IMPORTANT:
生態池 Annie 劇情已從正式劇本移除。

DO NOT:
- 不要加入 Annie 生態池事件。
- 不要重新建立 Pond Annie reflection cutscene。
- 不要因為舊 code / test 尚有 Annie reference 就恢復該劇情。
- 如果仍有 obsolete Annie pond logic，先列出，再依目前正式劇本確認是否安全停用；
  不要順手刪除無關 code。

成功條件不是「程式碼寫完」。
成功條件是：
PUBLIC GitHub Pages 上可以實際玩到新的畫面與 CG，
並且材質、loading、story regression、visual QA 全部通過。

RELEASE STATUS HARD GATE:
只有同一個 release application SHA 同時通過 M1–M9 browser playthrough、
WebGL material runtime audit、cold/warm loading audit、before/after visual review，
且 public Pages 的 build fingerprint 與該 SHA 一致、public M1–M9 與視覺檢視通過，
狀態才能標記為 `DEPLOYED_AND_VISUALLY_VERIFIED`。
Build、push、GitHub Actions deploy success 只證明建置／部署完成，不能單獨滿足此狀態。
任一證據尚缺或對不上 SHA 時，狀態必須保持 `IN_PROGRESS` 或回報具體 blocker。

============================================================
0. NON-NEGOTIABLE PRIORITY
============================================================

嚴格依照：

1. RESTORE VISUAL CORRECTNESS
2. VERIFY MATERIALS IN REAL WEBGL SCENE
3. FIX LOADING ARCHITECTURE
4. VERIFY NO GAMEPLAY REGRESSION
5. NIGHT HORROR ART PASS
6. CINEMATIC IMPLEMENTATION
7. COMPLETE QA
8. DEPLOY
9. PUBLIC QA

不得先用恐怖光影掩蓋 material regression。

如果：
牆、地板、木紋、門、terrazzo、PBR 都還沒恢復，

則：
Night Horror Art Pass 不算完成。

============================================================
1. FIRST — AUDIT CURRENT MASTER
============================================================

開始前：

git status
git branch --show-current
git rev-parse HEAD
git log -n 20 --oneline --decorate

記錄：

STARTING_MASTER_SHA=<sha>

確認 working tree。

若存在未提交 work：
不要覆寫。
先判斷內容與本任務的關係。

檢查目前 master 是否已經完整解決：
- material regression
- zone loading regression

如果尚未解決：

優先使用／建立：

fix/restore-visuals-zone-loading

在此 branch 完成 Visual + Loading restoration。

如果 master 已經通過後述完整 visual/material/loading acceptance：
則建立：

feat/night-horror-art-cinematics

不要重複修已解決問題。

最後只在所有 acceptance criteria 通過後 merge 到 master。

============================================================
2. FIND VISUAL-GOOD BASELINE
============================================================

不要假設目前 MaterialRegistry 是正確版本。

執行：

git log --oneline --all
git log -- prototype/src/art
git log -- prototype/src/world/shared/GeometryFactory.js
git log -- prototype/src/world/Level3FBlockout.js
git log -- prototype/src/world/shared/WardFloorplan.js
git log -- prototype/src/world/zones
git log -- prototype/src/main.js

找 loading optimization / staged-loading 改動之前，
最後一個同時符合以下視覺條件的 commit：

- 3F 牆面／地板有清楚 surface
- 4F 病房材質正常
- door wood grain 可見
- terrazzo 可見
- Second Campus 有材質
- 6F / B2 不是素色 blockout

設定：

VISUAL_GOOD_SHA=<sha>

比較：

git diff $VISUAL_GOOD_SHA..master -- \
  prototype/src/art \
  prototype/src/world/shared/GeometryFactory.js \
  prototype/src/world/Level3FBlockout.js \
  prototype/src/world/shared/WardFloorplan.js \
  prototype/src/world/zones \
  prototype/src/main.js \
  prototype/src/ui/UIManager.js

DO NOT whole-repository revert.

只 selective restore：
- material definitions
- texture mapping
- visual dressing
- material assignment
- scene construction
- lighting/art code when necessary

必須保留目前 gameplay changes：

- M1–M9 current story
- 316 early-template loop fix
- B2 one-way exit
- B2 fail-forward
- flexible B2 / 316 identity verification
- Second Campus current chest event
- 6F clinical-skills-center
- current True Name logic
- current Patientization logic

============================================================
3. MATERIAL / PBR RESTORATION
============================================================

Audit：

prototype/public/assets/textures/

至少：

Plastic010
Terrazzo001
Wood051
Ground037
Asphalt033

channels：

Color
NormalGL
Roughness

Color:
THREE.SRGBColorSpace

Normal / Roughness:
THREE.NoColorSpace

RepeatWrapping:
wrapS / wrapT

Restore actual surface usage。

禁止正式版本存在：

material.map = null

來模擬「乾淨牆面」。

尤其 audit：

prototype/src/art/MaterialRegistry.js
prototype/src/art/ArtResources.js
prototype/src/art/ArtDetails.js
prototype/src/world/shared/GeometryFactory.js
prototype/src/world/Level3FBlockout.js
prototype/src/world/shared/WardFloorplan.js

============================================================
4. FIX ASYNC MATERIAL CLONE REGRESSION
============================================================

特別檢查：

base material
→ materialForSurface()
→ cloned material
→ texture async loading

確認沒有：

scene 建立
→ clone 還沒有 texture
→ texture preload 完成
→ base 有 map
→ scene 中 clone 永遠還是 flat

MaterialRegistry 應維護所有 registered surface instances。

如果現況會產生 stale clones，
建立最小必要機制，例如：

refreshAllSurfaceMaterials()

與：

refreshSceneMaterials(root)

texture ready 後：
所有已建立 material clones 必須重新拿到：

map
normalMap
roughnessMap

並：

material.needsUpdate = true

不要為不存在的 case 過度抽象化。

============================================================
5. SHARED ASSET DISPOSAL AUDIT
============================================================

audit：

prototype/src/art/ArtResources.js

任何：

userData.sharedAsset === true

都不得被 zone cleanup dispose。

特別避免：

3F
→ cleanup
→ shared PBR dispose
→ 4F / 2F / return 3F 變 flat

Regression：

3F
→ 4F
→ 2F
→ 3F

每次 material maps 都還存在。

============================================================
6. RUNTIME MATERIAL AUDIT
============================================================

建立：

window.__materialAudit()

輸出主要 material：

{
  materialName,
  meshCount,
  hasMap,
  hasNormalMap,
  hasRoughnessMap,
  mapImageWidth,
  mapImageHeight,
  repeatX,
  repeatY,
  colorSpace
}

至少：

wall
wallDark
floor
floorTile
floorWood
doorWood
ceiling
handrail
terrainGrass
pathGravel

若 file 有下載但 material.map === null：
FAIL。

若 material 有 texture，
但真正 visible mesh 使用的是 flat fallback：
FAIL。

============================================================
7. REAL SCENE MATERIAL QA
============================================================

不要把「texture request 成功」當完成。

實際：

scene.traverse(...)

逐 zone 計算：

texturedMeshCount
flatMeshCount
pbrMeshCount

zones：

3F
4F
2F ER
1F
8F
Skybridge
Second Campus 2F
Second Campus 5F
Phantom 6F
B2

主要 surface：

wall
floor
door
wood furniture
ward floor

必須確認 visible production mesh 的：
map
normalMap
roughnessMap

============================================================
8. LOADING ARCHITECTURE REBUILD
============================================================

禁止 destination transition 再做：

await preloadAssets()
await preloadMaterials()

整包 hospital preload。

建立：

ZONE ASSET MANIFEST

例如：

zoneAssetManifest = {
  first_campus_3f: {
    essential: [...],
    optional: [...]
  },
  first_campus_4f: {...},
  first_campus_2f: {...},
  first_campus_1f: {...},
  first_campus_8f: {...},
  skybridge: {...},
  second_campus_2f: {...},
  second_campus_5f: {...},
  phantom_6f: {...},
  b2_archive: {...}
}

ESSENTIAL：
缺少就不能正常呈現場景／劇情。

包含：
- core PBR surfaces
- story prop
- required doors
- bed / workstation required for zone
- required cinematic target

OPTIONAL：
稍後 load 不影響進入：
- distant trees
- minor vegetation
- decorative clutter
- distant backdrop
- noncritical props

transition：

await preloadZoneEssential(destination)

然後：

loadZone()

之後：

void preloadZoneOptional(destination)

============================================================
9. REMOVE FULL-WORLD FIRST-PAINT PRELOAD
============================================================

不要：

deferredHospitalAssets()
→ preloadAssets()
→ preloadMaterials()
→ preloadCampusBackdropAssets()

在 3F 開始遊玩後立刻搶整個 world bandwidth。

Asset priority：

P0 current-zone essential
P1 immediate-next-story-zone essential
P2 likely-next-zone essential
P3 decoration
P4 large outdoor assets

最大 concurrent groups：
2–3

不要建立大型複雜 scheduler，
如果簡單 queue 已足夠。

============================================================
10. STORY-AWARE PREFETCH
============================================================

正常流程提前準備下一區。

3F：
只先確保 3F。

接近 316 / handoff progress：
prefetch first_campus_4f essential。

4F duty：
prefetch first_campus_2f essential。

ER phone：
2F → P0。

ER-0217 / second-campus setup：
prefetch second-campus transit + required 5F essential。

Second Campus chest event resolved：
prefetch:
- second_campus_2f
- skybridge

Skybridge progression：
prefetch later anomaly zone only when story requires。

6F progression：
prefetch:
- first_campus_1f
- B2 essentials

============================================================
11. CAMPUS TREE PERFORMANCE RULE
============================================================

prototype/public/assets/models/campusTree.glb
約 16 MB。

不得阻塞：

3F
4F
2F ER
6F
B2
一般 indoor transition

Skybridge window view 也不得因為 distant trees 阻塞。

如果背景 vegetation 尚未 ready：

先顯示 lightweight distant landscape。

大型 tree：
background load。

============================================================
12. NIGHT HORROR ART DIRECTION
============================================================

Reference visual thesis：

Grounded East-Asian / Taiwanese psychological horror。

核心畫面：

- deep charcoal / near-black shadows
- desaturated dark teal / green ambient cast
- sparse warm amber practical lights
- fluorescent hospital lighting
- dirty / aged but still functioning hospital surfaces
- humid air
- mild fog / atmospheric perspective
- dirty window reflections
- isolated pools of light
- large areas of darkness
- physically believable materials
- strong depth
- cinematic contrast

IMPORTANT:

不要：
- 全畫面加 uniform green overlay
- Act 1 一開始就變 haunted asylum
- cyberpunk lighting
- excessive bloom
- excessive chromatic aberration
- excessive film grain
- jump-scare lighting every 10 seconds

Horror must arise from:
normality → inconsistency → spatial contradiction → identity violation。

============================================================
13. ACT 1 MUST REMAIN NORMAL
============================================================

Act 1：
3F / early 4F normal duty 必須保持：

- believable Taiwanese hospital
- warm-neutral
- lived-in
- humane psychiatric setting
- normal clinical workflow

Night Horror grading 不得向前污染 Act 1。

Normal scene 和 horror scene 必須有明顯 contrast。

============================================================
14. SKYBRIDGE — NIGHT HORROR ART PASS 1
============================================================

Primary target：

prototype/src/world/zones/Skybridge.js
prototype/src/art/VisualProfile.js
prototype/src/art/CampusBackdrop.js
prototype/src/art/LandscapeArt.js

不要重建 traversal geometry。

保留：
- 60m bridge
- current portals
- collision
- current lookback gameplay
- current story flags

新增 two-mode visual state：

NORMAL_CROSSING
RETURN_HORROR

可再依 progression 分：

RETURN_HORROR_STAGE_1
RETURN_HORROR_STAGE_2
RETURN_HORROR_STAGE_3

------------------------------------------------------------
14A. OUTBOUND CROSSING
------------------------------------------------------------

去程仍是合理醫院天橋：

- cool-white fluorescent
- lamps straight
- readable corridor
- windows show normal late-night campus
- stars visible after deep night
- no exaggerated fog
- no broken environment yet

------------------------------------------------------------
14B. RETURN CROSSING
------------------------------------------------------------

回程啟動後：

燈具逐漸：

- tilted
- uneven
- partially hanging
- damaged
- some off
- some unstable

Rotation 建議範圍：

rotationZ approx ±0.08–0.24 rad
rotationY subtle approx ±0.04–0.12 rad

不要所有燈同角度。

使用 deterministic authored values，
不要每次 random 導致 visual QA 不可重現。

------------------------------------------------------------
14C. FLICKER
------------------------------------------------------------

不是 disco。

可使用 pattern：

steady
→ short blackout
→ weak glow
→ steady
→ long blackout
→ one hard flicker

每盞不同 phase。

優先：
3–4 盞異常，
不是整條橋所有燈同時閃。

對 photosensitive safety：
避免高頻快速閃爍。

------------------------------------------------------------
14D. LIGHT POOLS
------------------------------------------------------------

重點不是「整條變暗」，
而是建立一段一段 light pools。

玩家：

亮區
→ 暗區
→ 一盞異常 fluorescent
→ 暗區
→ 遠處 silhouette

return states：
隨 progression 降低 active light coverage。

Cool horror fluorescent：
desaturated pale green-white。

少量 warm amber practical：
做色溫對比。

------------------------------------------------------------
14E. FOG
------------------------------------------------------------

只在 late horror state 使用。

可採：

THREE.FogExp2

低密度 approximately：
0.008–0.014

視實際 screenshot 微調。

目的：
不是蓋住畫面，
是讓遠方人物逐漸吞入暗處。

------------------------------------------------------------
14F. WINDOWS
------------------------------------------------------------

加入 subtle：

- smudges / grime impression
- dirty reflections
- interior-light reflection
- faint environmental reflection

不要過度 mirror-like。

============================================================
15. SKY / STARFIELD
============================================================

CampusBackdrop 新增 lightweight procedural starfield。

Prefer：
THREE.Points

約數百個 deterministic stars 即可。

要求：
- different sizes / brightness
- sparse
- natural night sky
- no fantasy Milky Way wallpaper

DEEP_NIGHT：
stars visible。

PRE_DAWN：
stars fade。

不要增加大型 sky texture。

============================================================
16. DISTANT HILLSIDE + ECOLOGY POND
============================================================

IMPORTANT：

生態池場景仍可作為「環境地景」使用，
但 Annie 劇情已刪除。

可以：
- distant pond
- boardwalk silhouette
- hill
- trees
- pathway lamps

不可以：
- Annie
- Annie reflection
- Annie event
- Annie cutscene

不要把完整：
HillsideRoute
EcologyPond
Reflector
colliders
interactables

複製進 Skybridge。

在 LandscapeArt.js 建立輕量 distant variant，例如：

buildSkybridgeNightLandscape()
或
buildDistantNightLandscape()

重用：
- hillside height logic
- pond footprint
- boardwalk footprint
- vegetation distribution concept

但：

NO walkable
NO collider
NO gameplay trigger
NO second Reflector
NO full vegetation density
NO required campusTree blocking

遠景池水：

dark desaturated green-black surface
+ subtle moon / campus light glint。

============================================================
17. CINEMATIC SYSTEM — ARCHITECTURE
============================================================

不要每一幕各寫一套 duplicated camera lock logic。

建立一個最小共用 in-engine cinematic helper。

例如：

CinematicDirector.js

只需要支援本任務確定需要的能力：

play({
  id,
  duration,
  cameraKeyframes,
  actions,
  audio,
  onComplete
})

需要能力：

- temporarily disable FPS control
- preserve / restore camera state
- interpolate position when necessary
- interpolate yaw / pitch
- sequence light changes
- toggle actor visibility
- trigger simple actor transform
- sound cue
- subtitle / text only where needed
- restore player control safely
- prevent duplicate triggering
- respect game state flags

不要建立過度泛化 timeline engine。

============================================================
18. CINEMATIC DESIGN RULES
============================================================

CG 優先使用：

IN-ENGINE CUTSCENES

而不是 mp4 預渲染影片。

原因：
- reuse current world
- reuse lighting
- small download
- easy iteration
- consistent player position
- easier QA

一般 micro-CG：
1.5–4 sec。

重大：
409 Patientization / 316 Finale
可以 5–8 sec。

每個 cinematic 都應：

1. 有明確 trigger。
2. 最多只播一次，除非劇情設計要求 replay。
3. 結束後一定恢復 player control。
4. 不把玩家卡死。
5. skip 機制如現有 UI 架構適合則可加入；
   但不要為 1–2 秒 micro-CG 製作複雜 skip UI。
6. 不應因 optional audio / visual asset load 失敗永久 pending。

============================================================
19. CG 01 — 21:17 DUTY ROOM ACTIVATION
============================================================

GOAL：
解決 21:17 後玩家回到值班室「沒有事情推著走」的空窗，
同時明確宣告故事從普通值班進入真正異常。

Trigger：
正式故事抵達 21:17，
玩家回到／已位於 duty room。

演出：

1. 房內恢復安靜。
2. 短暫 0.4–0.8 sec 沒有 UI 指令。
3. 電話突然響。
4. camera attention 輕微被拉向電話。
5. 接聽／電話 audio：
   不需要過度解釋。
6. 通話後出現 distant wall knocking / corridor noise。
7. duty-room practical light subtle flicker 一次。
8. 門外 corridor 一盞燈熄掉或降低。
9. 結束 CG。
10. 新 objective 自然出現。

不要讓玩家靠選項決定「要不要開始劇情」。

CG length：
約 3–5 sec，
不含玩家自行接電話的互動時間。

SUCCESS：
21:17 後永遠有明確下一步，
不會讓玩家回值班室 idle 無事可做。

============================================================
20. CG 02 — 00:33 GHOST REGISTRATION
============================================================

GOAL：
把 00:33 幽靈掛號做成環境系統自己開始工作的 supernatural event。

Trigger：
current M3/M? story logic 正確時點。

演出：

1. 數位時間到 00:33。
2. 遠處 unused workstation screen 自動亮起。
3. camera micro-pan / rack attention 到 workstation。
4. registration UI fields 自行出現。
5. printer 自動動作／出紙聲。
6. optional：
   遠處 empty wheelchair / shadow 只能非常 subtle，
   不要增加新的 monster。
7. system beep / fluorescent hum。
8. control return。

不要：
跳出「查看／忽略」選項來破壞氣氛。

保留現有 story state / quest progression。

============================================================
21. CG 03 — FIRST 409 / BED 33 ANOMALY
============================================================

GOAL：
第一次讓玩家明確意識到：
「第 33 床」與空間／資料存在 contradiction。

IMPORTANT：
Act 1 正常交班資料仍不得提前暴雷 Bed 33。

只有當正式劇情進入該異常 milestone 時才能出現。

演出：

1. 玩家看到一個正常病室／床位 identification。
2. fluorescent short flicker。
3. identification 短暫變成：
   33 / 409 相關矛盾提示。
4. 可以使用：
   bed plaque
   HIS field
   room-board
   corridor sign
   中的一個，
   不要全部同時砸給玩家。
5. 第二次 light change 後，
   部分資訊恢復正常或留下 ambiguity。
6. ambient low-frequency sound / distant knock。
7. player control returns。

Duration：
約 2–3 sec。

============================================================
22. CG 04 — SKYBRIDGE RETURN WHITE COAT
============================================================

THIS IS A HERO CINEMATIC。

Trigger：
Second Campus relevant story completion，
玩家正式踏上 return crossing。

NOT outbound。

演出建議：

Phase A：
玩家沿橋回程。

Phase B：
前方/旁邊一盞 fluorescent flicker。

Phase C：
control lock approximately 2–3 sec。

camera 緩慢偏向後方，
不要一開始直接 180° snap。

Phase D：
遠端 dark light pool 中：
white-coated figure / Doppelgänger silhouette。

保持距離，
不要直接照亮臉。

Phase E：
lamp flicker / blackout。

Phase F：
燈恢復後：
figure slightly closer 或暫時消失，
依目前 bridge lookback logic 兼容。

Phase G：
restore control。

IMPORTANT：
現有：
lookbackCount
M5 bridge states
BRIDGE_OVERRIDE_PENDING
等 gameplay contract 必須保留。

Cinematic 是 presentation，
不是重寫 story state machine。

============================================================
23. CG 05 — B2 PERMANENT CLOSURE
============================================================

Trigger：
玩家正式穿過 B2 one-way exit。

必須與目前：
B2 one-way
B2 fail-forward
316 deferred identity reconstruction
完全兼容。

演出：

1. 玩家越過 irreversible threshold。
2. 控制短暫鎖住。
3. camera slight look-back。
4. B2 深處燈光從遠到近依序熄滅。
5. heavy door / lock closes。
6. reader turns red / locked。
7. mechanical lock sound。
8. 簡短 UI：
   B2 已永久鎖閉。
9. objective 根據目前 fail-forward state：
   指向 316 identity reconstruction / appropriate next objective。
10. restore control。

不要重新加入 B2 stairs。

============================================================
24. CG 06 — 409 PATIENTIZATION
============================================================

THIS IS THE SIGNATURE FAILURE CINEMATIC。

當玩家重演歷史錯誤，
不要一般 death screen。

使用目前正式：

409 PATIENTIZATION

演出 pipeline：

1. normal first-person view。
2. sudden horizontal V-Hold / sync tear effect。
3. heartbeat impact。
4. camera drops。
5. very short blackout。
6. image returns：
   camera locked in supine perspective。
7. 玩家發現自己躺在 409 bed。
8. restrained hands / implication of restraints。
9. overhead aged fluorescent hum。
10. environmental variation depending on loop count if inexpensive。
11. transition into existing loop/reset system。

建議：

第一次：
doorway shadow。

第二次：
chair appears closer。

第三次以後：
environment difference only if stable / low-risk。

不要新增 gameplay dependency。

Duration：
5–8 sec。

必須驗證：
- cutscene ends
- loop reset completes
- texture remains
- no stuck pointer-lock
- no duplicate reset

============================================================
25. CG 07 — 316 TRUE NAME FINALE
============================================================

THIS IS THE PRIMARY IDENTITY CLIMAX。

不要只變成 form input。

保留：
TRUE NAME:
張守恆

Employee ID:
MED-870409

但正式輸入前加入 cinematic：

1. 316 terminal starts identity conflict / overwrite.
2. screen glitches among incorrect institutional template identities.
3. environment audio attenuates。
4. camera / lighting successively directs attention to previously discovered identity evidence：
   - surname 張
   - old MED-87xxxx terminal clue
   - 「守」
   - stethoscope「守恆」
   - 870409 accident document
5. 不要重新要求玩家收齊所有 clue 才能通關；
   現有 flexible identity / fail-forward 規則保留。
6. terminal settles：
   NAME: _______
   ID: _______
7. restore player input。
8. 玩家完成 identity。
9. successful resolution 有短 confirmation cinematic：
   room stabilizes / fluorescent returns / conflicting identity artifacts stop。
10. continue current ending。

Duration：
pre-input 4–6 sec。

不要把答案直接以巨大 UI 提示給玩家，
但如果玩家已經取得 evidence，
可透過 environment recap 幫助 recall。

============================================================
26. CG 08 — ELEVATOR DOOR MICRO-CINEMATIC
============================================================

GOAL：
用低成本 micro-CG 做 Phantom 6F foreshadowing，
同時不要妨礙正常 elevator loading。

IMPORTANT：
這不是每次搭電梯都播。

只在指定 story point 一次性發生。

Suggested sequence：

1. player selects legitimate floor。
2. elevator doors close。
3. normal floor indicator movement。
4. indicator unexpectedly passes / stops at 6。
5. door opens only a narrow gap。
6. outside：
   dim clinical-skills-center corridor / darkness，
   不要先完整揭露 6F。
7. one fluorescent tube flickers。
8. door closes by itself。
9. elevator continues to actual destination。

Duration：
約 2–4 sec。

CRITICAL：
這段動畫同時可以遮罩 essential asset prefetch，
但：

cinematic duration 不是 loading timeout。

如果 destination essential 尚未 ready：
依 loading rule 處理。

不要讓 cinematic finish 後永久卡住。

============================================================
27. REMOVED CONTENT — ECOLOGY POND ANNIE
============================================================

正式劇本已移除 Ecology Pond Annie。

因此：

- 不製作 Annie pond cinematic。
- 不製作 Annie pond reflection。
- 不因為 Night Art Pass 使用 pond scenery 就恢復 Annie。
- pond 只能作為 landscape / atmospheric location。
- 如果 current EcologyPond.js 有 obsolete doppelgänger / Annie-like reflection logic：
  先在 audit report 列出。
  若明確屬於已取消內容，依目前 story tests 最小化停用；
  不要牽動其他 unrelated Annie usage。

============================================================
28. AUDIO DIRECTION
============================================================

CG 優先使用現有 SoundManager / audio infrastructure。

音效類型：

- fluorescent electric buzz
- relay click
- phone ring
- printer
- distant knock
- door lock
- soft hospital PA/static if already available
- low room tone
- heartbeat only major events

不要：
- generic loud horror sting every event
- copyrighted audio
- giant download audio library

============================================================
29. POST PROCESSING
============================================================

目前先靠：

- lighting
- fog
- PBR
- environmental composition
- window reflection
- exposure

取得大多數畫面效果。

不要第一輪就引入大量：

- bloom
- chromatic aberration
- VHS filter
- noise shaders
- SSAO stack

若 Patientization 需要 V-Hold：
只做 isolated temporary effect，
不要全遊戲常駐。

============================================================
30. VISUAL QA — BEFORE / AFTER
============================================================

先 capture baseline。

1440 × 900。

恢復材質需要：

1. 3F corridor
2. 316 office
3. 3F administration
4. 4F corridor
5. 4F nursing station
6. 4F duty room
7. 2F ER
8. Second Campus 5F
9. Phantom 6F
10. B2

Night Horror additionally：

11. Skybridge outbound start
12. Skybridge outbound midpoint
13. Skybridge return Stage 1
14. Skybridge return white-coat cinematic framing
15. Skybridge return Stage 2
16. Skybridge Stage 3
17. Window: stars + hill + pond
18. B2 closure cinematic
19. 00:33 registration
20. 409 Patientization
21. 316 True Name finale
22. elevator 6F anomaly

Use fixed:
camera pose
FOV
story state
resolution

寫明：
BEFORE
AFTER

============================================================
31. CINEMATIC QA
============================================================

新增必要 tests。

不要只 test function exists。

至少驗證：

A. CINEMATIC DIRECTOR
- lock controls
- trigger exactly once
- finish
- restore controls

B. 21:17
- event trigger
- objective appears afterward

C. 00:33
- registration cinematic triggered only at correct state

D. Bed 33
- absent in normal Act 1
- anomaly appears only at correct milestone

E. Skybridge
- outbound no horror cinematic
- return white coat only after correct story state
- existing lookback logic remains PASS

F. B2
- exit still one-way
- CG doesn't reopen B2
- fail-forward objective correct

G. Patientization
- animation ends
- loop reset happens exactly once

H. True Name
- cinematic does not make clue collection mandatory
- flexible identity route still PASS

I. Elevator anomaly
- triggers once
- does not change requested destination
- no infinite travel state

============================================================
32. EXISTING REGRESSION SUITE
============================================================

Run all relevant existing tests including at least:

test_v2_bridge_lookback_qa.js
test_m3_m9_story_qa.js
test_cross_floor_entanglement_qa.js
test_cross_floor_sequence_qa.js
test_persistent_loop_qa.js
test_privacy_3f_fast_qa.js
test_release_perf_b2_loop2_qa.js
test_visual_geometry_contract_qa.js
test_pond_waterfront_qa.js
test_hillside_surface_qa.js
test_art_resources_qa.js

and current browser tests / walkthroughs.

Do not change tests merely to make broken behavior PASS。

Only update tests where:
the old expectation conflicts with explicitly approved current design,
such as removed Pond Annie content。

Document why。

============================================================
33. BUILD
============================================================

From:

prototype/

run:

npm ci
npm run build

Run asset budget。

Run current available:
browser smoke
story walkthrough
visual QA
live-build verification

Inspect browser console：

NO:
404
CORS errors
texture decode errors
uncaught exceptions
WebGL shader errors

============================================================
34. PERFORMANCE INSTRUMENTATION
============================================================

Cold + warm cache。

Produce:

LOADING_PERFORMANCE_V2.csv

fields:

fromZone
toZone
coldOrWarm
essentialBytes
optionalBytes
elevatorAnimationMs
extraWaitMs
totalTransitionMs

routes：

BOOT → 3F
3F → 4F
4F → 2F ER
2F → 3F
3F → 1F
Second Campus 5F → 2F
Skybridge
6F
B2

Record:

transitionStart
essentialReady
zoneBuilt
transitionEnd
waitMs

Hard requirement：

不能再發生：
10 sec
20 sec
30 sec
indefinite elevator hangs

Warm cache：
正常情況應接近 cinematic / transition 本身時間。

============================================================
35. ACCEPTANCE CRITERIA
============================================================

Do not merge unless ALL relevant criteria pass。

--------------------
VISUAL RESTORATION
--------------------

[ ] 3F no longer flat blockout
[ ] 4F PBR restored
[ ] 2F ER PBR restored
[ ] Second Campus PBR restored
[ ] Phantom 6F PBR restored
[ ] B2 PBR restored
[ ] wood grain visible
[ ] terrazzo visible
[ ] floor/vinyl detail visible
[ ] plaster surface visible
[ ] doors not flat color
[ ] return-to-zone keeps materials
[ ] real scene material audit proves map + normal + roughness where required

--------------------
LOADING
--------------------

[ ] no destination-wide preloadAssets() blocking
[ ] no destination-wide preloadMaterials() blocking
[ ] no whole-world post-first-paint download storm
[ ] zone essential manifest works
[ ] optional assets load in background
[ ] campusTree never blocks indoor zones
[ ] 3F → 4F normal
[ ] 4F → 2F normal
[ ] return transitions normal
[ ] warm cache near animation duration

--------------------
NIGHT HORROR ART
--------------------

[ ] outbound Skybridge remains relatively normal
[ ] return Skybridge visually deteriorates
[ ] crooked lamps
[ ] authored low-frequency flicker
[ ] pools of light / darkness
[ ] subtle horror fog
[ ] night stars
[ ] hillside visible outside
[ ] pond visible outside
[ ] window treatment improved
[ ] distant scenery doesn't block load
[ ] no Pond Annie

--------------------
CG
--------------------

[ ] 21:17 Duty Room CG works
[ ] 00:33 Ghost Registration CG works
[ ] First 409/Bed33 anomaly CG works
[ ] Return Bridge White Coat CG works
[ ] B2 Permanent Closure CG works
[ ] 409 Patientization CG works
[ ] 316 True Name CG works
[ ] Elevator Door anomaly CG works
[ ] every CG restores controls
[ ] no duplicate trigger
[ ] no stuck pointer lock
[ ] no broken objective progression
[ ] no removed Pond Annie cinematic

--------------------
GAMEPLAY
--------------------

[ ] M1–M9 PASS
[ ] 316 early-loop fix preserved
[ ] B2 one-way PASS
[ ] B2 fail-forward PASS
[ ] flexible identity PASS
[ ] second-campus story PASS
[ ] 6F clinical skills center PASS
[ ] current True Name PASS
[ ] current loop mechanics PASS

============================================================
36. DEPLOYMENT
============================================================

Only after all acceptance criteria pass：

1. git status
2. run final tests
3. npm run build
4. commit changes
5. push working branch
6. merge to master using current repository workflow
7. push master
8. let existing GitHub Pages workflow deploy

Do not invent a second deployment system if current one works。

Verify GitHub workflow result。

Then verify：

https://hsushuhao-lab.github.io/DutyNight/

Must verify actual public build,
not only local dist。

Public verification：

- correct commit/build fingerprint
- 3F PBR
- 4F PBR
- 2F PBR
- skybridge art
- cinematic triggers
- no major console errors
- no long elevator hangs

Run at least online:

3F
→ 4F
→ 2F ER
→ 3F

And the available debug/story paths for:

Skybridge return
B2 closure
Patientization
316 finale
elevator anomaly

============================================================
37. FINAL REPORT
============================================================

Do NOT respond only：

PASS

Report exactly：

STATUS:
DEPLOYED_AND_VISUALLY_VERIFIED
or
BLOCKED_<specific reason>

STARTING_MASTER_SHA:
...

VISUAL_GOOD_SHA:
...

FINAL_DEPLOY_SHA:
...

PUBLIC_URL:
https://hsushuhao-lab.github.io/DutyNight/

ROOT CAUSE — MATERIAL:
...

ROOT CAUSE — LOADING:
...

FILES CHANGED:
...

VISUAL RESTORATION:
- 3F
- 4F
- 2F
- Second Campus
- 6F
- B2

NIGHT HORROR ART:
- Skybridge outbound
- Skybridge return
- starfield
- hillside
- pond landscape
- windows
- fog
- lighting

CG IMPLEMENTED:
[ ] 21:17 Duty Room
[ ] 00:33 Ghost Registration
[ ] First 409 / Bed33
[ ] Skybridge White Coat
[ ] B2 Closure
[ ] Patientization
[ ] True Name Finale
[ ] Elevator Door

REMOVED CONTENT CHECK:
Pond Annie = ABSENT

PERFORMANCE BEFORE:
initial blocking bytes:
3F→4F:
4F→2F:
textured mesh ratio:

PERFORMANCE AFTER:
initial blocking bytes:
3F→4F:
4F→2F:
textured mesh ratio:

QA:
structural:
story:
visual:
material runtime:
cinematic:
cold-cache:
warm-cache:
public:

SCREENSHOTS:
provide exact paths for before/after evidence。

PUBLIC VERIFICATION:
provide tested public fingerprint / SHA。

============================================================
38. HARD DO-NOT LIST
============================================================

DO NOT:

- lower texture quality to solve loading
- remove PBR
- ship flat-color fallback as final
- delete decoration for performance
- reduce normal maps until invisible
- whole-repository revert
- break current M1–M9
- break B2 fail-forward
- break 316 flexible identity
- restore removed Pond Annie
- replace cinematics with option dialogs
- add cinematic just as a text popup
- use long prerendered video files
- let optional asset failure permanently block transition
- make outdoor 16 MB tree block indoor play
- claim DONE after npm build only
- claim DONE before public GitHub Pages visual verification

============================================================
39. IMPLEMENTATION LOOP
============================================================

Operate as:

AUDIT
↓
identify reproducible failure
↓
write/update focused regression test
↓
implement minimum correct fix
↓
run focused test
↓
run relevant regression
↓
visual inspect
↓
continue

Do not stop merely because code compiles。

The task is complete only when:

1. visual correctness is restored,
2. cross-floor loading is acceptable,
3. Night Horror Art Pass is visibly present,
4. all eight approved cinematics work,
5. removed Pond Annie does not return,
6. story/gameplay regressions pass,
7. GitHub Pages public build is deployed,
8. public build is visually verified.

BEGIN NOW.
