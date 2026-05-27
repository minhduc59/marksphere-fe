"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2, Move, Pause, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { getFontEntry } from "@/lib/fonts";
import { TrimTimeline } from "./trim-timeline";

import type { CreateClipFormValues } from "./form-types";

// ── Font loader ───────────────────────────────────────────────────────────────

function useFontStylesheet(fontFamily: string): string {
  const entry = getFontEntry(fontFamily);
  useEffect(() => {
    if (!entry.googleHref) return;
    const id = `font-${entry.key.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = entry.googleHref;
    document.head.appendChild(link);
  }, [entry.key, entry.googleHref]);
  return entry.cssFamily;
}

// ── YouTube helpers ───────────────────────────────────────────────────────────

function extractYtId(thumbnailSrc: string): string | null {
  const m = thumbnailSrc.match(/youtube\.com\/vi\/([^/]+)\//);
  return m?.[1] ?? null;
}

async function loadYouTubeScript(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).YT?.Player) return;
  await new Promise<void>((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).onYouTubeIframeAPIReady = resolve;
  });
}

// ── Filmstrip extraction ──────────────────────────────────────────────────────

async function extractThumbnails(src: string, duration: number, count = 12): Promise<string[]> {
  // Use a detached (off-DOM) video element so the displayed video is never seeked
  // and hardware-accelerated frames can be decoded into system memory for canvas capture.
  const hidden = document.createElement("video");
  hidden.src         = src;
  hidden.muted       = true;
  hidden.playsInline = true;
  hidden.preload     = "auto";

  await new Promise<void>((resolve, reject) => {
    hidden.addEventListener("loadedmetadata", () => resolve(), { once: true });
    hidden.addEventListener("error",          () => reject(new Error("load error")), { once: true });
  });

  const canvas = document.createElement("canvas");
  canvas.width  = 80;
  canvas.height = 45;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) { hidden.src = ""; return []; }

  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    hidden.currentTime = (i / (count - 1)) * duration;
    await new Promise<void>((r) => hidden.addEventListener("seeked", () => r(), { once: true }));
    // One RAF tick — gives the browser time to decode the frame into system memory
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    try {
      ctx.drawImage(hidden, 0, 0, 80, 45);
      results.push(canvas.toDataURL("image/jpeg", 0.6));
    } catch {
      results.push(""); // hardware decode error — leave slot empty
    }
  }
  hidden.src = ""; // release memory
  return results;
}

// ── Crop geometry helpers ─────────────────────────────────────────────────────

const PREVIEW_REF_W = 300;
const SOURCE_RATIO = 16 / 9;

const RATIO_VALUES: Record<string, number> = {
  "9:16": 9 / 16,
  "16:9": 16 / 9,
  "4:3":  4 / 3,
};

function getCropGeometry(aspectRatio: string) {
  const out = RATIO_VALUES[aspectRatio] ?? 9 / 16;
  const frameW = out <= SOURCE_RATIO ? out / SOURCE_RATIO : 1;
  const frameH = out <= SOURCE_RATIO ? 1 : SOURCE_RATIO / out;
  const canDrag = frameW < 0.98 || frameH < 0.98;
  return { frameW, frameH, canDrag };
}

function clampCenter(center: number, span: number) {
  return Math.max(span / 2, Math.min(1 - span / 2, center));
}

function scaledFontSize(sizePx: number): number {
  return Math.max(9, Math.round(sizePx * (PREVIEW_REF_W / 1080)));
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface LivePreviewProps {
  mediaSrc: string | null;
  mediaType: "video" | "image" | null;
  onDurationChange?: (seconds: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LivePreview({ mediaSrc, mediaType, onDurationChange }: LivePreviewProps) {
  const { watch, setValue } = useFormContext<CreateClipFormValues>();

  const fontFamily       = watch("fontFamily");
  const fontSize         = watch("fontSize");
  const fontColor        = watch("fontColor");
  const captionPos       = watch("captionPosition");
  const captionStyle     = watch("captionStyle");
  const aspectRatio      = watch("aspectRatio");
  const cropX            = watch("cropX");
  const cropY            = watch("cropY");
  const reframeMode      = watch("reframeMode");
  const addSubtitles     = watch("addSubtitles");
  const smartActive      = reframeMode === "smart" && aspectRatio === "9:16";
  const startTimeSeconds = watch("startTimeSeconds");
  const endTimeSeconds   = watch("endTimeSeconds");

  const cssFamily = useFontStylesheet(fontFamily);

  // ── Crop geometry ──────────────────────────────────────────────────────────
  const { frameW, frameH, canDrag } = getCropGeometry(aspectRatio);
  const cx   = clampCenter(cropX, frameW);
  const cy   = clampCenter(cropY, frameH);
  const left = cx - frameW / 2;
  const top  = cy - frameH / 2;
  const pct  = (n: number) => `${(n * 100).toFixed(3)}%`;

  // ── Refs ───────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const ytDivRef     = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ytPlayerRef  = useRef<any>(null);
  const ytPollRef    = useRef<ReturnType<typeof setInterval>>();
  const rafRef       = useRef<number>(0);
  const cropDragging = useRef(false);
  const ytLoadFailed = useRef(false);

  // ── State ──────────────────────────────────────────────────────────────────
  const [imgSrc,        setImgSrc]        = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [thumbnails,    setThumbnails]    = useState<string[]>([]);
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [isDragging,    setIsDragging]    = useState(false);

  const [ytLoaded,      setYtLoaded]      = useState(false);
  const [ytLoading,     setYtLoading]     = useState(false);
  const [ytDuration,    setYtDuration]    = useState(0);
  const [ytCurrentTime, setYtCurrentTime] = useState(0);

  // ── Crop drag ─────────────────────────────────────────────────────────────
  const handleCropMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setValue("cropX", clampCenter((clientX - r.left) / r.width, frameW), { shouldDirty: true });
      setValue("cropY", clampCenter((clientY - r.top) / r.height, frameH), { shouldDirty: true });
    },
    [frameW, frameH, setValue]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (cropDragging.current) handleCropMove(e.clientX, e.clientY); };
    const onUp   = () => { cropDragging.current = false; setIsDragging(false); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    };
  }, [handleCropMove]);

  // ── Reset all state when source changes ───────────────────────────────────
  useEffect(() => {
    setValue("startTimeSeconds", 0, { shouldDirty: false });
    setValue("endTimeSeconds",   0, { shouldDirty: false });
    cancelAnimationFrame(rafRef.current);
    clearInterval(ytPollRef.current);
    if (ytPlayerRef.current) {
      try { ytPlayerRef.current.destroy(); } catch { /* ignore */ }
      ytPlayerRef.current = null;
    }
    setThumbnails([]);
    setCurrentTime(0);
    setIsPlaying(false);
    setVideoDuration(0);
    setYtLoaded(false);
    setYtLoading(false);
    setYtDuration(0);
    setYtCurrentTime(0);
    ytLoadFailed.current = false;
  }, [mediaSrc, setValue]);

  // ── Auto-load YouTube player when a YouTube URL is detected ────────────────
  useEffect(() => {
    if (mediaType !== "image" || !mediaSrc) return;
    if (ytLoaded || ytLoading || ytPlayerRef.current || ytLoadFailed.current) return;
    if (!extractYtId(mediaSrc)) return;
    const id = requestAnimationFrame(() => { void handleLoadYouTube(); });
    return () => cancelAnimationFrame(id);
    // handleLoadYouTube is a stable closure over refs/setters; safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaSrc, mediaType, ytLoaded, ytLoading]);

  // ── YouTube thumbnail fallback ─────────────────────────────────────────────
  useEffect(() => {
    setImgSrc(mediaType === "image" && mediaSrc ? mediaSrc : null);
  }, [mediaSrc, mediaType]);

  const handleImgError = () => {
    if (imgSrc?.includes("maxresdefault")) {
      setImgSrc(imgSrc.replace("maxresdefault", "hqdefault"));
    }
  };

  // ── Video metadata + filmstrip ─────────────────────────────────────────────
  const handleLoadedMetadata = () => {
    const dur = Math.floor(videoRef.current?.duration ?? 0);
    setVideoDuration(dur);
    onDurationChange?.(dur);
    if (mediaSrc) {
      extractThumbnails(mediaSrc, dur)
        .then(setThumbnails)
        .catch(() => setThumbnails([]));
    }
  };

  // onLoadedData fires when the first frame is decoded.
  // On macOS Chrome/Safari, a paused video doesn't paint to the compositor layer
  // until it plays at least once — so we briefly play, wait one frame, then pause.
  const handleLoadedData = async () => {
    const v = videoRef.current;
    if (!v) return;
    const dur = v.duration || 0;
    if (dur > 0) v.currentTime = Math.min(5, dur * 0.1);
    try {
      await v.play();
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      v.pause();
    } catch {
      /* autoplay blocked — muted videos should be allowed; ignore otherwise */
    }
  };

  // ── RAF playhead ──────────────────────────────────────────────────────────
  const startRaf = useCallback(() => {
    const tick = () => {
      setCurrentTime(videoRef.current?.currentTime ?? 0);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRaf = useCallback(() => { cancelAnimationFrame(rafRef.current); }, []);

  // ── YouTube IFrame loading ─────────────────────────────────────────────────
  const handleLoadYouTube = async () => {
    if (!mediaSrc || !ytDivRef.current) return;
    const ytId = extractYtId(mediaSrc);
    if (!ytId) return;

    setYtLoading(true);
    try {
      await loadYouTubeScript();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ytPlayerRef.current = new (window as any).YT.Player(ytDivRef.current, {
        videoId: ytId,
        playerVars: { autoplay: 0, controls: 1, rel: 0 },
        events: {
          onReady: (e: { target: { getDuration: () => number; getIframe: () => HTMLIFrameElement } }) => {
            // Style the iframe so it fills the container absolutely.
            // YouTube replaces the ref div with a new <iframe> element that has no positioning,
            // so we must set it here after creation.
            const iframe = e.target.getIframe();
            iframe.style.position = "absolute";
            iframe.style.inset = "0";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            setYtDuration(Math.floor(e.target.getDuration()));
            setYtLoaded(true);
            setYtLoading(false);
          },
          onStateChange: (e: { data: number; target: { getCurrentTime: () => number } }) => {
            if (e.data === 1) {
              ytPollRef.current = setInterval(() => {
                setYtCurrentTime(Math.floor(e.target.getCurrentTime()));
              }, 500);
            } else {
              clearInterval(ytPollRef.current);
            }
          },
        },
      });
    } catch {
      ytLoadFailed.current = true;
      setYtLoading(false);
    }
  };

  // ── Caption style ──────────────────────────────────────────────────────────
  const textShadow: Record<typeof captionStyle, string> = {
    default: "0 0 0 #000, 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
    bold:    "0 0 0 #000, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
    minimal: "0 1px 3px rgba(0,0,0,0.7)",
  };

  const captionAlignStyle: React.CSSProperties =
    captionPos === "top"    ? { top: "10%" }
    : captionPos === "center" ? { top: "50%", transform: "translateY(-50%)" }
    : { bottom: "10%" };

  const ratioLabels: Record<string, string> = {
    "9:16": "9:16 · Vertical",
    "16:9": "16:9 · Landscape",
    "4:3":  "4:3 · Classic",
  };

  // ── Timeline derived values ────────────────────────────────────────────────
  const timelineDuration    = mediaType === "video" ? videoDuration : ytDuration;
  const timelineCurrentTime = mediaType === "video" ? currentTime   : ytCurrentTime;

  const handleTimelineStartChange = (s: number) => {
    setValue("startTimeSeconds", s, { shouldDirty: true });
    if (videoRef.current) videoRef.current.currentTime = s;
    else ytPlayerRef.current?.seekTo(s, true);
  };
  const handleTimelineEndChange = (s: number) => {
    setValue("endTimeSeconds", s, { shouldDirty: true });
  };
  const handleTimelineSeek = (s: number) => {
    setCurrentTime(s);
    if (videoRef.current) videoRef.current.currentTime = s;
    else ytPlayerRef.current?.seekTo(s, true);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Output Preview</p>

      {/* ── Source frame (always 16:9) ── */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full select-none overflow-hidden rounded-xl bg-slate-900 aspect-video",
          canDrag && !ytLoaded && !smartActive ? "cursor-move" : "cursor-default"
        )}
        onMouseDown={(e) => {
          if (!canDrag || ytLoaded || smartActive) return;
          e.preventDefault();
          cropDragging.current = true;
          handleCropMove(e.clientX, e.clientY);
        }}
      >
        {/* Uploaded video */}
        {mediaType === "video" && mediaSrc && (
          <video
            ref={videoRef}
            src={mediaSrc}
            muted
            playsInline
            preload="auto"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            onLoadedMetadata={handleLoadedMetadata}
            onLoadedData={handleLoadedData}
            onPlay={() => { setIsPlaying(true); startRaf(); }}
            onPause={() => { setIsPlaying(false); stopRaf(); }}
            onEnded={() => { setIsPlaying(false); stopRaf(); }}
          />
        )}

        {/* YouTube IFrame target — always rendered so YouTube measures correct dimensions */}
        {mediaType === "image" && (
          <div ref={ytDivRef} className="absolute inset-0" />
        )}

        {/* YouTube thumbnail — sits above the iframe (z-10) until player is ready */}
        {mediaType === "image" && imgSrc && !ytLoaded && (
          <img
            src={imgSrc}
            alt="Video thumbnail"
            className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover"
            onError={handleImgError}
          />
        )}

        {/* Gradient placeholder */}
        {!mediaSrc && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,_#1e3a5f_0%,_#0f172a_70%)]" />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
                backgroundSize: "10% 10%",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="select-none text-center text-[10px] font-medium uppercase tracking-widest text-white/30 px-4">
                Paste URL or upload to preview
              </span>
            </div>
          </>
        )}

        {/* Loading spinner while YouTube IFrame initializes */}
        {mediaType === "image" && ytLoading && !ytLoaded && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/20">
            <Loader2 className="h-8 w-8 animate-spin text-white/80" />
          </div>
        )}

        {/* Dim masks outside crop window */}
        {top > 0.002 && (
          <div className="pointer-events-none absolute inset-x-0 top-0 bg-black/30" style={{ height: pct(top) }} />
        )}
        {top + frameH < 0.998 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/30" style={{ height: pct(1 - top - frameH) }} />
        )}
        {left > 0.002 && (
          <div
            className="pointer-events-none absolute bg-black/30"
            style={{ top: pct(top), height: pct(frameH), left: 0, width: pct(left) }}
          />
        )}
        {left + frameW < 0.998 && (
          <div
            className="pointer-events-none absolute bg-black/30"
            style={{ top: pct(top), height: pct(frameH), right: 0, width: pct(1 - left - frameW) }}
          />
        )}

        {/* Crop window */}
        <div
          className="pointer-events-none absolute overflow-hidden"
          style={{ left: pct(left), top: pct(top), width: pct(frameW), height: pct(frameH) }}
        >
          {addSubtitles && (
            <p
              className={cn(
                "absolute inset-x-0 px-2 text-center leading-snug",
                captionStyle === "bold"    && "font-extrabold",
                captionStyle === "minimal" && "font-normal",
                captionStyle === "default" && "font-semibold"
              )}
              style={{
                ...captionAlignStyle,
                fontFamily: cssFamily,
                fontSize: scaledFontSize(fontSize),
                color: fontColor,
                textShadow: textShadow[captionStyle],
              }}
            >
              Sample subtitle text
            </p>
          )}
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center">
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-mono text-white/70">
              {aspectRatio}
            </span>
          </div>
        </div>

        {/* Crop window border */}
        <div
          className="pointer-events-none absolute rounded border-2 border-white/80"
          style={{ left: pct(left), top: pct(top), width: pct(frameW), height: pct(frameH) }}
        />

        {/* Drag shield — blocks YouTube iframe from swallowing mousemove during drag */}
        {isDragging && ytLoaded && (
          <div className="absolute inset-0 z-20 cursor-move" />
        )}

        {/* Corner bracket handles */}
        {canDrag && !smartActive && (
          <>
            {[
              { l: left,          t: top          },
              { l: left + frameW, t: top          },
              { l: left,          t: top + frameH },
              { l: left + frameW, t: top + frameH },
            ].map(({ l, t }, i) => (
              <div
                key={i}
                className="pointer-events-auto absolute z-30 h-3 w-3 cursor-move border-white"
                style={{
                  left: `calc(${pct(l)} - 6px)`,
                  top:  `calc(${pct(t)} - 6px)`,
                  borderTopWidth:    t <= top + 0.001 ? 2 : 0,
                  borderBottomWidth: t >= top + frameH - 0.001 ? 2 : 0,
                  borderLeftWidth:   l <= left + 0.001 ? 2 : 0,
                  borderRightWidth:  l >= left + frameW - 0.001 ? 2 : 0,
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  cropDragging.current = true;
                  setIsDragging(true);
                  handleCropMove(e.clientX, e.clientY);
                }}
              />
            ))}
          </>
        )}

        {/* Drag handle pill OR smart-tracking indicator */}
        {canDrag && !smartActive && (
          <div
            className="pointer-events-auto absolute z-30 flex cursor-move items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] text-white/80 shadow"
            style={{
              top:  `calc(${pct(top)} + 6px)`,
              left: `calc(${pct(left + frameW / 2)} - 36px)`,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              cropDragging.current = true;
              setIsDragging(true);
              handleCropMove(e.clientX, e.clientY);
            }}
          >
            <Move className="h-2.5 w-2.5" />
            drag to reposition
          </div>
        )}
        {smartActive && (
          <div
            className="pointer-events-none absolute left-1/2 top-2 z-30 -translate-x-1/2 rounded-full bg-emerald-500/85 px-2.5 py-0.5 text-[10px] font-medium text-white shadow"
          >
            Auto subject-tracking · 9:16
          </div>
        )}
      </div>

      {/* Preview info row */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs text-muted-foreground">{ratioLabels[aspectRatio]}</span>
        <span className={cn("text-xs font-medium", addSubtitles ? "text-foreground" : "text-muted-foreground")}>
          {addSubtitles ? "Subtitles on" : "Subtitles off"}
        </span>
      </div>

      {/* Trim timeline */}
      {mediaSrc && timelineDuration > 0 && (
        <div className="rounded-lg border bg-slate-900/60 p-3 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Trim Range</p>

          <TrimTimeline
            duration={timelineDuration}
            startTime={startTimeSeconds}
            endTime={endTimeSeconds}
            currentTime={timelineCurrentTime}
            thumbnails={mediaType === "video" ? thumbnails : undefined}
            onStartChange={handleTimelineStartChange}
            onEndChange={handleTimelineEndChange}
            onSeek={handleTimelineSeek}
          />

          {mediaType === "video" && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                onClick={() => {
                  if (videoRef.current?.paused) videoRef.current.play();
                  else videoRef.current?.pause();
                }}
              >
                {isPlaying
                  ? <Pause className="h-4 w-4 fill-current" />
                  : <Play  className="h-4 w-4 fill-current" />
                }
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading: video element exists but metadata not yet decoded */}
      {mediaSrc && mediaType === "video" && videoDuration === 0 && (
        <div className="flex items-center gap-2 rounded-lg border p-3 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading video…
        </div>
      )}
    </div>
  );
}
