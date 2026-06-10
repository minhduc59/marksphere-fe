import { create } from "zustand";

export type PipelineStatus = "idle" | "running" | "review" | "error";

interface PipelineState {
  status: PipelineStatus;
  currentAgent: string | null;
  activeScanId: string | null;
  activePublishId: string | null;
  activePipelineId: string | null;
  setStatus: (status: PipelineStatus, agent?: string) => void;
  setActiveScan: (id: string | null) => void;
  setActivePublish: (id: string | null) => void;
  setActivePipeline: (id: string | null) => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  status: "idle",
  currentAgent: null,
  activeScanId: null,
  activePublishId: null,
  activePipelineId: null,

  setStatus: (status, agent) =>
    set({ status, currentAgent: agent ?? null }),

  setActiveScan: (id) => set({ activeScanId: id }),

  setActivePublish: (id) => set({ activePublishId: id }),

  setActivePipeline: (id) => set({ activePipelineId: id }),
}));
