"use client";

import { AlertTriangle, Gauge, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminVideoClipsStats } from "@/hooks/api/use-admin-video-clips";

/** Format a duration in seconds as "Xm Ys" (or "Ys" under a minute). */
function formatProcessing(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/** Four KPI tiles for the Video Clipping Pipeline page. */
export function VideoClipsStatsRow({ className }: { className?: string }) {
  const { data, isLoading } = useAdminVideoClipsStats();

  if (isLoading || !data) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[152px]" />
        ))}
      </div>
    );
  }

  const {
    producedToday,
    producedTodayDeltaPct,
    inProgress,
    failedTasks,
    avgProcessingSeconds,
  } = data;
  const deltaPositive = (producedTodayDeltaPct ?? 0) >= 0;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {/* Produced Today */}
      <div className="border bg-card p-6">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Produced Today
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tracking-tight">
            {producedToday.toLocaleString()}
          </span>
          {producedTodayDeltaPct !== null && (
            <span
              className={cn(
                "flex items-center text-[10px] font-bold",
                deltaPositive ? "text-green-600" : "text-destructive"
              )}
            >
              {deltaPositive ? (
                <TrendingUp className="mr-0.5 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-0.5 h-3 w-3" />
              )}
              {Math.abs(producedTodayDeltaPct)}%
            </span>
          )}
        </div>
        <p className="mt-4 text-[10px] font-medium uppercase text-muted-foreground">
          Clips since midnight UTC
        </p>
      </div>

      {/* In-Progress */}
      <div className="border bg-card p-6">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          In-Progress
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tracking-tight">
            {inProgress.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">
            Active Tasks
          </span>
        </div>
        <div className="mt-4 flex gap-1">
          <div
            className={cn(
              "h-1.5 flex-1 bg-foreground",
              inProgress > 0 && "animate-pulse"
            )}
          />
          <div className="h-1.5 flex-1 bg-foreground opacity-50" />
          <div className="h-1.5 flex-1 bg-muted" />
        </div>
      </div>

      {/* Failed Tasks */}
      <div className="border bg-card p-6">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Failed Tasks
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={cn(
              "font-display text-2xl font-bold tracking-tight",
              failedTasks > 0 && "text-destructive"
            )}
          >
            {failedTasks.toLocaleString()}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold",
              failedTasks > 0 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {failedTasks > 0 ? "Attention Required" : "All Clear"}
          </span>
        </div>
        <div
          className={cn(
            "mt-4 flex items-center gap-2",
            failedTasks > 0 ? "text-destructive" : "text-muted-foreground"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase">Last 24 Hours</span>
        </div>
      </div>

      {/* Avg Processing Time */}
      <div className="border bg-card p-6">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Avg Processing Time
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tracking-tight">
            {formatProcessing(avgProcessingSeconds)}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">
            Per Task
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-muted-foreground">
          <Gauge className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase">
            Completed, last 7 days
          </span>
        </div>
      </div>
    </div>
  );
}
