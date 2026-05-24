import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/store/auth";
import { Layout } from "@/components/layout/Layout";
import { LoginPage } from "@/pages/LoginPage";
import { TasksPage } from "@/pages/TasksPage";
import { TaskDetailPage } from "@/pages/TaskDetailPage";
import { BrandsPage } from "@/pages/BrandsPage";
import { MerchantsPage } from "@/pages/MerchantsPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { BrandTrackerPage } from "@/pages/BrandTrackerPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function AppRoutes() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-xs text-text-tertiary">Loading...</div>
      </div>
    );
  }

  if (!currentUser) return <LoginPage />;

  return (
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
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
