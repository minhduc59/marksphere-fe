"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminVideoClipsForTask } from "@/hooks/api/use-admin-video-clips";
import { cn } from "@/lib/utils";

interface ClipsModalProps {
  /** VideoTask id whose clips to show; null keeps the modal closed. */
  taskId: string | null;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const STATUS_CLASS: Record<string, string> = {
  approved: "bg-green-50 text-green-700 border-green-200",
  published: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  draft: "bg-muted/40 text-muted-foreground border-border",
};

export function ClipsModal({ taskId, title, open, onOpenChange }: ClipsModalProps) {
  const { data: clips, isLoading, isError } = useAdminVideoClipsForTask(
    open ? taskId : null
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{title}</DialogTitle>
          <DialogDescription>
            {clips ? `${clips.length} clip${clips.length === 1 ? "" : "s"} produced` : "Produced clips"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="py-12 text-center text-sm text-destructive">
            Failed to load clips. Please try again.
          </p>
        ) : !clips || clips.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No clips were produced for this task.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {clips.map((clip) => (
              <div key={clip.id} className="border bg-card">
                <video
                  src={clip.storageUrl}
                  poster={clip.thumbnailUrl ?? undefined}
                  controls
                  preload="metadata"
                  className="aspect-video w-full bg-black"
                />
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">
                      {clip.title || `Clip ${clip.clipIndex + 1}`}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        STATUS_CLASS[clip.status] ??
                          "bg-muted/40 text-muted-foreground border-border"
                      )}
                    >
                      {clip.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span>{formatDuration(clip.durationSeconds)}</span>
                    {clip.llmScore !== null && (
                      <span>Score: {clip.llmScore.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
