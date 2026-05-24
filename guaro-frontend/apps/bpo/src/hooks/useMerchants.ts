import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Merchant {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  appName: string;
  country: string;
  appId?: string;
  appSecret?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export function useMerchants() {
  return useQuery({
    queryKey: ["merchants"],
    queryFn: () => api.get<Merchant[]>("/merchants"),
  });
}

export function useApplications(country?: string) {
  return useQuery({
    queryKey: ["applications", country],
    queryFn: () =>
      api.get<Application[]>(
        `/applications${country ? `?country=${country}` : ""}`,
      ),
  });
}

export function useCreateMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      api.post<Merchant>("/merchants", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchants"] });
    },
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      appName: string;
      country: string;
      appId?: string;
      appSecret?: string;
      notes?: string;
    }) => api.post<Application>("/applications", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}
