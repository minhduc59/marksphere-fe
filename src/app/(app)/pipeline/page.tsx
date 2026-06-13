"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { Cog } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PipelineActionCards } from "@/components/pipeline/control/action-cards";
import { RunningNow } from "@/components/pipeline/control/running-now";
import { ActiveScheduleCard } from "@/components/pipeline/control/active-schedule-card";
import { RecentRunsTable } from "@/components/pipeline/control/recent-runs-table";
import { useScans } from "@/hooks/api/use-scans";
import { usePipelineRuns } from "@/hooks/api/use-pipeline-runs";
import { usePipelineSchedule } from "@/hooks/api/use-pipeline-schedule";
import { ScanStatus } from "@/lib/api/types";

// Mirrors the backend SCAN_STALE_TIMEOUT_MINUTES watchdog: a run older than
// this is treated as stuck so it no longer disables the action buttons.
const STALE_RUN_MS = 30 * 60 * 1000;

function isActiveRun(status: ScanStatus, startedAt: string | null): boolean {
  if (status !== ScanStatus.RUNNING && status !== ScanStatus.PENDING) return false;
  if (!startedAt) return true;
  return Date.now() - new Date(startedAt).getTime() < STALE_RUN_MS;
}

export default function PipelinePage() {
  const { data: scansData } = useScans(
    { pageSize: 5 },
    {
      refetchInterval: (q) =>
        q.state.data?.items.some((s) => isActiveRun(s.status, s.startedAt))
          ? 5000
          : false,
    }
  );
  const { data: pipelineRuns } = usePipelineRuns(
    { pageSize: 5 },
    {
      refetchInterval: (q) =>
        q.state.data?.items.some((p) => isActiveRun(p.status, p.created_at))
          ? 5000
          : false,
    }
  );
  const { data: schedule } = usePipelineSchedule();

  const hasRunningScan = scansData?.items.some((s) =>
    isActiveRun(s.status, s.startedAt)
  );
  const hasRunningPipeline = pipelineRuns?.items?.some((p) =>
    isActiveRun(p.status, p.created_at)
  );

  const lastRun = scansData?.items?.[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <Badge
            variant="outline"
            className="gap-1 text-[10px] font-bold uppercase tracking-wide"
          >
            <Cog className="h-3 w-3" />
            {schedule ? "Daemon" : "Manual"}
          </Badge>
          {lastRun && (
            <span className="text-xs text-muted-foreground">
              Last run{" "}
              {formatDistanceToNowStrict(new Date(lastRun.startedAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
      </div>

      {/* Action bar */}
      <PipelineActionCards
        scanDisabled={hasRunningScan}
        pipelineDisabled={hasRunningScan || hasRunningPipeline}
      />

      {/* Running now + active schedule */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RunningNow />
        </div>
        <div className="lg:col-span-1">
          <ActiveScheduleCard />
        </div>
      </div>

      {/* Run history */}
      <RecentRunsTable />
    </div>
  );
}
