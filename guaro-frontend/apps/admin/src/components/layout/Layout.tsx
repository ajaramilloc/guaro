import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Users,
  BarChart2,
  Webhook,
  UserPlus,
  Building2,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { Avatar } from "@/components/ui/Avatar";
import { DevSwitcher } from "@/components/ui/DevSwitcher";
import { TEAM_LABELS, ROLE_LABELS } from "@guaro/utils";
import { mockModules } from "@guaro/mock-data";

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser.role === "SUPERADMIN";
  const adminModule = currentUser.adminProfile?.moduleId;
  const moduleName = mockModules.find((m) => m.id === adminModule)?.name;

  return (
    <div className="flex h-screen bg-surface-tertiary overflow-hidden">
      <aside className="w-52 flex-shrink-0 bg-white border-r border-border flex flex-col">
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
              <p className="text-[10px] text-text-tertiary">Admin workspace</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {/* Superadmin — Overview */}
          {isSuperAdmin && (
            <>
              <p className="section-label px-3 pt-2 pb-1">Overview</p>
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" end />
              <NavItem
                to="/bpo-workload"
                icon={Users}
                label="BPO workload"
                end
              />
              <NavItem
                to="/bpo-analytics"
                icon={BarChart2}
                label="BPO analytics"
                end
              />
              <NavItem to="/merchants" icon={Building2} label="Merchants" end />
              <NavItem to="/users" icon={UserPlus} label="Users & roles" end />
            </>
          )}

          {/* Modules */}
          <p className="section-label px-3 pt-3 pb-1">
            {isSuperAdmin ? "Modules" : (moduleName ?? "My module")}
          </p>

          {isSuperAdmin
            ? mockModules.map((mod) => (
                <NavLink
                  key={mod.id}
                  to={`/modules/${mod.id}`}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <Settings size={15} />
                  <span className="truncate">{mod.name}</span>
                </NavLink>
              ))
            : adminModule && (
                <>
                  <NavItem
                    to="/"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    end
                  />
                  <NavItem
                    to="/bpo-workload"
                    icon={Users}
                    label="BPO workload"
                    end
                  />
                  <NavItem
                    to="/bpo-analytics"
                    icon={BarChart2}
                    label="BPO analytics"
                    end
                  />
                  <NavItem
                    to={`/modules/${adminModule}`}
                    icon={Settings}
                    label="Task types"
                    end
                  />
                  <NavItem to="/webhooks" icon={Webhook} label="Webhooks" end />
                  <NavItem
                    to="/users"
                    icon={UserPlus}
                    label="Invitations"
                    end
                  />
                </>
              )}

          {/* Superadmin — System */}
          {isSuperAdmin && (
            <>
              <p className="section-label px-3 pt-3 pb-1">System</p>
              <NavItem to="/webhooks" icon={Webhook} label="Webhooks" end />
              <NavItem
                to="/users"
                icon={UserPlus}
                label="Users & invitations"
                end
              />
            </>
          )}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border space-y-2">
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
                {ROLE_LABELS[currentUser.role]}
                {moduleName && ` · ${moduleName}`}
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

function NavItem({
  to,
  icon: Icon,
  label,
  end = false,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
    >
      <Icon size={15} />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
