import apiClient from "./client";
import type {
  PaginatedResponse,
  PipelineRunResponse,
  PipelineRunStatusResponse,
  TriggerScanDto,
} from "./types";

export async function triggerPipelineRun(
  dto: TriggerScanDto,
): Promise<PipelineRunResponse> {
  const { data } = await apiClient.post("/pipeline/runs", dto);
  return data;
}

export async function getPipelineRunStatus(
  id: string,
): Promise<PipelineRunStatusResponse> {
  const { data } = await apiClient.get(`/pipeline/runs/${id}/status`);
  return data;
}

export async function listPipelineRuns(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<PipelineRunResponse>> {
  const { data } = await apiClient.get("/pipeline/runs", { params });
  return data;
}
