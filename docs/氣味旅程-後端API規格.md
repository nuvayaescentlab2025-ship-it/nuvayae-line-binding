# 氣味旅程 — 後端 API 規格

> 本文件由前端程式碼（`scent-journey.html`）反推，提供給後端開發者作為 API 實作依據。

---

## 概覽

「氣味旅程」是一個會員歷月選香記錄的時間軸頁面。前端透過 `userid`（LINE UID）向後端查詢訂閱狀態及歷史選香資料，並以時間軸方式呈現。

**目前前端使用 Mock 資料**，後端只需在現有 `check_bound` 回應中加入 `history` 欄位，前端即自動切換為真實資料，無需前端改版。

> **前端待修正**：`scent-journey.html` 目前仍使用舊版 GAS 端點（`script.google.com/macros/...`），需一併更新為 Supabase Edge Function 端點。此為前端修正事項，不影響後端實作。

---

## API 端點

### 查詢訂閱狀態與選香歷史

複用現有 `check_bound` action：

```
GET /functions/v1/member?action=check_bound&userid={lineUserId}
```

| 參數 | 位置 | 必填 | 型別 | 說明 |
|---|---|---|---|---|
| `action` | Query String | 是 | string | 固定值 `check_bound` |
| `userid` | Query String | 是 | string | LINE UID，由 LIFF 取得 |

> 前端 `index.html`（主頁）與 `scent-journey.html`（氣味旅程）共用此端點。

---

## 回應格式

### 現行 `check_bound` 完整回應欄位

目前 `check_bound` 已回傳以下欄位：

```json
{
  "status": 200,
  "isBound": true,
  "duration": "30 天 5 小時 12 分鐘",
  "months": 1,
  "subType": "month",
  "currentPerfume": "夜和",
  "currentPerfumeDate": "2026-04-01T10:30:00+08:00",
  "lastPerfume": "暖居",
  "deadline": "2026-04-28",
  "nextOrderDate": "2026-05-01",
  "isLocked": false
}
```

氣味旅程頁面僅需在此回應基礎上**新增 `history` 欄位**，不需修改任何既有欄位。

### 情境一：未綁定會員

```json
{
  "status": 200,
  "isBound": false
}
```

前端顯示「查無訂閱記錄」。

### 情境二：已綁定但無 history（現狀）

現行回應不含 `history`，前端氣味旅程頁面自動 fallback 至 Mock 資料。**此為目前行為，串接後即消除。**

### 情境三：已綁定 + history（目標格式）

在既有欄位之外新增 `history`：

```json
{
  "status": 200,
  "isBound": true,
  "duration": "90 天 3 小時 20 分鐘",
  "months": 3,
  "subType": "year",
  "currentPerfume": "朝光",
  "currentPerfumeDate": "2026-03-05T14:00:00+08:00",
  "lastPerfume": "夜和",
  "deadline": "2026-03-28",
  "nextOrderDate": "2026-04-01",
  "isLocked": false,
  "history": [
    { "year": 2026, "month": 3, "monthIndex": 3, "perfumeName": "朝光", "isCurrent": true },
    { "year": 2026, "month": 2, "monthIndex": 2, "perfumeName": "夜和", "isCurrent": false },
    { "year": 2026, "month": 1, "monthIndex": 1, "perfumeName": "暖居", "isCurrent": false }
  ]
}
```

> `duration`、`months` 等既有欄位維持原本格式不變，`history` 為純新增欄位。

---

## `history` 陣列規格

### 排序

**由新到舊排列**（最新月份在前）。前端依陣列順序由上至下渲染時間軸。

### 欄位定義

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `year` | number | 是 | 西元年，例如 `2026` |
| `month` | number | 是 | 曆月（1–12），用於顯示日期及判斷是否為季禮月 |
| `monthIndex` | number | 是 | 訂閱的第幾個月（從 1 起算），用於顯示「第 N 個月」 |
| `perfumeName` | string \| null | 是 | 該月選用的香水中文名稱；若該月尚未選香，傳 `null` |
| `isCurrent` | boolean | 是 | 是否為「本月」，前端用於高亮目前進度節點 |

### 欄位詳細說明

#### `perfumeName`

前端目前支援的香水名稱與對應顯示樣式：

