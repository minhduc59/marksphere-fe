"use client";

import { useState } from "react";
import { PenSquare, Search, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { StartScanModal } from "@/components/dashboard/start-scan-modal";
import { StartPipelineModal } from "@/components/dashboard/start-pipeline-modal";
import { GeneratePostsModal } from "@/components/pipeline/generate-posts-modal";

interface Props {
  /** Disable scan/pipeline starts while a run is already active. */
  scanDisabled?: boolean;
  pipelineDisabled?: boolean;
}

/** The three primary actions of the Pipeline Control Center. */
export function PipelineActionCards({ scanDisabled, pipelineDisabled }: Props) {
  const [scanOpen, setScanOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          icon={Search}
          title="Start Scan"
          subtitle="Find new trends from HackerNews"
          disabled={scanDisabled}
          onClick={() => setScanOpen(true)}
        />
        <ActionCard
          icon={Sparkles}
          title="Start Full Pipeline"
          subtitle="Scan → generate → review"
          primary
          disabled={pipelineDisabled}
          onClick={() => setPipelineOpen(true)}
        />
        <ActionCard
          icon={PenSquare}
          title="Generate Posts"
          subtitle="From existing trends"
          onClick={() => setGenerateOpen(true)}
        />
      </div>

      <StartScanModal open={scanOpen} onOpenChange={setScanOpen} />
      <StartPipelineModal open={pipelineOpen} onOpenChange={setPipelineOpen} />
      <GeneratePostsModal open={generateOpen} onOpenChange={setGenerateOpen} />
    </>
  );
}

function ActionCard({
  icon: Icon,
  title,
  subtitle,
  primary,
  disabled,
  onClick,
}: {
  icon: typeof Search;
  title: string;
  subtitle: string;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group rounded-xl border p-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        primary
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-card hover:border-primary"
      )}
    >
      <Icon className="mb-4 h-5 w-5" />
      <h3 className="text-base font-semibold">{title}</h3>
      <p
        className={cn(
          "mt-1 text-sm",
          primary ? "text-primary-foreground/80" : "text-muted-foreground"
        )}
      >
        {subtitle}
      </p>
    </button>
  );
}
