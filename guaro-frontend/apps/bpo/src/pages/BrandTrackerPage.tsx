import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useBrand, useUpdateBrand } from "@/hooks/useBrands";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/store/auth";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  formatRelative,
  formatDate,
  getCountryFlag,
  PICKING_MODE_LABELS,
  PAYMENT_MODE_LABELS,
  MENU_METHOD_LABELS,
} from "@guaro/utils";
import { Plus, Search, Download, Edit, Save, X } from "lucide-react";
import type { Brand, Task } from "@guaro/types";

type Tab = "stores" | "tasks" | "notes";

export function BrandTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<Tab>("stores");
  const [storeSearch, setStoreSearch] = useState("");
  const [storeStatus, setStoreStatus] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");

  const bpoProfileId = (currentUser as any)?.bpoProfile?.id;

  const { data: brand, isLoading } = useBrand(id ?? "");
  const { data: brandTasksResponse } = useTasks({ brandId: id, limit: 50 });
  const brandTasks = brandTasksResponse?.data ?? [];
  const updateBrand = useUpdateBrand();

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = brand?.name ?? "Brand tracker";
  }, [brand]);

  useEffect(() => {
    if (brand?.notes) setNotes(brand.notes);
  }, [brand]);

  if (isLoading) {
    return (
      <div className="p-5 text-center text-text-tertiary text-xs">
        Loading...
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-5 text-center text-text-tertiary">Brand not found</div>
    );
  }

  const isMyBrand = brand.assignedOpId === bpoProfileId;
  const canEdit =
    isMyBrand ||
    (currentUser as any)?.role === "ADMIN" ||
    (currentUser as any)?.role === "SUPERADMIN";

  const brandStores = [
    ...(brand.stores ?? []),
    ...(brand.children?.flatMap((c: any) => c.stores ?? []) ?? []),
  ];

  const activeTasks = brandTasks.filter(
    (t) => !["COMPLETED", "CANCELLED"].includes(t.status),
  );
  const blockedTasks = brandTasks.filter((t) => t.status === "BLOCKED");
  const primaryApp = brand.applications?.find((a) => a.isPrimary)?.application;

  const filteredStores = brandStores.filter((s: any) => {
    if (
      storeSearch &&
      !s.name.toLowerCase().includes(storeSearch.toLowerCase()) &&
      !s.city?.toLowerCase().includes(storeSearch.toLowerCase())
    )
      return false;
    if (storeStatus === "active" && !s.isActive) return false;
    if (storeStatus === "inactive" && s.isActive) return false;
    return true;
  });

  async function saveNotes() {
    await updateBrand.mutateAsync({ id: brand!.id, data: { notes } });
    setEditingNotes(false);
  }

  function exportCSV() {
    const headers = [
      "Store name",
      "Shop ID",
      "App Shop ID",
      "City",
      "Address",
      "Status",
      "Active",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];
    const rows = brandStores.map((s: any) => [
      s.name,
      s.externalId ?? "",
      s.externalId ?? "",
      s.city ?? "",
      s.address ?? "",
      s.status ?? "",
      s.isActive ? "Yes" : "No",
      s.hoursMonday ?? "",
      s.hoursTuesday ?? "",
      s.hoursWednesday ?? "",
      s.hoursThursday ?? "",
      s.hoursFriday ?? "",
      s.hoursSaturday ?? "",
      s.hoursSunday ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brand.name.replace(/\s+/g, "_")}_stores.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-5">
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-4">
        <Link
          to="/brands"
          className="hover:text-text-secondary transition-colors"
        >
          Brands
        </Link>
        <span>/</span>
        {brand.isSubBrand && brand.parent && (
          <>
            <Link
              to={`/brands/${brand.parentId}`}
              className="hover:text-text-secondary transition-colors"
            >
              {brand.parent.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-text-primary font-medium">{brand.name}</span>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-text-primary">
                {brand.name}
              </h2>
              <Badge status={brand.kaType} />
              <Badge status={brand.status} />
              {brand.isSubBrand && (
                <span className="badge badge-neutral">Sub-brand</span>
              )}
              {isMyBrand && (
                <span className="text-[10px] bg-purple-bg text-purple-text rounded px-1.5 py-0.5">
                  your brand
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              {brand.merchant?.name} · {getCountryFlag(brand.country)}{" "}
              {brand.country}
              {brand.isSubBrand &&
                brand.parent &&
                ` · Parent: ${brand.parent.name}`}
            </p>
            <p className="text-[11px] text-text-tertiary mt-0.5 font-mono">
              App: {primaryApp?.appName ?? "—"}
              {brand.externalId && ` · ID: ${brand.externalId}`}
            </p>
          </div>
          {canEdit && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/tasks/new?brandId=${brand.id}`)}
            >
              <Plus size={13} />
              New task
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          <MetricCard
            label="Total stores"
            value={brandStores.length}
            sub={`${brandStores.filter((s: any) => !s.isActive).length} inactive`}
          />
          <MetricCard
            label="Active tasks"
            value={activeTasks.length}
            sub={
              blockedTasks.length > 0
                ? `${blockedTasks.length} blocked`
                : "all good"
            }
            subDanger={blockedTasks.length > 0}
          />
          <MetricCard
            label="Sub-brands"
            value={brand.children?.length ?? 0}
            sub={brand.children?.map((c: any) => c.name).join(", ") || "—"}
          />
          <MetricCard
            label="Menu method"
            value={
              brand.menuMethod ? MENU_METHOD_LABELS[brand.menuMethod] : "—"
            }
            sub={
              brand.pickingMode ? PICKING_MODE_LABELS[brand.pickingMode] : "—"
            }
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex border-b border-border px-4">
          {(["stores", "tasks", "notes"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px capitalize ${
                tab === t
                  ? "border-accent text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {t === "stores"
                ? `Stores (${brandStores.length})`
                : t === "tasks"
                  ? `Tasks (${activeTasks.length} active)`
                  : "Notes & config"}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === "stores" && (
            <div>
              <div className="flex gap-2 mb-3">
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
                  />
                  <input
                    className="input input-sm pl-7 w-40"
                    placeholder="Search store..."
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                  />
                </div>
                <select
                  className="select input-sm w-28"
                  value={storeStatus}
                  onChange={(e) => setStoreStatus(e.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  className="btn btn-secondary btn-sm ml-auto"
                  onClick={exportCSV}
                >
                  <Download size={12} />
                  Export CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="table-base min-w-[1000px]">
                  <thead>
                    <tr>
                      <th className="w-[15%]">Store name</th>
                      <th className="w-[9%]">Shop ID</th>
                      <th className="w-[9%]">App Shop ID</th>
                      <th className="w-[8%]">City</th>
                      <th className="w-[7%]">Status</th>
                      <th className="w-[7%]">Mon</th>
                      <th className="w-[7%]">Tue</th>
                      <th className="w-[7%]">Wed</th>
                      <th className="w-[7%]">Thu</th>
                      <th className="w-[7%]">Fri</th>
                      <th className="w-[7%]">Sat</th>
                      <th className="w-[7%]">Sun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStores.length === 0 && (
                      <tr>
                        <td
                          colSpan={12}
                          className="text-center py-8 text-text-tertiary text-xs"
                        >
                          No stores found
                        </td>
                      </tr>
                    )}
                    {filteredStores.map((s: any) => (
                      <tr key={s.id}>
                        <td>
                          <div>
                            <p className="font-medium text-xs">{s.name}</p>
                            {s.address && (
                              <p className="text-[10px] text-text-tertiary truncate max-w-[110px]">
                                {s.address}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="text-text-tertiary text-xs font-mono">
                          {s.externalId ?? "—"}
                        </td>
                        <td className="text-text-tertiary text-xs font-mono">
                          {s.externalId ?? "—"}
                        </td>
                        <td className="text-text-secondary text-xs">
                          {s.city ?? "—"}
                        </td>
                        <td>
                          <Badge
                            status={
                              s.status ?? (s.isActive ? "ACTIVE" : "INACTIVE")
                            }
                          />
                        </td>
                        <td className="text-text-tertiary text-[10px]">
                          {s.hoursMonday ?? "—"}
                        </td>
                        <td className="text-text-tertiary text-[10px]">
                          {s.hoursTuesday ?? "—"}
                        </td>
                        <td className="text-text-tertiary text-[10px]">
                          {s.hoursWednesday ?? "—"}
                        </td>
                        <td className="text-text-tertiary text-[10px]">
                          {s.hoursThursday ?? "—"}
                        </td>
                        <td className="text-text-tertiary text-[10px]">
                          {s.hoursFriday ?? "—"}
                        </td>
                        <td className="text-text-tertiary text-[10px]">
                          {s.hoursSaturday ?? "—"}
                        </td>
                        <td className="text-text-tertiary text-[10px]">
                          {s.hoursSunday ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "tasks" && <TasksTab tasks={brandTasks} />}

          {tab === "notes" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    Internal notes
                  </label>
                  {canEdit && !editingNotes && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingNotes(true)}
                    >
                      <Edit size={12} />
                      Edit
                    </button>
                  )}
                  {editingNotes && (
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditingNotes(false);
                          setNotes(brand.notes ?? "");
                        }}
                      >
                        <X size={12} />
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={saveNotes}
                        disabled={updateBrand.isPending}
                      >
                        <Save size={12} />
                        {updateBrand.isPending ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </div>
                {editingNotes ? (
                  <textarea
                    className="input w-full h-24 resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    autoFocus
                  />
                ) : (
                  <div className="bg-surface-secondary rounded-md px-3 py-2.5 min-h-[60px]">
                    <p className="text-xs text-text-secondary whitespace-pre-wrap">
                      {brand.notes ? (
                        brand.notes
                      ) : (
                        <span className="text-text-tertiary italic">
                          No notes
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="section-label mb-2">Configuration</p>
                {canEdit ? (
                  <EditableConfig
                    brand={brand}
                    onSave={async (data) => {
                      await updateBrand.mutateAsync({ id: brand.id, data });
                    }}
                  />
                ) : (
                  <div className="space-y-0">
                    <InfoRow
                      label="Picking mode"
                      value={
                        brand.pickingMode
                          ? PICKING_MODE_LABELS[brand.pickingMode]
                          : "—"
                      }
                    />
                    <InfoRow
                      label="Payment mode"
                      value={
                        brand.paymentMode
                          ? PAYMENT_MODE_LABELS[brand.paymentMode]
                          : "—"
                      }
                    />
                    <InfoRow
                      label="Menu method"
                      value={
                        brand.menuMethod
                          ? MENU_METHOD_LABELS[brand.menuMethod]
                          : "—"
                      }
                    />
                    <InfoRow
                      label="External ID"
                      value={brand.externalId ?? "Not set"}
                      mono
                    />
                    <InfoRow
                      label="Created"
                      value={formatDate(brand.createdAt)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// EDITABLE CONFIG
// ─────────────────────────────────────────

function EditableConfig({
  brand,
  onSave,
}: {
  brand: Brand;
  onSave: (data: Partial<Brand>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    pickingMode: brand.pickingMode ?? "",
    paymentMode: brand.paymentMode ?? "",
    menuMethod: brand.menuMethod ?? "",
    externalId: brand.externalId ?? "",
  });

  async function save() {
    setSaving(true);
    try {
      await onSave({
        pickingMode: (form.pickingMode as any) || undefined,
        paymentMode: (form.paymentMode as any) || undefined,
        menuMethod: (form.menuMethod as any) || undefined,
        externalId: form.externalId || undefined,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div>
        <div className="space-y-0">
          <InfoRow
            label="Picking mode"
            value={
              brand.pickingMode ? PICKING_MODE_LABELS[brand.pickingMode] : "—"
            }
          />
          <InfoRow
            label="Payment mode"
            value={
              brand.paymentMode ? PAYMENT_MODE_LABELS[brand.paymentMode] : "—"
            }
          />
          <InfoRow
            label="Menu method"
            value={
              brand.menuMethod ? MENU_METHOD_LABELS[brand.menuMethod] : "—"
            }
          />
          <InfoRow
            label="External ID"
            value={brand.externalId ?? "Not set"}
            mono
          />
          <InfoRow label="Created" value={formatDate(brand.createdAt)} />
        </div>
        <button
          className="btn btn-secondary btn-sm mt-3"
          onClick={() => setEditing(true)}
        >
          <Edit size={12} />
          Edit config
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-text-secondary block mb-1">
            Picking mode
          </label>
          <select
            className="select w-full"
            value={form.pickingMode}
            onChange={(e) =>
              setForm((f) => ({ ...f, pickingMode: e.target.value }))
            }
          >
            <option value="">—</option>
            <option value="TWO_IN_ONE">2in1</option>
            <option value="BAPP_PICKING">BApp Picking</option>
            <option value="DAPP_PICKING">DApp Picking</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-text-secondary block mb-1">
            Payment mode
          </label>
          <select
            className="select w-full"
            value={form.paymentMode}
            onChange={(e) =>
              setForm((f) => ({ ...f, paymentMode: e.target.value }))
            }
          >
            <option value="">—</option>
            <option value="PREPAID_CARD">Prepaid Card</option>
            <option value="DIDI_PAYLESS">DiDi Payless</option>
            <option value="FOOD_MODE">Food Mode</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-text-secondary block mb-1">
            Menu method
          </label>
          <select
            className="select w-full"
            value={form.menuMethod}
            onChange={(e) =>
              setForm((f) => ({ ...f, menuMethod: e.target.value }))
            }
          >
            <option value="">—</option>
            <option value="API">API</option>
            <option value="SFTP">SFTP</option>
            <option value="BAPP">BApp</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-text-secondary block mb-1">
            External ID
          </label>
          <input
            className="input w-full font-mono text-xs"
            value={form.externalId}
            onChange={(e) =>
              setForm((f) => ({ ...f, externalId: e.target.value }))
            }
            placeholder="e.g. CHD-001"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={save}
          disabled={saving}
        >
          <Save size={12} />
          {saving ? "Saving..." : "Save config"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// METRIC CARD
// ─────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  subDanger = false,
}: {
  label: string;
  value: string | number;
  sub: string;
  subDanger?: boolean;
}) {
  return (
    <div className="bg-surface-secondary rounded-lg p-3">
      <p className="text-[11px] text-text-secondary mb-1">{label}</p>
      <p className="text-xl font-semibold text-text-primary">{value}</p>
      <p
        className={`text-[10px] mt-0.5 truncate ${subDanger ? "text-danger-text" : "text-text-tertiary"}`}
      >
        {sub}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────
// TASKS TAB
// ─────────────────────────────────────────

function TasksTab({ tasks }: { tasks: Task[] }) {
  const navigate = useNavigate();
  const active = tasks.filter(
    (t) => !["COMPLETED", "CANCELLED"].includes(t.status),
  );
  const completed = tasks.filter((t) => t.status === "COMPLETED");

  return (
    <div className="space-y-4">
      {active.length > 0 && (
        <div>
          <p className="section-label mb-2">Active ({active.length})</p>
          <table className="table-base">
            <thead>
              <tr>
                <th>Task</th>
                <th>Section</th>
                <th>Requested by</th>
                <th>BPO</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {active.map((t) => (
                <tr key={t.id} onClick={() => navigate(`/tasks/${t.id}`)}>
                  <td className="font-medium">{t.taskType?.name}</td>
                  <td className="text-text-secondary text-xs">
                    {t.taskType?.section?.name ?? "—"}
                  </td>
                  <td className="text-text-secondary text-xs">
                    {t.createdBy?.name ?? "—"}
                  </td>
                  <td>
                    {t.assignedBpo?.user ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={t.assignedBpo.user.name} size="xs" />
                        <span className="text-xs">
                          {t.assignedBpo.user.name.split(" ")[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-tertiary text-xs">Auto</span>
                    )}
                  </td>
                  <td>
                    <Badge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <p className="section-label mb-2">Completed recently</p>
          <table className="table-base">
            <thead>
              <tr>
                <th>Task</th>
                <th>Requested by</th>
                <th>BPO</th>
                <th>Status</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {completed.slice(0, 5).map((t) => (
                <tr key={t.id} onClick={() => navigate(`/tasks/${t.id}`)}>
                  <td className="font-medium">{t.taskType?.name}</td>
                  <td className="text-text-secondary text-xs">
                    {t.createdBy?.name ?? "—"}
                  </td>
                  <td>
                    {t.assignedBpo?.user ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={t.assignedBpo.user.name} size="xs" />
                        <span className="text-xs">
                          {t.assignedBpo.user.name.split(" ")[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-tertiary text-xs">—</span>
                    )}
                  </td>
                  <td>
                    <Badge status={t.status} />
                  </td>
                  <td className="text-text-secondary text-xs">
                    {t.completedAt ? formatRelative(t.completedAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tasks.length === 0 && (
        <p className="text-center text-text-tertiary text-xs py-8">
          No tasks for this brand yet
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// INFO ROW
// ─────────────────────────────────────────

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
      <span className="text-xs text-text-secondary">{label}</span>
      <span
        className={`text-xs font-medium text-text-primary ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
