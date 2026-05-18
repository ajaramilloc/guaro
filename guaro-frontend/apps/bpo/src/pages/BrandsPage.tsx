import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockBrands, mockUsers } from "@guaro/mock-data";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/store/auth";
import {
  getCountryFlag,
  PICKING_MODE_LABELS,
  PAYMENT_MODE_LABELS,
  MENU_METHOD_LABELS,
} from "@guaro/utils";
import { Search, ChevronRight } from "lucide-react";
import type { Brand } from "@guaro/types";

const bpoUsers = mockUsers.filter((u) => u.role === "BPO");

export function BrandsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "mine">("mine");
  const [bpoFilter, setBpoFilter] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "Brands";
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
      if (filter === "mine" && b.assignedOpId !== currentUser.bpoProfile?.id)
        return false;
      if (bpoFilter && b.assignedOpId !== bpoFilter) return false;
      if (country && b.country !== country) return false;
      return true;
    });
  }, [search, filter, bpoFilter, country, currentUser]);

  const clearFilters = () => {
    setSearch("");
    setBpoFilter("");
    setCountry("");
  };

  const hasFilters = search || bpoFilter || country;

  return (
    <div className="p-5">
      <div className="mb-4">
        <h1 className="text-base font-semibold text-text-primary">Brands</h1>
        <p className="text-xs text-text-tertiary mt-0.5">
          View and update brand information
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand..."
            className="input pl-7 w-44"
          />
        </div>

        {/* My brands / All toggle */}
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            onClick={() => setFilter("mine")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === "mine"
                ? "bg-accent text-white"
                : "bg-white text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            My brands
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-border ${
              filter === "all"
                ? "bg-accent text-white"
                : "bg-white text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            All brands
          </button>
        </div>

        {/* Only show BPO and country filters when viewing all */}
        {filter === "all" && (
          <>
            <select
              value={bpoFilter}
              onChange={(e) => setBpoFilter(e.target.value)}
              className="select w-36"
            >
              <option value="">All BPOs</option>
              {bpoUsers.map((u) => (
                <option key={u.bpoProfile?.id} value={u.bpoProfile?.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="select w-28"
            >
              <option value="">All countries</option>
              {["MX", "CO", "CR", "BR"].map((c) => (
                <option key={c} value={c}>
                  {getCountryFlag(c)} {c}
                </option>
              ))}
            </select>
          </>
        )}

        {hasFilters && filter === "all" && (
          <button
            onClick={clearFilters}
            className="btn btn-ghost btn-sm text-text-secondary"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-xs text-text-tertiary">
          {filtered.length} brand{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-text-tertiary text-xs">
          {filter === "mine"
            ? "No brands assigned to you as OP"
            : "No brands match your filters"}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-[18%]">Brand</th>
                <th className="w-[13%]">Merchant</th>
                <th className="w-[8%]">Country</th>
                <th className="w-[7%]">KA type</th>
                <th className="w-[10%]">Picking</th>
                <th className="w-[11%]">Payment</th>
                <th className="w-[7%]">Menu</th>
                <th className="w-[12%]">BPO (OP)</th>
                <th className="w-[4%]"></th>
              </tr>
            </thead>
            <tbody>
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
      )}
    </div>
  );
}

function BrandRow({ brand, onClick }: { brand: Brand; onClick: () => void }) {
  const opUser = mockUsers.find((u) => u.bpoProfile?.id === brand.assignedOpId);

  return (
    <tr onClick={onClick}>
      <td>
        <div className="flex items-center gap-1.5">
          {brand.isSubBrand && (
            <span className="text-text-tertiary text-xs">↳</span>
          )}
          <span
            className="font-medium text-text-primary truncate max-w-[120px]"
            title={brand.name}
          >
            {brand.name}
          </span>
        </div>
      </td>
      <td className="text-text-secondary text-xs truncate max-w-[90px]">
        {brand.merchant?.name}
      </td>
      <td className="text-text-secondary text-xs">
        {getCountryFlag(brand.country)} {brand.country}
      </td>
      <td>
        <Badge status={brand.kaType} />
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
        {opUser ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={opUser.name} size="xs" />
            <span className="text-xs text-text-secondary truncate max-w-[70px]">
              {opUser.name.split(" ")[0]}
            </span>
          </div>
        ) : (
          <span className="text-text-tertiary text-xs">—</span>
        )}
      </td>
      <td>
        <ChevronRight size={14} className="text-text-tertiary" />
      </td>
    </tr>
  );
}
