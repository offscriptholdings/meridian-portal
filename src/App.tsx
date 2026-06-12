import { useState, useEffect } from 'react'
import './styles/tokens.css'
import './styles/layout.css'
import LoginPage from './routes/auth/LoginPage'
import CallbackPage from './routes/auth/CallbackPage'
import NotAuthorizedPage from './routes/auth/NotAuthorizedPage'
import ClientLayout from './routes/client'
import AdminLayout from './routes/admin'
import { getSession, getMembership, type Membership } from './lib/auth'

type AppState = 'loading' | 'unauthenticated' | 'no_membership' | 'client' | 'admin'

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [appState, setAppState] = useState<AppState>('loading')
  const [membership, setMembership] = useState<Membership | null>(null)
  const [userEmail, setUserEmail] = useState('')

  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath)
    setPath(newPath)
  }

  // Handle browser back/forward
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Auth state resolution (skipped for auth-shell routes)
  useEffect(() => {
    const authShellPaths = ['/login', '/auth/callback', '/not-authorized']
    const isInvitePath = path.startsWith('/invite/')
    if (authShellPaths.includes(path) || isInvitePath) return

    getSession().then(async (session) => {
      if (!session) { navigate('/login'); return }
      const m = await getMembership(session.user.id)
      if (!m) { navigate('/not-authorized'); return }
      setMembership(m)
      setUserEmail(session.user.email ?? '')
      setAppState(m.role === 'admin' ? 'admin' : 'client')
    })
  }, [path])

  // --- Auth shell routes ---
  if (path === '/login') return <LoginPage />
  if (path.startsWith('/invite/')) {
    const token = path.replace('/invite/', '').split('/')[0]
    return <LoginPage inviteToken={token} />
  }
  if (path.startsWith('/auth/callback')) return <CallbackPage navigate={navigate} />
  if (path === '/not-authorized') return <NotAuthorizedPage navigate={navigate} />

  // --- Protected routes ---
  if (appState === 'loading') {
    return <div className="loading-screen">Loading…</div>
  }
  if (appState === 'admin' && membership)
    return <AdminLayout navigate={navigate} path={path} membership={membership} userEmail={userEmail} />
  if (appState === 'client' && membership)
    return <ClientLayout navigate={navigate} path={path} membership={membership} userEmail={userEmail} />
  return null
}
