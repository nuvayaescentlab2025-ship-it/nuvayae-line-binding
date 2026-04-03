# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start Vite dev server (localhost)
npm run build     # Build for production (output: dist/, with relative base path ./)
npm run preview   # Preview production build locally
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which builds the project and deploys the `dist/` folder to the `gh-pages` branch via GitHub Pages.

## Architecture

This is a single-page LINE LIFF (LINE Front-end Framework) app for the **煖意 (Nuvayae)** subscription membership binding system. There is no framework — the entire app is vanilla HTML/CSS/JS in three files:

- **`index.html`** — contains all application logic as a `<script type="module">` block
- **`style.css`** — all styles; brand color is `#be9f74` (gold)
- **`background.jpg`** — background image

### App Flow

1. **LIFF init** (`liff.init` with hardcoded `liffId`): if the user is not logged in, `liff.login()` is called immediately.
2. **Status check** (`checkSubscriptionStatus`): sends `GET ?userid=<lineUserId>` to the Google Apps Script (GAS) backend. Response shape: `{ isBound: boolean, duration: string, months: number }`.
   - If `isBound`: shows `#boundView` with a subscription progress card (out of 12 months).
   - If not bound: shows `#unboundView` with the binding form.
3. **Form submission** (`submitForm`): sends `POST` with `orderId`, `mobile`, `userid`, `displayName`, `pictureUrl` to the same GAS endpoint. On success (status 200), reloads the page to re-run the status check.

### Key Constants (hardcoded in `index.html`)

| Constant | Value |
|---|---|
| `API_URL` | Google Apps Script deployment URL |
| LIFF ID | `2009177086-5AGq54Qb` |
| Subscription total months | `12` |

### UI States

Three mutually exclusive views toggled via `.hidden` CSS class:
- `#loadingView` — shown on initial load
- `#unboundView` — binding form (order ID + mobile)
- `#boundView` — member dashboard with progress card and service links

SweetAlert2 is loaded via CDN for dialogs. LIFF SDK is also imported from CDN as an ESM module.


### 文件目錄（`docs/`）

`docs/` 目錄存放專案的技術說明文件，採用編號前綴命名（`NN-主題.md`），每份文件對應一個核心主題。新增文件時延續編號序列。

執行任務前應先掃描 `docs/` 目錄，了解現有文件清單與各自涵蓋範圍。

## 文件維護規範

**每次完成任務後，若程式碼異動涉及 `docs/` 中任何現有文件的涵蓋範圍，必須同步更新對應文件。** 判斷方式：

1. 讀取受影響的 `docs/*.md` 檔案標題與內容，確認異動是否落在其涵蓋範圍內
2. 若是，更新該文件使其與程式碼保持一致
3. 若異動涉及全新主題且不屬於任何現有文件，新增 `docs/NN-主題.md`

**新增模組時必須撰寫文件：** 每當新增獨立模組，須在 `docs/` 中新增或更新對應文件，說明其用途、介面及與現有模組的關係。

文件應與程式碼保持一致，不可僅更新程式碼而遺漏文件更新。

## 安全規範

**嚴禁將 `.env` 檔案提交至 git。** 任何包含真實金鑰或密碼的 `.env` 檔案絕對不可出現在 commit 或 push 中。僅允許提交 `.env.example`（不含真實值）。

## 工作流程
1.**git**: 記錄在 claude-flow/git-flow.md 檔案
2.**規劃流程**: 若使用者需要規畫需求時，規劃後須寫成規劃文件寫到plans目錄下儲存成md檔案
