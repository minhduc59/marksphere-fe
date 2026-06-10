"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Phase, PipelineState, PipelineView } from "@/lib/pipeline/phases";

// ── Theme per pipeline state ───────────────────────────────────────────────

const THEME: Record<
  PipelineState,
  { border: string; bg: string; accent: string; bar: string; barTrack: string; muted: string }
> = {
  running: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    accent: "text-blue-700",
    bar: "bg-blue-500",
    barTrack: "bg-blue-100",
    muted: "text-blue-400/70",
  },
  done: {
    border: "border-teal-200",
    bg: "bg-teal-50",
    accent: "text-teal-700",
    bar: "bg-teal-500",
    barTrack: "bg-teal-100",
    muted: "text-teal-400/70",
  },
  partial: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    accent: "text-amber-700",
    bar: "bg-amber-500",
    barTrack: "bg-amber-100",
    muted: "text-amber-500/70",
  },
  failed: {
    border: "border-red-200",
    bg: "bg-red-50",
    accent: "text-red-700",
    bar: "bg-red-500",
    barTrack: "bg-red-100",
    muted: "text-red-300/70",
  },
};

type Cell = "done" | "active" | "failed" | "pending";

interface PhaseMeta {
  phase: Phase;
  start: number;
  end: number;
  state: Cell;
}

function describePhases(view: PipelineView): PhaseMeta[] {
  let cursor = 0;
  return view.phases.map((phase) => {
    const start = cursor;
    const end = cursor + phase.stages.length - 1;
    cursor = end + 1;

    let state: Cell;
    if (view.state === "done" || view.state === "partial") {
      state = "done";
    } else if (view.state === "failed") {
      state =
        view.activeIndex >= start && view.activeIndex <= end
          ? "failed"
          : view.activeIndex > end
            ? "done"
            : "pending";
    } else {
      state =
        view.activeIndex > end
          ? "done"
          : view.activeIndex >= start && view.activeIndex <= end
            ? "active"
            : "pending";
    }
    return { phase, start, end, state };
  });
}

function calcElapsed(startedAt: string | null): string | null {
  if (!startedAt) return null;
  const ms = Date.now() - Date.parse(startedAt);
  if (Number.isNaN(ms) || ms < 0) return null;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

interface Props {
  view: PipelineView;
  onDismiss?: () => void;
  className?: string;
}

export function PipelineProgress({ view, onDismiss, className }: Props) {
  const theme = THEME[view.state];
  const running = view.state === "running";

  // Live-ticking elapsed timer (only while running).
  const [elapsed, setElapsed] = useState(() => calcElapsed(view.startedAt));
  useEffect(() => {
    setElapsed(calcElapsed(view.startedAt));
    if (view.state !== "running") return;
    const id = setInterval(() => setElapsed(calcElapsed(view.startedAt)), 1000);
    return () => clearInterval(id);
  }, [view.startedAt, view.state]);

  const phaseMeta = describePhases(view);
  // The phase whose stages we expand into the sub-step line.
  const activePhase =
    phaseMeta.find((p) => p.state === "active" || p.state === "failed") ??
    (view.state === "done" || view.state === "partial"
      ? phaseMeta[phaseMeta.length - 1]
      : phaseMeta[0]);

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-lg border px-4 py-3 pr-9",
        theme.border,
        theme.bg,
        className,
      )}
    >
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className={cn(
            "absolute right-2 top-2 rounded p-0.5 transition-colors hover:bg-black/5",
            theme.accent,
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Header: status · title · percent · meta · elapsed */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {view.state === "failed" ? (
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
        ) : view.state === "done" || view.state === "partial" ? (
          <CheckCircle2 className={cn("h-4 w-4 shrink-0", theme.accent)} />
        ) : null}
        <span className={cn("text-sm font-semibold", theme.accent)}>{view.title}</span>
        <span className={cn("text-sm tabular-nums", theme.muted)}>· {view.percent}%</span>
        {view.meta && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              theme.barTrack,
              theme.accent,
            )}
          >
            {view.meta}
          </span>
        )}
        <span className="ml-auto" />
        {elapsed && (
          <span className={cn("text-xs tabular-nums", theme.muted)}>{elapsed}</span>
        )}
      </div>

      {/* Overall progress bar */}
      <div className={cn("h-1.5 w-full overflow-hidden rounded-full", theme.barTrack)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", theme.bar)}
          style={{ width: `${view.percent}%` }}
        />
      </div>

      {/* Phase track */}
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {phaseMeta.map((p, i) => (
          <li key={p.phase.key} className="flex items-center gap-1.5">
            {i > 0 && <span className={cn("text-xs", theme.muted)}>—</span>}
            {p.state === "done" ? (
              <CheckCircle2 className={cn("h-3.5 w-3.5", theme.accent)} />
            ) : p.state === "failed" ? (
              <XCircle className="h-3.5 w-3.5 text-red-500" />
            ) : p.state === "active" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            ) : (
              <Circle className={cn("h-3 w-3", theme.muted)} />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                p.state === "pending" ? theme.muted : theme.accent,
                p.state === "active" && "font-semibold",
              )}
            >
              {p.phase.label}
            </span>
          </li>
        ))}
      </ol>

      {/* Sub-steps of the active phase */}
      {activePhase && (
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 pl-0.5">
          {activePhase.phase.stages.map((stage, j) => {
            const g = activePhase.start + j;
            let cell: Cell;
            if (view.state === "done" || view.state === "partial") cell = "done";
            else if (view.state === "failed")
              cell = g === view.activeIndex ? "failed" : g < view.activeIndex ? "done" : "pending";
            else cell = g < view.activeIndex ? "done" : g === view.activeIndex ? "active" : "pending";

            return (
              <li key={stage.label} className="flex items-center gap-1">
                {j > 0 && <span className={cn("select-none text-xs", theme.muted)}>›</span>}
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs",
                    cell === "done" && "text-teal-600",
                    cell === "active" && cn("font-semibold", theme.accent),
                    cell === "failed" && "font-semibold text-red-600",
                    cell === "pending" && theme.muted,
                  )}
                >
                  {cell === "done" ? (
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                  ) : cell === "failed" ? (
                    <XCircle className="h-3 w-3 shrink-0" />
                  ) : cell === "active" ? (
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                  ) : null}
                  {stage.label}
                  {cell === "active" && running && "…"}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {/* Error detail */}
      {view.error && (view.state === "failed" || view.state === "partial") && (
        <p className="truncate text-xs text-red-600" title={view.error}>
          {view.error}
        </p>
      )}
    </div>
  );
}
