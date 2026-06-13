import apiClient from "./client";
import type {
  AdminUser,
  AdminUserFilters,
  AdminUserStats,
  CreateAdminUserDto,
  PaginatedResponse,
  UpdateAdminUserDto,
} from "./types";

export async function getAdminUsers(
  filters?: AdminUserFilters
): Promise<PaginatedResponse<AdminUser>> {
  const { data } = await apiClient.get<PaginatedResponse<AdminUser>>(
    "/admin/users",
    { params: filters }
  );
  return data;
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
  const { data } = await apiClient.get<AdminUserStats>("/admin/users/stats");
  return data;
}

export async function createAdminUser(
  dto: CreateAdminUserDto
): Promise<AdminUser> {
  const { data } = await apiClient.post<AdminUser>("/admin/users", dto);
  return data;
}

export async function updateAdminUser(
  id: string,
  dto: UpdateAdminUserDto
): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/admin/users/${id}`, dto);
  return data;
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}
