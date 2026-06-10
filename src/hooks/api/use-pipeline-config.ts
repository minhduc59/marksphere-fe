import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPipelineConfig,
  patchPipelineConfig,
} from "@/lib/api/pipeline-config";
import type { PipelineConfigUpdate } from "@/lib/api/types";

export function usePipelineConfig() {
  return useQuery({
    queryKey: ["pipeline-config"],
    queryFn: getPipelineConfig,
    staleTime: 30_000,
  });
}

export function useUpdatePipelineConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: PipelineConfigUpdate) => patchPipelineConfig(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-config"] });
      toast.success("Pipeline configuration saved");
    },
    onError: () => {
      toast.error("Failed to save pipeline configuration");
    },
  });
}
