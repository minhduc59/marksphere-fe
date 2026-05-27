"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarClock, Loader2, Sparkles, Clock } from "lucide-react";

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
import { cn } from "@/lib/utils";
import {
  useAutoPublish,
  useGoldenHours,
  useSchedulePublish,
} from "@/hooks/api/use-publish";
import { useReviewPost } from "@/hooks/api/use-posts";

// react-hook-form + zod: discriminated union on mode
const schema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("auto") }),
  z.object({
    mode: z.literal("manual"),
    scheduledAt: z
      .string()
      .min(1, "Pick a date and time")
      .refine(
        (value) => {
          const parsed = new Date(value);
          return !Number.isNaN(parsed.getTime());
        },
        { message: "Invalid date/time" },
      )
      .refine(
        (value) => new Date(value).getTime() > Date.now() + 60_000,
        { message: "Pick a time at least 1 minute in the future" },
      ),
  }),
]);

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string | null;
  onSuccess?: () => void;
}

function toDatetimeLocalDefault(): string {
  // Default to one hour from now, rounded to next 5 minutes.
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function SchedulePublishModal({
  open,
  onOpenChange,
  postId,
  onSuccess,
}: Props) {
  const review = useReviewPost();
  const autoPublish = useAutoPublish();
  const schedulePublish = useSchedulePublish();
  const goldenHours = useGoldenHours();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mode: "auto" },
  });

  useEffect(() => {
    if (!open) reset({ mode: "auto" });
  }, [open, reset]);

  const mode = watch("mode");

  // When the user toggles to "manual", seed scheduledAt so the visible
  // default in the datetime input is what RHF/zod validate against.
  useEffect(() => {
    if (mode === "manual") {
      setValue("scheduledAt", toDatetimeLocalDefault(), {
        shouldValidate: false,
      });
    }
  }, [mode, setValue]);
  const minDatetime = format(
    new Date(Date.now() + 60_000),
    "yyyy-MM-dd'T'HH:mm",
  );

  const pending =
    isSubmitting ||
    review.isPending ||
    autoPublish.isPending ||
    schedulePublish.isPending;

  async function onSubmit(values: FormValues) {
    if (!postId) return;
    await review.mutateAsync({ id: postId, action: "approve" });
    if (values.mode === "auto") {
      await autoPublish.mutateAsync({ postId });
    } else {
      await schedulePublish.mutateAsync({
        postId,
        dto: { scheduled_at: new Date(values.scheduledAt).toISOString() },
      });
    }
    onSuccess?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Schedule publishing
          </DialogTitle>
          <DialogDescription>
            Approve this post and choose when it should publish.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="mode"
            render={({ field }) => (
              <div className="space-y-2">
                {/* Auto card */}
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                    field.value === "auto"
                      ? "border-teal-500 bg-teal-50"
                      : "border-border hover:bg-accent/40",
                  )}
                >
                  <input
                    type="radio"
                    className="mt-1"
                    checked={field.value === "auto"}
                    onChange={() => field.onChange("auto")}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Sparkles className="h-4 w-4 text-teal-600" />
                      Auto schedule
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Publish at the next golden hour based on engagement
                      analytics.
                    </p>
                    {field.value === "auto" && (
                      <AutoPreview
                        loading={goldenHours.isLoading}
                        error={goldenHours.isError}
                        scheduledAt={goldenHours.data?.scheduled_at}
                        topSlots={goldenHours.data?.top_slots?.map(
                          (s) => s.slot_time,
                        )}
                        isFallback={goldenHours.data?.is_fallback}
                      />
                    )}
                  </div>
                </label>

                {/* Manual card */}
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                    field.value === "manual"
                      ? "border-blue-500 bg-blue-50"
                      : "border-border hover:bg-accent/40",
                  )}
                >
                  <input
                    type="radio"
                    className="mt-1"
                    checked={field.value === "manual"}
                    onChange={() => field.onChange("manual")}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Manual schedule
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pick the exact time you want this post to publish.
                    </p>
                  </div>
                </label>
              </div>
            )}
          />

          {mode === "manual" && (
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Publish at</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                min={minDatetime}
                defaultValue={toDatetimeLocalDefault()}
                {...register("scheduledAt")}
              />
              {"scheduledAt" in errors && errors.scheduledAt && (
                <p className="text-xs text-destructive">
                  {errors.scheduledAt.message as string}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Time is interpreted in your local timezone and sent to the
                server in UTC.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !postId}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "auto" ? "Approve & auto-schedule" : "Approve & schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AutoPreview({
  loading,
  error,
  scheduledAt,
  topSlots,
  isFallback,
}: {
  loading: boolean;
  error: boolean;
  scheduledAt?: string;
  topSlots?: string[];
  isFallback?: boolean;
}) {
  if (loading) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading golden hour…
      </div>
    );
  }
  if (error || !scheduledAt) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Could not preview the next slot — the server will pick one when you
        submit.
      </p>
    );
  }
  return (
    <div className="mt-2 space-y-1 rounded-md bg-white/60 p-2 text-xs">
      <div>
        <span className="text-muted-foreground">Will publish at: </span>
        <span className="font-medium">
          {format(new Date(scheduledAt), "EEE, MMM d 'at' HH:mm")}
        </span>
      </div>
      {topSlots && topSlots.length > 0 && (
        <div className="text-muted-foreground">
          Top slots: {topSlots.slice(0, 3).join(", ")}
        </div>
      )}
      {isFallback && (
        <div className="text-amber-700">
          Not enough engagement data yet — using fallback slot.
        </div>
      )}
    </div>
  );
}
