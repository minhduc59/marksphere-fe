"use client";

import { Clock, Play, Pause } from "lucide-react";
import { SectionPanel } from "@/components/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingRow } from "./setting-row";

interface ScanningCardProps {
  cronExpression: string;
  onCronChange: (v: string) => void;
}

const ACTIVITY_BARS = [40, 60, 30, 90, 55, 75, 45, 60, 85, 100];

export function ScanningCard({ cronExpression, onCronChange }: ScanningCardProps) {
  return (
    <SectionPanel
      className="col-span-12 md:col-span-8"
      title=""
      bodyPadding={false}
    >
      <div className="flex flex-col gap-6 p-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-foreground" />
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">
            Background Scanning
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: cron input + actions */}
          <div className="space-y-4">
            <SettingRow
              label="Cron Expression"
              description="Next run: Today, 22:00:00 GMT"
              layout="stack"
            >
              <Input
                value={cronExpression}
                onChange={(e) => onCronChange(e.target.value)}
                className="font-mono"
                aria-label="Cron expression"
              />
            </SettingRow>

            <div className="flex items-center gap-4 pt-1">
              <Button
                className="rounded-none px-6 uppercase tracking-widest"
                size="sm"
                onClick={() => {}}
              >
                <Play className="h-3.5 w-3.5" />
                Run Now
              </Button>
              <Button
                variant="outline"
                className="rounded-none px-6 uppercase tracking-widest"
                size="sm"
                onClick={() => {}}
              >
                <Pause className="h-3.5 w-3.5" />
                Pause Task
              </Button>
            </div>
          </div>

          {/* Right: crawler activity bars */}
          <div className="relative overflow-hidden border border-border bg-muted/40 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest">
              Crawler Activity
            </p>
            <div className="flex h-24 items-end gap-1">
              {ACTIVITY_BARS.map((pct, i) => (
                <div
                  key={i}
                  className="w-full bg-foreground/20"
                  style={{ height: `${pct}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
