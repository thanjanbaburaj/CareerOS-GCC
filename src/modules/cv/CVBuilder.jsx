import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import authStore from '../../store/authStore.js'
import { buildCVFromAnswers } from '../../services/api/geminiAPI.js'
import { Card, Button, Input, Badge, Tabs, EmptyState } from '../../components/ui/index.jsx'

const DISCOVERY_STEPS = [
  {
    id: 'identity',
    title: 'Your Identity',
    icon: '👤',
    fields: [
      { key: 'cvName',     label: 'Full Name',          type: 'text',  placeholder: 'As it appears on official documents' },
      { key: 'cvTitle',    label: 'Professional Title', type: 'text',  placeholder: 'e.g. Senior Marketing Manager' },
      { key: 'cvEmail',    label: 'Email',              type: 'email', placeholder: 'professional@email.com' },
      { key: 'cvPhone',    label: 'Phone / WhatsApp',   type: 'text',  placeholder: '+971 50 000 0000' },
      { key: 'cvLocation', label: 'City, Country',      type: 'text',  placeholder: 'Dubai, UAE' },
      { key: 'cvLinkedIn', label: 'LinkedIn URL',       type: 'text',  placeholder: 'linkedin.com/in/yourname (optional)' },
    ],
  },
  {
    id: 'summary',
    title: 'Your Story',
    icon: '📖',
    description: 'Tell us about your most recent or current role. Write naturally — the AI will transform it into professional bullet points.',
    fields: [
      { key: 'role1Title',   label: 'Job Title',      type: 'text', placeholder: 'Marketing Manager' },
      { key: 'role1Company', label: 'Company Name',   type: 'text', placeholder: 'Emaar Properties' },
      { key: 'role1Period',  label: 'Period',         type: 'text', placeholder: 'Jan 2022 – Present' },
      { key: 'role1Desc',    label: 'What did you do? (your words)', type: 'textarea', rows: 5,
        placeholder: 'Tell us what you actually did day to day. Include any achievements, numbers, team size, projects…' },
    ],
  },
  {
    id: 'previous',
    title: 'Previous Role',
    icon: '🏢',
    description: 'Tell us about the role before that. Skip if this was your first.',
    fields: [
      { key: 'role2Title',   label: 'Job Title',    type: 'text', placeholder: 'Marketing Executive' },
      { key: 'role2Company', label: 'Company Name', type: 'text', placeholder: 'ADNOC' },
      { key: 'role2Period',  label: 'Period',       type: 'text', placeholder: 'Jun 2019 – Dec 2021' },
      { key: 'role2Desc',    label: 'What did you do?', type: 'textarea', rows: 4,
        placeholder: 'Responsibilities, achievements, tools used…' },
    ],
  },
  {
    id: 'skills',
    title: 'Skills & Tools',
    icon: '🛠️',
    description: 'List your key skills, tools, and software. The AI will organise these.',
    fields: [
      { key: 'skillsMain',   label: 'Core Skills (comma-separated)',   type: 'textarea', rows: 2,
        placeholder: 'Strategic planning, team leadership, budget management, stakeholder engagement…' },
      { key: 'skillsTools',  label: 'Tools & Software',                type: 'textarea', rows: 2,
        placeholder: 'Salesforce, HubSpot, Google Analytics, Microsoft Office, SAP…' },
      { key: 'skillsLangs',  label: 'Languages (e.g. English - Native, Arabic - Conversational)', type: 'text',
        placeholder: 'English - Professional, Arabic - Basic' },
    ],
  },
  {
    id: 'education',
    title: 'Education',
    icon: '🎓',
    fields: [
      { key: 'edu1Degree',  label: 'Highest Qualification', type: 'text', placeholder: 'BSc Business Administration' },
      { key: 'edu1School',  label: 'Institution',           type: 'text', placeholder: 'American University of Dubai' },
      { key: 'edu1Year',    label: 'Graduation Year',       type: 'text', placeholder: '2019' },
      { key: 'certifications', label: 'Certifications / Courses', type: 'textarea', rows: 2,
        placeholder: 'PMP, Google Analytics, CFA Level 1…' },
    ],
  },
]

