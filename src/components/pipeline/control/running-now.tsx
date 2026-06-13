"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanPipelineProgress } from "@/components/pipeline/scan-pipeline-progress";
import { PublishPipelineProgress } from "@/components/pipeline/publish-pipeline-progress";
import { OverallPipelineProgress } from "@/components/pipeline/overall-pipeline-progress";
import { usePipelineStore } from "@/stores/pipeline-store";

/**
 * "Running now" — the live, detailed state of the current run. Reuses the same
 * PipelineProgress trackers as the rest of the app (phases, sub-steps, percent,
 * elapsed timer, errors), so the detail level matches the pipeline status bar.
 */
export function RunningNow() {
  const activeScanId = usePipelineStore((s) => s.activeScanId);
  const activePublishId = usePipelineStore((s) => s.activePublishId);
  const activePipelineId = usePipelineStore((s) => s.activePipelineId);

  const running = Boolean(activePipelineId || activeScanId || activePublishId);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative flex h-2.5 w-2.5">
            {running && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                running ? "bg-primary" : "bg-muted-foreground/40"
              }`}
            />
          </span>
          Running now
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activePipelineId && (
          <OverallPipelineProgress pipelineId={activePipelineId} />
        )}
        {activeScanId && !activePipelineId && (
          <ScanPipelineProgress scanId={activeScanId} />
        )}
        {activePublishId && (
          <PublishPipelineProgress publishId={activePublishId} />
        )}
        {!running && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing running. Start a scan or pipeline above to see live progress.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
