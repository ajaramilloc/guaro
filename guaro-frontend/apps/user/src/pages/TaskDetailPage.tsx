import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { mockTasks } from "@guaro/mock-data";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateTime, formatRelative } from "@guaro/utils";
import {
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  X,
  MessageSquare,
  Clock,
  FileText,
  GitBranch,
} from "lucide-react";

type Tab = "workflow" | "log" | "history" | "comments";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("workflow");
  const [comment, setComment] = useState("");

  const task = mockTasks.find((t) => t.id === id);

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el)
      el.textContent = task
        ? `${task.taskType?.name} — ${task.brand?.name}`
        : "Task detail";
  }, [task]);

  if (!task) {
    return (
      <div className="p-5 text-center text-text-tertiary">Task not found</div>
    );
  }

  const isBlocked = task.status === "BLOCKED";
  const isAuto = task.taskType?.executionMode === "AUTOMATED";
  const bpoUser = task.assignedBpo?.user;

  return (
    <div className="p-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-4">
        <Link
          to="/tasks"
          className="hover:text-text-secondary transition-colors"
        >
          My tasks
        </Link>
        <ChevronRight size={12} />
        <span className="text-text-primary font-medium">
          {task.taskType?.name} — {task.brand?.name}
        </span>
      </div>

      {/* Blocked banner */}
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
              Task blocked by BPO
            </p>
            <p className="text-xs text-danger-text/80">{task.blockReason}</p>
          </div>
        </div>
      )}

      {/* Header */}
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
              Created {formatRelative(task.createdAt)}
            </p>
            {isBlocked && (
              <p className="text-[11px] text-danger-text font-medium mt-0.5">
                ETA: Overdue
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8">
          <div className="space-y-0">
            <InfoRow
              label="BPO assigned"
              value={
                bpoUser ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={bpoUser.name} size="xs" />
                    <span>{bpoUser.name}</span>
                  </div>
                ) : (
                  <span className="text-text-tertiary">Auto (no BPO)</span>
                )
              }
            />
            <InfoRow label="Brand" value={<span>{task.brand?.name}</span>} />
            <InfoRow label="Stores scope" value={<span>All stores</span>} />
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
                  <span className="text-info-text text-[11px] font-mono truncate max-w-[200px]">
                    {task.inputValue}
                  </span>
                )
              }
            />
            <InfoRow
              label="Section"
              value={<span>{task.taskType?.section?.name}</span>}
            />
          </div>
        </div>

        {task.formData && (task.formData as Record<string, string>).notes && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[11px] text-text-secondary mb-1">
              Notes from user
            </p>
            <p className="text-xs text-text-primary bg-surface-secondary rounded px-3 py-2">
              {(task.formData as Record<string, string>).notes}
            </p>
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
          {tab === "workflow" && <WorkflowTab task={task} />}
          {tab === "log" && <LogTab task={task} />}
          {tab === "history" && <HistoryTab task={task} />}
          {tab === "comments" && (
            <CommentsTab
              task={task}
              comment={comment}
              onCommentChange={setComment}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate("/tasks")}
        >
          ← Back to tasks
        </button>
        <div className="flex gap-2">
          {isBlocked && isAuto && (
            <button className="btn btn-primary btn-sm">
              <RefreshCw size={13} />
              Upload new file & retry
            </button>
          )}
          <button className="btn btn-danger btn-sm">
            <X size={13} />
            Cancel task
          </button>
        </div>
      </div>
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

function WorkflowTab({ task }: { task: (typeof mockTasks)[0] }) {
  const isAuto = task.taskType?.executionMode !== "MANUAL";

  const nodes = isAuto
    ? [
        { label: "Read sheet", status: "done", sub: "File loaded" },
        {
          label: "Validate rows",
          status: "done",
          sub: task.status === "BLOCKED" ? "47 errors found" : "All valid",
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
        {
          label: "Assigned to BPO",
          status: "done",
          sub: task.assignedBpo?.user?.name ?? "Auto",
        },
        {
          label: "BPO executes",
          status: task.status === "COMPLETED" ? "done" : "active",
          sub: task.status === "COMPLETED" ? "Done" : "In progress",
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

function LogTab({ task }: { task: (typeof mockTasks)[0] }) {
  const logLines =
    task.status === "BLOCKED"
      ? [
          { type: "info", text: "Starting worker..." },
          { type: "success", text: `File downloaded: ${task.inputValue}` },
          { type: "info", text: "Validating schema..." },
          {
            type: "error",
            text: "ERROR: 47 rows missing columns: sku, precio_promo",
          },
          { type: "error", text: "Worker paused — task marked as BLOCKED" },
        ]
      : task.status === "COMPLETED"
        ? [
            { type: "info", text: "Starting worker..." },
            { type: "success", text: `File downloaded: ${task.inputValue}` },
            {
              type: "success",
              text: `Validation passed: ${task.result?.rows_processed ?? 0} rows`,
            },
            { type: "success", text: "Upload complete" },
            { type: "success", text: "Webhook sent · Task COMPLETED" },
          ]
        : [{ type: "info", text: "Worker queued — waiting to start" }];

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
      {task.result && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-surface-secondary rounded p-2 text-center">
            <p className="text-xs text-text-tertiary">Rows processed</p>
            <p className="text-sm font-semibold text-success-text">
              {task.result.rows_processed}
            </p>
          </div>
          <div className="bg-surface-secondary rounded p-2 text-center">
            <p className="text-xs text-text-tertiary">Rows failed</p>
            <p className="text-sm font-semibold text-danger-text">
              {task.result.rows_failed}
            </p>
          </div>
          <div className="bg-surface-secondary rounded p-2 text-center">
            <p className="text-xs text-text-tertiary">Duration</p>
            <p className="text-sm font-semibold text-text-primary">
              {((task.result.duration_ms ?? 0) / 1000).toFixed(1)}s
            </p>
          </div>
        </div>
      )}
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
      label: "Task assigned",
      desc: `Assigned to ${task.assignedBpo?.user?.name ?? "worker"}`,
      color: "bg-info-text",
    },
    {
      time: task.createdAt,
      label: "Task created",
      desc: `Created by ${task.createdBy?.name}`,
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
}: {
  task: (typeof mockTasks)[0];
  comment: string;
  onCommentChange: (v: string) => void;
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
          JR
        </div>
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
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
