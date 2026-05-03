import { Router } from "express";
import type { AccountHealthResult } from "@xhc/shared";
import { buildMockProfile } from "./mock-data.js";
import { getScore } from "./services/score-service.js";
import { getVisibility } from "./services/visibility-service.js";

const router = Router();

function normalizeHandle(rawHandle: string): string {
  return rawHandle.replace(/^@/, "").trim().toLowerCase();
}

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "xhc-backend", timestamp: new Date().toISOString() });
});

router.get("/v1/accounts/:handle/score", async (req, res) => {
  const handle = normalizeHandle(req.params.handle);

  if (!handle) {
    return res.status(400).json({
      error: {
        code: "INVALID_HANDLE",
        message: "Handle is required.",
        retryable: false
      }
    });
  }

  const scoreResult = await getScore(handle);

  return res.json({
    handle,
    profile: scoreResult.profile,
    healthScore: scoreResult.healthScore,
    meta: {
      checkedAt: new Date().toISOString(),
      cache: { hit: false, ttlSeconds: 0 },
      source: "tweethunter_tweepcred_v1"
    }
  });
});

router.get("/v1/accounts/:handle/visibility", async (req, res) => {
  const handle = normalizeHandle(req.params.handle);

  if (!handle) {
    return res.status(400).json({
      error: {
        code: "INVALID_HANDLE",
        message: "Handle is required.",
        retryable: false
      }
    });
  }

  const visibility = await getVisibility(handle);

  return res.json({
    handle,
    visibility,
    meta: {
      checkedAt: new Date().toISOString(),
      cache: { hit: false, ttlSeconds: 0 },
      source: "hisubway_shadowban_v1"
    }
  });
});

router.get("/v1/accounts/:handle/health", async (req, res) => {
  const handle = normalizeHandle(req.params.handle);

  if (!handle) {
    return res.status(400).json({
      error: {
        code: "INVALID_HANDLE",
        message: "Handle is required.",
        retryable: false
      }
    });
  }

  const [scoreResult, visibility] = await Promise.all([getScore(handle), getVisibility(handle)]);

  const result: AccountHealthResult = {
    handle,
    profile: scoreResult.profile ?? buildMockProfile(handle),
    healthScore: scoreResult.healthScore,
    visibility,
    recommendations: [
      "Post consistently to strengthen activity signals.",
      "Prioritize replies and discussion quality over shallow engagement.",
      "Re-run checks after major content or behavior changes."
    ],
    meta: {
      checkedAt: new Date().toISOString(),
      partial: false,
      cacheHit: false,
      scoreSource: "tweethunter_tweepcred_v1",
      visibilitySource: "hisubway_shadowban_v1"
    }
  };

  return res.json(result);
});

export default router;
