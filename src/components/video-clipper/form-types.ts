// Shared form value type for the Create-clip page so the CustomizationPanel
// and LivePreview siblings can read from a single FormProvider context.

import type {
  AspectRatio,
  CaptionPosition,
  CaptionStylePreset,
  ReframeMode,
} from "@/lib/api/video";

export interface CreateClipFormValues {
  // Source
  sourceType: "url" | "upload";
  urlInput: string;
  maxClips: number;
  fontId: string;
  captionTemplateId: string;

  // Customization
  captionStyle: CaptionStylePreset;
  aspectRatio: AspectRatio;
  cropX: number;
  cropY: number;
  reframeMode: ReframeMode;
  addSubtitles: boolean;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  captionPosition: CaptionPosition;
  startTimeSeconds: number;
  endTimeSeconds: number;
}

export const DEFAULT_FORM_VALUES: CreateClipFormValues = {
  sourceType: "url",
  urlInput: "",
  maxClips: 5,
  fontId: "",
  captionTemplateId: "",
  captionStyle: "default",
  aspectRatio: "9:16",
  cropX: 0.5,
  cropY: 0.5,
  reframeMode: "static",
  addSubtitles: true,
  fontFamily: "Inter",
  fontSize: 40,
  fontColor: "#FFFFFF",
  captionPosition: "bottom",
  startTimeSeconds: 0,
  endTimeSeconds: 0,
};
