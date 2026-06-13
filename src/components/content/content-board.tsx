"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNowStrict } from "date-fns";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatLabel } from "@/lib/content/formats";
import { ContentStatus, type ContentPost } from "@/lib/api/types";

interface ColumnDef {
  key: string;
  label: string;
  statuses: ContentStatus[];
  topBar: string;
  countClass: string;
}

// Post-status columns (Draft onward). Trends are a scan output and stay in the
// Pipeline Control Center — they are intentionally not represented here.
const COLUMNS: ColumnDef[] = [
  {
    key: "draft",
    label: "Draft",
    statuses: [
      ContentStatus.DRAFT,
      ContentStatus.REGENERATING,
      ContentStatus.FAILED,
    ],
    topBar: "bg-slate-300",
    countClass: "bg-slate-100 text-slate-700",
  },
  {
    key: "needs_revision",
    label: "Needs Revision",
    statuses: [ContentStatus.NEEDS_REVISION, ContentStatus.FLAGGED_FOR_REVIEW],
    topBar: "bg-amber-400",
    countClass: "bg-amber-100 text-amber-800",
  },
  {
    key: "approved",
    label: "Approved",
    statuses: [ContentStatus.APPROVED],
    topBar: "bg-blue-500",
    countClass: "bg-blue-100 text-blue-800",
  },
  {
    key: "published",
    label: "Published",
    statuses: [ContentStatus.PUBLISHED],
    topBar: "bg-green-500",
    countClass: "bg-green-100 text-green-800",
  },
];

interface Props {
  posts: ContentPost[];
}

/** Read-only Kanban grouped by post status. Cards open the detail page. */
export function ContentBoard({ posts }: Props) {
  const router = useRouter();

  const grouped = useMemo(() => {
    const map = new Map<string, ContentPost[]>();
    COLUMNS.forEach((col) => map.set(col.key, []));
    for (const post of posts) {
      const col = COLUMNS.find((c) => c.statuses.includes(post.status));
      if (col) map.get(col.key)!.push(post);
    }
    // Newest first within each column.
    COLUMNS.forEach((col) => {
      map
        .get(col.key)!
        .sort(
          (a: ContentPost, b: ContentPost) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    });
    return map;
  }, [posts]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const cards = grouped.get(col.key) ?? [];
        return (
          <div key={col.key} className="flex w-72 shrink-0 flex-col gap-3">
            <div className={cn("h-1 w-full rounded-full", col.topBar)} />
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                  col.countClass
                )}
              >
                {cards.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {cards.length === 0 ? (
                <p className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
                  No posts
                </p>
              ) : (
                cards.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => router.push(`/post/${post.id}`)}
                    className="space-y-2 rounded-md border bg-background p-3 text-left shadow-sm transition-colors hover:border-primary"
                  >
                    <span className="inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase">
                      {formatLabel(post.format)}
                    </span>
                    <h4 className="line-clamp-2 text-sm font-medium leading-snug">
                      {post.trendTitle}
                    </h4>
                    <p className="line-clamp-1 text-[11px] italic text-muted-foreground">
                      {post.caption.slice(0, 90)}
                    </p>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold">
                        <Star className="h-3 w-3 fill-current" />
                        {post.reviewScore !== null
                          ? post.reviewScore.toFixed(1)
                          : "—"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
