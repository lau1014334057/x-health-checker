# Product Overview

## Product Name

- Working name: `X Health Checker`
- Category: Chrome extension for X/Twitter account health diagnostics

## Product Summary

`X Health Checker` helps creators, operators, and social growth teams diagnose whether an X account is healthy, distribution-ready, or likely restricted. It combines two categories of signals into one workflow:

- distribution health score
- visibility restriction detection

The product should feel faster and easier than copying a handle into multiple third-party websites.

## Problem Statement

Today, users who suspect an X account has reach issues typically need to:

1. open a scoring tool
2. open a separate shadowban checker
3. compare results manually
4. infer what to do next

This creates friction and lowers trust. The extension solves that by embedding diagnosis into the browsing workflow.

## Target Users

### Primary users

1. Individual creators
   Need to quickly understand why impressions or replies dropped.

2. Growth operators
   Need to check multiple accounts repeatedly and explain findings to stakeholders.

3. Agencies and consultants
   Need a reusable, client-facing diagnostic workflow.

### Secondary users

1. Founder-led marketing teams
2. Newsletter or community-led creators
3. X automation and analytics tool users

## User Jobs To Be Done

1. When my X performance drops, help me tell whether it is content-related or account-state-related.
2. When I view an account, let me see its health without leaving the page.
3. When I suspect a visibility penalty, show me what kind of restriction may be happening.
4. When I manage multiple accounts, let me compare and revisit prior results.

## Product Goals

1. Provide a one-click account health diagnosis inside the browser.
2. Convert technical test output into plain-language recommendations.
3. Reduce dependence on multiple manual tool lookups.
4. Build a product that can later grow into a subscription analytics workflow.

## Non-Goals For V1

1. Official certification of account state
2. Automated posting or account management
3. Bulk workspace collaboration
4. Cross-platform social support
5. Guaranteed root-cause attribution for every reach drop

## Value Proposition

The product offers:

- convenience: check from the X page itself
- clarity: combine score and restriction results in one place
- continuity: save history and compare changes
- actionability: provide suggested next steps, not just raw flags

## Core Features

### V1 MVP

1. Detect the current X handle from profile pages.
2. Trigger account health analysis from popup or side panel.
3. Show a composite health score with factor breakdown.
4. Show visibility test results for:
   - search suggestion ban
   - search ban
   - ghost ban
   - reply deboosting
5. Save recent results locally.
6. Present short recommendations.

### V1.5

1. Manual account lookup
2. Better trend display
3. Shareable result snapshot
4. Retry and refresh controls

### V2

1. Bulk lookup
2. Team account lists
3. Exportable reports
4. Alerts for health changes
5. Cloud sync

## Key User Flows

### Flow 1: Diagnose current account

1. User opens an X profile page.
2. Extension detects the handle.
3. User opens the extension and clicks `Run check`.
4. Backend or local calculators return results.
5. User sees score, restriction checks, and suggestions.

### Flow 2: Re-check an account later

1. User opens the extension.
2. User selects a recent account from history.
3. User views the last result and optionally refreshes.

### Flow 3: Compare accounts

1. User manually enters a handle.
2. User runs a check.
3. User compares score and visibility state with past checks.

## UX Principles

1. Show the current account context immediately.
2. Keep results readable in under 10 seconds.
3. Avoid claiming certainty when the signal is probabilistic.
4. Prefer clear language over technical jargon.
5. Make the extension useful before any sign-in requirement.

## Success Metrics

### Activation

1. Time to first successful check under 3 minutes after install
2. Successful handle detection rate above 90 percent on supported pages

### Engagement

1. Repeat usage within 7 days
2. More than one account checked per active user in operator-heavy cohorts

### Product quality

1. Failed check rate below 5 percent
2. Median check time under 8 seconds
3. Cached refresh response under 1 second

## Risks

1. Third-party data source instability
2. X UI changes breaking page detection
3. False confidence from non-official visibility signals
4. Commercial risk if too much value depends on outside endpoints

## Release Recommendation

Ship V1 as a lightweight diagnostic companion, not as a definitive enforcement oracle. The product copy should consistently frame results as estimated or observed signals.
