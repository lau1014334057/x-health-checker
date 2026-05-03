# Data Model

## Overview

The MVP can store user settings and check history locally in the extension. This document covers both the local-first MVP model and the cloud-ready model for later phases.

## Core Entities

### AccountProfile

Represents the public identity of an X account.

```json
{
  "handle": "elonmusk",
  "name": "Elon Musk",
  "avatarUrl": "https://pbs.twimg.com/profile_images/example.jpg",
  "lastSeenAt": "2026-05-03T10:00:00Z"
}
```

Fields:

- `handle`: string, primary identifier, lowercase, no `@`
- `name`: optional string
- `avatarUrl`: optional string
- `lastSeenAt`: ISO timestamp

### HealthScore

```json
{
  "score": 69,
  "grade": "medium",
  "distributionEstimate": "eligible_for_full_distribution",
  "factors": [
    {
      "key": "ratio",
      "label": "Follower / Following Ratio",
      "score": 18,
      "maxScore": 30,
      "status": "warning",
      "explanation": "The ratio is acceptable but can improve."
    }
  ]
}
```

### VisibilityCheckSet

```json
{
  "searchSuggestionBan": {
    "status": "pass",
    "checked": true,
    "label": "No search suggestion ban detected"
  },
  "searchBan": {
    "status": "pass",
    "checked": true,
    "label": "No search ban detected"
  },
  "ghostBan": {
    "status": "warning",
    "checked": true,
    "label": "Possible ghost ban signal"
  },
  "replyDeboosting": {
    "status": "unknown",
    "checked": false,
    "label": "Unable to verify"
  }
}
```

### Recommendation

Simple string list in MVP, structured items later.

```json
[
  "Post more consistently to improve activity signals.",
  "Focus on earning replies, not only likes."
]
```

### AccountHealthResult

Primary merged record used by the extension UI and history.

```json
{
  "handle": "elonmusk",
  "profile": {
    "handle": "elonmusk",
    "name": "Elon Musk",
    "avatarUrl": "https://pbs.twimg.com/profile_images/example.jpg",
    "lastSeenAt": "2026-05-03T10:00:00Z"
  },
  "healthScore": {
    "score": 69,
    "grade": "medium",
    "distributionEstimate": "eligible_for_full_distribution",
    "factors": []
  },
  "visibility": {},
  "recommendations": [],
  "meta": {
    "checkedAt": "2026-05-03T10:00:00Z",
    "partial": false,
    "cacheHit": true,
    "scoreSource": "internal_scoring_v1",
    "visibilitySource": "visibility_provider_a"
  }
}
```

## Extension Local Storage Model

Suggested keys for `chrome.storage.local`:

### `settings`

```json
{
  "apiBaseUrl": "https://api.yourdomain.com",
  "cacheTtlMinutes": 60,
  "historyEnabled": true,
  "maxHistoryItems": 50,
  "theme": "system"
}
```

### `currentContext`

```json
{
  "tabId": 123,
  "url": "https://x.com/elonmusk",
  "handle": "elonmusk",
  "detectedAt": "2026-05-03T10:00:00Z"
}
```

### `resultByHandle`

Dictionary keyed by handle:

```json
{
  "elonmusk": {
    "handle": "elonmusk",
    "profile": {},
    "healthScore": {},
    "visibility": {},
    "recommendations": [],
    "meta": {}
  }
}
```

### `history`

Append-only latest-first list:

```json
[
  {
    "handle": "elonmusk",
    "checkedAt": "2026-05-03T10:00:00Z",
    "score": 69,
    "grade": "medium",
    "restrictionSummary": "clear"
  }
]
```

### `inflight`

Optional ephemeral state to avoid duplicate requests across UI surfaces.

```json
{
  "elonmusk": {
    "requestedAt": "2026-05-03T10:00:00Z"
  }
}
```

## Suggested TypeScript Interfaces

```ts
export interface AccountProfile {
  handle: string;
  name?: string;
  avatarUrl?: string;
  lastSeenAt?: string;
}

export interface ScoreFactor {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  status: "good" | "warning" | "danger";
  explanation: string;
}

export interface HealthScore {
  score: number;
  grade: "low" | "medium" | "high";
  distributionEstimate: string;
  factors: ScoreFactor[];
}

export interface VisibilityCheck {
  status: "pass" | "fail" | "warning" | "unknown";
  checked: boolean;
  label?: string;
  reason?: string;
}

export interface VisibilityCheckSet {
  searchSuggestionBan: VisibilityCheck;
  searchBan: VisibilityCheck;
  ghostBan: VisibilityCheck;
  replyDeboosting: VisibilityCheck;
}

export interface AccountHealthMeta {
  checkedAt: string;
  partial: boolean;
  cacheHit: boolean;
  scoreSource?: string;
  visibilitySource?: string;
}

export interface AccountHealthResult {
  handle: string;
  profile?: AccountProfile;
  healthScore?: HealthScore;
  visibility?: VisibilityCheckSet;
  recommendations: string[];
  meta: AccountHealthMeta;
}
```

## Cloud Data Model For V2

### `users`

- `id`
- `email`
- `created_at`
- `plan`

### `accounts`

- `id`
- `handle`
- `display_name`
- `avatar_url`
- `created_at`
- `updated_at`

### `health_checks`

- `id`
- `user_id`
- `account_id`
- `score`
- `grade`
- `distribution_estimate`
- `visibility_payload`
- `recommendations_payload`
- `score_source`
- `visibility_source`
- `partial`
- `checked_at`

### `watchlists`

- `id`
- `user_id`
- `name`

### `watchlist_accounts`

- `watchlist_id`
- `account_id`

## Retention Guidance

### MVP local mode

- keep only the latest 50 to 100 history rows
- prune on write

### Backend mode

- raw upstream payloads: retain short-term only if needed for debugging
- normalized health results: retain according to product plan

## Migration Guidance

When evolving storage:

1. include a local schema version
2. write one-way migration scripts
3. tolerate missing optional fields

Suggested key:

```json
{
  "schemaVersion": 1
}
```
