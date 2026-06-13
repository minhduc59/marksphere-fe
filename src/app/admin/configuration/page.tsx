"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePipelineConfig,
  useUpdatePipelineConfig,
} from "@/hooks/api/use-pipeline-config";
import {
  ModerationCard,
  PublishingCard,
  ScanningCard,
  HackerNewsApiCard,
  DEFAULT_CONFIG,
  configToState,
  stateToUpdate,
  type ConfigState,
} from "@/components/admin/configuration";

export default function PlatformConfigurationPage() {
  const { data, isLoading, isError } = usePipelineConfig();
  const update = useUpdatePipelineConfig();

  // Server config mapped to the editable shape — the baseline for Discard / dirty.
  const serverState = useMemo<ConfigState | null>(
    () => (data ? configToState(data) : null),
    [data]
  );

  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);

  // Re-seed local state whenever the server config changes (load / after save).
  useEffect(() => {
    if (serverState) setConfig(serverState);
  }, [serverState]);

  function patch<K extends keyof ConfigState>(key: K, value: ConfigState[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  const isDirty =
    serverState !== null &&
    JSON.stringify(config) !== JSON.stringify(serverState);

  function handleSave() {
    update.mutate(stateToUpdate(config));
  }

  function handleDiscard() {
    if (serverState) {
      setConfig(serverState);
      toast.info("Changes discarded.");
    }
  }

  return (
    <div className="space-y-10">
      {/* Page intro */}
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
          System Configuration
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage automated moderation, publishing schedules, and external API
          integrations.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-12 gap-6">
          <Skeleton className="col-span-12 h-72 md:col-span-7" />
          <Skeleton className="col-span-12 h-72 md:col-span-5" />
          <Skeleton className="col-span-12 h-72 md:col-span-8" />
          <Skeleton className="col-span-12 h-72 md:col-span-4" />
        </div>
      ) : isError ? (
        <p className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          Failed to load configuration. Please refresh and try again.
        </p>
      ) : (
        <>
          {/* Bento grid */}
          <div className="grid grid-cols-12 gap-6">
            <ModerationCard
              score={config.autoApproveScore}
              onScoreChange={(v) => patch("autoApproveScore", v)}
            />
            <PublishingCard
              autoPublish={config.autoPublish}
              onAutoPublishChange={(v) => patch("autoPublish", v)}
              deliveryMode={config.deliveryMode}
              onDeliveryModeChange={(v) => patch("deliveryMode", v)}
            />
            <ScanningCard
              cronExpression={config.cronExpression}
              onCronChange={(v) => patch("cronExpression", v)}
            />
            <HackerNewsApiCard
              rateLimitReqMin={config.rateLimitReqMin}
              onRateLimitChange={(v) => patch("rateLimitReqMin", v)}
              retryStrategy={config.retryStrategy}
              onRetryStrategyChange={(v) => patch("retryStrategy", v)}
            />
          </div>

          {/* Global actions */}
          <div>
            <Separator />
            <div className="flex items-center justify-end gap-6 pt-8">
              <span className="text-xs text-muted-foreground">
                {isDirty ? "You have unsaved changes." : "All changes saved."}
              </span>
              <Button
                variant="outline"
                className="rounded-none px-8 uppercase tracking-widest"
                onClick={handleDiscard}
                disabled={!isDirty || update.isPending}
              >
                Discard Changes
              </Button>
              <Button
                className="rounded-none px-8 uppercase tracking-widest"
                onClick={handleSave}
                disabled={!isDirty || update.isPending}
              >
                {update.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
