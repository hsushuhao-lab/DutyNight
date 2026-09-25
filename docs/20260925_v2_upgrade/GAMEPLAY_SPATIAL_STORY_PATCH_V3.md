# ============================================================
# DutyNight — Gameplay / Spatial Interaction Repair Directive
# TASK ID: DN-GAMEPLAY-SPATIAL-STORY-PATCH-V3
# PRIORITY: P0
# TARGET: prototype/
# ============================================================

Repository:
hsushuhao-lab/DutyNight

工作基準：
先同步最新 origin/master，不得 reset 舊版本。

本輪不是重寫 M1–M9 主線，而是針對目前實際遊戲截圖與玩家 walkthrough
修正「空間互動不自然、任務點過多、劇情觸發缺漏、道具線索位置不合理」等問題。

完成後必須實際 build、browser walkthrough、GitHub Pages 部署並驗收。
不得只修改文件。

# ============================================================
# 1. 1F 警衛台 / 隱藏服務門
# ============================================================

玩家可見文字統一使用：

  警衛台

不要再顯示：

  舊警衛台

內部程式 ID 如 OLD_GUARD_POST 可保留，避免無必要重構。

目前警衛台牌仍有懸浮／突出問題：
- 將「警衛台」告示牌貼牆或固定於警衛台上方
- 不可懸浮於半空
- 不可突出至玩家通道

警衛台本身必須有可靠的 E 互動：

  [E] 檢查警衛台

內容只描述：
- CCTV
- 值勤簿
- 鑰匙櫃
- 警衛設備

CCTV 不要再提：
- 李醫師
- 主角身分
- 「紀錄指向我」

改成中性描述，例如：

  「CCTV 停在夜間走廊。
    值勤簿翻到最後一頁，最後幾格仍是空白。」

檢查完警衛台之後：

1. HIDDEN_SERVICE_DOOR_DISCOVERED = true
2. 警衛台後方牆面的舊門框／接縫才真正顯現
3. 任務改成：
   「檢查警衛台後方浮現的舊門框」

重要：
不要再要求玩家猜透明 invisible hitbox。

「舊門框」可見 mesh 本身或其明確 interaction volume 必須可 Raycast / E。

互動：

  [E] 檢查牆面的舊門框

接著才進入 B-Panel 流程。

B-Panel UI 標題改為：

  02:17｜警衛台後方 B-Panel

不要再寫：

  舊警衛台後配電

新增 browser QA：
- 玩家走近警衛台
- E 可觸發
- 檢查後門框顯現
- 門框 E 可觸發
- B-Panel choice 正常出現
- 正確路徑可進 B2

# ============================================================
# 2. 4F 任務大幅簡化
# ============================================================

目前右上角有太多 SOP checklist。

正式任務欄只保留以下三個核心任務：

17:15
  向護理站報到

19:30
  查看 408C 反映的敲牆聲

20:00
  回值班室短暫休息

不要再在右上任務欄列出：

- 17:30 整理值班室
- 18:00 完成 401–408 巡房
- 18:30 評估 403
- 其他中間 checklist

這些臨床內容可以保留為場景事件與台詞，但不是正式 mission step。

------------------------------------------------------------
2A. 17:15 護理站
------------------------------------------------------------

不要使用走廊中央 proximity point。

互動點必須綁定：

  4F 護理站內／櫃台交班位置

玩家靠近真正護理站櫃台才顯示：

  [E] 向護理站報到

交班內容保留：

  32 床滿床
  403 睡不好
  408C 反映隔壁敲牆
  409 封閉整修

------------------------------------------------------------
2B. 19:30 408C
------------------------------------------------------------

不要使用地板上的 invisible p1_action。

互動點直接綁定：

  408C 床頭牌

準星對床頭牌：

  [E] 查看 408C 反映的敲牆聲

觸發：
  咚 × 4
  pause 1.5 sec
  咚 × 9

408C 是唯一敲牆來源。

403 只保留：
  睡眠困難

不得讓 403 再提敲牆。

------------------------------------------------------------
2C. 20:00 值班室
------------------------------------------------------------

完成 408C 事件後：

玩家不需要再找床邊或地面的「REST」互動點。

只要玩家：

  打開 4F 醫師值班室門

就完成：

  20:00 回值班室短暫休息

並進入急診通知 sequence。

