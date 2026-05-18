import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockTasks } from "@guaro/mock-data";
import { Badge } from "@/components/ui/Badge";
import { formatRelative } from "@guaro/utils";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useAuth } from "@/store/auth";
import type { Task } from "@guaro/types";

export function TasksPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "My tasks";
  }, []);

  // Filtra tareas asignadas al BPO actual
  const myTasks = mockTasks.filter(
    (t) =>
      t.assignedBpo?.userId === currentUser.id &&
      !["COMPLETED", "CANCELLED"].includes(t.status),
  );

  const blockedTasks = myTasks.filter((t) => t.status === "BLOCKED");
  const newTasks = myTasks.filter((t) => t.status === "PENDING");

  return (
    <div className="p-5">
      <div className="mb-4">
        <h1 className="text-base font-semibold text-text-primary">My tasks</h1>
        <p className="text-xs text-text-tertiary mt-0.5">
          {myTasks.length} active · {blockedTasks.length} blocked
        </p>
      </div>

      {/* Blocked banner */}
      {blockedTasks.length > 0 && (
        <div
          className="flex items-center gap-3 bg-danger-bg border border-danger-border
                        rounded-lg px-4 py-3 mb-4"
        >
          <AlertTriangle size={15} className="text-danger-text flex-shrink-0" />
          <p className="text-xs text-danger-text">
            You have{" "}
            <strong>
              {blockedTasks.length} blocked task
              {blockedTasks.length > 1 ? "s" : ""}
            </strong>{" "}
            — action required before they can continue.
          </p>
        </div>
      )}

      {/* Tasks list */}
      {myTasks.length === 0 ? (
        <div className="card p-10 text-center text-text-tertiary text-xs">
          No active tasks assigned to you
        </div>
      ) : (
        <div className="space-y-2">
          {/* Blocked first */}
          {blockedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => navigate(`/tasks/${task.id}`)}
            />
          ))}
          {/* Then rest */}
          {myTasks
            .filter((t) => t.status !== "BLOCKED")
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => navigate(`/tasks/${task.id}`)}
                isNew={task.status === "PENDING"}
              />
            ))}
        </div>
      )}

      {/* Recent completions preview */}
      <RecentCompletions userId={currentUser.id} onNavigate={navigate} />
    </div>
  );
}

function TaskCard({
  task,
  onClick,
  isNew = false,
}: {
  task: Task;
  onClick: () => void;
  isNew?: boolean;
}) {
  const isBlocked = task.status === "BLOCKED";

  return (
    <div
      onClick={onClick}
      className={`card p-3 cursor-pointer hover:bg-surface-secondary transition-colors
                  ${isBlocked ? "border-l-4 border-l-danger-text" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-text-primary">
              {task.taskType?.name}
            </span>
            {isNew && (
              <span className="badge bg-info-bg text-info-text text-[10px]">
                New
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary">
            {task.brand?.name} · {task.taskType?.section?.name}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge status={task.status} />
          {task.taskType && <Badge status={task.taskType.executionMode} />}
        </div>
      </div>

      {/* Blocked reason */}
      {isBlocked && task.blockReason && (
        <div className="bg-danger-bg rounded px-2.5 py-1.5 mb-2">
          <p className="text-xs text-danger-text">{task.blockReason}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${
            isBlocked ? "text-danger-text font-medium" : "text-text-tertiary"
          }`}
        >
          {isBlocked ? "Overdue" : `ETA: ${task.taskType?.slaHours}h SLA`}
        </span>
        <div className="flex items-center gap-1 text-text-tertiary">
          <span className="text-xs">
            Weight: {task.taskType?.estimatedWeight}
          </span>
          <ChevronRight size={13} />
        </div>
      </div>
    </div>
  );
}

function RecentCompletions({
  userId,
  onNavigate,
}: {
  userId: string;
  onNavigate: (path: string) => void;
}) {
  const completed = mockTasks.filter(
    (t) => t.assignedBpo?.userId === userId && t.status === "COMPLETED",
  );

  if (completed.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <p className="section-label">Recent completions</p>
        <button
          className="text-xs text-info-text hover:underline"
          onClick={() => onNavigate("/history")}
        >
          View all
        </button>
      </div>
      <div className="card overflow-hidden">
        {completed.slice(0, 3).map((t, i) => (
          <div
            key={t.id}
            className={`flex items-center justify-between px-3 py-2.5 cursor-pointer
                        hover:bg-surface-secondary transition-colors ${
                          i < completed.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
            onClick={() => onNavigate(`/tasks/${t.id}`)}
          >
            <div>
              <p className="text-xs font-medium text-text-primary">
                {t.taskType?.name}
              </p>
              <p className="text-[11px] text-text-tertiary">
                {t.brand?.name} ·{" "}
                {t.completedAt ? formatRelative(t.completedAt) : "—"}
              </p>
            </div>
            <Badge status={t.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
