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
import { Plus, X, ChevronDown, ChevronRight, Search } from "lucide-react";

const COUNTRIES = ["MX", "CO", "CR", "BR"];

// ─────────────────────────────────────────
// SHARED HELPERS — defined first
// ─────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-modal w-96 p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose}>
            <X size={16} className="text-text-secondary" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-text-secondary block mb-1">
        {label} {required && <span className="text-danger-text">*</span>}
      </label>
      {children}
    </div>
  );
}

function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  return (
    <div className="flex gap-2 justify-end mt-4">
      <button className="btn btn-secondary btn-sm" onClick={onCancel}>
        Cancel
      </button>
      <button className="btn btn-primary btn-sm" onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  );
}

function AppSearchSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = mockApplications.filter(
    (a) =>
      a.appName.toLowerCase().includes(search.toLowerCase()) ||
      a.country.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = mockApplications.find((a) => a.id === value);

  return (
    <div className="relative">
      <div
        className="input cursor-pointer flex items-center justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`text-xs font-mono truncate ${
            selected ? "text-text-primary" : "text-text-tertiary"
          }`}
        >
          {selected ? selected.appName : "Select application..."}
        </span>
        <ChevronRight
          size={13}
          className={`text-text-tertiary flex-shrink-0 transition-transform ${
            open ? "rotate-90" : ""
          }`}
        />
      </div>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-border
                        rounded-md shadow-dropdown z-50 overflow-hidden"
        >
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                className="input input-sm pl-7 w-full"
                placeholder="Search app name or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <button
              className="w-full text-left px-3 py-2 text-xs text-text-tertiary
                         hover:bg-surface-secondary transition-colors border-b border-border"
              onClick={() => {
                onChange("");
                setOpen(false);
                setSearch("");
              }}
            >
              None
            </button>
            {filtered.length === 0 && (
              <p className="text-center text-text-tertiary text-xs py-4">
                No applications found
              </p>
            )}
            {filtered.map((app) => (
              <button
                key={app.id}
                className={`w-full text-left px-3 py-2.5 hover:bg-surface-secondary
                             transition-colors border-b border-border last:border-b-0 ${
                               value === app.id ? "bg-info-bg" : ""
                             }`}
                onClick={() => {
                  onChange(app.id);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <p
                  className={`text-xs font-mono font-medium ${
                    value === app.id ? "text-info-text" : "text-text-primary"
                  }`}
                >
                  {app.appName}
                </p>
                <p className="text-[10px] text-text-tertiary mt-0.5">
                  {getCountryFlag(app.country)} {app.country}
                  {!app.isActive && " · Inactive"}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────

export function MerchantsPage() {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [expandedMerchant, setExpandedMerchant] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"merchants" | "applications">(
    "merchants",
  );
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [showAddApp, setShowAddApp] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState<string | null>(null);
  const [brandAppId, setBrandAppId] = useState("");

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "Merchants";
  }, []);

  const filtered = mockMerchants.filter((m) => {
    const q = search.toLowerCase();
    if (q && !m.name.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">
            Merchants
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            {mockMerchants.length} merchants · {mockBrands.length} brands
          </p>
        </div>
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
            <button
              className="btn btn-primary btn-sm ml-auto"
              onClick={() => setShowAddMerchant(true)}
            >
              <Plus size={13} />
              Add merchant
            </button>
          </div>

          <div className="space-y-2">
            {filtered.map((merchant) => {
              const brands = mockBrands.filter(
                (b) => b.merchantId === merchant.id && !b.isSubBrand,
              );
              const isExpanded = expandedMerchant === merchant.id;
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
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {merchant.name}
                        </p>
                        <p className="text-[11px] text-text-tertiary">
                          {totalBrands} brand{totalBrands !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setBrandAppId("");
                        setShowAddBrand(merchant.id);
                      }}
                    >
                      <Plus size={12} />
                      Add brand
                    </button>
                  </div>

                  {isExpanded && brands.length > 0 && (
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
                            <th className="w-[7%]">Status</th>
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
                            const isMyBrand =
                              brand.assignedOpId === currentUser.bpoProfile?.id;

                            return (
                              <>
                                <tr
                                  key={brand.id}
                                  className={isMyBrand ? "bg-purple-bg/30" : ""}
                                >
                                  <td>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-medium">
                                        {brand.name}
                                      </span>
                                      {isMyBrand && (
                                        <span
                                          className="text-[10px] bg-purple-bg text-purple-text
                                                         rounded px-1.5 py-0.5"
                                        >
                                          your brand
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-text-secondary text-xs">
                                    {getCountryFlag(brand.country)}{" "}
                                    {brand.country}
                                  </td>
                                  <td>
                                    <Badge status={brand.kaType} />
                                  </td>
                                  <td className="text-text-tertiary text-xs font-mono truncate">
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
                                      <td className="text-text-tertiary text-xs font-mono">
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

                  {isExpanded && brands.length === 0 && (
                    <div className="px-4 py-6 text-center text-text-tertiary text-xs border-t border-border">
                      No brands yet
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
          <div className="flex justify-end mb-3">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddApp(true)}
            >
              <Plus size={13} />
              Add application
            </button>
          </div>
          <div className="card overflow-hidden">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="w-[32%]">App name</th>
                  <th className="w-[12%]">Country</th>
                  <th className="w-[36%]">Brands using it</th>
                  <th className="w-[12%]">App ID</th>
                  <th className="w-[8%]">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockApplications.map((app) => {
                  const brandsUsingApp = mockBrands.filter((b) =>
                    b.applications?.some((ba) => ba.applicationId === app.id),
                  );
                  return (
                    <tr key={app.id}>
                      <td className="font-medium font-mono text-xs">
                        {app.appName}
                      </td>
                      <td className="text-text-secondary text-xs">
                        {getCountryFlag(app.country)} {app.country}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {brandsUsingApp.slice(0, 3).map((b) => (
                            <span
                              key={b.id}
                              className="text-[10px] bg-surface-secondary border border-border
                                         rounded px-1.5 py-0.5 text-text-secondary"
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add merchant modal */}
      {showAddMerchant && (
        <Modal title="Add merchant" onClose={() => setShowAddMerchant(false)}>
          <div className="space-y-3">
            <FormField label="Merchant name" required>
              <input className="input w-full" placeholder="e.g. Chedraui" />
            </FormField>
            <FormField label="Country" required>
              <select className="select w-full">
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {getCountryFlag(c)} {c}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <ModalActions
            onCancel={() => setShowAddMerchant(false)}
            onConfirm={() => setShowAddMerchant(false)}
            confirmLabel="Add merchant"
          />
        </Modal>
      )}

      {/* Add application modal */}
      {showAddApp && (
        <Modal title="Add application" onClose={() => setShowAddApp(false)}>
          <div className="space-y-3">
            <FormField label="App name" required>
              <input
                className="input w-full font-mono text-xs"
                placeholder="e.g. chedraui-mx-prod"
              />
            </FormField>
            <FormField label="Country" required>
              <select className="select w-full">
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {getCountryFlag(c)} {c}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="App ID" required>
              <input
                className="input w-full font-mono text-xs"
                placeholder="app_id..."
              />
            </FormField>
            <FormField label="App Secret" required>
              <input
                type="password"
                className="input w-full font-mono text-xs"
                placeholder="app_secret..."
              />
            </FormField>
          </div>
          <ModalActions
            onCancel={() => setShowAddApp(false)}
            onConfirm={() => setShowAddApp(false)}
            confirmLabel="Add application"
          />
        </Modal>
      )}

      {/* Add brand modal */}
      {showAddBrand && (
        <Modal
          title={`Add brand — ${mockMerchants.find((m) => m.id === showAddBrand)?.name}`}
          onClose={() => setShowAddBrand(null)}
        >
          <div className="space-y-3">
            <FormField label="Brand name" required>
              <input
                className="input w-full"
                placeholder="e.g. Chedraui Selecto"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="Country" required>
                <select className="select w-full">
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {getCountryFlag(c)} {c}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="KA type" required>
                <select className="select w-full">
                  <option value="KA">KA</option>
                  <option value="CKA">CKA</option>
                  <option value="SME">SME</option>
                </select>
              </FormField>
            </div>
            <FormField label="Picking mode">
              <select className="select w-full">
                <option value="">Select...</option>
                <option value="TWO_IN_ONE">2in1</option>
                <option value="BAPP_PICKING">BApp Picking</option>
                <option value="DAPP_PICKING">DApp Picking</option>
              </select>
            </FormField>
            <FormField label="Payment mode">
              <select className="select w-full">
                <option value="">Select...</option>
                <option value="PREPAID_CARD">Prepaid Card</option>
                <option value="DIDI_PAYLESS">DiDi Payless</option>
                <option value="FOOD_MODE">Food Mode</option>
              </select>
            </FormField>
            <FormField label="Menu method">
              <select className="select w-full">
                <option value="">Select...</option>
                <option value="API">API</option>
                <option value="SFTP">SFTP</option>
                <option value="BAPP">BApp</option>
              </select>
            </FormField>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" />
              <span className="text-xs text-text-primary">Is sub-brand</span>
            </label>
            <FormField label="Application">
              <AppSearchSelect value={brandAppId} onChange={setBrandAppId} />
            </FormField>
          </div>
          <ModalActions
            onCancel={() => setShowAddBrand(null)}
            onConfirm={() => setShowAddBrand(null)}
            confirmLabel="Add brand"
          />
        </Modal>
      )}
    </div>
  );
}
