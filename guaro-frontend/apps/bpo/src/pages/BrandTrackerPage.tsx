import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { mockBrands, mockApplications, mockStores } from "@guaro/mock-data";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/store/auth";
import {
  formatRelative,
  formatDate,
  getCountryFlag,
  PICKING_MODE_LABELS,
  PAYMENT_MODE_LABELS,
  MENU_METHOD_LABELS,
} from "@guaro/utils";
import { ChevronRight, Save, Search } from "lucide-react";
import type { PickingMode, PaymentMode, MenuMethod } from "@guaro/types";

type Tab = "info" | "stores" | "notes";

export function BrandTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("info");
  const [saved, setSaved] = useState(false);

  const brand = mockBrands.find((b) => b.id === id);
  const brandStores = mockStores.filter((s) => s.brandId === id);
  const [storeSearch, setStoreSearch] = useState("");

  // Determine BPO role for this brand
  const isOp = brand?.assignedOpId === currentUser.bpoProfile?.id;
  const isCreating = brand?.status === "PENDING";
  const canEdit = isOp || isCreating;

  // Editable fields
  const [externalId, setExternalId] = useState(brand?.externalId ?? "");
  const [selectedAppId, setSelectedAppId] = useState(
    brand?.applications?.[0]?.applicationId ?? "",
  );
  const [pickingMode, setPickingMode] = useState(brand?.pickingMode ?? "");
  const [paymentMode, setPaymentMode] = useState(brand?.paymentMode ?? "");
  const [menuMethod, setMenuMethod] = useState(brand?.menuMethod ?? "");
  const [notes, setNotes] = useState(brand?.notes ?? "");

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = brand?.name ?? "Brand tracker";
  }, [brand]);

  if (!brand) {
    return (
      <div className="p-5 text-center text-text-tertiary">Brand not found</div>
    );
  }

  const primaryApp = brand.applications?.find((a) => a.isPrimary)?.application;
  const countryApps = mockApplications.filter(
    (a) => a.country === brand.country,
  );

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const filteredStores = brandStores.filter(
    (s) =>
      !storeSearch ||
      s.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
      s.city?.toLowerCase().includes(storeSearch.toLowerCase()),
  );

  return (
    <div className="p-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-4">
        <Link
          to="/brands"
          className="hover:text-text-secondary transition-colors"
        >
          Brands
        </Link>
        <ChevronRight size={12} />
        <span className="text-text-primary font-medium">{brand.name}</span>
      </div>

      {/* Header */}
      <div className="card p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-text-primary">
                {brand.name}
              </h2>
              <Badge status={brand.kaType} />
              <Badge status={brand.status} />
              {isOp && (
                <span className="badge bg-purple-bg text-purple-text">
                  Your brand
                </span>
              )}
              {isCreating && (
                <span className="badge bg-warning-bg text-warning-text">
                  Creating
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              {brand.merchant?.name} · {getCountryFlag(brand.country)}{" "}
              {brand.country}
              {brand.isSubBrand &&
                brand.parent &&
                ` · Sub-brand of ${brand.parent.name}`}
            </p>
          </div>
          {canEdit && (
            <button
              className={`btn btn-sm ${saved ? "btn-secondary text-success-text" : "btn-primary"}`}
              onClick={handleSave}
            >
              <Save size={13} />
              {saved ? "Saved!" : "Save changes"}
            </button>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface-secondary rounded-lg p-2.5">
            <p className="text-[10px] text-text-secondary mb-1">Stores</p>
            <p className="text-lg font-semibold text-text-primary">
              {brandStores.length}
            </p>
            <p className="text-[10px] text-text-tertiary">
              {brandStores.filter((s) => !s.isActive).length} inactive
            </p>
          </div>
          <div className="bg-surface-secondary rounded-lg p-2.5">
            <p className="text-[10px] text-text-secondary mb-1">Application</p>
            <p className="text-xs font-medium text-text-primary truncate font-mono">
              {primaryApp?.appName ?? "—"}
            </p>
            <p className="text-[10px] text-text-tertiary mt-0.5">
              {brand.country} scope
            </p>
          </div>
          <div className="bg-surface-secondary rounded-lg p-2.5">
            <p className="text-[10px] text-text-secondary mb-1">External ID</p>
            <p
              className={`text-xs font-medium font-mono ${
                brand.externalId ? "text-text-primary" : "text-text-tertiary"
              }`}
            >
              {brand.externalId ?? "Not set"}
            </p>
            <p className="text-[10px] text-text-tertiary mt-0.5">Platform ID</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-border px-4">
          {(
            [
              { id: "info", label: "Info & config" },
              { id: "stores", label: `Stores (${brandStores.length})` },
              { id: "notes", label: "Notes" },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? "border-accent text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* INFO TAB */}
          {tab === "info" && (
            <div className="space-y-4">
              {/* External ID — only shown when creating */}
              {isCreating && (
                <div>
                  <p className="section-label mb-2">Brand registration</p>
                  <div
                    className="bg-warning-bg border border-warning-border rounded-md
                                  px-3 py-2.5 mb-3"
                  >
                    <p className="text-xs text-warning-text">
                      Create the brand in the external platform first, then
                      register the ID and application below.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1.5">
                        External brand ID{" "}
                        <span className="text-danger-text">*</span>
                      </label>
                      <input
                        type="text"
                        className="input w-full font-mono"
                        placeholder="e.g. CHD-003"
                        value={externalId}
                        onChange={(e) => setExternalId(e.target.value)}
                      />
                      <p className="text-[11px] text-text-tertiary mt-1">
                        Copy the ID from the external platform after creating
                        the brand.
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1.5">
                        Application <span className="text-danger-text">*</span>
                      </label>
                      <select
                        className="select w-full"
                        value={selectedAppId}
                        onChange={(e) => setSelectedAppId(e.target.value)}
                      >
                        <option value="">Select application...</option>
                        {countryApps.map((app) => (
                          <option key={app.id} value={app.id}>
                            {app.appName}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-text-tertiary mt-1">
                        Only applications for {brand.country} are shown.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Config fields — shown to OP */}
              {(isOp || isCreating) && (
                <div>
                  <p className="section-label mb-2">Configuration</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1.5">
                        Picking mode
                      </label>
                      <select
                        className="select w-full"
                        value={pickingMode}
                        onChange={(e) => setPickingMode(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="TWO_IN_ONE">2in1</option>
                        <option value="BAPP_PICKING">BApp Picking</option>
                        <option value="DAPP_PICKING">DApp Picking</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1.5">
                        Payment mode
                      </label>
                      <select
                        className="select w-full"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="PREPAID_CARD">Prepaid Card</option>
                        <option value="DIDI_PAYLESS">DiDi Payless</option>
                        <option value="FOOD_MODE">Food Mode</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary block mb-1.5">
                        Menu method
                      </label>
                      <select
                        className="select w-full"
                        value={menuMethod}
                        onChange={(e) => setMenuMethod(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="API">API</option>
                        <option value="SFTP">SFTP</option>
                        <option value="BAPP">BApp</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Read-only info */}
              {!canEdit && (
                <div>
                  <p className="section-label mb-2">Configuration</p>
                  <div className="space-y-0">
                    <InfoRow
                      label="Picking mode"
                      value={
                        brand.pickingMode
                          ? PICKING_MODE_LABELS[
                              brand.pickingMode as PickingMode
                            ]
                          : "—"
                      }
                    />
                    <InfoRow
                      label="Payment mode"
                      value={
                        brand.paymentMode
                          ? PAYMENT_MODE_LABELS[
                              brand.paymentMode as PaymentMode
                            ]
                          : "—"
                      }
                    />
                    <InfoRow
                      label="Menu method"
                      value={
                        brand.menuMethod
                          ? MENU_METHOD_LABELS[brand.menuMethod as MenuMethod]
                          : "—"
                      }
                    />
                    <InfoRow
                      label="External ID"
                      value={brand.externalId ?? "—"}
                      mono
                    />
                    <InfoRow
                      label="Application"
                      value={primaryApp?.appName ?? "—"}
                      mono
                    />
                    <InfoRow
                      label="Created"
                      value={formatDate(brand.createdAt)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STORES TAB */}
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
              </div>
              {filteredStores.length === 0 ? (
                <p className="text-center text-text-tertiary text-xs py-8">
                  No stores found
                </p>
              ) : (
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Store name</th>
                      <th>Store ID</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStores.map((s) => (
                      <tr key={s.id}>
                        <td className="font-medium">{s.name}</td>
                        <td className="text-text-tertiary text-xs font-mono">
                          {s.externalId ?? "—"}
                        </td>
                        <td className="text-text-secondary">{s.city ?? "—"}</td>
                        <td>
                          <Badge status={s.isActive ? "ACTIVE" : "INACTIVE"} />
                        </td>
                        <td className="text-text-secondary text-xs">
                          {formatRelative(s.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* NOTES TAB */}
          {tab === "notes" && (
            <div>
              {canEdit ? (
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1.5">
                    Internal notes
                  </label>
                  <textarea
                    className="input textarea w-full h-32"
                    placeholder="Add notes or context for this brand..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <button
                    className={`btn btn-sm mt-2 ${
                      saved ? "btn-secondary text-success-text" : "btn-primary"
                    }`}
                    onClick={handleSave}
                  >
                    <Save size={13} />
                    {saved ? "Saved!" : "Save notes"}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-text-secondary mb-2">
                    Internal notes
                  </p>
                  <div className="bg-surface-secondary rounded-md px-3 py-2.5">
                    <p className="text-xs text-text-primary leading-relaxed">
                      {brand.notes ?? "No notes for this brand yet."}
                    </p>
                  </div>
                </div>
              )}
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
