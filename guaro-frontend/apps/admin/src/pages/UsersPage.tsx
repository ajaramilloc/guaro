import { useState, useEffect } from "react";
import { mockUsers, mockModules } from "@guaro/mock-data";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/store/auth";
import {
  ROLE_LABELS,
  TEAM_LABELS,
  formatDate,
  getUsernameFromEmail,
} from "@guaro/utils";
import { Plus, X, Copy, Check, Search, UserX, UserCheck } from "lucide-react";
import type { Role, Team } from "@guaro/types";

const ROLES: Role[] = ["ADMIN", "USER", "BPO"];
const TEAMS: Team[] = [
  "CATALOG",
  "MERCHANT_PERFORMANCE",
  "COMMERCIAL",
  "PRODUCT",
  "USER_GROWTH",
  "DIRECTOR",
];

const MOCK_INVITATIONS = [
  {
    id: "inv-1",
    role: "BPO" as Role,
    team: "CATALOG" as Team,
    createdAt: "2026-05-14T10:00:00Z",
    expiresAt: "2026-05-21T10:00:00Z",
    used: false,
  },
  {
    id: "inv-2",
    role: "USER" as Role,
    team: "COMMERCIAL" as Team,
    createdAt: "2026-05-13T09:00:00Z",
    expiresAt: "2026-05-20T09:00:00Z",
    used: true,
  },
];

type Tab = "users" | "invitations";

