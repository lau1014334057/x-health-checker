import type { AccountHealthResult, BackgroundResponse, CurrentContext } from "@xhc/shared";

const WIDGET_HOST_ID = "xhc-floating-widget-host";

let currentHandle: string | undefined;
let root: ShadowRoot | null = null;
let panelEl: HTMLElement | null = null;
let handleInputEl: HTMLInputElement | null = null;
let statusEl: HTMLElement | null = null;
let resultEl: HTMLElement | null = null;
let lastSyncedUrl = "";

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
  if (window.location.href === lastSyncedUrl) {
    return;
  }

  lastSyncedUrl = window.location.href;
  const context: CurrentContext = {
    url: window.location.href,
    handle: parseHandleFromUrl(window.location.href),
    detectedAt: new Date().toISOString()
  };
  currentHandle = context.handle;
  handleInputEl?.setAttribute("value", currentHandle ?? "");
  updateStatus();

  await chrome.runtime.sendMessage({
    type: "SET_CURRENT_CONTEXT",
    payload: context
  });
}

function getGradeLabel(grade?: string): string {
  if (grade === "high") return "健康";
  if (grade === "medium") return "注意优化";
  if (grade === "low") return "存在风险";
  return "待确认";
}

function getRecommendation(value?: string): string {
  const map: Record<string, string> = {
    "Post consistently to strengthen activity signals.": "保持稳定发帖与回复频率，持续强化账号活跃信号。",
    "Prioritize replies and discussion quality over shallow engagement.":
      "优先提升回复质量和讨论深度，而不是只追求浅层互动。",
    "Re-run checks after major content or behavior changes.": "调整发布策略或账号行为后，重新检测一次观察变化。"
  };

  return value ? map[value] ?? value : "暂无建议。";
}

function getDistribution(value?: string): string {
  const map: Record<string, string> = {
    eligible_for_full_distribution: "整体分发倾向较完整。",
    limited_candidate_distribution: "整体分发倾向偏弱。"
  };

  return value ? map[value] ?? value : "当前暂无账号层分发倾向说明。";
}

function updateStatus(): void {
  if (!statusEl) return;

  statusEl.textContent = currentHandle ? `当前识别账号：@${currentHandle}` : "请打开一个 X 账号主页，或手动输入用户名。";

  if (handleInputEl && currentHandle && !handleInputEl.value) {
    handleInputEl.value = currentHandle;
  }
}

function renderEmpty(): void {
  if (!resultEl) return;

  resultEl.innerHTML = `
    <div class="xhc-empty">
      运行一次检测后，这里会显示账号评分和建议。
    </div>
  `;
}

function renderLoading(handle: string): void {
  if (!resultEl) return;

  resultEl.innerHTML = `
    <div class="xhc-empty">
      正在检测 @${handle} 的账号健康度...
    </div>
  `;
}

function renderError(message: string): void {
  if (!resultEl) return;

  resultEl.innerHTML = `
    <div class="xhc-empty xhc-error">
      ${message}
    </div>
  `;
}

function renderResult(result: AccountHealthResult): void {
  if (!resultEl) return;

  const grade = result.healthScore?.grade ?? "unknown";
  const score = result.healthScore?.score ?? "--";

  resultEl.innerHTML = `
    <div class="xhc-result-head">
      <strong>@${result.handle}</strong>
      <span class="xhc-badge ${grade}">${getGradeLabel(grade)}</span>
    </div>
    <div class="xhc-score-box">
      <span>账号层分发信号评分</span>
      <strong>${score}</strong>
    </div>
    <div class="xhc-info-box">
      <span>当前账号层分发倾向</span>
      <p>${getDistribution(result.healthScore?.distributionEstimate)}</p>
    </div>
    <p class="xhc-note">${getRecommendation(result.recommendations[0])}</p>
  `;
}

async function runHealthCheck(refresh = true): Promise<void> {
  const raw = handleInputEl?.value.trim() || currentHandle || "";
  const handle = raw.replace(/^@/, "").trim().toLowerCase();

  if (!handle) {
    renderError("请先输入账号名，或打开一个 X 账号主页。");
    return;
  }

  renderLoading(handle);

  try {
    const response = (await chrome.runtime.sendMessage({
      type: "RUN_HEALTH_CHECK",
      payload: { handle, refresh }
    })) as BackgroundResponse;

    if (!response.ok) {
      renderError(response.error);
      return;
    }

    renderResult(response.data as AccountHealthResult);
  } catch (error) {
    renderError(error instanceof Error ? error.message : "检测失败，请稍后再试。");
  }
}

function closeWidget(): void {
  document.getElementById(WIDGET_HOST_ID)?.remove();
  root = null;
  panelEl = null;
  handleInputEl = null;
  statusEl = null;
  resultEl = null;
}

