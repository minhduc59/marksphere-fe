"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ViewToggle, type ContentView } from "@/components/content/view-toggle";
import {
  ContentFilters,
  withinRange,
  type ContentFilterState,
} from "@/components/content/content-filters";
import { ContentList } from "@/components/content/content-list";
import { ContentBoard } from "@/components/content/content-board";
import { usePosts } from "@/hooks/api/use-posts";
import { ContentStatus, PostFormat } from "@/lib/api/types";

const LIST_PAGE_SIZE = 20;
const BOARD_PAGE_SIZE = 200;

export default function ContentPage() {
  const [view, setView] = useState<ContentView>("board");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ContentFilterState>({
    status: "all",
    format: "all",
    dateRange: "all",
  });

  function updateFilters(next: ContentFilterState) {
    setFilters(next);
    setPage(1);
  }

  const queryParams = useMemo(
    () => ({
      // The board groups every status into its own column client-side, so a
      // server-side status filter would empty out the other columns and make a
      // post vanish the moment it changes status. Only the list view filters by
      // status server-side.
      ...(view === "list" && filters.status !== "all"
        ? { status: filters.status as ContentStatus }
        : {}),
      ...(filters.format !== "all"
        ? { format: filters.format as PostFormat }
        : {}),
      ...(view === "list"
        ? { page, pageSize: LIST_PAGE_SIZE }
        : { pageSize: BOARD_PAGE_SIZE }),
    }),
    [filters.status, filters.format, view, page]
  );

  const { data, isLoading } = usePosts(queryParams);

  // Date range is applied client-side (the posts API has no date filter).
  const visiblePosts = useMemo(
    () =>
      (data?.items ?? []).filter((p) =>
        withinRange(p.createdAt, filters.dateRange)
      ),
    [data?.items, filters.dateRange]
  );

  const total = data?.total ?? 0;
  const pageCount = Math.ceil(total / LIST_PAGE_SIZE);
  const summary =
    view === "list" && total > 0
      ? `Showing ${visiblePosts.length} of ${total}`
      : `${visiblePosts.length} items`;

  return (
    <div className="space-y-6">
      {/* Header + view toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content</h1>
          <p className="text-sm text-muted-foreground">
            Manage and orchestrate your AI-generated posts.
          </p>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      <ContentFilters
        value={filters}
        onChange={updateFilters}
        summary={summary}
        hideStatus={view === "board"}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !visiblePosts.length ? (
        <EmptyState
          icon={FileText}
          title="No content yet"
          description="Generate content from trending topics to get started."
          action={{ label: "Go to Pipeline", href: "/pipeline" }}
        />
      ) : view === "board" ? (
        <ContentBoard posts={visiblePosts} />
      ) : (
        <>
          <ContentList posts={visiblePosts} />
          {pageCount > 1 && (
            <div className="flex justify-center">
              <Pagination
                page={page}
                pageCount={pageCount}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
