import { cn } from "@/lib/utils";
import { SectionPanel } from "@/components/admin";
import type { AdminOverview } from "@/lib/api/types";

export function ContentPipelineFunnel({
  data,
}: {
  data: AdminOverview["contentPipeline"];
}) {
  const rows = [
    { label: "Generated", count: data.generated, muted: false },
    { label: "Auto-approved", count: data.autoApproved, muted: false },
    { label: "Flagged", count: data.flagged, muted: true },
    { label: "Published", count: data.published, muted: false },
  ];
  // Bars are proportional to the funnel's top (Generated).
  const max = Math.max(data.generated, 1);

  return (
    <SectionPanel title="Content Pipeline">
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{row.label}</span>
              <span>{row.count.toLocaleString("en-US")}</span>
            </div>
            <div className="h-8 bg-muted/40">
              <div
                className={cn(
                  "h-full",
                  row.muted ? "bg-muted-foreground" : "bg-foreground"
                )}
                style={{ width: `${Math.min(100, (row.count / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
