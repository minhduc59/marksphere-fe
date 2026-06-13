"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ContentView = "board" | "list";

const OPTIONS: { value: ContentView; label: string; icon: typeof List }[] = [
  { value: "board", label: "Board", icon: LayoutGrid },
  { value: "list", label: "List", icon: List },
];

interface Props {
  value: ContentView;
  onChange: (view: ContentView) => void;
}

/** Segmented Board/List switch. Matches the Stitch Content Workspace toggle. */
export function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-md border p-0.5">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
