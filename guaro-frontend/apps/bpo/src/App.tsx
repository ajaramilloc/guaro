import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/store/auth";
import { Layout } from "@/components/layout/Layout";
import { TasksPage } from "@/pages/TasksPage";
import { TaskDetailPage } from "@/pages/TaskDetailPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { BrandsPage } from "@/pages/BrandsPage";
import { BrandTrackerPage } from "@/pages/BrandTrackerPage";
import { MerchantsPage } from "@/pages/MerchantsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<TasksPage />} />
              <Route path="/tasks/:id" element={<TaskDetailPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/brands/:id" element={<BrandTrackerPage />} />
              <Route path="/merchants" element={<MerchantsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
