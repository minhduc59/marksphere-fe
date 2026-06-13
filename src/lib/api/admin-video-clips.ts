import apiClient from "./client";
import type {
  AdminVideoClip,
  AdminVideoClipJob,
  AdminVideoClipsFilters,
  AdminVideoClipsStats,
  PaginatedResponse,
} from "./types";

export async function getAdminVideoClips(
  filters?: AdminVideoClipsFilters
): Promise<PaginatedResponse<AdminVideoClipJob>> {
  const { data } = await apiClient.get<PaginatedResponse<AdminVideoClipJob>>(
    "/admin/video-clips",
    { params: filters }
  );
  return data;
}

export async function getAdminVideoClipsStats(): Promise<AdminVideoClipsStats> {
  const { data } = await apiClient.get<AdminVideoClipsStats>(
    "/admin/video-clips/stats"
  );
  return data;
}

export async function getAdminVideoClipsForTask(
  taskId: string
): Promise<AdminVideoClip[]> {
  const { data } = await apiClient.get<AdminVideoClip[]>(
    `/admin/video-clips/${taskId}/clips`
  );
  return data;
}

export async function retryVideoClipTask(taskId: string): Promise<void> {
  await apiClient.post(`/admin/video-clips/${taskId}/retry`);
}
