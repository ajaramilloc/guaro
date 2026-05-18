// ─────────────────────────────────────────
// AVATAR UTILITIES
// ─────────────────────────────────────────

const AVATAR_COLORS = [
  "#4F46E5",
  "#7C3AED",
  "#DB2777",
  "#DC2626",
  "#D97706",
  "#059669",
  "#0891B2",
  "#2563EB",
  "#9333EA",
  "#C2410C",
  "#0D9488",
  "#1D4ED8",
];

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getUsernameFromEmail(email: string): string {
  return email.split("@")[0];
}

// ─────────────────────────────────────────
// DATE FORMATTERS
// ─────────────────────────────────────────

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelative(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function formatETA(slaHours: number, createdAt: string): string {
  const eta = new Date(new Date(createdAt).getTime() + slaHours * 3600000);
  const now = new Date();

  if (eta < now) return "Overdue";

  const diffMs = eta.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffHours < 1) return "Due soon";
  if (diffHours < 24) {
    return `Today ${eta.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return formatDate(eta);
}

// ─────────────────────────────────────────
// LABEL MAPS
// ─────────────────────────────────────────

export const KA_TYPE_LABELS = {
  KA: "KA",
  CKA: "CKA",
  SME: "SME",
} as const;

export const PICKING_MODE_LABELS = {
  TWO_IN_ONE: "2in1",
  BAPP_PICKING: "BApp Picking",
  DAPP_PICKING: "DApp Picking",
} as const;

export const PAYMENT_MODE_LABELS = {
  PREPAID_CARD: "Prepaid Card",
  DIDI_PAYLESS: "DiDi Payless",
  FOOD_MODE: "Food Mode",
} as const;

export const MENU_METHOD_LABELS = {
  API: "API",
  SFTP: "SFTP",
  BAPP: "BApp",
} as const;

export const TASK_STATUS_LABELS = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  BLOCKED: "Blocked",
} as const;

export const EXECUTION_MODE_LABELS = {
  AUTOMATED: "Automated",
  MANUAL: "Manual",
  HYBRID: "Hybrid",
} as const;

export const BRAND_STATUS_LABELS = {
  PENDING: "Pending",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
} as const;

export const TEAM_LABELS = {
  CATALOG: "Catalog",
  MERCHANT_PERFORMANCE: "Merchant Performance",
  COMMERCIAL: "Commercial",
  PRODUCT: "Product",
  USER_GROWTH: "User Growth",
  DIRECTOR: "Director",
} as const;

export const ROLE_LABELS = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Admin",
  USER: "User",
  BPO: "BPO",
} as const;

// ─────────────────────────────────────────
// CSS CLASS HELPERS
// ─────────────────────────────────────────

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    PENDING: "badge-warning",
    IN_PROGRESS: "badge-info",
    COMPLETED: "badge-success",
    FAILED: "badge-danger",
    CANCELLED: "badge-neutral",
    BLOCKED: "badge-danger",
    ACTIVE: "badge-success",
    INACTIVE: "badge-neutral",
    KA: "badge-purple",
    CKA: "badge-teal",
    SME: "badge-amber",
    AUTOMATED: "badge-purple",
    MANUAL: "badge-neutral",
    HYBRID: "badge-teal",
  };
  return map[status] ?? "badge-neutral";
}

// ─────────────────────────────────────────
// MISC
// ─────────────────────────────────────────

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    MX: "🇲🇽",
    CO: "🇨🇴",
    BR: "🇧🇷",
    CR: "🇨🇷",
  };
  return flags[country] ?? country;
}
