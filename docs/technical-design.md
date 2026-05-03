# Technical Design

## Overview

The recommended architecture is a Chrome extension frontend with an optional backend aggregation service. This avoids putting unstable third-party dependencies directly into the user-facing extension while still allowing a fast MVP.

## Architecture Summary

### Extension layer

1. `content script`
   - detects the current X handle
   - optionally injects an inline `Check health` button
   - notifies the background worker about page context changes

2. `background service worker`
   - owns request orchestration
   - manages cache and storage
   - handles retries, rate limiting, and API fallback rules

3. `popup`
   - lightweight quick-action surface
   - shows current handle and latest summary

4. `side panel`
   - full result view
   - factor breakdown, restriction cards, history, and recommendations

5. `options page`
   - backend URL configuration
   - environment toggles
   - privacy and data retention settings

### Backend layer

1. `API gateway / app server`
   - single stable contract for the extension
   - hides third-party upstream complexity

2. `scoring service`
   - computes health score locally from normalized inputs
   - may optionally enrich profile data from upstream sources

3. `visibility service`
   - proxies or reproduces visibility detection logic
   - returns normalized flags and metadata

4. `cache`
   - memoizes repeated checks
   - reduces latency and upstream dependence

5. `telemetry`
   - captures errors, latency, cache hit rate, and source failures

## Why Backend-Assisted Is Preferred

### Pure extension drawbacks

1. unstable third-party endpoints may break the shipped extension
2. CORS policies may block direct calls
3. secret rotation and source switching become difficult
4. rate limiting becomes harder to control

### Backend-assisted benefits

1. one stable API contract for the extension
2. centralized retries and caching
3. easier source replacement
4. easier future commercialization

## Recommended Tech Stack

### Extension

- Manifest V3
- TypeScript
- React for popup and side panel
- Vite or Plasmo for build tooling
- `chrome.storage.local` for local persistence
- `chrome.sidePanel` when available

### Backend

- Node.js with Fastify, Express, or Next.js route handlers
- TypeScript
- Redis or Upstash for short-lived cache
- Postgres for cloud history in V2
- hosted on Vercel, Railway, Fly.io, or similar

## Browser Permissions

Minimum recommended permissions:

- `storage`
- `tabs`
- `activeTab`
- `scripting`
- `sidePanel`

Host permissions:

- `https://x.com/*`
- `https://twitter.com/*`
- backend API domain

Avoid broad permissions beyond supported X domains and your own API domain.

## Extension Runtime Flow

### Flow A: Automatic page detection

1. User opens an X profile.
2. Content script reads the URL and page DOM.
3. Content script extracts `handle`, `displayName`, and optional profile metadata.
4. Context is sent to the background worker.
5. Popup or side panel can request latest context at any time.

### Flow B: Run health check

1. User clicks `Run check`.
2. Popup or side panel sends `RUN_ACCOUNT_CHECK` to the background worker.
3. Background checks local cache freshness.
4. If cache is fresh, return cached result immediately.
5. If cache is stale or missing:
   - request backend score
   - request backend visibility analysis
   - normalize and merge results
   - persist locally
   - return to UI

### Flow C: Manual lookup

1. User enters a handle.
2. UI validates and normalizes it.
3. Background executes same pipeline as auto-detected flow.

## Module Breakdown

### Content script

Responsibilities:

- detect whether the current page is a user profile page
- parse handle from URL first
- use DOM as fallback
- watch SPA route changes on X

Suggested strategy:

1. Primary source: pathname parsing
2. Secondary source: user header DOM
3. Re-run on `popstate`, history mutation, or DOM route updates

### Background worker

Responsibilities:

- request orchestration
- de-duplication for concurrent checks on the same handle
- local cache reads and writes
- storage migrations
- analytics events if enabled

### UI layer

Popup should show:

1. current account
2. run check
3. summary score
4. recent status

Side panel should show:

1. account identity card
2. composite health score
3. factor cards
4. visibility cards
5. recommendations
6. prior check list

## Scoring Engine Strategy

### MVP approach

Compute the score locally in backend code from normalized inputs. This reduces long-term dependence on a single third-party score API.

Inputs may include:

- followers
- following
- account age
- premium tier if inferable or manually supplied
- average likes
- average replies
- tweets per week
- mobile app usage flag if supported

### Scoring outputs

- `score`
- `grade`
- `distributionEstimate`
- `factors[]`
- `recommendations[]`

## Visibility Detection Strategy

### MVP approach

Treat visibility checks as server-side tasks. The backend either:

1. proxies a compatible third-party result source, or
2. gradually reproduces the tests independently

### Why server-side

1. some checks depend on logged-out or neutral views
2. reply visibility checks may require controlled retrieval conditions
3. extension-only logic would be fragile and inconsistent

## Caching Strategy

### Local extension cache

Use `chrome.storage.local` for:

- latest result per handle
- recent check history
- user settings

### Backend cache

Use short TTLs:

- score cache: 1 to 12 hours depending on source freshness
- visibility cache: 15 minutes to 12 hours depending on signal type

Recommended first TTL:

- score: 6 hours
- visibility: 1 hour

## Error Handling

User-facing states:

1. success
2. partial success
3. temporarily unavailable
4. rate limited
5. unsupported page

Rules:

1. show partial results when only one subsystem succeeds
2. never block cached results because live refresh failed
3. surface timestamp and source freshness

## Security and Privacy

### Principles

1. store the least amount of user data needed
2. do not collect login cookies or private account data
3. make history opt-out in settings
4. avoid storing raw upstream payloads longer than necessary

### Sensitive boundaries

The extension should analyze public handles and public signals only in V1. No posting, messaging, or account manipulation should be in scope.

## Performance Targets

1. popup open time under 300 ms
2. cached result render under 1 s
3. uncached total check under 8 s median
4. handle detection under 500 ms after route change

## Future-Proofing

Plan for:

1. alternate data providers
2. V2 user accounts and cloud history
3. feature flags
4. batch operations via backend jobs

## Suggested Repo Structure

```text
/
  extension/
    src/
      background/
      content/
      popup/
      sidepanel/
      options/
      shared/
    manifest.json
  backend/
    src/
      routes/
      services/
      providers/
      cache/
      models/
      utils/
  docs/
```
