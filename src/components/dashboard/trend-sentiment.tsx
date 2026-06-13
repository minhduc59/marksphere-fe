import { SectionPanel } from "@/components/ui/section-panel";
import { Sentiment } from "@/lib/api/types";

export type SentimentCounts = Record<Sentiment, number>;

// Donut segments in draw order. Stroke colours stay within the monochrome
// system, with `destructive` reserved for bearish to read as a clear negative.
const SEGMENTS: { key: Sentiment; label: string; stroke: string }[] = [
  { key: Sentiment.BULLISH, label: "Bullish", stroke: "hsl(var(--foreground))" },
  { key: Sentiment.NEUTRAL, label: "Neutral", stroke: "hsl(var(--muted-foreground))" },
  { key: Sentiment.CONTROVERSIAL, label: "Controversial", stroke: "hsl(var(--border))" },
  { key: Sentiment.BEARISH, label: "Bearish", stroke: "hsl(var(--destructive))" },
];

/** Donut of trend sentiment distribution, centred on the % bullish ("positive"). */
export function TrendSentiment({ counts }: { counts: SentimentCounts }) {
  const total = SEGMENTS.reduce((sum, s) => sum + (counts[s.key] || 0), 0);
  const positivePct = total > 0 ? Math.round((counts[Sentiment.BULLISH] / total) * 100) : 0;

  // Build cumulative dash offsets — circumference is ~100 at r=15.9155.
  let offset = 0;
  const arcs = SEGMENTS.map((seg) => {
    const pct = total > 0 ? (counts[seg.key] / total) * 100 : 0;
    const arc = { ...seg, pct, dash: `${pct} ${100 - pct}`, dashoffset: -offset };
    offset += pct;
    return arc;
  });

  return (
    <SectionPanel title="Trend Sentiment">
      {total === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No sentiment data yet.
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative mb-8 h-44 w-44">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="transparent"
                stroke="hsl(var(--muted))"
                strokeWidth="4"
              />
              {arcs.map((arc) => (
                <circle
                  key={arc.key}
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke={arc.stroke}
                  strokeWidth="4"
                  strokeDasharray={arc.dash}
                  strokeDashoffset={arc.dashoffset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-bold tracking-tight">
                {positivePct}%
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Positive
              </span>
            </div>
          </div>
          <div className="grid w-full max-w-[240px] grid-cols-2 gap-x-8 gap-y-2">
            {arcs.map((arc) => (
              <div key={arc.key} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: arc.stroke }} />
                <span className="text-xs text-muted-foreground">{arc.label}</span>
                <span className="ml-auto text-xs font-medium">{counts[arc.key]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionPanel>
  );
}
