import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Task } from "@guaro/types";
import type { PaginatedResponse } from "./useBrands";

interface TaskQuery {
  brandId?: string;
  status?: string;
  assignedBpoId?: string;
  createdById?: string;
  taskTypeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useTasks(query: TaskQuery = {}) {
  const params = new URLSearchParams();
  if (query.brandId) params.set("brandId", query.brandId);
  if (query.status) params.set("status", query.status);
  if (query.assignedBpoId) params.set("assignedBpoId", query.assignedBpoId);
  if (query.createdById) params.set("createdById", query.createdById);
  if (query.taskTypeId) params.set("taskTypeId", query.taskTypeId);
  if (query.search) params.set("search", query.search);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));

  return useQuery({
    queryKey: ["tasks", query],
    queryFn: () =>
      api.get<PaginatedResponse<Task>>(`/tasks?${params.toString()}`),
    placeholderData: (prev) => prev,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: () => api.get<Task>(`/tasks/${id}`),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      taskTypeId: string;
      brandId: string;
      inputType?: string;
      inputValue?: string;
      formData?: Record<string, unknown>;
      priority?: string;
    }) => api.post<Task>("/tasks", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCancelTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Task>(`/tasks/${id}/cancel`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: string }) =>
      api.post(`/tasks/${taskId}/comments`, { body }),
    onSuccess: (_, { taskId }) => {
      qc.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
  });
}
