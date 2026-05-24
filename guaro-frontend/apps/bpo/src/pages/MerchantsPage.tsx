import { useState, useEffect } from "react";
import {
  useMerchants,
  useApplications,
  useCreateMerchant,
  useCreateApplication,
} from "@/hooks/useMerchants";
import { useBrands, useCreateBrand } from "@/hooks/useBrands";
import { Badge } from "@/components/ui/Badge";
import {
  getCountryFlag,
  PICKING_MODE_LABELS,
  PAYMENT_MODE_LABELS,
  MENU_METHOD_LABELS,
} from "@guaro/utils";
import { Plus, X, ChevronDown, ChevronRight, Search } from "lucide-react";

const COUNTRIES = ["MX", "CO", "CR", "BR"];

export function MerchantsPage() {
  const [search, setSearch] = useState("");
  const [expandedMerchant, setExpandedMerchant] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"merchants" | "applications">(
    "merchants",
  );
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [showAddApp, setShowAddApp] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState<string | null>(null);

  // Form states
  const [merchantName, setMerchantName] = useState("");
  const [appForm, setAppForm] = useState({
    appName: "",
    country: "CO",
    appId: "",
    appSecret: "",
  });
  const [brandForm, setBrandForm] = useState({
    name: "",
    country: "CO",
    kaType: "KA",
    pickingMode: "",
    paymentMode: "",
    menuMethod: "",
    isSubBrand: false,
    parentId: "",
    applicationId: "",
  });
  const [brandAppSearch, setBrandAppSearch] = useState("");
  const [brandAppOpen, setBrandAppOpen] = useState(false);

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "Merchants";
  }, []);

  const { data: merchants = [], isLoading: loadingMerchants } = useMerchants();
  const { data: applications = [], isLoading: loadingApps } = useApplications();
  const { data: brandsResponse } = useBrands({ limit: 100 });
  const brands = brandsResponse?.data ?? [];

  const createMerchant = useCreateMerchant();
  const createApplication = useCreateApplication();
  const createBrand = useCreateBrand();

  const filteredMerchants = merchants.filter(
    (m) => !search || m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredBrandApps = applications.filter(
    (a) =>
      !brandAppSearch ||
      a.appName.toLowerCase().includes(brandAppSearch.toLowerCase()) ||
      a.country.toLowerCase().includes(brandAppSearch.toLowerCase()),
  );

  const selectedApp = applications.find(
    (a) => a.id === brandForm.applicationId,
  );

  async function handleCreateMerchant() {
    if (!merchantName.trim()) return;
    await createMerchant.mutateAsync({ name: merchantName });
    setMerchantName("");
    setShowAddMerchant(false);
  }

  async function handleCreateApp() {
    if (!appForm.appName.trim()) return;
    await createApplication.mutateAsync(appForm);
    setAppForm({ appName: "", country: "CO", appId: "", appSecret: "" });
    setShowAddApp(false);
  }

  async function handleCreateBrand() {
    if (!brandForm.name.trim() || !showAddBrand) return;
    await createBrand.mutateAsync({
      ...brandForm,
      merchantId: showAddBrand,
      isSubBrand: brandForm.isSubBrand,
      parentId: brandForm.parentId || undefined,
      pickingMode: brandForm.pickingMode || undefined,
      paymentMode: brandForm.paymentMode || undefined,
      menuMethod: brandForm.menuMethod || undefined,
      applicationId: brandForm.applicationId || undefined,
    });
    setBrandForm({
      name: "",
      country: "CO",
      kaType: "KA",
      pickingMode: "",
      paymentMode: "",
      menuMethod: "",
      isSubBrand: false,
      parentId: "",
      applicationId: "",
    });
    setShowAddBrand(null);
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">
            Merchants
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            {merchants.length} merchants · {brands.length} brands
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {(
          [
            { id: "merchants", label: `Merchants (${merchants.length})` },
            {
              id: "applications",
              label: `Applications (${applications.length})`,
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
            {loadingMerchants && (
              <p className="text-center text-text-tertiary text-xs py-6">
                Loading...
              </p>
            )}
            {filteredMerchants.map((merchant) => {
              const merchantBrands = brands.filter(
                (b) => b.merchantId === merchant.id && !b.isSubBrand,
              );
              const isExpanded = expandedMerchant === merchant.id;
              const totalBrands = brands.filter(
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
                      onClick={() => setShowAddBrand(merchant.id)}
                    >
                      <Plus size={12} />
                      Add brand
                    </button>
                  </div>

                  {isExpanded && merchantBrands.length > 0 && (
                    <div className="border-t border-border">
                      <table className="table-base">
                        <thead>
                          <tr>
                            <th>Brand</th>
                            <th>Country</th>
                            <th>KA type</th>
                            <th>Application</th>
                            <th>Picking</th>
                            <th>Payment</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {merchantBrands.map((brand) => {
                            const subBrands = brands.filter(
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
                                  <td>
                                    <Badge status={brand.status} />
                                  </td>
                                </tr>
                                {subBrands.map((sub) => (
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
                                      —
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
                                    <td>
                                      <Badge status={sub.status} />
                                    </td>
                                  </tr>
                                ))}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {isExpanded && merchantBrands.length === 0 && (
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
                {loadingApps && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-text-tertiary text-xs"
                    >
                      Loading...
                    </td>
                  </tr>
                )}
                {applications.map((app) => {
                  const brandsUsingApp = brands.filter((b) =>
                    b.applications?.some(
                      (ba: any) => ba.applicationId === app.id,
                    ),
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
                        {app.appId ? "••••••••" : "—"}
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
              <input
                className="input w-full"
                placeholder="e.g. Chedraui"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
              />
            </FormField>
          </div>
          <ModalActions
            onCancel={() => setShowAddMerchant(false)}
            onConfirm={handleCreateMerchant}
            confirmLabel="Add merchant"
            isPending={createMerchant.isPending}
            disabled={!merchantName.trim()}
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
                value={appForm.appName}
                onChange={(e) =>
                  setAppForm((f) => ({ ...f, appName: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Country" required>
              <select
                className="select w-full"
                value={appForm.country}
                onChange={(e) =>
                  setAppForm((f) => ({ ...f, country: e.target.value }))
                }
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {getCountryFlag(c)} {c}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="App ID">
              <input
                className="input w-full font-mono text-xs"
                placeholder="app_id..."
                value={appForm.appId}
                onChange={(e) =>
                  setAppForm((f) => ({ ...f, appId: e.target.value }))
                }
              />
            </FormField>
            <FormField label="App Secret">
              <input
                type="password"
                className="input w-full font-mono text-xs"
                placeholder="app_secret..."
                value={appForm.appSecret}
                onChange={(e) =>
                  setAppForm((f) => ({ ...f, appSecret: e.target.value }))
                }
              />
            </FormField>
          </div>
          <ModalActions
            onCancel={() => setShowAddApp(false)}
            onConfirm={handleCreateApp}
            confirmLabel="Add application"
            isPending={createApplication.isPending}
            disabled={!appForm.appName.trim()}
          />
        </Modal>
      )}

      {/* Add brand modal */}
      {showAddBrand && (
        <Modal
          title={`Add brand — ${merchants.find((m) => m.id === showAddBrand)?.name}`}
          onClose={() => setShowAddBrand(null)}
        >
          <div className="space-y-3">
            <FormField label="Brand name" required>
              <input
                className="input w-full"
                placeholder="e.g. Chedraui Selecto"
                value={brandForm.name}
                onChange={(e) =>
                  setBrandForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </FormField>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="Country" required>
                <select
                  className="select w-full"
                  value={brandForm.country}
                  onChange={(e) =>
                    setBrandForm((f) => ({ ...f, country: e.target.value }))
                  }
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {getCountryFlag(c)} {c}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="KA type" required>
                <select
                  className="select w-full"
                  value={brandForm.kaType}
                  onChange={(e) =>
                    setBrandForm((f) => ({ ...f, kaType: e.target.value }))
                  }
                >
                  <option value="KA">KA</option>
                  <option value="CKA">CKA</option>
                  <option value="SME">SME</option>
                </select>
              </FormField>
            </div>
            <FormField label="Picking mode">
              <select
                className="select w-full"
                value={brandForm.pickingMode}
                onChange={(e) =>
                  setBrandForm((f) => ({ ...f, pickingMode: e.target.value }))
                }
              >
                <option value="">Select...</option>
                <option value="TWO_IN_ONE">2in1</option>
                <option value="BAPP_PICKING">BApp Picking</option>
                <option value="DAPP_PICKING">DApp Picking</option>
              </select>
            </FormField>
            <FormField label="Payment mode">
              <select
                className="select w-full"
                value={brandForm.paymentMode}
                onChange={(e) =>
                  setBrandForm((f) => ({ ...f, paymentMode: e.target.value }))
                }
              >
                <option value="">Select...</option>
                <option value="PREPAID_CARD">Prepaid Card</option>
                <option value="DIDI_PAYLESS">DiDi Payless</option>
                <option value="FOOD_MODE">Food Mode</option>
              </select>
            </FormField>
            <FormField label="Menu method">
              <select
                className="select w-full"
                value={brandForm.menuMethod}
                onChange={(e) =>
                  setBrandForm((f) => ({ ...f, menuMethod: e.target.value }))
                }
              >
                <option value="">Select...</option>
                <option value="API">API</option>
                <option value="SFTP">SFTP</option>
                <option value="BAPP">BApp</option>
              </select>
            </FormField>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={brandForm.isSubBrand}
                onChange={(e) =>
                  setBrandForm((f) => ({
                    ...f,
                    isSubBrand: e.target.checked,
                    parentId: "",
                  }))
                }
              />
              <span className="text-xs text-text-primary">Is sub-brand</span>
            </label>
            {brandForm.isSubBrand && (
              <FormField label="Parent brand">
                <select
                  className="select w-full"
                  value={brandForm.parentId}
                  onChange={(e) =>
                    setBrandForm((f) => ({ ...f, parentId: e.target.value }))
                  }
                >
                  <option value="">Select parent...</option>
                  {brands
                    .filter(
                      (b) => b.merchantId === showAddBrand && !b.isSubBrand,
                    )
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </FormField>
            )}
            <FormField label="Application">
              <AppSearchSelect
                value={brandForm.applicationId}
                onChange={(v) =>
                  setBrandForm((f) => ({ ...f, applicationId: v }))
                }
                applications={applications}
                search={brandAppSearch}
                onSearch={setBrandAppSearch}
                open={brandAppOpen}
                onToggle={() => setBrandAppOpen((o) => !o)}
                selectedApp={selectedApp}
                filteredApps={filteredBrandApps}
              />
            </FormField>
          </div>
          <ModalActions
            onCancel={() => setShowAddBrand(null)}
            onConfirm={handleCreateBrand}
            confirmLabel="Add brand"
            isPending={createBrand.isPending}
            disabled={!brandForm.name.trim()}
          />
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────

function AppSearchSelect({
  value,
  onChange,
  search,
  onSearch,
  open,
  onToggle,
  selectedApp,
  filteredApps,
}: {
  value: string;
  onChange: (v: string) => void;
  applications: any[];
  search: string;
  onSearch: (v: string) => void;
  open: boolean;
  onToggle: () => void;
  selectedApp: any;
  filteredApps: any[];
}) {
  return (
    <div className="relative">
      <div
        className="input cursor-pointer flex items-center justify-between"
        onClick={onToggle}
      >
        <span
          className={`text-xs font-mono truncate ${selectedApp ? "text-text-primary" : "text-text-tertiary"}`}
        >
          {selectedApp ? selectedApp.appName : "Select application..."}
        </span>
        <ChevronRight
          size={13}
          className={`text-text-tertiary flex-shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
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
                onChange={(e) => onSearch(e.target.value)}
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
                onToggle();
              }}
            >
              None
            </button>
            {filteredApps.length === 0 && (
              <p className="text-center text-text-tertiary text-xs py-4">
                No applications found
              </p>
            )}
            {filteredApps.map((app) => (
              <button
                key={app.id}
                className={`w-full text-left px-3 py-2.5 hover:bg-surface-secondary
                             transition-colors border-b border-border last:border-b-0 ${
                               value === app.id ? "bg-info-bg" : ""
                             }`}
                onClick={() => {
                  onChange(app.id);
                  onToggle();
                  onSearch("");
                }}
              >
                <p
                  className={`text-xs font-mono font-medium ${value === app.id ? "text-info-text" : "text-text-primary"}`}
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
  isPending,
  disabled,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  isPending?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 justify-end mt-4">
      <button className="btn btn-secondary btn-sm" onClick={onCancel}>
        Cancel
      </button>
      <button
        className="btn btn-primary btn-sm"
        onClick={onConfirm}
        disabled={disabled || isPending}
      >
        {isPending ? "Saving..." : confirmLabel}
      </button>
    </div>
  );
}
