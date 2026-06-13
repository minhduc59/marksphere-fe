import Link from "next/link";
import { Star } from "lucide-react";

import { SectionPanel } from "@/components/ui/section-panel";
import { Badge } from "@/components/ui/badge";
import { ContentStatusBadge } from "@/components/ui/content-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PostFormat, type ContentPost } from "@/lib/api/types";

const formatLabels: Record<PostFormat, string> = {
  [PostFormat.QUICK_TIPS]: "Quick Tips",
  [PostFormat.HOT_TAKE]: "Hot Take",
  [PostFormat.TRENDING_BREAKDOWN]: "Trending Breakdown",
  [PostFormat.DID_YOU_KNOW]: "Did You Know",
  [PostFormat.TUTORIAL_HACK]: "Tutorial Hack",
  [PostFormat.MYTH_BUSTERS]: "Myth Busters",
  [PostFormat.BEHIND_THE_TECH]: "Behind the Tech",
};

/** Maps a 0–10 review score onto a 5-star rating. */
function StarRating({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const filled = Math.round(score / 2);
  return (
    <div className="flex justify-end gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < filled ? "fill-foreground text-foreground" : "text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}

export function RecentPostsTable({
  posts,
  isLoading,
}: {
  posts: ContentPost[];
  isLoading?: boolean;
}) {
  return (
    <SectionPanel
      title="Recent Posts"
      bodyPadding={false}
      action={
        <Link
          href="/post"
          className="text-xs font-medium text-foreground hover:underline"
        >
          View All
        </Link>
      }
    >
      {isLoading ? (
        <div className="space-y-2 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No content created yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 text-[11px] uppercase tracking-wider">Title</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider">Format</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider">Status</TableHead>
              <TableHead className="pr-6 text-right text-[11px] uppercase tracking-wider">
                Quality
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="max-w-[220px] truncate pl-6 font-medium">
                  <Link href={`/post/${post.id}`} className="hover:underline">
                    {post.trendTitle}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {formatLabels[post.format] ?? post.format}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ContentStatusBadge status={post.status} />
                </TableCell>
                <TableCell className="pr-6">
                  <StarRating score={post.reviewScore} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionPanel>
  );
}
