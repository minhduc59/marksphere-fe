import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPipelineRunStatus,
  listPipelineRuns,
  triggerPipelineRun,
} from "@/lib/api/pipeline-runs";
import type {
  PaginatedResponse,
  PipelineRunResponse,
  TriggerScanDto,
} from "@/lib/api/types";

export function usePipelineRuns(
  params?: { page?: number; pageSize?: number },
  options?: {
    refetchInterval?: UseQueryOptions<
      PaginatedResponse<PipelineRunResponse>,
      Error
    >["refetchInterval"];
  },
) {
  return useQuery({
    queryKey: ["pipeline-runs", params],
    queryFn: () => listPipelineRuns(params),
    refetchInterval: options?.refetchInterval,
  });
}

export function usePipelineRunStatus(id: string | null) {
  return useQuery({
    queryKey: ["pipeline-runs", id, "status"],
    queryFn: () => getPipelineRunStatus(id!),
    enabled: !!id,
    refetchInterval: 3000,
  });
}

export function useTriggerPipelineRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: TriggerScanDto) => triggerPipelineRun(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-runs"] });
      toast.success("Pipeline started");
    },
    onError: () => {
      toast.error("Failed to start pipeline");
    },
  });
}
