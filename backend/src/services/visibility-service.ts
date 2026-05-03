import type { VisibilityCheckSet } from "@xhc/shared";

interface ShadowbanApiResponse {
  profile?: {
    exists?: boolean;
  };
  tests?: {
    ghost?: boolean;
    more_replies?: boolean;
    search?: boolean;
    typeahead?: boolean;
  };
  region?: string;
}

const SHADOWBAN_API_BASE_URL = "https://hisubway.online/shadowban/test";

function toCheck(
  ok: boolean | undefined,
  passLabel: string,
  failLabel: string,
  reason: string
) {
  if (ok === true) {
    return {
      status: "pass" as const,
      checked: true,
      label: passLabel
    };
  }

  if (ok === false) {
    return {
      status: "fail" as const,
      checked: true,
      label: failLabel,
      reason
    };
  }

  return {
    status: "unknown" as const,
    checked: false,
    label: "Unable to verify this visibility signal.",
    reason: "upstream_missing_signal"
  };
}

export async function getVisibility(handle: string): Promise<VisibilityCheckSet> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `${SHADOWBAN_API_BASE_URL}?username=${encodeURIComponent(handle)}`,
      {
        signal: controller.signal,
        headers: {
          accept: "application/json, text/plain, */*"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Visibility upstream returned ${response.status}`);
    }

    const payload = (await response.json()) as ShadowbanApiResponse;
    const tests = payload.tests ?? {};

    return {
      searchSuggestionBan: toCheck(
        tests.typeahead,
        "No search suggestion ban detected",
        "Search suggestion ban likely detected",
        "search_suggestion_ban_detected"
      ),
      searchBan: toCheck(
        tests.search,
        "No search ban detected",
        "Search ban likely detected",
        "search_ban_detected"
      ),
      ghostBan: toCheck(
        tests.ghost,
        "No ghost ban detected",
        "Ghost ban likely detected",
        "ghost_ban_detected"
      ),
      replyDeboosting: toCheck(
        tests.more_replies,
        "No reply deboosting detected",
        "Reply deboosting likely detected",
        "reply_deboosting_detected"
      )
    };
  } catch (error) {
    return {
      searchSuggestionBan: {
        status: "unknown",
        checked: false,
        label: "Visibility provider unavailable",
        reason: error instanceof Error ? error.message : "visibility_upstream_error"
      },
      searchBan: {
        status: "unknown",
        checked: false,
        label: "Visibility provider unavailable",
        reason: error instanceof Error ? error.message : "visibility_upstream_error"
      },
      ghostBan: {
        status: "unknown",
        checked: false,
        label: "Visibility provider unavailable",
        reason: error instanceof Error ? error.message : "visibility_upstream_error"
      },
      replyDeboosting: {
        status: "unknown",
        checked: false,
        label: "Visibility provider unavailable",
        reason: error instanceof Error ? error.message : "visibility_upstream_error"
      }
    };
  } finally {
    clearTimeout(timeout);
  }
}
