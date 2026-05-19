import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/store/auth";
import { Layout } from "@/components/layout/Layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { BpoWorkloadPage } from "@/pages/BpoWorkloadPage";
import { BpoAnalyticsPage } from "@/pages/BpoAnalyticsPage";
import { ModulePage } from "@/pages/ModulePage";
import { WebhooksPage } from "@/pages/WebhooksPage";
import { UsersPage } from "@/pages/UsersPage";
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
              <Route path="/" element={<DashboardPage />} />
              <Route path="/bpo-workload" element={<BpoWorkloadPage />} />
              <Route path="/bpo-analytics" element={<BpoAnalyticsPage />} />
              <Route path="/modules/:moduleId" element={<ModulePage />} />
              <Route path="/webhooks" element={<WebhooksPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/merchants" element={<MerchantsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
