import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const workflowNav = [
  { to: '/capture', label: 'Capture' },
  { to: '/confirm', label: 'Confirm' },
  { to: '/manufacturer-evaluation', label: 'Evaluation' },
  { to: '/recommendation-workspace', label: 'Recommendation' },
  { to: '/customer-quote', label: 'Present' },
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
        <div className="sidebar-header">
          <div className="logo">MQI</div>
          <div>
            <div className="sidebar-title">Decision prototype</div>
            <div className="sidebar-sub">Operator workflow</div>
          </div>
        </div>

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
            Prototype home
          </NavLink>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
