import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/store/auth";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Pagination } from "@/components/ui/Pagination";
import { formatRelative } from "@guaro/utils";
import { Plus, Search, ChevronRight } from "lucide-react";
import type { Task } from "@guaro/types";

type Tab = "active" | "history";

export function TasksPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "My tasks";
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, tab]);

  const { data: tasksResponse, isLoading } = useTasks({
    createdById: currentUser?.id,
    status: statusFilter || undefined,
    search: search || undefined,
    page,
    limit: 20,
  });

  const tasks = tasksResponse?.data ?? [];

  const activeTasks = tasks.filter(
    (t) => !["COMPLETED", "CANCELLED"].includes(t.status),
  );
  const historyTasks = tasks.filter((t) =>
    ["COMPLETED", "CANCELLED"].includes(t.status),
  );
  const blockedCount = tasks.filter((t) => t.status === "BLOCKED").length;

  const filtered = useMemo(() => {
    return tab === "active" ? activeTasks : historyTasks;
  }, [tab, activeTasks, historyTasks]);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">
            My tasks
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            {isLoading
              ? "Loading..."
              : `${tasksResponse?.total ?? 0} tasks total`}
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate("/tasks/new")}
        >
          <Plus size={13} />
          New task
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <MetricCard label="This page" value={tasks.length} sub="shown now" />
        <MetricCard
          label="Blocked"
          value={blockedCount}
          sub="need attention"
          danger={blockedCount > 0}
        />
        <MetricCard
          label="Total"
          value={tasksResponse?.total ?? 0}
          sub="all time"
        />
        <MetricCard
          label="Pages"
          value={tasksResponse?.pages ?? 1}
          sub={`page ${page} of ${tasksResponse?.pages ?? 1}`}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="flex border-b border-border px-4">
          <TabBtn active={tab === "active"} onClick={() => setTab("active")}>
            Active
          </TabBtn>
          <TabBtn active={tab === "history"} onClick={() => setTab("history")}>
            History
          </TabBtn>
        </div>

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
            {filtered.length} on this page
          </span>
        </div>

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
            {isLoading && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-text-tertiary text-xs"
                >
                  Loading tasks...
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
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

        {tasksResponse && tasksResponse.pages > 1 && (
          <Pagination
            page={tasksResponse.page}
            pages={tasksResponse.pages}
            total={tasksResponse.total}
            limit={tasksResponse.limit}
            onPageChange={setPage}
          />
        )}
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
}: {
  label: string;
  value: number | string;
  sub: string;
  danger?: boolean;
}) {
  return (
    <div className="bg-surface-secondary rounded-lg p-3">
      <p className="text-[11px] text-text-secondary mb-1">{label}</p>
      <p
        className={`text-xl font-semibold ${danger ? "text-danger-text" : "text-text-primary"}`}
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
      className={`flex items-center px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
        active
          ? "border-accent text-text-primary"
          : "border-transparent text-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}
