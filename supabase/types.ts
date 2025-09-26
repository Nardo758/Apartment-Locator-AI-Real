// Bridge module: re-export the generated supabase types and provide small
// helpers used across the codebase. The authoritative generated types live
// in `src/integrations/supabase/types.ts` (kept by the codegen). Importers
// in the project previously referenced `supabase/types`, so we keep this
// lightweight adapter here.

export type { Json, Database } from '../src/integrations/supabase/types'

import type { Database as _DB } from '../src/integrations/supabase/types'

// Flexible Tables helper: if T matches a real table key, return that Row type,
// otherwise fall back to `any` so code referencing less-common tables won't break
// the type-checker until the generated types are updated.
export type Tables<T extends string> = T extends keyof _DB['public']['Tables'] ? _DB['public']['Tables'][T]['Row'] : any

// Map the auth user alias to the users table row if present
// Supabase auth user shape — defined here as a permissive interface that covers
// the fields used across the codebase. Fields are optional to be compatible
// with both the auth user shape and any custom `users` table mapping.
export interface SupabaseUser {
	id: string
	email?: string | null
	full_name?: string | null
	avatar_url?: string | null
	phone?: string | null
	password_hash?: string | null
	email_verified?: boolean
	is_active?: boolean
	last_login?: string | null
	created_at?: string
	updated_at?: string
}

export type User = SupabaseUser
export type UserPreferences = Tables<'user_preferences'>
export type UserProfile = Tables<'user_profiles'>
export type UserActivity = Tables<'user_activities'>
export type SearchHistory = Tables<'search_history'>
export type SavedApartment = Tables<'saved_apartments'>
export type Apartment = Tables<'apartments'>
export type UserExport = Tables<'user_exports'>
