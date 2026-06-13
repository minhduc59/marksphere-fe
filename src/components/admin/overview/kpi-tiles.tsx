import { StatTile } from "@/components/admin";
import type { Kpi } from "@/lib/api/types";

/** Compact value formatting: 42800 → "42.8k", 1_200_000 → "1.2M". */
function formatValue(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString("en-US");
}

export function KpiTiles({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <StatTile
          key={kpi.label}
          label={kpi.label}
          value={formatValue(kpi.value)}
          delta={
            kpi.deltaPct === null
              ? "—"
              : `${kpi.deltaPct >= 0 ? "+" : ""}${kpi.deltaPct}%`
          }
          deltaDirection={
            kpi.deltaPct === null ? undefined : kpi.deltaPct >= 0 ? "up" : "down"
          }
        />
      ))}
    </div>
  );
}
