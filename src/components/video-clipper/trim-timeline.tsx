"use client";

import { useEffect, useRef } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TrimTimelineProps {
  duration: number;
  startTime: number;
  endTime: number;        // 0 = no limit (full video)
  currentTime: number;
  onStartChange: (s: number) => void;
  onEndChange: (s: number) => void;
  onSeek: (s: number) => void;
  thumbnails?: string[];  // base64 filmstrip frames
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TrimTimeline({
  duration,
  startTime,
  endTime,
  currentTime,
  onStartChange,
  onEndChange,
  onSeek,
  thumbnails,
}: TrimTimelineProps) {
  const barRef   = useRef<HTMLDivElement>(null);
  const dragging = useRef<"start" | "end" | "seek" | null>(null);

  const effectiveEnd = endTime > 0 ? endTime : duration;
  const startPct     = (startTime / duration) * 100;
  const endPct       = (effectiveEnd / duration) * 100;
  const playPct      = Math.min((currentTime / duration) * 100, 100);

  // Global pointer listeners so the drag doesn't break when cursor moves fast
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || !barRef.current) return;
      const r = barRef.current.getBoundingClientRect();
      const t = Math.max(0, Math.min(duration, ((e.clientX - r.left) / r.width) * duration));
      if (dragging.current === "start") {
        onStartChange(Math.min(t, endTime > 0 ? endTime - 1 : t));
      } else if (dragging.current === "end") {
        onEndChange(Math.max(t, startTime + 1));
      } else {
        onSeek(t);
      }
    };
    const onUp = () => { dragging.current = null; };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup",   onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup",   onUp);
    };
  }, [duration, startTime, endTime, onStartChange, onEndChange, onSeek]);

  if (duration <= 0) return null;

  const hasFilmstrip = thumbnails && thumbnails.length > 0;

  return (
    <div className="select-none space-y-1">
      {/* Time labels */}
      <div className="relative flex justify-between px-0.5 text-[10px] font-mono">
        <span className="text-amber-400">{formatSeconds(startTime)}</span>
        <span className="absolute left-1/2 -translate-x-1/2 text-white/50">
          {formatSeconds(currentTime)}
        </span>
        <span className="text-amber-400">
          {endTime > 0 ? formatSeconds(endTime) : formatSeconds(duration)}
        </span>
      </div>

      {/* Filmstrip thumbnails */}
      {hasFilmstrip && (
        <div className="flex overflow-hidden rounded-t-md border border-white/10">
          {thumbnails!.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              draggable={false}
              className="h-10 flex-1 object-cover"
            />
          ))}
        </div>
      )}

      {/* Trim bar */}
      <div
        ref={barRef}
        className={`relative h-9 cursor-pointer overflow-visible bg-slate-700 ${
          hasFilmstrip ? "rounded-b-md" : "rounded-md"
        }`}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).dataset.handle) return;
          dragging.current = "seek";
          if (!barRef.current) return;
          const r = barRef.current.getBoundingClientRect();
          const t = Math.max(0, Math.min(duration, ((e.clientX - r.left) / r.width) * duration));
          onSeek(t);
        }}
      >
        {/* Excluded left */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-l-md bg-black/70"
          style={{ width: `${startPct}%` }}
        />

        {/* Selection highlight */}
        <div
          className="pointer-events-none absolute inset-y-0 border-y-2 border-amber-400 bg-amber-400/10"
          style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
        />

        {/* Excluded right */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 rounded-r-md bg-black/70"
          style={{ width: `${100 - endPct}%` }}
        />

        {/* Playhead */}
        <div
          className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-white/90 shadow"
          style={{ left: `${playPct}%` }}
        />

        {/* Start handle */}
        <div
          data-handle="start"
          className="absolute inset-y-0 z-10 flex w-5 -translate-x-1/2 cursor-ew-resize items-center justify-center"
          style={{ left: `${startPct}%` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            dragging.current = "start";
          }}
        >
          <div className="pointer-events-none h-full w-1.5 rounded-full bg-amber-400 shadow" />
        </div>

        {/* End handle */}
        <div
          data-handle="end"
          className="absolute inset-y-0 z-10 flex w-5 -translate-x-1/2 cursor-ew-resize items-center justify-center"
          style={{ left: `${endPct}%` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            dragging.current = "end";
          }}
        >
          <div className="pointer-events-none h-full w-1.5 rounded-full bg-amber-400 shadow" />
        </div>
      </div>

      {/* Total duration footer */}
      <div className="flex justify-between px-0.5 text-[10px] font-mono text-muted-foreground/50">
        <span>0:00</span>
        <span>{formatSeconds(duration)}</span>
      </div>
    </div>
  );
}
