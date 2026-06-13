"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { SectionPanel } from "@/components/ui/section-panel";

export interface ProductionPoint {
  label: string;
  generated: number;
  published: number;
}

const AXIS = "hsl(var(--muted-foreground))";
const GRID = "hsl(var(--border))";

const legend = (
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 bg-foreground" />
      <span className="text-[11px]">Generated</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 bg-muted-foreground" />
      <span className="text-[11px]">Published</span>
    </div>
  </div>
);

/** Generated vs Published content over the trailing week (line chart). */
export function ProductionChart({ data }: { data: ProductionPoint[] }) {
  const hasData = data.some((d) => d.generated > 0 || d.published > 0);

  return (
    <SectionPanel title="Content Production Over Time" action={legend}>
      <div className="h-[280px] w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: AXIS }}
                stroke={GRID}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                tick={{ fontSize: 10, fill: AXIS }}
                stroke={GRID}
                allowDecimals={false}
                width={32}
              />
              <Tooltip
                cursor={{ stroke: GRID }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 0,
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="generated"
                name="Generated"
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="published"
                name="Published"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No production activity in the last 7 days.
          </div>
        )}
      </div>
    </SectionPanel>
  );
}
