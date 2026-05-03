import type { AccountHealthResult } from "@xhc/shared";
import { API_BASE_URL } from "./config.js";

export async function fetchHealth(handle: string, refresh = false): Promise<AccountHealthResult> {
  const normalized = handle.replace(/^@/, "").trim().toLowerCase();
  const response = await fetch(
    `${API_BASE_URL}/v1/accounts/${encodeURIComponent(normalized)}/health?refresh=${String(refresh)}`
  );

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return (await response.json()) as AccountHealthResult;
}
