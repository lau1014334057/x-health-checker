# X Health Checker

X Health Checker is a Chrome extension and backend service for inspecting public account-level health and visibility signals for X accounts.

The extension provides:

- a floating panel on `x.com` and `twitter.com`
- popup and side panel views
- X profile handle detection
- account health checks through a backend API
- local storage for recent check results

## Repository Structure

- `extension`: Chrome extension frontend
- `backend`: API server for score and visibility checks
- `shared`: shared TypeScript contracts
- `docs`: product and technical notes

## Current Status

This repository is prepared for open-source development, but it is not ready for public store release until you configure a production HTTPS backend.

The development extension currently calls:

```text
http://localhost:8787
```

Before publishing to Chrome Web Store, update [extension/src/shared/config.ts](extension/src/shared/config.ts) and remove local-only host permissions from [extension/manifest.json](extension/manifest.json).

## Requirements

- Node.js 20+
- npm
- Chrome or another Chromium-based browser for local extension testing

## Local Development

Install dependencies:

```bash
npm install --ignore-scripts
```

Build all packages:

```bash
npm run build
```

Start the backend:

```bash
npm --workspace backend run start
```

Build the extension:

```bash
npm run build:extension
```

Load the extension locally:

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select `extension/dist`
5. Open or refresh `https://x.com`

## Configuration

The extension API base URL is defined in:

```text
extension/src/shared/config.ts
```

For production, set it to your deployed HTTPS backend, for example:

```ts
export const API_BASE_URL = "https://api.example.com";
```

Then update `extension/manifest.json` host permissions to include that API host and remove local development permissions.

Backend environment variables are documented in [.env.example](.env.example).

## Checks

```bash
npm run typecheck
npm run build
```

## Publishing

See [CHROME_STORE.md](CHROME_STORE.md) for a Chrome Web Store checklist.

## Privacy

See [PRIVACY.md](PRIVACY.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
