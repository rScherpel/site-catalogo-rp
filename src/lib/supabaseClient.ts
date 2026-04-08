import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
	import.meta.env.VITE_SUPABASE_URL?.trim() ??
	import.meta.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
	''
const supabaseAnonKey =
	import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ??
	import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ??
	''

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

const authStorage = typeof window !== 'undefined' ? window.sessionStorage : undefined

export const supabase = hasSupabaseConfig
	? createClient(supabaseUrl, supabaseAnonKey, {
			auth: {
				storage: authStorage,
				storageKey: 'site-catalogo-rp-auth',
				persistSession: true,
				autoRefreshToken: true,
				detectSessionInUrl: true,
			},
		})
	: null
