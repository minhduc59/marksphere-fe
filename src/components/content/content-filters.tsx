"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentStatus, PostFormat } from "@/lib/api/types";
import { FORMAT_LABELS } from "@/lib/content/formats";

export type DateRange = "all" | "7d" | "30d";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Status: All" },
  { value: ContentStatus.DRAFT, label: "Draft" },
  { value: ContentStatus.NEEDS_REVISION, label: "Needs Revision" },
  { value: ContentStatus.APPROVED, label: "Approved" },
  { value: ContentStatus.FLAGGED_FOR_REVIEW, label: "Flagged" },
  { value: ContentStatus.PUBLISHED, label: "Published" },
];

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "all", label: "Date: All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

export interface ContentFilterState {
  status: string;
  format: string;
  dateRange: DateRange;
}

interface Props {
  value: ContentFilterState;
  onChange: (next: ContentFilterState) => void;
  /** Optional right-aligned summary, e.g. "Showing 12 of 72". */
  summary?: string;
  /**
   * Hide the status filter — used by the board view, where each status already
   * has its own column so a status filter would be redundant and confusing.
   */
  hideStatus?: boolean;
}

/** Shared Status / Format / Date filter bar for both Content views. */
export function ContentFilters({ value, onChange, summary, hideStatus }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      {!hideStatus && (
        <Select
          value={value.status}
          onValueChange={(status) => onChange({ ...value, status })}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={value.format}
        onValueChange={(format) => onChange({ ...value, format })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Format: All</SelectItem>
          {Object.values(PostFormat).map((f) => (
            <SelectItem key={f} value={f}>
              {FORMAT_LABELS[f]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.dateRange}
        onValueChange={(dateRange) =>
          onChange({ ...value, dateRange: dateRange as DateRange })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {summary && (
        <span className="ml-auto text-xs uppercase tracking-wide text-muted-foreground">
          {summary}
        </span>
      )}
    </div>
  );
}

/** True when `createdAt` falls within the selected range. */
export function withinRange(createdAt: string, range: DateRange): boolean {
  if (range === "all") return true;
  const days = range === "7d" ? 7 : 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() >= cutoff;
}
