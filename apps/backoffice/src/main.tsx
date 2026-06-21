import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext.js";
import { AppShell } from "./layout/AppShell.js";
import { LoginPage } from "./pages/auth/LoginPage.js";
import { DashboardPage } from "./pages/dashboard/DashboardPage.js";
import { ProvidersPage } from "./pages/aggregator/ProvidersPage.js";
import { VendorsPage } from "./pages/aggregator/VendorsPage.js";
import { GamesPage } from "./pages/aggregator/GamesPage.js";
import { OperatorsPage } from "./pages/aggregator/OperatorsPage.js";
import { AgentsPage } from "./pages/aggregator/AgentsPage.js";
import { RoutesPage } from "./pages/aggregator/RoutesPage.js";
import { PlayersPage } from "./pages/b2c/PlayersPage.js";
import { PaymentsPage } from "./pages/b2c/PaymentsPage.js";
import { BonusesPage } from "./pages/b2c/BonusesPage.js";
import { WhiteLabelsPage } from "./pages/b2b/WhiteLabelsPage.js";
import { CrmPage } from "./pages/b2b/CrmPage.js";
import { InvoicesPage } from "./pages/b2b/InvoicesPage.js";
import { MediaCenterPage } from "./pages/media/MediaCenterPage.js";
import { AiCopilotPage } from "./pages/ai/AiCopilotPage.js";
import { ReportsPage } from "./pages/reports/ReportsPage.js";
import { SettingsPage } from "./pages/settings/SettingsPage.js";
import { AuditPage } from "./pages/audit/AuditPage.js";
import React from "react";
import "./styles.css";

function ProtectedRoute({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/aggregator/providers" element={<ProvidersPage />} />
                    <Route path="/aggregator/vendors" element={<VendorsPage />} />
                    <Route path="/aggregator/games" element={<GamesPage />} />
                    <Route path="/aggregator/operators" element={<OperatorsPage />} />
                    <Route path="/aggregator/agents" element={<AgentsPage />} />
                    <Route path="/aggregator/routes" element={<RoutesPage />} />
                    <Route path="/b2c/players" element={<PlayersPage />} />
                    <Route path="/b2c/payments" element={<PaymentsPage />} />
                    <Route path="/b2c/bonuses" element={<BonusesPage />} />
                    <Route path="/b2b/white-labels" element={<WhiteLabelsPage />} />
                    <Route path="/b2b/crm" element={<CrmPage />} />
                    <Route path="/b2b/invoices" element={<InvoicesPage />} />
                    <Route path="/media" element={<MediaCenterPage />} />
                    <Route path="/ai" element={<AiCopilotPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/audit" element={<AuditPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppShell>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");
createRoot(container).render(<StrictMode><App /></StrictMode>);
