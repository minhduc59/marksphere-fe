import { cn } from "@/lib/utils";
import { SectionPanel } from "@/components/ui/section-panel";

export interface FunnelRow {
  label: string;
  count: number;
}

/** Proportional funnel bars — each bar is sized against the funnel's top stage. */
export function PipelineFunnel({ rows }: { rows: FunnelRow[] }) {
  const max = Math.max(rows[0]?.count ?? 0, 1);

  return (
    <SectionPanel title="Content Pipeline Funnel">
      <div className="space-y-5">
        {rows.map((row, i) => (
          <div key={row.label} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-semibold">
                {row.count.toLocaleString("en-US")}
              </span>
            </div>
            <div className="h-9 bg-muted/40">
              <div
                className={cn("h-full", i === rows.length - 1 ? "bg-foreground" : "bg-muted-foreground")}
                style={{ width: `${Math.max(4, Math.min(100, (row.count / max) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
