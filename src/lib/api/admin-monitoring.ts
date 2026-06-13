import apiClient from "./client";
import type {
  ErrorLogEntry,
  ErrorLogFilters,
  PaginatedResponse,
  PipelineHealth,
} from "./types";

export async function getMonitoringPipelines(): Promise<PipelineHealth[]> {
  const { data } = await apiClient.get<PipelineHealth[]>(
    "/admin/monitoring/pipelines"
  );
  return data;
}

export async function getMonitoringErrors(
  filters?: ErrorLogFilters
): Promise<PaginatedResponse<ErrorLogEntry>> {
  const { data } = await apiClient.get<PaginatedResponse<ErrorLogEntry>>(
    "/admin/monitoring/errors",
    { params: filters }
  );
  return data;
}
