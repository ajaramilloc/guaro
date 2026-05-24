import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/store/auth";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Pagination } from "@/components/ui/Pagination";
import { formatRelative } from "@guaro/utils";
import {
  Search,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader,
} from "lucide-react";
import type { Task } from "@guaro/types";

export function TasksPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "My tasks";
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const bpoProfileId = (currentUser as any)?.bpoProfile?.id;

  const { data: tasksResponse, isLoading } = useTasks({
    assignedBpoId: bpoProfileId,
    status: statusFilter || undefined,
    search: search || undefined,
    page,
    limit: 20,
  });

  const tasks = tasksResponse?.data ?? [];
  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;
  const blockedCount = tasks.filter((t) => t.status === "BLOCKED").length;

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
              : `${tasksResponse?.total ?? 0} tasks assigned to you`}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <MetricCard
          icon={Clock}
          label="Pending"
          value={pendingCount}
          color="text-text-secondary"
          onClick={() => setStatusFilter("PENDING")}
          active={statusFilter === "PENDING"}
        />
        <MetricCard
          icon={Loader}
          label="In progress"
          value={inProgressCount}
          color="text-info-text"
          onClick={() => setStatusFilter("IN_PROGRESS")}
          active={statusFilter === "IN_PROGRESS"}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Blocked"
          value={blockedCount}
          color="text-danger-text"
          onClick={() => setStatusFilter("BLOCKED")}
          active={statusFilter === "BLOCKED"}
          danger={blockedCount > 0}
        />
        <MetricCard
          icon={CheckCircle}
          label="Total"
          value={tasksResponse?.total ?? 0}
          color="text-text-secondary"
          onClick={() => setStatusFilter("")}
          active={statusFilter === ""}
        />
      </div>

      <div className="card overflow-hidden">
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
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="COMPLETED">Completed</option>
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
            {tasks.length} on this page
          </span>
        </div>

        <table className="table-base">
          <thead>
            <tr>
              <th className="w-[20%]">Task</th>
              <th className="w-[16%]">Brand</th>
              <th className="w-[10%]">Section</th>
              <th className="w-[10%]">Type</th>
              <th className="w-[12%]">Requested by</th>
              <th className="w-[8%]">Priority</th>
              <th className="w-[10%]">Status</th>
              <th className="w-[10%]">Assigned</th>
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
            {!isLoading && tasks.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-text-tertiary text-xs"
                >
                  No tasks assigned to you
                </td>
              </tr>
            )}
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
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

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  const isUrgent = task.status === "BLOCKED";

  return (
    <tr onClick={onClick} className={isUrgent ? "bg-danger-bg/30" : ""}>
      <td>
        <div className="flex items-center gap-1.5">
          {isUrgent && (
            <AlertTriangle
              size={12}
              className="text-danger-text flex-shrink-0"
            />
          )}
          <span className="font-medium text-text-primary">
            {task.taskType?.name ?? "—"}
          </span>
        </div>
      </td>
      <td>
        <div>
          <p className="text-xs text-text-primary">{task.brand?.name ?? "—"}</p>
          <p className="text-[10px] text-text-tertiary">
            {task.brand?.country}
          </p>
        </div>
      </td>
      <td className="text-text-secondary text-xs">
        {task.taskType?.section?.name ?? "—"}
      </td>
      <td>{task.taskType && <Badge status={task.taskType.executionMode} />}</td>
      <td className="text-text-secondary text-xs">
        {task.createdBy?.name ?? "—"}
      </td>
      <td>
        <span
          className={`text-xs font-medium capitalize ${
            task.priority === "urgent"
              ? "text-danger-text"
              : task.priority === "high"
                ? "text-warning-text"
                : "text-text-tertiary"
          }`}
        >
          {task.priority ?? "normal"}
        </span>
      </td>
      <td>
        <Badge status={task.status} />
      </td>
      <td className="text-text-secondary text-xs">
        {task.assignedAt ? formatRelative(task.assignedAt) : "—"}
      </td>
      <td>
        <ChevronRight size={13} className="text-text-tertiary" />
      </td>
    </tr>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  onClick,
  active,
  danger = false,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  onClick: () => void;
  active: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-surface-secondary rounded-lg p-3 text-left transition-all ${
        active ? "ring-2 ring-accent" : "hover:bg-surface-tertiary"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className={color} />
        <p className="text-[11px] text-text-secondary">{label}</p>
      </div>
      <p
        className={`text-xl font-semibold ${
          danger ? "text-danger-text" : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </button>
  );
}
