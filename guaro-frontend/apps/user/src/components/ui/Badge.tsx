import { getStatusBadgeClass } from "@guaro/utils";
import {
  TASK_STATUS_LABELS,
  BRAND_STATUS_LABELS,
  KA_TYPE_LABELS,
  EXECUTION_MODE_LABELS,
} from "@guaro/utils";

type BadgeStatus = string;

interface BadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
}

const LABEL_MAP: Record<string, string> = {
  ...TASK_STATUS_LABELS,
  ...BRAND_STATUS_LABELS,
  ...KA_TYPE_LABELS,
  ...EXECUTION_MODE_LABELS,
  SUCCESS: "Success",
  FAILED: "Failed",
  RETRYING: "Retrying",
  PENDING: "Pending",
};

export function Badge({ status, label, className = "" }: BadgeProps) {
  const badgeClass = getStatusBadgeClass(status);
  const displayLabel = label ?? LABEL_MAP[status] ?? status;

  return (
    <span className={`badge ${badgeClass} ${className}`}>{displayLabel}</span>
  );
}
