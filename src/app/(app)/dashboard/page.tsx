"use client";

import { useMemo, useState } from "react";
import { Link2, Sparkles } from "lucide-react";
import { format, isSameDay, startOfDay, subDays } from "date-fns";

import { StatTile } from "@/components/ui/stat-tile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleUrlModal } from "@/components/dashboard/article-url-modal";
import { StartScanModal } from "@/components/dashboard/start-scan-modal";
import { StartPipelineModal } from "@/components/dashboard/start-pipeline-modal";
import { ProductionChart } from "@/components/dashboard/production-chart";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { RecentPostsTable } from "@/components/dashboard/recent-posts-table";
import { TrendingTopicsTable } from "@/components/dashboard/trending-topics-table";
import { TrendSentiment } from "@/components/dashboard/trend-sentiment";
import { EngagementWindows } from "@/components/dashboard/engagement-windows";
import { ScanPipelineProgress } from "@/components/pipeline/scan-pipeline-progress";
import { PublishPipelineProgress } from "@/components/pipeline/publish-pipeline-progress";
import { OverallPipelineProgress } from "@/components/pipeline/overall-pipeline-progress";
import { useScans } from "@/hooks/api/use-scans";
import { usePipelineRuns } from "@/hooks/api/use-pipeline-runs";
import { usePosts } from "@/hooks/api/use-posts";
import { useTrends, useTopTrends } from "@/hooks/api/use-trends";
import { usePublishHistory } from "@/hooks/api/use-publish";
import { useTimeSlots } from "@/hooks/api/use-time-slots";
import { usePipelineStore } from "@/stores/pipeline-store";
import { ScanStatus, ContentStatus, Sentiment } from "@/lib/api/types";

// Mirrors the backend SCAN_STALE_TIMEOUT_MINUTES watchdog: a run older than
// this is treated as stuck (not actually running), so it stops disabling the
// scan / pipeline buttons even before the backend sweep fails it.
const STALE_RUN_MS = 30 * 60 * 1000;

function isActiveRun(status: ScanStatus, startedAt: string | null): boolean {
  if (status !== ScanStatus.RUNNING && status !== ScanStatus.PENDING) return false;
  if (!startedAt) return true;
  return Date.now() - new Date(startedAt).getTime() < STALE_RUN_MS;
}

const EMPTY_SENTIMENT: Record<Sentiment, number> = {
  [Sentiment.BULLISH]: 0,
  [Sentiment.NEUTRAL]: 0,
  [Sentiment.BEARISH]: 0,
  [Sentiment.CONTROVERSIAL]: 0,
};

