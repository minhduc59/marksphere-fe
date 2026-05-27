"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useDeleteTimeSlot,
  useTimeSlots,
} from "@/hooks/api/use-time-slots";
import type { TimeSlot } from "@/lib/api/time-slots";
import { TimeSlotDialog } from "./time-slot-dialog";

export function TimeSlotManager() {
  const { data, isLoading } = useTimeSlots();
  const remove = useDeleteTimeSlot();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TimeSlot | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TimeSlot | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(slot: TimeSlot) {
    setEditing(slot);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await remove.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  const items = data?.items ?? [];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Preferred publishing times</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              These slots feed the auto-scheduler — the highest-scoring slot is
              picked when a post is auto-scheduled.
            </p>
          </div>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add time slot
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No time slots yet. Add one to start auto-scheduling posts.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Time slot</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Samples</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium capitalize">
                      {s.platform}
                    </TableCell>
                    <TableCell className="font-mono">{s.time_slot}</TableCell>
                    <TableCell className="text-right">
                      {s.weighted_score.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{s.sample_count}</TableCell>
                    <TableCell className="text-right">
                      {Math.round(s.avg_views)}
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(s.avg_likes)}
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(s.avg_comments)}
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(s.avg_shares)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(s.updated_at), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(s)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPendingDelete(s)}
                          aria-label="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TimeSlotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        slot={editing}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(v) => !v && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this time slot?</AlertDialogTitle>
            <AlertDialogDescription>
              The auto-scheduler will no longer consider{" "}
              <span className="font-mono">{pendingDelete?.time_slot}</span> on{" "}
              {pendingDelete?.platform}. Already-scheduled posts are
              unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={remove.isPending}
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
