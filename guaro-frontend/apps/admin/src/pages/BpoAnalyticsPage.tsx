import { useState, useEffect } from "react";
import { mockUsers, mockTasks } from "@guaro/mock-data";
import { Avatar } from "@/components/ui/Avatar";
import { TEAM_LABELS } from "@guaro/utils";
import { Download } from "lucide-react";

type SortKey = "completed" | "ontime" | "avg" | "occupation";

const MOCK_ANALYTICS = [
  {
    userId: "user-bpo-1",
    completed: 57,
    ontime: 78,
    avgMs: 5400000,
    occupation: 95,
    blocked: 7,
  },
  {
    userId: "user-bpo-2",
    completed: 61,
    ontime: 89,
    avgMs: 4320000,
    occupation: 91,
    blocked: 3,
  },
  {
    userId: "user-bpo-3",
    completed: 38,
    ontime: 87,
    avgMs: 5040000,
    occupation: 65,
    blocked: 1,
  },
];

export function BpoAnalyticsPage() {
  const [period, setPeriod] = useState<"month" | "quarter">("month");
  const [sortKey, setSortKey] = useState<SortKey>("completed");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [moduleFilter, setModuleFilter] = useState("");

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "BPO analytics";
  }, []);

  const bpoUsers = mockUsers.filter((u) => u.role === "BPO");

  const rows = MOCK_ANALYTICS.map((a) => {
    const user = bpoUsers.find((u) => u.id === a.userId);
    return { ...a, user };
  }).filter((r) => r.user);

  const sorted = [...rows].sort((a, b) => {
    if (sortKey === "completed") return (b.completed - a.completed) * sortDir;
    if (sortKey === "ontime") return (b.ontime - a.ontime) * sortDir;
    if (sortKey === "avg") return (b.avgMs - a.avgMs) * sortDir;
    if (sortKey === "occupation")
      return (b.occupation - a.occupation) * sortDir;
    return 0;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1) as 1 | -1);
    else {
      setSortKey(key);
      setSortDir(-1);
    }
  }

  const totalCompleted = rows.reduce((s, r) => s + r.completed, 0);
  const avgOntime = Math.round(
    rows.reduce((s, r) => s + r.ontime, 0) / rows.length,
  );
  const avgDuration = rows.reduce((s, r) => s + r.avgMs, 0) / rows.length;
  const avgOccupation = Math.round(
    rows.reduce((s, r) => s + r.occupation, 0) / rows.length,
  );

  // Daily chart data (mock)
  const dailyData = Array.from({ length: 15 }, (_, i) => ({
    day: i + 1,
    auto: Math.floor(Math.random() * 15) + 10,
    manual: Math.floor(Math.random() * 8) + 4,
  }));
  const maxVal = Math.max(...dailyData.map((d) => d.auto + d.manual));

  // Task type avg times (mock)
  const taskTypeData = [
    { name: "Upload catalog", avg: 0.4, type: "AUTOMATED" },
    { name: "Update prices", avg: 0.6, type: "AUTOMATED" },
    { name: "Upload promos", avg: 0.7, type: "AUTOMATED" },
    { name: "Update business hours", avg: 0.5, type: "AUTOMATED" },
    { name: "Create brand", avg: 2.4, type: "HYBRID" },
  ];
  const maxAvg = Math.max(...taskTypeData.map((t) => t.avg));

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">
            BPO analytics
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            Performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="select w-32"
            value={period}
            onChange={(e) => setPeriod(e.target.value as "month" | "quarter")}
          >
            <option value="month">This month</option>
            <option value="quarter">This quarter</option>
          </select>
          <button className="btn btn-secondary btn-sm">
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <MetricCard
          label="Tasks completed"
          value={`${period === "quarter" ? totalCompleted * 3 : totalCompleted}`}
          sub={`${bpoUsers.length} BPOs`}
        />
        <MetricCard
          label="On-time rate"
          value={`${avgOntime}%`}
          sub="team average"
          good={avgOntime >= 85}
        />
        <MetricCard
          label="Avg. time / task"
          value={`${(avgDuration / 3600000).toFixed(1)}h`}
          sub="excl. blocked time"
        />
        <MetricCard
          label="Avg. occupation"
          value={`${avgOccupation}%`}
          sub="active vs capacity"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Daily chart */}
        <div className="card p-4">
          <p className="text-xs font-medium text-text-primary mb-3">
            Tasks completed — daily
          </p>
          <div className="flex items-end gap-1 h-28">
            {dailyData.map((d, i) => {
              const autoH = Math.round((d.auto / maxVal) * 96);
              const manualH = Math.round((d.manual / maxVal) * 96);
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-0"
                >
                  <div className="w-full flex flex-col items-center">
                    <div
                      className="w-full bg-teal-bg rounded-t-sm"
                      style={{ height: `${manualH}px` }}
                    />
                    <div
                      className="w-full bg-info-text rounded-b-sm"
                      style={{ height: `${autoH}px` }}
                    />
                  </div>
                  <span className="text-[8px] text-text-tertiary mt-1">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-info-text" />
              <span className="text-[10px] text-text-secondary">Automated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-teal-bg border border-teal-border" />
              <span className="text-[10px] text-text-secondary">
                Manual / Hybrid
              </span>
            </div>
          </div>
        </div>

        {/* Avg time by task type */}
        <div className="card p-4">
          <p className="text-xs font-medium text-text-primary mb-3">
            Avg. time by task type
          </p>
          <div className="space-y-2.5">
            {taskTypeData.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-primary truncate max-w-[160px]">
                    {t.name}
                  </span>
                  <span className="text-xs font-medium text-text-primary flex-shrink-0 ml-2">
                    {t.avg}h
                  </span>
                </div>
                <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      t.type === "AUTOMATED" ? "bg-purple-text" : "bg-teal-text"
                    }`}
                    style={{ width: `${(t.avg / maxAvg) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-xs font-medium text-text-primary">
            BPO performance ranking
          </p>
        </div>
        <table className="table-base">
          <thead>
            <tr>
              <th className="w-[4%]">#</th>
              <th className="w-[24%]">BPO</th>
              <th
                className="w-[14%] cursor-pointer hover:text-text-primary"
                onClick={() => toggleSort("completed")}
              >
                Completed{" "}
                {sortKey === "completed" ? (sortDir === -1 ? "↓" : "↑") : ""}
              </th>
              <th
                className="w-[14%] cursor-pointer hover:text-text-primary"
                onClick={() => toggleSort("ontime")}
              >
                On-time{" "}
                {sortKey === "ontime" ? (sortDir === -1 ? "↓" : "↑") : ""}
              </th>
              <th
                className="w-[14%] cursor-pointer hover:text-text-primary"
                onClick={() => toggleSort("avg")}
              >
                Avg time {sortKey === "avg" ? (sortDir === -1 ? "↓" : "↑") : ""}
              </th>
              <th
                className="w-[14%] cursor-pointer hover:text-text-primary"
                onClick={() => toggleSort("occupation")}
              >
                Occupation{" "}
                {sortKey === "occupation" ? (sortDir === -1 ? "↓" : "↑") : ""}
              </th>
              <th className="w-[10%]">Blocked</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              if (!r.user) return null;
              const avgH = (r.avgMs / 3600000).toFixed(1);
              return (
                <tr key={r.userId}>
                  <td className="text-text-tertiary font-medium">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={r.user.name} size="xs" />
                      <span className="text-xs font-medium">{r.user.name}</span>
                    </div>
                  </td>
                  <td className="font-medium">
                    {period === "quarter" ? r.completed * 3 : r.completed}
                  </td>
                  <td
                    className={
                      r.ontime >= 90
                        ? "text-success-text font-medium"
                        : r.ontime >= 80
                          ? "text-warning-text font-medium"
                          : "text-danger-text font-medium"
                    }
                  >
                    {r.ontime}%
                  </td>
                  <td className="text-text-secondary">{avgH}h</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-surface-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            r.occupation >= 90
                              ? "bg-danger-text"
                              : r.occupation >= 70
                                ? "bg-warning-text"
                                : "bg-info-text"
                          }`}
                          style={{ width: `${r.occupation}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary flex-shrink-0">
                        {r.occupation}%
                      </span>
                    </div>
                  </td>
                  <td
                    className={
                      r.blocked > 4
                        ? "text-danger-text"
                        : r.blocked > 2
                          ? "text-warning-text"
                          : "text-text-secondary"
                    }
                  >
                    {r.blocked}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  good,
}: {
  label: string;
  value: string;
  sub: string;
  good?: boolean;
}) {
  return (
    <div className="bg-surface-secondary rounded-lg p-3">
      <p className="text-[11px] text-text-secondary mb-1">{label}</p>
      <p
        className={`text-xl font-semibold ${good ? "text-success-text" : "text-text-primary"}`}
      >
        {value}
      </p>
      <p className="text-[10px] text-text-tertiary mt-0.5">{sub}</p>
    </div>
  );
}
