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
    <div data-testid="login-page" style={{ fontFamily: 'var(--font-sans)', maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Meridian Portal</h1>

      <button
        data-testid="google-signin-btn"
        onClick={() => signInWithGoogle()}
        style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', cursor: 'pointer' }}
      >
        Continue with Google
      </button>

      <div style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem' }}>
        {sent ? (
          <p data-testid="magic-link-sent">Check your email — we sent a link.</p>
        ) : (
          <form onSubmit={handleMagicLink}>
            <input
              data-testid="magic-link-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{ width: '100%', padding: '0.75rem', marginBottom: '0.75rem', boxSizing: 'border-box' }}
            />
            <button
              data-testid="magic-link-submit"
              type="submit"
              disabled={submitting}
              style={{ width: '100%', padding: '0.75rem', cursor: 'pointer' }}
            >
              {submitting ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
