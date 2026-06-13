"use client";

import { CheckCircle, Zap, MousePointerClick } from "lucide-react";
import { SectionPanel } from "@/components/admin";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SettingRow } from "./setting-row";

type DeliveryMode = "golden-hour" | "manual";

interface PublishingCardProps {
  autoPublish: boolean;
  onAutoPublishChange: (v: boolean) => void;
  deliveryMode: DeliveryMode;
  onDeliveryModeChange: (v: DeliveryMode) => void;
}

const DELIVERY_MODES: { value: DeliveryMode; label: string }[] = [
  { value: "golden-hour", label: "Golden-hour (Optimized)" },
  { value: "manual", label: "Manual Release" },
];

export function PublishingCard({
  autoPublish,
  onAutoPublishChange,
  deliveryMode,
  onDeliveryModeChange,
}: PublishingCardProps) {
  return (
    <SectionPanel
      className="col-span-12 md:col-span-5"
      title=""
      bodyPadding={false}
    >
      <div className="flex flex-col gap-6 p-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-foreground" />
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">
            Publishing
          </h3>
        </div>

        {/* Auto-publish toggle */}
        <SettingRow
          label="Auto-publish"
          description="Instantly push to production"
        >
          <Switch
            checked={autoPublish}
            onCheckedChange={onAutoPublishChange}
            aria-label="Auto-publish"
          />
        </SettingRow>

        {/* Delivery mode selector */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
            Delivery Mode
          </p>
          <div className="flex flex-col gap-2">
            {DELIVERY_MODES.map((mode) => {
              const isSelected = deliveryMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => onDeliveryModeChange(mode.value)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 text-left transition-colors",
                    isSelected
                      ? "border-2 border-foreground font-semibold"
                      : "border border-border text-muted-foreground hover:border-foreground"
                  )}
                >
                  <span className="text-sm font-display">{mode.label}</span>
                  {isSelected ? (
                    <CheckCircle className="h-4 w-4 text-foreground" />
                  ) : (
                    <MousePointerClick className="h-4 w-4 opacity-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
