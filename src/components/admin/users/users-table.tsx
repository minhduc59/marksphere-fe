"use client";

import { useEffect, useState } from "react";
import {
  UserCog,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  X,
  UserPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from "@/hooks/api/use-admin-users";
import type { AdminUser, AdminUserRole } from "@/lib/api/types";
import { formatSignupDate, userInitials, userName } from "./data";

const PAGE_SIZE = 8;

function RoleBadge({ role }: { role: AdminUserRole }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight border",
        role === "admin"
          ? "border-foreground text-foreground"
          : "border-border text-muted-foreground"
      )}
    >
      {role}
    </span>
  );
}

function TikTokCell({ linked }: { linked: boolean }) {
  if (linked) {
    return (
      <CheckCircle2 className="mx-auto h-5 w-5 text-foreground" aria-label="Linked" />
    );
  }
  return (
    <XCircle className="mx-auto h-5 w-5 text-border" aria-label="Not linked" />
  );
}

function UserRow({
  user,
  onEditRole,
  onDelete,
}: {
  user: AdminUser;
  onEditRole: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}) {
  const name = userName(user);
  return (
    <TableRow className="group transition-transform hover:translate-x-1">
      {/* User details */}
      <TableCell className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded">
            <AvatarFallback className="rounded bg-muted font-bold text-foreground text-xs">
              {userInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </TableCell>

      {/* Role */}
      <TableCell className="px-4 py-4">
        <RoleBadge role={user.role} />
      </TableCell>

      {/* TikTok */}
      <TableCell className="px-4 py-4 text-center">
        <TikTokCell linked={user.tiktokLinked} />
      </TableCell>

      {/* Signup date */}
      <TableCell className="px-4 py-4">
        <span className="text-xs text-muted-foreground">
          {formatSignupDate(user.createdAt)}
        </span>
      </TableCell>

      {/* Stats */}
      <TableCell className="px-4 py-4 text-right">
        <div className="flex flex-col text-[11px] font-medium">
          <span className="text-foreground">
            G: {user.postsGenerated} • P: {user.postsPublished}
          </span>
          <span className="text-muted-foreground">VC: {user.videoClips}</span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title="Change Role"
            onClick={() => onEditRole(user)}
            className="p-1 text-muted-foreground transition-colors hover:text-foreground active:scale-90"
            aria-label={`Change role for ${name}`}
          >
            <UserCog className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={() => onDelete(user)}
            className="p-1 text-muted-foreground transition-colors hover:text-destructive active:scale-90"
            aria-label={`Delete ${name}`}
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function UsersTable() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tiktokFilter, setTiktokFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useAdminUsers({
    search: search || undefined,
    role: roleFilter === "all" ? undefined : (roleFilter as AdminUserRole),
    tiktok:
      tiktokFilter === "all"
        ? undefined
        : (tiktokFilter as "linked" | "not_linked"),
    page,
    pageSize: PAGE_SIZE,
  });

  const deleteUser = useDeleteAdminUser();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showingStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(page * PAGE_SIZE, total);

  const hasActiveFilters =
    roleFilter !== "all" || tiktokFilter !== "all" || searchInput !== "";

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setRoleFilter("all");
    setTiktokFilter("all");
    setPage(1);
  }

  function handleRoleChange(v: string) {
    setRoleFilter(v);
    setPage(1);
  }
  function handleTiktokChange(v: string) {
    setTiktokFilter(v);
    setPage(1);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteUser.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="rounded-none pl-9 text-sm"
          />
        </div>

        <Select value={roleFilter} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-36 rounded-none text-sm">
            <SelectValue placeholder="Role: All" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">Role: All</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tiktokFilter} onValueChange={handleTiktokChange}>
          <SelectTrigger className="w-40 rounded-none text-sm">
            <SelectValue placeholder="TikTok: All" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">TikTok: All</SelectItem>
            <SelectItem value="linked">Linked</SelectItem>
            <SelectItem value="not_linked">Not Linked</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground underline hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Reset filters
          </button>
        )}

        <Button
          onClick={() => setAddOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-none text-sm"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Table */}
      <div className="border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                User Details
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Role
              </TableHead>
              <TableHead className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                TikTok
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Signup Date
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Stats
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="px-4 py-3">
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm">
                  <p className="text-muted-foreground">Failed to load users.</p>
                  <button
                    onClick={() => refetch()}
                    className="mt-3 border border-border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-muted"
                  >
                    Retry
                  </button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No users match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              items.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEditRole={setRoleTarget}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">
            {total === 0
              ? "No users found"
              : `Showing ${showingStart}–${showingEnd} of ${total} users`}
          </span>
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            siblingCount={1}
          />
        </div>
      </div>

      <AddUserDialog open={addOpen} onOpenChange={setAddOpen} />
      <RoleDialog
        user={roleTarget}
        onOpenChange={(open) => !open && setRoleTarget(null)}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget ? userName(deleteTarget) : ""}
              </span>{" "}
              ({deleteTarget?.email}) and all their credentials. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteUser.isPending}
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Add User dialog ─────────────────────────────────────
function AddUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreateAdminUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<AdminUserRole>("user");

  useEffect(() => {
    if (open) {
      setEmail("");
      setPassword("");
      setDisplayName("");
      setRole("user");
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync({
      email: email.trim(),
      password,
      displayName: displayName.trim() || undefined,
      role,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Create a local email + password account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-user-email">Email</Label>
              <Input
                id="new-user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none"
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-password">Password</Label>
              <Input
                id="new-user-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none"
                placeholder="Min. 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-name">Display name (optional)</Label>
              <Input
                id="new-user-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-none"
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as AdminUserRole)}
              >
                <SelectTrigger className="rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={create.isPending}
              className="rounded-none"
            >
              {create.isPending ? "Creating…" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Change Role dialog ──────────────────────────────────
function RoleDialog({
  user,
  onOpenChange,
}: {
  user: AdminUser | null;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateAdminUser();
  const [role, setRole] = useState<AdminUserRole>("user");

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    await update.mutateAsync({ id: user.id, dto: { role } });
    onOpenChange(false);
  }

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              {user ? `${userName(user)} (${user.email})` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as AdminUserRole)}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={update.isPending || role === user?.role}
              className="rounded-none"
            >
              {update.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
