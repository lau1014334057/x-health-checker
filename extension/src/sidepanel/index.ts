import type { AccountHealthResult, CurrentContext, VisibilityCheck } from "@xhc/shared";
import { fetchHealth } from "../shared/api.js";
import {
  CONTEXT_KEY,
  getCurrentContext,
  getHistory,
  HISTORY_KEY,
  saveCurrentContext,
  saveHealthResult
} from "../shared/storage.js";
import { detectHandleFromUrl } from "../shared/x-profile.js";

const subtitleEl = document.querySelector("#subtitle") as HTMLParagraphElement;
const summaryEl = document.querySelector("#summary") as HTMLElement;
const visibilityEl = document.querySelector("#visibility") as HTMLElement;
const manualHandleEl = document.querySelector("#manual-handle") as HTMLInputElement;
const manualRunButton = document.querySelector("#manual-run") as HTMLButtonElement;

let activeContext: CurrentContext | null = null;

function getScoreLabel(grade?: string): string {
  if (grade === "high") return "健康";
  if (grade === "medium") return "注意优化";
  if (grade === "low") return "存在风险";
  return "待确认";
}

function getStatusLabel(status?: string): string {
  if (status === "pass") return "表现正常";
  if (status === "warning") return "需要留意";
  if (status === "fail") return "疑似受限";
  return "暂时无法判断";
}

function localizeVisibilityLabel(label?: string): string | undefined {
  if (!label) return undefined;

  const map: Record<string, string> = {
    "No search suggestion ban detected": "未发现搜索建议限制",
    "Search suggestion ban likely detected": "疑似存在搜索建议限制",
    "Possible search suggestion suppression": "疑似存在搜索建议抑制",
    "No search ban detected": "未发现搜索可见性限制",
    "Search ban likely detected": "疑似存在搜索可见性限制",
    "No ghost ban detected": "未发现幽灵封禁迹象",
    "Ghost ban likely detected": "疑似存在幽灵封禁",
    "Possible ghost ban signal": "疑似存在幽灵封禁信号",
    "No reply deboosting detected": "未发现回复降权",
    "Reply deboosting likely detected": "疑似存在回复降权",
    "Reply deboosting not yet verified in mock mode": "演示模式暂未验证回复降权",
    "Visibility provider unavailable": "可见性检测服务暂时不可用",
    "Unable to verify this visibility signal.": "当前无法确认这一项可见性状态。"
  };

  return map[label] ?? label;
}

function getStatusDescription(name: string, check?: VisibilityCheck): string {
  const localizedLabel = localizeVisibilityLabel(check?.label);
  if (localizedLabel) {
    return localizedLabel;
  }

  if (check?.reason) {
    return `${name} 当前未返回明确结果，原因：${check.reason}`;
  }

  return `${name} 当前暂无足够信息。`;
}

function getSourceLabel(source?: string): string {
  if (source === "hisubway_shadowban_v1") return "外部可见性检测服务";
  if (source === "tweethunter_tweepcred_v1") return "TweepCred 实时评分接口";
  if (source === "mock_scoring_v1") return "当前为演示评分模型";
  return source ?? "未知来源";
}

function localizeDistributionEstimate(value?: string): string {
  if (!value) {
    return "当前暂无账号层分发倾向说明。";
  }

  const map: Record<string, string> = {
    eligible_for_full_distribution: "账号层信号显示，整体分发倾向较完整。",
    limited_candidate_distribution: "账号层信号显示，整体分发倾向偏弱。",
    "Your tweets are eligible for full distribution": "账号层信号显示，整体分发倾向较完整。",
    "Only ~3 of your tweets get considered for distribution": "账号层信号显示，整体分发倾向偏弱。",
    "Only ~5 of your tweets get considered for distribution": "账号层信号显示，整体分发倾向偏弱。",
    "Healthy distribution": "账号层信号显示，整体分发状态较健康。",
    "Above threshold but room to improve": "账号层信号显示，当前已超过关键阈值，但仍有优化空间。",
    "Below threshold - only ~3 tweets considered": "账号层信号显示，当前低于关键阈值，整体分发倾向偏弱。",
    "Severe distribution limits": "账号层信号显示，当前分发倾向可能明显偏弱。"
  };

  return map[value] ?? value;
}

