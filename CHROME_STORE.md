# Chrome Web Store Publishing Checklist

## Before Upload

- Replace `extension/src/shared/config.ts` with your production HTTPS API base URL.
- Remove `http://localhost:8787/*` from `extension/manifest.json` host permissions for the store build, unless you are intentionally publishing a local-development build.
- Confirm the floating panel only injects on `https://x.com/*` and `https://twitter.com/*`.
- Build the extension with `npm run build:extension`.
- Zip the contents of `extension/dist`, not the `extension` folder itself.

## Store Listing Draft

Single purpose:

> X Health Checker helps users inspect public account-level health and visibility signals for X accounts while browsing X.

Short description:

> Check public X account health signals, visibility indicators, and practical optimization suggestions.

Permission explanations:

- `storage`: stores the current detected account and recent check results locally.
- `tabs`: detects the active X/Twitter page and account URL.
- `sidePanel`: provides the optional browser side panel report view.
- Host permissions for `x.com` and `twitter.com`: detect visible X account handles and show the floating panel on X pages.
- Backend API host permission: requests account health results from the configured API.

Privacy disclosure:

- The extension reads the current X/Twitter URL to detect public account handles.
- The extension sends the requested handle to the configured backend only when the user runs a check.
- Recent results are stored locally in Chrome extension storage.

## Required Assets

- 128x128 extension icon
- Chrome Web Store screenshots
- Privacy policy URL
- Support email or support URL

## Final Review

- Run `npm run typecheck`.
- Run `npm run build`.
- Load `extension/dist` locally and test on `https://x.com`.
- Verify the backend is available over HTTPS.
