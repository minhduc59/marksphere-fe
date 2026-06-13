import { StatusDot, type StatusTone } from "@/components/admin";
import type { HealthStatus, ServiceHealth } from "@/lib/api/types";

const TONE: Record<HealthStatus, StatusTone> = {
  ok: "ok",
  error: "error",
  unknown: "idle",
};

export function SystemHealthStrip({
  internal,
  external,
}: {
  internal: ServiceHealth[];
  external: ServiceHealth[];
}) {
  return (
    <section className="space-y-4">
      <h3 className="font-display text-sm font-semibold tracking-tight">
        System Health Monitor
      </h3>
      <div className="flex flex-wrap gap-4">
        {/* Internal services */}
        <div className="flex items-center gap-3 border border-border bg-muted px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Internal
          </span>
          <div className="flex flex-wrap gap-2">
            {internal.map((svc) => (
              <StatusDot
                key={svc.label}
                tone={TONE[svc.status]}
                label={svc.label}
                pulse={svc.status === "error"}
              />
            ))}
          </div>
        </div>

        {/* External services */}
        <div className="flex items-center gap-3 border border-border bg-muted px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            External
          </span>
          <div className="flex flex-wrap gap-4">
            {external.map((svc) => (
              <StatusDot
                key={svc.label}
                tone={TONE[svc.status]}
                label={svc.label}
                pulse={svc.status === "error"}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
