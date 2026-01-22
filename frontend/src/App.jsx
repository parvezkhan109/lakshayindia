import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { getSession } from '@/services/session'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import PublicResultsPage from '@/pages/PublicResultsPage'
import DashboardLayout from '@/layouts/DashboardLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminCreateUserPage from '@/pages/admin/AdminCreateUserPage'
import AdminManageUsersPage from '@/pages/admin/AdminManageUsersPage'
import AdminPricesPage from '@/pages/admin/AdminPricesPage'
import AdminStoryManualPage from '@/pages/admin/AdminStoryManualPage'
import AdminResultPublishPage from '@/pages/admin/AdminResultPublishPage'
import AdminAssignVendorsPage from '@/pages/admin/AdminAssignVendorsPage'
import AdminPlaysAuditPage from '@/pages/admin/AdminPlaysAuditPage'
import SuperDashboard from '@/pages/super/SuperDashboard'
import SuperVendorsPage from '@/pages/super/SuperVendorsPage'
import SuperPlayPage from '@/pages/super/SuperPlayPage'
import SuperResultPublishPage from '@/pages/super/SuperResultPublishPage'
import VendorDashboard from '@/pages/vendor/VendorDashboard'
import VendorPlayPage from '@/pages/vendor/VendorPlayPage'
import VendorHistoryPage from '@/pages/vendor/VendorHistoryPage'

function RequireAuth({ children, role }) {
  const session = getSession()
  if (!session?.token || !session?.user) return <Navigate to="/login" replace />
  if (role && session.user.role !== role) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/results" element={<PublicResultsPage />} />

        <Route
          path="/admin"
          element={
            <RequireAuth role="ADMIN">
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users/create" element={<AdminCreateUserPage />} />
          <Route path="users" element={<AdminManageUsersPage />} />
          <Route path="prices" element={<AdminPricesPage />} />
          <Route path="stories/manual" element={<AdminStoryManualPage />} />
          <Route path="results/publish" element={<AdminResultPublishPage />} />
          <Route path="assignments" element={<AdminAssignVendorsPage />} />
          <Route path="plays/audit" element={<AdminPlaysAuditPage />} />
        </Route>

        <Route
          path="/super"
          element={
            <RequireAuth role="SUPER">
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<SuperDashboard />} />
          <Route path="vendors" element={<SuperVendorsPage />} />
          <Route path="play" element={<SuperPlayPage />} />
          <Route path="results/publish" element={<SuperResultPublishPage />} />
        </Route>

        <Route
          path="/vendor"
          element={
            <RequireAuth role="VENDOR">
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<VendorDashboard />} />
          <Route path="play" element={<VendorPlayPage />} />
          <Route path="history" element={<VendorHistoryPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
