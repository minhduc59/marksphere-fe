"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { getSocket } from "@/lib/socket";
import { mapVideoToView } from "@/lib/pipeline/phases";
import { getVideoTask, type VideoTask, type VideoTaskStatus } from "@/lib/api/video";

const TERMINAL: VideoTaskStatus[] = ["completed", "error", "cancelled"];

/**
 * Live video-clipper task progress.
 *
 * Seeds from `getVideoTask` (REST — also the source of the numeric `progress`
 * and the clips list) and merges Redis-backed WebSocket events
 * (`video.progress|completed|error`). Returns the raw task (for the clip-review
 * UI) plus a normalized `PipelineView`.
 */
export function useVideoProgress(taskId: string | null) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [task, setTask] = useState<VideoTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTerminal, setIsTerminal] = useState(false);

  const refetch = useCallback(async () => {
    if (!taskId) return;
    try {
      const t = await getVideoTask(taskId);
      setTask(t);
      if (TERMINAL.includes(t.status)) setIsTerminal(true);
    } catch {
      toast.error("Failed to load task");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!taskId || !accessToken || isTerminal) return;

    const socket = getSocket(accessToken);
    const subscribe = () => socket.emit("subscribe", { resource: "video", id: taskId });
    subscribe();
    socket.on("connect", subscribe);

    const onProgress = (data: { taskId: string; stage: string; message?: string }) => {
      if (data.taskId !== taskId) return;
      setTask((prev) => (prev ? { ...prev, status: data.stage as VideoTaskStatus } : prev));
    };
    const onCompleted = (data: { taskId: string }) => {
      if (data.taskId !== taskId) return;
      setIsTerminal(true);
      void refetch();
    };
    const onError = (data: { taskId: string; message: string }) => {
      if (data.taskId !== taskId) return;
      setIsTerminal(true);
      toast.error(`Pipeline error: ${data.message}`);
      void refetch();
    };

    socket.on("video.progress", onProgress);
    socket.on("video.completed", onCompleted);
    socket.on("video.error", onError);

    return () => {
      socket.emit("unsubscribe", { resource: "video", id: taskId });
      socket.off("connect", subscribe);
      socket.off("video.progress", onProgress);
      socket.off("video.completed", onCompleted);
      socket.off("video.error", onError);
    };
  }, [taskId, accessToken, isTerminal, refetch]);

  return { task, view: mapVideoToView(task), isLoading, isTerminal, refetch };
}
