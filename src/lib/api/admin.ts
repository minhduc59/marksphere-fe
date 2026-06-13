import apiClient from "./client";
import type { AdminOverview } from "./types";

export async function getAdminOverview(): Promise<AdminOverview> {
  const { data } = await apiClient.get<AdminOverview>("/admin/overview");
  return data;
}
