import {
  MonitoringPageHeader,
  PipelineStatusGrid,
  ErrorLogTable,
} from "@/components/admin/monitoring";

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <MonitoringPageHeader />
      <PipelineStatusGrid />
      <ErrorLogTable />
    </div>
  );
}
