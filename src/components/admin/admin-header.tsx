"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUIStore } from "@/stores/ui-store";
import { AdminSidebarContent } from "./admin-sidebar";
import { NotificationBell, type AdminNotification } from "./notification-bell";

const TITLES: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p === "/admin", title: "Overview" },
  { match: (p) => p.startsWith("/admin/users"), title: "User Management" },
  {
    match: (p) => p.startsWith("/admin/video-clips"),
    title: "Video Clipping Pipeline",
  },
  {
    match: (p) => p.startsWith("/admin/monitoring"),
    title: "System Monitoring",
  },
  {
    match: (p) => p.startsWith("/admin/configuration"),
    title: "Platform Configuration",
  },
];

const SAMPLE_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "n1",
    tone: "error",
    category: "Failed Run",
    message: "Video processor timed out on job #88219.",
    time: "2m ago",
    unread: true,
  },
  {
    id: "n2",
    tone: "info",
    category: "Moderation",
    message: "High sensitivity flag triggered on post #A92-F1.",
    time: "15m ago",
    unread: true,
  },
  {
    id: "n3",
    tone: "system",
    category: "System",
    message: "PostgreSQL backup successfully completed.",
    time: "42m ago",
  },
];

export function AdminHeader() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const title = TITLES.find((t) => t.match(pathname))?.title ?? "Admin";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-card px-6 lg:px-10">
      <div className="flex items-center gap-3">
        <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <AdminSidebarContent />
          </SheetContent>
        </Sheet>
        <h2 className="font-display text-base font-semibold tracking-tight">
          {title}
        </h2>
      </div>

      <NotificationBell notifications={SAMPLE_NOTIFICATIONS} />
    </header>
  );
}
