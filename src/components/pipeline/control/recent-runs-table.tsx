"use client";

import { useState } from "react";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useScans } from "@/hooks/api/use-scans";
import { ScanStatus } from "@/lib/api/types";

const PAGE_SIZE = 8;

const PLATFORM_LABEL: Record<string, string> = { hackernews: "HackerNews" };

const STATUS_CLASS: Record<ScanStatus, string> = {
  [ScanStatus.PENDING]: "border-slate-200 bg-slate-50 text-slate-600",
  [ScanStatus.RUNNING]: "border-blue-200 bg-blue-50 text-blue-700",
  [ScanStatus.COMPLETED]: "border-slate-200 bg-white text-muted-foreground",
  [ScanStatus.PARTIAL]: "border-amber-200 bg-amber-50 text-amber-700",
  [ScanStatus.FAILED]: "border-red-200 bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<ScanStatus, string> = {
  [ScanStatus.PENDING]: "Queued",
  [ScanStatus.RUNNING]: "Running",
  [ScanStatus.COMPLETED]: "Completed",
  [ScanStatus.PARTIAL]: "Partial",
  [ScanStatus.FAILED]: "Failed",
};

function formatPlatforms(platforms: string[]): string {
  if (!platforms?.length) return "—";
  return platforms.map((p) => PLATFORM_LABEL[p] ?? p).join(", ");
}

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function modeLabel(triggeredType: string | null): string | null {
  if (triggeredType === "scheduled") return "Daemon";
  if (triggeredType === "manual") return "One-time";
  return null;
}

/** History of scan runs with mode, platforms, items found, duration, status. */
export function RecentRunsTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useScans(
    { page, pageSize: PAGE_SIZE },
    {
      refetchInterval: (q) =>
        q.state.data?.items.some(
          (s) =>
            s.status === ScanStatus.RUNNING || s.status === ScanStatus.PENDING
        )
          ? 5000
          : false,
    }
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent runs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No runs yet. Start a scan or pipeline to see history here.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Started</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Platforms</TableHead>
                    <TableHead className="text-center">Items Found</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((run) => {
                    const mode = modeLabel(run.triggeredType);
                    return (
                      <TableRow key={run.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(run.startedAt), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell>
                          {mode ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wide",
                                run.triggeredType === "scheduled" &&
                                  "border-primary bg-primary text-primary-foreground"
                              )}
                            >
                              {mode}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatPlatforms(run.platformsRequested)}
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {run.status === ScanStatus.RUNNING ||
                          run.status === ScanStatus.PENDING
                            ? "—"
                            : run.totalItemsFound}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">
                          {formatDuration(run.durationMs)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium",
                              STATUS_CLASS[run.status]
                            )}
                          >
                            {STATUS_LABEL[run.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Showing {items.length} of {total} runs
              </span>
              {pageCount > 1 && (
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onPageChange={setPage}
                />
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
