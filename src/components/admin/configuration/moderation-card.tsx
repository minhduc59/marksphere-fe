"use client";

import { Shield } from "lucide-react";
import { SectionPanel } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { SettingRow } from "./setting-row";

interface ModerationCardProps {
  score: number;
  onScoreChange: (v: number) => void;
}

export function ModerationCard({ score, onScoreChange }: ModerationCardProps) {
  return (
    <SectionPanel
      className="col-span-12 md:col-span-7"
      title=""
      bodyPadding={false}
    >
      <div className="flex flex-col gap-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-foreground" />
            <h3 className="font-display text-lg font-bold uppercase tracking-wide">
              Moderation Control
            </h3>
          </div>
          <Badge
            variant="outline"
            className="font-display text-xs font-semibold uppercase tracking-widest"
          >
            ACTIVE
          </Badge>
        </div>

        {/* Slider */}
        <SettingRow
          label="Auto-approve Confidence Score"
          description="Submissions with AI scores above this threshold bypass manual review."
          layout="stack"
        >
          <div className="flex items-center gap-6">
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={score}
              onChange={(e) => onScoreChange(parseFloat(e.target.value))}
              className="h-1 flex-1 cursor-pointer accent-foreground"
            />
            <span className="w-14 text-right font-display text-2xl font-bold tabular-nums">
              {score.toFixed(1)}
            </span>
          </div>
        </SettingRow>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="border border-border p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Queue Status
            </p>
            <p className="font-display text-2xl font-bold">
              1,242{" "}
              <span className="text-xs font-normal text-muted-foreground">
                Pending
              </span>
            </p>
          </div>
          <div className="border border-border p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              False Positives
            </p>
            <p className="font-display text-2xl font-bold">
              0.2%{" "}
              <span className="text-xs font-normal text-muted-foreground">
                Last 24h
              </span>
            </p>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
