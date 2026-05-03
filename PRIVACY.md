# Privacy Policy

Last updated: 2026-05-03

X Health Checker helps users inspect public account-level signals for X accounts.

## Data the extension uses

- Current tab URL on `x.com` and `twitter.com`, used to detect the visible X account handle.
- Manually entered X account handles.
- Health check results returned by the configured backend API.
- Local extension storage for the latest account context and recent health check results.

## Data sent to the backend

When a user runs a check, the extension sends the requested X handle to the configured backend API. The current development build points to `http://localhost:8787`; production builds must use your own HTTPS API endpoint.

## Data not collected by the extension

The extension does not intentionally collect passwords, private messages, browser history outside the declared X/Twitter pages, payment information, or authentication cookies.

## Data sharing

The open-source project does not include third-party analytics or advertising code. If you deploy a hosted backend, document any infrastructure providers, logging, retention, and third-party APIs used by that deployment.

## User control

Users can close the floating panel with the close button. Users can remove stored extension data from Chrome extension settings or by uninstalling the extension.

## Contact

Before publishing, replace this section with your support email or project issue tracker URL.
