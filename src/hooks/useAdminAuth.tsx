import { useContext } from 'react'
import { AdminAuthContext } from '../context/adminAuthContext'
import type { AdminAuthContextValue } from '../types/admin'

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider.')
  }

  return context
}
