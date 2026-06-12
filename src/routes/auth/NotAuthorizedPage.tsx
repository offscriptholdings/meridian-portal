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
    <div data-testid="not-authorized-page" className="gate">
      <h1>Not Authorized</h1>
      <p>You don&apos;t have access to this portal. Contact David to request access.</p>
      <button onClick={handleSignOut} className="btn btn-primary">
        Sign out
      </button>
    </div>
  )
}
