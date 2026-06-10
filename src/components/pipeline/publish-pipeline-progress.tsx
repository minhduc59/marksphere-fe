"use client";

import { useEffect } from "react";
import { PipelineProgress } from "@/components/pipeline/pipeline-progress";
import { usePublishProgress } from "@/hooks/use-publish-progress";
import { usePipelineStore } from "@/stores/pipeline-store";

interface Props {
  publishId: string;
}

export function PublishPipelineProgress({ publishId }: Props) {
  const { view } = usePublishProgress(publishId);
  const setActivePublish = usePipelineStore((s) => s.setActivePublish);

  useEffect(() => {
    if (view.state === "done") {
      const t = setTimeout(() => setActivePublish(null), 4000);
      return () => clearTimeout(t);
    }
  }, [view.state, setActivePublish]);

  return <PipelineProgress view={view} onDismiss={() => setActivePublish(null)} />;
}
