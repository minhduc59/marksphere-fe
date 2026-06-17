"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Scissors, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomizationPanel } from "@/components/video-clipper/customization-panel";
import { LivePreview } from "@/components/video-clipper/live-preview";
import { TaskProgress } from "@/components/video-clipper/task-progress";
import {
  DEFAULT_FORM_VALUES,
  type CreateClipFormValues,
} from "@/components/video-clipper/form-types";
import {
  createVideoTask,
  triggerVideoPipeline,
  uploadMedia,
  listFonts,
  listCaptionTemplates,
  type Font,
  type CaptionTemplate,
} from "@/lib/api/video";

export default function VideoClipperPage() {
  const form = useForm<CreateClipFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { register, watch, setValue, handleSubmit } = form;

  const [fileName, setFileName] = useState<string | null>(null);
  const [fonts, setFonts] = useState<Font[]>([]);
  const [templates, setTemplates] = useState<CaptionTemplate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Media preview state
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "image" | null>(null);
  const [, setVideoDuration] = useState(0);

  const fileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); };
  }, []);

  const maxClips = watch("maxClips");

  useEffect(() => {
    listFonts()
      .then(setFonts)
      .catch(() => { });
    listCaptionTemplates()
      .then(setTemplates)
      .catch(() => { });
  }, []);

  const clearMedia = () => {
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    setMediaSrc(null);
    setMediaType(null);
    setVideoDuration(0);
    setValue("startTimeSeconds", 0, { shouldDirty: false });
    setValue("endTimeSeconds", 0, { shouldDirty: false });
  };

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum allowed size is 100 MB.");
      e.target.value = "";
      return;
    }
    fileRef.current = file;
    setFileName(file?.name ?? null);
    if (file) {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      setMediaSrc(url);
      setMediaType("video");
    } else {
      clearMedia();
    }
  };

  const onSubmit = async (values: CreateClipFormValues) => {
    if (!fileRef.current) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", fileRef.current);
      const uploaded = await uploadMedia(formData);

      const task = await createVideoTask({
        sourceType: "upload",
        sourceRef: uploaded.url,
        fontId: values.fontId || undefined,
        captionTemplateId: values.captionTemplateId || undefined,
        maxClips: values.maxClips,
        captionStyle: values.captionStyle,
        aspectRatio: values.aspectRatio,
        cropX: values.cropX,
        cropY: values.cropY,
        reframeMode: values.reframeMode,
        addSubtitles: values.addSubtitles,
        fontFamily: values.fontFamily,
        fontSize: values.fontSize,
        fontColor: values.fontColor,
        captionPosition: values.captionPosition,
        startTimeSeconds: values.startTimeSeconds || undefined,
        endTimeSeconds: values.endTimeSeconds || undefined,
      });

      await triggerVideoPipeline(task.id);
      setActiveTaskId(task.id);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create video task"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewClip = () => {
    setActiveTaskId(null);
    form.reset(DEFAULT_FORM_VALUES);
    setFileName(null);
    fileRef.current = null;
    clearMedia();
  };

  // ── Processing view ────────────────────────────────────────────────────────
  if (activeTaskId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Scissors className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Video Clipper</h1>
            <p className="text-sm text-muted-foreground">
              Turn long-form video into viral short clips for TikTok.
            </p>
          </div>
        </div>
        <TaskProgress taskId={activeTaskId} onNewClip={handleNewClip} />
      </div>
    );
  }

  // ── Create form ────────────────────────────────────────────────────────────
  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Scissors className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Video Clipper</h1>
            <p className="text-sm text-muted-foreground">
              Turn long-form video into viral short clips for TikTok.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left column: form */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div
                  className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-foreground/40"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="video/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                  <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  {fileName ? (
                    <p className="text-sm font-medium">{fileName}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Click to upload video</p>
                      <p className="text-xs text-muted-foreground">
                        MP4, MOV, WebM up to 100 MB
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxClips">Max Clips: {maxClips}</Label>
                  <input
                    id="maxClips"
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    disabled={isSubmitting}
                    className="w-full accent-foreground"
                    {...register("maxClips", { valueAsNumber: true })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                {fonts.length > 0 && (
                  <div className="space-y-1">
                    <Label>Brand Font (optional)</Label>
                    <Select
                      value={watch("fontId")}
                      onValueChange={(v) => setValue("fontId", v)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Default font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Default font</SelectItem>
                        {fonts.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {templates.length > 0 && (
                  <div className="space-y-1">
                    <Label>Caption Template (optional)</Label>
                    <Select
                      value={watch("captionTemplateId")}
                      onValueChange={(v) => setValue("captionTemplateId", v)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Default template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Default template</SelectItem>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <CustomizationPanel />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !fileRef.current}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting…
                </>
              ) : (
                "Process Video"
              )}
            </Button>
          </div>

          {/* Right column: sticky live preview */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <LivePreview
              mediaSrc={mediaSrc}
              mediaType={mediaType}
              onDurationChange={setVideoDuration}
            />
          </aside>
        </form>
      </div>
    </FormProvider>
  );
}
