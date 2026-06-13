import type {
  HnRetryStrategy,
  PipelineConfig,
  PipelineConfigUpdate,
} from "@/lib/api/types";

/** Editable shape for the Platform Configuration page. */
export const DEFAULT_CONFIG = {
  // Moderation
  autoApproveScore: 7.0,

  // Publishing
  autoPublish: false,
  deliveryMode: "golden-hour" as "golden-hour" | "manual",

  // Background Scanning
  cronExpression: "0 */12 * * *",

  // HackerNews API
  rateLimitReqMin: 60,
  retryStrategy: "exponential" as HnRetryStrategy,
};

export type ConfigState = typeof DEFAULT_CONFIG;

/** Map the API config onto the page's editable state. */
export function configToState(pc: PipelineConfig): ConfigState {
  return {
    autoApproveScore: pc.auto_approve_threshold,
    autoPublish: pc.auto_publish,
    // The UI exposes two delivery modes; treat "schedule" as manual.
    deliveryMode: pc.publish_mode === "auto" ? "golden-hour" : "manual",
    cronExpression: pc.scan_cron_expression ?? "",
    rateLimitReqMin: pc.hn_rate_limit_per_min,
    retryStrategy: pc.hn_retry_strategy,
  };
}

/** Map the editable state onto an API update payload. */
export function stateToUpdate(s: ConfigState): PipelineConfigUpdate {
  return {
    auto_approve_threshold: s.autoApproveScore,
    auto_publish: s.autoPublish,
    publish_mode: s.deliveryMode === "golden-hour" ? "auto" : "manual",
    scan_cron_expression: s.cronExpression.trim() || null,
    hn_rate_limit_per_min: s.rateLimitReqMin,
    hn_retry_strategy: s.retryStrategy,
  };
}
