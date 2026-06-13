import { SectionPanel } from "@/components/ui/section-panel";
import type { TimeSlot } from "@/lib/api/time-slots";

/**
 * Aggregates 30-minute time slots (slot_index 0–47) into 24 hourly buckets,
 * keeping the strongest weighted score per hour, then renders a 2×12 heatmap.
 */
export function EngagementWindows({ slots }: { slots: TimeSlot[] }) {
  const hours = new Array<number>(24).fill(0);
  for (const slot of slots) {
    const hour = Math.floor(slot.slot_index / 2);
    if (hour >= 0 && hour < 24) {
      hours[hour] = Math.max(hours[hour], slot.weighted_score);
    }
  }
  const max = Math.max(...hours, 1);
  const peakHour = hours.indexOf(max);
  const hasData = slots.length > 0 && max > 0;

  const renderRow = (start: number) => (
    <div className="grid grid-cols-12 gap-1">
      {Array.from({ length: 12 }).map((_, i) => {
        const hour = start + i;
        const score = hours[hour];
        const intensity = score > 0 ? 0.12 + 0.88 * (score / max) : 0.04;
        const isPeak = hour === peakHour && score > 0;
        return (
          <div
            key={hour}
            title={`${String(hour).padStart(2, "0")}:00 — score ${Math.round(score)}`}
            className="relative flex h-12 items-center justify-center"
            style={{ backgroundColor: `hsl(var(--foreground) / ${intensity})` }}
          >
            <span
              className="text-[10px] font-semibold"
              style={{ color: intensity > 0.5 ? "hsl(var(--background))" : "hsl(var(--muted-foreground))" }}
            >
              {isPeak ? "PEAK" : String(hour).padStart(2, "0")}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <SectionPanel title="Optimal Engagement Windows">
      {!hasData ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No engagement data yet. Publish posts to learn your best windows.
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {renderRow(0)}
            {renderRow(12)}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 bg-foreground" />
                <span className="text-xs text-muted-foreground">High Intensity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4" style={{ backgroundColor: "hsl(var(--foreground) / 0.08)" }} />
                <span className="text-xs text-muted-foreground">Low Activity</span>
              </div>
            </div>
            <p className="text-xs italic text-muted-foreground">Local time (24h)</p>
          </div>
        </>
      )}
    </SectionPanel>
  );
}
