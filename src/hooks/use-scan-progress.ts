"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { getSocket } from "@/lib/socket";
import { useScanStatus } from "@/hooks/api/use-scans";
import { mapScanToView } from "@/lib/pipeline/phases";
import { ScanStatus, type ScanStatusResponse } from "@/lib/api/types";

/**
 * Live scan + post-generation progress for a single scan run.
 *
 * Sources are merged (last-writer-wins): a REST seed via `useScanStatus`
 * (so the banner is populated immediately on mount / refresh and survives a
 * dropped socket) plus WebSocket `scan.progress|completed|error` events. The
 * "done" state is derived from the data (`mapScanToView`), not from the
 * completed event, so it stays correct even when the component mounts after
 * the run has already finished.
 */
export function useScanProgress(scanId: string | null) {
  const [progress, setProgress] = useState<ScanStatusResponse | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  // REST seed (3s poll) — keeps the banner alive without the socket.
  const { data: seed } = useScanStatus(scanId);
  useEffect(() => {
    if (seed) setProgress(seed);
  }, [seed]);

  useEffect(() => {
    if (!scanId || !accessToken) return;

    const socket = getSocket(accessToken);
    const subscribe = () => socket.emit("subscribe", { resource: "scan", id: scanId });
    subscribe();
    // Re-subscribe after a reconnect so a mid-run drop doesn't go silent.
    socket.on("connect", subscribe);

    const handleProgress = (data: ScanStatusResponse) => {
      setProgress(data);
      // Refresh the board as posts get produced during post-generation.
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    };

    const handleCompleted = (data: ScanStatusResponse) => {
      setProgress(data);
      queryClient.invalidateQueries({ queryKey: ["scans"] });
      queryClient.invalidateQueries({ queryKey: ["trends"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      if (data.status === ScanStatus.FAILED) {
        toast.error(data.error ?? "Scan failed");
      } else if (data.error) {
        if (data.status === ScanStatus.PARTIAL) {
          toast.error(data.error);
        } else {
          toast.warning(data.error);
        }
      } else {
        toast.success("Scan completed successfully!");
      }
    };

    const handleError = (data: ScanStatusResponse) => {
      setProgress(data);
      toast.error(data.error ?? "Scan encountered an unexpected error");
    };

    socket.on("scan.progress", handleProgress);
    socket.on("scan.completed", handleCompleted);
    socket.on("scan.error", handleError);

    return () => {
      socket.emit("unsubscribe", { resource: "scan", id: scanId });
      socket.off("connect", subscribe);
      socket.off("scan.progress", handleProgress);
      socket.off("scan.completed", handleCompleted);
      socket.off("scan.error", handleError);
    };
  }, [scanId, accessToken, queryClient]);

  return { progress, view: mapScanToView(progress) };
}
