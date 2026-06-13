import { cn } from "@/lib/utils";

interface SectionPanelProps {
  title?: string;
  /** Right-aligned controls in the panel header (filters, legends, actions). */
  action?: React.ReactNode;
  className?: string;
  /** Padding is applied to the body; set `false` for flush content like tables. */
  bodyPadding?: boolean;
  children: React.ReactNode;
}

/** Flat, bordered panel with an optional titled header — the shared layout primitive. */
export function SectionPanel({
  title,
  action,
  className,
  bodyPadding = true,
  children,
}: SectionPanelProps) {
  return (
    <section className={cn("border bg-card", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
          {title && (
            <h3 className="font-display text-sm font-semibold tracking-tight">
              {title}
            </h3>
          )}
          {action}
        </header>
      )}
      <div className={cn(bodyPadding && "p-6")}>{children}</div>
    </section>
  );
}
