import { getInitials, getAvatarColor } from "@guaro/utils";

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-7 h-7 text-xs",
  lg: "w-9 h-9 text-sm",
};

export function Avatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = getInitials(name);
  const color = getAvatarColor(name);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0 ${className}`}
      style={{ background: color }}
      title={name}
    >
      {initials}
    </div>
  );
}
