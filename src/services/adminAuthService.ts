import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { AdminProfile } from '../types/admin'

const REQUEST_TIMEOUT_MS = 12000

function withTimeout<T>(promise: PromiseLike<T>, label: string): Promise<T> {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      globalThis.setTimeout(() => {
        reject(new Error(`${label} demorou demais para responder.`))
      }, REQUEST_TIMEOUT_MS)
    }),
  ])
}

function ensureSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase não configurado.')
  }

  return supabase
}

export async function signInAdmin(email: string, password: string): Promise<Session> {
  const client = ensureSupabaseClient()
  const { data, error } = await withTimeout(
    client.auth.signInWithPassword({
      email,
      password,
    }),
    'Login administrativo',
  )

  if (error) {
    throw error
  }

  if (!data.session) {
    throw new Error('Sessão não encontrada após login.')
  }

  return data.session
}

export async function signOutAdmin(): Promise<void> {
  const client = ensureSupabaseClient()
  const { error } = await withTimeout(client.auth.signOut(), 'Logout administrativo')

  if (error) {
    throw error
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const client = ensureSupabaseClient()
  const { data, error } = await withTimeout(client.auth.getSession(), 'Leitura da sessão administrativa')

  if (error) {
    throw error
  }

  return data.session
}

export async function getCurrentUser(): Promise<User | null> {
  const client = ensureSupabaseClient()
  const { data, error } = await withTimeout(client.auth.getUser(), 'Leitura do usuário administrativo')

  if (error) {
    throw error
  }

  return data.user
}

export async function getCurrentAdminProfile(userId?: string): Promise<AdminProfile | null> {
  const client = ensureSupabaseClient()
  const currentUserId = userId ?? (await getCurrentUser())?.id

  if (!currentUserId) {
    return null
  }

  const { data, error } = await withTimeout(
    client
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('id', currentUserId)
      .single(),
    'Leitura do perfil administrativo',
  )

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }

    throw error
  }

  if (!data || data.role !== 'admin') {
    return null
  }

  return {
    id: data.id,
    email: data.email,
    role: 'admin',
    created_at: data.created_at,
  }
}
