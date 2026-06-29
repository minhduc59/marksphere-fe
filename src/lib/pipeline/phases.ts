// Normalized model for the unified pipeline-progress UI.
//
// Every track (scan+post-gen, publish, video) maps its own status payload into a
// single `PipelineView` shape that the shared <PipelineProgress> component renders.
// Phase/stage keys mirror the backend step strings:
//   - scan/post-gen:  ai-service/app/agents/supervisor.py `_NODE_STEP_MAP`
//                     + post_generator/runner.py `_POST_GEN_STEP_MAP`
//   - publish:        PublishStatus enum
//   - video:          VideoTaskStatus

import {
  ScanStatus,
  PublishStatus,
  type ScanStatusResponse,
  type PublishStatusResponse,
  type PipelineRunStatusResponse,
} from "@/lib/api/types";
import type { VideoTask } from "@/lib/api/video";
import { FRIENDLY_PUBLISH_ERROR } from "@/lib/publish-errors";

export type PipelineState = "running" | "done" | "partial" | "failed";

export interface Stage {
  /** Underlying step key(s) that activate this stage. */
  keys: readonly string[];
  label: string;
}

export interface Phase {
  key: string;
  label: string;
  stages: Stage[];
}

export interface PipelineView {
  /** Short header word, e.g. "Scanning", "Generating posts", "Publishing". */
  title: string;
  phases: Phase[];
  /** Flat index of the active stage across all phases; -1 when none. */
  activeIndex: number;
  state: PipelineState;
  /** 0..100 overall progress. */
  percent: number;
  error: string | null;
  /** ISO timestamp used to render a live elapsed timer; null hides it. */
  startedAt: string | null;
  /** Optional secondary line, e.g. "12 trends". */
  meta: string | null;
}

// ── Phase configs ─────────────────────────────────────────────────────────

const SCAN_PHASES: Phase[] = [
  {
    key: "scan",
    label: "Scan",
    stages: [
      { keys: ["crawling", "collecting"], label: "Crawl HackerNews" },
      { keys: ["analyzing"], label: "Analyze trends" },
      { keys: ["saving_report", "persisting"], label: "Save report" },
    ],
  },
  {
    key: "generate",
    label: "Generate",
    stages: [
      { keys: ["generating_content", "post_strategy"], label: "Plan strategy" },
      { keys: ["post_content"], label: "Write posts" },
      { keys: ["post_image_prompts", "post_images"], label: "Generate images" },
      { keys: ["post_review"], label: "Review" },
      { keys: ["post_packaging"], label: "Finalize" },
    ],
  },
];

// Appended to SCAN_PHASES when a standalone scan / From-URL run auto-publishes,
// so the banner shows the Publishing stage instead of falling back to "Scanning".
const SCAN_PUBLISH_PHASE: Phase = {
  key: "publish",
  label: "Publish",
  stages: [{ keys: ["publishing"], label: "Publishing post" }],
};

const PUBLISH_PHASES: Phase[] = [
  {
    key: "publish",
    label: "Publish",
    stages: [
      { keys: ["pending"], label: "Queued" },
      { keys: ["processing"], label: "Publishing" },
      { keys: ["published"], label: "Live" },
    ],
  },
];

// Unified end-to-end pipeline (Trending Scanner → Post Generation → Publishing).
// Stage keys mirror the ai-service step strings; the Publishing phase activates
// on the manual `publishing` step written by generate_posts_node.
const PIPELINE_PHASES: Phase[] = [
  {
    key: "scan",
    label: "Trending Scanner",
    stages: [
      { keys: ["crawling", "collecting"], label: "Crawl HackerNews" },
      { keys: ["analyzing"], label: "Analyze trends" },
      { keys: ["saving_report", "persisting"], label: "Save report" },
    ],
  },
  {
    key: "generate",
    label: "Post Generation",
    stages: [
      { keys: ["generating_content", "post_strategy"], label: "Plan strategy" },
      { keys: ["post_content"], label: "Write posts" },
      { keys: ["post_image_prompts", "post_images"], label: "Generate images" },
      { keys: ["post_review"], label: "Review" },
      { keys: ["post_packaging"], label: "Finalize" },
    ],
  },
  {
    key: "publish",
    label: "Publishing Post",
    stages: [{ keys: ["publishing"], label: "Publishing post" }],
  },
];