function createWidget(): void {
  if (document.getElementById(WIDGET_HOST_ID)) {
    return;
  }

  const host = document.createElement("div");
  host.id = WIDGET_HOST_ID;
  document.documentElement.append(host);

  root = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      color-scheme: light;
      font-family: "Microsoft YaHei UI", "PingFang SC", Arial, sans-serif;
    }

    .xhc-panel {
      position: fixed;
      top: 24px;
      left: 8px;
      z-index: 2147483647;
      width: min(384px, calc(100vw - 24px));
      max-height: calc(100vh - 48px);
      box-sizing: border-box;
      overflow: auto;
      border: 1px solid rgba(216, 224, 218, 0.96);
      border-radius: 22px;
      background:
        radial-gradient(circle at 14% 72%, rgba(209, 250, 246, 0.55), transparent 30%),
        linear-gradient(180deg, #fffdf8 0%, #f5f6ee 100%);
      box-shadow: 0 18px 46px rgba(23, 32, 51, 0.18);
      color: #172033;
    }

    .xhc-topbar {
      position: sticky;
      top: 0;
      z-index: 2;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      min-height: 46px;
      padding: 0 16px;
      background: rgba(255, 253, 248, 0.86);
      backdrop-filter: blur(12px);
    }

    .xhc-grabber {
      width: 64px;
      height: 4px;
      border-radius: 999px;
      background: #9ca3af;
    }

    .xhc-actions {
      display: flex;
      justify-content: end;
      gap: 8px;
    }

    .xhc-icon {
      width: 30px;
      height: 30px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: #667085;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    }

    .xhc-body {
      padding: 12px 18px 18px;
    }

    .xhc-eyebrow {
      color: #0f766e;
      font-size: 12px;
      letter-spacing: 0.08em;
    }

    .xhc-title {
      margin: 8px 0 6px;
      font-size: 28px;
      line-height: 1.12;
      font-weight: 800;
    }

    .xhc-status {
      margin: 0;
      color: #48617f;
      font-size: 13px;
      line-height: 1.45;
    }

    .xhc-card {
      margin-top: 16px;
      padding: 15px;
      border: 1px solid #d8e0da;
      border-radius: 18px;
      background: rgba(255, 253, 249, 0.94);
      box-shadow: 0 12px 32px rgba(23, 32, 51, 0.06);
    }

    .xhc-card h2 {
      margin: 0;
      font-size: 18px;
      line-height: 1.2;
    }

    .xhc-card-copy {
      margin: 7px 0 14px;
      color: #48617f;
      font-size: 13px;
      line-height: 1.55;
    }

    .xhc-field span {
      display: block;
      margin-bottom: 7px;
      color: #0f766e;
      font-size: 13px;
    }

    .xhc-field input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #d8e0da;
      border-radius: 14px;
      padding: 11px 12px;
      background: white;
      color: #172033;
      font: inherit;
      outline: none;
    }

    .xhc-primary {
      width: 100%;
      margin-top: 12px;
      border: 0;
      border-radius: 999px;
      padding: 11px 16px;
      background: #0f766e;
      color: white;
      cursor: pointer;
      font: inherit;
    }

    .xhc-result {
      margin-top: 16px;
    }

    .xhc-empty {
      color: #48617f;
      font-size: 14px;
      line-height: 1.6;
    }

    .xhc-error {
      color: #b42318;
    }

    .xhc-result-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 16px;
    }

    .xhc-badge {
      border-radius: 999px;
      padding: 6px 10px;
      background: #f1f5f9;
      color: #475467;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .xhc-badge.high {
      background: #e7f8f4;
      color: #0f766e;
    }

    .xhc-badge.medium {
      background: #fff4df;
      color: #b45309;
    }

    .xhc-badge.low {
      background: #fff0ee;
      color: #b42318;
    }

    .xhc-score-box,
    .xhc-info-box {
      margin-top: 12px;
      padding: 12px;
      border: 1px solid #d8e0da;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.78);
    }

    .xhc-score-box {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    .xhc-score-box span,
    .xhc-info-box span {
      color: #48617f;
      font-size: 13px;
    }

    .xhc-score-box strong {
      font-size: 32px;
      line-height: 1;
    }

    .xhc-info-box p,
    .xhc-note {
      margin: 7px 0 0;
      color: #48617f;
      font-size: 14px;
      line-height: 1.55;
    }
  `;

  const wrapper = document.createElement("section");
  wrapper.className = "xhc-panel";
  wrapper.innerHTML = `
    <div class="xhc-topbar">
      <span></span>
      <div class="xhc-grabber" aria-hidden="true"></div>
      <div class="xhc-actions">
        <button class="xhc-icon" type="button" id="xhc-refresh" title="刷新">↻</button>
        <button class="xhc-icon" type="button" id="xhc-close" title="关闭">×</button>
      </div>
    </div>
    <div class="xhc-body">
      <div class="xhc-eyebrow">账号诊断</div>
      <h1 class="xhc-title">X 账号健康检查</h1>
      <p class="xhc-status" id="xhc-status"></p>
      <section class="xhc-card">
        <h2>账号评分检测</h2>
        <p class="xhc-card-copy">输入账号后查看分发信号、健康状态和优化建议。</p>
        <label class="xhc-field">
          <span>手动查询</span>
          <input id="xhc-handle" type="text" placeholder="@username" autocomplete="off" />
        </label>
        <button class="xhc-primary" type="button" id="xhc-run">开始检测</button>
        <div class="xhc-result" id="xhc-result"></div>
      </section>
    </div>
  `;

  root.append(style, wrapper);
  panelEl = wrapper;
  handleInputEl = root.querySelector("#xhc-handle");
  statusEl = root.querySelector("#xhc-status");
  resultEl = root.querySelector("#xhc-result");

  root.querySelector("#xhc-close")?.addEventListener("click", closeWidget);
  root.querySelector("#xhc-refresh")?.addEventListener("click", () => {
    void runHealthCheck(true);
  });
  root.querySelector("#xhc-run")?.addEventListener("click", () => {
    void runHealthCheck(true);
  });
  handleInputEl?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      void runHealthCheck(true);
    }
  });

  updateStatus();
  renderEmpty();
}

createWidget();
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
