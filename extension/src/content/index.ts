function parseHandleFromUrl(url: string): string | undefined {
  const parsed = new URL(url);
  const reservedPaths = new Set([
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
  const [firstSegment] = parsed.pathname.split("/").filter(Boolean);

  if (!firstSegment || reservedPaths.has(firstSegment.toLowerCase())) {
    return undefined;
  }

  if (!/^[A-Za-z0-9_]{1,15}$/.test(firstSegment)) {
    return undefined;
  }

  return firstSegment.toLowerCase();
}

async function syncContext(): Promise<void> {
  const context = {
    url: window.location.href,
    handle: parseHandleFromUrl(window.location.href),
    detectedAt: new Date().toISOString()
  };
  await chrome.runtime.sendMessage({
    type: "SET_CURRENT_CONTEXT",
    payload: context
  });
}

void syncContext();

const originalPushState = history.pushState;
history.pushState = function pushStatePatched(...args) {
  originalPushState.apply(this, args);
  void syncContext();
};

window.addEventListener("popstate", () => {
  void syncContext();
});

const observer = new MutationObserver(() => {
  void syncContext();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
