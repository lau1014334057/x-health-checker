import type { AccountProfile, HealthScore, VisibilityCheckSet } from "@xhc/shared";

export function buildMockProfile(handle: string): AccountProfile {
  return {
    handle,
    name: `@${handle}`,
    avatarUrl: `https://unavatar.io/x/${handle}`,
    lastSeenAt: new Date().toISOString()
  };
}

export function buildMockScore(handle: string): HealthScore {
  const seed = handle.length;
  const score = Math.max(42, Math.min(78, 50 + seed * 2));

  return {
    score,
    grade: score >= 70 ? "high" : score >= 55 ? "medium" : "low",
    distributionEstimate:
      score >= 65 ? "eligible_for_full_distribution" : "limited_candidate_distribution",
    factors: [
      {
        key: "ratio",
        label: "Follower / Following Ratio",
        score: Math.min(30, 12 + seed),
        maxScore: 30,
        status: seed > 10 ? "good" : "warning",
        explanation: "This MVP uses a placeholder ratio estimate and should be replaced with real account stats."
      },
      {
        key: "accountAge",
        label: "Account Age",
        score: 12,
        maxScore: 15,
        status: "good",
        explanation: "Older accounts generally receive a stronger trust baseline."
      },
      {
        key: "engagement",
        label: "Engagement Quality",
        score: 18,
        maxScore: 25,
        status: "warning",
        explanation: "Reply quality and consistent interaction remain the main lift opportunities."
      }
    ]
  };
}

export function buildMockVisibility(handle: string): VisibilityCheckSet {
  const suspicious = handle.includes("ban") || handle.includes("test");

  return {
    searchSuggestionBan: {
      status: suspicious ? "warning" : "pass",
      checked: true,
      label: suspicious ? "Possible search suggestion suppression" : "No search suggestion ban detected"
    },
    searchBan: {
      status: "pass",
      checked: true,
      label: "No search ban detected"
    },
    ghostBan: {
      status: suspicious ? "warning" : "pass",
      checked: true,
      label: suspicious ? "Possible ghost ban signal" : "No ghost ban detected"
    },
    replyDeboosting: {
      status: "unknown",
      checked: false,
      label: "Reply deboosting not yet verified in mock mode",
      reason: "mock_provider"
    }
  };
}
