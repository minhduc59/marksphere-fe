"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateTimeSlot,
  useUpdateTimeSlot,
} from "@/hooks/api/use-time-slots";
import type { TimeSlot } from "@/lib/api/time-slots";
import { timeSlotToIndex } from "@/lib/api/time-slots";

const TIME_SLOT_REGEX = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

const schema = z.object({
  platform: z.string().min(1).max(20),
  time_slot: z
    .string()
    .regex(TIME_SLOT_REGEX, 'Must be in "HH:MM-HH:MM" format'),
  slot_index: z.number().int().min(0).max(47),
  weighted_score: z.number().min(0),
  sample_count: z.number().int().min(0),
  avg_views: z.number().min(0),
  avg_likes: z.number().min(0),
  avg_comments: z.number().min(0),
  avg_shares: z.number().min(0),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: TimeSlot | null;
}

const PLATFORMS = ["tiktok"];

const EMPTY: FormValues = {
  platform: "tiktok",
  time_slot: "",
  slot_index: 0,
  weighted_score: 0,
  sample_count: 0,
  avg_views: 0,
  avg_likes: 0,
  avg_comments: 0,
  avg_shares: 0,
};

export function TimeSlotDialog({ open, onOpenChange, slot }: Props) {
  const create = useCreateTimeSlot();
  const update = useUpdateTimeSlot();
  const isEdit = !!slot;

  const defaults: FormValues = useMemo(() => {
    if (!slot) return EMPTY;
    return {
      platform: slot.platform,
      time_slot: slot.time_slot,
      slot_index: slot.slot_index,
      weighted_score: slot.weighted_score,
      sample_count: slot.sample_count,
      avg_views: slot.avg_views,
      avg_likes: slot.avg_likes,
      avg_comments: slot.avg_comments,
      avg_shares: slot.avg_shares,
    };
  }, [slot]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  // Auto-derive slot_index from time_slot for convenience (user can override).
  const timeSlot = watch("time_slot");
  useEffect(() => {
    if (!isEdit) {
      const idx = timeSlotToIndex(timeSlot ?? "");
      if (idx !== null) setValue("slot_index", idx);
    }
  }, [timeSlot, isEdit, setValue]);

  const pending = isSubmitting || create.isPending || update.isPending;

  async function onSubmit(values: FormValues) {
    if (isEdit && slot) {
      await update.mutateAsync({ id: slot.id, dto: values });
    } else {
      await create.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit time slot" : "Add time slot"}
          </DialogTitle>
          <DialogDescription>
            Configure a preferred publishing window. Engagement metrics are
            used by the auto-scheduler to rank the best slot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={watch("platform")}
                onValueChange={(v) => setValue("platform", v)}
              >
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.platform && (
                <p className="text-xs text-destructive">
                  {errors.platform.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="time_slot">Time slot</Label>
              <Input
                id="time_slot"
                placeholder="19:00-19:30"
                {...register("time_slot")}
              />
              {errors.time_slot && (
                <p className="text-xs text-destructive">
                  {errors.time_slot.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="slot_index">Slot index (0–47)</Label>
              <Input
                id="slot_index"
                type="number"
                min={0}
                max={47}
                {...register("slot_index", { valueAsNumber: true })}
              />
              {errors.slot_index && (
                <p className="text-xs text-destructive">
                  {errors.slot_index.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weighted_score">Weighted score</Label>
              <Input
                id="weighted_score"
                type="number"
                step="0.01"
                min={0}
                {...register("weighted_score", { valueAsNumber: true })}
              />
              {errors.weighted_score && (
                <p className="text-xs text-destructive">
                  {errors.weighted_score.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sample_count">Sample count</Label>
              <Input
                id="sample_count"
                type="number"
                min={0}
                {...register("sample_count", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avg_views">Avg views</Label>
              <Input
                id="avg_views"
                type="number"
                min={0}
                {...register("avg_views", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="avg_likes">Avg likes</Label>
              <Input
                id="avg_likes"
                type="number"
                min={0}
                {...register("avg_likes", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avg_comments">Avg comments</Label>
              <Input
                id="avg_comments"
                type="number"
                min={0}
                {...register("avg_comments", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avg_shares">Avg shares</Label>
              <Input
                id="avg_shares"
                type="number"
                min={0}
                {...register("avg_shares", { valueAsNumber: true })}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
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
              {isEdit ? "Save changes" : "Create slot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
