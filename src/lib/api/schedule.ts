import apiClient from "./client";
import type { ScanScheduleResponse } from "./types";

/** Active recurring scan schedule for the current user (null when none set). */
export async function getPipelineSchedule(): Promise<ScanScheduleResponse | null> {
  const { data } = await apiClient.get("/pipeline/schedule");
  return data ?? null;
}
