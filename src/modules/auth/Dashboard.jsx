import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useDB } from '../../hooks/useDB.js'
import { Card, Button, ProgressBar, Badge } from '../../components/ui/index.jsx'

const QUICK_ACTIONS = [
  { icon: '🔍', label: 'Browse Jobs',      to: '/jobs',      color: 'var(--gold)' },
  { icon: '📄', label: 'Build / Edit CV',  to: '/cv',        color: 'var(--teal)' },
  { icon: '📋', label: 'My Tracker',       to: '/tracker',   color: 'var(--success)' },
  { icon: '✨', label: 'Ask AI',           to: '/assistant', color: 'var(--info)' },
]

const ONBOARDING = [
  { key: 'registered',       label: 'Account created',         done: true },
  { key: 'field',            label: 'Field selected',          doneIf: u => u?.field },
  { key: 'location',         label: 'Location set',            doneIf: u => u?.location },
  { key: 'cv_uploaded',      label: 'CV uploaded or built',    doneIf: u => u?.cvComplete },
  { key: 'salary',           label: 'Salary target set',       doneIf: u => u?.minSalary },
  { key: 'first_save',       label: 'First job saved',         doneIf: u => u?.firstJobSaved },
  { key: 'notification',     label: 'Alerts configured',       doneIf: u => u?.alertsConfigured },
]

const TIPS = [
  'Update your CV keywords to improve job match scores.',
  'Set up Telegram alerts so you never miss a new match.',
  'Save 5–10 jobs to your tracker to start building momentum.',
  'Complete your profile to unlock full AI features.',
  'Practice one interview question today — 5 minutes can make a difference.',
  'Check the Wellbeing section if the search feels overwhelming.',
]

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 26, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const { data: apps }      = useDB('applications')
  const { data: companies } = useDB('companies')
  const [tip, setTip]       = useState(TIPS[Math.floor(Math.random() * TIPS.length)])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const completedOnboarding = ONBOARDING.filter(s =>
    s.done || (s.doneIf && s.doneIf(user))
  ).length
  const profilePct = Math.round((completedOnboarding / ONBOARDING.length) * 100)

  const appsByStage = {
    applied:    apps.filter(a => a.stage === 'applied').length,
    screening:  apps.filter(a => a.stage === 'screening').length,
    interview:  apps.filter(a => a.stage === 'interview').length,
    offer:      apps.filter(a => a.stage === 'offer').length,
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'there'} 👋`}
        subtitle="Here's your career dashboard."
      />

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Applications', value: apps.length,          icon: '📋', color: 'var(--gold)' },
          { label: 'In Screening',       value: appsByStage.screening, icon: '📞', color: 'var(--teal)' },
          { label: 'Interviews',         value: appsByStage.interview, icon: '🎯', color: 'var(--success)' },
          { label: 'Offers',             value: appsByStage.offer,     icon: '🏆', color: 'var(--warning)' },
          { label: 'Companies Watching', value: companies.length,      icon: '🏢', color: 'var(--info)' },
        ].map((s, i) => (
          <Card key={i} style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick actions */}
          <Card style={{ padding: '20px' }}>
            <h4 style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Quick Actions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {QUICK_ACTIONS.map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(a.to)}
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '14px 16px',
                    cursor: 'pointer', transition: 'all var(--transition)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
                >
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Application pipeline */}
          {apps.length > 0 && (
            <Card>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Application Pipeline</h4>
              <div style={{ display: 'flex', gap: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                {[
                  { label: 'Applied',   count: appsByStage.applied,   color: 'var(--info)' },
                  { label: 'Screening', count: appsByStage.screening,  color: 'var(--warning)' },
                  { label: 'Interview', count: appsByStage.interview,  color: 'var(--teal)' },
                  { label: 'Offer',     count: appsByStage.offer,      color: 'var(--success)' },
                ].map((s, i) => (
                  <div key={i} style={{
                    flex: 1, padding: '16px 12px', textAlign: 'center',
                    background: 'var(--bg-elevated)',
                    borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)' }}>{s.count}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Daily tip */}
          <Card style={{ background: 'var(--gold-glow)', borderColor: 'var(--border-gold)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Today's Tip</div>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{tip}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column — onboarding */}
        <Card>
          <h4 style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Profile Setup</h4>
          <div style={{ fontSize: 22, fontWeight: 700, color: profilePct === 100 ? 'var(--success)' : 'var(--gold)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>{profilePct}%</div>
          <ProgressBar value={profilePct} color={profilePct === 100 ? 'var(--success)' : 'var(--gold)'} />
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ONBOARDING.map((step, i) => {
              const done = step.done || (step.doneIf && step.doneIf(user))
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: done ? 'var(--success)' : 'var(--bg-elevated)',
                    border: `2px solid ${done ? 'var(--success)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#fff',
                  }}>
                    {done ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: 13, color: done ? 'var(--text-secondary)' : 'var(--text-muted)', textDecoration: done ? 'line-through' : 'none' }}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
          {profilePct < 100 && (
            <Button
              fullWidth
              variant="ghost"
              size="sm"
              style={{ marginTop: 20 }}
              onClick={() => navigate('/cv')}
            >
              Complete Profile →
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}
