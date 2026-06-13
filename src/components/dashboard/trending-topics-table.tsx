import { SectionPanel } from "@/components/ui/section-panel";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrendItem } from "@/lib/api/types";

export function TrendingTopicsTable({
  trends,
  isLoading,
}: {
  trends: TrendItem[];
  isLoading?: boolean;
}) {
  return (
    <SectionPanel
      title="Trending Topics"
      bodyPadding={false}
      action={
        <span className="text-xs text-muted-foreground">Real-time Insights</span>
      }
    >
      {isLoading ? (
        <div className="space-y-2 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : trends.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No trends discovered yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 text-[11px] uppercase tracking-wider">Topic</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider">Sentiment</TableHead>
              <TableHead className="pr-6 text-right text-[11px] uppercase tracking-wider">
                Score
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trends.map((trend) => (
              <TableRow key={trend.id}>
                <TableCell className="max-w-[220px] truncate pl-6 font-medium">
                  {trend.title}
                </TableCell>
                <TableCell className="text-xs uppercase text-muted-foreground">
                  {trend.category ?? "—"}
                </TableCell>
                <TableCell>
                  {trend.sentiment ? (
                    <SentimentBadge sentiment={trend.sentiment} />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="pr-6 text-right font-semibold">
                  {trend.trendingScore != null ? Math.round(trend.trendingScore) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionPanel>
  );
}
