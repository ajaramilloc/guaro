import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockBrands } from "@guaro/mock-data";
import { Badge } from "@/components/ui/Badge";
import {
  getCountryFlag,
  PICKING_MODE_LABELS,
  PAYMENT_MODE_LABELS,
  MENU_METHOD_LABELS,
} from "@guaro/utils";
import { Download, ChevronRight, Search } from "lucide-react";
import type {
  Brand,
  KaType,
  BrandStatus,
  PickingMode,
  PaymentMode,
  MenuMethod,
} from "@guaro/types";

const COUNTRIES = ["MX", "CO", "CR", "BR"];
const KA_TYPES: KaType[] = ["KA", "CKA", "SME"];
const STATUSES: BrandStatus[] = ["ACTIVE", "INACTIVE", "PENDING"];
const PICKING_MODES: PickingMode[] = [
  "TWO_IN_ONE",
  "BAPP_PICKING",
  "DAPP_PICKING",
];
const PAYMENT_MODES: PaymentMode[] = [
  "PREPAID_CARD",
  "DIDI_PAYLESS",
  "FOOD_MODE",
];
const MENU_METHODS: MenuMethod[] = ["API", "SFTP", "BAPP"];

export function BrandsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [kaType, setKaType] = useState("");
  const [status, setStatus] = useState("");
  const [pickingMode, setPickingMode] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [menuMethod, setMenuMethod] = useState("");
  const [showExtraFilters, setShowExtraFilters] = useState(false);

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "Brands dashboard";
  }, []);

  const filtered = useMemo(() => {
    return mockBrands.filter((b) => {
      const q = search.toLowerCase();
      if (
        q &&
        !b.name.toLowerCase().includes(q) &&
        !b.merchant?.name.toLowerCase().includes(q)
      )
        return false;
      if (country && b.country !== country) return false;
      if (kaType && b.kaType !== kaType) return false;
      if (status && b.status !== status) return false;
      if (pickingMode && b.pickingMode !== pickingMode) return false;
      if (paymentMode && b.paymentMode !== paymentMode) return false;
      if (menuMethod && b.menuMethod !== menuMethod) return false;
      return true;
    });
  }, [search, country, kaType, status, pickingMode, paymentMode, menuMethod]);

  const clearFilters = () => {
    setSearch("");
    setCountry("");
    setKaType("");
    setStatus("");
    setPickingMode("");
    setPaymentMode("");
    setMenuMethod("");
  };

  const hasFilters =
    search ||
    country ||
    kaType ||
    status ||
    pickingMode ||
    paymentMode ||
    menuMethod;
  const hasExtraFilters = pickingMode || paymentMode || menuMethod;

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">
            Brands dashboard
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            {mockBrands.length} brands ·{" "}
            {new Set(mockBrands.map((b) => b.merchantId)).size} merchants
          </p>
        </div>
        <button className="btn btn-secondary btn-sm">
          <Download size={13} />
          Export
        </button>
      </div>

      {/* Filters row 1 */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand or merchant..."
            className="input pl-7 w-48"
          />
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="select w-28"
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {getCountryFlag(c)} {c}
            </option>
          ))}
        </select>
        <select
          value={kaType}
          onChange={(e) => setKaType(e.target.value)}
          className="select w-24"
        >
          <option value="">All types</option>
          {KA_TYPES.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="select w-28"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowExtraFilters((v) => !v)}
          className={`btn btn-sm ${showExtraFilters || hasExtraFilters ? "btn-primary" : "btn-secondary"}`}
        >
          {hasExtraFilters ? "● " : ""}Filters+
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-text-tertiary bg-surface-secondary border border-border px-2 py-1 rounded">
            {filtered.length} brand{filtered.length !== 1 ? "s" : ""}
          </span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-ghost btn-sm text-text-secondary"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filters row 2 — extra */}
      {showExtraFilters && (
        <div className="flex items-center gap-2 mb-3 flex-wrap p-3 bg-surface-secondary rounded-lg border border-border">
          <span className="text-xs text-text-tertiary font-medium">
            Config filters:
          </span>
          <select
            value={pickingMode}
            onChange={(e) => setPickingMode(e.target.value)}
            className="select w-36"
          >
            <option value="">All picking modes</option>
            {PICKING_MODES.map((p) => (
              <option key={p} value={p}>
                {PICKING_MODE_LABELS[p]}
              </option>
            ))}
          </select>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="select w-36"
          >
            <option value="">All payment modes</option>
            {PAYMENT_MODES.map((p) => (
              <option key={p} value={p}>
                {PAYMENT_MODE_LABELS[p]}
              </option>
            ))}
          </select>
          <select
            value={menuMethod}
            onChange={(e) => setMenuMethod(e.target.value)}
            className="select w-32"
          >
            <option value="">All menu methods</option>
            {MENU_METHODS.map((m) => (
              <option key={m} value={m}>
                {MENU_METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th className="w-[18%]">Brand</th>
              <th className="w-[14%]">Merchant</th>
              <th className="w-[7%]">Country</th>
              <th className="w-[7%]">KA type</th>
              <th className="w-[14%]">Application</th>
              <th className="w-[10%]">Picking mode</th>
              <th className="w-[10%]">Payment mode</th>
              <th className="w-[8%]">Menu</th>
              <th className="w-[7%]">Status</th>
              <th className="w-[4%]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-10 text-text-tertiary text-xs"
                >
                  No brands match your filters
                </td>
              </tr>
            )}
            {filtered.map((brand) => (
              <BrandRow
                key={brand.id}
                brand={brand}
                onClick={() => navigate(`/brands/${brand.id}`)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BrandRow({ brand, onClick }: { brand: Brand; onClick: () => void }) {
  const primaryApp = brand.applications?.find((a) => a.isPrimary)?.application;

  return (
    <tr onClick={onClick}>
      <td>
        <div className="flex items-center gap-1.5">
          {brand.isSubBrand && (
            <span className="text-text-tertiary text-xs">↳</span>
          )}
          <span
            className="font-medium text-text-primary truncate max-w-[130px]"
            title={brand.name}
          >
            {brand.name}
          </span>
        </div>
      </td>
      <td
        className="text-text-secondary truncate max-w-[100px]"
        title={brand.merchant?.name}
      >
        {brand.merchant?.name}
      </td>
      <td className="text-text-secondary">
        {getCountryFlag(brand.country)} {brand.country}
      </td>
      <td>
        <Badge status={brand.kaType} />
      </td>
      <td>
        <span
          className="text-text-tertiary text-xs font-mono truncate block max-w-[110px]"
          title={primaryApp?.appName}
        >
          {primaryApp?.appName ?? "—"}
        </span>
      </td>
      <td className="text-text-secondary text-xs">
        {brand.pickingMode ? PICKING_MODE_LABELS[brand.pickingMode] : "—"}
      </td>
      <td className="text-text-secondary text-xs">
        {brand.paymentMode ? PAYMENT_MODE_LABELS[brand.paymentMode] : "—"}
      </td>
      <td className="text-text-secondary text-xs">
        {brand.menuMethod ? MENU_METHOD_LABELS[brand.menuMethod] : "—"}
      </td>
      <td>
        <Badge status={brand.status} />
      </td>
      <td>
        <ChevronRight size={14} className="text-text-tertiary" />
      </td>
    </tr>
  );
}
