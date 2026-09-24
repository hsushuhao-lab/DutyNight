# 《夜班迴廊：與避無可避的傳說》

> **目前遊戲規格：M1–M9。** 本儲存庫的現行故事主線、視覺方向與 QA 權威文件位於 [`docs/20260925_m1_m9_rework/`](docs/20260925_m1_m9_rework/MASTER_REWORK_SPEC.md)。下方標示為 Act 1 / v0.1 的段落是歷史背景，不代表目前遊戲範圍；不得依舊規格刪除 409A、6F、B2 或 M1–M9 後續劇情。保留其「先常態、後驚悚」原則。

## —— 第一幕原型：今晚輪到你（Act 1 Prototype v0.1.1）——

> 🌐 **線上 3D 體驗站**：https://hsushuhao-lab.github.io/DutyNight/  
> 📦 **GitHub 專案庫**：https://github.com/hsushuhao-lab/DutyNight  
> 🎮 **本機一鍵啟動**：雙擊 `run-prototype.cmd`

一款以當代台灣精神專科醫院（完全虛構的「青嶺醫療中心」）夜間值班為背景的第一人稱心理驚悚敘事遊戲。第一幕涵蓋 **16:55–21:00「今晚輪到你」**。

---

## 核心設計原則：先常態，後驚悚（Normality First. Horror Second）

在不可逆的異常降臨前，玩家必須先深刻體會作為一名精神科值班住院醫師的**寫實日常與工作負擔**：夕陽下的長廊、熟悉的總醫師辦公室、簽到名冊、交班工作站與安靜獨立的值班室。第一幕前半完全維持溫和紀實的醫療常態，直至 20:58 出現第一次無法解釋的言論矛盾：

> 「醫師？……你剛剛不是才來過嗎？」

---

## 最新進度：2026-09-17 舒適度與視覺深度升級（v0.1.1）

本版整合了多項操作舒適度與醫療場景紀實細節修正：

1. **防眩暈操作調校**：調降第一人稱滑鼠旋轉靈敏度、降低相機 FOV、調降行走與奔跑速度，並大幅減緩視角起伏（Head Bobbing），大幅改善 3D 第一人稱動暈不適。
2. **完整按鍵相容**：全面支援 `WASD` 與 `鍵盤方向鍵 (↑↓←→)` 雙套移動鍵位。
3. **雙擊地板自動尋路行走**：對準地面或互動目標連點兩次滑鼠左鍵，角色將自動平滑行走至目標點，遇到碰撞或手動操控時自動解除。
4. **真實拓撲修正**：3F 行政報到處正式由預設代號修正為經確認之 **316 總醫師辦公室（Chief Resident Office）**。
5. **值班室定義純化**：移除未確認之 402 代號，還原核心設定：**4F 獨立私人值班室**。
6. **Act 1 暖色紀實光影**：導入 4000K 溫潤夕陽窗光、長廊防撞護木飾條、等候長椅、走廊盆栽、走廊盡頭黃昏燈箱與輕微電影感暗角效果。
7. **HIS 醫療整合系統**：依真實院內資訊系統（HIS）視覺重新刻劃 4A/4B/4C/4D 閉鎖病房交班摘要與留觀注意事項。

---

## 操作指南（Controls）

| 操作鍵 | 功能說明 |
| :--- | :--- |
| **W / A / S / D** 或 **方向鍵 ↑ / ↓ / ← / →** | 第一人稱平滑行走 |
| **Shift** | 稍快行走（Jog） |
| **滑鼠移動** | 環顧視角（點擊畫面鎖定滑鼠，`Esc` 釋放游標） |
| **雙擊滑鼠左鍵** | 自動朝準星所指之地面或物件走去（遇障礙自動停止） |
| **E** | 檢視／拾取／使用物件（鑰匙、值班本、HIS電腦終端機、電梯） |
| **~ (波浪鍵)** | 開啟／關閉遊戲隱藏狀態監控儀表（Duty / Evidence / Identity / Fatigue） |

---

## 第一幕第一階段里程碑（First Agent Task 1~6）

依據交接規格書（`HANDOFF_SUMMARY.md`）要求，第一階段核心目標已全數達成：

- [x] **1. 第一人稱視角與移動系統**（WASD + 方向鍵 + 雙擊自動走 + 碰撞盒阻擋）
- [x] **2. 3F 行政區空間 Blockout**（夕陽暖金照明、長廊、316總醫師辦公室、電梯大廳）
- [x] **3. 拾取 4F 值班室鑰匙**（`KEY_PICKUP`）
- [x] **4. 簽署 3F 值班簽到簿**（`DUTY_LOG`）
- [x] **5. 電子交班工作站操作**（`E_HANDOFF`：HIS 四大病房資訊與交班簽署）
- [x] **6. 電梯過場至 4F 閉鎖病房**（`ELEVATOR_TO_4F`：防呆相依檢查、雙音電梯鐘聲與抵達演出）

---

## 本機執行方式

### 方式一：一鍵啟動腳本
在專案根目錄下直接雙擊：
```cmd
run-prototype.cmd
```

### 方式二：Node.js 開發伺服器
```powershell
cd prototype
npm install
npm run dev
```
瀏覽器開啟：`http://localhost:5173`

### 方式三：生產環境建置
```powershell
cd prototype
npm run build
```

---

## 專案架構（Dual-Track Architecture）

```
DutyNight/
├── NightCorridor.uproject         # Unreal Engine 5.3+ 專案定義檔
├── Config/DefaultEngine.ini         # UE5 引擎設定
├── Source/NightCorridor/          # UE5 C++ 原始碼模組
│   ├── Act1Director.h/.cpp          # 第一幕流程導演器
│   ├── NightRunStateSubsystem.h/.cpp # 隱藏數值與狀態子系統
│   └── NightCorridor.Build.cs
├── prototype/                       # 3D 第一人稱即時體驗原型 (Three.js + Vite)
│   ├── index.html                   # 主畫面、HUD 與 HIS/簽到本視窗
│   ├── style.css                    # 醫院 UI、病歷表與氛圍樣式
│   ├── src/
│   │   ├── main.js                  # 核心渲染循環與互動射線
│   │   ├── core/GameState.js        # 與 UE5 對齊之狀態機 (Duty, Evidence, Fatigue)
│   │   ├── player/FPSController.js  # 第一人稱相機、碰撞與自動走
│   │   ├── world/Level3FBlockout.js # 3F 空間幾何、4000K 夕陽與物件
│   │   ├── audio/SoundManager.js    # Web Audio 程序化音效合成
│   │   └── ui/UIManager.js          # 對白、任務清單與各類視窗管理
├── LEGACY_ACT1_HANDOFF/ # 官方原始交接封包 (規格/劇本/美術參考)
└── run-prototype.cmd                # 本機一鍵啟動腳本
```

---

## 機密安全守則（Restricted Reference Policy）
本專案嚴格遵守 `06_GIT/GIT_SETUP.md` 規範，所有真實醫院地圖與機密照片（`02_ART/RESTRICTED_REFERENCE`）皆已透過 `.gitignore` 嚴格隔離，絕不流入版本庫。遊戲內空間均為基於高階拓撲之藝術化虛構創作。
