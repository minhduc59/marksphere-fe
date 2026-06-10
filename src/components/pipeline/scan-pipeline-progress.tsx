"use client";

import { useEffect } from "react";
import { PipelineProgress } from "@/components/pipeline/pipeline-progress";
import { useScanProgress } from "@/hooks/use-scan-progress";
import { usePipelineStore } from "@/stores/pipeline-store";

interface Props {
  scanId: string;
}

export function ScanPipelineProgress({ scanId }: Props) {
  const { view } = useScanProgress(scanId);
  const setActiveScan = usePipelineStore((s) => s.setActiveScan);

  // Auto-dismiss a few seconds after a clean finish. Failed/partial runs stay
  // up so the user can read the message and dismiss manually.
  useEffect(() => {
    if (view.state === "done") {
      const t = setTimeout(() => setActiveScan(null), 4000);
      return () => clearTimeout(t);
    }
  }, [view.state, setActiveScan]);

  return <PipelineProgress view={view} onDismiss={() => setActiveScan(null)} />;
}
