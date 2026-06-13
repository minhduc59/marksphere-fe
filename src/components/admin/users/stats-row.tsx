"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUserStats } from "@/hooks/api/use-admin-users";

/** TikTok integration donut + New Users growth tile — top of the Users page. */
export function UsersStatsRow() {
  const { data, isLoading } = useAdminUserStats();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Skeleton className="h-[360px]" />
        <Skeleton className="h-[360px]" />
      </div>
    );
  }

  const { tiktokLinked, tiktokNotLinked, newThisWeek, deltaPct } = data;
  const totalCount = tiktokLinked + tiktokNotLinked;
  const linkedPct = totalCount === 0 ? 0 : Math.round((tiktokLinked / totalCount) * 100);
  const circumference = 2 * Math.PI * 15.9155;
  const dashArray = `${(linkedPct / 100) * circumference} ${circumference}`;

  const deltaPositive = (deltaPct ?? 0) >= 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* TikTok Integration tile */}
      <div className="border bg-card p-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">
          TikTok Integration
        </p>

        {/* Donut chart */}
        <div className="relative mx-auto mb-6 mt-6 h-40 w-40">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            {/* Track */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted"
            />
            {/* Fill */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={dashArray}
              strokeLinecap="butt"
              className="text-foreground"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold leading-none">
              {linkedPct}%
            </span>
            <span className="mt-1 text-[10px] font-bold uppercase text-muted-foreground">
              Linked
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-foreground" />
              <span className="text-xs text-muted-foreground">
                Linked Accounts
              </span>
            </div>
            <span className="text-xs font-bold text-foreground">
              {tiktokLinked.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-muted" />
              <span className="text-xs text-muted-foreground">Not Linked</span>
            </div>
            <span className="text-xs font-bold text-foreground">
              {tiktokNotLinked.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* New Users growth tile */}
      <div className="border bg-card p-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-foreground mb-4">
          New Users
        </p>
        <div className="mb-2 flex items-end gap-2">
          <span className="font-display text-4xl font-bold leading-none text-foreground">
            +{newThisWeek}
          </span>
          {deltaPct !== null && (
            <span
              className={cn(
                "mb-1 flex items-center text-xs font-bold",
                deltaPositive ? "text-green-600" : "text-destructive"
              )}
            >
              {deltaPositive ? (
                <TrendingUp className="mr-0.5 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-0.5 h-3 w-3" />
              )}
              {Math.abs(deltaPct)}%
            </span>
          )}
        </div>
        <p className="mb-6 text-xs text-muted-foreground">
          New sign-ups in the last 7 days
          {deltaPct !== null ? " vs. the prior week." : "."}
        </p>
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
              <span>Total Users</span>
              <span>{totalCount.toLocaleString()}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden bg-muted">
              <div
                className="h-full bg-foreground"
                style={{ width: `${linkedPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
