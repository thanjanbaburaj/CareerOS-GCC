import React from 'react'

export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-deep)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
    }}>
      <div style={{
        width: 56, height: 56,
        borderRadius: '50%',
        border: '3px solid var(--bg-elevated)',
        borderTop: '3px solid var(--gold)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
        Loading CareerOS…
      </p>
    </div>
  )
}
