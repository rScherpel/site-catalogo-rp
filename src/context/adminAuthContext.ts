import { createContext } from 'react'
import type { AdminAuthContextValue } from '../types/admin'

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)
