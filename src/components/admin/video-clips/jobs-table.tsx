"use client";

import { useEffect, useState } from "react";
import { Search, MoreVertical, VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { SectionPanel } from "@/components/admin";
import {
  useAdminVideoClips,
  useRetryVideoClipTask,
} from "@/hooks/api/use-admin-video-clips";
import { StageBadge } from "./stage-badge";
import { ClipsModal } from "./clips-modal";
import { toVideoClipJob, type VideoClipJob } from "./data";

const PAGE_SIZE = 8;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Status: All" },
  { value: "queued", label: "Queued" },
  { value: "downloading", label: "Downloading" },
  { value: "transcribing", label: "Transcribing" },
  { value: "analyzing", label: "Analyzing" },
  { value: "clipping", label: "Clipping" },
  { value: "captioning", label: "Captioning" },
  { value: "uploading", label: "Uploading" },
  { value: "completed", label: "Completed" },
  { value: "error", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

function VideoThumbnail({ job }: { job: VideoClipJob }) {
  if (job.stage === "error") {
    return (
      <div className="flex h-8 w-12 flex-shrink-0 items-center justify-center bg-destructive/10">
        <VideoIcon className="h-4 w-4 text-destructive" />
      </div>
    );
  }
  if (job.stage === "queued") {
    return (
      <div className="flex h-8 w-12 flex-shrink-0 items-center justify-center bg-muted">
        <VideoIcon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
  if (job.thumbnailUrl) {
    return (
      <div className="relative h-8 w-12 flex-shrink-0 overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={job.thumbnailUrl}
          alt={job.filename}
          className="h-full w-full object-cover opacity-80 grayscale contrast-125"
        />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-12 flex-shrink-0 items-center justify-center bg-muted">
      <VideoIcon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function JobSourceCell({ job }: { job: VideoClipJob }) {
  const urlClass =
    job.stage === "error"
      ? "text-[11px] font-bold text-destructive truncate"
      : "text-[11px] text-muted-foreground truncate";

  return (
    <div className="flex items-center gap-3">
      <VideoThumbnail job={job} />
      <div className="min-w-0 max-w-xs">
        <p className="truncate font-bold text-foreground">{job.filename}</p>
        <p className={urlClass}>{job.url}</p>
      </div>
    </div>
  );
}

function OwnerCell({ initials, name }: { initials: string; name: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
        {initials}
      </span>
      <span className="truncate text-foreground">{name}</span>
    </div>
  );
}

function ClipsCell({ job }: { job: VideoClipJob }) {
  if (job.stage === "error" || job.stage === "cancelled") {
    return <span className="font-bold">--</span>;
  }
  return (
    <>
      <span className="font-bold">{job.clipsProduced}</span>{" "}
      <span className="text-[11px] text-muted-foreground">
        / {job.clipsTotal} total
      </span>
    </>
  );
}

function ActionCell({
  job,
  onRetry,
  retrying,
  onViewClips,
}: {
  job: VideoClipJob;
  onRetry: (taskId: string) => void;
  retrying: boolean;
  onViewClips: (job: VideoClipJob) => void;
}) {
  if (job.stage === "completed") {
    return (
      <Button
        size="sm"
        onClick={() => onViewClips(job)}
        className="h-7 rounded-none px-3 text-[10px] font-bold uppercase"
      >
        View Clips
      </Button>
    );
  }
  if (job.stage === "error") {
    return (
      <Button
        size="sm"
        variant="destructive"
        disabled={retrying}
        onClick={() => onRetry(job.id)}
        className="h-7 rounded-none px-3 text-[10px] font-bold uppercase"
      >
        Retry
      </Button>
    );
  }
  return (
    <button
      type="button"
      className="rounded p-1 transition-colors hover:bg-muted"
      aria-label="More options"
    >
      <MoreVertical className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

const COLSPAN = 7;

/** Interactive jobs table with live data, filters, and pagination. */
export function VideoClipsJobsTable() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [viewJob, setViewJob] = useState<VideoClipJob | null>(null);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError } = useAdminVideoClips({
    status: status === "all" ? undefined : status,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const retry = useRetryVideoClipTask();

  const jobs = (data?.items ?? []).map(toVideoClipJob);
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const showingStart = total === 0 ? 0 : start + 1;
  const showingEnd = Math.min(start + PAGE_SIZE, total);

  function handleStatusChange(v: string) {
    setStatus(v);
    setPage(1);
  }

  const headerAction = (
    <div className="flex items-center gap-3">
      <div className="relative w-48">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search source..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-8 rounded-none pl-8 text-sm"
        />
      </div>
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="h-8 w-40 rounded-none text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
    <SectionPanel
      title="Recent Clipping Tasks"
      action={headerAction}
      bodyPadding={false}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Source (Title/URL)
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Owner
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pipeline Stage
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Clips
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Duration
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Created Time
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={COLSPAN} className="px-6 py-4">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={COLSPAN}
                  className="px-6 py-12 text-center text-sm text-destructive"
                >
                  Failed to load clipping tasks. Please try again.
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLSPAN}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  No clipping tasks found.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-muted/30">
                  <TableCell className="px-6 py-4">
                    <JobSourceCell job={job} />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <OwnerCell
                      initials={job.ownerInitials}
                      name={job.ownerName}
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <StageBadge stage={job.stage} />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm">
                    <ClipsCell job={job} />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {job.duration}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="text-sm text-foreground">{job.relativeTime}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {job.absoluteTime}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <ActionCell
                      job={job}
                      onRetry={(id) => retry.mutate(id)}
                      retrying={retry.isPending}
                      onViewClips={setViewJob}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between border-t bg-card px-6 py-4">
        <span className="text-[12px] text-muted-foreground">
          Showing {showingStart} to {showingEnd} of {total} tasks
        </span>
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          siblingCount={1}
        />
      </div>
    </SectionPanel>

    <ClipsModal
      taskId={viewJob?.id ?? null}
      title={viewJob?.filename ?? "Clips"}
      open={viewJob !== null}
      onOpenChange={(o) => {
        if (!o) setViewJob(null);
      }}
    />
    </>
  );
}
