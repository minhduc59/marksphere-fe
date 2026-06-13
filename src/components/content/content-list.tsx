"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ContentStatusBadge } from "@/components/ui/content-status-badge";
import { formatLabel } from "@/lib/content/formats";
import type { ContentPost } from "@/lib/api/types";

interface Props {
  posts: ContentPost[];
}

/** Table list view of generated posts. Rows open the post detail page. */
export function ContentList({ posts }: Props) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[110px]">Format</TableHead>
            <TableHead>Content Title &amp; Snippet</TableHead>
            <TableHead className="w-[90px] text-center">Score</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="w-[120px]">Created</TableHead>
            <TableHead className="w-[44px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow
              key={post.id}
              onClick={() => router.push(`/post/${post.id}`)}
              className="group cursor-pointer"
            >
              <TableCell>
                <Badge variant="outline" className="text-xs font-medium uppercase">
                  {formatLabel(post.format)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="truncate font-medium">{post.trendTitle}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {post.caption.slice(0, 120)}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {post.reviewScore !== null ? (
                  <span className="font-medium tabular-nums">
                    {post.reviewScore.toFixed(1)}
                    <span className="text-xs text-muted-foreground">/10</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <ContentStatusBadge status={post.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(post.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
