"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { SectionPanel } from "@/components/admin";
import type { SeriesPoint } from "@/lib/api/types";

type Range = "24h" | "7d";

const AXIS = "hsl(var(--muted-foreground))";
const GRID = "hsl(var(--border))";

export function TrendScanChart({
  data,
}: {
  data: { "24h": SeriesPoint[]; "7d": SeriesPoint[] };
}) {
  const [range, setRange] = useState<Range>("24h");
  const series = data[range];

  const toggleAction = (
    <div className="flex gap-2">
      {(["24h", "7d"] as Range[]).map((r) => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className={cn(
            "px-2 py-1 text-[10px] font-bold uppercase transition-colors",
            range === r
              ? "bg-foreground text-background"
              : "border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );

  return (
    <SectionPanel title="Trend-scan volume over time" action={toggleAction}>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: AXIS }}
              stroke={GRID}
              interval="preserveStartEnd"
              minTickGap={24}
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
              dataKey="value"
              name="Scans"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionPanel>
  );
}
