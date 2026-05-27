"use client";

import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { COLOR_SWATCHES, FONT_CATALOG } from "@/lib/fonts";

import type { CreateClipFormValues } from "./form-types";

export function CustomizationPanel() {
  const { control, register, watch, setValue } = useFormContext<CreateClipFormValues>();
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [fontQuery, setFontQuery] = useState("");

  const fontFamily = watch("fontFamily");
  const fontSize = watch("fontSize");
  const fontColor = watch("fontColor");
  const captionPosition = watch("captionPosition");
  const aspectRatio = watch("aspectRatio");
  const reframeMode = watch("reframeMode");
  const filteredFonts = FONT_CATALOG.filter((f) =>
    f.label.toLowerCase().includes(fontQuery.toLowerCase())
  );

  // Smart reframe is only meaningful for 9:16 output — auto-reset when the
  // user picks a non-vertical aspect ratio so a stale "smart" selection
  // doesn't silently get ignored by the AI service.
  useEffect(() => {
    if (aspectRatio !== "9:16" && reframeMode !== "static") {
      setValue("reframeMode", "static", { shouldDirty: true });
    }
  }, [aspectRatio, reframeMode, setValue]);

  return (
    <div className="space-y-4">
      {/* 2.1 Style & Captions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Style & Captions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="captionStyle">Caption Style</Label>
            <Controller
              control={control}
              name="captionStyle"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="captionStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Aspect Ratio</Label>
            <div className="flex gap-1.5">
              {(["9:16", "16:9", "4:3"] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setValue("aspectRatio", ratio, { shouldDirty: true })}
                  className={cn(
                    "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                    aspectRatio === ratio
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {ratio}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {aspectRatio === "9:16" && "Vertical · TikTok / Reels"}
              {aspectRatio === "16:9" && "Landscape · YouTube / Desktop"}
              {aspectRatio === "4:3" && "Classic · Traditional TV"}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Reframe</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px]">
                    Smart reframe tracks the subject across the clip using
                    object detection. Static uses a fixed centred crop.
                    Available for 9:16 output only.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-1.5">
              {(["static", "smart"] as const).map((mode) => {
                const disabled = mode === "smart" && aspectRatio !== "9:16";
                return (
                  <button
                    key={mode}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setValue("reframeMode", mode, { shouldDirty: true })
                    }
                    className={cn(
                      "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium capitalize transition-colors",
                      reframeMode === mode
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:bg-muted",
                      disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
                    )}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {reframeMode === "smart"
                ? "Subject-tracking crop · slower, better framing"
                : "Fixed centred crop · fast and predictable"}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="addSubtitles">Add Subtitles</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px]">
                    Burning subtitles re-encodes the clip and roughly doubles
                    processing time.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Controller
              control={control}
              name="addSubtitles"
              render={({ field }) => (
                <Switch
                  id="addSubtitles"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2.2 Font Customization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Font Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Font Family</Label>
            <Popover open={fontPickerOpen} onOpenChange={setFontPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                >
                  {fontFamily}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-0" align="start">
                <div className="p-2">
                  <Input
                    autoFocus
                    placeholder="Search fonts…"
                    value={fontQuery}
                    onChange={(e) => setFontQuery(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto pb-2">
                  {filteredFonts.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      No fonts match.
                    </p>
                  ) : (
                    filteredFonts.map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-1.5 text-sm hover:bg-muted",
                          fontFamily === f.key && "bg-muted"
                        )}
                        onClick={() => {
                          setValue("fontFamily", f.key, { shouldDirty: true });
                          setFontPickerOpen(false);
                          setFontQuery("");
                        }}
                        style={{ fontFamily: f.cssFamily }}
                      >
                        {f.label}
                        {fontFamily === f.key && <Check className="h-4 w-4" />}
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fontSize">Font Size: {fontSize}px</Label>
            <input
              id="fontSize"
              type="range"
              min={12}
              max={96}
              step={1}
              className="w-full accent-foreground"
              {...register("fontSize", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fontColor">Font Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fontColor"
                type="text"
                className="w-28 font-mono uppercase"
                {...register("fontColor")}
              />
              <div className="flex flex-wrap gap-1.5">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() =>
                      setValue("fontColor", swatch, { shouldDirty: true })
                    }
                    aria-label={`Pick ${swatch}`}
                    className={cn(
                      "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                      fontColor.toUpperCase() === swatch
                        ? "border-foreground"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: swatch }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Position</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["top", "center", "bottom"] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() =>
                    setValue("captionPosition", pos, { shouldDirty: true })
                  }
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    captionPosition === pos
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