| 名稱 | 色條顏色 | 風格描述 |
|---|---|---|
| `"夜和"` | `#D6CADD`（紫灰） | 寧靜草本木質調 |
| `"朝光"` | `#D0E5D2`（青綠） | 冷冽森林木質調 |
| `"暖居"` | `#F4D5A6`（暖橘） | 溫暖果香木質調 |

- 傳入以上三個名稱以外的字串：前端仍可渲染卡片，但色條為灰色 `#DDD`，無風格描述
- 傳入 `null`：前端顯示半透明的「香氛記憶整理中」佔位卡片
- **若未來新增香水品項**，需同步通知前端更新 `SCENT_STYLES` 常數

#### `isCurrent`

- 整個 `history` 陣列中應**只有一筆** `isCurrent: true`
- 通常為陣列第一筆（最新月份）
- 前端以金色光暈圓點標示此節點

#### `month` 與季禮月

前端會根據 `month` 值自動判斷是否顯示季禮卡片：

| month 值 | 季節 | 顯示效果 |
|---|---|---|
| `3` | 春 | 顯示 🌸 春季專屬禮贈卡片 |
| `6` | 夏 | 顯示 🍧 夏季專屬禮贈卡片 |
| `9` | 秋 | 顯示 🍂 秋季專屬禮贈卡片 |
| `12` | 冬 | 顯示 ❄️ 冬季專屬禮贈卡片 |

此為前端純展示邏輯，後端不需額外傳送季禮相關資料。

---

## 前端判斷邏輯

以下為前端切換 Mock / 真實資料的核心邏輯，供後端理解行為：

```js
function buildItems(result) {
    // 後端回傳 history 陣列且非空 → 使用真實資料
    if (Array.isArray(result.history) && result.history.length) return result.history;
    // 否則 → 使用 Mock 設計稿
    return MOCK_HISTORY;
}
```

**啟用條件**：回應中 `history` 為非空陣列即可。不需要額外的開關欄位。

---

## 串接範例

假設會員於 2026/01 開始訂閱，目前為 2026/04（第 4 個月），且 4 月尚未選香：

```json
{
  "status": 200,
  "isBound": true,
  "duration": "93 天 8 小時 15 分鐘",
  "months": 3,
  "subType": "year",
  "currentPerfume": "尚未選香",
  "currentPerfumeDate": "",
  "lastPerfume": "朝光",
  "deadline": "2026-04-28",
  "nextOrderDate": "2026-05-01",
  "isLocked": false,
  "history": [
    { "year": 2026, "month": 4, "monthIndex": 4, "perfumeName": null, "isCurrent": true },
    { "year": 2026, "month": 3, "monthIndex": 3, "perfumeName": "朝光", "isCurrent": false },
    { "year": 2026, "month": 2, "monthIndex": 2, "perfumeName": "夜和", "isCurrent": false },
    { "year": 2026, "month": 1, "monthIndex": 1, "perfumeName": "暖居", "isCurrent": false }
  ]
}
```

前端渲染結果：
1. **2026.04**（第 4 個月 · 本月）— 金色活躍圓點 + 半透明「香氛記憶整理中」卡片
2. **2026.03**（第 3 個月）— 🌸 春季禮贈卡片 + 朝光選香卡片
3. **2026.02**（第 2 個月）— 夜和選香卡片
4. **2026.01**（第 1 個月）— 暖居選香卡片

---

## 錯誤處理

| 情境 | 前端行為 |
|---|---|
| API 回應非 200 或 JSON 解析失敗 | 顯示「載入失敗，請稍後再試」 |
| `isBound` 為 `false` | 顯示「查無訂閱記錄」 |
| `history` 不存在或為空陣列 | Fallback 至 Mock 資料（不影響使用，但非正式狀態） |
| `userid` 未提供 | 顯示「無法取得會員資訊，請返回重試」（前端自行攔截，不會呼叫 API） |

---

## 注意事項

1. **向下相容**：新增 `history` 欄位不會影響 `index.html` 主頁的既有功能，主頁不讀取此欄位
2. **資料範圍**：應回傳該會員從訂閱開始到當月的所有月份記錄（最多 12 筆）
3. **未選香月份也要回傳**：`perfumeName` 設為 `null`，讓前端可顯示佔位卡片
4. **`monthIndex` 與 `month` 的差異**：`monthIndex` 是訂閱序號（1–12），`month` 是實際曆月（1–12），兩者在非 1 月開始訂閱時會不同

