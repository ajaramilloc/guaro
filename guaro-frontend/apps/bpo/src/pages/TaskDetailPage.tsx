import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { mockTasks } from "@guaro/mock-data";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateTime, formatRelative } from "@guaro/utils";
import {
  ChevronRight,
  AlertTriangle,
  GitBranch,
  FileText,
  Clock,
  MessageSquare,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react";

type Tab = "workflow" | "log" | "history" | "comments";
type ActionState = "idle" | "running" | "blocking" | "done";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("workflow");
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [progress, setProgress] = useState(0);
  const [blockReason, setBlockReason] = useState("");
  const [comment, setComment] = useState("");
  const [localComments, setLocalComments] = useState<
    { name: string; text: string; time: string }[]
  >([]);

  const task = mockTasks.find((t) => t.id === id);

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el)
      el.textContent = task
        ? `${task.taskType?.name} — ${task.brand?.name}`
        : "Task detail";

    if (task?.status === "BLOCKED") setActionState("blocking");
    if (task?.status === "IN_PROGRESS") setActionState("running");
  }, [task]);

  if (!task) {
    return (
      <div className="p-5 text-center text-text-tertiary">Task not found</div>
    );
  }

  const isBlocked = task.status === "BLOCKED" || actionState === "blocking";
  const isAuto = task.taskType?.executionMode === "AUTOMATED";

  function startTask() {
    setActionState("running");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setActionState("done");
          return 100;
        }
        return p + Math.random() * 8 + 3;
      });
    }, 300);
  }

  function confirmBlock() {
    if (!blockReason.trim()) return;
    setActionState("blocking");
  }

  function sendComment() {
    if (!comment.trim()) return;
    setLocalComments((c) => [
      ...c,
      {
        name: "Carlos P.",
        text: comment,
        time: "Just now",
      },
    ]);
    setComment("");
  }

  const allComments = [
    ...(task.comments ?? []),
    ...localComments.map((c, i) => ({
      id: `local-${i}`,
      taskId: task.id,
      userId: "local",
      user: {
        id: "local",
        email: "",
        name: c.name,
        role: "BPO" as const,
        team: "CATALOG" as const,
        isActive: true,
        createdAt: "",
      },
      body: c.text,
      createdAt: c.time,
    })),
  ];

  return (
    <div className="p-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-4">
        <Link to="/" className="hover:text-text-secondary transition-colors">
          My tasks
        </Link>
        <ChevronRight size={12} />
        <span className="text-text-primary font-medium">
          {task.taskType?.name} — {task.brand?.name}
        </span>
      </div>

      {/* Blocked banner */}
      {isBlocked && task.blockReason && (
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
              Task blocked
            </p>
            <p className="text-xs text-danger-text/80">{task.blockReason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[1fr_180px] gap-4">
        {/* Left — tabs */}
        <div className="space-y-4">
          {/* Header */}
          <div className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-sm font-semibold text-text-primary">
                    {task.taskType?.name}
                  </h2>
                  <Badge
                    status={actionState === "done" ? "COMPLETED" : task.status}
                  />
                  {task.taskType && (
                    <Badge status={task.taskType.executionMode} />
                  )}
                </div>
                <p className="text-xs text-text-secondary">
                  {task.brand?.name} · {task.taskType?.section?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-text-tertiary">
                  Assigned {formatRelative(task.createdAt)}
                </p>
                <p className="text-[11px] text-text-tertiary mt-0.5">
                  Weight: {task.taskType?.estimatedWeight}
                </p>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-0">
              <InfoRow label="Brand" value={task.brand?.name} />
              <InfoRow
                label="Application"
                value={
                  task.brand?.applications?.[0]?.application?.appName ?? "—"
                }
                mono
              />
              <InfoRow label="Stores scope" value="All stores" />
              {task.inputType !== "NONE" && (
                <InfoRow
                  label="Data file"
                  value={task.inputValue ?? "—"}
                  mono
                  highlight
                />
              )}
            </div>

            {task.formData &&
              (task.formData as Record<string, string>).notes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[11px] text-text-secondary mb-1">
                    Notes from requester
                  </p>
                  <p className="text-xs text-text-primary bg-surface-secondary rounded px-3 py-2">
                    {(task.formData as Record<string, string>).notes}
                  </p>
                </div>
              )}
          </div>

          {/* Tabs */}
          <div className="card overflow-hidden">
            <div className="flex border-b border-border px-4">
              {(
                [
                  { id: "workflow", icon: GitBranch, label: "Workflow" },
                  { id: "log", icon: FileText, label: "Log" },
                  { id: "history", icon: Clock, label: "History" },
                  {
                    id: "comments",
                    icon: MessageSquare,
                    label: `Comments${allComments.length ? ` (${allComments.length})` : ""}`,
                  },
                ] as { id: Tab; icon: typeof GitBranch; label: string }[]
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
              {tab === "workflow" && (
                <WorkflowTab
                  task={task}
                  actionState={actionState}
                  progress={progress}
                />
              )}
              {tab === "log" && (
                <LogTab task={task} actionState={actionState} />
              )}
              {tab === "history" && <HistoryTab task={task} />}
              {tab === "comments" && (
                <CommentsTab
                  comments={allComments}
                  comment={comment}
                  onCommentChange={setComment}
                  onSend={sendComment}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right — actions */}
        <div className="space-y-3">
          {/* Action panel */}
          <div className="card p-3">
            <p className="section-label mb-3">Actions</p>

            {/* Idle */}
            {actionState === "idle" && (
              <div className="space-y-2">
                <button
                  className="btn btn-primary btn-sm w-full"
                  onClick={startTask}
                >
                  <Play size={13} />
                  Start task
                </button>
                <button
                  className="btn btn-danger btn-sm w-full"
                  onClick={() => setActionState("blocking")}
                >
                  <AlertTriangle size={13} />
                  Report block
                </button>
              </div>
            )}

            {/* Running */}
            {actionState === "running" && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-text-secondary">Progress</span>
                    <span className="font-medium text-text-primary">
                      {Math.min(100, Math.round(progress))}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-info-text rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-text-tertiary text-center">
                  Worker running...
                </p>
                <button
                  className="btn btn-danger btn-sm w-full"
                  onClick={() => setActionState("blocking")}
                >
                  <AlertTriangle size={13} />
                  Report block
                </button>
              </div>
            )}

            {/* Blocking */}
            {actionState === "blocking" && (
              <div className="space-y-2">
                <p className="text-[11px] text-text-secondary mb-1">
                  Describe the issue
                </p>
                <textarea
                  className="input textarea w-full h-20 text-xs"
                  placeholder="What's blocking this task?"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
                <button
                  className="btn btn-danger btn-sm w-full"
                  disabled={!blockReason.trim()}
                  onClick={confirmBlock}
                >
                  Confirm block
                </button>
                <button
                  className="btn btn-ghost btn-sm w-full"
                  onClick={() => setActionState("idle")}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Done */}
            {actionState === "done" && (
              <div className="text-center py-2 space-y-2">
                <CheckCircle size={28} className="mx-auto text-success-text" />
                <p className="text-xs font-medium text-text-primary">
                  Task completed
                </p>
                <p className="text-[11px] text-text-tertiary">
                  {task.result?.rows_processed ?? 295} rows processed
                </p>
                <button
                  className="btn btn-secondary btn-sm w-full"
                  onClick={() => navigate("/")}
                >
                  Back to tasks
                </button>
              </div>
            )}
          </div>

          {/* Data file */}
          {task.inputType !== "NONE" && (
            <div className="card p-3">
              <p className="section-label mb-2">Data file</p>
              <p className="text-[11px] text-info-text font-mono break-all cursor-pointer hover:underline">
                {task.inputValue}
              </p>
              <p className="text-[10px] text-text-tertiary mt-1">
                Uploaded by {task.createdBy?.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border last:border-b-0">
      <span className="text-xs text-text-secondary">{label}</span>
      <span
        className={`text-xs font-medium truncate max-w-[180px] ${
          mono ? "font-mono text-[11px]" : ""
        } ${highlight ? "text-info-text" : "text-text-primary"}`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function WorkflowTab({
  task,
  actionState,
  progress,
}: {
  task: (typeof mockTasks)[0];
  actionState: ActionState;
  progress: number;
}) {
  const isDone = actionState === "done";
  const isRunning = actionState === "running";
  const isBlocked = actionState === "blocking" || task.status === "BLOCKED";

  const nodes = [
    { label: "Read file", status: "done", sub: "File loaded" },
    {
      label: "Validate rows",
      status: "done",
      sub: isBlocked ? "47 errors found" : "All valid",
    },
    {
      label: "Upload via API",
      status: isBlocked
        ? "blocked"
        : isDone
          ? "done"
          : isRunning
            ? "active"
            : "pending",
      sub: isBlocked
        ? "Blocked"
        : isDone
          ? "Success"
          : isRunning
            ? `${Math.round(progress)}%`
            : "Pending",
    },
    {
      label: "Notify result",
      status: isDone ? "done" : "pending",
      sub: isDone ? "Webhook sent" : "Pending",
    },
  ];

  return (
    <div className="flex flex-col items-center gap-0 py-2">
      {nodes.map((node, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className={`px-4 py-2 rounded-md border text-xs text-center min-w-[160px] ${
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
  actionState,
}: {
  task: (typeof mockTasks)[0];
  actionState: ActionState;
}) {
  const lines = [
    { type: "info", text: "Worker initialized" },
    { type: "success", text: `File loaded: ${task.inputValue}` },
    { type: "info", text: "Validating schema..." },
    ...(task.status === "BLOCKED"
      ? [
          { type: "error", text: "ERROR: 47 rows missing columns" },
          { type: "error", text: "Worker paused — BLOCKED" },
        ]
      : actionState === "done"
        ? [
            { type: "success", text: "Validation passed" },
            { type: "success", text: "Upload complete" },
            { type: "success", text: "Webhook sent · COMPLETED" },
          ]
        : [{ type: "info", text: "Awaiting BPO start signal..." }]),
  ];

  return (
    <div className="bg-surface-secondary rounded-md font-mono text-xs overflow-y-auto max-h-48">
      {lines.map((l, i) => (
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
  );
}

function HistoryTab({ task }: { task: (typeof mockTasks)[0] }) {
  const events = [
    task.blockedAt && {
      time: task.blockedAt,
      label: "Task blocked",
      desc: task.blockReason ?? "",
      color: "bg-danger-text",
    },
    task.startedAt && {
      time: task.startedAt,
      label: "Worker started",
      desc: `Input: ${task.inputValue}`,
      color: "bg-info-text",
    },
    task.assignedAt && {
      time: task.assignedAt,
      label: "Assigned to you",
      desc: "Weight balanced assignment",
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
          <div className="text-xs text-text-tertiary flex-shrink-0 w-28">
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
  comments,
  comment,
  onCommentChange,
  onSend,
}: {
  comments: {
    id: string;
    user?: { name: string } | null;
    body: string;
    createdAt: string;
  }[];
  comment: string;
  onCommentChange: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <div>
      {comments.length === 0 && (
        <p className="text-center text-text-tertiary text-xs py-6">
          No comments yet
        </p>
      )}
      <div className="space-y-4 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <Avatar
              name={c.user?.name ?? "Unknown"}
              size="sm"
              className="flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-text-primary">
                  {c.user?.name}
                </span>
                <span className="text-[10px] text-text-tertiary">
                  {c.createdAt.includes("T")
                    ? formatRelative(c.createdAt)
                    : c.createdAt}
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
        <Avatar name="Carlos P." size="sm" className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <textarea
            className="input textarea w-full h-14"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
          />
          <button
            className="btn btn-primary btn-sm mt-1.5"
            disabled={!comment.trim()}
            onClick={onSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
