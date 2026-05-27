"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScanProgress } from "@/hooks/use-scan-progress";
import { usePipelineStore } from "@/stores/pipeline-store";
import { ScanStatus } from "@/lib/api/types";

// Steps match _NODE_STEP_MAP + _POST_GEN_STEP_MAP in ai-service/app/agents/
const STEPS = [
  { keys: ["crawling", "collecting"],                label: "Crawling HackerNews" },
  { keys: ["analyzing"],                             label: "Analyzing Trends" },
  { keys: ["saving_report", "persisting"],           label: "Saving Report" },
  { keys: ["generating_content", "post_strategy"],   label: "Planning Strategy" },
  { keys: ["post_content"],                          label: "Writing Posts" },
  { keys: ["post_image_prompts", "post_images"],     label: "Generating Images" },
  { keys: ["post_review"],                           label: "Reviewing Posts" },
  { keys: ["post_packaging"],                        label: "Finalizing" },
] as const;

interface Props {
  scanId: string;
}

export function ScanPipelineProgress({ scanId }: Props) {
  const { progress, currentStep } = useScanProgress(scanId);
  const setActiveScan = usePipelineStore((s) => s.setActiveScan);

  const errorMsg = progress?.error ?? null;
  const isFailed = !!errorMsg;
  const isCompleted = progress?.status === ScanStatus.COMPLETED;

  // Auto-dismiss after clean success so the banner doesn't linger
  useEffect(() => {
    if (isCompleted && !isFailed) {
      const t = setTimeout(() => setActiveScan(null), 3000);
      return () => clearTimeout(t);
    }
  }, [isCompleted, isFailed, setActiveScan]);

  const activeIndex = STEPS.findIndex(
    (s) => currentStep && (s.keys as readonly string[]).includes(currentStep)
  );

  function handleDismiss() {
    setActiveScan(null);
  }

  return (
    <div className={cn(
      "relative flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border px-4 py-2.5 pr-9",
      isFailed ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"
    )}>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className={cn(
          "absolute right-2 top-2 rounded p-0.5 transition-colors",
          isFailed
            ? "text-red-400 hover:bg-red-100 hover:text-red-600"
            : "text-blue-400 hover:bg-blue-100 hover:text-blue-600"
        )}
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Status indicator */}
      <div className="flex shrink-0 items-center gap-1.5">
        {isFailed ? (
          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
        )}
        <span className={cn(
          "text-xs font-semibold",
          isFailed ? "text-red-700" : "text-blue-700"
        )}>
          {isFailed ? "Pipeline error" : "Scan running"}
        </span>
      </div>

      <span className={cn("text-sm", isFailed ? "text-red-300" : "text-blue-300")}>·</span>

      {/* Step list — failed step highlighted in red */}
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {STEPS.map((step, i) => {
          const isThisStepFailed = isFailed && activeIndex !== -1 && i === activeIndex;
          const done =
            activeIndex !== -1 && i < activeIndex && (!isFailed || i < activeIndex);
          const active = !isFailed && i === activeIndex;

          return (
            <li key={step.label} className="flex items-center gap-1">
              {i > 0 && (
                <span className={cn(
                  "text-xs select-none",
                  isFailed ? "text-red-300" : "text-blue-300"
                )}>›</span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs",
                  done             && "text-teal-600",
                  active           && "font-semibold text-blue-700",
                  isThisStepFailed && "font-semibold text-red-600",
                  !done && !active && !isThisStepFailed && (
                    isFailed ? "text-red-300/60" : "text-blue-400/70"
                  ),
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                ) : isThisStepFailed ? (
                  <XCircle className="h-3 w-3 shrink-0" />
                ) : active ? (
                  <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                ) : null}
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Error detail below the step row */}
      {isFailed && errorMsg && (
        <>
          <span className="w-full" />
          <p
            className="text-xs text-red-600 pl-5 truncate flex-1"
            title={errorMsg}
          >
            {errorMsg}
          </p>
        </>
      )}
    </div>
  );
}
