"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SectionPanel } from "@/components/admin";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonitoringErrors } from "@/hooks/api/use-admin-monitoring";
import type { ErrorSeverity } from "@/lib/api/types";

const PAGE_SIZE = 25;

const SEVERITY_CLASS: Record<ErrorSeverity, string> = {
  CRITICAL: "bg-destructive/10 text-destructive",
  WARNING: "bg-amber-100 text-amber-800",
  INFO: "bg-muted text-muted-foreground",
};

const FILTER_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All Severities", value: "all" },
  { label: "Critical", value: "CRITICAL" },
  { label: "Warning", value: "WARNING" },
];

export function ErrorLogTable() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useMonitoringErrors({
    severity: filter === "all" ? undefined : (filter as ErrorSeverity),
    page,
    pageSize: PAGE_SIZE,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  function handleFilter(v: string) {
    setFilter(v);
    setPage(1);
  }

  const action = (
    <div className="flex items-center gap-4">
      <select
        value={filter}
        onChange={(e) => handleFilter(e.target.value)}
        className="border border-border bg-card text-[11px] px-2 py-1 focus:outline-none focus:ring-1 focus:ring-foreground"
      >
        {FILTER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button className="flex items-center gap-1 text-[11px] font-bold text-foreground underline">
        <Download className="h-3 w-3" />
        Export Logs
      </button>
    </div>
  );

  return (
    <SectionPanel title="ERROR LOG" action={action} bodyPadding={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3">Severity</th>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Node</th>
              <th className="px-6 py-3">Message</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-6 py-4">
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-destructive"
                >
                  Failed to load error log. Please try again.
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  No system events recorded.
                </td>
              </tr>
            ) : (
              items.map((entry, i) => (
                <tr key={i} className="transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-[10px] font-bold",
                        SEVERITY_CLASS[entry.severity]
                      )}
                    >
                      {entry.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-muted-foreground">
                    {format(new Date(entry.timestamp), "yyyy-MM-dd HH:mm:ss")}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px]">{entry.node}</td>
                  <td className="px-6 py-4 text-foreground">{entry.message}</td>
                  <td className="px-6 py-4">
                    <button className="text-sm font-medium text-foreground hover:font-bold">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t bg-card px-6 py-4">
        <p className="text-[11px] text-muted-foreground">
          {total === 0
            ? "No system events"
            : `Showing ${start}–${end} of ${total} system events`}
        </p>
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>
    </SectionPanel>
  );
}
