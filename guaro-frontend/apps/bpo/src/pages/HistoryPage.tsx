import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/store/auth";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { formatRelative } from "@guaro/utils";
import { Search, ChevronRight } from "lucide-react";

export function HistoryPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "History";
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const bpoProfileId = (currentUser as any)?.bpoProfile?.id;

  const { data: tasksResponse, isLoading } = useTasks({
    assignedBpoId: bpoProfileId,
    status: "COMPLETED",
    search: search || undefined,
    page,
    limit: 20,
  });

  const tasks = tasksResponse?.data ?? [];

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">History</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            {isLoading
              ? "Loading..."
              : `${tasksResponse?.total ?? 0} completed tasks`}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              className="input input-sm pl-7 w-44"
              placeholder="Search task or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="btn btn-ghost btn-sm text-text-secondary"
            >
              Clear
            </button>
          )}
          <span className="ml-auto text-xs text-text-tertiary">
            {tasks.length} on this page
          </span>
        </div>

        <table className="table-base">
          <thead>
            <tr>
              <th className="w-[24%]">Task</th>
              <th className="w-[20%]">Brand</th>
              <th className="w-[14%]">Section</th>
              <th className="w-[10%]">Type</th>
              <th className="w-[12%]">Status</th>
              <th className="w-[16%]">Completed</th>
              <th className="w-[4%]"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-text-tertiary text-xs"
                >
                  Loading history...
                </td>
              </tr>
            )}
            {!isLoading && tasks.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-text-tertiary text-xs"
                >
                  No completed tasks yet
                </td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr key={task.id} onClick={() => navigate(`/tasks/${task.id}`)}>
                <td className="font-medium">{task.taskType?.name ?? "—"}</td>
                <td>
                  <p className="text-xs text-text-primary">
                    {task.brand?.name ?? "—"}
                  </p>
                  <p className="text-[10px] text-text-tertiary">
                    {task.brand?.country}
                  </p>
                </td>
                <td className="text-text-secondary text-xs">
                  {task.taskType?.section?.name ?? "—"}
                </td>
                <td>
                  {task.taskType && (
                    <Badge status={task.taskType.executionMode} />
                  )}
                </td>
                <td>
                  <Badge status={task.status} />
                </td>
                <td className="text-text-secondary text-xs">
                  {task.completedAt ? formatRelative(task.completedAt) : "—"}
                </td>
                <td>
                  <ChevronRight size={13} className="text-text-tertiary" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tasksResponse && tasksResponse.pages > 1 && (
          <Pagination
            page={tasksResponse.page}
            pages={tasksResponse.pages}
            total={tasksResponse.total}
            limit={tasksResponse.limit}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
