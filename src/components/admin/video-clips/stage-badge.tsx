import { cn } from "@/lib/utils";
import type { PipelineStage } from "./data";

interface StageBadgeProps {
  stage: PipelineStage;
}

const STAGE_CONFIG: Record<
  PipelineStage,
  { label: string; dotClass: string; wrapperClass: string }
> = {
  queued: {
    label: "Queued",
    dotClass: "bg-muted-foreground/40",
    wrapperClass: "border-border bg-muted/30 text-muted-foreground",
  },
  downloading: {
    label: "Downloading",
    dotClass: "bg-blue-600 animate-pulse",
    wrapperClass: "border-blue-200 bg-blue-50 text-blue-700",
  },
  transcribing: {
    label: "Transcribing",
    dotClass: "bg-purple-600 animate-pulse",
    wrapperClass: "border-purple-200 bg-purple-50 text-purple-700",
  },
  analyzing: {
    label: "Analyzing",
    dotClass: "bg-purple-600 animate-pulse",
    wrapperClass: "border-purple-200 bg-purple-50 text-purple-700",
  },
  clipping: {
    label: "Clipping",
    dotClass: "bg-blue-600 animate-pulse",
    wrapperClass: "border-blue-200 bg-blue-50 text-blue-700",
  },
  captioning: {
    label: "Captioning",
    dotClass: "bg-blue-600 animate-pulse",
    wrapperClass: "border-blue-200 bg-blue-50 text-blue-700",
  },
  uploading: {
    label: "Uploading",
    dotClass: "bg-blue-600 animate-pulse",
    wrapperClass: "border-blue-200 bg-blue-50 text-blue-700",
  },
  completed: {
    label: "Success",
    dotClass: "bg-green-600",
    wrapperClass: "border-green-200 bg-green-50 text-green-700",
  },
  error: {
    label: "Failed",
    dotClass: "bg-destructive",
    wrapperClass: "border-red-200 bg-red-50 text-red-700",
  },
  cancelled: {
    label: "Cancelled",
    dotClass: "bg-muted-foreground/40",
    wrapperClass: "border-border bg-muted/30 text-muted-foreground",
  },
};

/** Inline status pill matching the design's pipeline stage badges. */
export function StageBadge({ stage }: StageBadgeProps) {
  const config = STAGE_CONFIG[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide",
        config.wrapperClass
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
