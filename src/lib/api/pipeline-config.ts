import apiClient from "./client";
import type { PipelineConfig, PipelineConfigUpdate } from "./types";

export async function getPipelineConfig(): Promise<PipelineConfig> {
  const { data } = await apiClient.get("/pipeline/config");
  return data;
}

export async function createPipelineConfig(
  dto: PipelineConfigUpdate
): Promise<PipelineConfig> {
  const { data } = await apiClient.post("/pipeline/config", dto);
  return data;
}

export async function patchPipelineConfig(
  dto: PipelineConfigUpdate
): Promise<PipelineConfig> {
  const { data } = await apiClient.patch("/pipeline/config", dto);
  return data;
}
