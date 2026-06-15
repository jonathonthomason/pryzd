import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const workflowNav = [
  { to: '/capture', label: '1. RFQ Intake' },
  { to: '/confirm', label: '2–3. Requirements Understanding + Review' },
  { to: '/production-readiness-analysis', label: '4. Production Readiness Analysis' },
  { to: '/quote-recommendation', label: '5–7. Commercial Analysis + Recommendation + Review' },
  { to: '/quote-delivery', label: '8. Quote Delivery' },
] as const

const systemNav = [
  { href: '/prototype/design-system.html', label: 'MQI System' },
  { href: '/prototype/design-system.json', label: 'JSON tokens' },
] as const

export function AppShell() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="app">
      <aside className="sidebar">
        <NavLink to="/" end className="sidebar-header">
          <div className="logo">MQI</div>
          <div>
            <div className="sidebar-title">Production Readiness Intelligence</div>
            <div className="sidebar-sub">Single-manufacturer quote workflow</div>
          </div>
        </NavLink>

        <div className="search">Search prototype</div>

        <div className="nav-group">
          <div className="nav-label">Workflow</div>
          {workflowNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-group">
          <div className="nav-label">System</div>
          {systemNav.map((item) => (
            <a key={item.href} className="nav-item" href={item.href}>
              {item.label}
            </a>
          ))}
          <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            Workflow home
          </NavLink>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
