"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { getSocket } from "@/lib/socket";
import { ScanStatus, type ScanStatusResponse } from "@/lib/api/types";

export function useScanProgress(scanId: string | null) {
  const [progress, setProgress] = useState<ScanStatusResponse | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!scanId || !accessToken) return;

    const socket = getSocket(accessToken);
    socket.emit("subscribe", { resource: "scan", id: scanId });

    const handleProgress = (data: ScanStatusResponse) => {
      setProgress(data);
    };

    const handleCompleted = (data: ScanStatusResponse) => {
      setProgress(data);
      queryClient.invalidateQueries({ queryKey: ["scans"] });
      queryClient.invalidateQueries({ queryKey: ["trends"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      if (data.status === ScanStatus.FAILED) {
        toast.error(data.error ?? "Scan failed");
      } else if (data.error) {
        // PARTIAL (0 posts) or COMPLETED with stage warnings
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
      socket.off("scan.progress", handleProgress);
      socket.off("scan.completed", handleCompleted);
      socket.off("scan.error", handleError);
    };
  }, [scanId, accessToken, queryClient]);

  return { progress, currentStep: progress?.current_step ?? null };
}
