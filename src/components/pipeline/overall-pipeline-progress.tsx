"use client";

import { useEffect } from "react";
import { PipelineProgress } from "@/components/pipeline/pipeline-progress";
import { usePipelineProgress } from "@/hooks/use-pipeline-progress";
import { usePipelineStore } from "@/stores/pipeline-store";

interface Props {
  pipelineId: string;
}

export function OverallPipelineProgress({ pipelineId }: Props) {
  const { view } = usePipelineProgress(pipelineId);
  const setActivePipeline = usePipelineStore((s) => s.setActivePipeline);

  // Auto-dismiss a few seconds after a clean finish. Failed/partial runs stay
  // up so the user can read the message and dismiss manually.
  useEffect(() => {
    if (view.state === "done") {
      const t = setTimeout(() => setActivePipeline(null), 4000);
      return () => clearTimeout(t);
    }
  }, [view.state, setActivePipeline]);

  return (
    <PipelineProgress view={view} onDismiss={() => setActivePipeline(null)} />
  );
}
