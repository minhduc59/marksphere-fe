"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Film, Scissors } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteVideoClip,
  duplicateVideoClip,
  listVideoClips,
  type ListVideoClipsParams,
  type VideoClip,
  type VideoClipStatus,
} from "@/lib/api/video";
import { ClipCard } from "@/components/video-clipper/clip-card";

const DynamicVideoPlayer = dynamic(
  () => import("@/components/video-clipper/dynamic-video-player"),
  { ssr: false }
);

type StatusFilter = "all" | VideoClipStatus;
type SortField = NonNullable<ListVideoClipsParams["sort"]>;

export default function ClipsLibraryPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortField>("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [previewClip, setPreviewClip] = useState<VideoClip | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VideoClip | null>(null);

  const queryClient = useQueryClient();
  const queryKey = ["video-clips", { statusFilter, sort, order }] as const;

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () =>
      listVideoClips({
        status: statusFilter === "all" ? undefined : statusFilter,
        sort,
        order,
        limit: 100,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (clipId: string) => deleteVideoClip(clipId),
    onSuccess: () => {
      toast.success("Clip deleted");
      queryClient.invalidateQueries({ queryKey: ["video-clips"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete clip");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (clipId: string) => duplicateVideoClip(clipId),
    onSuccess: () => {
      toast.success("Clip duplicated");
      queryClient.invalidateQueries({ queryKey: ["video-clips"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate clip");
    },
  });

  const clips = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Film className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clips Library</h1>
            <p className="text-sm text-muted-foreground">
              All clips you’ve processed, across every Video Clipper task.
            </p>
          </div>
        </div>
        <Button asChild>
          <a href="/video-clipper">
            <Scissors className="mr-2 h-4 w-4" /> New Clip
          </a>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 py-4">
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Awaiting review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Sort by</Label>
            <Select value={sort} onValueChange={(v) => setSort(v as SortField)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Order</Label>
            <Select value={order} onValueChange={(v) => setOrder(v as "asc" | "desc")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto text-xs text-muted-foreground">
            {data ? `${data.total} clip${data.total === 1 ? "" : "s"}` : null}
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Film}
          title="Could not load clips"
          description="Something went wrong while fetching your clips. Try again in a moment."
        />
      ) : clips.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No clips yet"
          description="Process a video to start filling up your Clips Library."
          action={{ label: "Create a clip", href: "/video-clipper" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clips.map((clip) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              onPreview={setPreviewClip}
              onDuplicate={(c) => duplicateMutation.mutate(c.id)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Preview dialog */}
      <Dialog
        open={!!previewClip}
        onOpenChange={(open) => !open && setPreviewClip(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {previewClip?.title || "Clip preview"}
            </DialogTitle>
          </DialogHeader>
          {previewClip ? (
            <DynamicVideoPlayer src={previewClip.storageUrl} autoPlay />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this clip?</AlertDialogTitle>
            <AlertDialogDescription>
              The clip and its uploaded video will be removed permanently. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
