# Acceptance and QA

## Acceptance Criteria

### AC1: Supported page detection

Given the user is on a supported X profile page, when the extension opens, then the current handle is detected and shown in the UI.

### AC2: Manual lookup

Given the user enters a valid handle manually, when they run a check, then the extension returns a result even if the current browser tab is not on a profile page.

### AC3: Score display

Given a successful score response, when the result screen renders, then the user sees:

1. score value
2. grade
3. factor breakdown
4. short recommendations

### AC4: Visibility display

Given a successful visibility response, when the result screen renders, then the user sees all four check categories and their normalized status.

### AC5: Partial result support

Given one subsystem fails and the other succeeds, when the result screen renders, then the user still sees the successful section plus a clear partial-failure message.

### AC6: History

Given a successful check completes, when the user opens recent results, then the latest result appears in history.

### AC7: Cache behavior

Given a fresh cached result exists, when the user opens the same account, then the extension loads the cached summary quickly and marks the last checked time.

## Manual QA Matrix

### Page detection tests

1. `https://x.com/{handle}`
2. `https://twitter.com/{handle}`
3. profile page after in-app SPA navigation
4. non-profile page such as home timeline
5. invalid handle path

Expected:

- detect only supported profile pages
- do not falsely label generic pages as account pages

### Check execution tests

1. valid well-known account
2. valid small account
3. non-existent account
4. rate-limited upstream simulation
5. upstream timeout simulation

Expected:

- valid accounts return structured results
- invalid accounts return clear errors
- timeout and provider issues degrade gracefully

### UI state tests

1. first load idle state
2. loading state
3. success state
4. partial success state
5. full error state
6. no current profile detected

### History tests

1. first successful write
2. multiple repeated checks on same account
3. maximum history size pruning
4. app restart persistence

## Functional Test Cases

### TC1: Detect handle from profile URL

Steps:

1. Open a supported X profile page.
2. Open the extension popup.

Expected:

- current handle is displayed

### TC2: Run a successful check

Steps:

1. Open a detected profile page.
2. Click `Run check`.

Expected:

- loading indicator appears
- score and visibility results render
- history entry is created

### TC3: Show cached result

Steps:

1. Run a check on a valid account.
2. Reopen the same account shortly after.

Expected:

- cached result appears quickly
- last checked time is shown

### TC4: Handle missing profile context

Steps:

1. Open a non-profile X page.
2. Open the popup.

Expected:

- user sees unsupported-page message
- manual lookup remains available if included

### TC5: Partial failure

Steps:

1. Simulate visibility provider failure.
2. Run a check.

Expected:

- score section renders
- visibility section shows unavailable or retry state
- result is marked partial

## Non-Functional Test Areas

### Performance

1. popup startup time
2. route-change detection time
3. API latency
4. cache response time

### Reliability

1. duplicate-click protection
2. background worker restart recovery
3. storage corruption tolerance

### Security and privacy

1. no unnecessary host permissions
2. no storage of sensitive auth data
3. only public account info retained in MVP

## Observability

Track at minimum:

1. request success rate
2. request latency
3. cache hit rate
4. upstream failure rate
5. unsupported-page frequency

## Release Checklist

1. Manifest permissions reviewed
2. API base URL configured per environment
3. Error states manually verified
4. History pruning verified
5. Extension package loads in clean Chrome profile
6. Basic branding and copy review complete
7. Privacy copy reviewed

## Known Edge Cases

1. X route changes without full page reload
2. handles with unusual page layouts
3. temporary provider false negatives
4. visibility checks that legitimately return unknown
5. accounts with insufficient public activity to test reply deboosting

## Go/No-Go Recommendation

Go if:

1. supported profile detection is stable
2. score and visibility pipelines both work end to end
3. partial-failure UX is understandable
4. no severe permission or privacy concerns remain

No-go if:

1. the extension frequently mis-detects handles
2. upstream provider instability makes results mostly unavailable
3. the UI implies certainty where the backend can only provide estimates
