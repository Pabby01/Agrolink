import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { type ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AppLayout } from "./components/AppLayout";
import { HomePage } from "./features/home/HomePage";
import { HowItWorksPage } from "./features/home/HowItWorksPage";
import { AuthPage } from "./features/auth/AuthPage";
import { DashboardPage } from "./features/farmers/DashboardPage";
import { CreateListingPage } from "./features/farmers/CreateListingPage";
import { MarketplacePage } from "./features/marketplace/MarketplacePage";
import { ListingDetailPage } from "./features/marketplace/ListingDetailPage";
import { OrdersPage } from "./features/orders/OrdersPage";
import { OrderDetailPage } from "./features/orders/OrderDetailPage";
import { DeliveriesPage } from "./features/transporters/DeliveriesPage";
import { TrustPage } from "./features/trust/TrustPage";
import { CropIntelligencePage } from "./features/ai/CropIntelligencePage";
import { NotificationsPage } from "./features/notifications/NotificationsPage";
import {
  AdminOverviewPage,
  AdminUsersPage,
  AdminOrdersPage,
  AdminShipmentsPage,
  AdminRiskPage,
  AdminAuditPage,
} from "./features/admin/AdminPages";
import { Role } from "./types/enums";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user.role !== Role.Admin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/login" element={<AuthPage />} />

      {/* Protected (authenticated) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/create" element={<CreateListingPage />} />
        <Route path="/marketplace/:id" element={<ListingDetailPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/deliveries" element={<DeliveriesPage />} />
        <Route path="/trust" element={<TrustPage />} />
        <Route path="/crop-intelligence" element={<CropIntelligencePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Admin */}
      <Route
        element={
          <AdminRoute>
            <AppLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminOverviewPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/shipments" element={<AdminShipmentsPage />} />
        <Route path="/admin/risk" element={<AdminRiskPage />} />
        <Route path="/admin/audit" element={<AdminAuditPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