# ============================================================
# 3. 4F 病房門與床頭牌
# ============================================================

目前部分病房門開啟後會：

- 撞到病床
- 穿過床尾／床頭
- 遮住床頭牌

必須重新檢查所有 401–408：

每扇 KeyedKnobDoor 打開 90 度後，
door leaf bounding box 不得與：

- hospitalBed
- bed headboard
- bed plaque
- room signage

相交。

優先方案：
讓病房門朝走廊方向開。

如果空間語意不允許，
再調整床位與 plaque。

新增 geometry QA：
door-open state 下無 bed/plaque overlap。

# ============================================================
# 4. 4F 儲藏室
# ============================================================

要求：

- 門改／維持標準喇叭鎖木門
- 不要感應門
- 「儲藏室」告示牌放在門正上方
- 告示牌貼牆，不可突出／穿牆

Annie：

第一次值班：
  儲藏室內不要出現 Annie

至少第一次發生 Loop 之後：
  Annie 才可以出現在 4F 儲藏室

亦即：
  loopCount == 0 → 無 Annie
  loopCount >= 1 → 可出現 Annie

不要讓玩家第一次正常值班就到處看到 Annie，
保留 Normality First。

# ============================================================
# 5. 4F 值班室
# ============================================================

本輪取消前一次「桌子移到床旁」的設計。

恢復較合理的原始位置：

  工作桌位於值班室洗手間前方附近
  約 x=-10, z≈3.1

床維持另一側。

這樣空間比較接近原本 walkthrough，
也避免床與工作區太擠。

咖啡目前漂浮的原因是：
桌子移走但 coffee 座標沒同步。

修正：

DutyRoom_HotCoffee 必須 Surface Snap 到工作桌桌面。

不要硬寫一個與桌子無關的世界 Y。

優先做法：
取得 desk bounding box / known desk surface height，
再放置 coffee。

驗收：
咖啡杯底部真正接觸桌面，不浮空、不穿桌。

# ============================================================
# 6. 第二院區 5F 胸痛病人
# ============================================================

目前程式額外在大廳中央生成：
SecondCampus_ExtraChestPainBed

這是不合理的。

刪除大廳中央額外床。

胸痛病人固定床號改為：

  504B

必須使用第二院區 5F 已存在的：

  bedAreas.find(b => b.id === '504B')

病人模型、互動 hitbox、腕帶、枕頭線索全部定位到 504B。

504B 床頭牌必須可辨認。

劇情仍是：

- 胸悶、心悸
- 過度換氣
- anxiety
- vital stable
- ECG 無急性異常

病人不消失。

恐怖來源仍然是：
已經事先填好的 409A 轉院單。

「守」名冊碎片放在 504B 枕頭／床邊合理位置。

# ============================================================
# 7. 第二院區 1F 感應門
# ============================================================

2.0 已是純室內流程。

第二院區 1F 山側門不要再讓玩家出去。

門保持鎖閉。

玩家 E 互動時固定顯示：

  李醫師：
  「打不開，這邊也是只進不出。」

不得：

- teleport 到 hillside
- 進戶外 landing
- 進生態池 route

如果戶外 geometry 為了避免 regression 暫時保留，
也必須保持 production unreachable。

# ============================================================
# 8. 聽診器線索改到 Phantom 6F
# ============================================================

目前天橋上直接出現：

- pedestal
- 聽診器
- 「祝守恆醫師」大字

完全移除。

天橋不能直接給 True Name 答案。

移除：

ANNIE_TRUE_NAME_CLUE
true_name_clue_2
bridge stethoscope display
bridge engraving plaque

M5 天橋只負責：

- Annie 出現
- 回頭規則
- 回到第一院區

「恆」線索延後到 M6 隱藏六樓。

------------------------------------------------------------
8A. 6F 搜尋
------------------------------------------------------------

在 Phantom 6F 裡設計真正的「翻找」事件。

建議位置：

- 焦黑病床下
或
- 翻倒的急救器材車後
或
- 焦黑白袍／舊器材箱內

玩家先看到：

  [E] 翻找焦黑器材

第一次互動：

  「摸到一個冰冷的金屬物件。」

取得老舊聽診器。

但此時不要直接把刻字顯示在世界場景。

第二步：

  [E] 檢視老舊聽診器

進入 close inspect。