---

## `monthIndex` 計算方式

`monthIndex` 代表「訂閱的第幾個月」，應使用**日曆月差**計算，而非現有 `calcDuration` 的天數除法。

### 為何不能沿用 `months`

現行 `calcDuration` 以 `Math.floor(diffDays / 30)` 計算 `months`，在月份天數不均時會產生偏差：

| 情境 | 天數除法結果 | 日曆月差結果 |
|---|---|---|
| 訂閱起始 1/31，當前 3/1 | `Math.floor(29/30) = 0` | `3 - 1 = 2`（第 2 個月） |
| 訂閱起始 1/1，當前 2/28 | `Math.floor(58/30) = 1` | `2 - 1 = 1`（第 2 個月） |

### 建議計算公式

```js
// order_created_at = 訂閱起始日期（from members table）
const startYear  = orderCreatedAt.getFullYear();
const startMonth = orderCreatedAt.getMonth() + 1; // 1-based

monthIndex = (currentYear - startYear) * 12 + (currentMonth - startMonth) + 1;
```

### 建議資料來源

`history` 陣列的建構可直接以資料庫查詢組合：

- **`members.order_created_at`**：取得訂閱起始月份，計算 `monthIndex` 與 history 範圍
- **`perfume_selections.target_month`**：逐月比對是否有選香記錄
- 從起始月遍歷到當月，每月產生一筆 history item，有選香記錄則填入 `perfumeName`，無則為 `null`

---

## 待後端確認事項

以下三點需後端確認後方可開始實作：

### 1. `perfume_selections.target_month` 欄位格式

前端假設可用此欄位比對曆月，但不確定實際儲存格式：

- `"2026-03"`（年月字串）
- `"2026-03-01"`（完整日期）
- 或其他格式？

請確認格式，以便決定 history 建構時的比對方式。

### 2. 資料庫中香水名稱是否與前端一致

前端 `SCENT_STYLES` 的 key 為 `"夜和"`、`"朝光"`、`"暖居"`，`select_perfume` action 送出的欄位為 `scentName`。

請確認存入 DB 的值是否與上述三個名稱**完全一致**（含中文字）。若不一致，前端會 fallback 為灰色卡片、無描述文字。

### 3. 月訂閱（`subType: "month"`）是否需要回傳 history

年訂閱最多 12 筆 history，但月訂閱僅 1 個月：

- **方案 A**：月訂閱也回傳 history（僅 1 筆），前端統一處理
- **方案 B**：月訂閱不回傳 history，前端自動 fallback 至 Mock

請確認採用哪種方案，或是否有其他考量。

---

## 後端確認結果（2026-04-03）

以下為後端根據現行程式碼與資料庫 schema 的逐項確認：

### 1. `target_month` 格式：`"yyyy-MM"`（如 `"2026-04"`）✅

- DB migration 註解明確標示格式為 `yyyy-MM`（見 `20260404000002_create_perfume_selections.sql` 第 15 行）
- 程式碼 `formatMonth()` 產出格式為 `"2026-04"`，與 DB 儲存一致
- **結論**：前端可直接以 `"yyyy-MM"` 字串比對曆月，無需額外轉換

### 2. 香水名稱：與前端完全一致 ✅

- `handleSelectPerfume` 接收前端送來的 `body.scentName` 後直接寫入 `perfume_selections.scent_name`，**不做任何轉換或正規化**（見 `member/index.ts` 第 435 行）
- 因此 DB 中的值就是前端 `select_perfume` 時送出的原始字串
- 只要前端送 `"夜和"`、`"朝光"`、`"暖居"`，DB 中儲存的就是這三個值
- **結論**：與 `SCENT_STYLES` 的 key 完全一致，history 回傳時可直接使用，不需映射

### 3. 月訂閱 history：採方案 A（統一回傳）✅

- **採用方案 A**：月訂閱也回傳 `history`（僅 1 筆）
- 理由：
  - 邏輯統一，後端不需根據 `subType` 分支處理
  - 前端不需額外判斷，統一以 `history` 陣列渲染時間軸
  - 1 筆資料量對效能無影響
- **結論**：所有 `subscription_status: "subscribed"` 的會員，無論 `subType` 為 `"month"` 或 `"year"`，皆回傳 `history`
