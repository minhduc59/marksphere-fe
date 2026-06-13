import { useQuery } from "@tanstack/react-query";

import {
  getMonitoringErrors,
  getMonitoringPipelines,
} from "@/lib/api/admin-monitoring";
import type { ErrorLogFilters } from "@/lib/api/types";

export function useMonitoringPipelines() {
  return useQuery({
    queryKey: ["admin", "monitoring", "pipelines"],
    queryFn: getMonitoringPipelines,
    refetchInterval: 15_000,
  });
}

export function useMonitoringErrors(filters?: ErrorLogFilters) {
  return useQuery({
    queryKey: ["admin", "monitoring", "errors", filters],
    queryFn: () => getMonitoringErrors(filters),
    placeholderData: (prev) => prev,
    refetchInterval: 15_000,
  });
}
