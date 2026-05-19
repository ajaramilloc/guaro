import { useState, useEffect } from "react";
import { mockUsers, mockTasks } from "@guaro/mock-data";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { TEAM_LABELS } from "@guaro/utils";
import { Search, Plus, X, ChevronDown, ChevronRight } from "lucide-react";

export function BpoWorkloadPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "BPO workload";
  }, []);

  const bpoUsers = mockUsers.filter((u) => u.role === "BPO");

  const filtered = bpoUsers.filter((u) => {
    const q = search.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q)) return false;
    const profile = u.bpoProfile;
    if (!profile) return false;
    const pct = Math.round((profile.activeWeight / profile.maxWeight) * 100);
    if (statusFilter === "full" && pct < 100) return false;
    if (statusFilter === "warn" && (pct < 70 || pct >= 100)) return false;
    if (statusFilter === "ok" && pct >= 70) return false;
    return true;
  });

  const atCapacity = bpoUsers.filter(
    (u) => u.bpoProfile && u.bpoProfile.activeWeight >= u.bpoProfile.maxWeight,
  ).length;
  const nearFull = bpoUsers.filter(
    (u) =>
      u.bpoProfile &&
      u.bpoProfile.activeWeight >= u.bpoProfile.maxWeight * 0.8 &&
      u.bpoProfile.activeWeight < u.bpoProfile.maxWeight,
  ).length;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">
            BPO workload
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            {bpoUsers.length} BPOs active
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={13} />
          Add BPO
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <MetricCard label="Total BPOs" value={bpoUsers.length} sub="active" />
        <MetricCard
          label="At capacity"
          value={atCapacity}
          sub="10/10 weight"
          danger={atCapacity > 0}
        />
        <MetricCard
          label="Near full"
          value={nearFull}
          sub="≥80% capacity"
          warn={nearFull > 0}
        />
        <MetricCard
          label="Available"
          value={bpoUsers.length - atCapacity - nearFull}
          sub="under 80%"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            className="input pl-7 w-44"
            placeholder="Search BPO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select w-32"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="full">At capacity</option>
          <option value="warn">Near full</option>
          <option value="ok">Available</option>
        </select>
        {(search || statusFilter) && (
          <button
            className="btn btn-ghost btn-sm text-text-secondary"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-text-tertiary">
          {filtered.length} BPO{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* BPO list */}
      <div className="space-y-2">
        {filtered.map((u) => {
          const profile = u.bpoProfile;
          if (!profile) return null;
          const pct = Math.round(
            (profile.activeWeight / profile.maxWeight) * 100,
          );
          const isExpanded = expandedId === u.id;
          const myTasks = mockTasks.filter(
            (t) =>
              t.assignedBpo?.userId === u.id &&
              !["COMPLETED", "CANCELLED"].includes(t.status),
          );

          return (
            <div
              key={u.id}
              className={`card overflow-hidden ${
                pct >= 100
                  ? "border-l-4 border-l-danger-text"
                  : pct >= 80
                    ? "border-l-4 border-l-warning-text"
                    : ""
              }`}
            >
              {/* BPO header row — clickeable */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3
                           hover:bg-surface-secondary transition-colors text-left"
                onClick={() => setExpandedId(isExpanded ? null : u.id)}
              >
                {isExpanded ? (
                  <ChevronDown
                    size={14}
                    className="text-text-tertiary flex-shrink-0"
                  />
                ) : (
                  <ChevronRight
                    size={14}
                    className="text-text-tertiary flex-shrink-0"
                  />
                )}
                <Avatar name={u.name} size="sm" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-text-primary">
                      {u.name}
                    </p>
                    <span className="text-[10px] text-text-tertiary">
                      {TEAM_LABELS[u.team]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 100
                            ? "bg-danger-text"
                            : pct >= 80
                              ? "bg-warning-text"
                              : "bg-info-text"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-medium ${
                        pct >= 100
                          ? "text-danger-text"
                          : pct >= 80
                            ? "text-warning-text"
                            : "text-text-secondary"
                      }`}
                    >
                      {profile.activeWeight}/{profile.maxWeight}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`badge ${
                      pct >= 100
                        ? "badge-danger"
                        : pct >= 80
                          ? "badge-warning"
                          : myTasks.length === 0
                            ? "badge-neutral"
                            : "badge-info"
                    }`}
                  >
                    {pct >= 100
                      ? "At capacity"
                      : pct >= 80
                        ? "Near full"
                        : myTasks.length === 0
                          ? "Idle"
                          : "Available"}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {myTasks.length} task{myTasks.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </button>

              {/* Expanded tasks table */}
              {isExpanded && (
                <div className="border-t border-border">
                  {myTasks.length === 0 ? (
                    <div className="px-4 py-6 text-center text-text-tertiary text-xs">
                      No active tasks assigned
                    </div>
                  ) : (
                    <table className="table-base">
                      <thead>
                        <tr>
                          <th className="w-[24%]">Task</th>
                          <th className="w-[20%]">Brand</th>
                          <th className="w-[16%]">Section</th>
                          <th className="w-[10%]">Type</th>
                          <th className="w-[10%]">Weight</th>
                          <th className="w-[12%]">Status</th>
                          <th className="w-[8%]">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myTasks.map((t) => (
                          <tr key={t.id}>
                            <td className="font-medium text-xs">
                              {t.taskType?.name}
                            </td>
                            <td className="text-text-secondary text-xs">
                              {t.brand?.name}
                            </td>
                            <td className="text-text-secondary text-xs">
                              {t.taskType?.section?.name ?? "—"}
                            </td>
                            <td>
                              {t.taskType && (
                                <Badge status={t.taskType.executionMode} />
                              )}
                            </td>
                            <td>
                              <span className="text-xs text-text-secondary">
                                {t.taskType?.estimatedWeight ?? "—"}
                              </span>
                            </td>
                            <td>
                              <Badge status={t.status} />
                            </td>
                            <td className="text-text-tertiary text-xs">
                              {new Date(t.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-surface-secondary">
                          <td
                            colSpan={4}
                            className="px-3 py-2 text-xs text-text-tertiary"
                          >
                            Total active weight
                          </td>
                          <td className="px-3 py-2 text-xs font-medium text-text-primary">
                            {myTasks.reduce(
                              (s, t) => s + (t.taskType?.estimatedWeight ?? 0),
                              0,
                            )}
                            /{profile.maxWeight}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    </table>
                  )}

                  {/* Edit capacity row */}
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 border-t border-border
                                  bg-surface-secondary/50"
                  >
                    <span className="text-xs text-text-secondary">
                      Max capacity:
                    </span>
                    <input
                      type="number"
                      className="input w-16 text-xs"
                      defaultValue={profile.maxWeight}
                      min={1}
                      max={20}
                    />
                    <span className="text-xs text-text-secondary ml-2">
                      Modules:
                    </span>
                    <div className="flex gap-2">
                      {["Catalog", "Promos", "Merchant Performance"].map(
                        (m) => (
                          <label
                            key={m}
                            className="flex items-center gap-1 text-xs cursor-pointer"
                          >
                            <input type="checkbox" defaultChecked />
                            {m}
                          </label>
                        ),
                      )}
                    </div>
                    <button className="btn btn-primary btn-sm ml-auto">
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add BPO modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-modal w-80 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">
                Add BPO
              </h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={16} className="text-text-secondary" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Full name <span className="text-danger-text">*</span>
                </label>
                <input
                  className="input w-full"
                  placeholder="e.g. María García"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Email <span className="text-danger-text">*</span>
                </label>
                <input
                  className="input w-full"
                  placeholder="maria@didi-labs.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Max weight capacity
                </label>
                <input
                  type="number"
                  className="input w-full"
                  defaultValue={10}
                  min={1}
                  max={20}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Team
                </label>
                <select className="select w-full">
                  <option>Catalog</option>
                  <option>Merchant Performance</option>
                  <option>User Growth</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddModal(false)}
              >
                Add BPO
              </button>
            </div>
          </div>
        </div>
      )}
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
