import { supabase } from './supabase'

export interface Membership {
  tenant_id: string
  role: 'client' | 'admin'
  tenant_name: string
}

// Returns the current session, or null if not authenticated.
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Returns the active membership for the given user_id, or null if none.
// P0 assumes one active membership per user — multi-tenant handled in future.
export async function getMembership(userId: string): Promise<Membership | null> {
  const { data } = await supabase
    .from('memberships')
    .select('tenant_id, role, tenants(name)')
    .eq('user_id', userId)
    .single()
  if (!data) return null
  return {
    tenant_id: data.tenant_id,
    role: data.role as 'client' | 'admin',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tenant_name: (data.tenants as any)?.name ?? '',
  }
}

// Activates the current user's pending invite (by email match via RLS).
// Returns the new membership or null if no invite found.
export async function activateInvite(userId: string): Promise<Membership | null> {
  const { data: invite } = await supabase
    .from('invitations')
    .select('id, tenant_id, role')
    .eq('status', 'pending')
    .single()
  if (!invite) return null

  const { error } = await supabase
    .from('memberships')
    .insert({ user_id: userId, tenant_id: invite.tenant_id, role: invite.role })
  if (error) return null

  await supabase
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  return getMembership(userId)
}

// Initiates Google OAuth flow. Redirects the browser to Google, then back to /auth/callback.
export async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

// Sends a magic-link email. Returns true on success, false on error.
export async function signInWithMagicLink(email: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  })
  return !error
}