export default function DashboardPage() {
  // Generated content (recent window) — feeds KPIs, recent table, production chart.
  const { data: posts, isLoading: postsLoading } = usePosts({ pageSize: 100 });
  const { data: publishedPosts, isLoading: publishLoading } = usePublishHistory({
    status: "published",
    pageSize: 100,
  });
  const { data: approved } = usePosts({ status: ContentStatus.APPROVED, pageSize: 1 });
  const { data: trends, isLoading: trendsLoading } = useTrends({ pageSize: 100 });
  const { data: topTrends, isLoading: topTrendsLoading } = useTopTrends("7d");
  const { data: timeSlots } = useTimeSlots();

  const { data: scansData } = useScans(
    { pageSize: 5 },
    {
      refetchInterval: (q) =>
        q.state.data?.items.some((s) => isActiveRun(s.status, s.startedAt)) ? 5000 : false,
    },
  );
  const { data: pipelineRuns } = usePipelineRuns(
    { pageSize: 5 },
    {
      refetchInterval: (q) =>
        q.state.data?.items.some((p) => isActiveRun(p.status, p.created_at)) ? 5000 : false,
    },
  );

  const activeScanId = usePipelineStore((s) => s.activeScanId);
  const activePublishId = usePipelineStore((s) => s.activePublishId);
  const activePipelineId = usePipelineStore((s) => s.activePipelineId);
  const [articleOpen, setArticleOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);

  const hasRunningScan = scansData?.items.some((s) => isActiveRun(s.status, s.startedAt));
  const hasRunningPipeline = pipelineRuns?.items?.some((p) =>
    isActiveRun(p.status, p.created_at),
  );

  const generatedTotal = posts?.total ?? 0;
  const publishedTotal = publishedPosts?.total ?? 0;
  const successRate =
    generatedTotal > 0 ? Math.round((publishedTotal / generatedTotal) * 100) : 0;

  const avgQuality = useMemo(() => {
    const scored = (posts?.items ?? []).filter((p) => p.reviewScore != null);
    if (scored.length === 0) return null;
    const sum = scored.reduce((acc, p) => acc + (p.reviewScore ?? 0), 0);
    return (sum / scored.length).toFixed(1);
  }, [posts?.items]);

  // Generated vs published, bucketed into the trailing 7 days.
  const productionSeries = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => startOfDay(subDays(new Date(), 6 - i)));
    return days.map((day) => ({
      label: format(day, "EEE"),
      generated: (posts?.items ?? []).filter((p) => isSameDay(new Date(p.createdAt), day)).length,
      published: (publishedPosts?.items ?? []).filter(
        (p) => p.publishedAt && isSameDay(new Date(p.publishedAt), day),
      ).length,
    }));
  }, [posts?.items, publishedPosts?.items]);

  const funnelRows = useMemo(
    () => [
      { label: "Trends Identified", count: trends?.total ?? 0 },
      { label: "Generated Posts", count: generatedTotal },
      { label: "Approved", count: approved?.total ?? 0 },
      { label: "Published", count: publishedTotal },
    ],
    [trends?.total, generatedTotal, approved?.total, publishedTotal],
  );

  const sentimentCounts = useMemo(() => {
    const counts = { ...EMPTY_SENTIMENT };
    for (const t of trends?.items ?? []) {
      if (t.sentiment) counts[t.sentiment] += 1;
    }
    return counts;
  }, [trends?.items]);

  const kpisLoading = postsLoading || publishLoading;

  return (
    <div className="space-y-6">
      {/* Action toolbar */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="outline" size="sm" onClick={() => setArticleOpen(true)}>
          <Link2 className="mr-2 h-4 w-4" />
          From URL
        </Button>
        <Button variant="outline" size="sm" onClick={() => setScanOpen(true)} disabled={hasRunningScan}>
          Custom Scan
        </Button>
        <Button
          size="sm"
          onClick={() => setPipelineOpen(true)}
          disabled={hasRunningScan || hasRunningPipeline}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Start Pipeline
        </Button>
      </div>

      <ArticleUrlModal open={articleOpen} onOpenChange={setArticleOpen} />
      <StartScanModal open={scanOpen} onOpenChange={setScanOpen} />
      <StartPipelineModal open={pipelineOpen} onOpenChange={setPipelineOpen} />

      {/* Live pipeline trackers — stay visible until dismissed or clean success */}
      {activePipelineId && <OverallPipelineProgress pipelineId={activePipelineId} />}
      {activeScanId && !activePipelineId && <ScanPipelineProgress scanId={activeScanId} />}
      {activePublishId && <PublishPipelineProgress publishId={activePublishId} />}

      {/* KPI Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatTile label="Posts Generated" value={generatedTotal.toLocaleString("en-US")} />
            <StatTile label="Posts Published" value={publishedTotal.toLocaleString("en-US")} />
            <StatTile label="Success Rate" value={`${successRate}%`} />
            <StatTile label="Avg Quality Score" value={avgQuality ? `${avgQuality}/10` : "—"} />
          </>
        )}
      </div>

      {/* Charts: production over time + pipeline funnel */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ProductionChart data={productionSeries} />
        </div>
        <div className="lg:col-span-2">
          <PipelineFunnel rows={funnelRows} />
        </div>
      </div>

      {/* Tables: recent posts + trending topics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentPostsTable posts={posts?.items?.slice(0, 5) ?? []} isLoading={postsLoading} />
        <TrendingTopicsTable trends={topTrends?.slice(0, 5) ?? []} isLoading={topTrendsLoading} />
      </div>

      {/* Footer widgets: sentiment + engagement windows */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {trendsLoading ? (
            <Skeleton className="h-80" />
          ) : (
            <TrendSentiment counts={sentimentCounts} />
          )}
        </div>
        <div className="lg:col-span-2">
          <EngagementWindows slots={timeSlots?.items ?? []} />
        </div>
      </div>
    </div>
  );
}
