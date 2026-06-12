import { supabase } from '../../lib/supabase'

interface NotAuthorizedPageProps {
  navigate: (path: string) => void
}

export default function NotAuthorizedPage({ navigate }: NotAuthorizedPageProps) {
  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div data-testid="not-authorized-page" style={{ fontFamily: 'var(--font-sans)', maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h1>Not Authorized</h1>
      <p>You don&apos;t have access to this portal. Contact David to request access.</p>
      <button onClick={handleSignOut} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}>
        Sign out
      </button>
    </div>
  )
}
