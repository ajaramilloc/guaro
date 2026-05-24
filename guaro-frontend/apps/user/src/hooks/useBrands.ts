import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Brand } from "@guaro/types";

interface BrandQuery {
  country?: string;
  kaType?: string;
  status?: string;
  assignedOpId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function useBrands(query: BrandQuery = {}) {
  const params = new URLSearchParams();
  if (query.country) params.set("country", query.country);
  if (query.kaType) params.set("kaType", query.kaType);
  if (query.status) params.set("status", query.status);
  if (query.assignedOpId) params.set("assignedOpId", query.assignedOpId);
  if (query.search) params.set("search", query.search);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 25));

  return useQuery({
    queryKey: ["brands", query],
    queryFn: () =>
      api.get<PaginatedResponse<Brand>>(`/brands?${params.toString()}`),
    placeholderData: (prev) => prev,
  });
}

export function useBrand(id: string) {
  return useQuery({
    queryKey: ["brands", id],
    queryFn: () => api.get<Brand>(`/brands/${id}`),
    enabled: !!id,
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Brand> }) =>
      api.patch<Brand>(`/brands/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}
