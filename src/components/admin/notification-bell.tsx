"use client";

import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type AdminNotificationTone = "error" | "info" | "system";

export interface AdminNotification {
  id: string;
  tone: AdminNotificationTone;
  category: string;
  message: string;
  time: string;
  /** Unread items render with an accent edge and count toward the bell dot. */
  unread?: boolean;
}

const TONE_EDGE: Record<AdminNotificationTone, string> = {
  error: "border-l-destructive",
  info: "border-l-foreground",
  system: "border-l-border",
};

const TONE_TEXT: Record<AdminNotificationTone, string> = {
  error: "text-destructive",
  info: "text-foreground",
  system: "text-muted-foreground",
};

/**
 * Header notification bell with an unread "ring" indicator dot and a dropdown
 * feed. Stateless/presentational — pass notifications from the parent.
 */
export function NotificationBell({
  notifications,
  className,
}: {
  notifications: AdminNotification[];
  className?: string;
}) {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          className={cn(
            "relative inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground",
            className
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold text-muted-foreground">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="max-h-[360px] divide-y overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "space-y-1 border-l-4 px-4 py-3",
                  TONE_EDGE[n.tone],
                  !n.unread && "opacity-70"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      TONE_TEXT[n.tone]
                    )}
                  >
                    {n.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs leading-tight">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
