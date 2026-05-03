# X Health Checker

Monorepo scaffold for the `X Health Checker` MVP.

## Packages

- `extension`: Chrome extension frontend
- `backend`: API server for score and visibility checks
- `shared`: shared TypeScript contracts

## Status

This repository currently contains a runnable MVP scaffold:

- extension entry points
- X profile detection logic
- popup and side panel UI shell
- backend API routes
- mock score and visibility services
- extension build output

## Local run

1. Install dependencies:
   `npm install --ignore-scripts`

2. Build shared types, backend, and extension:
   `npm run build:shared`
   `npm run build:backend`
   `npm run build:extension`

3. Start the backend:
   `npm --workspace backend run start`

4. Load the extension into Chrome:
   Open `chrome://extensions`
   Enable `Developer mode`
   Click `Load unpacked`
   Select:
   `C:\Users\Administrator\Documents\Codex\2026-05-03\new-chat-2\extension\dist`

## Next steps

1. replace mock services with real providers
2. add manual lookup in the popup
3. improve side panel detail rendering
4. add cache freshness and retry states
