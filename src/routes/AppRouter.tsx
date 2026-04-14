import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CatalogPage } from '../pages/CatalogPage'
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage'
import { ContactsPage } from '../pages/ContactsPage'
import { AboutUsPage } from '../pages/AboutUsPage'
import { AdminAuthScope } from '../components/admin/AdminAuthScope'
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute'
import { AdminLayout } from '../components/admin/AdminLayout'
import { AdminLoginPage } from '../pages/admin/AdminLoginPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminEstablishmentsPage } from '../pages/admin/AdminEstablishmentsPage'
import { AdminEstablishmentNewPage } from '../pages/admin/AdminEstablishmentNewPage'
import { AdminEstablishmentDetailPage } from '../pages/admin/AdminEstablishmentDetailPage'
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage'
import { AdminAccessesPage } from '../pages/admin/AdminAccessesPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/politicas-de-privacidade" element={<PrivacyPolicyPage />} />
        <Route path="/contato" element={<Navigate to="/contatos" replace />} />
        <Route path="/contatos" element={<ContactsPage />} />
        <Route path="/sobre-nos" element={<AboutUsPage />} />
        <Route path="/admin" element={<AdminAuthScope />}>
          <Route index element={<AdminLoginPage />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="establishments" element={<AdminEstablishmentsPage />} />
              <Route path="establishments/new" element={<AdminEstablishmentNewPage />} />
              <Route path="establishments/:id" element={<AdminEstablishmentDetailPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="accesses" element={<AdminAccessesPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
