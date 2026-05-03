export type ScoreGrade = "low" | "medium" | "high";
export type FactorStatus = "good" | "warning" | "danger";
export type VisibilityStatus = "pass" | "fail" | "warning" | "unknown";

export interface ScoreFactor {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  status: FactorStatus;
  explanation: string;
}

export interface HealthScore {
  score: number;
  grade: ScoreGrade;
  distributionEstimate: string;
  factors: ScoreFactor[];
}

export interface VisibilityCheck {
  status: VisibilityStatus;
  checked: boolean;
  label: string;
  reason?: string;
}

export interface VisibilityCheckSet {
  searchSuggestionBan: VisibilityCheck;
  searchBan: VisibilityCheck;
  ghostBan: VisibilityCheck;
  replyDeboosting: VisibilityCheck;
}

export interface AccountProfile {
  handle: string;
  name?: string;
  avatarUrl?: string;
  lastSeenAt?: string;
}

export interface AccountHealthMeta {
  checkedAt: string;
  partial: boolean;
  cacheHit: boolean;
  scoreSource?: string;
  visibilitySource?: string;
}

export interface AccountHealthResult {
  handle: string;
  profile?: AccountProfile;
  healthScore?: HealthScore;
  visibility?: VisibilityCheckSet;
  recommendations: string[];
  meta: AccountHealthMeta;
}

export interface CurrentContext {
  tabId?: number;
  url: string;
  handle?: string;
  detectedAt: string;
}

export interface HealthApiResponse extends AccountHealthResult {}

export interface RunHealthCheckRequest {
  handle: string;
  refresh?: boolean;
}

export type BackgroundRequest =
  | { type: "GET_CURRENT_CONTEXT" }
  | { type: "RUN_HEALTH_CHECK"; payload: RunHealthCheckRequest }
  | { type: "SET_CURRENT_CONTEXT"; payload: CurrentContext }
  | { type: "OPEN_SIDE_PANEL" };

export type BackgroundResponse =
  | { ok: true; data: CurrentContext | AccountHealthResult | null }
  | { ok: false; error: string };