function localizeRecommendation(value: string): string {
  const map: Record<string, string> = {
    "Post consistently to strengthen activity signals.": "保持稳定发帖与回复频率，持续强化账号活跃信号。",
    "Prioritize replies and discussion quality over shallow engagement.":
      "优先提升回复质量和讨论深度，而不是只追求浅层互动。",
    "Re-run checks after major content or behavior changes.":
      "在调整发布策略或账号行为后，重新检测一次，观察变化。"
  };

  return map[value] ?? value;
}

function getThresholdState(score?: number) {
  const safeScore = score ?? 0;
  const above = safeScore >= 65;

  return {
    chipClass: above ? "above" : "below",
    chipLabel: above ? "已超过 65 分阈值" : "低于 65 分阈值",
    copy: above
      ? "这通常意味着账号层信号较强，但并不直接代表每条推文都会获得高浏览。"
      : "这通常意味着账号层信号偏弱，但优质内容、热点时机和传播扩散仍可能带来高曝光。"
  };
}

function getFactorBlueprint() {
  return [
    {
      name: "粉丝 / 关注比",
      points: "最高 30 分",
      desc: "关注数相对过高会拖累权重；粉丝与关注的关系越健康，越容易获得信任。"
    },
    {
      name: "账号年龄",
      points: "最高 15 分",
      desc: "账号越成熟，通常越容易获得稳定信任；新号天然更难拿到满额加分。"
    },
    {
      name: "互动质量",
      points: "最高 25 分",
      desc: "回复和真实讨论比单纯点赞更重要；互动深度越强，这一项通常越好。"
    },
    {
      name: "活跃度",
      points: "最高 10 分",
      desc: "稳定发帖和回复会持续给账号提供活跃信号；断更或频率过低会影响表现。"
    },
    {
      name: "Premium 加成",
      points: "最高 16 分",
      desc: "不同 Premium 层级会带来不同加分，这也是 TweepCred 评分结构中的显性项。"
    },
    {
      name: "移动端使用",
      points: "最高 4 分",
      desc: "移动端使用会带来小幅加成，虽然分值不高，但在临界分附近可能有帮助。"
    }
  ];
}

function renderFactorDropdown(): string {
  const factors = getFactorBlueprint();

  return `
    <details class="factor-dropdown">
      <summary>评分构成</summary>
      <div class="factor-popover">
        <div class="factor-list">
          ${factors
            .map(
              (item) => `
                <div class="factor-item">
                  <div class="factor-head">
                    <h3 class="factor-name">${item.name}</h3>
                    <span class="factor-points">${item.points}</span>
                  </div>
                  <p class="factor-desc">${item.desc}</p>
                </div>
              `
            )
            .join("")}
        </div>
        <p class="factor-note">
          当前总分与 TweepCred 实时结果保持一致。这里展示的是评分结构与影响方向，
          用于帮助理解算法关注点，不代表 TweepCred 公开返回的逐项明细分。
        </p>
      </div>
    </details>
  `;
}

