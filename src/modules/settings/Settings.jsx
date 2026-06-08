import React, { useState, useEffect } from 'react'
import { Card, Button, Input } from '../../components/ui/index.jsx'

function getKeys() {
  try { return JSON.parse(localStorage.getItem('careeros_api_keys') || '{}') } catch { return {} }
}
function getTelegram() {
  try { return JSON.parse(localStorage.getItem('careeros_telegram') || '{}') } catch { return {} }
}

export default function Settings() {
  const [adzunaId,  setAdzunaId]  = useState('')
  const [adzunaKey, setAdzunaKey] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [tgToken,   setTgToken]   = useState('')
  const [tgChatId,  setTgChatId]  = useState('')
  const [saved,     setSaved]     = useState('')
  const [testing,   setTesting]   = useState('')

  useEffect(() => {
    const keys = getKeys()
    const tg   = getTelegram()
    setAdzunaId(keys.adzunaId  || '')
    setAdzunaKey(keys.adzunaKey || '')
    setGeminiKey(localStorage.getItem('careeros_gemini_key') || '')
    setTgToken(tg.token  || '')
    setTgChatId(tg.chatId || '')
  }, [])

  function saveAll() {
    localStorage.setItem('careeros_api_keys', JSON.stringify({
      adzunaId:  adzunaId.trim(),
      adzunaKey: adzunaKey.trim(),
    }))
    if (geminiKey.trim()) {
      localStorage.setItem('careeros_gemini_key', geminiKey.trim())
    }
    if (tgToken.trim() && tgChatId.trim()) {
      localStorage.setItem('careeros_telegram', JSON.stringify({
        token:  tgToken.trim(),
        chatId: tgChatId.trim(),
      }))
    }
    setSaved('✅ All settings saved!')
    setTimeout(() => setSaved(''), 3000)
  }

  async function testTelegram() {
    if (!tgToken || !tgChatId) { setTesting('❌ Enter token and chat ID first'); return }
    setTesting('Sending test message…')
    try {
      const res = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: '✅ CareerOS GCC — Telegram connected successfully!',
        }),
      })
      const data = await res.json()
      setTesting(data.ok ? '✅ Test message sent! Check your Telegram.' : `❌ Error: ${data.description}`)
    } catch (e) {
      setTesting(`❌ Failed: ${e.message}`)
    }
    setTimeout(() => setTesting(''), 5000)
  }

  async function testGemini() {
    if (!geminiKey) { setTesting('❌ Enter Gemini key first'); return }
    setTesting('Testing Gemini key…')
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Say: Gemini connected to CareerOS.' }] }] }),
        }
      )
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      setTesting(text ? `✅ ${text}` : `❌ Error: ${JSON.stringify(data.error)}`)
    } catch (e) {
      setTesting(`❌ Failed: ${e.message}`)
    }
    setTimeout(() => setTesting(''), 5000)
  }

  const S = {
    section: { marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--border)' },
    label: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 6 },
    hint: { fontSize: 12, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.6 },
    step: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 10 },
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>⚙️ Settings & API Keys</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          All keys stored in your browser only. Never sent to any server.
        </p>
      </div>

      {/* ── ADZUNA ── */}
      <Card style={S.section}>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>🔍 Adzuna Job API</h3>
        <p style={S.step}>
          Unlocks real job listings from UAE, UK, and globally in your Job Feed.
        </p>

        <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <p style={{ ...S.step, marginBottom: 0 }}>
            <strong style={{ color: 'var(--gold)' }}>How to get your free key:</strong><br />
            1. Go to <a href="https://developer.adzuna.com" target="_blank" rel="noopener noreferrer">developer.adzuna.com</a><br />
            2. Click <strong>Register</strong> — fill in name, email, password<br />
            3. Check your email → click verification link<br />
            4. Log in → you see a dashboard with <strong>"Your Applications"</strong><br />
            5. Click <strong>"Create new application"</strong> or <strong>"Register application"</strong><br />
            6. Application name: <code style={{ color: 'var(--gold)' }}>CareerOS</code><br />
            7. URL: <code style={{ color: 'var(--gold)' }}>https://thanjanbaburaj.github.io</code><br />
            8. Click Create / Submit<br />
            9. You will see <strong>App ID</strong> (numbers only) and <strong>App Key</strong> (long string)<br />
            10. Copy both and paste below
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            label="Adzuna App ID"
            value={adzunaId}
            onChange={setAdzunaId}
            placeholder="12345678"
          />
          <Input
            label="Adzuna App Key"
            value={adzunaKey}
            onChange={setAdzunaKey}
            placeholder="abcdef1234567890abcdef1234567890"
          />
        </div>
        <p style={S.hint}>Free tier: ~1,000 API calls/month. Resets monthly. More than enough for daily personal use.</p>
      </Card>

      {/* ── GEMINI ── */}
      <Card style={S.section}>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>✨ Google Gemini AI</h3>
        <p style={S.step}>Powers CV Builder, AI Assistant, cover letters, interview questions, and gap analysis.</p>

        <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <p style={{ ...S.step, marginBottom: 0 }}>
            <strong style={{ color: 'var(--gold)' }}>How to get your free key:</strong><br />
            1. Go to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">aistudio.google.com</a><br />
            2. Sign in with your <strong>Google account</strong><br />
            3. Click <strong>"Get API key"</strong> in the left sidebar<br />
            4. Click <strong>"Create API key"</strong><br />
            5. A popup appears: <em>"Select a Google Cloud project"</em><br />
            &nbsp;&nbsp;&nbsp;→ If you see existing projects, just select any one of them<br />
            &nbsp;&nbsp;&nbsp;→ Or click <strong>"Create API key in new project"</strong><br />
            6. Your key appears — starts with <code style={{ color: 'var(--gold)' }}>AIza</code><br />
            7. Click the <strong>copy icon</strong> next to it<br />
            8. Paste it below
          </p>
        </div>

        <Input
          label="Gemini API Key"
          type="password"
          value={geminiKey}
          onChange={setGeminiKey}
          placeholder="AIzaSy..."
        />
        <Button variant="ghost" size="sm" style={{ marginTop: 10 }} onClick={testGemini}>
          Test Gemini Key
        </Button>
        <p style={S.hint}>Free tier: 1,500 requests/day, 15/minute. Plenty for personal use.</p>
      </Card>

      {/* ── TELEGRAM ── */}
      <Card style={S.section}>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>📱 Telegram Notifications</h3>
        <p style={S.step}>Sends you instant alerts when new matching jobs are found. Optional but highly recommended.</p>

        <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <p style={{ ...S.step, marginBottom: 0 }}>
            <strong style={{ color: 'var(--gold)' }}>Step A — Create your bot (2 minutes):</strong><br />
            1. Open <strong>Telegram</strong> on phone or desktop<br />
            2. Search for <strong>@BotFather</strong> (official, has blue verified tick)<br />
            3. Click <strong>Start</strong><br />
            4. Type <code style={{ color: 'var(--gold)' }}>/newbot</code> and send<br />
            5. It asks: <em>"What name do you want?"</em> → type <code style={{ color: 'var(--gold)' }}>CareerOS</code><br />
            6. It asks: <em>"What username?"</em> → type something unique like <code style={{ color: 'var(--gold)' }}>careeros_thanjanbot</code> (must end in "bot")<br />
            7. BotFather replies with your token — a long string like:<br />
            &nbsp;&nbsp;&nbsp;<code style={{ color: 'var(--gold)', fontSize: 11 }}>7123456789:AAF-xxxxxxxxxxxxxxxxxxxxxxxxxxx</code><br />
            8. Copy that entire string<br /><br />

            <strong style={{ color: 'var(--gold)' }}>Step B — Get your Chat ID:</strong><br />
            1. Still in Telegram, search for <strong>@userinfobot</strong><br />
            2. Click Start → it immediately replies<br />
            3. Look for <strong>Id:</strong> followed by a number like <code style={{ color: 'var(--gold)' }}>987654321</code><br />
            4. Copy that number<br /><br />

            <strong style={{ color: 'var(--gold)' }}>Step C — Activate your bot:</strong><br />
            1. Search Telegram for the bot you just created (by its username)<br />
            2. Click <strong>Start</strong> — this is required before it can send you messages
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            label="Bot Token (from BotFather)"
            value={tgToken}
            onChange={setTgToken}
            placeholder="7123456789:AAF-xxxxxxxxxxxxx"
          />
          <Input
            label="Your Chat ID (from @userinfobot)"
            value={tgChatId}
            onChange={setTgChatId}
            placeholder="987654321"
          />
        </div>
        <Button variant="ghost" size="sm" style={{ marginTop: 10 }} onClick={testTelegram}>
          Send Test Message
        </Button>
        {testing && (
          <p style={{ fontSize: 13, color: testing.startsWith('✅') ? 'var(--success)' : 'var(--danger)', marginTop: 8 }}>
            {testing}
          </p>
        )}
      </Card>

      {/* ── SAVE ── */}
      {saved && (
        <div style={{
          padding: '12px 16px', background: 'var(--success-dim)',
          border: '1px solid var(--success)', borderRadius: 10,
          color: 'var(--success)', fontSize: 14, marginBottom: 16,
        }}>
          {saved}
        </div>
      )}

      <Button fullWidth size="lg" onClick={saveAll}>
        💾 Save All Settings
      </Button>

      <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
        All keys are stored in your browser's localStorage only.<br />
        They are never transmitted to any external server by CareerOS.
      </p>
    </div>
  )
}
