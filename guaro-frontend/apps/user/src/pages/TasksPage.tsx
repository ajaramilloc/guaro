import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockTasks } from "@guaro/mock-data";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelative } from "@guaro/utils";
import { Plus, Search, ChevronRight } from "lucide-react";
import type { Task } from "@guaro/types";

type Tab = "active" | "history";

export function TasksPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "My tasks";
  }, []);

  const activeTasks = mockTasks.filter(
    (t) => !["COMPLETED", "CANCELLED"].includes(t.status),
  );
  const historyTasks = mockTasks.filter((t) =>
    ["COMPLETED", "CANCELLED"].includes(t.status),
  );

  const blockedCount = activeTasks.filter((t) => t.status === "BLOCKED").length;
  const overdueCount = activeTasks.filter((t) => t.status === "BLOCKED").length;

  const filtered = useMemo(() => {
    const source = tab === "active" ? activeTasks : historyTasks;
    return source.filter((t) => {
      const q = search.toLowerCase();
      if (
        q &&
        !t.taskType?.name.toLowerCase().includes(q) &&
        !t.brand?.name.toLowerCase().includes(q)
      )
        return false;
      if (statusFilter && t.status !== statusFilter) return false;
      return true;
    });
  }, [tab, search, statusFilter, activeTasks, historyTasks]);

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">
            My tasks
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">Tasks you created</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate("/tasks/new")}
        >
          <Plus size={13} />
          New task
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <MetricCard
          label="Active"
          value={activeTasks.length}
          sub="across all modules"
        />
        <MetricCard
          label="Blocked"
          value={blockedCount}
          sub="need attention"
          danger={blockedCount > 0}
        />
        <MetricCard
          label="Overdue"
          value={overdueCount}
          sub="past ETA"
          warn={overdueCount > 0}
        />
        <MetricCard
          label="Completed"
          value={historyTasks.length}
          sub="last 30 days"
        />
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border px-4">
          <TabBtn active={tab === "active"} onClick={() => setTab("active")}>
            Active{" "}
            <span className="ml-1 badge badge-neutral">
              {activeTasks.length}
            </span>
          </TabBtn>
          <TabBtn active={tab === "history"} onClick={() => setTab("history")}>
            History
          </TabBtn>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              className="input input-sm pl-7 w-44"
              placeholder="Search task or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="select input-sm w-32"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {tab === "active"
              ? ["PENDING", "IN_PROGRESS", "BLOCKED"].map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))
              : ["COMPLETED", "CANCELLED"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
          </select>
          {(search || statusFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
              className="btn btn-ghost btn-sm text-text-secondary"
            >
              Clear
            </button>
          )}
          <span className="ml-auto text-xs text-text-tertiary">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <table className="table-base">
          <thead>
            <tr>
              <th className="w-[22%]">Task</th>
              <th className="w-[18%]">Brand</th>
              <th className="w-[14%]">Section</th>
              <th className="w-[12%]">BPO</th>
              <th className="w-[9%]">Type</th>
              <th className="w-[11%]">Status</th>
              <th className="w-[10%]">
                {tab === "history" ? "Completed" : "Created"}
              </th>
              <th className="w-[4%]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-text-tertiary text-xs"
                >
                  No tasks match your filters
                </td>
              </tr>
            )}
            {filtered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                tab={tab}
                onClick={() => navigate(`/tasks/${task.id}`)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  tab,
  onClick,
}: {
  task: Task;
  tab: Tab;
  onClick: () => void;
}) {
  return (
    <tr onClick={onClick}>
      <td>
        <span className="font-medium text-text-primary">
          {task.taskType?.name ?? "—"}
        </span>
      </td>
      <td className="text-text-secondary text-xs">{task.brand?.name ?? "—"}</td>
      <td className="text-text-secondary text-xs">
        {task.taskType?.section?.name ?? "—"}
      </td>
      <td>
        {task.assignedBpo?.user ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assignedBpo.user.name} size="xs" />
            <span className="text-xs">
              {task.assignedBpo.user.name.split(" ")[0]}
            </span>
          </div>
        ) : (
          <span className="text-text-tertiary text-xs">Auto</span>
        )}
      </td>
      <td>{task.taskType && <Badge status={task.taskType.executionMode} />}</td>
      <td>
        <Badge status={task.status} />
      </td>
      <td
        className={`text-xs ${task.status === "BLOCKED" ? "text-danger-text font-medium" : "text-text-secondary"}`}
      >
        {tab === "history" && task.completedAt
          ? formatRelative(task.completedAt)
          : formatRelative(task.createdAt)}
      </td>
      <td>
        <ChevronRight size={13} className="text-text-tertiary" />
      </td>
    </tr>
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

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-3 py-2.5 text-xs font-medium border-b-2
                  transition-colors -mb-px ${
                    active
                      ? "border-accent text-text-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
    >
      {children}
    </button>
  );
}
