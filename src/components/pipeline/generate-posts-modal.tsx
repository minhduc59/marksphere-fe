"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScans } from "@/hooks/api/use-scans";
import { useGeneratePosts } from "@/hooks/api/use-posts";
import { ScanStatus } from "@/lib/api/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Generate posts from an already-scanned trend run (no fresh scan).
 * Wraps POST /posts/generate, which needs a completed scan_run_id.
 */
export function GeneratePostsModal({ open, onOpenChange }: Props) {
  const { data: scansData } = useScans({ pageSize: 20 });
  const generate = useGeneratePosts();

  const scans = useMemo(
    () =>
      (scansData?.items ?? []).filter(
        (s) => s.status === ScanStatus.COMPLETED || s.status === ScanStatus.PARTIAL
      ),
    [scansData?.items]
  );

  const [scanId, setScanId] = useState<string>("");
  const [numPosts, setNumPosts] = useState(3);

  // Default to the most recent usable scan when the modal opens.
  useEffect(() => {
    if (open && !scanId && scans.length > 0) setScanId(scans[0].id);
  }, [open, scanId, scans]);

  async function handleGenerate() {
    if (!scanId) return;
    await generate.mutateAsync({
      scan_run_id: scanId,
      options: { num_posts: numPosts },
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate posts</DialogTitle>
          <DialogDescription>
            Produce TikTok posts from the trends of a completed scan — no new
            crawl required.
          </DialogDescription>
        </DialogHeader>

        {scans.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No completed scans yet. Run a scan first, then generate posts from
            its trends.
          </p>
        ) : (
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label>Source scan</Label>
              <Select value={scanId} onValueChange={setScanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a scan" />
                </SelectTrigger>
                <SelectContent>
                  {scans.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {format(new Date(s.startedAt), "MMM d, HH:mm")} ·{" "}
                      {s.totalItemsFound} trends
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="num_posts">Number of posts (1–10)</Label>
              <Input
                id="num_posts"
                type="number"
                min={1}
                max={10}
                value={numPosts}
                onChange={(e) =>
                  setNumPosts(
                    Math.min(10, Math.max(1, Number(e.target.value) || 1))
                  )
                }
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generate.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!scanId || generate.isPending || scans.length === 0}
          >
            {generate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
