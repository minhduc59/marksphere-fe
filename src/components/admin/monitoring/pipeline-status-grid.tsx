"use client";

import { TrendingUp, Edit, Send, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonitoringPipelines } from "@/hooks/api/use-admin-monitoring";
import type { PipelineHealth, PipelineStatus } from "@/lib/api/types";

const STATUS_BADGE: Record<PipelineStatus, { label: string; className: string }> = {
  running: { label: "Running", className: "bg-green-100 text-green-800" },
  idle: { label: "Idle", className: "bg-muted text-muted-foreground" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
};

const ICONS: Record<PipelineHealth["key"], React.ReactNode> = {
  trend_scanner: <TrendingUp className="h-5 w-5 text-foreground" />,
  post_generator: <Edit className="h-5 w-5 text-foreground" />,
  publisher: <Send className="h-5 w-5 text-foreground" />,
  video_clipper: <Video className="h-5 w-5 text-foreground" />,
};

const BAR: Record<PipelineStatus, { width: string; className: string }> = {
  running: { width: "70%", className: "bg-foreground" },
  idle: { width: "0%", className: "bg-muted-foreground" },
  failed: { width: "100%", className: "bg-destructive" },
};

function subtitle(p: PipelineHealth): { text: string; danger: boolean } {
  if (p.status === "failed" && p.failedLast24h > 0) {
    return { text: `${p.failedLast24h} failed (24h)`, danger: true };
  }
  if (p.pending > 0) return { text: `Queue: ${p.pending} pending`, danger: false };
  if (p.lastActivityAt) {
    return {
      text: `Last activity: ${formatDistanceToNow(new Date(p.lastActivityAt))} ago`,
      danger: false,
    };
  }
  return { text: "No recent activity", danger: false };
}

function footer(p: PipelineHealth): string {
  if (p.status === "failed" && p.failedLast24h > 0) {
    return `${p.failedLast24h} error${p.failedLast24h === 1 ? "" : "s"} in 24h`;
  }
  return `${p.processedLastHour} processed/hr`;
}

export function PipelineStatusGrid() {
  const { data, isLoading } = useMonitoringPipelines();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[168px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {data.map((p) => {
        const badge = STATUS_BADGE[p.status];
        const bar = BAR[p.status];
        const sub = subtitle(p);
        return (
          <div key={p.key} className="border bg-card p-5 space-y-4">
            <div className="flex justify-between items-start">
              {ICONS[p.key]}
              <span
                className={cn(
                  "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full",
                  badge.className
                )}
              >
                {badge.label}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
              <p
                className={cn(
                  "text-[11px] text-muted-foreground",
                  sub.danger && "text-destructive font-semibold"
                )}
              >
                {sub.text}
              </p>
            </div>
            <div className="h-1.5 bg-muted">
              <div
                className={cn("h-full", bar.className)}
                style={{ width: bar.width }}
              />
            </div>
            <p
              className={cn(
                "text-[11px] font-medium",
                p.status === "failed" ? "text-destructive" : "text-foreground"
              )}
            >
              {footer(p)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
