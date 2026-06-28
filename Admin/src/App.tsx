import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const AdminLayout = lazy(() => import('@/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminLoginPage = lazy(() => import('@/admin/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('@/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminBranchesPage = lazy(() => import('@/admin/pages/AdminBranchesPage').then((m) => ({ default: m.AdminBranchesPage })));
const AdminMenuPage = lazy(() => import('@/admin/pages/AdminMenuPage').then((m) => ({ default: m.AdminMenuPage })));
const AdminOrdersLayout = lazy(() => import('@/admin/pages/orders/AdminOrdersLayout').then((m) => ({ default: m.AdminOrdersLayout })));
const AdminOrdersProcessingPage = lazy(() => import('@/admin/pages/orders/AdminOrdersProcessingPage').then((m) => ({ default: m.AdminOrdersProcessingPage })));
const AdminOrdersTrackPage = lazy(() => import('@/admin/pages/orders/AdminOrdersTrackPage').then((m) => ({ default: m.AdminOrdersTrackPage })));
const AdminOrdersHistoryPage = lazy(() => import('@/admin/pages/orders/AdminOrdersHistoryPage').then((m) => ({ default: m.AdminOrdersHistoryPage })));
const AdminPromosPage = lazy(() => import('@/admin/pages/AdminPromosPage').then((m) => ({ default: m.AdminPromosPage })));
const AdminRewardsPage = lazy(() => import('@/admin/pages/AdminRewardsPage').then((m) => ({ default: m.AdminRewardsPage })));
const AdminCustomersPage = lazy(() => import('@/admin/pages/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })));
const AdminNotificationsPage = lazy(() => import('@/admin/pages/AdminNotificationsPage').then((m) => ({ default: m.AdminNotificationsPage })));
const AdminStaffPage = lazy(() => import('@/admin/pages/AdminStaffPage').then((m) => ({ default: m.AdminStaffPage })));
const AdminAccountPage = lazy(() => import('@/admin/pages/AdminAccountPage').then((m) => ({ default: m.AdminAccountPage })));

function Fallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center text-sm text-muted">
      Loading…
    </div>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Fallback />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Lazy>
            <AdminLoginPage />
          </Lazy>
        }
      />
      <Route
        element={
          <Lazy>
            <AdminLayout />
          </Lazy>
        }
      >
        <Route index element={<Lazy><AdminDashboardPage /></Lazy>} />
        <Route path="branches" element={<Lazy><AdminBranchesPage /></Lazy>} />
        <Route path="menu" element={<Lazy><AdminMenuPage /></Lazy>} />
        <Route path="orders" element={<Lazy><AdminOrdersLayout /></Lazy>}>
          <Route index element={<Navigate to="processing" replace />} />
          <Route path="processing" element={<Lazy><AdminOrdersProcessingPage /></Lazy>} />
          <Route path="track" element={<Lazy><AdminOrdersTrackPage /></Lazy>} />
          <Route path="history" element={<Lazy><AdminOrdersHistoryPage /></Lazy>} />
        </Route>
        <Route path="promos" element={<Lazy><AdminPromosPage /></Lazy>} />
        <Route path="rewards" element={<Lazy><AdminRewardsPage /></Lazy>} />
        <Route path="customers" element={<Lazy><AdminCustomersPage /></Lazy>} />
        <Route path="notifications" element={<Lazy><AdminNotificationsPage /></Lazy>} />
        <Route path="staff" element={<Lazy><AdminStaffPage /></Lazy>} />
        <Route path="account" element={<Lazy><AdminAccountPage /></Lazy>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
