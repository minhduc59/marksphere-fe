"use client";

import { RefreshCw } from "lucide-react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { VideoClipsStatsRow, VideoClipsJobsTable } from "@/components/admin/video-clips";
import { cn } from "@/lib/utils";

export default function VideoClipsPage() {
  const queryClient = useQueryClient();
  const fetching = useIsFetching({ queryKey: ["admin", "video-clips"] }) > 0;

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["admin", "video-clips"] });
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor AI-driven segmentation and transcription status.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={fetching}
            className="gap-2 rounded-none"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", fetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI tiles */}
      <VideoClipsStatsRow />

      {/* Jobs table */}
      <VideoClipsJobsTable />
    </div>
  );
}