function CVPreview({ cv, answers }) {
  if (!cv) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Complete the discovery questions and click "Build My CV" to generate your professional CV here.</p>
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid var(--gold)', paddingBottom: 16, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4 }}>
          {answers.cvName || 'Your Name'}
        </h1>
        <div style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>
          {answers.cvTitle || 'Professional Title'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          {answers.cvEmail    && <span>✉️ {answers.cvEmail}</span>}
          {answers.cvPhone    && <span>📱 {answers.cvPhone}</span>}
          {answers.cvLocation && <span>📍 {answers.cvLocation}</span>}
          {answers.cvLinkedIn && <span>🔗 {answers.cvLinkedIn}</span>}
        </div>
      </div>

      {/* Summary */}
      {cv.summary && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontFamily: 'var(--font-body)' }}>Professional Summary</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{cv.summary}</p>
        </div>
      )}

      {/* Experience */}
      {cv.experience?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, fontFamily: 'var(--font-body)' }}>Experience</h3>
          {cv.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 4 }}>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{exp.role}</strong>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{exp.period}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--gold-light)', marginBottom: 6 }}>{exp.company}</div>
              <ul style={{ paddingLeft: 16 }}>
                {exp.bullets?.map((b, j) => (
                  <li key={j} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.6 }}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {cv.skills?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontFamily: 'var(--font-body)' }}>Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cv.skills.map((s, i) => (
              <span key={i} style={{
                padding: '3px 12px', borderRadius: 99, fontSize: 12,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CVBuilder() {
  const { user }   = useAuth()
  const [tab, setTab] = useState('build')
  const [step, setStep]   = useState(0)
  const [answers, setAnswers] = useState({})
  const [cv,      setCV]      = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [keywords, setKeywords] = useState(user?.cvKeywords?.join(', ') || '')

  function upd(key, val) { setAnswers(a => ({ ...a, [key]: val })) }

  async function buildCV() {
    setLoading(true)
    setError('')
    try {
      const raw  = await buildCVFromAnswers(answers)
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setCV(parsed)
      setTab('preview')

      // Save keywords to user profile
      const skills = [
        ...(answers.skillsMain || '').split(','),
        ...(answers.skillsTools || '').split(','),
        answers.role1Title, answers.role2Title,
      ].map(s => s?.trim()).filter(Boolean)
      await authStore.updateUser({ cvKeywords: skills, cvComplete: true })
    } catch (e) {
      setError('Could not build CV. Add your Gemini API key in Settings, or check your connection.')
    } finally {
      setLoading(false)
    }
  }

  async function saveKeywords() {
    const kws = keywords.split(',').map(k => k.trim()).filter(Boolean)
    await authStore.updateUser({ cvKeywords: kws })
    alert('Keywords saved! Job matching will now use these.')
  }

  const currentStep = DISCOVERY_STEPS[step]
  const isLast      = step === DISCOVERY_STEPS.length - 1

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>CV Builder</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Answer questions — AI transforms your answers into a professional CV</p>
      </div>

      <Tabs
        tabs={[
          { id: 'build',    label: '📝 Build by Discovery', icon: '' },
          { id: 'preview',  label: '👁 CV Preview',         icon: '' },
          { id: 'keywords', label: '🔑 Job Keywords',       icon: '' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div style={{ marginTop: 24 }}>

        {/* BUILD TAB */}
        {tab === 'build' && (
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>

            {/* Steps sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {DISCOVERY_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStep(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${i === step ? 'var(--gold)' : 'var(--border)'}`,
                    background: i === step ? 'var(--gold-glow)' : 'transparent',
                    color: i === step ? 'var(--gold)' : 'var(--text-muted)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                    fontSize: 13, fontWeight: i === step ? 700 : 400,
                    textAlign: 'left', transition: 'all var(--transition)',
                  }}
                >
                  <span>{s.icon}</span>
                  <span>{s.title}</span>
                </button>
              ))}
            </div>

            {/* Step content */}
            <Card>
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>
                {currentStep.icon} {currentStep.title}
              </h3>
              {currentStep.description && (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                  {currentStep.description}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {currentStep.fields.map(field => (
                  <Input
                    key={field.key}
                    label={field.label}
                    value={answers[field.key] || ''}
                    onChange={v => upd(field.key, v)}
                    placeholder={field.placeholder}
                    type={field.type === 'textarea' ? 'text' : field.type}
                    multiline={field.type === 'textarea'}
                    rows={field.rows}
                  />
                ))}
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 10, color: 'var(--danger)', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
                  ← Previous
                </Button>
                {isLast ? (
                  <Button onClick={buildCV} loading={loading}>
                    ✨ Build My CV
                  </Button>
                ) : (
                  <Button onClick={() => setStep(s => s + 1)}>
                    Next →
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* PREVIEW TAB */}
        {tab === 'preview' && (
          <Card style={{ maxWidth: 700, margin: '0 auto' }}>
            <CVPreview cv={cv} answers={answers} />
            {cv && (
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <Button variant="ghost" onClick={() => setTab('build')}>← Edit Answers</Button>
                <Button onClick={buildCV} loading={loading} variant="secondary">
                  ↻ Regenerate
                </Button>
                <Button onClick={() => window.print()}>🖨 Print / Save PDF</Button>
              </div>
            )}
          </Card>
        )}

        {/* KEYWORDS TAB */}
        {tab === 'keywords' && (
          <Card>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>🔑 CV Keywords for Job Matching</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              These keywords are used to score job listings against your profile.
              The more accurate they are, the better your job feed matches.
            </p>
            <Input
              label="Your Keywords (comma-separated)"
              value={keywords}
              onChange={setKeywords}
              multiline
              rows={5}
              placeholder="Marketing, SEO, Google Analytics, team leadership, B2B sales, UAE market, budget management…"
            />
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <Button onClick={saveKeywords}>Save Keywords</Button>
              <Button variant="ghost" onClick={() => setTab('build')}>← Update from CV Builder</Button>
            </div>
            {user?.cvKeywords?.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Currently active keywords:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {user.cvKeywords.map((k, i) => (
                    <span key={i} style={{
                      padding: '3px 12px', borderRadius: 99, fontSize: 12,
                      background: 'var(--gold-glow)', border: '1px solid var(--border-gold)',
                      color: 'var(--gold)',
                    }}>{k}</span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
