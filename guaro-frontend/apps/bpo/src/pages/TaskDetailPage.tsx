import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useTask,
  useStartTask,
  useCompleteTask,
  useBlockTask,
  useAddComment,
} from "@/hooks/useTasks";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateTime, formatRelative } from "@guaro/utils";
import {
  AlertTriangle,
  ChevronRight,
  Play,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  FileText,
  GitBranch,
  X,
} from "lucide-react";
import type { Task } from "@guaro/types";

type Tab = "workflow" | "log" | "history" | "comments";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("workflow");
  const [comment, setComment] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const { data: task, isLoading } = useTask(id ?? "");
  const startTask = useStartTask();
  const completeTask = useCompleteTask();
  const blockTask = useBlockTask();
  const addComment = useAddComment();

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el)
      el.textContent = task
        ? `${task.taskType?.name} — ${task.brand?.name}`
        : "Task detail";
  }, [task]);

  if (isLoading) {
    return (
      <div className="p-5 text-center text-text-tertiary text-xs">
        Loading...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-5 text-center text-text-tertiary">Task not found</div>
    );
  }

  const isBlocked = task.status === "BLOCKED";
  const isPending = task.status === "PENDING";
  const isInProgress = task.status === "IN_PROGRESS";
  const isFinished = ["COMPLETED", "CANCELLED"].includes(task.status);
  const bpoUser = task.assignedBpo?.user;
  const result = task.result as Record<string, number> | null;

  return (
    <div className="p-5">
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-4">
        <Link to="/" className="hover:text-text-secondary transition-colors">
          My tasks
        </Link>
        <ChevronRight size={12} />
        <span className="text-text-primary font-medium">
          {task.taskType?.name} — {task.brand?.name}
        </span>
      </div>

      {isBlocked && (
        <div
          className="flex items-start gap-3 bg-danger-bg border border-danger-border
                        rounded-lg px-4 py-3 mb-4"
        >
          <AlertTriangle
            size={15}
            className="text-danger-text flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-xs font-semibold text-danger-text mb-0.5">
              Task is blocked
            </p>
            <p className="text-xs text-danger-text/80">{task.blockReason}</p>
          </div>
        </div>
      )}

      {/* Header card */}
      <div className="card p-4 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-text-primary">
                {task.taskType?.name}
              </h2>
              <Badge status={task.status} />
              {task.taskType && <Badge status={task.taskType.executionMode} />}
            </div>
            <p className="text-xs text-text-secondary">
              {task.brand?.name} · {task.taskType?.section?.name} · Created by{" "}
              {task.createdBy?.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-text-tertiary">
              Assigned {task.assignedAt ? formatRelative(task.assignedAt) : "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 mb-4">
          <div className="space-y-0">
            <InfoRow label="Brand" value={<span>{task.brand?.name}</span>} />
            <InfoRow
              label="Country"
              value={<span>{task.brand?.country}</span>}
            />
            <InfoRow
              label="Merchant"
              value={<span>{task.brand?.merchant?.name}</span>}
            />
            <InfoRow
              label="SLA"
              value={
                <span
                  className={
                    task.taskType?.slaHours
                      ? "text-text-primary"
                      : "text-text-tertiary"
                  }
                >
                  {task.taskType?.slaHours ? `${task.taskType.slaHours}h` : "—"}
                </span>
              }
            />
          </div>
          <div className="space-y-0">
            <InfoRow
              label="Application"
              value={
                <span className="font-mono text-[11px]">
                  {task.brand?.applications?.[0]?.application?.appName ?? "—"}
                </span>
              }
            />
            <InfoRow
              label="Input"
              value={
                task.inputType === "NONE" ? (
                  <span className="text-text-tertiary">N/A</span>
                ) : (
                  <a
                    href={task.inputValue ? task.inputValue : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info-text text-[11px] font-mono hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open sheet ↗
                  </a>
                )
              }
            />
            <InfoRow
              label="Priority"
              value={
                <span
                  className={`capitalize font-medium ${
                    task.priority === "urgent"
                      ? "text-danger-text"
                      : task.priority === "high"
                        ? "text-warning-text"
                        : "text-text-secondary"
                  }`}
                >
                  {task.priority ?? "normal"}
                </span>
              }
            />
          </div>
        </div>

        {/* Action buttons */}
        {!isFinished && (
          <div className="flex gap-2 pt-3 border-t border-border">
            {isPending && (
              <button
                className="btn btn-primary btn-sm"
                disabled={startTask.isPending}
                onClick={() => startTask.mutate(task.id)}
              >
                <Play size={13} />
                {startTask.isPending ? "Starting..." : "Start task"}
              </button>
            )}
            {isInProgress && (
              <button
                className="btn btn-success btn-sm"
                disabled={completeTask.isPending}
                onClick={() => completeTask.mutate({ id: task.id })}
              >
                <CheckCircle size={13} />
                {completeTask.isPending ? "Completing..." : "Mark as complete"}
              </button>
            )}
            {(isPending || isInProgress) && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setShowBlockModal(true)}
              >
                <XCircle size={13} />
                Report block
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden mb-4">
        <div className="flex border-b border-border px-4">
          {(
            [
              { id: "workflow", icon: GitBranch, label: "Workflow" },
              { id: "log", icon: FileText, label: "Execution log" },
              { id: "history", icon: Clock, label: "History" },
              {
                id: "comments",
                icon: MessageSquare,
                label: `Comments${task.comments?.length ? ` (${task.comments.length})` : ""}`,
              },
            ] as { id: Tab; icon: any; label: string }[]
          ).map(({ id: tId, icon: Icon, label }) => (
            <button
              key={tId}
              onClick={() => setTab(tId)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium
                           border-b-2 transition-colors -mb-px ${
                             tab === tId
                               ? "border-accent text-text-primary"
                               : "border-transparent text-text-secondary hover:text-text-primary"
                           }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === "workflow" && <WorkflowTab task={task} />}
          {tab === "log" && <LogTab task={task} result={result} />}
          {tab === "history" && <HistoryTab task={task} />}
          {tab === "comments" && (
            <CommentsTab
              task={task}
              comment={comment}
              onCommentChange={setComment}
              onSubmit={() =>
                addComment.mutate(
                  { taskId: task.id, body: comment },
                  { onSuccess: () => setComment("") },
                )
              }
              isPending={addComment.isPending}
            />
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate("/")}
        >
          ← Back to tasks
        </button>
      </div>

      {/* Block modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-modal w-96 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">
                Report block
              </h3>
              <button onClick={() => setShowBlockModal(false)}>
                <X size={16} className="text-text-secondary" />
              </button>
            </div>
            <p className="text-xs text-text-secondary mb-3">
              Describe the issue that is blocking this task. The requester will
              be notified.
            </p>
            <textarea
              className="input w-full h-24 resize-none mb-4"
              placeholder="e.g. The sheet has missing columns: sku, price..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                disabled={!blockReason.trim() || blockTask.isPending}
                onClick={() => {
                  blockTask.mutate(
                    { id: task.id, blockReason },
                    {
                      onSuccess: () => {
                        setShowBlockModal(false);
                        setBlockReason("");
                      },
                    },
                  );
                }}
              >
                {blockTask.isPending ? "Reporting..." : "Report block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border last:border-b-0">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-xs font-medium text-text-primary">{value}</span>
    </div>
  );
}

function WorkflowTab({ task }: { task: Task }) {
  const isAuto = task.taskType?.executionMode !== "MANUAL";

  const nodes = isAuto
    ? [
        { label: "Read sheet", status: "done", sub: "File loaded" },
        {
          label: "Validate rows",
          status: "done",
          sub: task.status === "BLOCKED" ? "Errors found" : "All valid",
        },
        {
          label: "Upload via API",
          status:
            task.status === "BLOCKED"
              ? "blocked"
              : task.status === "COMPLETED"
                ? "done"
                : "active",
          sub:
            task.status === "BLOCKED"
              ? "Blocked — awaiting fix"
              : task.status === "COMPLETED"
                ? "Success"
                : "In progress...",
        },
        {
          label: "Notify result",
          status: task.status === "COMPLETED" ? "done" : "pending",
          sub: task.status === "COMPLETED" ? "Webhook sent" : "Pending",
        },
      ]
    : [
        { label: "Assigned to you", status: "done", sub: "Task assigned" },
        {
          label: "Execute manually",
          status:
            task.status === "COMPLETED"
              ? "done"
              : task.status === "BLOCKED"
                ? "blocked"
                : "active",
          sub:
            task.status === "COMPLETED"
              ? "Done"
              : task.status === "BLOCKED"
                ? "Blocked"
                : "Your turn",
        },
        {
          label: "Notify result",
          status: task.status === "COMPLETED" ? "done" : "pending",
          sub: "Webhook",
        },
      ];

  return (
    <div className="flex flex-col items-center gap-0 py-2">
      {nodes.map((node, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className={`px-4 py-2 rounded-md border text-xs text-center min-w-[180px] ${
              node.status === "done"
                ? "bg-success-bg border-success-border text-success-text"
                : node.status === "active"
                  ? "bg-info-bg border-info-border text-info-text"
                  : node.status === "blocked"
                    ? "bg-danger-bg border-danger-border text-danger-text"
                    : "bg-surface-secondary border-border text-text-tertiary opacity-50"
            }`}
          >
            <p className="font-medium">{node.label}</p>
            <p className="text-[10px] mt-0.5 opacity-75">{node.sub}</p>
          </div>
          {i < nodes.length - 1 && <div className="w-px h-4 bg-border" />}
        </div>
      ))}
    </div>
  );
}

function LogTab({
  task,
  result,
}: {
  task: Task;
  result: Record<string, number> | null;
}) {
  const logLines =
    task.status === "BLOCKED"
      ? [
          { type: "info", text: "Task started" },
          { type: "error", text: `Block reported: ${task.blockReason}` },
          { type: "error", text: "Task marked as BLOCKED" },
        ]
      : task.status === "COMPLETED"
        ? [
            { type: "info", text: "Task started" },
            { type: "success", text: "Task completed successfully" },
            ...(result
              ? [
                  {
                    type: "success",
                    text: `Rows processed: ${result.rows_processed ?? "—"}`,
                  },
                  {
                    type: "success",
                    text: `Duration: ${((result.duration_ms ?? 0) / 1000).toFixed(1)}s`,
                  },
                ]
              : []),
          ]
        : task.status === "IN_PROGRESS"
          ? [{ type: "info", text: "Task in progress..." }]
          : [{ type: "info", text: "Waiting to start" }];

  return (
    <div>
      <div className="bg-surface-secondary rounded-md font-mono text-xs overflow-y-auto max-h-48">
        {logLines.map((l, i) => (
          <div
            key={i}
            className={`px-3 py-1.5 border-b border-border last:border-b-0 ${
              l.type === "error"
                ? "text-danger-text"
                : l.type === "success"
                  ? "text-success-text"
                  : "text-text-secondary"
            }`}
          >
            {l.text}
          </div>
        ))}
      </div>
      {result && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-surface-secondary rounded p-2 text-center">
            <p className="text-xs text-text-tertiary">Rows processed</p>
            <p className="text-sm font-semibold text-success-text">
              {result.rows_processed ?? "—"}
            </p>
          </div>
          <div className="bg-surface-secondary rounded p-2 text-center">
            <p className="text-xs text-text-tertiary">Rows failed</p>
            <p className="text-sm font-semibold text-danger-text">
              {result.rows_failed ?? "—"}
            </p>
          </div>
          <div className="bg-surface-secondary rounded p-2 text-center">
            <p className="text-xs text-text-tertiary">Duration</p>
            <p className="text-sm font-semibold text-text-primary">
              {result.duration_ms
                ? `${(result.duration_ms / 1000).toFixed(1)}s`
                : "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTab({ task }: { task: Task }) {
  const events = [
    task.blockedAt && {
      time: task.blockedAt,
      label: "Task blocked",
      desc: task.blockReason ?? "",
      color: "bg-danger-text",
    },
    task.completedAt && {
      time: task.completedAt,
      label: "Task completed",
      desc: "Completed successfully",
      color: "bg-success-text",
    },
    task.startedAt && {
      time: task.startedAt,
      label: "Task started",
      desc: "BPO started working",
      color: "bg-info-text",
    },
    task.assignedAt && {
      time: task.assignedAt,
      label: "Assigned to you",
      desc: "Task assigned by system",
      color: "bg-info-text",
    },
    {
      time: task.createdAt,
      label: "Task created",
      desc: `By ${task.createdBy?.name}`,
      color: "bg-text-tertiary",
    },
  ].filter(Boolean) as {
    time: string;
    label: string;
    desc: string;
    color: string;
  }[];

  return (
    <div className="space-y-0">
      {events.map((e, i) => (
        <div
          key={i}
          className="flex gap-3 py-2.5 border-b border-border last:border-b-0"
        >
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${e.color}`}
          />
          <div className="text-xs text-text-tertiary flex-shrink-0 w-32">
            {formatDateTime(e.time)}
          </div>
          <div>
            <p className="text-xs font-medium text-text-primary">{e.label}</p>
            <p className="text-[11px] text-text-secondary mt-0.5">{e.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentsTab({
  task,
  comment,
  onCommentChange,
  onSubmit,
  isPending,
}: {
  task: Task;
  comment: string;
  onCommentChange: (v: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  return (
    <div>
      {(!task.comments || task.comments.length === 0) && (
        <p className="text-center text-text-tertiary text-xs py-6">
          No comments yet
        </p>
      )}
      <div className="space-y-4 mb-4">
        {task.comments?.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            {c.user && (
              <Avatar
                name={c.user.name}
                size="sm"
                className="flex-shrink-0 mt-0.5"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-text-primary">
                  {c.user?.name}
                </span>
                <span className="text-[10px] text-text-tertiary">
                  {formatRelative(c.createdAt)}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {c.body}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-3 flex gap-2.5">
        <div
          className="w-6 h-6 rounded-full bg-info-bg flex items-center justify-center
                        text-[9px] font-medium text-info-text flex-shrink-0 mt-0.5"
        >
          Me
        </div>
        <div className="flex-1">
          <textarea
            className="input w-full h-14 resize-none"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
          />
          <button
            className="btn btn-primary btn-sm mt-1.5"
            disabled={!comment.trim() || isPending}
            onClick={onSubmit}
          >
            {isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
