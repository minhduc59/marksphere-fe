"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useTriggerScan } from "@/hooks/api/use-scans";
import { useSettingsStore } from "@/stores/settings-store";
import { usePipelineStore } from "@/stores/pipeline-store";
import { usePipelineConfig } from "@/hooks/api/use-pipeline-config";
import { PostFormat, type TriggerScanDto } from "@/lib/api/types";

const startScanSchema = z.object({
  max_items_per_platform: z.number().int().min(1).max(200),
  include_comments: z.boolean(),
  quality_threshold: z.number().int().min(1).max(10),
  generate_posts: z.boolean(),
  num_posts: z.number().int().min(1).max(10),
  formats: z.array(z.nativeEnum(PostFormat)),
});

type StartScanInput = z.infer<typeof startScanSchema>;

const FORMAT_LABELS: Record<PostFormat, string> = {
  [PostFormat.QUICK_TIPS]: "Quick Tips",
  [PostFormat.HOT_TAKE]: "Hot Take",
  [PostFormat.TRENDING_BREAKDOWN]: "Trending Breakdown",
  [PostFormat.DID_YOU_KNOW]: "Did You Know",
  [PostFormat.TUTORIAL_HACK]: "Tutorial Hack",
  [PostFormat.MYTH_BUSTERS]: "Myth Busters",
  [PostFormat.BEHIND_THE_TECH]: "Behind the Tech",
};

const ALL_FORMATS = Object.values(PostFormat);

const DEFAULTS: StartScanInput = {
  max_items_per_platform: 30,
  include_comments: true,
  quality_threshold: 5,
  generate_posts: true,
  num_posts: 3,
  formats: [],
};

interface StartScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartScanModal({ open, onOpenChange }: StartScanModalProps) {
  const triggerScan = useTriggerScan();
  const keywords = useSettingsStore((s) => s.keywords);
  const setActiveScan = usePipelineStore((s) => s.setActiveScan);
  const { data: pipelineConfig } = usePipelineConfig();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StartScanInput>({
    resolver: zodResolver(startScanSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (!open) return;
    reset({
      max_items_per_platform:
        pipelineConfig?.max_items_per_platform ?? DEFAULTS.max_items_per_platform,
      include_comments:
        pipelineConfig?.include_comments ?? DEFAULTS.include_comments,
      quality_threshold:
        pipelineConfig?.quality_threshold ?? DEFAULTS.quality_threshold,
      generate_posts: DEFAULTS.generate_posts,
      num_posts: pipelineConfig?.num_posts ?? DEFAULTS.num_posts,
      formats:
        (pipelineConfig?.allowed_formats as PostFormat[] | null | undefined) ??
        DEFAULTS.formats,
    });
  }, [open, pipelineConfig, reset]);

  const generatePosts = watch("generate_posts");
  const selectedFormats = watch("formats");

  function toggleFormat(format: PostFormat) {
    const next = selectedFormats.includes(format)
      ? selectedFormats.filter((f) => f !== format)
      : [...selectedFormats, format];
    setValue("formats", next, { shouldDirty: true });
  }

  async function onSubmit(values: StartScanInput) {
    const dto: TriggerScanDto = {
      platforms: ["hackernews"],
      options: {
        max_items_per_platform: values.max_items_per_platform,
        include_comments: values.include_comments,
        quality_threshold: values.quality_threshold,
        generate_posts: values.generate_posts,
        ...(keywords.length > 0 ? { keywords } : {}),
        ...(values.generate_posts
          ? {
              post_gen_options: {
                num_posts: values.num_posts,
                formats:
                  values.formats.length === 0 ? null : values.formats,
              },
            }
          : {}),
      },
    };

    const data = await triggerScan.mutateAsync(dto);
    const id = (data as { scan_id?: string }).scan_id;
    if (id) setActiveScan(id);
    onOpenChange(false);
  }

  const pending = isSubmitting || triggerScan.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start new scan</DialogTitle>
          <DialogDescription>
            Configure how the trend scan should run and which posts to
            generate.
          </DialogDescription>
          {pipelineConfig && (
            <p className="text-xs text-muted-foreground">
              Defaults loaded from your{" "}
              <Link
                href="/settings/pipeline"
                className="underline underline-offset-2"
              >
                Pipeline configuration
              </Link>
              .
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Scan options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Scan options
            </h3>

            <div className="space-y-2">
              <Label htmlFor="max_items_per_platform">
                Max items per platform (1–200)
              </Label>
              <Input
                id="max_items_per_platform"
                type="number"
                min={1}
                max={200}
                {...register("max_items_per_platform", {
                  valueAsNumber: true,
                })}
              />
              {errors.max_items_per_platform && (
                <p className="text-xs text-destructive">
                  {errors.max_items_per_platform.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include_comments" className="cursor-pointer">
                Include top comments
              </Label>
              <Controller
                control={control}
                name="include_comments"
                render={({ field }) => (
                  <Switch
                    id="include_comments"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality_threshold">
                Quality threshold (1–10)
              </Label>
              <Input
                id="quality_threshold"
                type="number"
                min={1}
                max={10}
                {...register("quality_threshold", { valueAsNumber: true })}
              />
              {errors.quality_threshold && (
                <p className="text-xs text-destructive">
                  {errors.quality_threshold.message}
                </p>
              )}
            </div>
          </div>

          {/* Post generation */}
          <div className="space-y-4 border-t pt-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-foreground">
                  Generate posts after scan
                </h3>
                <p className="text-xs text-muted-foreground">
                  Automatically produce content for top trends.
                </p>
              </div>
              <Controller
                control={control}
                name="generate_posts"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {generatePosts && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="num_posts">Number of posts (1–10)</Label>
                  <Input
                    id="num_posts"
                    type="number"
                    min={1}
                    max={10}
                    {...register("num_posts", { valueAsNumber: true })}
                  />
                  {errors.num_posts && (
                    <p className="text-xs text-destructive">
                      {errors.num_posts.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Post formats</Label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_FORMATS.map((format) => {
                      const active = selectedFormats.includes(format);
                      return (
                        <Button
                          key={format}
                          type="button"
                          size="sm"
                          variant={active ? "default" : "outline"}
                          onClick={() => toggleFormat(format)}
                        >
                          {FORMAT_LABELS[format]}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to allow all formats.
                  </p>
                </div>
              </>
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
              Start scan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
