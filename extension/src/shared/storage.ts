import type { AccountHealthResult, CurrentContext } from "@xhc/shared";

export const CONTEXT_KEY = "currentContext";
export const RESULTS_KEY = "resultByHandle";
export const HISTORY_KEY = "history";

export async function saveCurrentContext(context: CurrentContext): Promise<void> {
  await chrome.storage.local.set({ [CONTEXT_KEY]: context });
}

export async function getCurrentContext(): Promise<CurrentContext | null> {
  const data = await chrome.storage.local.get(CONTEXT_KEY);
  return (data[CONTEXT_KEY] as CurrentContext | undefined) ?? null;
}

export async function saveHealthResult(result: AccountHealthResult): Promise<void> {
  const existing = await chrome.storage.local.get([RESULTS_KEY, HISTORY_KEY]);
  const resultByHandle = (existing[RESULTS_KEY] as Record<string, AccountHealthResult> | undefined) ?? {};
  const history = (existing[HISTORY_KEY] as AccountHealthResult[] | undefined) ?? [];

  resultByHandle[result.handle] = result;

  const nextHistory = [result, ...history.filter((entry) => entry.handle !== result.handle)].slice(0, 50);

  await chrome.storage.local.set({
    [RESULTS_KEY]: resultByHandle,
    [HISTORY_KEY]: nextHistory
  });
}

export async function getLatestHealthResult(handle: string): Promise<AccountHealthResult | null> {
  const data = await chrome.storage.local.get(RESULTS_KEY);
  const resultByHandle = (data[RESULTS_KEY] as Record<string, AccountHealthResult> | undefined) ?? {};
  return resultByHandle[handle] ?? null;
}

export async function getHistory(): Promise<AccountHealthResult[]> {
  const data = await chrome.storage.local.get(HISTORY_KEY);
  return (data[HISTORY_KEY] as AccountHealthResult[] | undefined) ?? [];
}
