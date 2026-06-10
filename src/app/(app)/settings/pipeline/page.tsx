"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PostFormat } from "@/lib/api/types";
import {
  usePipelineConfig,
  useUpdatePipelineConfig,
} from "@/hooks/api/use-pipeline-config";

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

// Quick-pick times of day (24h "HH:MM") for the daily scan schedule.
const TIME_PRESETS = ["07:00", "12:00", "19:00", "23:59"];

/** "07:00" → "0 7 * * *" (run daily at that time). */
function dailyTimeToCron(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return `${Number(m)} ${Number(h)} * * *`;
}

/**
 * Parse a simple "run daily at HH:MM" cron ("M H * * *", single numeric minute
 * and hour, day/month/weekday all "*") back into "HH:MM". Returns null for
 * anything more complex (intervals, lists) so the UI falls back to raw editing.
 */
function cronToDailyTime(cron: string | null | undefined): string | null {
  if (!cron) return null;
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [min, hour, dom, mon, dow] = parts;
  if (dom !== "*" || mon !== "*" || dow !== "*") return null;
  if (!/^\d{1,2}$/.test(min) || !/^\d{1,2}$/.test(hour)) return null;
  const m = Number(min);
  const h = Number(hour);
  if (m > 59 || h > 23) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const PRIVACY_OPTIONS = [
  { value: "SELF_ONLY", label: "Only me" },
  { value: "MUTUAL_FOLLOW_FRIENDS", label: "Mutual follow friends" },
  { value: "FOLLOWER_OF_CREATOR", label: "Followers" },
  { value: "PUBLIC_TO_EVERYONE", label: "Public" },
];

const PUBLISH_MODES = [
  { value: "auto", label: "Golden Hour", description: "Publish at the optimal engagement time" },
  { value: "manual", label: "Immediate", description: "Publish as soon as approved" },
  { value: "schedule", label: "Fixed Time", description: "Publish daily at a specific time" },
] as const;

const schema = z.object({
  max_items_per_platform: z.number().int().min(1).max(200),
  quality_threshold: z.number().int().min(1).max(10),
  include_comments: z.boolean(),
  num_posts: z.number().int().min(1).max(10),
  allowed_formats: z.array(z.nativeEnum(PostFormat)).nullable(),
  require_review: z.boolean(),
  auto_approve_threshold: z.number().min(0).max(10),
  auto_publish: z.boolean(),
  publish_mode: z.enum(["auto", "manual", "schedule"]),
  scheduled_publish_time: z.string().nullable(),
  default_privacy_level: z.string(),
  scan_schedule_enabled: z.boolean(),
  scan_cron_expression: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  max_items_per_platform: 50,
  quality_threshold: 5,
  include_comments: true,
  num_posts: 3,
  allowed_formats: null,
  require_review: true,
  auto_approve_threshold: 7.0,
  auto_publish: false,
  publish_mode: "auto",
  scheduled_publish_time: null,
  default_privacy_level: "SELF_ONLY",
  scan_schedule_enabled: false,
  scan_cron_expression: null,
};

export default function PipelineSettingsPage() {
  const { data: config, isLoading } = usePipelineConfig();
  const update = useUpdatePipelineConfig();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (!config) return;
    reset({
      max_items_per_platform: config.max_items_per_platform,
      quality_threshold: config.quality_threshold,
      include_comments: config.include_comments,
      num_posts: config.num_posts,
      allowed_formats: (config.allowed_formats as PostFormat[] | null) ?? null,
      require_review: config.require_review,
      auto_approve_threshold: config.auto_approve_threshold,
      auto_publish: config.auto_publish,
      publish_mode: config.publish_mode,
      scheduled_publish_time: config.scheduled_publish_time,
      default_privacy_level: config.default_privacy_level,
      scan_schedule_enabled: config.scan_schedule_enabled,
      scan_cron_expression: config.scan_cron_expression,
    });
  }, [config, reset]);

  const requireReview = watch("require_review");
  const autoPublish = watch("auto_publish");
  const publishMode = watch("publish_mode");
  const scanScheduleEnabled = watch("scan_schedule_enabled");
  const scanCron = watch("scan_cron_expression");
  const allowedFormats = watch("allowed_formats") ?? [];

  const dailyTime = cronToDailyTime(scanCron);
  const [showAdvancedCron, setShowAdvancedCron] = useState(false);

  // Auto-open the advanced raw-cron panel when the loaded schedule isn't a
  // simple "daily at HH:MM" cron (e.g. an existing interval like "0 */6 * * *"),
  // so those schedules stay visible and editable.
  useEffect(() => {
    if (config?.scan_cron_expression && !cronToDailyTime(config.scan_cron_expression)) {
      setShowAdvancedCron(true);
    }
  }, [config]);

  function toggleFormat(format: PostFormat) {
    const current = allowedFormats ?? [];
    const next = current.includes(format)
      ? current.filter((f) => f !== format)
      : [...current, format];
    setValue("allowed_formats", next.length === 0 ? null : next, {
      shouldDirty: true,
    });
  }

  async function onSubmit(values: FormValues) {
    await update.mutateAsync({
      ...values,
      allowed_formats: values.allowed_formats ?? null,
      scheduled_publish_time: values.scheduled_publish_time ?? null,
      scan_cron_expression: values.scan_cron_expression ?? null,
    });
  }

  const pending = isSubmitting || update.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading pipeline configuration…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {/* Scan Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scan Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max_items_per_platform">
              Max items per platform (1–200)
            </Label>
            <Input
              id="max_items_per_platform"
              type="number"
              min={1}
              max={200}
              {...register("max_items_per_platform", { valueAsNumber: true })}
            />
            {errors.max_items_per_platform && (
              <p className="text-xs text-destructive">
                {errors.max_items_per_platform.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality_threshold">Quality threshold (1–10)</Label>
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
        </CardContent>
      </Card>

      {/* Post Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Post Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="num_posts">Number of posts (1–10)</Label>
            <Input
              id="num_posts"
              type="number"
              min={1}
              max={10}
              {...register("num_posts", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label>Allowed formats</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_FORMATS.map((format) => {
                const active = (allowedFormats ?? []).includes(format);
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
              Leave all unselected to allow every format.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Review Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require_review" className="cursor-pointer">
                Require human review
              </Label>
              <p className="text-xs text-muted-foreground">
                When off, posts above the threshold are auto-approved.
              </p>
            </div>
            <Controller
              control={control}
              name="require_review"
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
                {...register("auto_approve_threshold", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Posts with a review score at or above this value are approved automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publishing Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publishing Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              name="auto_publish"
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
                        setValue("publish_mode", mode.value, { shouldDirty: true })
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
                    {...register("scheduled_publish_time")}
                  />
                  <p className="text-xs text-muted-foreground">
                    If the time has already passed today, the post will be
                    scheduled for tomorrow.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Default privacy level</Label>
                <Controller
                  control={control}
                  name="default_privacy_level"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIVACY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Scan Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scan Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="scan_schedule_enabled" className="cursor-pointer">
                Enable recurring scans
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically scan HackerNews on a schedule.
              </p>
            </div>
            <Controller
              control={control}
              name="scan_schedule_enabled"
              render={({ field }) => (
                <Switch
                  id="scan_schedule_enabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {scanScheduleEnabled && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="scan_daily_time">Run daily at</Label>
                <Input
                  id="scan_daily_time"
                  type="time"
                  className="w-40"
                  value={dailyTime ?? ""}
                  onChange={(e) =>
                    setValue(
                      "scan_cron_expression",
                      dailyTimeToCron(e.target.value),
                      { shouldDirty: true }
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Times are in Asia/Ho_Chi_Minh.
                  {scanCron ? (
                    <>
                      {" "}
                      Resulting cron:{" "}
                      <code className="font-mono">{scanCron}</code>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TIME_PRESETS.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    size="sm"
                    variant={dailyTime === time ? "default" : "outline"}
                    onClick={() =>
                      setValue("scan_cron_expression", dailyTimeToCron(time), {
                        shouldDirty: true,
                      })
                    }
                  >
                    {time}
                  </Button>
                ))}
              </div>

              <div className="space-y-2 border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 text-xs text-muted-foreground"
                  onClick={() => setShowAdvancedCron((v) => !v)}
                >
                  {showAdvancedCron ? "▾" : "▸"} Advanced (cron expression)
                </Button>
                {showAdvancedCron && (
                  <Input
                    id="scan_cron_expression"
                    placeholder="0 */6 * * *"
                    {...register("scan_cron_expression")}
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || !isDirty}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save configuration
        </Button>
        {isDirty && (
          <p className="text-xs text-muted-foreground">Unsaved changes</p>
        )}
      </div>
    </form>
  );
}
