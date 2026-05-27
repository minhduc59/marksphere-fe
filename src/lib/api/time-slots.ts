import apiClient from "./client";

export interface TimeSlot {
  id: string;
  platform: string;
  time_slot: string;
  slot_index: number;
  avg_views: number;
  avg_likes: number;
  avg_comments: number;
  avg_shares: number;
  weighted_score: number;
  sample_count: number;
  updated_at: string;
}

export interface TimeSlotInput {
  platform: string;
  time_slot: string;
  slot_index: number;
  avg_views?: number;
  avg_likes?: number;
  avg_comments?: number;
  avg_shares?: number;
  weighted_score?: number;
  sample_count?: number;
}

export async function listTimeSlots(platform?: string): Promise<{ items: TimeSlot[] }> {
  const { data } = await apiClient.get("/publish/time-slots", {
    params: platform ? { platform } : undefined,
  });
  return data;
}

export async function createTimeSlot(dto: TimeSlotInput): Promise<TimeSlot> {
  const { data } = await apiClient.post("/publish/time-slots", dto);
  return data;
}

export async function updateTimeSlot(
  id: string,
  dto: Partial<TimeSlotInput>,
): Promise<TimeSlot> {
  const { data } = await apiClient.patch(`/publish/time-slots/${id}`, dto);
  return data;
}

export async function deleteTimeSlot(id: string): Promise<void> {
  await apiClient.delete(`/publish/time-slots/${id}`);
}

// Map "19:00-19:30" → slot_index (0–47). 30-minute slots starting at midnight.
export function timeSlotToIndex(timeSlot: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)-/.exec(timeSlot);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (minute !== 0 && minute !== 30) return null;
  return hour * 2 + (minute === 30 ? 1 : 0);
}
