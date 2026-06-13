import { cn } from "@/lib/utils";

export type StatusTone = "ok" | "warn" | "error" | "idle";

const TONE_CLASS: Record<StatusTone, string> = {
  ok: "bg-foreground",
  warn: "bg-amber-500",
  error: "bg-destructive",
  idle: "bg-muted-foreground/40",
};

/** A small status dot with an optional label — used for service/health indicators. */
export function StatusDot({
  tone = "ok",
  label,
  pulse,
  className,
}: {
  tone?: StatusTone;
  label?: string;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          TONE_CLASS[tone],
          pulse && tone !== "idle" && "animate-pulse-subtle"
        )}
      />
      {label && <span className="text-[11px] font-medium">{label}</span>}
    </span>
  );
}
