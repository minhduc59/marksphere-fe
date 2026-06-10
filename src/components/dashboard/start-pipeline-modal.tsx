"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Globe,
  Loader2,
  Send,
  Settings,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTriggerPipelineRun } from "@/hooks/api/use-pipeline-runs";
import { usePipelineConfig } from "@/hooks/api/use-pipeline-config";
import { useSettingsStore } from "@/stores/settings-store";
import { usePipelineStore } from "@/stores/pipeline-store";
import { PostFormat } from "@/lib/api/types";

const FORMAT_LABELS: Partial<Record<PostFormat, string>> = {
  [PostFormat.QUICK_TIPS]: "Quick Tips",
  [PostFormat.HOT_TAKE]: "Hot Take",
  [PostFormat.TRENDING_BREAKDOWN]: "Trending",
  [PostFormat.DID_YOU_KNOW]: "Did You Know",
  [PostFormat.TUTORIAL_HACK]: "Tutorial",
  [PostFormat.MYTH_BUSTERS]: "Myth Busters",
  [PostFormat.BEHIND_THE_TECH]: "Behind the Tech",
};

const PUBLISH_MODE_LABEL: Record<string, string> = {
  auto: "Golden-hour slot",
  manual: "Manual approval",
  schedule: "Scheduled time",
};

interface StartPipelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartPipelineModal({
  open,
  onOpenChange,
}: StartPipelineModalProps) {
  const triggerPipeline = useTriggerPipelineRun();
  const keywords = useSettingsStore((s) => s.keywords);
  const setActivePipeline = usePipelineStore((s) => s.setActivePipeline);
  const setActiveScan = usePipelineStore((s) => s.setActiveScan);
  const setActivePublish = usePipelineStore((s) => s.setActivePublish);
  const { data: config } = usePipelineConfig();

  // Resolve display values from pipeline config (with safe fallbacks).
  const maxItems = config?.max_items_per_platform ?? 30;
  const qualityThreshold = config?.quality_threshold ?? 5;
  const numPosts = config?.num_posts ?? 3;
  const formats = (config?.allowed_formats as PostFormat[] | null | undefined) ?? [];
  const autoPublish = config?.auto_publish ?? false;
  const publishMode = config?.publish_mode ?? "auto";
  const requireReview = config?.require_review ?? true;

  async function handleStart() {
    // Don't start until the saved pipeline configuration is loaded, so the
    // run always references the user's settings rather than fallback defaults.
    if (!config) return;
    const data = await triggerPipeline.mutateAsync({
      platforms: ["hackernews"],
      options: {
        max_items_per_platform: maxItems,
        include_comments: config?.include_comments ?? true,
        quality_threshold: qualityThreshold,
        generate_posts: true,
        ...(keywords.length > 0 ? { keywords } : {}),
        post_gen_options: {
          num_posts: numPosts,
          formats: formats.length === 0 ? null : formats,
        },
      },
    });
    const id = (data as { pipeline_id?: string }).pipeline_id;
    if (id) {
      // The unified pipeline banner owns the UI for this run. Clear any leftover
      // scan/publish banner from a prior run so it can't shadow it (and keep
      // polling the scan-only /scans/{id}/status endpoint).
      setActiveScan(null);
      setActivePublish(null);
      setActivePipeline(id);
    }
    onOpenChange(false);
  }

  const pending = triggerPipeline.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Start full pipeline
          </DialogTitle>
          <DialogDescription>
            Runs all three stages automatically using your{" "}
            <Link
              href="/settings/pipeline"
              className="underline underline-offset-2 hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              pipeline settings
            </Link>
            .
          </DialogDescription>
        </DialogHeader>

        {/* Pipeline stages summary */}
        <div className="space-y-3 py-1">
          {/* Stage 1 — Scan */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Globe className="h-3.5 w-3.5" />
              </div>
              <div className="mt-1 h-full w-px bg-border" />
            </div>
            <div className="pb-4 pt-0.5">
              <p className="text-sm font-semibold">Scan HackerNews</p>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                <li>Up to <span className="font-medium text-foreground">{maxItems}</span> stories</li>
                <li>
                  Quality threshold{" "}
                  <span className="font-medium text-foreground">{qualityThreshold}/10</span>
                </li>
                {keywords.length > 0 && (
                  <li>
                    Keywords:{" "}
                    <span className="font-medium text-foreground">
                      {keywords.slice(0, 3).join(", ")}
                      {keywords.length > 3 ? ` +${keywords.length - 3}` : ""}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Stage 2 — Generate */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div className="mt-1 h-full w-px bg-border" />
            </div>
            <div className="pb-4 pt-0.5">
              <p className="text-sm font-semibold">Generate TikTok posts</p>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">{numPosts}</span>{" "}
                  post{numPosts !== 1 ? "s" : ""} with images &amp; AI review
                </li>
                {formats.length > 0 ? (
                  <li>
                    Formats:{" "}
                    <span className="font-medium text-foreground">
                      {formats
                        .slice(0, 3)
                        .map((f) => FORMAT_LABELS[f] ?? f)
                        .join(", ")}
                      {formats.length > 3 ? ` +${formats.length - 3}` : ""}
                    </span>
                  </li>
                ) : (
                  <li>All formats allowed</li>
                )}
                {requireReview && (
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-teal-500" />
                    Manual review before publish
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Stage 3 — Publish */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <Send className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="pt-0.5">
              <p className="text-sm font-semibold">
                {autoPublish ? "Auto-publish to TikTok" : "Ready to publish"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {autoPublish
                  ? `${PUBLISH_MODE_LABEL[publishMode] ?? publishMode} — posts go live automatically`
                  : "Posts will await your approval in the pipeline"}
              </p>
            </div>
          </div>
        </div>

        {/* Settings shortcut */}
        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Want different settings?
          </span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            asChild
            onClick={() => onOpenChange(false)}
          >
            <Link href="/settings/pipeline" className="flex items-center gap-0.5">
              Pipeline settings
              <ChevronRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={pending || !config}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting…
              </>
            ) : !config ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading settings…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start pipeline
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
