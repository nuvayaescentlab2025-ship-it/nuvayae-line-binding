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
