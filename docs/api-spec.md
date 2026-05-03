# API Specification

## Overview

The extension should talk only to your backend. The backend can then use one or more upstream sources. This contract is designed to stay stable even if the providers change.

Base URL example:

`https://api.yourdomain.com`

## Conventions

- All responses are JSON
- Timestamps are ISO 8601 UTC strings
- Handle values are lowercase without `@`
- Errors use a consistent envelope

## Authentication

### MVP

No user authentication required for basic checks.

### V2

Add API keys, session auth, or signed extension tokens for:

- higher rate limits
- cloud history
- team features

## Endpoints

### 1. Health check aggregate

`GET /v1/accounts/:handle/health`

Returns the merged result used by the extension UI.

#### Query params

- `refresh`
  - optional boolean
  - `true` bypasses backend cache when allowed

- `includeHistory`
  - optional boolean
  - `true` returns recent checks if cloud mode is enabled

#### Example request

`GET /v1/accounts/elonmusk/health?refresh=false`

#### Example response

```json
{
  "handle": "elonmusk",
  "profile": {
    "name": "Elon Musk",
    "avatarUrl": "https://pbs.twimg.com/profile_images/example.jpg"
  },
  "healthScore": {
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
  },
  "visibility": {
    "searchSuggestionBan": {
      "status": "pass",
      "label": "No search suggestion ban detected"
    },
    "searchBan": {
      "status": "pass",
      "label": "No search ban detected"
    },
    "ghostBan": {
      "status": "pass",
      "label": "No ghost ban detected"
    },
    "replyDeboosting": {
      "status": "unknown",
      "label": "Unable to verify reply visibility"
    }
  },
  "recommendations": [
    "Post consistently to improve activity signals.",
    "Aim for more replies, not only likes."
  ],
  "meta": {
    "checkedAt": "2026-05-03T10:00:00Z",
    "cache": {
      "hit": true,
      "ttlSeconds": 3312
    },
    "sources": {
      "score": "internal_scoring_v1",
      "visibility": "visibility_provider_a"
    },
    "partial": false
  }
}
```

### 2. Score only

`GET /v1/accounts/:handle/score`

Used when you want to isolate the scoring subsystem.

#### Response

```json
{
  "handle": "elonmusk",
  "profile": {
    "name": "Elon Musk",
    "avatarUrl": "https://pbs.twimg.com/profile_images/example.jpg"
  },
  "healthScore": {
    "score": 69,
    "grade": "medium",
    "distributionEstimate": "eligible_for_full_distribution",
    "factors": []
  },
  "meta": {
    "checkedAt": "2026-05-03T10:00:00Z",
    "cache": {
      "hit": false,
      "ttlSeconds": 0
    },
    "source": "internal_scoring_v1"
  }
}
```

### 3. Visibility only

`GET /v1/accounts/:handle/visibility`

Returns normalized visibility checks.

#### Response

```json
{
  "handle": "elonmusk",
  "visibility": {
    "searchSuggestionBan": {
      "status": "pass",
      "checked": true
    },
    "searchBan": {
      "status": "pass",
      "checked": true
    },
    "ghostBan": {
      "status": "fail",
      "checked": true
    },
    "replyDeboosting": {
      "status": "unknown",
      "checked": false,
      "reason": "no_eligible_reply_found"
    }
  },
  "meta": {
    "checkedAt": "2026-05-03T10:00:00Z",
    "cache": {
      "hit": false,
      "ttlSeconds": 0
    },
    "source": "visibility_provider_a"
  }
}
```

### 4. Manual scoring

`POST /v1/score/manual`

Used when the user enters account stats manually rather than looking up a public handle.

#### Request body

```json
{
  "followers": 1200,
  "following": 800,
  "accountAgeDays": 240,
  "isPremium": true,
  "premiumTier": "premium",
  "avgLikesPerTweet": 42,
  "avgRepliesPerTweet": 6,
  "tweetsPerWeek": 10,
  "useMobileApp": true
}
```

#### Response

```json
{
  "healthScore": {
    "score": 66,
    "grade": "medium",
    "distributionEstimate": "eligible_for_full_distribution",
    "factors": []
  },
  "recommendations": [
    "Increase reply volume and quality to strengthen engagement signals."
  ],
  "meta": {
    "checkedAt": "2026-05-03T10:00:00Z",
    "source": "internal_scoring_v1"
  }
}
```

### 5. History

`GET /v1/history`

Optional in MVP if you later move history into the backend.

#### Query params

- `handle`
- `limit`

## Error Envelope

All non-2xx responses should use:

```json
{
  "error": {
    "code": "UPSTREAM_UNAVAILABLE",
    "message": "Visibility provider temporarily unavailable.",
    "retryable": true
  },
  "meta": {
    "requestId": "req_123",
    "checkedAt": "2026-05-03T10:00:00Z"
  }
}
```

## Error Codes

- `INVALID_HANDLE`
- `ACCOUNT_NOT_FOUND`
- `UNSUPPORTED_ACCOUNT`
- `UPSTREAM_UNAVAILABLE`
- `UPSTREAM_RATE_LIMITED`
- `INTERNAL_ERROR`
- `INVALID_INPUT`

## Status Vocabulary

### Check result statuses

- `pass`
- `fail`
- `warning`
- `unknown`

### Score grades

- `low`
- `medium`
- `high`

### Factor statuses

- `good`
- `warning`
- `danger`

## Caching Rules

### Health aggregate

- backend may return cached result unless `refresh=true`

### Refresh constraints

- backend may ignore `refresh=true` if upstream provider cooldown rules apply
- response should include whether the result is fresh or cached

## Normalization Rules

1. Handles are lowercased
2. Strip leading `@`
3. Keep profile data optional
4. Convert upstream booleans into consistent named result objects
5. Preserve unknown rather than inventing a pass or fail

## Rate Limiting

Suggested initial policy:

- anonymous: 30 requests per hour per IP
- authenticated: higher tiered limits in V2

Return standard headers if possible:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Versioning

Use path versioning from day one:

- `/v1/...`

This keeps future source changes from breaking existing extension clients.
