# 煖意香氛（Nuvayae）前端整合文件

> 版本：v1.0 · 2026-03-09

---

## 目錄

1. [API 概覽](#api-概覽)
2. [傳送訊息](#傳送訊息)
3. [回應結構](#回應結構)
4. [Session 生命週期](#session-生命週期)
5. [SlotState 槽位說明](#slotstate-槽位說明)
6. [錯誤處理](#錯誤處理)
7. [UI 設計建議](#ui-設計建議)
8. [完整範例程式碼](#完整範例程式碼)

---

## API 概覽

| 項目 | 值 |
|---|---|
| Endpoint | `POST /functions/v1/fragrance-advisor` |
| Content-Type | `application/json` |
| 驗證 | 無（不需要 JWT） |
| CORS | 已開放 `*` |

**Base URL**

- 本地開發：`http://localhost:54321`
- 正式環境：`https://<your-project-ref>.supabase.co`

---

## 傳送訊息

### Request Body

```json
{
  "userId": "U1234567890abcdef",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "我想找助眠香氛"
}
```

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `userId` | string | ✅ | 使用者唯一識別碼（如 LINE UID、自訂 ID） |
| `sessionId` | string | ✅ | **前端自行產生的 UUID**，代表這次諮詢 |
| `message` | string | ✅ | 使用者這一輪輸入的文字 |

**重要：`sessionId` 由前端產生。**
開啟新的諮詢時，前端使用 `crypto.randomUUID()` 建立一個新的 UUID 並持久保存，後續每一輪對話都沿用同一個 `sessionId`。

---

## 回應結構

### 成功（HTTP 200）

```json
{
  "reply": "嗯，助眠啊——你睡前通常是什麼狀態？是輾轉難眠的那種，還是只是想讓入睡的過程更儀式一點？",
  "state": {
    "space": null,
    "mood": "助眠",
    "preferences": [],
    "dislikes": [],
    "occasion": "睡前",
    "budget": null
  },
  "status": "active"
}
```

| 欄位 | 型別 | 說明 |
|---|---|---|
| `reply` | string | AI 顧問「瑤」的回覆，直接顯示給使用者 |
| `state` | SlotState | 目前累積的需求槽位（詳見下方） |
| `status` | `"active"` \| `"completed"` | `completed` 表示推薦已完成，這個 session 已鎖定 |

---

## Session 生命週期

```
前端產生 sessionId (UUID)
         │
         ▼
  第 1 輪 POST /fragrance-advisor      ── 後端建立新 session，status: active
         │
         ▼
  第 N 輪 POST /fragrance-advisor      ── 後端累積對話歷史，status: active
         │
         ▼
  推薦完成且客戶滿意
         │
         ▼
  POST /fragrance-advisor 回傳 status: "completed"
         │
         ▼
  此 sessionId 已鎖定（後續請求返回 HTTP 409）
  ── 開啟新諮詢需要新的 sessionId
```

### 狀態轉換

| 狀態 | 說明 | 前端行動 |
|---|---|---|
| `active` | 對話進行中 | 繼續顯示輸入框，允許傳送 |
| `completed` | 諮詢已完成 | 隱藏輸入框，顯示「重新開始」按鈕 |

---

## SlotState 槽位說明

每輪回應的 `state` 物件反映瑤目前已蒐集到的需求。前端可用此資料顯示進度。

```typescript
interface SlotState {
  space: string | null;        // 使用空間
  mood: string | null;         // 情緒需求
  preferences: string[];       // 偏好香調（陣列）
  dislikes: string[];          // 地雷香調（陣列）
  occasion: string | null;     // 使用場合
  budget: string | null;       // 預算範圍
}
```

### 槽位可能的值

| 槽位 | 可能值（參考）|
|---|---|
| `space` | 居家、辦公室、車內、贈禮 |
| `mood` | 放鬆、提神、助眠、浪漫、其他 |
| `preferences` | 木質、花香、柑橘、東方、海洋、草本 |
| `dislikes` | 任何使用者明確排斥的香調 |
| `occasion` | 日常、冥想、睡前、工作、約會、節日 |
| `budget` | 親民、中等、精品 |

> 注意：這些值由 AI 自由填入，不是嚴格 enum，顯示時建議直接用字串呈現。

### 進度計算

可用已填槽位數量計算諮詢進度（總共 6 個維度）：

```typescript
function calcProgress(state: SlotState): number {
  const filled = [
    state.space,
    state.mood,
    state.preferences.length > 0 ? "filled" : null,
    state.dislikes.length > 0 ? "filled" : null,
    state.occasion,
    state.budget,
  ].filter(Boolean).length;
  return Math.round((filled / 6) * 100); // 回傳 0–100
}
```

---

## 錯誤處理

| HTTP 狀態 | 原因 | 建議前端行動 |
|---|---|---|
| 400 | 缺少必填欄位 | 顯示「請輸入訊息」，不應發生於正常流程 |
| 409 | Session 已完成，無法繼續 | 提示使用者開啟新諮詢 |
| 500 | 伺服器設定錯誤 | 顯示通用錯誤訊息 |
| 502 | AI 服務（Gemini）異常 | 提示「稍後再試」，可設計 retry |

### 錯誤回應格式

```json
{
  "error": "This session has already been completed",
  "state": { ... }
}
```

---

## UI 設計建議

### 對話介面

- **AI 角色名稱**：顯示為「瑤」，配合品牌「煖意香氛」
- **打字動畫**：等待 API 回應時，顯示打字中效果（三點動畫）
- **訊息泡泡**：左側為瑤（AI），右側為使用者，符合通訊軟體習慣
- **換行處理**：`reply` 可能包含 `\n`，請用 CSS `white-space: pre-wrap` 或前端換行解析

### 進度指示（選用）

可在頂部或側邊以圖示或進度條呈現 6 個槽位的填充情況：

```
[ 空間 ✓ ] [ 心情 ✓ ] [ 香調 · ] [ 地雷 · ] [ 場合 ✓ ] [ 預算 · ]
```

### 完成狀態

當 `status === "completed"`：
1. 停用輸入框（或完全隱藏）
2. 顯示感謝訊息，例如「很高興能幫你找到屬於你的氣息 ✨」
3. 提供「開始新的諮詢」按鈕，按下時產生新 `sessionId`

---

## 完整範例程式碼

以下為 TypeScript / React 的整合範例。

### 型別定義

```typescript
interface SlotState {
  space: string | null;
  mood: string | null;
  preferences: string[];
  dislikes: string[];
  occasion: string | null;
  budget: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ApiResponse {
  reply: string;
  state: SlotState;
  status: "active" | "completed";
}

interface ApiError {
  error: string;
  state?: SlotState;
}
```

### API 呼叫函式

```typescript
const API_BASE = "https://<your-project-ref>.supabase.co";

async function sendMessage(
  userId: string,
  sessionId: string,
  message: string
): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/functions/v1/fragrance-advisor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, sessionId, message }),
  });

  if (!res.ok) {
    const err: ApiError = await res.json();
    // 409：session 已結束
    if (res.status === 409) {
      throw new Error("SESSION_COMPLETED");
    }
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}
```

### React Hook 範例

```typescript
import { useState, useCallback } from "react";

function useNuvayaeChat(userId: string) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<SlotState | null>(null);
  const [status, setStatus] = useState<"active" | "completed">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      if (status === "completed" || loading) return;

      setLoading(true);
      setError(null);

      // 立即在 UI 顯示使用者訊息
      setMessages((prev) => [...prev, { role: "user", content: text }]);

      try {
        const res = await sendMessage(userId, sessionId, text);

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.reply },
        ]);
        setState(res.state);
        setStatus(res.status);
      } catch (err) {
        if (err instanceof Error && err.message === "SESSION_COMPLETED") {
          setStatus("completed");
        } else {
          setError("系統暫時無法回應，請稍後再試。");
          // 移除剛才加入的使用者訊息（回滾）
          setMessages((prev) => prev.slice(0, -1));
        }
      } finally {
        setLoading(false);
      }
    },
    [userId, sessionId, status, loading]
  );

  const restart = useCallback(() => {
    // 重新整理頁面，或讓上層元件重新掛載此 hook（產生新 sessionId）
    window.location.reload();
  }, []);

  return { messages, state, status, loading, error, send, restart };
}
```



---

## FAQ

**Q：`userId` 要傳什麼？**
任何能唯一識別這個使用者的字串。若整合 LINE，傳 LINE UID；若是 Web 匿名用戶，可用 `localStorage` 存一個自產的 UUID。

**Q：同一個 `userId` 可以有多個 session 嗎？**
可以。每個 `sessionId` 都是獨立的諮詢。只要產生新的 UUID 就是全新的諮詢。

**Q：`reply` 有最大長度限制嗎？**
AI 最多輸出 2048 tokens。正常對話回覆不會超過 300–400 字。

**Q：對話輪數有上限嗎？**
沒有硬性限制。但隨著對話輪數增加，API 呼叫的處理時間可能略微增加。一般諮詢在 4–8 輪內完成。

**Q：如何偵測 session 已完成？**
判斷每輪回應的 `status === "completed"` 即可。
