// ── Enums ──────────────────────────────────────────────

export enum ScanStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  PARTIAL = "partial",
  FAILED = "failed",
}

export enum ContentStatus {
  DRAFT = "draft",
  APPROVED = "approved",
  NEEDS_REVISION = "needs_revision",
  FLAGGED_FOR_REVIEW = "flagged_for_review",
  PUBLISHED = "published",
  REGENERATING = "regenerating",
  FAILED = "failed",
}

export enum PostFormat {
  QUICK_TIPS = "quick_tips",
  HOT_TAKE = "hot_take",
  TRENDING_BREAKDOWN = "trending_breakdown",
  DID_YOU_KNOW = "did_you_know",
  TUTORIAL_HACK = "tutorial_hack",
  MYTH_BUSTERS = "myth_busters",
  BEHIND_THE_TECH = "behind_the_tech",
}

export enum PublishStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  PUBLISHED = "published",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum PublishMode {
  AUTO = "auto",
  MANUAL = "manual",
}

export enum Sentiment {
  BULLISH = "bullish",
  NEUTRAL = "neutral",
  BEARISH = "bearish",
  CONTROVERSIAL = "controversial",
}

export enum TrendLifecycle {
  EMERGING = "emerging",
  RISING = "rising",
  PEAKING = "peaking",
  SATURATED = "saturated",
  DECLINING = "declining",
}

export enum EngagementPrediction {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VIRAL = "viral",
}

export enum SourceType {
  OFFICIAL_BLOG = "official_blog",
  NEWS = "news",
  RESEARCH = "research",
  COMMUNITY = "community",
  SOCIAL = "social",
}

// ── Auth ───────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "admin" | "user";
  tiktokLinked: boolean;
  createdAt: string;
}

// ── Pagination ─────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Scan ───────────────────────────────────────────────

export interface ScanRun {
  id: string;
  triggeredBy: string | null;
  /** How the run was started: "manual" | "scheduled". null for legacy rows. */
  triggeredType: string | null;
  status: ScanStatus;
  platformsRequested: string[];
  platformsCompleted: string[];
  platformsFailed: Record<string, string>;
  totalItemsFound: number;
  langgraphThreadId: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  error: string | null;
  reportFilePath: string | null;
}

export interface ScanStatusResponse {
  scan_id: string;
  status: ScanStatus;
  platforms_completed: string[];
  platforms_failed: Record<string, string>;
  total_items_found: number;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  error: string | null;
  current_step?: string | null;
  published_post_ids?: string[];
}

