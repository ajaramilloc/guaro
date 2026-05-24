import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrands } from "@/hooks/useBrands";
import { useAuth } from "@/store/auth";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import {
  getCountryFlag,
  PICKING_MODE_LABELS,
  PAYMENT_MODE_LABELS,
  MENU_METHOD_LABELS,
} from "@guaro/utils";
import { Search, ChevronRight } from "lucide-react";
import type { Brand } from "@guaro/types";

const COUNTRIES = ["MX", "CO", "CR", "BR"];

export function BrandsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [showMine, setShowMine] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "Brands";
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, country, showMine]);

  const bpoProfileId = (currentUser as any)?.bpoProfile?.id;

  const { data: brandsResponse, isLoading } = useBrands({
    search: search || undefined,
    country: country || undefined,
    assignedOpId: showMine ? bpoProfileId : undefined,
    page,
    limit: 25,
  });

  const brands = brandsResponse?.data ?? [];

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">Brands</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            {isLoading ? "Loading..." : `${brandsResponse?.total ?? 0} brands`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            className="input pl-7 w-48"
            placeholder="Search brand or merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select w-28"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {getCountryFlag(c)} {c}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowMine((v) => !v)}
          className={`btn btn-sm ${showMine ? "btn-primary" : "btn-secondary"}`}
        >
          {showMine ? "★ My brands" : "☆ My brands"}
        </button>
        {(search || country || showMine) && (
          <button
            onClick={() => {
              setSearch("");
              setCountry("");
              setShowMine(false);
            }}
            className="btn btn-ghost btn-sm text-text-secondary"
          >
            Clear
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th className="w-[20%]">Brand</th>
              <th className="w-[14%]">Merchant</th>
              <th className="w-[8%]">Country</th>
              <th className="w-[8%]">KA type</th>
              <th className="w-[14%]">Application</th>
              <th className="w-[10%]">Picking</th>
              <th className="w-[10%]">Payment</th>
              <th className="w-[8%]">Status</th>
              <th className="w-[4%]"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-10 text-text-tertiary text-xs"
                >
                  Loading brands...
                </td>
              </tr>
            )}
            {!isLoading && brands.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-10 text-text-tertiary text-xs"
                >
                  No brands found
                </td>
              </tr>
            )}
            {brands.map((brand) => (
              <BrandRow
                key={brand.id}
                brand={brand}
                myBpoId={bpoProfileId}
                onClick={() => navigate(`/brands/${brand.id}`)}
              />
            ))}
          </tbody>
        </table>

        {brandsResponse && brandsResponse.pages > 1 && (
          <Pagination
            page={brandsResponse.page}
            pages={brandsResponse.pages}
            total={brandsResponse.total}
            limit={brandsResponse.limit}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

function BrandRow({
  brand,
  myBpoId,
  onClick,
}: {
  brand: Brand;
  myBpoId: string;
  onClick: () => void;
}) {
  const primaryApp = brand.applications?.find((a) => a.isPrimary)?.application;
  const isMyBrand = brand.assignedOpId === myBpoId;

  return (
    <tr onClick={onClick} className={isMyBrand ? "bg-purple-bg/30" : ""}>
      <td>
        <div className="flex items-center gap-1.5">
          {brand.isSubBrand && (
            <span className="text-text-tertiary text-xs">↳</span>
          )}
          <span className="font-medium text-text-primary truncate max-w-[130px]">
            {brand.name}
          </span>
          {isMyBrand && (
            <span className="text-[10px] bg-purple-bg text-purple-text rounded px-1.5 py-0.5 flex-shrink-0">
              yours
            </span>
          )}
        </div>
      </td>
      <td className="text-text-secondary text-xs">{brand.merchant?.name}</td>
      <td className="text-text-secondary text-xs">
        {getCountryFlag(brand.country)} {brand.country}
      </td>
      <td>
        <Badge status={brand.kaType} />
      </td>
      <td className="text-text-tertiary text-xs font-mono truncate max-w-[100px]">
        {primaryApp?.appName ?? "—"}
      </td>
      <td className="text-text-secondary text-xs">
        {brand.pickingMode ? PICKING_MODE_LABELS[brand.pickingMode] : "—"}
      </td>
      <td className="text-text-secondary text-xs">
        {brand.paymentMode ? PAYMENT_MODE_LABELS[brand.paymentMode] : "—"}
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
