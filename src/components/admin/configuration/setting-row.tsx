import { cn } from "@/lib/utils";

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Layout: "between" puts the control to the far right (default for toggles etc),
   *  "stack" puts control below the label/description (for wide inputs). */
  layout?: "between" | "stack";
}

/**
 * Reusable row used across every settings group.
 * Left: label + optional description. Right (or below for "stack"): control.
 */
export function SettingRow({
  label,
  description,
  children,
  className,
  layout = "between",
}: SettingRowProps) {
  if (layout === "stack") {
    return (
      <div className={cn("space-y-2", className)}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
            {label}
          </p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border border-border bg-muted/40 p-4",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight text-foreground">
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