先看到：
- 氧化
- 刮痕
- 龜裂黑色管線

玩家選：
  翻到胸件背面
或
  擦掉表面灰塵

此時才第一次讀到：

  「祝 守恆 醫師
    1997
    執業誌慶」

然後才 unlock：

  frag_givenName_2 = 恆

不可在 Annie 身上或遠距離直接清楚看見刻字。

# ============================================================
# 9. 409A 第一次就要真正有兩個分支
# ============================================================

目前安全 Reject 選項會被 understanding / rememberedRule gate 限制。

取消。

第一次碰到 409A 時就必須出現兩個真正選擇：

A：
  「確認 409A 臨時床位分配」

→ Legend Override
→ 被病人化收治
→ Loop

B：
  「409 封閉整修，先不過床」

→ 不發生壞事
→ BED33_RESOLVED
→ 正常繼續值班

不要要求玩家第一輪先死一次才知道如何拒絕。

這是一個 narrative choice，
不是 memory-gated UI unlock。

# ============================================================
# 10. 3F Annie 三階段
# ============================================================

目前 Stage 0–2 幾乎都是同一個站立 mannequin。

重做為：

第一次經過儲藏室：
  Annie 躺在 CPR 推床上
  完全靜止
  看起來只是訓練教具

第二次經過：
  Annie 已離開床
  站在儲藏室內
  正面朝向門口／走廊
  不需要跳臉或追玩家

第三次再經過：
  CPR 推床空了
  Annie 完全消失

這三階段必須具有清楚空間差異。

不得只是：
same position + rotation tweak。

另外：

3F 初期移除可辨識的「張守恆聽診器」。

True Name 聽診器只在 6F 才真正被找到。

# ============================================================
# 11. 第二次回溯後 3F Fast Path
# ============================================================

當：

  persistentMemory.data.loopCount >= 2

開始新一輪時，
主角已有足夠記憶，不應重新完成整套 M1 行政解謎。

開場自語改為：

  李醫師：
  「這些流程我已經走過了。
    我先取得院內通行證明的感應卡比較重要。」

任務欄只保留：

  「進入 316，取得感應卡與 4F 值班室鑰匙」

玩家仍需真正開 316，
但不需要再次：

- 查行政名冊
- 看印表機
- 看科秘書 memo
- 再推 1700 謎語
- 再完成電子交班
- 再翻不必要文件

已知密碼／規則由 PersistentMemory 保留。

只要主角真正進入 316：

1. 316 電話立即響起
2. 玩家仍要 E 接電話
3. 感應卡與 4F 鑰匙可直接取得
4. 之後快速進入本輪主線

loopCount 0 / 1 可保留較完整原始流程。

# ============================================================
# 12. 4F 大型病房資訊板
# ============================================================

目前 4F 今日值班／病房資訊板正面被大型綠色櫃子遮住。

必須修正。

正面站在護理站外應完整看得到：

  第一線：李住院醫師
  滿床 32 床
  408C：防跌倒、易躁動
  409：封閉整修，禁止推床入內

方案：
- 把綠色高櫃移到側面
或
- 將資訊板提高／橫移

不要只保證 mesh 存在。
必須 browser screenshot 可視。

# ============================================================
# 13. 2F 急診 — Jane Doe 第一次登場必須恢復
# ============================================================

目前 2F 急診流程缺少了非常重要的
「第一次 Jane Doe／無名女病人真正出現在急診」的戲。

必須恢復。

20:00 返回值班室休息後：

1. 值班室實體電話先響
2. SoundManager 播放 phone ring
3. 玩家 E 接電話
4. 急診通知：

   「李醫師，急診有一位身分資料不完整的女性病人，
     情緒很不穩定，麻煩精神科下來評估。」

5. 任務：
   「20:05 前往 2F 急診」

到急診後必須真的看到 Jane Doe。

她不是只有字幕。

建立：
- 急診床／留觀床
- 女性病人模型
- 暫時無法確認姓名的腕帶
- 可 E 評估

床旁可暫時顯示：

  Jane Doe
或
  身分待確認

這是第一次玩家真正遇到「無名女病人」。

評估時 Jane Doe 提到：

  「02:17……
    門要被關上了……
    警衛台後面……
    不要照他們留下的順序……
    紫色的燈……」

並留下：

  1998-ER-0217
  B-Panel 舊十字鑰匙

