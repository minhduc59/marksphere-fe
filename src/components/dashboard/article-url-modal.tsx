"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreatePostFromArticle } from "@/hooks/api/use-posts";
import { articleSchema, type ArticleInput } from "@/lib/api/posts";

const PUBLISH_MODES = [
  { value: "auto", label: "Golden Hour", description: "Publish at the optimal engagement time" },
  { value: "manual", label: "Immediate", description: "Publish as soon as approved" },
  { value: "schedule", label: "Fixed Time", description: "Publish daily at a specific time" },
] as const;

interface ArticleUrlModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArticleUrlModal({ open, onOpenChange }: ArticleUrlModalProps) {
  const mutation = useCreatePostFromArticle();
  // When off, no publish_settings are sent — the AI service falls back to the
  // user's saved PipelineConfig.
  const [customize, setCustomize] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ArticleInput>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      url: "",
      options: { num_posts: 3 },
      publish_settings: {
        require_review: true,
        auto_approve_threshold: 7,
        auto_publish: false,
        publish_mode: "auto",
        scheduled_publish_time: "",
      },
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
      setCustomize(false);
    }
  }, [open, reset]);

  const requireReview = watch("publish_settings.require_review");
  const autoPublish = watch("publish_settings.auto_publish");
  const publishMode = watch("publish_settings.publish_mode");

  async function onSubmit(values: ArticleInput) {
    const payload: ArticleInput = { ...values };
    if (!customize) {
      delete payload.publish_settings;
    } else if (payload.publish_settings && !payload.publish_settings.scheduled_publish_time) {
      // Empty string is meaningless to the backend — drop it.
      delete payload.publish_settings.scheduled_publish_time;
    }
    await mutation.mutateAsync(payload);
    onOpenChange(false);
  }

  const pending = isSubmitting || mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>From Article URL</DialogTitle>
          <DialogDescription>
            Paste a public article URL. We&apos;ll crawl it and generate posts
            using the same pipeline as a trend scan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Article URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/blog/great-article"
              autoFocus
              {...register("url")}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_posts">Number of posts (1–10)</Label>
            <Input
              id="num_posts"
              type="number"
              min={1}
              max={10}
              {...register("options.num_posts", { valueAsNumber: true })}
            />
            {errors.options?.num_posts && (
              <p className="text-xs text-destructive">
                {errors.options.num_posts.message}
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="customize" className="cursor-pointer">
                  Customize review &amp; publishing
                </Label>
                <p className="text-xs text-muted-foreground">
                  When off, your saved pipeline settings are used.
                </p>
              </div>
              <Switch
                id="customize"
                checked={customize}
                onCheckedChange={setCustomize}
              />
            </div>

            {customize && (
              <div className="space-y-4 border-t pt-4">
                {/* Review */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="require_review"
                      className="cursor-pointer"
                    >
                      Require human review
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      When off, posts above the threshold are auto-approved.
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="publish_settings.require_review"
                    render={({ field }) => (
                      <Switch
                        id="require_review"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {!requireReview && (
                  <div className="space-y-2">
                    <Label htmlFor="auto_approve_threshold">
                      Auto-approve threshold (0–10)
                    </Label>
                    <Input
                      id="auto_approve_threshold"
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      {...register("publish_settings.auto_approve_threshold", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                )}

                {/* Publishing */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto_publish" className="cursor-pointer">
                      Auto-publish approved posts
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically queue each approved post for publishing.
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="publish_settings.auto_publish"
                    render={({ field }) => (
                      <Switch
                        id="auto_publish"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {autoPublish && (
                  <>
                    <div className="space-y-2">
                      <Label>Publish timing</Label>
                      <div className="flex flex-wrap gap-2">
                        {PUBLISH_MODES.map((mode) => (
                          <button
                            key={mode.value}
                            type="button"
                            onClick={() =>
                              setValue("publish_settings.publish_mode", mode.value, {
                                shouldDirty: true,
                              })
                            }
                            className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                              publishMode === mode.value
                                ? "border-foreground bg-foreground text-background"
                                : "border-border hover:border-foreground/50"
                            }`}
                          >
                            <div className="font-medium">{mode.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {mode.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {publishMode === "schedule" && (
                      <div className="space-y-2">
                        <Label htmlFor="scheduled_publish_time">
                          Daily publish time (HH:MM)
                        </Label>
                        <Input
                          id="scheduled_publish_time"
                          type="time"
                          {...register("publish_settings.scheduled_publish_time")}
                        />
                        <p className="text-xs text-muted-foreground">
                          If the time has already passed today, the post will be
                          scheduled for tomorrow.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
