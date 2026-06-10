"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { getSocket } from "@/lib/socket";
import { usePipelineRunStatus } from "@/hooks/api/use-pipeline-runs";
import { mapPipelineToView } from "@/lib/pipeline/phases";
import { ScanStatus, type PipelineRunStatusResponse } from "@/lib/api/types";

/**
 * Live unified pipeline progress (Trending Scanner → Post Generation →
 * Publishing Post) for a single pipeline run.
 *
 * Mirrors useScanProgress: a REST seed (3s poll) plus WebSocket
 * `pipeline.progress|completed|error` events, merged last-writer-wins. The
 * "done" state is derived from the data via `mapPipelineToView`.
 */
export function usePipelineProgress(pipelineId: string | null) {
  const [progress, setProgress] = useState<PipelineRunStatusResponse | null>(
    null,
  );
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const { data: seed } = usePipelineRunStatus(pipelineId);
  useEffect(() => {
    if (seed) setProgress(seed);
  }, [seed]);

  useEffect(() => {
    if (!pipelineId || !accessToken) return;

    const socket = getSocket(accessToken);
    const subscribe = () =>
      socket.emit("subscribe", { resource: "pipeline", id: pipelineId });
    subscribe();
    socket.on("connect", subscribe);

    const handleProgress = (data: PipelineRunStatusResponse) => {
      setProgress(data);
      // Posts appear during the generation stage; keep the board fresh.
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    };

    const handleCompleted = (data: PipelineRunStatusResponse) => {
      setProgress(data);
      queryClient.invalidateQueries({ queryKey: ["pipeline-runs"] });
      queryClient.invalidateQueries({ queryKey: ["scans"] });
      queryClient.invalidateQueries({ queryKey: ["trends"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["publish"] });

      const published = (data.published_post_ids?.length ?? 0) > 0;
      if (data.status === ScanStatus.FAILED) {
        toast.error(data.error ?? "Pipeline failed");
      } else if (data.error) {
        if (data.status === ScanStatus.PARTIAL) {
          toast.error(data.error);
        } else {
          toast.warning(data.error);
        }
      } else if (published) {
        toast.success("Pipeline complete — post published!");
      } else {
        toast.success("Pipeline completed successfully!");
      }
    };

    const handleError = (data: PipelineRunStatusResponse) => {
      setProgress(data);
      toast.error(data.error ?? "Pipeline encountered an unexpected error");
    };

    socket.on("pipeline.progress", handleProgress);
    socket.on("pipeline.completed", handleCompleted);
    socket.on("pipeline.error", handleError);

    return () => {
      socket.emit("unsubscribe", { resource: "pipeline", id: pipelineId });
      socket.off("connect", subscribe);
      socket.off("pipeline.progress", handleProgress);
      socket.off("pipeline.completed", handleCompleted);
      socket.off("pipeline.error", handleError);
    };
  }, [pipelineId, accessToken, queryClient]);

  return { progress, view: mapPipelineToView(progress) };
}
