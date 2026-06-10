"use client";

import { useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import DynamicVideoPlayer from "@/components/video-clipper/dynamic-video-player";
import { PipelineProgress } from "@/components/pipeline/pipeline-progress";
import { useVideoProgress } from "@/hooks/use-video-progress";
import { reviewClip, type VideoClip } from "@/lib/api/video";

interface TaskProgressProps {
  taskId: string;
  onNewClip: () => void;
}

export function TaskProgress({ taskId, onNewClip }: TaskProgressProps) {
  const { task, view, isLoading, refetch } = useVideoProgress(taskId);

  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [reviewingClipId, setReviewingClipId] = useState<string | null>(null);

  const handleReview = async (clip: VideoClip, action: "approve" | "reject") => {
    setReviewingClipId(clip.id);
    try {
      await reviewClip(clip.id, { action, feedback: feedbacks[clip.id] });
      toast.success(action === "approve" ? "Clip approved" : "Clip rejected");
      void refetch();
    } catch {
      toast.error("Review failed");
    } finally {
      setReviewingClipId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!task) {
    return <p className="text-muted-foreground">Task not found.</p>;
  }

  const clips = task.clips ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Video Clipper</h2>
          <span className="font-mono text-xs text-muted-foreground">{taskId.slice(0, 8)}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onNewClip}>
          New clip
        </Button>
      </div>

      {/* Unified pipeline progress */}
      <PipelineProgress view={view} />

      {/* Clips */}
      {clips.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Clips ({clips.length})</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clips.map((clip) => (
              <Card key={clip.id} className="overflow-hidden">
                <DynamicVideoPlayer src={clip.storageUrl} className="w-full" />
                <CardContent className="space-y-3 pt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Clip {clip.clipIndex + 1} &middot; {(clip.durationSeconds ?? 0).toFixed(1)}s
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        clip.status === "approved"
                          ? "border-green-500 text-green-700"
                          : clip.status === "rejected"
                          ? "border-red-500 text-red-700"
                          : ""
                      }
                    >
                      {clip.status}
                    </Badge>
                  </div>

                  {clip.llmRationale && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{clip.llmRationale}</p>
                  )}

                  {clip.status === "draft" && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Feedback (optional)"
                        value={feedbacks[clip.id] ?? ""}
                        onChange={(e) =>
                          setFeedbacks((prev) => ({ ...prev, [clip.id]: e.target.value }))
                        }
                        className="min-h-[60px] text-xs"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleReview(clip, "approve")}
                          disabled={reviewingClipId === clip.id}
                        >
                          {reviewingClipId === clip.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleReview(clip, "reject")}
                          disabled={reviewingClipId === clip.id}
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {task.status === "completed" && clips.length === 0 && (
        <p className="text-sm text-muted-foreground">No clips were generated.</p>
      )}
    </div>
  );
}
