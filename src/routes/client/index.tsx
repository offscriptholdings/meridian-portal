import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { type Membership } from '../../lib/auth'
import DocsPage from './DocsPage'
import PlanPage from './PlanPage'

interface ClientLayoutProps {
  navigate: (path: string) => void
  path: string
  membership: Membership
  userEmail: string
}

const NAV = [
  { key: 'plan',    label: 'Project plan', path: '/client/plan'    },
  { key: 'tickets', label: 'Tickets',      path: '/client/tickets' },
  { key: 'docs',    label: 'Documents',    path: '/client/docs'    },
]

export default function ClientLayout({ navigate, path, membership, userEmail }: ClientLayoutProps) {
  useEffect(() => {
    if (path === '/' || !path.startsWith('/client')) {
      navigate('/client/plan')
    }
  }, [])

  const activeSection = path.startsWith('/client/tickets') ? 'tickets'
    : path.startsWith('/client/docs') ? 'docs'
    : 'plan'

  const activeLabel = activeSection === 'tickets' ? 'Tickets'
    : activeSection === 'docs' ? 'Documents'
    : 'Project plan'

  const initials = userEmail ? userEmail[0].toUpperCase() : 'U'

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const subContent = activeSection === 'tickets'
    ? <div data-testid="client-tickets-empty" className="empty-state">Tickets — coming soon (MTC-364)</div>
    : activeSection === 'docs'
    ? <DocsPage membership={membership} userEmail={userEmail} />
    : <PlanPage membership={membership} />

  const desktopShell = (
    <div className="shell" data-testid="client-shell-desktop">
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="org">
            <div className="co">{membership.tenant_name}</div>
            <div className="by">via Meridian</div>
          </div>
        </div>
        <nav className="sb-nav">
          {NAV.map(item => (
            <button
              key={item.key}
              className="navlink"
              aria-current={activeSection === item.key ? 'true' as const : undefined}
              onClick={() => navigate(item.path)}
            >
              <span className="t">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sb-foot">
          <div className="userchip">
            <div className="avatar">{initials}</div>
            <div className="who">
              <div className="nm">{userEmail}</div>
              <div className="rl">Client</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="main">
        <div className="topline">
          <div className="crumb">
            {membership.tenant_name} {/* decorative separator */}<span className="nav-separator">/</span> {activeLabel}
          </div>
          <button className="btn btn-sm" onClick={handleSignOut}>Sign out</button>
        </div>
        <div className="content">
          <div className="content-inner">{subContent}</div>
        </div>
      </div>
    </div>
  )

  const mobileShell = (
    <div className="mshell" data-testid="client-shell-mobile">
      <div className="mtop">
        <div className="org">
          <div className="co">{membership.tenant_name}</div>
          <div className="by">via Meridian</div>
        </div>
        <button className="btn btn-sm" onClick={handleSignOut}>Sign out</button>
      </div>
      <div className="mcontent">{subContent}</div>
      <nav className="mbottomnav">
        {NAV.map(item => (
          <button
            key={item.key}
            className="mnav-item"
            aria-current={activeSection === item.key ? 'true' as const : undefined}
            onClick={() => navigate(item.path)}
          >
            <span className="ml">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )

  return (
    <>
      {/* desktop */}
      {desktopShell}
      {/* mobile */}
      {mobileShell}
    </>
  )
}
