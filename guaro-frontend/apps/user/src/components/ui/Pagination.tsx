import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, total, limit, onPageChange }: Props) {
  if (pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  function getPageNumbers(): (number | -1)[] {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

    if (page <= 4) return [1, 2, 3, 4, 5, -1, pages];
    if (page >= pages - 3)
      return [1, -1, pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, -1, page - 1, page, page + 1, -1, pages];
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <p className="text-xs text-text-tertiary">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn btn-ghost btn-sm p-1.5 disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        {getPageNumbers().map((p, i) =>
          p === -1 ? (
            <span
              key={`ellipsis-${i}`}
              className="text-text-tertiary text-xs px-1"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 text-xs rounded transition-colors ${
                p === page
                  ? "bg-accent text-white font-medium"
                  : "text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="btn btn-ghost btn-sm p-1.5 disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