/** Active recurring scan schedule for the Pipeline Control Center. */
export interface ScanScheduleResponse {
  id: string;
  cron_expression: string;
  platforms: string[];
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

export interface TriggerScanDto {
  platforms?: string[];
  options?: {
    max_items_per_platform?: number;
    include_comments?: boolean;
    quality_threshold?: number;
    keywords?: string[];
    generate_posts?: boolean;
    post_gen_options?: {
      num_posts?: number;
      formats?: string[] | null;
    };
  };
}

// ── Pipeline runs (end-to-end orchestration) ───────────

export type PipelineStage = "scanning" | "generating" | "publishing";

export interface PipelineRunResponse {
  pipeline_id: string;
  status: ScanStatus;
  stage: PipelineStage | null;
  created_at: string;
}

export interface PipelineRunStatusResponse {
  pipeline_id: string;
  status: ScanStatus;
  stage: PipelineStage | null;
  current_step?: string | null;
  scan_run_id: string | null;
  total_items_found: number;
  content_post_ids: string[];
  published_post_ids: string[];
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
}

// ── Trend ──────────────────────────────────────────────

export interface ContentAngle {
  angle: string;
  format: string;
  hook_line: string;
}

export interface TrendComment {
  id: string;
  author: string | null;
  text: string;
  likes: number;
  sentiment: Sentiment | null;
  posted_at: string | null;
}

export interface TrendItem {
  id: string;
  scanRunId: string;
  title: string;
  description: string | null;
  contentBody: string | null;
  sourceUrl: string | null;
  platform: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  imageUrls: string[];
  tags: string[];
  hashtags: string[];
  views: number | null;
  likes: number | null;
  commentsCount: number | null;
  shares: number | null;
  trendingScore: number | null;
  authorName: string | null;
  authorUrl: string | null;
  authorFollowers: number | null;
  category: string | null;
  sentiment: Sentiment | null;
  lifecycle: TrendLifecycle | null;
  relevanceScore: number | null;
  qualityScore: number | null;
  engagementPrediction: EngagementPrediction | null;
  sourceType: SourceType | null;
  relatedTopics: string[];
  contentAngles: ContentAngle[];
  keyDataPoints: string[];
  targetAudience: string[];
  cleanedContent: string | null;
  isPromoted: boolean;
  dedupKey: string | null;
  crossPlatformIds: string[];
  rawData: Record<string, unknown> | null;
  publishedAt: string | null;
  discoveredAt: string;
  comments?: TrendComment[];
}

export interface TrendFilters {
  category?: string;
  sentiment?: Sentiment;
  lifecycle?: TrendLifecycle;
  minScore?: number;
  page?: number;
  pageSize?: number;
}

// ── Content Post ───────────────────────────────────────

export interface ContentPost {
  id: string;
  scanRunId: string;
  trendItemId: string | null;
  createdBy: string | null;
  format: PostFormat;
  caption: string;
  hashtags: string[];
  cta: string | null;
  imagePrompt: Record<string, unknown> | null;
  trendTitle: string;
  trendUrl: string | null;
  contentAngleUsed: string | null;
  targetAudience: string[];
  wordCount: number | null;
  estimatedReadTime: string | null;
  engagementPrediction: string | null;
  bestPostingDay: string | null;
  bestPostingTime: string | null;
  timingWindow: string | null;
  status: ContentStatus;
  reviewScore: number | null;
  reviewNotes: string | null;
  reviewCriteria: Record<string, unknown> | null;
  revisionCount: number;
  failedStage: string | null;
  errorReason: string | null;
  humanFeedback?: string | null;
  lastRevisionTargets?: {
    content: boolean;
    image: boolean;
    reasoning?: string;
  } | null;
  isPromoted: boolean;
  filePath: string | null;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface PostFilters {
  scanRunId?: string;
  format?: PostFormat;
  status?: ContentStatus;
  page?: number;
  pageSize?: number;
}

export interface PostGenRequest {
  scan_run_id: string;
  options?: {
    num_posts?: number;
    formats?: PostFormat[] | null;
  };
}

// ── Publish ────────────────────────────────────────────

export interface PublishedPost {
  id: string;
  contentPostId: string;
  publishedBy: string | null;
  platform: string;
  publishMode: PublishMode;
  status: PublishStatus;
  privacyLevel: string;
  tiktokPublishId: string | null;
  platformPostId: string | null;
  goldenHourSlot: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ManualPublishRequest {
  privacy_level?: string;
}

export interface SchedulePublishRequest {
  scheduled_at: string;
  privacy_level?: string;
}

export interface AutoPublishRequest {
  privacy_level?: string;
}

export interface PublishAcceptedResponse {
  published_post_id: string;
  mode: string;
  status: string;
  scheduled_at: string | null;
  message: string;
}

export interface PublishStatusResponse {
  id: string;
  content_post_id: string;
  platform: string;
  status: PublishStatus;
  publish_mode: PublishMode;
  privacy_level: string;
  tiktok_publish_id: string | null;
  platform_post_id: string | null;
  golden_hour_slot: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
}

export interface GoldenHourSlot {
  slot_time: string;
  slot_index: number;
  weighted_score: number;
  sample_count: number;
}

export interface GoldenHoursResponse {
  top_slots: GoldenHourSlot[];
  selected_slot: GoldenHourSlot;
  scheduled_at: string;
  is_fallback: boolean;
}

// ── Report ─────────────────────────────────────────────

export interface ReportListItem {
  scan_run_id: string;
  generated_at: string;
  report_file_path: string;
  total_items_found: number;
  platforms_completed: string[];
}

export interface ReportSummary {
  scan_run_id: string;
  meta: {
    total_input: number;
    passed: number;
    discarded: number;
    dominant_sentiment: string;
    top_trend: string;
    top_tiktok_format: string;
    suggested_posting_window: string;
  };
  processed_count: number;
  discarded_count: number;
  generated_at: string;
}

// ── Schedule ───────────────────────────────────────────

export interface ScanSchedule {
  id: string;
  cronExpression: string;
  platforms: string[];
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
}

// ── Pipeline Config ────────────────────────────────────

export type PipelinePublishMode = "auto" | "manual" | "schedule";

export interface PipelineConfig {
  id: string;
  owner_id: string | null;
  max_items_per_platform: number;
  quality_threshold: number;
  include_comments: boolean;
  keywords: string[];
  num_posts: number;
  allowed_formats: string[] | null;
  require_review: boolean;
  auto_approve_threshold: number;
  auto_publish: boolean;
  publish_mode: PipelinePublishMode;
  scheduled_publish_time: string | null;
  default_privacy_level: string;
  scan_schedule_enabled: boolean;
  scan_cron_expression: string | null;
  hn_rate_limit_per_min: number;
  hn_retry_strategy: HnRetryStrategy;
  created_at: string;
  updated_at: string | null;
}

export type HnRetryStrategy = "exponential" | "linear" | "immediate";

export type PipelineConfigUpdate = Partial<
  Omit<PipelineConfig, "id" | "owner_id" | "created_at" | "updated_at">
>;

// ── Admin Overview ─────────────────────────────────────
// Mirrors backend/src/admin/dto/overview-response.dto.ts
export type HealthStatus = "ok" | "error" | "unknown";

export interface Kpi {
  label: string;
  value: number;
  /** % vs prior 7d; null when the prior window had 0 (render "—"). */
  deltaPct: number | null;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface EfficiencyPoint {
  label: string;
  generated: number;
  published: number;
}

export interface ServiceHealth {
  label: string;
  status: HealthStatus;
}

export interface AdminOverview {
  kpis: Kpi[];
  trendScanVolume: {
    "24h": SeriesPoint[];
    "7d": SeriesPoint[];
  };
  contentPipeline: {
    generated: number;
    autoApproved: number;
    flagged: number;
    published: number;
  };
  outputEfficiency: EfficiencyPoint[];
  systemHealth: {
    internal: ServiceHealth[];
    external: ServiceHealth[];
  };
}

// ── Admin User Management ──────────────────────────────
// Mirrors backend/src/users/dto/users.dto.ts
export type AdminUserRole = "admin" | "user";

export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: AdminUserRole;
  tiktokLinked: boolean;
  createdAt: string;
  postsGenerated: number;
  postsPublished: number;
  videoClips: number;
}

export interface AdminUserStats {
  totalUsers: number;
  tiktokLinked: number;
  tiktokNotLinked: number;
  newThisWeek: number;
  /** % vs prior 7d; null when the prior window had 0 (render "—"). */
  deltaPct: number | null;
}

export interface AdminUserFilters {
  search?: string;
  role?: AdminUserRole;
  tiktok?: "linked" | "not_linked";
  page?: number;
  pageSize?: number;
}

export interface CreateAdminUserDto {
  email: string;
  password: string;
  displayName?: string;
  role?: AdminUserRole;
}

export interface UpdateAdminUserDto {
  role?: AdminUserRole;
  displayName?: string;
}

// ── Admin Video Clipping Pipeline ──────────────────────
// Mirrors backend/src/video-tasks/dto/admin-video-clips.dto.ts

export interface AdminVideoClipOwner {
  id: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface AdminVideoClipJob {
  id: string;
  sourceType: string;
  sourceRef: string;
  /** VideoTask pipeline status (queued, transcribing, …, completed, error). */
  status: string;
  progress: number;
  progressMessage: string | null;
  errorMessage: string | null;
  clipsProduced: number;
  /** Target clip count (maxClips). */
  clipsTotal: number;
  thumbnailUrl: string | null;
  owner: AdminVideoClipOwner | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface AdminVideoClipsStats {
  producedToday: number;
  /** % vs the prior day; null when the prior day had 0 (render "—"). */
  producedTodayDeltaPct: number | null;
  inProgress: number;
  failedTasks: number;
  /** Avg completed-task processing time in seconds (last 7d); null if none. */
  avgProcessingSeconds: number | null;
}

export interface AdminVideoClipsFilters {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** A produced clip shown in the admin "View Clips" modal. */
export interface AdminVideoClip {
  id: string;
  clipIndex: number;
  title: string | null;
  storageUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  status: string;
  llmScore: number | null;
}

// ── Admin Monitoring ───────────────────────────────────
// Mirrors backend/src/admin/dto/monitoring.dto.ts

export type PipelineStatus = "running" | "idle" | "failed";

export interface PipelineHealth {
  key: "trend_scanner" | "post_generator" | "publisher" | "video_clipper";
  title: string;
  status: PipelineStatus;
  pending: number;
  processedLastHour: number;
  failedLast24h: number;
  lastActivityAt: string | null;
}

export type ErrorSeverity = "CRITICAL" | "WARNING" | "INFO";

export interface ErrorLogEntry {
  severity: ErrorSeverity;
  timestamp: string;
  node: string;
  message: string;
}

export interface ErrorLogFilters {
  severity?: ErrorSeverity;
  page?: number;
  pageSize?: number;
}
