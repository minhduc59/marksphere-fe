"use client";

import { RefreshCw, Settings } from "lucide-react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function MonitoringPageHeader() {
  const queryClient = useQueryClient();
  const fetching = useIsFetching({ queryKey: ["admin", "monitoring"] }) > 0;

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["admin", "monitoring"] });
  }

  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          System Monitor
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time infrastructure health and processing pipeline status.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleRefresh}
          disabled={fetching}
          className="flex items-center gap-2 bg-foreground px-4 py-2 text-[11px] font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", fetching && "animate-spin")} />
          Refresh Dashboard
        </button>
        <button className="flex items-center gap-2 border border-border px-4 py-2 text-[11px] font-bold text-foreground transition-colors hover:bg-muted">
          <Settings className="h-3.5 w-3.5" />
          Node Settings
        </button>
      </div>
    </div>
  );
}
