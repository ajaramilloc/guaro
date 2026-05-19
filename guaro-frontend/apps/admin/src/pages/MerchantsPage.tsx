import { useState, useEffect } from "react";
import { mockMerchants, mockBrands, mockApplications } from "@guaro/mock-data";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/store/auth";
import {
  getCountryFlag,
  PICKING_MODE_LABELS,
  PAYMENT_MODE_LABELS,
  MENU_METHOD_LABELS,
} from "@guaro/utils";
import {
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Edit,
  Save,
} from "lucide-react";
import type { Merchant, Application } from "@guaro/types";

const COUNTRIES = ["MX", "CO", "CR", "BR"];

export function MerchantsPage() {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser.role === "SUPERADMIN";
  const isMerchantAdmin =
    currentUser.adminProfile?.moduleId === "module-merchant";
  const canEdit = isSuperAdmin || isMerchantAdmin;

  const [search, setSearch] = useState("");
  const [expandedMerchant, setExpandedMerchant] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"merchants" | "applications">(
    "merchants",
  );
  const [editingMerchant, setEditingMerchant] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<string | null>(null);
  const [showAddApp, setShowAddApp] = useState(false);
  const [merchantNames, setMerchantNames] = useState<Record<string, string>>(
    Object.fromEntries(mockMerchants.map((m) => [m.id, m.name])),
  );
  const [appNames, setAppNames] = useState<Record<string, string>>(
    Object.fromEntries(mockApplications.map((a) => [a.id, a.appName])),
  );
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "Merchants & brands";
  }, []);

  const filtered = mockMerchants.filter((m) => {
    const q = search.toLowerCase();
    if (q && !m.name.toLowerCase().includes(q)) return false;
    return true;
  });

  function handleSave(id: string) {
    setSaved(id);
    setEditingMerchant(null);
    setEditingApp(null);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">
            Merchants & brands
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            {mockMerchants.length} merchants · {mockBrands.length} brands
          </p>
        </div>
        {canEdit && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={13} />
            Add merchant
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {(
          [
            { id: "merchants", label: `Merchants (${mockMerchants.length})` },
            {
              id: "applications",
              label: `Applications (${mockApplications.length})`,
            },
          ] as { id: "merchants" | "applications"; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.id
                ? "border-accent text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* MERCHANTS TAB */}
      {activeTab === "merchants" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                className="input pl-7 w-48"
                placeholder="Search merchant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="ml-auto text-xs text-text-tertiary">
              {filtered.length} merchant{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-2">
            {filtered.map((merchant) => {
              const brands = mockBrands.filter(
                (b) => b.merchantId === merchant.id && !b.isSubBrand,
              );
              const isExpanded = expandedMerchant === merchant.id;
              const isEditing = editingMerchant === merchant.id;
              const totalBrands = mockBrands.filter(
                (b) => b.merchantId === merchant.id,
              ).length;

              return (
                <div key={merchant.id} className="card overflow-hidden">
                  <div className="flex items-center px-4 py-3 hover:bg-surface-secondary transition-colors">
                    <button
                      className="flex items-center gap-3 flex-1 text-left"
                      onClick={() =>
                        setExpandedMerchant(isExpanded ? null : merchant.id)
                      }
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
                      {isEditing ? (
                        <input
                          className="input w-40"
                          value={merchantNames[merchant.id] ?? merchant.name}
                          onChange={(e) =>
                            setMerchantNames((n) => ({
                              ...n,
                              [merchant.id]: e.target.value,
                            }))
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {merchantNames[merchant.id] ?? merchant.name}
                            {saved === merchant.id && (
                              <span className="ml-2 text-[10px] text-success-text">
                                Saved!
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-text-tertiary">
                            {totalBrands} brand{totalBrands !== 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <Badge
                        status={merchant.isActive ? "ACTIVE" : "INACTIVE"}
                      />
                      {canEdit &&
                        (isEditing ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSave(merchant.id)}
                          >
                            <Save size={12} />
                            Save
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMerchant(merchant.id);
                            }}
                          >
                            <Edit size={12} />
                            Edit
                          </button>
                        ))}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border">
                      <table className="table-base">
                        <thead>
                          <tr>
                            <th className="w-[22%]">Brand</th>
                            <th className="w-[8%]">Country</th>
                            <th className="w-[8%]">KA type</th>
                            <th className="w-[14%]">Application</th>
                            <th className="w-[12%]">Picking</th>
                            <th className="w-[12%]">Payment</th>
                            <th className="w-[10%]">Menu</th>
                            <th className="w-[8%]">Stores</th>
                            <th className="w-[6%]">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {brands.map((brand) => {
                            const subBrands = mockBrands.filter(
                              (b) => b.parentId === brand.id,
                            );
                            const primaryApp = brand.applications?.find(
                              (a) => a.isPrimary,
                            )?.application;
                            return (
                              <>
                                <tr key={brand.id}>
                                  <td className="font-medium">{brand.name}</td>
                                  <td className="text-text-secondary text-xs">
                                    {getCountryFlag(brand.country)}{" "}
                                    {brand.country}
                                  </td>
                                  <td>
                                    <Badge status={brand.kaType} />
                                  </td>
                                  <td className="text-text-tertiary text-xs font-mono truncate max-w-[100px]">
                                    {primaryApp?.appName ?? "—"}
                                  </td>
                                  <td className="text-text-secondary text-xs">
                                    {brand.pickingMode
                                      ? PICKING_MODE_LABELS[brand.pickingMode]
                                      : "—"}
                                  </td>
                                  <td className="text-text-secondary text-xs">
                                    {brand.paymentMode
                                      ? PAYMENT_MODE_LABELS[brand.paymentMode]
                                      : "—"}
                                  </td>
                                  <td className="text-text-secondary text-xs">
                                    {brand.menuMethod
                                      ? MENU_METHOD_LABELS[brand.menuMethod]
                                      : "—"}
                                  </td>
                                  <td className="text-text-secondary text-xs">
                                    {brand.stores?.length ?? "—"}
                                  </td>
                                  <td>
                                    <Badge status={brand.status} />
                                  </td>
                                </tr>
                                {subBrands.map((sub) => {
                                  const subApp = sub.applications?.find(
                                    (a) => a.isPrimary,
                                  )?.application;
                                  return (
                                    <tr
                                      key={sub.id}
                                      className="bg-surface-secondary/50"
                                    >
                                      <td>
                                        <div className="flex items-center gap-1.5 pl-3">
                                          <span className="text-text-tertiary text-xs">
                                            ↳
                                          </span>
                                          <span className="text-xs text-text-secondary">
                                            {sub.name}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="text-text-tertiary text-xs">
                                        {getCountryFlag(sub.country)}{" "}
                                        {sub.country}
                                      </td>
                                      <td>
                                        <Badge status={sub.kaType} />
                                      </td>
                                      <td className="text-text-tertiary text-xs font-mono truncate">
                                        {subApp?.appName ?? "—"}
                                      </td>
                                      <td className="text-text-tertiary text-xs">
                                        {sub.pickingMode
                                          ? PICKING_MODE_LABELS[sub.pickingMode]
                                          : "—"}
                                      </td>
                                      <td className="text-text-tertiary text-xs">
                                        {sub.paymentMode
                                          ? PAYMENT_MODE_LABELS[sub.paymentMode]
                                          : "—"}
                                      </td>
                                      <td className="text-text-tertiary text-xs">
                                        {sub.menuMethod
                                          ? MENU_METHOD_LABELS[sub.menuMethod]
                                          : "—"}
                                      </td>
                                      <td className="text-text-tertiary text-xs">
                                        —
                                      </td>
                                      <td>
                                        <Badge status={sub.status} />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeTab === "applications" && (
        <div>
          {canEdit && (
            <div className="flex justify-end mb-3">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddApp(true)}
              >
                <Plus size={13} />
                Add application
              </button>
            </div>
          )}
          <div className="card overflow-hidden">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="w-[28%]">App name</th>
                  <th className="w-[10%]">Country</th>
                  <th className="w-[30%]">Brands using it</th>
                  <th className="w-[14%]">App ID</th>
                  <th className="w-[10%]">Status</th>
                  <th className="w-[8%]"></th>
                </tr>
              </thead>
              <tbody>
                {mockApplications.map((app) => {
                  const brandsUsingApp = mockBrands.filter((b) =>
                    b.applications?.some((ba) => ba.applicationId === app.id),
                  );
                  const isEditing = editingApp === app.id;
                  return (
                    <tr key={app.id}>
                      <td>
                        {isEditing ? (
                          <input
                            className="input w-full font-mono text-xs"
                            value={appNames[app.id] ?? app.appName}
                            onChange={(e) =>
                              setAppNames((n) => ({
                                ...n,
                                [app.id]: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          <span className="font-medium font-mono text-xs">
                            {appNames[app.id] ?? app.appName}
                            {saved === app.id && (
                              <span className="ml-2 text-[10px] text-success-text font-sans">
                                Saved!
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="text-text-secondary text-xs">
                        {getCountryFlag(app.country)} {app.country}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {brandsUsingApp.slice(0, 3).map((b) => (
                            <span
                              key={b.id}
                              className="text-[10px] bg-surface-secondary border
                                         border-border rounded px-1.5 py-0.5 text-text-secondary"
                            >
                              {b.name}
                            </span>
                          ))}
                          {brandsUsingApp.length > 3 && (
                            <span className="text-[10px] text-text-tertiary py-0.5">
                              +{brandsUsingApp.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-text-tertiary text-xs font-mono">
                        ••••••••
                      </td>
                      <td>
                        <Badge status={app.isActive ? "ACTIVE" : "INACTIVE"} />
                      </td>
                      <td>
                        {canEdit &&
                          (isEditing ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSave(app.id)}
                            >
                              <Save size={12} />
                            </button>
                          ) : (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setEditingApp(app.id)}
                            >
                              <Edit size={13} className="text-text-secondary" />
                            </button>
                          ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add merchant modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-modal w-80 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">
                Add merchant
              </h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={16} className="text-text-secondary" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Merchant name <span className="text-danger-text">*</span>
                </label>
                <input className="input w-full" placeholder="e.g. Chedraui" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Country <span className="text-danger-text">*</span>
                </label>
                <select className="select w-full">
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {getCountryFlag(c)} {c}
                    </option>
                  ))}
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
                Add merchant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add application modal */}
      {showAddApp && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-modal w-80 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">
                Add application
              </h3>
              <button onClick={() => setShowAddApp(false)}>
                <X size={16} className="text-text-secondary" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  App name <span className="text-danger-text">*</span>
                </label>
                <input
                  className="input w-full font-mono text-xs"
                  placeholder="e.g. chedraui-mx-prod"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Country <span className="text-danger-text">*</span>
                </label>
                <select className="select w-full">
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {getCountryFlag(c)} {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  App ID <span className="text-danger-text">*</span>
                </label>
                <input
                  className="input w-full font-mono text-xs"
                  placeholder="app_id..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  App Secret <span className="text-danger-text">*</span>
                </label>
                <input
                  type="password"
                  className="input w-full font-mono text-xs"
                  placeholder="app_secret..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddApp(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddApp(false)}
              >
                Add application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
