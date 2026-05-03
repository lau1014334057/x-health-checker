import type { CurrentContext } from "@xhc/shared";

const RESERVED_PATHS = new Set([
  "home",
  "explore",
  "notifications",
  "messages",
  "i",
  "search",
  "settings",
  "compose",
  "tos",
  "privacy"
]);

function parseHandleFromPath(pathname: string): string | undefined {
  const [firstSegment] = pathname.split("/").filter(Boolean);
  if (!firstSegment || RESERVED_PATHS.has(firstSegment.toLowerCase())) {
    return undefined;
  }

  if (!/^[A-Za-z0-9_]{1,15}$/.test(firstSegment)) {
    return undefined;
  }

  return firstSegment.toLowerCase();
}

export function detectCurrentContext(url: string = window.location.href): CurrentContext {
  const parsed = new URL(url);
  const handle = parseHandleFromPath(parsed.pathname);

  return {
    url: parsed.toString(),
    handle,
    detectedAt: new Date().toISOString()
  };
}

export function detectHandleFromUrl(url: string): string | undefined {
  return detectCurrentContext(url).handle;
}
