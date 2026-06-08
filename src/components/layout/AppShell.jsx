import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import authStore from '../../store/authStore.js'

const NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard'    },
  { to: '/jobs',      icon: '🔍', label: 'Job Feed'     },
  { to: '/tracker',   icon: '📋', label: 'Tracker'      },
  { to: '/cv',        icon: '📄', label: 'CV Builder'   },
  { to: '/interview', icon: '🎯', label: 'Interview'    },
  { to: '/network',   icon: '🤝', label: 'Network'      },
  { to: '/freelance', icon: '💼', label: 'Freelance'    },
  { to: '/wellbeing', icon: '💚', label: 'Wellbeing'    },
  { to: '/community', icon: '👥', label: 'Community'    },
  { to: '/assistant', icon: '✨', label: 'AI Assistant' },
  { to: '/settings',  icon: '⚙️', label: 'Settings'     },
]

export default function AppShell() {
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    authStore.logout()
    navigate('/')
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, minHeight: '100vh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, position: 'sticky',
        top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg,var(--gold),var(--gold-dim))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: '#0A1628',
            }}>C</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>CareerOS</div>
              <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 2.5, fontWeight: 700 }}>GCC</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 11px', borderRadius: 'var(--radius-md)',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                background: isActive ? 'var(--gold-glow)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--border-gold)' : 'transparent'}`,
                textDecoration: 'none', transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '14px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,var(--gold-dim),var(--gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#0A1628',
            }}>{initials}</div>
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.field || 'Career Explorer'}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '7px', borderRadius: 7,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
            fontFamily: 'var(--font-body)', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >Sign Out</button>
        </div>
      </aside>

      {/* Page content */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  )
}
