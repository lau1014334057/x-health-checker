# Development Plan

## Objective

Deliver a usable MVP of the `X Health Checker` Chrome extension with a backend-backed diagnostic pipeline.

## Team Assumption

This plan assumes:

1. 1 frontend-leaning engineer
2. 1 backend-leaning engineer
3. shared product and QA ownership

It can also be executed by one full-stack builder with a longer timeline.

## Milestones

### Milestone 0: Alignment and setup

Estimated time:

- 0.5 to 1 day

Deliverables:

- final scope confirmation
- repo setup
- dev environments
- basic design references

Tasks:

1. confirm MVP boundaries
2. choose extension build tool
3. choose backend framework
4. create mono-repo or split repo structure
5. define environment variables

### Milestone 1: Extension shell

Estimated time:

- 1 to 2 days

Deliverables:

- manifest
- popup scaffold
- side panel scaffold
- background worker scaffold
- content script scaffold

Tasks:

1. create extension folder structure
2. register popup and side panel
3. wire messaging between UI and background
4. add storage helpers
5. verify local load in Chrome

### Milestone 2: X page detection

Estimated time:

- 1 day

Deliverables:

- reliable handle detection on supported profile pages

Tasks:

1. parse profile handle from URL
2. add SPA route-change detection
3. add DOM fallback for edge cases
4. send context updates to background
5. show current handle in popup

### Milestone 3: Backend API skeleton

Estimated time:

- 1 to 2 days

Deliverables:

- `/v1/accounts/:handle/health`
- `/v1/accounts/:handle/score`
- `/v1/accounts/:handle/visibility`

Tasks:

1. create backend app structure
2. add route validation
3. add error envelope
4. add cache abstraction
5. add health endpoint

### Milestone 4: Scoring subsystem

Estimated time:

- 1 to 2 days

Deliverables:

- normalized score response
- factor breakdown
- recommendation generation

Tasks:

1. define scoring formula service
2. normalize score grades
3. add factor explanation text
4. support manual scoring payload
5. add unit tests

### Milestone 5: Visibility subsystem

Estimated time:

- 2 to 3 days

Deliverables:

- normalized visibility response
- partial failure handling

Tasks:

1. integrate first upstream visibility provider
2. map provider response to normalized model
3. implement timeout and retry rules
4. implement cache TTL
5. add source metadata

### Milestone 6: UI integration

Estimated time:

- 2 to 3 days

Deliverables:

- end-to-end account check flow
- summary and detailed result rendering

Tasks:

1. trigger checks from popup
2. render side panel details
3. implement loading and partial states
4. save result to local history
5. add refresh action

### Milestone 7: Polish and QA

Estimated time:

- 1 to 2 days

Deliverables:

- stable MVP build
- QA checklist complete
- release candidate package

Tasks:

1. add empty and error states
2. test unsupported pages
3. verify storage pruning
4. optimize latency and caching
5. prepare release notes

## Suggested Timeline

### Fast solo build

- Week 1:
  - milestones 0 to 3
- Week 2:
  - milestones 4 to 7

### Small team build

- Week 1:
  - frontend works on milestones 1, 2
  - backend works on milestones 3, 4
- Week 2:
  - backend finishes milestone 5
  - frontend completes milestone 6
  - both share milestone 7

## Ownership Split Suggestion

### Frontend owner

1. extension scaffold
2. handle detection
3. popup and side panel UI
4. local storage history
5. browser packaging

### Backend owner

1. API routes
2. scoring service
3. visibility provider integration
4. cache strategy
5. error handling and telemetry

## Dependencies

### External

1. Chrome extension dev environment
2. backend hosting choice
3. upstream provider availability

### Internal

1. API contract must stabilize before final UI binding
2. handle detection should complete before end-to-end testing
3. score and visibility normalization should finish before history formatting

## Definition of Done For MVP

1. Extension loads locally without manifest errors.
2. Popup shows detected account on supported X profile pages.
3. User can run a check and receive:
   - score
   - visibility results
   - recommendations
4. Partial failure is handled gracefully.
5. Latest checks are saved and viewable.
6. Basic QA checklist passes.

## Technical Debt To Accept In MVP

1. single visibility provider
2. basic styling over polished brand system
3. local-only history
4. no user authentication

## Follow-Up Backlog

1. multi-provider fallback
2. account comparison view
3. trend visualization
4. export/share
5. cloud sync
6. usage analytics

## Risk Mitigation Tasks

1. create source adapter interface early
2. isolate normalization logic from upstream payload shapes
3. add feature flags for visibility provider rollout
4. keep result labels editable without code-heavy rewrites
