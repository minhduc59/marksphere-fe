import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  getAdminUserStats,
  updateAdminUser,
} from "@/lib/api/admin-users";
import type {
  AdminUserFilters,
  CreateAdminUserDto,
  UpdateAdminUserDto,
} from "@/lib/api/types";

export function useAdminUsers(filters?: AdminUserFilters) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => getAdminUsers(filters),
    placeholderData: (prev) => prev,
  });
}

export function useAdminUserStats() {
  return useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: getAdminUserStats,
  });
}

function invalidateUsers(
  queryClient: ReturnType<typeof useQueryClient>
): Promise<unknown> {
  return queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAdminUserDto) => createAdminUser(dto),
    onSuccess: () => {
      invalidateUsers(queryClient);
      toast.success("User created");
    },
    onError: (err) => toast.error(extractError(err, "Failed to create user")),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAdminUserDto }) =>
      updateAdminUser(id, dto),
    onSuccess: () => {
      invalidateUsers(queryClient);
      toast.success("User updated");
    },
    onError: (err) => toast.error(extractError(err, "Failed to update user")),
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => {
      invalidateUsers(queryClient);
      toast.success("User deleted");
    },
    onError: (err) => toast.error(extractError(err, "Failed to delete user")),
  });
}

function extractError(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: unknown }).response === "object"
  ) {
    const message = (
      err as { response?: { data?: { message?: unknown } } }
    ).response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string")
      return message[0];
  }
  return fallback;
}
