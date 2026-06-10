"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getSocket } from "@/lib/socket";
import { usePublishStatus } from "@/hooks/api/use-publish";
import { mapPublishToView } from "@/lib/pipeline/phases";
import type { PublishStatusResponse } from "@/lib/api/types";

/**
 * Live publish progress for a single published-post id.
 *
 * Seeds from `usePublishStatus` (REST) and merges WebSocket
 * `publish.status_changed` events. Toasts/cache-invalidation are intentionally
 * handled globally in `useSocket`, so this hook only produces the view.
 */
export function usePublishProgress(publishId: string | null) {
  const [status, setStatus] = useState<PublishStatusResponse | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: seed } = usePublishStatus(publishId);
  useEffect(() => {
    if (seed) setStatus(seed);
  }, [seed]);

  useEffect(() => {
    if (!publishId || !accessToken) return;

    const socket = getSocket(accessToken);
    const subscribe = () => socket.emit("subscribe", { resource: "publish", id: publishId });
    subscribe();
    socket.on("connect", subscribe);

    const handleStatusChanged = (data: PublishStatusResponse) => setStatus(data);
    socket.on("publish.status_changed", handleStatusChanged);

    return () => {
      socket.emit("unsubscribe", { resource: "publish", id: publishId });
      socket.off("connect", subscribe);
      socket.off("publish.status_changed", handleStatusChanged);
    };
  }, [publishId, accessToken]);

  return { status, view: mapPublishToView(status) };
}
