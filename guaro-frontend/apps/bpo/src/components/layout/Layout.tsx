import { NavLink } from "react-router-dom";
import { LayoutList, History, LayoutGrid, Bell } from "lucide-react";
import { useAuth } from "@/store/auth";
import { Avatar } from "@/components/ui/Avatar";
import { DevSwitcher } from "@/components/ui/DevSwitcher";
import { TEAM_LABELS } from "@guaro/utils";

const navItems = [
  { to: "/", icon: LayoutList, label: "My tasks", end: true },
  { to: "/history", icon: History, label: "History", end: true },
  { to: "/brands", icon: LayoutGrid, label: "Brands", end: true },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();

  const bpoProfile = currentUser.bpoProfile;
  const weightPct = bpoProfile
    ? Math.round((bpoProfile.activeWeight / bpoProfile.maxWeight) * 100)
    : 0;

  return (
    <div className="flex h-screen bg-surface-tertiary overflow-hidden">
      <aside className="w-48 flex-shrink-0 bg-white border-r border-border flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <img
              src="/didi-logo.png"
              alt="DiDi"
              className="w-6 h-6 object-contain rounded bg-accent p-0.5"
            />
            <div>
              <p className="text-sm font-semibold text-text-primary">Guaro</p>
              <p className="text-[10px] text-text-tertiary">BPO workspace</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Workload + user */}
        <div className="p-3 border-t border-border space-y-3">
          {bpoProfile && (
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-text-tertiary">Workload</span>
                <span
                  className={`font-medium ${
                    weightPct >= 90
                      ? "text-danger-text"
                      : weightPct >= 70
                        ? "text-warning-text"
                        : "text-text-secondary"
                  }`}
                >
                  {bpoProfile.activeWeight}/{bpoProfile.maxWeight}
                </span>
              </div>
              <div className="h-1 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    weightPct >= 90
                      ? "bg-danger-text"
                      : weightPct >= 70
                        ? "bg-warning-text"
                        : "bg-info-text"
                  }`}
                  style={{ width: `${weightPct}%` }}
                />
              </div>
            </div>
          )}
          <DevSwitcher />
          <div className="flex items-center gap-2">
            <Avatar
              name={currentUser.name}
              avatarUrl={currentUser.avatarUrl}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-text-primary truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-text-tertiary truncate">
                {TEAM_LABELS[currentUser.team]}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="h-11 bg-white border-b border-border flex items-center
                           justify-between px-5 flex-shrink-0"
        >
          <div
            id="page-title"
            className="text-sm font-medium text-text-primary"
          />
          <button className="btn btn-ghost btn-sm p-1.5">
            <Bell size={15} className="text-text-secondary" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
