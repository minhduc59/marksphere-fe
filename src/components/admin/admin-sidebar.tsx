"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Film,
  Activity,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { logout as apiLogout } from "@/lib/api/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Designed-but-not-yet-built sections render muted and non-clickable. */
  disabled?: boolean;
};

const NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/video-clips", label: "Video Clips", icon: Film },
  { href: "/admin/monitoring", label: "System Monitor", icon: Activity },
  { href: "/admin/configuration", label: "Configuration", icon: Settings },
];

export function AdminSidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: storeLogout, refreshToken } = useAuthStore();

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "A";

  async function handleLogout() {
    try {
      if (refreshToken) await apiLogout(refreshToken);
    } catch {
      // ignore logout API errors
    }
    storeLogout();
    router.push("/");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 py-7">
        <Link href="/admin" className="block">
          <span className="font-display text-lg font-bold tracking-tight">
            MarkSphere
          </span>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            AI Admin Panel
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          if (item.disabled) {
            return (
              <span
                key={item.href}
                aria-disabled
                title="Coming soon"
                className="flex cursor-default items-center justify-between gap-3 px-3 py-2 text-sm text-muted-foreground/50"
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                isActive
                  ? "border-r-2 border-foreground bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-6 py-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to app
      </Link>

      <Separator />

      <div className="p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">
              {user?.displayName || user?.email}
            </p>
            <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
              Administrator
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card lg:block">
      <AdminSidebarContent />
    </aside>
  );
}
