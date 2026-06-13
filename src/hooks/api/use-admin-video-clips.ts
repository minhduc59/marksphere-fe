import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAdminVideoClips,
  getAdminVideoClipsForTask,
  getAdminVideoClipsStats,
  retryVideoClipTask,
} from "@/lib/api/admin-video-clips";
import type { AdminVideoClipsFilters } from "@/lib/api/types";

export function useAdminVideoClips(filters?: AdminVideoClipsFilters) {
  return useQuery({
    queryKey: ["admin", "video-clips", "list", filters],
    queryFn: () => getAdminVideoClips(filters),
    placeholderData: (prev) => prev,
    refetchInterval: 30_000,
  });
}

export function useAdminVideoClipsStats() {
  return useQuery({
    queryKey: ["admin", "video-clips", "stats"],
    queryFn: getAdminVideoClipsStats,
    refetchInterval: 30_000,
  });
}

export function useAdminVideoClipsForTask(taskId: string | null) {
  return useQuery({
    queryKey: ["admin", "video-clips", "clips", taskId],
    queryFn: () => getAdminVideoClipsForTask(taskId as string),
    enabled: !!taskId,
  });
}

export function useRetryVideoClipTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => retryVideoClipTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "video-clips"] });
      toast.success("Pipeline re-triggered");
    },
    onError: (err) => toast.error(extractError(err, "Failed to retry task")),
  });
}

function extractError(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: unknown }).response === "object"
  ) {
    const message = (err as { response?: { data?: { message?: unknown } } })
      .response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string")
      return message[0];
  }
  return fallback;
}