這個事件是 Jane Doe 本人的第一次、也是最重要的一次實體登場。

不要只用一行字幕替代。

# ============================================================
# 14. 00:33 急診掛號 — 不再說「剛才那個無名氏」
# ============================================================

00:33 事件語意重寫。

不要：

- 再說「無名氏來了」
- 再說「有一位無名氏資料卡住」
- 暗示 Jane Doe 又回來
- 讓護理師說剛才那位病人

00:33 的恐怖點是：

「掛號紀錄存在，但現場根本沒有人。」

流程：

23:55–00:30 值班室事件後，
急診電話再次響起。

SoundManager：
  playPhoneRingPattern()

玩家接電話。

急診護理師：

  「李醫師，不好意思。
    系統裡突然多了一筆掛號資料，
    可是我們這邊找不到病人。
    你對這個名字／這筆資料有印象嗎？」

不要提：
  無名氏

李醫師回覆：

  「我沒有印象。
    我下去看看病歷紀錄。」

任務更新：

  「前往 2F 急診查看異常掛號紀錄」

玩家到急診後：

- 現場沒有新增病人
- 沒有 Jane Doe 坐在那裡
- 只有掛號電腦／印表機異常
- 系統紀錄或掛號聯：
    1998-ER-0217

護理師：

  「資料有建立時間，
    可是檢傷區、候診區、留觀床都沒有人。」

李醫師：

  「這格式不是現在的 HIS。
    我拿回 316 用舊終端查。」

正確處理：
  只取得／列印舊掛號紀錄
  不建立新的病歷

錯誤處理：
  用現行 HIS 建立新病歷
  → identity override / Loop

也就是：

20:05：
  Jane Doe = 真正出現的病人

00:33：
  沒有病人
  只有「應該屬於某人的掛號紀錄」

這兩段一定要明確區分。

# ============================================================
# 15. 21:15 回 3F 查哨點前必須有電話鈴聲
# ============================================================

目前雖然有電話字幕：

  護理站：
  「李醫師，三樓警衛說你少簽一個名字……」

但必須先真正播放值班室電話鈴聲。

流程固定：

1. Narrative clock 到 21:15
2. 值班室電話 ringing
3. soundManager.playPhoneRingPattern()
4. HUD 不要直接先跳任務
5. 玩家 E 接電話
6. 才播放：

   「李醫師，三樓警衛說你剛才在查哨點少簽一個名字，
     21:17 前要送巡查大表。
     你現在立刻下去補簽。」

7. 李醫師：

   「我？我一直在四樓值班室啊……」

8. 護理站：

   「三樓說看著你的背影走過去的。快去吧。」

9. 電話掛斷後才更新任務：

   「返回 3F 警衛查哨點」

電話鈴聲是這段故事的 trigger，
不能只有字幕。

新增 QA：
在 BOOTSTRAP_2117 前確認：
- ring event 發生
- PHONE_RING_ACTIVE 或等價狀態成立
- 玩家 answer 後才 unlock NIGHT_PATROL_RETURN_3F

# ============================================================
# 16. 任務欄正確目標
# ============================================================

4F 正常流程只顯示：

17:15 向護理站報到
19:30 查看 408C 反映的敲牆聲
20:00 回值班室短暫休息

2F 第一次急診：

20:05 前往 2F 急診評估身分待確認女性病人

21:15：

接完電話後才顯示：
  返回 3F 警衛查哨點

00:33：

接完電話後才顯示：
  前往 2F 急診查看異常掛號紀錄

M7：

  檢查警衛台
→
  檢查警衛台後方浮現的舊門框

不要讓任務 UI 先劇透下一個異常。

# ============================================================
# 17. 必須補的 QA
# ============================================================

新增／更新測試證明：

- 玩家可 E 警衛台
- 玩家可 E 浮現門框
- 「舊警衛台」不再出現在玩家 UI
- CCTV 不提李醫師
- 17:15 interaction 位於護理站
- 408C interaction 綁定床頭牌
- 20:00 打開值班室門即可完成休息任務
- 403 不再是正式 mission step
- 病房門打開不撞床／床頭牌
- 儲藏室牌在門上
- 儲藏室為 knob lock
- loop 0 儲藏室無 Annie
- loop >=1 可出現 Annie
- duty desk 回到洗手間前側
- coffee 接觸 desk
- chest patient 位於 504B
- 大廳中央沒有 extra chest bed
- second-campus 1F 不可出戶外
- 互動台詞正確：
  「打不開，這邊也是只進不出。」
