import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import authStore from '../../store/authStore.js'

const NAV = [
  { to: '/dashboard',  icon: '⬛', label: 'Dashboard'    },
  { to: '/jobs',       icon: '🔍', label: 'Job Feed'     },
  { to: '/tracker',    icon: '📋', label: 'Tracker'      },
  { to: '/cv',         icon: '📄', label: 'CV Builder'   },
  { to: '/interview',  icon: '🎯', label: 'Interview'    },
  { to: '/network',    icon: '🤝', label: 'Network'      },
  { to: '/freelance',  icon: '💼', label: 'Freelance'    },
  { to: '/wellbeing',  icon: '💚', label: 'Wellbeing'    },
  { to: '/community',  icon: '👥', label: 'Community'    },
  { to: '/assistant',  icon: '✨', label: 'AI Assistant' },
  { to: '/settings',   icon: '⚙️', label: 'Settings'     },
]

export default function AppShell() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

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
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#0A1628',
            }}>C</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>CareerOS</div>
              <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 2, fontWeight: 700 }}>GCC</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 'var(--radius-md)',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                background: isActive ? 'var(--gold-glow)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--border-gold)' : 'transparent'}`,
                textDecoration: 'none', transition: 'all var(--transition)',
              })}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#0A1628', flexShrink: 0,
            }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.field || 'Career Explorer'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '7px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }}
          >Sign Out</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  )
}
