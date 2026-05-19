import { useState, useEffect } from "react";
import { mockWebhooks, mockSections, mockModules } from "@guaro/mock-data";
import { Plus, X, Eye, EyeOff, Send } from "lucide-react";
import type { SectionWebhook } from "@guaro/types";

type Tab = "config" | "events" | "log";

const MOCK_LOGS = [
  {
    id: "l1",
    time: "10:42:01",
    status: "ok",
    code: 200,
    event: "task.completed",
    payload: '{"task":"Upload catalog","brand":"Cencosud CO"}',
  },
  {
    id: "l2",
    time: "10:38:14",
    status: "ok",
    code: 200,
    event: "task.completed",
    payload: '{"task":"Update prices","brand":"Chedraui"}',
  },
  {
    id: "l3",
    time: "09:55:07",
    status: "err",
    code: 503,
    event: "task.blocked",
    payload: '{"error":"Service Unavailable"}',
  },
  {
    id: "l4",
    time: "09:40:22",
    status: "ok",
    code: 200,
    event: "task.created",
    payload: '{"task":"Upload promos","brand":"Éxito"}',
  },
];

export function WebhooksPage() {
  const [selected, setSelected] = useState<SectionWebhook | null>(
    mockWebhooks[0] ?? null,
  );
  const [tab, setTab] = useState<Tab>("config");
  const [showSecret, setShowSecret] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "err" | null>(null);

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "Webhooks";
  }, []);

  function getSectionName(sectionId?: string | null) {
    if (!sectionId) return "—";
    const sec = mockSections.find((s) => s.id === sectionId);
    const mod = mockModules.find((m) => m.id === sec?.moduleId);
    return sec ? `${mod?.name} · ${sec.name}` : "—";
  }

  function sendTest() {
    setTestResult(null);
    setTimeout(() => setTestResult("ok"), 800);
    setTimeout(() => setTestResult(null), 3500);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel */}
      <div className="w-56 flex-shrink-0 border-r border-border flex flex-col bg-white">
        <div className="flex items-center justify-between px-3 py-3 border-b border-border">
          <p className="section-label">Endpoints</p>
          <span className="text-[10px] text-text-tertiary">
            {mockWebhooks.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {mockWebhooks.map((wh) => (
            <button
              key={wh.id}
              onClick={() => {
                setSelected(wh);
                setTab("config");
              }}
              className={`w-full text-left px-3 py-2.5 hover:bg-surface-secondary
                          transition-colors ${
                            selected?.id === wh.id
                              ? "bg-surface-secondary border-l-2 border-l-accent"
                              : ""
                          }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    wh.isActive ? "bg-success-text" : "bg-danger-text"
                  }`}
                />
                <p
                  className={`text-xs font-medium truncate ${
                    selected?.id === wh.id
                      ? "text-text-primary"
                      : "text-text-secondary"
                  }`}
                >
                  {wh.name}
                </p>
              </div>
              <p className="text-[10px] text-text-tertiary truncate pl-3">
                {getSectionName(wh.sectionId)}
              </p>
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-border">
          <button
            className="btn btn-secondary btn-sm w-full"
            onClick={() => setShowAdd(true)}
          >
            <Plus size={12} />
            New webhook
          </button>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-text-tertiary text-sm">
            Select a webhook to configure
          </div>
        ) : (
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    selected.isActive ? "bg-success-text" : "bg-danger-text"
                  }`}
                />
                <h2 className="text-sm font-semibold text-text-primary">
                  {selected.name}
                </h2>
                <span
                  className={`badge ${
                    selected.isActive ? "badge-success" : "badge-danger"
                  }`}
                >
                  {selected.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" onClick={sendTest}>
                  <Send size={12} />
                  Send test
                </button>
                <button className="btn btn-primary btn-sm">Save</button>
              </div>
            </div>

            {/* Test result */}
            {testResult && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-md mb-4 text-xs font-medium ${
                  testResult === "ok"
                    ? "bg-success-bg text-success-text border border-success-border"
                    : "bg-danger-bg text-danger-text border border-danger-border"
                }`}
              >
                {testResult === "ok"
                  ? "✓ Test delivered successfully · HTTP 200 · 142ms"
                  : "✗ Delivery failed · HTTP 503"}
              </div>
            )}

            {/* Tabs */}
            <div className="card overflow-hidden">
              <div className="flex border-b border-border px-4">
                {(["config", "events", "log"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-2.5 text-xs font-medium border-b-2
                                transition-colors -mb-px capitalize ${
                                  tab === t
                                    ? "border-accent text-text-primary"
                                    : "border-transparent text-text-secondary hover:text-text-primary"
                                }`}
                  >
                    {t === "log"
                      ? "Delivery log"
                      : t === "config"
                        ? "Configuration"
                        : "Events"}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {/* CONFIG TAB */}
                {tab === "config" && (
                  <div className="space-y-3 max-w-lg">
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1.5">
                        Webhook name
                      </label>
                      <input
                        className="input w-full"
                        defaultValue={selected.name}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1.5">
                        Endpoint URL
                      </label>
                      <input
                        className="input w-full font-mono text-xs"
                        defaultValue={selected.url}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1.5">
                        Section scope
                        <span className="text-text-tertiary font-normal ml-1">
                          — select one or more
                        </span>
                      </label>
                      <div className="border border-border rounded-md divide-y divide-border">
                        <label className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-surface-secondary">
                          <input
                            type="checkbox"
                            defaultChecked={!selected.sectionId}
                          />
                          <span className="text-xs text-text-primary font-medium">
                            All sections
                          </span>
                        </label>
                        {mockSections.map((s) => {
                          const mod = mockModules.find(
                            (m) => m.id === s.moduleId,
                          );
                          return (
                            <label
                              key={s.id}
                              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-surface-secondary"
                            >
                              <input
                                type="checkbox"
                                defaultChecked={selected.sectionId === s.id}
                              />
                              <div>
                                <p className="text-xs text-text-primary">
                                  {s.name}
                                </p>
                                <p className="text-[10px] text-text-tertiary">
                                  {mod?.name}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-text-secondary block mb-1.5">
                          Retry policy
                        </label>
                        <select className="select w-full">
                          <option>3 retries · exponential backoff</option>
                          <option>1 retry · immediate</option>
                          <option>No retry</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-secondary block mb-1.5">
                          Status
                        </label>
                        <select
                          className="select w-full"
                          defaultValue={
                            selected.isActive ? "active" : "inactive"
                          }
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="bg-surface-secondary rounded-md p-2.5 text-center">
                        <p className="text-[10px] text-text-tertiary">
                          Last delivery
                        </p>
                        <p className="text-xs font-medium text-text-primary mt-0.5">
                          2 min ago
                        </p>
                      </div>
                      <div className="bg-surface-secondary rounded-md p-2.5 text-center">
                        <p className="text-[10px] text-text-tertiary">
                          Success rate
                        </p>
                        <p className="text-xs font-medium text-success-text mt-0.5">
                          97%
                        </p>
                      </div>
                      <div className="bg-surface-secondary rounded-md p-2.5 text-center">
                        <p className="text-[10px] text-text-tertiary">
                          Retries today
                        </p>
                        <p className="text-xs font-medium text-text-primary mt-0.5">
                          1
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* EVENTS TAB */}
                {tab === "events" && (
                  <div className="max-w-lg">
                    <p className="text-xs text-text-secondary mb-3">
                      Select which events trigger this webhook.
                    </p>
                    <div className="space-y-3 mb-5">
                      {[
                        {
                          key: "TASK_CREATED",
                          label: "task.created",
                          desc: "Task successfully created by a user",
                        },
                        {
                          key: "TASK_COMPLETED",
                          label: "task.completed",
                          desc: "Task completed by BPO or worker",
                        },
                        {
                          key: "TASK_FAILED",
                          label: "task.failed",
                          desc: "Automated worker failed after all retries",
                        },
                        {
                          key: "TASK_BLOCKED",
                          label: "task.blocked",
                          desc: "BPO reported a block — needs attention",
                        },
                      ].map((ev) => (
                        <label
                          key={ev.key}
                          className="flex items-start gap-2.5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            defaultChecked={[
                              "TASK_COMPLETED",
                              "TASK_BLOCKED",
                              "TASK_FAILED",
                            ].includes(ev.key)}
                          />
                          <div>
                            <p className="text-xs font-medium text-text-primary">
                              {ev.label}
                            </p>
                            <p className="text-[10px] text-text-tertiary">
                              {ev.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Payload preview */}
                    <div>
                      <p className="text-xs font-medium text-text-secondary mb-2">
                        Payload preview
                      </p>
                      <div
                        className="bg-surface-secondary rounded-md p-3 font-mono text-[11px]
                                      text-text-secondary leading-relaxed"
                      >
                        {`{`}
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-purple-text">"event"</span>
                        {`: "task.completed",`}
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-purple-text">"task_id"</span>
                        {`: "uuid-...",`}
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-purple-text">"task_type"</span>
                        {`: "Upload catalog",`}
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-purple-text">"brand"</span>
                        {`: "Cencosud CO",`}
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-purple-text">"country"</span>
                        {`: "CO",`}
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-purple-text">"bpo"</span>
                        {`: "carlos",`}
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-purple-text">"requester"</span>
                        {`: "juan",`}
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-purple-text">"completed_at"</span>
                        {`: "2026-05-15T10:42:01Z"`}
                        <br />
                        {`}`}
                      </div>
                    </div>
                  </div>
                )}

                {/* LOG TAB */}
                {tab === "log" && (
                  <div>
                    <div className="divide-y divide-border">
                      {MOCK_LOGS.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-start gap-3 py-2.5"
                        >
                          <span className="text-[11px] text-text-tertiary font-mono flex-shrink-0 w-16">
                            {l.time}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className={`text-[11px] font-medium font-mono ${
                                  l.status === "ok"
                                    ? "text-success-text"
                                    : "text-danger-text"
                                }`}
                              >
                                HTTP {l.code}
                              </span>
                              <span className="text-[11px] text-text-secondary">
                                {l.event}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-tertiary font-mono truncate">
                              {l.payload}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add webhook modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-modal w-96 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">
                New webhook
              </h3>
              <button onClick={() => setShowAdd(false)}>
                <X size={16} className="text-text-secondary" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Name <span className="text-danger-text">*</span>
                </label>
                <input
                  className="input w-full"
                  placeholder="e.g. Colombia ops"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Endpoint URL <span className="text-danger-text">*</span>
                </label>
                <input
                  className="input w-full font-mono text-xs"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Section scope
                </label>
                <div className="border border-border rounded-md divide-y divide-border max-h-40 overflow-y-auto">
                  <label className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-surface-secondary">
                    <input type="checkbox" />
                    <span className="text-xs text-text-primary font-medium">
                      All sections
                    </span>
                  </label>
                  {mockSections.map((s) => {
                    const mod = mockModules.find((m) => m.id === s.moduleId);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-surface-secondary"
                      >
                        <input type="checkbox" />
                        <div>
                          <p className="text-xs text-text-primary">{s.name}</p>
                          <p className="text-[10px] text-text-tertiary">
                            {mod?.name}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Retry policy
                </label>
                <select className="select w-full">
                  <option>3 retries · exponential backoff</option>
                  <option>1 retry · immediate</option>
                  <option>No retry</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAdd(false)}
              >
                Create webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
