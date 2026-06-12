import { useState, useEffect } from 'react'
import { signInWithGoogle, signInWithMagicLink } from '../../lib/auth'

interface LoginPageProps {
  inviteToken?: string
}

export default function LoginPage({ inviteToken }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (inviteToken) {
      sessionStorage.setItem('invite_token', inviteToken)
    }
  }, [inviteToken])

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const ok = await signInWithMagicLink(email)
    setSubmitting(false)
    if (ok) setSent(true)
  }

  return (
    <div data-testid="login-page" className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-name">Meridian</span>
        </div>

        <button
          data-testid="google-signin-btn"
          className="btn btn-primary btn-block"
          onClick={() => signInWithGoogle()}
        >
          Continue with Google
        </button>

        <div className="auth-magic">
          {sent ? (
            <p data-testid="magic-link-sent" className="auth-fine">Check your email — we sent a link.</p>
          ) : (
            <form onSubmit={handleMagicLink}>
              <div className="field">
                <input
                  data-testid="magic-link-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input"
                />
                <button
                  data-testid="magic-link-submit"
                  type="submit"
                  disabled={submitting}
                  className="btn btn-block"
                >
                  {submitting ? 'Sending…' : 'Send magic link'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="auth-fine">Invite-only access · Contact David to request access</p>
      </div>
    </div>
  )
}
