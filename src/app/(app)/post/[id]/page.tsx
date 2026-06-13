"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import DynamicVideoPlayer from "@/components/video-clipper/dynamic-video-player";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ContentStatusBadge } from "@/components/ui/content-status-badge";
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
import {
  usePost,
  useUpdatePostStatus,
  useReviewPost,
  useRetryPost,
  useDeletePost,
} from "@/hooks/api/use-posts";
import { usePublishNow, useAutoPublish } from "@/hooks/api/use-publish";
import { ContentStatus, PostFormat } from "@/lib/api/types";

const formatLabels: Record<PostFormat, string> = {
  [PostFormat.QUICK_TIPS]: "Quick Tips",
  [PostFormat.HOT_TAKE]: "Hot Take",
  [PostFormat.TRENDING_BREAKDOWN]: "Trending Breakdown",
  [PostFormat.DID_YOU_KNOW]: "Did You Know",
  [PostFormat.TUTORIAL_HACK]: "Tutorial Hack",
  [PostFormat.MYTH_BUSTERS]: "Myth Busters",
  [PostFormat.BEHIND_THE_TECH]: "Behind the Tech",
};

// Friendly labels for the auto-review criteria stored in `reviewCriteria`
// (snake_case keys from the post-generator's auto_review node).
const reviewCriteriaLabels: Record<string, string> = {
  hook_strength: "Hook Strength",
  key_points_structure: "Key Points Structure",
  value_density: "Value Density",
  data_points: "Data Points",
  tiktok_native_feel: "TikTok Native Feel",
  cta_quality: "CTA Quality",
  originality: "Originality",
  strategy_alignment: "Strategy Alignment",
  format_compliance: "Format Compliance",
};

// Friendly labels for the pipeline stage a failed post errored at.
const stageLabels: Record<string, string> = {
  strategy_alignment: "strategy alignment",
  content_generation: "content generation",
  image_prompt_creation: "image prompt creation",
  image_generation: "image generation",
  auto_review: "auto review",
};

