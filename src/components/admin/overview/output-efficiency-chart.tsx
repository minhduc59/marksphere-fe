"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { SectionPanel } from "@/components/admin";
import type { EfficiencyPoint } from "@/lib/api/types";

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

export function OutputEfficiencyChart({ data }: { data: EfficiencyPoint[] }) {
  return (
    <SectionPanel title="Output Efficiency: Generated vs Published" action={legend}>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="genFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="pubFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: AXIS }}
              stroke={GRID}
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
            <Area
              type="monotone"
              dataKey="generated"
              name="Generated"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              fill="url(#genFill)"
            />
            <Area
              type="monotone"
              dataKey="published"
              name="Published"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              fill="url(#pubFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionPanel>
  );
}
