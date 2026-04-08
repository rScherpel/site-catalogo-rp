import { useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { AdminAuthContext } from './adminAuthContext'
import type { AdminAuthContextValue, AdminProfile } from '../types/admin'
import {
  getCurrentAdminProfile,
  getCurrentSession,
  signInAdmin,
  signOutAdmin,
} from '../services/adminAuthService'

async function resolveProfile(user: User | null): Promise<AdminProfile | null> {
  if (!user) {
    return null
  }

  return getCurrentAdminProfile(user.id)
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProfile = async (): Promise<void> => {
    const currentSession = await getCurrentSession()
    const currentUser = currentSession?.user ?? null
    const nextProfile = await resolveProfile(currentUser)

    setSession(currentSession)
    setUser(currentUser)
    setProfile(nextProfile)

    if (!nextProfile && currentUser) {
      await signOutAdmin()
      setSession(null)
      setUser(null)
    }
  }

  useEffect(() => {
    let cancelled = false

    const bootstrap = async (): Promise<void> => {
      setError(null)

      setLoading(true)

      try {
        const currentSession = await getCurrentSession()

        if (cancelled) {
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        const nextProfile = currentSession?.user ? await resolveProfile(currentSession.user) : null

        if (cancelled) {
          return
        }

        setProfile(nextProfile)
      } catch (bootstrapError) {
        if (!cancelled) {
          setError(bootstrapError instanceof Error ? bootstrapError.message : 'Falha ao carregar sessão.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void bootstrap()

    const { data } = supabase
      ? supabase.auth.onAuthStateChange(async (_event, nextSession) => {
          const nextProfile = nextSession?.user ? await resolveProfile(nextSession.user) : null

          setSession(nextSession)
          setUser(nextSession?.user ?? null)
          setProfile(nextProfile)
        })
      : { data: { subscription: { unsubscribe: () => undefined } } }

    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    setError(null)
    try {
      const nextSession = await signInAdmin(email, password)
      const nextProfile = await resolveProfile(nextSession.user)

      setSession(nextSession)
      setUser(nextSession.user)
      setProfile(nextProfile)

      if (!nextProfile) {
        await signOutAdmin()
        setSession(null)
        setUser(null)
        throw new Error('Usuário autenticado sem perfil de administrador.')
      }
    } catch (signInError) {
      setSession(null)
      setUser(null)
      setProfile(null)
      setError(signInError instanceof Error ? signInError.message : 'Falha no login administrativo.')
      throw signInError
    }
  }

  const signOut = async (): Promise<void> => {
    await signOutAdmin()
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const value: AdminAuthContextValue = {
    session,
    user,
    profile,
    loading,
    signIn,
    signOut,
    refreshProfile,
    isAdmin: profile?.role === 'admin',
    error,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
