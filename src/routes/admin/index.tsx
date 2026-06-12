import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { type Membership } from '../../lib/auth'

interface AdminLayoutProps {
  navigate: (path: string) => void
  path: string
  membership: Membership
  userEmail: string
}

const NAV = [
  { key: 'overview', label: 'Overview',  path: '/admin'         },
  { key: 'clients',  label: 'Clients',   path: '/admin/clients' },
  { key: 'tickets',  label: 'Queue',     path: '/admin/tickets' },
  { key: 'docs',     label: 'Documents', path: '/admin/docs'    },
]

export default function AdminLayout({ navigate, path, userEmail }: AdminLayoutProps) {
  useEffect(() => {
    if (path === '/' || !path.startsWith('/admin')) {
      navigate('/admin')
    }
  }, [])

  const activeSection = path.startsWith('/admin/clients') ? 'clients'
    : path.startsWith('/admin/tickets') ? 'tickets'
    : path.startsWith('/admin/docs') ? 'docs'
    : 'overview'

  const initials = userEmail ? userEmail[0].toUpperCase() : 'U'

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const subContent = activeSection === 'clients'
    ? <div data-testid="admin-clients-empty" className="empty-state">Clients — coming soon</div>
    : activeSection === 'tickets'
    ? <div data-testid="admin-tickets-empty" className="empty-state">Queue — coming soon</div>
    : activeSection === 'docs'
    ? <div data-testid="admin-docs-empty" className="empty-state">Documents — coming soon</div>
    : <div data-testid="admin-overview-empty" className="empty-state">Overview — coming soon</div>

  const desktopShell = (
    <div className="shell" data-testid="admin-shell-desktop">
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="org">
            <div className="co">Meridian</div>
            <div className="by">Admin console</div>
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
              <div className="rl">Admin</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="main">
        <div className="topline">
          <div className="crumb">
            Admin {/* decorative separator */}<span style={{ opacity: 0.4 }}>/</span> {NAV.find(n => n.key === activeSection)?.label ?? 'Overview'}
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
    <div className="mshell" data-testid="admin-shell-mobile">
      <div className="mtop">
        <div className="org">
          <div className="co">Meridian</div>
          <div className="by">Admin</div>
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
