import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string | number;
  /** Optional delta text, e.g. "+12%". */
  delta?: string;
  /** Direction tints the delta; defaults to neutral foreground. */
  deltaDirection?: "up" | "down";
  className?: string;
}

/**
 * Flat, bordered KPI tile (label + big value + optional delta). Monochrome to
 * match the platform's flat design language. Shared across admin + dashboard.
 */
export function StatTile({
  label,
  value,
  delta,
  deltaDirection,
  className,
}: StatTileProps) {
  return (
    <div className={cn("border bg-card p-6", className)}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold tracking-tight">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "text-[10px] font-bold",
              deltaDirection === "down" ? "text-destructive" : "text-foreground"
            )}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
