import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authStore from '../../store/authStore.js'
import { Button, Input } from '../../components/ui/index.jsx'

export default function Login() {
  const navigate      = useNavigate()
  const [email, setEmail]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email) { setError('Please enter your email.'); return }
    setLoading(true)
    setError('')
    try {
      await authStore.login(email)
      navigate('/dashboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-deep)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-card)', border: '1px solid var(--border-gold)',
        borderRadius: 'var(--radius-xl)', padding: 40,
        animation: 'fadeIn 0.3s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            Career<span style={{ color: 'var(--gold)' }}>OS</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>Welcome back</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, color: 'var(--danger)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="your@email.com"
            required
          />
          <Button fullWidth onClick={handleLogin} loading={loading}>
            Sign In
          </Button>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            No account yet? <Link to="/register" style={{ color: 'var(--gold)' }}>Create one free</Link>
          </p>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)' }}>
            Demo: register first, then sign in with your email.
          </p>
        </div>
      </div>
    </div>
  )
}
