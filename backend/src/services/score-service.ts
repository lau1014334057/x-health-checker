import type { AccountProfile, HealthScore } from "@xhc/shared";

interface TweepCredApiResponse {
  success?: number;
  profile?: {
    screen_name?: string;
    name?: string;
    profile_image_url_https?: string;
  };
  score?: number;
  grade?: "low" | "medium" | "high";
  distributionEstimate?: string;
}

export interface ScoreLookupResult {
  profile: AccountProfile;
  healthScore: HealthScore;
}

const TWEEPCRED_API_BASE_URL = "https://tools.tweethunter.io/api/tweepcred-lookup";

function buildFallbackProfile(handle: string): AccountProfile {
  return {
    handle,
    name: `@${handle}`,
    avatarUrl: `https://unavatar.io/x/${handle}`,
    lastSeenAt: new Date().toISOString()
  };
}

export async function getScore(handle: string): Promise<ScoreLookupResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${TWEEPCRED_API_BASE_URL}?handle=${encodeURIComponent(handle)}`, {
      signal: controller.signal,
      headers: {
        accept: "application/json, text/plain, */*"
      }
    });

    if (!response.ok) {
      throw new Error(`TweepCred upstream returned ${response.status}`);
    }

    const payload = (await response.json()) as TweepCredApiResponse;

    if (!payload.success || typeof payload.score !== "number") {
      throw new Error("TweepCred upstream returned an incomplete score payload");
    }

    return {
      profile: {
        handle: payload.profile?.screen_name?.toLowerCase() ?? handle,
        name: payload.profile?.name ?? `@${handle}`,
        avatarUrl: payload.profile?.profile_image_url_https,
        lastSeenAt: new Date().toISOString()
      },
      healthScore: {
        score: payload.score,
        grade: payload.grade ?? "low",
        distributionEstimate: payload.distributionEstimate ?? "",
        factors: []
      }
    };
  } catch (error) {
    const fallbackProfile = buildFallbackProfile(handle);

    return {
      profile: fallbackProfile,
      healthScore: {
        score: 0,
        grade: "low",
        distributionEstimate:
          error instanceof Error
            ? `TweepCred score unavailable: ${error.message}`
            : "TweepCred score unavailable",
        factors: []
      }
    };
  } finally {
    clearTimeout(timeout);
  }
}
