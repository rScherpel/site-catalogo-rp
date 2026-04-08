import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'

export function ProtectedAdminRoute() {
  const { loading, profile, error } = useAdminAuth()

  if (loading) {
    return <LoadingState />
  }

  if (profile) {
    return <Outlet />
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />
  }

  return <Navigate to="/admin/login" replace />
}
