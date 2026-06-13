"use client";

import { Globe } from "lucide-react";
import { SectionPanel } from "@/components/admin";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingRow } from "./setting-row";

type RetryStrategy = "exponential" | "linear" | "immediate";

interface HackerNewsApiCardProps {
  rateLimitReqMin: number;
  onRateLimitChange: (v: number) => void;
  retryStrategy: RetryStrategy;
  onRetryStrategyChange: (v: RetryStrategy) => void;
}

const RETRY_OPTIONS: { value: RetryStrategy; label: string }[] = [
  { value: "exponential", label: "Exponential Backoff" },
  { value: "linear", label: "Linear Delay" },
  { value: "immediate", label: "Immediate Failure" },
];

export function HackerNewsApiCard({
  rateLimitReqMin,
  onRateLimitChange,
  retryStrategy,
  onRetryStrategyChange,
}: HackerNewsApiCardProps) {
  return (
    <SectionPanel
      className="col-span-12 md:col-span-4"
      title=""
      bodyPadding={false}
    >
      <div className="flex flex-col gap-6 p-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-foreground" />
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">
            HackerNews API
          </h3>
        </div>

        <div className="space-y-5">
          {/* Rate limit */}
          <SettingRow label="Rate Limit (req/min)" layout="stack">
            <Input
              type="number"
              value={rateLimitReqMin}
              onChange={(e) => onRateLimitChange(Number(e.target.value))}
              aria-label="Rate limit requests per minute"
            />
          </SettingRow>

          {/* Retry strategy */}
          <SettingRow label="Retry Strategy" layout="stack">
            <Select
              value={retryStrategy}
              onValueChange={(v) => onRetryStrategyChange(v as RetryStrategy)}
            >
              <SelectTrigger className="rounded-none" aria-label="Retry strategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RETRY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          {/* Quota bar */}
          <div className="pt-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-xs text-destructive">
                Quota: 85% utilized
              </span>
            </div>
            <div className="h-1 w-full bg-muted">
              <div className="h-full bg-destructive" style={{ width: "85%" }} />
            </div>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
