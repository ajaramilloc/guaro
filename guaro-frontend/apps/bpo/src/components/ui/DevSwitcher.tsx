import { useState } from "react";
import { useAuth } from "@/store/auth";
import { Avatar } from "@/components/ui/Avatar";
import { ChevronDown } from "lucide-react";

const DEV_USERS = [
  {
    email: "carlos.perez@didi-labs.com",
    name: "Carlos Pérez",
    label: "BPO · User Growth",
  },
  {
    email: "maria.rodriguez@didi-labs.com",
    name: "María Rodríguez",
    label: "BPO · Catalog",
  },
  {
    email: "ana.lopez@didi-labs.com",
    name: "Ana López",
    label: "BPO · Catalog",
  },
];

export function DevSwitcher() {
  const { currentUser, login, isDevMode } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isDevMode) return null;

  async function handleSwitch(email: string) {
    setLoading(true);
    try {
      await login(email);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2 py-1 text-xs bg-amber-bg
                   text-amber-text border border-amber-border rounded font-medium w-full"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-text animate-pulse" />
        <span className="truncate">
          DEV: {currentUser?.name.split(" ")[0] ?? "Not logged in"}
        </span>
        <ChevronDown size={12} className="ml-auto flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute bottom-full mb-1 left-0 w-56 card shadow-dropdown z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <p className="section-label">Switch BPO user</p>
          </div>
          {DEV_USERS.map((u) => (
            <button
              key={u.email}
              onClick={() => handleSwitch(u.email)}
              disabled={loading}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left
                         hover:bg-surface-secondary transition-colors disabled:opacity-50 ${
                           currentUser?.email === u.email
                             ? "bg-surface-secondary"
                             : ""
                         }`}
            >
              <Avatar name={u.name} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">
                  {u.name}
                </p>
                <p className="text-[10px] text-text-tertiary">{u.label}</p>
              </div>
              {currentUser?.email === u.email && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-success-text flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
