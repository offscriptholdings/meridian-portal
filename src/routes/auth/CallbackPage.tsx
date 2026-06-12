import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getMembership, activateInvite } from '../../lib/auth'

interface CallbackPageProps {
  navigate: (path: string) => void
}

export default function CallbackPage({ navigate }: CallbackPageProps) {
  const [error, setError] = useState(false)
  const processed = useRef(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!processed.current) setError(true)
    }, 10_000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== 'SIGNED_IN' || !session) return
      if (processed.current) return
      processed.current = true

      clearTimeout(timeout)

      const membership = await getMembership(session.user.id)
      if (membership) {
        navigate('/')
        return
      }

      const activated = await activateInvite(session.user.id)
      if (activated) {
        sessionStorage.removeItem('invite_token')
        navigate('/')
      } else {
        navigate('/not-authorized')
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [navigate])

  if (error) {
    return (
      <div data-testid="callback-page" className="loading-screen">
        <p data-testid="callback-error">
          Something went wrong. <a href="/login">Back to login</a>
        </p>
      </div>
    )
  }

  return (
    <div data-testid="callback-page" className="loading-screen">
      <p data-testid="callback-loading">Signing you in…</p>
    </div>
  )
}
