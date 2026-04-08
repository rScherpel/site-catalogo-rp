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

export const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null
