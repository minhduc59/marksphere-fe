import { format, formatDistanceToNow } from "date-fns";
import type { AdminVideoClipJob } from "@/lib/api/types";

/** All VideoTask pipeline statuses surfaced by the admin API. */
export type PipelineStage =
  | "queued"
  | "downloading"
  | "transcribing"
  | "analyzing"
  | "clipping"
  | "captioning"
  | "uploading"
  | "completed"
  | "error"
  | "cancelled";

/** Display-shaped row derived from an {@link AdminVideoClipJob}. */
export interface VideoClipJob {
  /** VideoTask id — used as the React key and for the Retry action. */
  id: string;
  filename: string;
  url: string;
  ownerInitials: string;
  ownerName: string;
  stage: PipelineStage;
  clipsProduced: number;
  clipsTotal: number;
  /** Source-video duration is not stored on VideoTask → always "—". */
  duration: string;
  relativeTime: string;
  absoluteTime: string;
  errorMessage?: string;
  thumbnailUrl?: string;
}

const KNOWN_STAGES = new Set<PipelineStage>([
  "queued",
  "downloading",
  "transcribing",
  "analyzing",
  "clipping",
  "captioning",
  "uploading",
  "completed",
  "error",
  "cancelled",
]);

function toStage(status: string): PipelineStage {
  return KNOWN_STAGES.has(status as PipelineStage)
    ? (status as PipelineStage)
    : "queued";
}

/** Two-letter initials from a display name or email local-part. */
function initialsFrom(name: string): string {
  const parts = name.trim().split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Human label for the source: file basename for uploads, the URL otherwise. */
function sourceLabel(job: AdminVideoClipJob): string {
  if (job.sourceType === "upload") {
    const segment = job.sourceRef.split("/").pop() ?? job.sourceRef;
    return segment || job.sourceRef;
  }
  return job.sourceRef;
}

/** Map an API job onto the table's display shape. */
export function toVideoClipJob(job: AdminVideoClipJob): VideoClipJob {
  const ownerName =
    job.owner?.displayName?.trim() || job.owner?.email || "Unknown";
  const created = new Date(job.createdAt);
  return {
    id: job.id,
    filename: sourceLabel(job),
    url:
      job.status === "error" && job.errorMessage
        ? job.errorMessage
        : job.sourceRef,
    ownerInitials: initialsFrom(ownerName),
    ownerName,
    stage: toStage(job.status),
    clipsProduced: job.clipsProduced,
    clipsTotal: job.clipsTotal,
    duration: "—",
    relativeTime: `${formatDistanceToNow(created)} ago`,
    absoluteTime: format(created, "MMM d, HH:mm"),
    errorMessage: job.errorMessage ?? undefined,
    thumbnailUrl: job.thumbnailUrl ?? undefined,
  };
}
