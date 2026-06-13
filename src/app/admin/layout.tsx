"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/auth-store";
import { getMe } from "@/lib/api/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hydrate, setUser } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Populate the user (and therefore their role) from the backend.
  useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const me = await getMe();
      setUser(me);
      return me;
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const isAdmin = user?.role === "admin";

  // Not authenticated → send to the landing page (auth modal lives there).
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Authenticated but confirmed non-admin → bounce out of the admin area.
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Render the panel ONLY for a confirmed admin. Every other state — hydrating,
  // loading /me, unauthenticated, or a non-admin awaiting redirect — shows a
  // spinner so the admin UI is never exposed to a non-admin.
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-display">
      <AdminSidebar />
      <div className="flex min-h-screen flex-col lg:ml-64">
        <AdminHeader />
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
