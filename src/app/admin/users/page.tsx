import { UsersStatsRow } from "@/components/admin/users/stats-row";
import { UsersTable } from "@/components/admin/users/users-table";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <UsersStatsRow />
      <UsersTable />
    </div>
  );
}
