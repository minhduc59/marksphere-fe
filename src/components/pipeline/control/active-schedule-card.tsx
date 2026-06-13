"use client";

import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { usePipelineSchedule } from "@/hooks/api/use-pipeline-schedule";
import { usePipelineConfig } from "@/hooks/api/use-pipeline-config";
import { describeCron } from "@/lib/pipeline/cron";

/** Read-only summary of the user's recurring scan schedule + auto-publish mode. */
export function ActiveScheduleCard() {
  const { data: schedule, isLoading } = usePipelineSchedule();
  const { data: config } = usePipelineConfig();
  const autoPublish = config?.auto_publish ?? false;

  const nextRun = schedule?.next_run_at ? new Date(schedule.next_run_at) : null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Active schedule</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !schedule ? (
          <p className="text-sm text-muted-foreground">
            No recurring scan is scheduled.
          </p>
        ) : (
          <div className="flex-1 space-y-5">
            <div>
              <p className="text-xs text-muted-foreground">Frequency</p>
              <p className="text-lg font-semibold">
                {describeCron(schedule.cron_expression)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next run</p>
              <p className="text-sm font-medium">
                {nextRun
                  ? `${format(nextRun, "MMM d, HH:mm")} (${formatDistanceToNowStrict(
                      nextRun,
                      { addSuffix: true }
                    )})`
                  : "—"}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Auto-publish</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Read only
                </span>
              </div>
              <Switch checked={autoPublish} disabled aria-readonly />
            </div>
          </div>
        )}

        <div className="mt-6 border-t pt-4">
          <Link
            href="/settings/pipeline"
            className="flex items-center justify-between text-sm font-medium hover:underline"
          >
            Edit in Settings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
