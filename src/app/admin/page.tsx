"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOverview } from "@/hooks/api/use-admin-overview";
import {
  KpiTiles,
  TrendScanChart,
  ContentPipelineFunnel,
  OutputEfficiencyChart,
  SystemHealthStrip,
} from "@/components/admin/overview";

export default function AdminOverviewPage() {
  const { data, isLoading, isError, refetch } = useAdminOverview();

  if (isLoading) return <OverviewSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Failed to load admin overview.
        </p>
        <button
          onClick={() => refetch()}
          className="border border-border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-muted"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section 1: KPI tiles */}
      <KpiTiles kpis={data.kpis} />

      {/* Section 2: Charts grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <TrendScanChart data={data.trendScanVolume} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ContentPipelineFunnel data={data.contentPipeline} />
        </div>
        <div className="col-span-12">
          <OutputEfficiencyChart data={data.outputEfficiency} />
        </div>
      </div>

      {/* Section 3: System health strip */}
      <SystemHealthStrip
        internal={data.systemHealth.internal}
        external={data.systemHealth.external}
      />
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-12 gap-6">
        <Skeleton className="col-span-12 h-[264px] lg:col-span-8" />
        <Skeleton className="col-span-12 h-[264px] lg:col-span-4" />
        <Skeleton className="col-span-12 h-[264px]" />
      </div>
      <Skeleton className="h-16" />
    </div>
  );
}
