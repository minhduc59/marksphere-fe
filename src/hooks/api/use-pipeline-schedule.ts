import { useQuery } from "@tanstack/react-query";
import { getPipelineSchedule } from "@/lib/api/schedule";

/** The current user's active recurring scan schedule (null when none set). */
export function usePipelineSchedule() {
  return useQuery({
    queryKey: ["pipeline-schedule"],
    queryFn: getPipelineSchedule,
  });
}
