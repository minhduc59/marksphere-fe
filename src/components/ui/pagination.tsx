"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  /** 1-based current page. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pages shown on each side of the current page before collapsing to "…". */
  siblingCount?: number;
  className?: string;
}

const ELLIPSIS = "ellipsis" as const;

/** Build a windowed page list with leading/trailing ellipsis, e.g. 1 … 4 5 6 … 20. */
function buildRange(
  page: number,
  pageCount: number,
  siblingCount: number
): (number | typeof ELLIPSIS)[] {
  const totalSlots = siblingCount * 2 + 5; // first, last, current, 2 ellipsis
  if (pageCount <= totalSlots) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < pageCount - 1;

  const range: (number | typeof ELLIPSIS)[] = [1];
  if (showLeftEllipsis) range.push(ELLIPSIS);
  for (let p = showLeftEllipsis ? left : 2; p <= (showRightEllipsis ? right : pageCount - 1); p++) {
    range.push(p);
  }
  if (showRightEllipsis) range.push(ELLIPSIS);
  range.push(pageCount);
  return range;
}

function PageButton({
  active,
  disabled,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center border px-2 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "pointer-events-none opacity-40"
      )}
    >
      {children}
    </button>
  );
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null;
  const range = buildRange(page, pageCount, siblingCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-1", className)}
    >
      <PageButton
        label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </PageButton>

      {range.map((item, i) =>
        item === ELLIPSIS ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex h-8 min-w-8 items-center justify-center text-xs text-muted-foreground"
          >
            …
          </span>
        ) : (
          <PageButton
            key={item}
            label={`Page ${item}`}
            active={item === page}
            onClick={() => onPageChange(item)}
          >
            {item}
          </PageButton>
        )
      )}

      <PageButton
        label="Next page"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </PageButton>
    </nav>
  );
}
