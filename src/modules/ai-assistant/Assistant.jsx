import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { answerCareerQuestion, generateCoverLetter, analyseGap } from '../../services/api/geminiAPI.js'
import { Card, Button, Input, Badge } from '../../components/ui/index.jsx'

const QUICK_PROMPTS = [
  { icon: '📄', label: 'Cover Letter',    prompt: 'Write me a cover letter for a Marketing Manager role at Emaar Properties in Dubai.' },
  { icon: '💰', label: 'Salary Advice',   prompt: 'What salary should I ask for as a Finance Manager with 7 years experience in Dubai?' },
  { icon: '🎯', label: 'Interview Tips',  prompt: 'What are the top 5 things I must do before a senior interview in UAE?' },
  { icon: '🔍', label: 'Job Strategy',    prompt: 'I have been job searching for 3 months with no offers. What should I change?' },
  { icon: '📋', label: 'Follow Up',       prompt: 'How do I professionally follow up on an application I sent 10 days ago?' },
  { icon: '🌐', label: 'GCC Market',      prompt: 'What industries are hiring most actively in Dubai and GCC right now?' },
  { icon: '⚖️', label: 'Offer Advice',    prompt: 'I have two job offers. How do I decide which one to accept?' },
  { icon: '🚀', label: 'Career Change',   prompt: 'I want to pivot from Finance to Technology in the UAE. Where do I start?' },
]

const SYSTEM_CONTEXT = `You are CareerOS, an expert career advisor specialising in the UAE and GCC job market.
You have deep knowledge of:
- UAE and GCC hiring practices, culture, and salary benchmarks
- UAE Labour Law, visa types, EOSB (end of service gratuity), WPS
- GCC-specific industries: real estate, oil & gas, banking, hospitality, government
- Executive search and recruitment agency landscape in UAE
- Emiratisation, Saudisation, and other GCC nationalisation policies
- UAE free zones, freelance permits, and entrepreneurship
- Cultural norms for professional communication in the region

Always give practical, specific, actionable advice. Be honest about challenges. Keep responses concise but comprehensive. Use bullet points where helpful.`

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16,
      animation: 'fadeIn 0.3s ease',
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, marginRight: 10, alignSelf: 'flex-end',
        }}>✨</div>
      )}
      <div style={{
        maxWidth: '75%',
        padding: '12px 16px',
        borderRadius: isUser
          ? '18px 18px 4px 18px'
          : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg, var(--gold), var(--gold-dim))'
          : 'var(--bg-elevated)',
        border: isUser ? 'none' : '1px solid var(--border)',
        color: isUser ? '#0A1628' : 'var(--text-primary)',
        fontSize: 14,
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
        {msg.loading && (
          <span style={{ display: 'inline-flex', gap: 4, marginLeft: 8 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--text-muted)',
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                display: 'inline-block',
              }} />
            ))}
          </span>
        )}
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, marginLeft: 10, alignSelf: 'flex-end',
        }}>👤</div>
      )}
    </div>
  )
}

export default function Assistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋 I'm your CareerOS AI Assistant, specialising in the UAE and GCC job market.

I can help you with:
- Cover letters and CV advice
- Interview preparation and practice
- Salary negotiation guidance
- Job search strategy
- UAE Labour Law and visa questions
- Career change and growth planning

What would you like to work on today?`,
    }
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey,  setApiKey]  = useState(localStorage.getItem('careeros_gemini_key') || '')
  const [showSettings, setShowSettings] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function saveApiKey() {
    localStorage.setItem('careeros_gemini_key', apiKey)
    setShowSettings(false)
  }

  async function sendMessage(text) {
    const userMsg = text || input.trim()
    if (!userMsg || loading) return
    setInput('')

    setMessages(m => [...m, { role: 'user', content: userMsg }])

    const loadingId = Date.now()
    setMessages(m => [...m, { role: 'assistant', content: '', loading: true, id: loadingId }])
    setLoading(true)

    try {
      const userContext = user
        ? `User profile: ${user.field || ''}, ${user.experience || ''} experience, based in ${user.location || 'UAE'}, targeting ${user.targetLocations?.join(', ') || 'GCC'}.`
        : ''

      const response = await answerCareerQuestion(
        `${SYSTEM_CONTEXT}\n\n${userContext}\n\nUser question: ${userMsg}`,
        userContext
      )

      setMessages(m => m.map(msg =>
        msg.id === loadingId
          ? { role: 'assistant', content: response }
          : msg
      ))
    } catch (e) {
      setMessages(m => m.map(msg =>
        msg.id === loadingId
          ? { role: 'assistant', content: 'Sorry, I encountered an error. Please check your Gemini API key in the settings above.' }
          : msg
      ))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const hasKey = !!localStorage.getItem('careeros_gemini_key')

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      maxWidth: 800, margin: '0 auto', padding: '24px 40px 0',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20, flexShrink: 0,
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 2 }}>
            ✨ AI Career Assistant
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            GCC-specialised career advisor · Powered by Gemini
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowSettings(s => !s)}>
          ⚙️ API Key
        </Button>
      </div>

      {/* API Key Settings */}
      {showSettings && (
        <Card style={{ marginBottom: 16, flexShrink: 0 }}>
          <h4 style={{ fontSize: 14, marginBottom: 12 }}>Gemini API Key</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
            Get a free key at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">aistudio.google.com</a> → "Get API key". Free tier: 1,500 requests/day.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIza..."
              style={{
                flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '9px 14px',
                fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', outline: 'none',
              }}
            />
            <Button size="sm" onClick={saveApiKey}>Save</Button>
          </div>
        </Card>
      )}

      {/* No API key warning */}
      {!hasKey && !showSettings && (
        <Card style={{ marginBottom: 16, background: 'var(--warning-dim)', borderColor: 'var(--warning)', padding: '12px 16px', flexShrink: 0 }}>
          <p style={{ fontSize: 13, color: 'var(--warning)', margin: 0 }}>
            ⚙️ Add your free Gemini API key above to activate AI responses. Get one free at{' '}
            <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>aistudio.google.com</a>
          </p>
        </Card>
      )}

      {/* Quick prompts */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap',
        marginBottom: 16, flexShrink: 0,
      }}>
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => sendMessage(p.prompt)}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              fontSize: 12, fontFamily: 'var(--font-body)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition)',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '4px 0 20px',
        minHeight: 0,
      }}>
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 0 24px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your career in UAE/GCC…  (Enter to send, Shift+Enter for new line)"
            disabled={loading}
            rows={2}
            style={{
              flex: 1,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              color: 'var(--text-primary)',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.6,
              transition: 'border-color var(--transition)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <Button
            onClick={() => sendMessage()}
            loading={loading}
            disabled={!input.trim() || loading}
            style={{ alignSelf: 'flex-end', height: 44 }}
          >
            Send →
          </Button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, textAlign: 'center' }}>
          AI advice is for guidance only. Always verify legal and financial information independently.
        </p>
      </div>
    </div>
  )
}