function formatTime(iso?: string): string {
  if (!iso) return "暂无";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

async function getActiveContext(): Promise<CurrentContext | null> {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  if (!activeTab?.url) {
    return getCurrentContext();
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

function renderSummary(context: CurrentContext | null, result: AccountHealthResult | null): void {
  subtitleEl.textContent = context?.handle
    ? `当前识别账号：@${context.handle}`
    : "请打开一个 X 账号主页，或在下方手动输入用户名。";
  manualHandleEl.value = context?.handle ?? manualHandleEl.value;

  if (!result) {
    summaryEl.innerHTML = `<p class="empty-copy">这个账号暂时还没有检测结果。</p>`;
    visibilityEl.innerHTML = `
      <h2 class="section-title">可见性检测</h2>
      <p class="empty-copy">运行一次检测后，这里会展示可见性判断、来源和说明。</p>
    `;
    return;
  }

  const grade = result.healthScore?.grade ?? "unknown";
  const scoreValue = result.healthScore?.score ?? "--";
  const scoreNumber = typeof scoreValue === "number" ? scoreValue : Number(scoreValue);
  const threshold = getThresholdState(Number.isFinite(scoreNumber) ? scoreNumber : 0);
  const localizedDistributionEstimate = localizeDistributionEstimate(result.healthScore?.distributionEstimate);
  const localizedRecommendations = result.recommendations.map(localizeRecommendation);

  summaryEl.innerHTML = `
    <div class="summary-stack">
      <div class="summary-top">
        <h2 class="summary-title">@${result.handle}</h2>
        <span class="health-badge ${grade}">${getScoreLabel(grade)}</span>
      </div>
      <div class="score-row">
        <p class="score-line">账号层分发信号评分</p>
        <span class="score-strong">${scoreValue}</span>
      </div>
      <div class="distribution-box">
        <p class="distribution-title">当前账号层分发倾向</p>
        <p class="distribution-value">${localizedDistributionEstimate}</p>
      </div>
      <div class="threshold-row">
        <span class="threshold-chip ${threshold.chipClass}">${threshold.chipLabel}</span>
        <span class="threshold-copy">${threshold.copy}</span>
      </div>
      ${renderFactorDropdown()}
      <ul class="hint-list">
        ${localizedRecommendations.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <div class="note-box">
        说明：这个分数反映的是账号层面的长期分发信号，只能作为参考，
        不直接代表单条推文最终会获得多少浏览量。
      </div>
    </div>
  `;

  const visibilityItems = [
    { title: "搜索建议", data: result.visibility?.searchSuggestionBan },
    { title: "搜索可见性", data: result.visibility?.searchBan },
    { title: "幽灵封禁", data: result.visibility?.ghostBan },
    { title: "回复降权", data: result.visibility?.replyDeboosting }
  ];

  visibilityEl.innerHTML = `
    <h2 class="section-title">可见性检测</h2>
    <div class="visibility-list">
      ${visibilityItems
        .map(({ title, data }) => {
          const status = data?.status ?? "unknown";
          return `
            <div class="visibility-item">
              <div class="visibility-head">
                <h3 class="visibility-name">${title}</h3>
                <span class="status-chip ${status}">${getStatusLabel(status)}</span>
              </div>
              <p class="visibility-desc">${getStatusDescription(title, data)}</p>
            </div>
          `;
        })
        .join("")}
    </div>
    <div class="meta-block">
      <div class="meta-row">
        <span class="meta-label">检测时间</span>
        <span class="meta-value">${formatTime(result.meta.checkedAt)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">评分来源</span>
        <span class="meta-value">${getSourceLabel(result.meta.scoreSource)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">可见性来源</span>
        <span class="meta-value">${getSourceLabel(result.meta.visibilitySource)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">缓存状态</span>
        <span class="meta-value">${result.meta.cacheHit ? "来自本地缓存" : "实时获取"}</span>
      </div>
    </div>
    <div class="note-box">
      说明：可见性结果来自外部观察型检测，不属于 X 官方状态；评分结果来自 TweepCred 实时查询。
      两者都更适合作为账号层参考信号，而不是单条内容结果的绝对预测。
    </div>
  `;
}

async function refreshView(): Promise<void> {
  const context = await getActiveContext();
  activeContext = context;
  const history = await getHistory();
  const result = context?.handle ? history.find((entry) => entry.handle === context.handle) ?? null : null;
  renderSummary(context, result);
}

manualRunButton.addEventListener("click", async () => {
  const rawHandle = manualHandleEl.value.trim() || activeContext?.handle || "";
  const handle = rawHandle.replace(/^@/, "").trim().toLowerCase();

  if (!handle) {
    subtitleEl.textContent = "请先输入账号名，或打开一个 X 账号主页。";
    return;
  }

  summaryEl.innerHTML = `<p class="empty-copy">正在检测 @${handle} 的账号健康度...</p>`;
  visibilityEl.innerHTML = `
    <h2 class="section-title">可见性检测</h2>
    <p class="empty-copy">正在获取可见性检测结果...</p>
  `;

  const result = await fetchHealth(handle, true);
  await saveHealthResult(result);

  await refreshView();
});

manualHandleEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    manualRunButton.click();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (changes[CONTEXT_KEY] || changes[HISTORY_KEY]) {
    void refreshView();
  }
});

void refreshView();