- skybridge 不再生成 True Name stethoscope
- 6F 才能取得 stethoscope
- stethoscope inscription 必須經 inspect/翻面才顯示
- 409A 第一次就有 Confirm / Reject 兩條路
- 3F Annie：
    第一次躺床
    第二次站立面向門
    第三次消失
- loopCount >=2 啟用 3F fast path
- 20:05 Jane Doe 有實體病人
- 00:33 現場無病人
- 00:33 台詞不包含「無名氏」
- 21:15 回 3F 前電話真的 ringing
- 00:33 急診通知也真的 ringing
- 4F information board 未被櫃子遮住

Browser screenshot 至少包含：

4f_nursing_report.png
4f_408c_plaque.png
4f_duty_room_desk_coffee.png
4f_storage_sign.png
4f_storage_annie_loop2.png
4f_info_board_clear.png
er_jane_doe_2005.png
er_empty_0033.png
second_504b_patient.png
second_1f_locked_exit.png
3f_annie_stage0_bed.png
3f_annie_stage1_facing_door.png
3f_annie_stage2_gone.png
floor6_stethoscope_hidden.png
floor6_stethoscope_inspect.png
first1f_guard_post.png
first1f_hidden_door.png
bed33_first_choice.png

Screenshot timeout = FAIL。
不能 warning 後 PASS。

# ============================================================
# 18. EXECUTION / RELEASE
# ============================================================

直接開始實作，不要再只提供計畫。

工作順序：

先同步最新 master。

只修改本輪需要的檔案，不做旁支 refactor。

完成後：

npm run build

執行現有：
- story QA
- geometry QA
- floorplan QA
- circulation QA
- hospital access QA
- browser story playthrough

再跑新的 regression tests。

全部 local PASS 後才：

git commit
git push origin master

等待：

Fast Deploy GitHub Pages
Story Browser Playthrough

兩者必須針對同一 final SHA。

最後 public Pages 再跑一次 browser visual QA。

回報：

- final SHA
- changed files
- build result
- QA result
- screenshot count
- screenshot warnings = 0
- public Pages result
- live URL
- remaining blockers

只要其中任何一個互動點、門、電話事件或 visual screenshot 未過，
不得宣告 COMPLETE。
---

## Authoritative user amendments (2026-09-26)

These amendments supersede conflicting wording in this attached document and govern this release:

- **20:05:** a physical patient exists; the patient's identity is unknown. Jane Doe is this person and must not be reused as the 00:33 anomaly.
- **00:33:** a registration record exists, but no patient exists in the emergency department. The triage, waiting, and observation areas are empty; staff cannot locate or identify a patient for the existing record. This is a data-without-person event, not another anonymous-patient encounter.
- **21:15:** the phone rings first. The player must answer with E; only then may the return-to-3F mission appear. Story phone calls are formal spatial Story Triggers, not subtitle decoration.
- Preserve the established main sequence and the existing implemented content. Older `ACT1_MASTER_SPEC` statements that 33-bed / 6F content is “not implemented” are historical scope; retain their normal-to-horror pacing principle only and do not remove current story content.

## Authoritative gameplay corrections (2026-09-26)

These later direct gameplay requirements resolve conflicting earlier lines in this attached directive:

- The guard-post plaque reads 警衛台, while the actual crosshair prompt is exactly [E] 檢查舊警衛台. Inspecting it reveals the door frame; the player then aims at that physical frame and presses E to reach B-Panel.
- Canonical main sequence: 正常值班 → 409A／第33床 → 21:17 → 00:33 → 316 身分線索 → 第二院區 → Annie／雙路徑 → 6F → 02:17／B2 → 身分奪權 → 316 真正交班. This repair does not remove implemented story content.
- 20:05 means a physical patient exists but her identity is unknown. 00:33 means a registration exists but no patient exists. Do not consume Jane Doe as a second anonymous-patient event.
- At 21:15 the phone rings first; the player answers it before the return-to-3F task appears. Phone calls are spatial Story Triggers.
- Bridge Annie holds both arms straight with hands overlapped; the stethoscope and the 恆 clue belong to the separate 6F search-and-inspection event.