export function UsersPage() {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser.role === "SUPERADMIN";
  const adminTeam = currentUser.team;

  const [tab, setTab] = useState<Tab>("users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRole, setInviteRole] = useState<Role>("USER");
  const [inviteTeam, setInviteTeam] = useState<Team>("COMMERCIAL");
  const [inviteModule, setInviteModule] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [userStates, setUserStates] = useState<Record<string, boolean>>(
    Object.fromEntries(mockUsers.map((u) => [u.id, u.isActive])),
  );

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el)
      el.textContent = isSuperAdmin ? "Users & invitations" : "Invitations";
  }, [isSuperAdmin]);

  // Admin only sees their team, superadmin sees all
  const visibleUsers = isSuperAdmin
    ? mockUsers
    : mockUsers.filter((u) => u.team === adminTeam);

  const filtered = visibleUsers.filter((u) => {
    const q = search.toLowerCase();
    if (
      q &&
      !u.name.toLowerCase().includes(q) &&
      !u.email.toLowerCase().includes(q)
    )
      return false;
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  function generateLink() {
    const token = Math.random().toString(36).substring(2, 18);
    const link = `https://app.guaro.didi-labs.com/invite/${token}`;
    setGeneratedLink(link);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const el = document.createElement("textarea");
      el.value = generatedLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function toggleUserActive(userId: string) {
    setUserStates((s) => ({ ...s, [userId]: !s[userId] }));
  }

  // Admin can only invite their own team
  const availableTeams = isSuperAdmin ? TEAMS : [adminTeam];

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">
            {isSuperAdmin ? "Users & invitations" : "Invitations"}
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            Manage team members and invite new users
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setShowInviteModal(true);
            setGeneratedLink("");
          }}
        >
          <Plus size={13} />
          Invite user
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {(
          [
            { id: "users", label: `Users (${visibleUsers.length})` },
            {
              id: "invitations",
              label: `Invitations (${MOCK_INVITATIONS.length})`,
            },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? "border-accent text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* USERS TAB */}
      {tab === "users" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                className="input pl-7 w-48"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {isSuperAdmin && (
              <select
                className="select w-28"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            )}
            {(search || roleFilter) && (
              <button
                className="btn btn-ghost btn-sm text-text-secondary"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("");
                }}
              >
                Clear
              </button>
            )}
            <span className="ml-auto text-xs text-text-tertiary">
              {filtered.length} user{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="card overflow-hidden">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="w-[26%]">User</th>
                  <th className="w-[20%]">Email</th>
                  <th className="w-[12%]">Role</th>
                  <th className="w-[16%]">Team</th>
                  <th className="w-[12%]">Joined</th>
                  <th className="w-[8%]">Status</th>
                  <th className="w-[6%]"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isActive = userStates[u.id] ?? u.isActive;
                  return (
                    <tr key={u.id} className={!isActive ? "opacity-50" : ""}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={u.name}
                            avatarUrl={u.avatarUrl}
                            size="sm"
                          />
                          <span className="text-xs font-medium text-text-primary">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-text-secondary text-xs font-mono">
                        {getUsernameFromEmail(u.email)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === "SUPERADMIN"
                              ? "badge-purple"
                              : u.role === "ADMIN"
                                ? "badge-teal"
                                : u.role === "BPO"
                                  ? "badge-amber"
                                  : "badge-neutral"
                          }`}
                        >
                          {ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      <td className="text-text-secondary text-xs">
                        {TEAM_LABELS[u.team]}
                      </td>
                      <td className="text-text-secondary text-xs">
                        {formatDate(u.createdAt)}
                      </td>
                      <td>
                        <Badge
                          status={isActive ? "ACTIVE" : "INACTIVE"}
                          label={isActive ? "Active" : "Inactive"}
                        />
                      </td>
                      <td>
                        {u.role !== "SUPERADMIN" && (
                          <button
                            className={`btn btn-ghost btn-sm p-1 ${
                              isActive
                                ? "text-danger-text hover:bg-danger-bg"
                                : "text-success-text hover:bg-success-bg"
                            }`}
                            title={
                              isActive ? "Deactivate user" : "Activate user"
                            }
                            onClick={() => toggleUserActive(u.id)}
                          >
                            {isActive ? (
                              <UserX size={14} />
                            ) : (
                              <UserCheck size={14} />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVITATIONS TAB */}
      {tab === "invitations" && (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-[30%]">Link</th>
                <th className="w-[12%]">Role</th>
                <th className="w-[18%]">Team</th>
                <th className="w-[15%]">Created</th>
                <th className="w-[15%]">Expires</th>
                <th className="w-[10%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_INVITATIONS.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-[11px] text-text-tertiary">
                    guaro.didi-labs.com/invite/••••••
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        inv.role === "ADMIN"
                          ? "badge-teal"
                          : inv.role === "BPO"
                            ? "badge-amber"
                            : "badge-neutral"
                      }`}
                    >
                      {ROLE_LABELS[inv.role]}
                    </span>
                  </td>
                  <td className="text-text-secondary text-xs">
                    {TEAM_LABELS[inv.team]}
                  </td>
                  <td className="text-text-secondary text-xs">
                    {formatDate(inv.createdAt)}
                  </td>
                  <td className="text-text-secondary text-xs">
                    {formatDate(inv.expiresAt)}
                  </td>
                  <td>
                    <Badge
                      status={inv.used ? "INACTIVE" : "ACTIVE"}
                      label={inv.used ? "Used" : "Pending"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-modal w-96 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">
                Invite user
              </h3>
              <button onClick={() => setShowInviteModal(false)}>
                <X size={16} className="text-text-secondary" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Role <span className="text-danger-text">*</span>
                </label>
                <select
                  className="select w-full"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Team <span className="text-danger-text">*</span>
                </label>
                <select
                  className="select w-full"
                  value={inviteTeam}
                  onChange={(e) => setInviteTeam(e.target.value as Team)}
                >
                  {availableTeams.map((t) => (
                    <option key={t} value={t}>
                      {TEAM_LABELS[t]}
                    </option>
                  ))}
                </select>
                {!isSuperAdmin && (
                  <p className="text-[11px] text-text-tertiary mt-1">
                    You can only invite users to your team.
                  </p>
                )}
              </div>
              {inviteRole === "ADMIN" && isSuperAdmin && (
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1.5">
                    Module <span className="text-danger-text">*</span>
                  </label>
                  <select
                    className="select w-full"
                    value={inviteModule}
                    onChange={(e) => setInviteModule(e.target.value)}
                  >
                    <option value="">Select module...</option>
                    {mockModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="bg-info-bg border border-info-border rounded-md px-3 py-2">
                <p className="text-xs text-info-text">
                  Link expires in <strong>7 days</strong> and can only be used
                  once. The user must sign in with their{" "}
                  <strong>@didi-labs.com</strong> Google account.
                </p>
              </div>
            </div>

            {/* Generated link */}
            {generatedLink && (
              <div className="mb-4">
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Invitation link — ready to share
                </label>
                <div className="flex gap-2">
                  <input
                    className="input flex-1 font-mono text-[11px]"
                    value={generatedLink}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    className={`btn btn-sm flex-shrink-0 ${
                      copied
                        ? "btn-secondary text-success-text"
                        : "btn-secondary"
                    }`}
                    onClick={copyLink}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowInviteModal(false)}
              >
                Close
              </button>
              <button className="btn btn-primary btn-sm" onClick={generateLink}>
                {generatedLink ? "Regenerate" : "Generate link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