export default function ContentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data: post, isLoading } = usePost(id);
  const updateStatus = useUpdatePostStatus();
  const review = useReviewPost();
  const retryPostMutation = useRetryPost();
  const publishNow = usePublishNow();
  const autoPublish = useAutoPublish();
  const deletePost = useDeletePost();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!post) {
    return <p className="text-muted-foreground">Post not found.</p>;
  }

  const isReadOnly = post.status === ContentStatus.PUBLISHED;

  function handleSendForRevision() {
    if (!post) return;
    const feedback = revisionFeedback.trim();
    if (!feedback) return;
    review.mutate(
      { id: post.id, action: "reject", feedback },
      {
        onSuccess: () => {
          setRevisionFeedback("");
          setRevisionOpen(false);
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/post">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">
            {post.trendTitle}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary">
              {formatLabels[post.format] ?? post.format}
            </Badge>
            <ContentStatusBadge status={post.status} />
          </div>
        </div>
      </div>

      {post.status === ContentStatus.FAILED && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="flex items-start justify-between gap-4 py-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-800">
                Generation failed
                {post.failedStage
                  ? ` at: ${stageLabels[post.failedStage] ?? post.failedStage}`
                  : ""}
              </p>
              {post.errorReason && (
                <p className="text-sm text-red-700">{post.errorReason}</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => retryPostMutation.mutate(post.id)}
              disabled={retryPostMutation.isPending}
            >
              {retryPostMutation.isPending ? "Retrying…" : "Retry"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Content */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Caption</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={post.caption}
                readOnly={isReadOnly}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="mt-2 text-right font-mono text-xs text-muted-foreground">
                {post.caption.length} characters
              </p>
            </CardContent>
          </Card>

          {/* Generated image — shown for photo posts with a generated image */}
          {post.imagePath && (post as { contentType?: string }).contentType !== "video" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Generated Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={post.imagePath}
                  alt="Generated image"
                  className="w-full rounded object-contain"
                />
              </CardContent>
            </Card>
          )}

          {/* Video preview — shown for video-type content posts */}
          {(post as { contentType?: string }).contentType === "video" && post.imagePath && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Video Clip</CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicVideoPlayer src={post.imagePath} />
              </CardContent>
            </Card>
          )}

          {/* Hashtags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hashtags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, i) => (
                  <Badge key={i} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          {post.cta && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Call to Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{post.cta}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Review + Actions */}
        <div className="space-y-4">
          {/* Review Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {post.reviewScore !== null && (
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold">
                    {post.reviewScore.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 10</span>
                </div>
              )}
              {post.reviewNotes && (
                <div className="bg-muted p-3 text-sm">{post.reviewNotes}</div>
              )}
              {post.reviewCriteria &&
                Object.keys(post.reviewCriteria).length > 0 && (
                  <div className="space-y-1.5">
                    {Object.entries(post.reviewCriteria).map(([key, val]) => {
                      const score =
                        typeof val === "number" ? val : Number(val);
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="text-muted-foreground">
                            {reviewCriteriaLabels[key] ?? key.replace(/_/g, " ")}
                          </span>
                          <span className="font-mono font-medium">
                            {Number.isFinite(score)
                              ? `${score}/10`
                              : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {post.engagementPrediction && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engagement</span>
                  <span className="font-medium">
                    {post.engagementPrediction}
                  </span>
                </div>
              )}
              {post.bestPostingDay && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best day</span>
                  <span className="font-medium">{post.bestPostingDay}</span>
                </div>
              )}
              {post.bestPostingTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best time</span>
                  <span className="font-mono">{post.bestPostingTime}</span>
                </div>
              )}
              {post.wordCount !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Word count</span>
                  <span className="font-mono">{post.wordCount}</span>
                </div>
              )}
              {post.trendUrl && (
                <a
                  href={post.trendUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  View original <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <Separator />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Created</span>
                <span>{format(new Date(post.createdAt), "MMM d, HH:mm")}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Revisions</span>
                <span>{post.revisionCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {!isReadOnly && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(post.status === ContentStatus.DRAFT ||
                  post.status === ContentStatus.FLAGGED_FOR_REVIEW ||
                  post.status === ContentStatus.NEEDS_REVISION) && (
                  <Button
                    className="w-full"
                    onClick={() =>
                      updateStatus.mutate({
                        id: post.id,
                        status: ContentStatus.APPROVED,
                      })
                    }
                    disabled={updateStatus.isPending}
                  >
                    Approve
                  </Button>
                )}

                {(post.status === ContentStatus.DRAFT ||
                  post.status === ContentStatus.NEEDS_REVISION ||
                  post.status === ContentStatus.FLAGGED_FOR_REVIEW) &&
                  (!revisionOpen ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setRevisionOpen(true)}
                      disabled={updateStatus.isPending || review.isPending}
                    >
                      {post.status === ContentStatus.DRAFT
                        ? "Needs Revision"
                        : "Send Feedback & Regenerate"}
                    </Button>
                  ) : (
                    <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50/50 p-3">
                      <Textarea
                        value={revisionFeedback}
                        onChange={(e) => setRevisionFeedback(e.target.value)}
                        placeholder="What should the AI fix? (e.g. hook is weak, tone too formal, add a concrete example)"
                        className="min-h-[90px] text-sm"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        The AI rewrites the post using your feedback, then moves
                        it back to Draft.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={handleSendForRevision}
                          disabled={
                            review.isPending || !revisionFeedback.trim()
                          }
                        >
                          {review.isPending ? "Sending…" : "Send for Revision"}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setRevisionOpen(false);
                            setRevisionFeedback("");
                          }}
                          disabled={review.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}

                {post.status === ContentStatus.APPROVED && (
                  <>
                    <Button
                      className="w-full"
                      onClick={() =>
                        publishNow.mutate({ postId: post.id })
                      }
                      disabled={publishNow.isPending}
                    >
                      Publish Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        autoPublish.mutate({ postId: post.id })
                      }
                      disabled={autoPublish.isPending}
                    >
                      Auto-publish (Golden Hour)
                    </Button>
                  </>
                )}

                <Separator />
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setConfirmDelete(true)}
                  disabled={deletePost.isPending}
                >
                  Delete Post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the post and its publish records. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletePost.mutate(post.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
