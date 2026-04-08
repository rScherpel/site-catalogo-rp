import { Outlet } from 'react-router-dom'
import { AdminAuthProvider } from '../../context/AdminAuthProvider'

export function AdminAuthScope() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  )
}