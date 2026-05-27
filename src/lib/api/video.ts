import apiClient from "./client";

// ── Types ─────────────────────────────────────────────────────────────────

export interface Font {
  id: string;
  name: string;
  storageUrl: string;
  isDefault: boolean;
}

export interface CaptionTemplate {
  id: string;
  name: string;
  fontSize: number;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  verticalPosition: string;
  isDefault: boolean;
}

export type VideoTaskStatus =
  | "queued"
  | "downloading"
  | "transcribing"
  | "analyzing"
  | "clipping"
  | "captioning"
  | "uploading"
  | "completed"
  | "error"
  | "cancelled";

export type VideoClipStatus = "draft" | "approved" | "rejected" | "published" | "failed";

export interface VideoClip {
  id: string;
  taskId: string;
  clipIndex: number;
  title?: string | null;
  storageUrl: string;
  storagePublicId: string;
  thumbnailUrl?: string | null;
  thumbnailPublicId?: string | null;
  durationSeconds: number;
  startMs: number;
  endMs: number;
  transcriptSegment: string | null;
  llmScore: number | null;
  llmRationale: string | null;
  hookScore?: number | null;
  engagementScore?: number | null;
  status: VideoClipStatus;
  feedback: string | null;
  createdAt: string;
  updatedAt?: string | null;
  // Returned by the Library list endpoint (joined from VideoTask)
  sourceType?: "url" | "upload" | null;
  sourceRef?: string | null;
}

export interface PaginatedClips {
  items: VideoClip[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListVideoClipsParams {
  status?: VideoClipStatus;
  taskId?: string;
  sort?: "created_at" | "duration" | "status";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface VideoTask {
  id: string;
  userId: string;
  sourceType: "url" | "upload";
  sourceRef: string;
  status: VideoTaskStatus;
  progress: number;
  progressMessage: string | null;
  errorMessage: string | null;
  maxClips: number;
  createdAt: string;
  completedAt: string | null;
  clips?: VideoClip[];
}

// ── Requests ──────────────────────────────────────────────────────────────

export interface CreateVideoTaskDto {
  sourceType: "url" | "upload";
  sourceRef: string;
  fontId?: string;
  captionTemplateId?: string;
  maxClips?: number;
  scanRunId?: string;
  // Customization (one-time per task)
  captionStyle?: CaptionStylePreset;
  aspectRatio?: AspectRatio;
  cropX?: number;
  cropY?: number;
  reframeMode?: ReframeMode;
  addSubtitles?: boolean;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  captionPosition?: CaptionPosition;
  startTimeSeconds?: number;
  endTimeSeconds?: number;
}

export type CaptionStylePreset = "default" | "bold" | "minimal";
export type CaptionPosition = "top" | "center" | "bottom";
export type AspectRatio = "9:16" | "16:9" | "4:3";
export type ReframeMode = "static" | "smart";

export interface ReviewClipDto {
  action: "approve" | "reject";
  feedback?: string;
}

// ── API functions ─────────────────────────────────────────────────────────

export async function createVideoTask(dto: CreateVideoTaskDto): Promise<VideoTask> {
  const { data } = await apiClient.post("/video-tasks", dto);
  return data;
}

export async function getVideoTask(taskId: string): Promise<VideoTask> {
  const { data } = await apiClient.get(`/video-tasks/${taskId}`);
  return data;
}

export async function triggerVideoPipeline(taskId: string): Promise<{ taskId: string; status: string }> {
  const { data } = await apiClient.post(`/video-tasks/${taskId}/trigger-pipeline`);
  return data;
}

export async function reviewClip(clipId: string, dto: ReviewClipDto): Promise<VideoClip> {
  const { data } = await apiClient.patch(`/video-clips/${clipId}/review`, dto);
  return data;
}

export async function listVideoClips(
  params: ListVideoClipsParams = {}
): Promise<PaginatedClips> {
  const { data } = await apiClient.get("/video-clips", {
    params: {
      status: params.status,
      task_id: params.taskId,
      sort: params.sort,
      order: params.order,
      limit: params.limit,
      offset: params.offset,
    },
  });
  return data;
}

export async function deleteVideoClip(clipId: string): Promise<void> {
  await apiClient.delete(`/video-clips/${clipId}`);
}

export async function duplicateVideoClip(clipId: string): Promise<VideoClip> {
  const { data } = await apiClient.post(`/video-clips/${clipId}/duplicate`);
  return data;
}

export async function listFonts(): Promise<Font[]> {
  const { data } = await apiClient.get("/fonts");
  return data;
}

export async function createFont(formData: FormData): Promise<Font> {
  const { data } = await apiClient.post("/fonts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function listCaptionTemplates(): Promise<CaptionTemplate[]> {
  const { data } = await apiClient.get("/caption-templates");
  return data;
}

export async function createCaptionTemplate(
  dto: Omit<CaptionTemplate, "id" | "isDefault">
): Promise<CaptionTemplate> {
  const { data } = await apiClient.post("/caption-templates", dto);
  return data;
}

export async function uploadMedia(formData: FormData): Promise<{ url: string; publicId: string }> {
  const { data } = await apiClient.post("/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
