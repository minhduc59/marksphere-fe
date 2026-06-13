import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  badge?: number;
}

export function SidebarItem({
  href,
  label,
  icon: Icon,
  isActive,
  badge,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition-colors",
        isActive
          ? "border-foreground bg-accent font-semibold text-foreground"
          : "border-transparent font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center bg-destructive px-1 text-xs text-destructive-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
}
