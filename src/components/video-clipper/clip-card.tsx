"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  Play,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type VideoClip } from "@/lib/api/video";

interface ClipCardProps {
  clip: VideoClip;
  onPreview: (clip: VideoClip) => void;
  onDuplicate: (clip: VideoClip) => void;
  onDelete: (clip: VideoClip) => void;
}

// "Processing" only exists for tasks; a clip row only lands here after
// persist, so its status is always one of the terminal/review values below.
function StatusIndicator({ status }: { status: VideoClip["status"] }) {
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="h-3.5 w-3.5" />
        Failed
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Awaiting review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Ready
    </span>
  );
}

function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function downloadName(clip: VideoClip): string {
  const base = (clip.title || `clip-${clip.id.slice(0, 8)}`)
    .replace(/[^a-z0-9-_ ]/gi, "")
    .trim();
  return `${base || "clip"}.mp4`;
}

export function ClipCard({ clip, onPreview, onDuplicate, onDelete }: ClipCardProps) {
  const created = clip.createdAt
    ? formatDistanceToNow(new Date(clip.createdAt), { addSuffix: true })
    : "";

  const statusVariant: Record<VideoClip["status"], "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    approved: "default",
    rejected: "destructive",
    published: "default",
    failed: "destructive",
  };

  return (
    <Card className="group overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] bg-muted">
        {clip.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clip.thumbnailUrl}
            alt={clip.title ?? "Clip thumbnail"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Play className="h-10 w-10" />
          </div>
        )}

        {/* Duration */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {formatDuration(clip.durationSeconds)}
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => onPreview(clip)}
            aria-label="Preview"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" asChild aria-label="Download">
            <a href={clip.storageUrl} download={downloadName(clip)} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => onDuplicate(clip)}
            aria-label="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(clip)}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {clip.title || clip.transcriptSegment || "Untitled clip"}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">From: {clip.sourceRef || clip.taskId.slice(0, 8)}</span>
          <span>{created}</span>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant={statusVariant[clip.status]} className="capitalize">
            {clip.status}
          </Badge>
          <StatusIndicator status={clip.status} />
        </div>
      </div>
    </Card>
  );
}
