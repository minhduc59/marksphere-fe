"use client";
import { useState, useEffect } from "react";
import { KanbanSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceFilter } from "@/components/pipeline/source-filter";
import { ModeBadge } from "@/components/pipeline/mode-badge";
import { PipelineBoard } from "@/components/pipeline/board";
import { ScanPipelineProgress } from "@/components/pipeline/scan-pipeline-progress";
import { PublishPipelineProgress } from "@/components/pipeline/publish-pipeline-progress";
import { OverallPipelineProgress } from "@/components/pipeline/overall-pipeline-progress";
import { usePipelineBoard, type SourceFilter as SF } from "@/hooks/use-pipeline-board";
import { useScans } from "@/hooks/api/use-scans";
import { usePipelineStore } from "@/stores/pipeline-store";
import { ScanStatus } from "@/lib/api/types";

export default function PipelinePage() {
  const [sourceFilter, setSourceFilter] = useState<SF>("all");
  const { columns, isLoading } = usePipelineBoard(sourceFilter);
  const { data: scansData } = useScans({ pageSize: 5 });
  const activeScanId = usePipelineStore((s) => s.activeScanId);
  const activePublishId = usePipelineStore((s) => s.activePublishId);
  const activePipelineId = usePipelineStore((s) => s.activePipelineId);
  const queryClient = useQueryClient();

  // Determine if there's a running scan for the Daemon/One-time badge
  const hasRunningScan = scansData?.items.some(
    (s) => s.status === ScanStatus.RUNNING || s.status === ScanStatus.PENDING
  );

  // Poll every 8s as a fallback (the progress banner owns its own WS subscription)
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["publish"] });
    }, 8_000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const pendingReviewCount = columns.get("pending_review")?.length ?? 0;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <KanbanSquare className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-bold tracking-tight">Pipeline</h1>
          {pendingReviewCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
              {pendingReviewCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <SourceFilter value={sourceFilter} onChange={setSourceFilter} />
          <ModeBadge mode={hasRunningScan ? "daemon" : "onetime"} />
        </div>
      </div>

      {/* Live pipeline trackers — stay visible until dismissed or clean success */}
      {activePipelineId && (
        <OverallPipelineProgress pipelineId={activePipelineId} />
      )}
      {activeScanId && !activePipelineId && (
        <ScanPipelineProgress scanId={activeScanId} />
      )}
      {activePublishId && <PublishPipelineProgress publishId={activePublishId} />}

      {/* Board */}
      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-72 shrink-0" />
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <PipelineBoard columns={columns} />
        </div>
      )}
    </div>
  );
}
