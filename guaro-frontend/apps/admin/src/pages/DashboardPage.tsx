import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockTasks,
  mockBpoProfiles,
  mockUsers,
  mockModules,
} from "@guaro/mock-data";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/store/auth";
import { formatRelative } from "@guaro/utils";

export function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = currentUser.role === "SUPERADMIN";
  const adminModuleId = currentUser.adminProfile?.moduleId;

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = isSuperAdmin ? "Global dashboard" : "Dashboard";
  }, [isSuperAdmin]);

  const allActiveTasks = mockTasks.filter(
    (t) => !["COMPLETED", "CANCELLED"].includes(t.status),
  );
  const allBlocked = allActiveTasks.filter((t) => t.status === "BLOCKED");
  const allCompleted = mockTasks.filter((t) => t.status === "COMPLETED");

  const scopedTasks = isSuperAdmin
    ? allActiveTasks
    : allActiveTasks.filter(
        (t) => t.taskType?.section?.moduleId === adminModuleId,
      );
  const scopedBlocked = scopedTasks.filter((t) => t.status === "BLOCKED");

  const bpoUsers = mockUsers.filter((u) => u.role === "BPO");
  const atCapacity = mockBpoProfiles.filter(
    (b) => b.activeWeight >= b.maxWeight,
  ).length;
  const nearFull = mockBpoProfiles.filter(
    (b) => b.activeWeight >= b.maxWeight * 0.8 && b.activeWeight < b.maxWeight,
  ).length;

  return (
    <div className="p-5">
      <div className="mb-4">
        <h1 className="text-base font-semibold text-text-primary">
          {isSuperAdmin ? "Global dashboard" : "Dashboard"}
        </h1>
        <p className="text-xs text-text-tertiary mt-0.5">
          {isSuperAdmin
            ? "All modules overview"
            : `${mockModules.find((m) => m.id === adminModuleId)?.name} module`}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <MetricCard
          label="Active tasks"
          value={scopedTasks.length}
          sub="across all modules"
        />
        <MetricCard
          label="Blocked"
          value={scopedBlocked.length}
          sub="need attention"
          danger={scopedBlocked.length > 0}
        />
        <MetricCard
          label="BPOs at capacity"
          value={atCapacity}
          sub={`${nearFull} near full`}
          warn={atCapacity > 0}
        />
        <MetricCard
          label="Completed today"
          value={allCompleted.length}
          sub="all time (mock)"
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active tasks */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-text-primary">
              Active tasks
            </p>
            <span className="badge badge-neutral">{scopedTasks.length}</span>
          </div>
          {scopedTasks.length === 0 ? (
            <p className="text-center text-text-tertiary text-xs py-8">
              No active tasks
            </p>
          ) : (
            <table className="table-base">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Brand</th>
                  <th>BPO</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scopedTasks.slice(0, 6).map((t) => (
                  <tr key={t.id} onClick={() => navigate(`/tasks/${t.id}`)}>
                    <td className="font-medium text-xs">{t.taskType?.name}</td>
                    <td className="text-text-secondary text-xs">
                      {t.brand?.name}
                    </td>
                    <td>
                      {t.assignedBpo?.user ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={t.assignedBpo.user.name} size="xs" />
                          <span className="text-xs">
                            {t.assignedBpo.user.name.split(" ")[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-tertiary text-xs">Auto</span>
                      )}
                    </td>
                    <td>
                      <Badge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* BPO workload summary */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-text-primary">
              BPO workload
            </p>
            <button
              className="text-xs text-info-text hover:underline"
              onClick={() => navigate("/bpo-workload")}
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-border">
            {bpoUsers.map((u) => {
              const profile = u.bpoProfile;
              if (!profile) return null;
              const pct = Math.round(
                (profile.activeWeight / profile.maxWeight) * 100,
              );
              return (
                <div key={u.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Avatar name={u.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">
                      {u.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-surface-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 90
                              ? "bg-danger-text"
                              : pct >= 70
                                ? "bg-warning-text"
                                : "bg-info-text"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-medium flex-shrink-0 ${
                          pct >= 90
                            ? "text-danger-text"
                            : pct >= 70
                              ? "text-warning-text"
                              : "text-text-secondary"
                        }`}
                      >
                        {profile.activeWeight}/{profile.maxWeight}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module breakdown — superadmin only */}
        {isSuperAdmin && (
          <div className="card overflow-hidden col-span-2">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-medium text-text-primary">
                Tasks by module
              </p>
            </div>
            <table className="table-base">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Active</th>
                  <th>Blocked</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {mockModules.map((mod) => {
                  const modTasks = mockTasks.filter(
                    (t) => t.taskType?.section?.moduleId === mod.id,
                  );
                  const active = modTasks.filter(
                    (t) => !["COMPLETED", "CANCELLED"].includes(t.status),
                  ).length;
                  const blocked = modTasks.filter(
                    (t) => t.status === "BLOCKED",
                  ).length;
                  const completed = modTasks.filter(
                    (t) => t.status === "COMPLETED",
                  ).length;
                  return (
                    <tr
                      key={mod.id}
                      onClick={() => navigate(`/modules/${mod.id}`)}
                    >
                      <td className="font-medium">{mod.name}</td>
                      <td>{active}</td>
                      <td
                        className={
                          blocked > 0 ? "text-danger-text font-medium" : ""
                        }
                      >
                        {blocked || "—"}
                      </td>
                      <td className="text-success-text">{completed || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  danger = false,
  warn = false,
}: {
  label: string;
  value: number;
  sub: string;
  danger?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="bg-surface-secondary rounded-lg p-3">
      <p className="text-[11px] text-text-secondary mb-1">{label}</p>
      <p
        className={`text-xl font-semibold ${
          danger
            ? "text-danger-text"
            : warn
              ? "text-warning-text"
              : "text-text-primary"
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] text-text-tertiary mt-0.5">{sub}</p>
    </div>
  );
}
