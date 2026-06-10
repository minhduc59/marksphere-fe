import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getScans,
  getScan,
  getScanStatus,
  triggerScan,
} from "@/lib/api/scans";
import type { PaginatedResponse, ScanRun, TriggerScanDto } from "@/lib/api/types";

export function useScans(
  params?: { page?: number; pageSize?: number },
  options?: {
    refetchInterval?: UseQueryOptions<
      PaginatedResponse<ScanRun>,
      Error
    >["refetchInterval"];
  },
) {
  return useQuery({
    queryKey: ["scans", params],
    queryFn: () => getScans(params),
    refetchInterval: options?.refetchInterval,
  });
}

export function useScan(id: string) {
  return useQuery({
    queryKey: ["scans", id],
    queryFn: () => getScan(id),
    enabled: !!id,
  });
}

export function useScanStatus(id: string | null) {
  return useQuery({
    queryKey: ["scans", id, "status"],
    queryFn: () => getScanStatus(id!),
    enabled: !!id,
    refetchInterval: 3000,
  });
}

export function useTriggerScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: TriggerScanDto) => triggerScan(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scans"] });
      toast.success("Scan triggered successfully");
    },
    onError: () => {
      toast.error("Failed to trigger scan");
    },
  });
}
