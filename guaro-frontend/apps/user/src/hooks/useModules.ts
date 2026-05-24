import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Module, Application } from "@guaro/types";

export function useModules() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: () => api.get<Module[]>("/modules"),
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
