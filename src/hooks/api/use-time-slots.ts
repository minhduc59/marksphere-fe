import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  createTimeSlot,
  deleteTimeSlot,
  listTimeSlots,
  updateTimeSlot,
  type TimeSlotInput,
} from "@/lib/api/time-slots";

const ROOT_KEY = ["time-slots"] as const;

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string; detail?: string } | undefined;
    return data?.message ?? data?.detail ?? fallback;
  }
  return fallback;
}

export function useTimeSlots(platform?: string) {
  return useQuery({
    queryKey: [...ROOT_KEY, { platform }],
    queryFn: () => listTimeSlots(platform),
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ROOT_KEY });
  qc.invalidateQueries({ queryKey: ["golden-hours"] });
}

export function useCreateTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: TimeSlotInput) => createTimeSlot(dto),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success("Time slot created");
    },
    onError: (err) => toast.error(errorMessage(err, "Failed to create time slot")),
  });
}

export function useUpdateTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<TimeSlotInput> }) =>
      updateTimeSlot(id, dto),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success("Time slot updated");
    },
    onError: (err) => toast.error(errorMessage(err, "Failed to update time slot")),
  });
}

export function useDeleteTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTimeSlot(id),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success("Time slot deleted");
    },
    onError: (err) => toast.error(errorMessage(err, "Failed to delete time slot")),
  });
}