const VIDEO_PHASES: Phase[] = [
  {
    key: "prepare",
    label: "Prepare",
    stages: [
      { keys: ["queued"], label: "Queued" },
      { keys: ["downloading"], label: "Download" },
      { keys: ["transcribing"], label: "Transcribe" },
    ],
  },
  {
    key: "produce",
    label: "Produce",
    stages: [
      { keys: ["analyzing"], label: "Select clips" },
      { keys: ["clipping"], label: "Cut clips" },
      { keys: ["captioning"], label: "Captions" },
      { keys: ["uploading"], label: "Upload" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function flatten(phases: Phase[]): Stage[] {
  return phases.flatMap((p) => p.stages);
}

function indexOfStep(phases: Phase[], step: string | null | undefined): number {
  if (!step) return -1;
  return flatten(phases).findIndex((s) => s.keys.includes(step));
}

/** Title for whichever phase currently holds the active stage. */
function phaseTitle(
  phases: Phase[],
  activeIndex: number,
  titles: Record<string, string>,
  fallback: string,
): string {
  if (activeIndex < 0) return fallback;
  let cursor = 0;
  for (const p of phases) {
    cursor += p.stages.length;
    if (activeIndex < cursor) return titles[p.key] ?? fallback;
  }
  return fallback;
}

function computePercent(
  total: number,
  activeIndex: number,
  state: PipelineState,
): number {
  if (state === "done" || state === "partial") return 100;
  if (activeIndex < 0 || total === 0) return 3;
  return Math.min(99, Math.round(((activeIndex + 0.5) / total) * 100));
}

// ── Mappers ───────────────────────────────────────────────────────────────

export function mapScanToView(
  s: ScanStatusResponse | null | undefined,
): PipelineView {
  // Show the Publishing stage only when the run actually auto-publishes (it
  // reached the `publishing` step or produced published posts); otherwise the
  // run honestly ends after Post Generation (manual-review mode).
  const includePublish =
    s?.current_step === "publishing" || !!s?.published_post_ids?.length;

  // For From-URL runs, rename the first crawl stage to "Crawl Article".
  const isArticleUrl = s?.source_type === "article_url";
  const baseScanPhases: Phase[] = isArticleUrl
    ? [
      {
        ...SCAN_PHASES[0],
        stages: [
          { keys: ["crawling", "collecting"], label: "Crawl Article" },
          ...SCAN_PHASES[0].stages.slice(1),
        ],
      },
      ...SCAN_PHASES.slice(1),
    ]
    : SCAN_PHASES;

  const phases = includePublish
    ? [...baseScanPhases, SCAN_PUBLISH_PHASE]
    : baseScanPhases;
  const total = flatten(phases).length;
  const step = s?.current_step ?? null;
  const status = s?.status ?? ScanStatus.RUNNING;
  const error = s?.error ?? null;
  const terminal =
    status === ScanStatus.COMPLETED ||
    status === ScanStatus.PARTIAL ||
    status === ScanStatus.FAILED;
  // "Truly done" only when the run is terminal AND the backend has cleared
  // current_step (it does this at the very end). While status is already
  // "completed" but a post-gen step is still running, we stay "running".
  const stepEmpty = !step;

  let state: PipelineState = "running";
  if (status === ScanStatus.FAILED) state = "failed";
  else if (terminal && stepEmpty)
    state = status === ScanStatus.PARTIAL ? "partial" : "done";

  const activeIndex =
    state === "done" || state === "partial"
      ? total - 1
      : indexOfStep(phases, step);

  const items = s?.total_items_found ?? 0;
  return {
    title:
      state === "failed"
        ? "Scan failed"
        : state === "done" || state === "partial"
          ? "Scan complete"
          : phaseTitle(
            phases,
            activeIndex,
            {
              scan: "Scanning",
              generate: "Generating posts",
              publish: "Publishing",
            },
            "Scanning",
          ),
    phases,
    activeIndex,
    state,
    percent: computePercent(total, activeIndex, state),
    error,
    startedAt: s?.started_at ?? null,
    meta: items > 0 ? `${items} trend${items === 1 ? "" : "s"}` : null,
  };
}

export function mapPipelineToView(
  s: PipelineRunStatusResponse | null | undefined,
): PipelineView {
  // Show only the stages that actually run: the Publishing phase appears once
  // the run reaches it (auto-publish), otherwise the run honestly ends after
  // Post Generation (manual-review mode).
  const includePublish =
    s?.stage === "publishing" || !!s?.published_post_ids?.length;

  // For From-URL runs, rename the first crawl stage to "Crawl Article".
  const isArticleUrl = s?.source_type === "article_url";
  const basePipelinePhases: Phase[] = isArticleUrl
    ? [
      {
        ...PIPELINE_PHASES[0],
        stages: [
          { keys: ["crawling", "collecting"], label: "Crawl Article" },
          ...PIPELINE_PHASES[0].stages.slice(1),
        ],
      },
      ...PIPELINE_PHASES.slice(1),
    ]
    : PIPELINE_PHASES;

  const phases = includePublish ? basePipelinePhases : basePipelinePhases.slice(0, 2);
  const total = flatten(phases).length;
  const step = s?.current_step ?? null;
  const status = s?.status ?? ScanStatus.RUNNING;
  const error = s?.error ?? null;
  const terminal =
    status === ScanStatus.COMPLETED ||
    status === ScanStatus.PARTIAL ||
    status === ScanStatus.FAILED;
  const stepEmpty = !step;

  let state: PipelineState = "running";
  if (status === ScanStatus.FAILED) state = "failed";
  else if (terminal && stepEmpty)
    state = status === ScanStatus.PARTIAL ? "partial" : "done";

  const activeIndex =
    state === "done" || state === "partial"
      ? total - 1
      : indexOfStep(phases, step);

  const items = s?.total_items_found ?? 0;
  return {
    title:
      state === "failed"
        ? "Pipeline failed"
        : state === "done" || state === "partial"
          ? "Pipeline complete"
          : phaseTitle(
            phases,
            activeIndex,
            {
              scan: "Scanning",
              generate: "Generating posts",
              publish: "Publishing",
            },
            "Running pipeline",
          ),
    phases,
    activeIndex,
    state,
    percent: computePercent(total, activeIndex, state),
    error,
    startedAt: s?.started_at ?? null,
    meta: items > 0 ? `${items} trend${items === 1 ? "" : "s"}` : null,
  };
}

export function mapPublishToView(
  s: PublishStatusResponse | null | undefined,
): PipelineView {
  const phases = PUBLISH_PHASES;
  const total = flatten(phases).length;
  const status = s?.status ?? PublishStatus.PENDING;

  let state: PipelineState = "running";
  if (status === PublishStatus.FAILED) state = "failed";
  else if (status === PublishStatus.PUBLISHED) state = "done";
  else if (status === PublishStatus.CANCELLED) state = "done"; // dismiss

  const activeIndex =
    state === "done"
      ? total - 1
      : status === PublishStatus.FAILED
        ? indexOfStep(phases, "processing")
        : indexOfStep(phases, status);

  return {
    title:
      state === "failed"
        ? "Publish failed"
        : status === PublishStatus.CANCELLED
          ? "Publish cancelled"
          : state === "done"
            ? "Published"
            : "Publishing",
    phases,
    activeIndex,
    state,
    percent: computePercent(total, activeIndex, state),
    error: state === "failed" ? FRIENDLY_PUBLISH_ERROR : null,
    startedAt: s?.created_at ?? null,
    meta: null,
  };
}

export function mapVideoToView(
  t: VideoTask | null | undefined,
): PipelineView {
  const phases = VIDEO_PHASES;
  const total = flatten(phases).length;
  const status = t?.status ?? "queued";

  let state: PipelineState = "running";
  if (status === "error") state = "failed";
  else if (status === "completed") state = "done";
  else if (status === "cancelled") state = "done"; // dismiss

  const activeIndex =
    state === "done" ? total - 1 : indexOfStep(phases, status);

  // The task carries a real numeric progress; prefer it while running.
  const numeric = t?.progress ?? 0;
  const percent =
    state === "done"
      ? 100
      : numeric > 0
        ? Math.min(99, Math.round(numeric))
        : computePercent(total, activeIndex, state);

  const clips = t?.clips?.length ?? 0;
  return {
    title:
      state === "failed"
        ? "Clip failed"
        : status === "cancelled"
          ? "Cancelled"
          : state === "done"
            ? "Clips ready"
            : phaseTitle(
              phases,
              activeIndex,
              { prepare: "Preparing video", produce: "Producing clips" },
              "Processing",
            ),
    phases,
    activeIndex,
    state,
    percent,
    error: state === "failed" ? (t?.errorMessage ?? "Pipeline error") : null,
    startedAt: t?.createdAt ?? null,
    meta: clips > 0 ? `${clips} clip${clips === 1 ? "" : "s"}` : null,
  };
}
