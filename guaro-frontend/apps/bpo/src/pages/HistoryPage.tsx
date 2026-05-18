import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockTasks } from "@guaro/mock-data";
import { Badge } from "@/components/ui/Badge";
import { formatRelative } from "@guaro/utils";
import { useAuth } from "@/store/auth";

export function HistoryPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "History";
  }, []);

  const completed = mockTasks.filter(
    (t) =>
      t.assignedBpo?.userId === currentUser.id &&
      ["COMPLETED", "CANCELLED"].includes(t.status),
  );

  const totalCompleted = completed.filter(
    (t) => t.status === "COMPLETED",
  ).length;
  const avgDuration = completed
    .filter((t) => t.result?.duration_ms)
    .reduce((acc, t) => acc + (t.result?.duration_ms ?? 0), 0);
  const avgMs = totalCompleted > 0 ? avgDuration / totalCompleted : 0;

  return (
    <div className="p-5">
      <div className="mb-4">
        <h1 className="text-base font-semibold text-text-primary">History</h1>
        <p className="text-xs text-text-tertiary mt-0.5">
          Your completed and cancelled tasks
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="bg-surface-secondary rounded-lg p-3">
          <p className="text-[11px] text-text-secondary mb-1">Completed</p>
          <p className="text-xl font-semibold text-text-primary">
            {totalCompleted}
          </p>
          <p className="text-[10px] text-text-tertiary mt-0.5">all time</p>
        </div>
        <div className="bg-surface-secondary rounded-lg p-3">
          <p className="text-[11px] text-text-secondary mb-1">Avg. duration</p>
          <p className="text-xl font-semibold text-text-primary">
            {avgMs > 0 ? `${(avgMs / 1000).toFixed(1)}s` : "—"}
          </p>
          <p className="text-[10px] text-text-tertiary mt-0.5">per task</p>
        </div>
        <div className="bg-surface-secondary rounded-lg p-3">
          <p className="text-[11px] text-text-secondary mb-1">Cancelled</p>
          <p className="text-xl font-semibold text-text-primary">
            {completed.filter((t) => t.status === "CANCELLED").length}
          </p>
          <p className="text-[10px] text-text-tertiary mt-0.5">all time</p>
        </div>
      </div>

      {/* Table */}
      {completed.length === 0 ? (
        <div className="card p-10 text-center text-text-tertiary text-xs">
          No completed tasks yet
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-[24%]">Task</th>
                <th className="w-[20%]">Brand</th>
                <th className="w-[16%]">Section</th>
                <th className="w-[10%]">Type</th>
                <th className="w-[12%]">Status</th>
                <th className="w-[12%]">Completed</th>
                <th className="w-[6%]">Duration</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((t) => (
                <tr key={t.id} onClick={() => navigate(`/tasks/${t.id}`)}>
                  <td className="font-medium">{t.taskType?.name}</td>
                  <td className="text-text-secondary text-xs">
                    {t.brand?.name}
                  </td>
                  <td className="text-text-secondary text-xs">
                    {t.taskType?.section?.name ?? "—"}
                  </td>
                  <td>
                    {t.taskType && <Badge status={t.taskType.executionMode} />}
                  </td>
                  <td>
                    <Badge status={t.status} />
                  </td>
                  <td className="text-text-secondary text-xs">
                    {t.completedAt ? formatRelative(t.completedAt) : "—"}
                  </td>
                  <td className="text-text-secondary text-xs">
                    {t.result?.duration_ms
                      ? `${(t.result.duration_ms / 1000).toFixed(1)}s`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
