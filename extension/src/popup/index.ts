import type { AccountHealthResult, CurrentContext } from "@xhc/shared";
import { fetchHealth } from "../shared/api.js";
import { saveCurrentContext, saveHealthResult } from "../shared/storage.js";
import { detectHandleFromUrl } from "../shared/x-profile.js";

const contextEl = document.querySelector("#context") as HTMLParagraphElement;
const resultEl = document.querySelector("#result") as HTMLElement;
const runButton = document.querySelector("#run-check") as HTMLButtonElement;
const openPanelButton = document.querySelector("#open-panel") as HTMLButtonElement;
const handleInput = document.querySelector("#handle-input") as HTMLInputElement;

let currentContext: CurrentContext | null = null;

function getGradeLabel(grade?: string): string {
  if (grade === "high") return "状态较好";
  if (grade === "medium") return "需要优化";
  if (grade === "low") return "存在风险";
  return "待确认";
}

function localizeRecommendation(value?: string): string {
  const map: Record<string, string> = {
    "Post consistently to strengthen activity signals.": "保持稳定发帖和回复频率，持续强化账号活跃信号。",
    "Prioritize replies and discussion quality over shallow engagement.":
      "优先提升回复质量和讨论深度，而不是只追求浅层互动。",
    "Re-run checks after major content or behavior changes.": "调整内容策略后，建议重新检测一次观察变化。"
  };

  return value ? map[value] ?? value : "打开完整报告可以查看更完整的解释。";
}

async function getActiveContext(): Promise<CurrentContext | null> {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  if (!activeTab?.url) {
    return null;
  }

  const context: CurrentContext = {
    tabId: activeTab.id,
    url: activeTab.url,
    handle: detectHandleFromUrl(activeTab.url),
    detectedAt: new Date().toISOString()
  };

  await saveCurrentContext(context);
  return context;
}

function renderContext(context: CurrentContext | null): void {
  if (!context?.handle) {
    contextEl.textContent = "未识别到当前账号。你可以直接在下方手动输入用户名。";
    handleInput.value = "";
    return;
  }

  contextEl.textContent = `当前页面账号：@${context.handle}`;
  handleInput.value = context.handle;
}

function renderResult(result: AccountHealthResult): void {
  const grade = result.healthScore?.grade ?? "unknown";
  const badgeClass = grade === "high" ? "high" : grade === "medium" ? "medium" : "low";

  resultEl.classList.remove("empty");
  resultEl.innerHTML = `
    <div class="result-head">
      <h2 class="result-handle">@${result.handle}</h2>
      <span class="badge ${badgeClass}">${getGradeLabel(grade)}</span>
    </div>
    <p class="score-line">快速评分：<span class="score-strong">${result.healthScore?.score ?? "--"}</span></p>
    <p class="quick-note">${localizeRecommendation(result.recommendations[0])}</p>
  `;
}

function getRequestedHandle(): string | null {
  const raw = handleInput.value.trim() || currentContext?.handle || "";
  const handle = raw.replace(/^@/, "").trim().toLowerCase();
  return handle || null;
}

async function initialize(): Promise<void> {
  currentContext = await getActiveContext();
  renderContext(currentContext);
}

runButton.addEventListener("click", async () => {
  const requestedHandle = getRequestedHandle();

  if (!requestedHandle) {
    contextEl.textContent = "请先输入账号名，或打开一个 X 账号主页。";
    return;
  }

  resultEl.classList.remove("empty");
  resultEl.innerHTML = `
    <div class="placeholder-title">正在检测 @${requestedHandle}</div>
    <p class="placeholder-copy">正在获取账号层评分与状态，请稍候...</p>
  `;

  try {
    const result = await fetchHealth(requestedHandle);
    await saveHealthResult(result);
    currentContext = {
      url: currentContext?.url ?? "",
      handle: requestedHandle,
      detectedAt: new Date().toISOString()
    };
    await saveCurrentContext(currentContext);
    renderContext(currentContext);
    renderResult(result);
  } catch (error) {
    resultEl.innerHTML = `
      <div class="placeholder-title">检测失败</div>
      <p class="placeholder-copy">${error instanceof Error ? error.message : "请稍后再试。"}</p>
    `;
  }
});

openPanelButton.addEventListener("click", async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (activeTab?.id !== undefined) {
    await chrome.sidePanel.open({ tabId: activeTab.id });
  }
});

handleInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    runButton.click();
  }
});

void initialize();
