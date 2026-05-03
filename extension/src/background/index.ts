import type { BackgroundRequest, BackgroundResponse } from "@xhc/shared";
import { fetchHealth } from "../shared/api.js";
import {
  getCurrentContext,
  getLatestHealthResult,
  saveCurrentContext,
  saveHealthResult
} from "../shared/storage.js";
import { detectCurrentContext } from "../shared/x-profile.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
    // Older Chrome builds may not support sidePanel behavior setup.
  });
});

chrome.runtime.onMessage.addListener((message: BackgroundRequest, sender, sendResponse) => {
  void handleMessage(message, sender.tab?.id)
    .then((response) => sendResponse(response))
    .catch((error: Error) =>
      sendResponse({
        ok: false,
        error: error.message
      } satisfies BackgroundResponse)
    );

  return true;
});

async function handleMessage(message: BackgroundRequest, tabId?: number): Promise<BackgroundResponse> {
  switch (message.type) {
    case "GET_CURRENT_CONTEXT": {
      const context = await resolveCurrentContext();
      return { ok: true, data: context };
    }

    case "RUN_HEALTH_CHECK": {
      const handle = message.payload.handle.replace(/^@/, "").trim().toLowerCase();
      const cached = await getLatestHealthResult(handle);

      if (cached && !message.payload.refresh) {
        return { ok: true, data: cached };
      }

      const result = await fetchHealth(handle, message.payload.refresh);
      await saveHealthResult(result);

      return { ok: true, data: result };
    }

    case "SET_CURRENT_CONTEXT": {
      await saveCurrentContext(message.payload);
      return { ok: true, data: message.payload };
    }

    case "OPEN_SIDE_PANEL": {
      if (tabId !== undefined) {
        await chrome.sidePanel.open({ tabId });
      }

      return { ok: true, data: null };
    }
  }

  return { ok: false, error: "Unsupported message type." };
}

async function resolveCurrentContext() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (activeTab?.url) {
    const current = detectCurrentContext(activeTab.url);
    await saveCurrentContext({
      ...current,
      tabId: activeTab.id
    });
    return {
      ...current,
      tabId: activeTab.id
    };
  }

  return getCurrentContext();
}

chrome.tabs.onActivated.addListener(() => {
  void resolveCurrentContext();
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.url ?? tab.url) {
    void resolveCurrentContext();
  }
});

chrome.storage.local.get("currentContext").then(async ({ currentContext }) => {
  if (currentContext) {
    await saveCurrentContext(currentContext);
  }
});
