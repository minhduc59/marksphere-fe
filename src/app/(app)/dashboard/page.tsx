"use client";

import { useState } from "react";
import { Radar, FileText, Send, Link2, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentStatusBadge } from "@/components/ui/content-status-badge";
import { ArticleUrlModal } from "@/components/dashboard/article-url-modal";
import { StartScanModal } from "@/components/dashboard/start-scan-modal";
import { ScanPipelineProgress } from "@/components/pipeline/scan-pipeline-progress";
import { useScans } from "@/hooks/api/use-scans";
import { usePosts } from "@/hooks/api/use-posts";
import { useTopTrends } from "@/hooks/api/use-trends";
import { usePublishHistory } from "@/hooks/api/use-publish";
import { usePipelineStore } from "@/stores/pipeline-store";
import { ScanStatus, ContentStatus } from "@/lib/api/types";

export default function DashboardPage() {
  const { data: trends,        isLoading: trendsLoading   } = useTopTrends("7d");
  const { data: posts,         isLoading: postsLoading    } = usePosts({ pageSize: 1 });
  const { data: published,     isLoading: publishLoading  } = usePublishHistory({ status: "published", pageSize: 1 });
  const { data: pendingReview, isLoading: reviewLoading   } = usePosts({ status: ContentStatus.DRAFT, pageSize: 1 });
  const { data: scansData,     isLoading: scansLoading    } = useScans({ pageSize: 5 });
  const { data: upcoming  } = usePublishHistory({ status: "pending", pageSize: 5 });
  const { data: recentPosts } = usePosts({ pageSize: 5 });

  const activeScanId = usePipelineStore((s) => s.activeScanId);
  const [articleOpen, setArticleOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const hasRunningScan = scansData?.items.some(
    (s) => s.status === ScanStatus.RUNNING || s.status === ScanStatus.PENDING
  );

  const isLoading = trendsLoading || postsLoading || publishLoading || reviewLoading || scansLoading;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setArticleOpen(true)}>
            <Link2 className="mr-2 h-4 w-4" />
            From Article URL
          </Button>
          <Button onClick={() => setScanOpen(true)} disabled={hasRunningScan}>
            Start New Scan
          </Button>
        </div>
      </div>

      <ArticleUrlModal open={articleOpen} onOpenChange={setArticleOpen} />
      <StartScanModal open={scanOpen} onOpenChange={setScanOpen} />

      {/* Live pipeline step tracker — stays visible until user dismisses or clean success */}
      {activeScanId && (
        <ScanPipelineProgress scanId={activeScanId} />
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))
        ) : (
          <>
            <KPICard
              icon={Radar}
              label="Trending Topics"
              value={trends?.length ?? 0}
            />
            <KPICard
              icon={FileText}
              label="Content Created"
              value={posts?.total ?? 0}
            />
            <KPICard
              icon={Send}
              label="Posts Published"
              value={published?.total ?? 0}
            />
            <Link href="/pipeline" className="block">
              <KPICard
                icon={ClipboardCheck}
                label="Pending Review"
                value={pendingReview?.total ?? 0}
              />
            </Link>
          </>
        )}
      </div>

      {/* Content grid — Recent Content (2/3) + Upcoming Posts (1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Content — spans 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Content</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/content">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPosts?.items?.length ? (
              <div className="space-y-1">
                {recentPosts.items.map((post) => (
                  <Link
                    key={post.id}
                    href={`/content/${post.id}`}
                    className="flex items-center justify-between rounded-md border-b pb-3 last:border-0 hover:bg-accent/50 -mx-2 px-2 py-2 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate text-sm font-medium">
                        {post.trendTitle}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {post.caption.slice(0, 90)}…
                      </p>
                    </div>
                    <ContentStatusBadge status={post.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No content created yet. Start a scan to generate content.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Posts — 1 column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Upcoming Posts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pipeline">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcoming?.items?.length ? (
              <div className="space-y-3">
                {upcoming.items.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start justify-between border-b pb-3 last:border-0 gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium capitalize">
                        {post.platform}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.scheduledAt
                          ? format(new Date(post.scheduledAt), "MMM d, HH:mm")
                          : "Pending schedule"}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                      post.status === "published"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No posts scheduled yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
