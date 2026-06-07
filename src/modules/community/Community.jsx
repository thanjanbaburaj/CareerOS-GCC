import React, { useState } from 'react'
import { Card, Button, Input, Badge, Tabs } from '../../components/ui/index.jsx'

const SALARY_DATA = [
  { role: 'Marketing Manager',        exp: '5–8 yrs',  min: 18000, max: 28000, city: 'Dubai' },
  { role: 'Finance Manager',          exp: '5–8 yrs',  min: 22000, max: 35000, city: 'Dubai' },
  { role: 'Software Engineer (Mid)',  exp: '3–5 yrs',  min: 15000, max: 25000, city: 'Dubai' },
  { role: 'HR Manager',               exp: '5–8 yrs',  min: 15000, max: 24000, city: 'Dubai' },
  { role: 'Sales Manager',            exp: '5–8 yrs',  min: 16000, max: 28000, city: 'Dubai' },
  { role: 'General Manager',          exp: '15+ yrs',  min: 45000, max: 80000, city: 'Dubai' },
  { role: 'Regional Director',        exp: '12+ yrs',  min: 40000, max: 70000, city: 'Dubai' },
  { role: 'Country Manager',          exp: '10+ yrs',  min: 38000, max: 65000, city: 'Dubai' },
  { role: 'Operations Manager',       exp: '6–10 yrs', min: 20000, max: 32000, city: 'Dubai' },
  { role: 'Legal Counsel',            exp: '5–8 yrs',  min: 25000, max: 42000, city: 'Dubai' },
  { role: 'Data Scientist',           exp: '3–6 yrs',  min: 18000, max: 32000, city: 'Dubai' },
  { role: 'Project Manager (PMP)',    exp: '6–10 yrs', min: 20000, max: 35000, city: 'Dubai' },
]

const GROUPS = [
  { name: 'Dubai Professionals Network',    platform: 'LinkedIn',  members: '45K+', focus: 'General' },
  { name: 'UAE Tech Community',             platform: 'Telegram',  members: '12K+', focus: 'Technology' },
  { name: 'Finance Professionals GCC',      platform: 'LinkedIn',  members: '28K+', focus: 'Finance' },
  { name: 'HR Network UAE',                 platform: 'LinkedIn',  members: '18K+', focus: 'HR' },
  { name: 'Real Estate Professionals Dubai', platform: 'WhatsApp', members: '5K+',  focus: 'Real Estate' },
  { name: 'Marketing GCC',                  platform: 'LinkedIn',  members: '22K+', focus: 'Marketing' },
  { name: 'Dubai Expats Jobs',              platform: 'Telegram',  members: '30K+', focus: 'General' },
  { name: 'Saudi Arabia Professionals',     platform: 'LinkedIn',  members: '35K+', focus: 'KSA' },
]

const UAE_RESOURCES = [
  { title: 'MOHRE — Ministry of HR',          url: 'https://www.mohre.gov.ae',       desc: 'UAE Labour Law, wage protection, complaints' },
  { title: 'Bayt.com',                        url: 'https://www.bayt.com',           desc: '#1 job board in the GCC' },
  { title: 'GulfTalent',                      url: 'https://www.gulftalent.com',     desc: 'Senior & professional roles across GCC' },
  { title: 'Naukrigulf',                      url: 'https://www.naukrigulf.com',     desc: 'Strong expat community, mid-level roles' },
  { title: 'Dubizzle Jobs',                   url: 'https://www.dubizzle.com/jobs',  desc: 'SME and startup roles in UAE' },
  { title: 'LinkedIn UAE Jobs',               url: 'https://www.linkedin.com/jobs',  desc: 'Multinationals and professional network' },
  { title: 'UAE Golden Visa Portal',          url: 'https://gcp.gov.ae',             desc: 'Check eligibility and apply for Golden Visa' },
  { title: 'Tasheel — MOHRE Transactions',   url: 'https://tasheel.mohre.gov.ae',   desc: 'Labour card, visa transfer, EOSB calc' },
  { title: 'KHDA — Dubai Education',         url: 'https://www.khda.gov.ae',        desc: 'Training and qualifications verification' },
  { title: 'Abu Dhabi Government Jobs',       url: 'https://www.adgovjobs.ae',       desc: 'Abu Dhabi government sector vacancies' },
]

export default function Community() {
  const [tab, setTab] = useState('salary')
  const [search, setSearch] = useState('')
  const [referralEmail, setReferralEmail] = useState('')
  const [referralSent, setReferralSent] = useState(false)

  const filteredSalary = SALARY_DATA.filter(s =>
    !search || s.role.toLowerCase().includes(search.toLowerCase())
  )

  function sendReferral() {
    if (!referralEmail) return
    const subject = encodeURIComponent('Join me on CareerOS GCC — Free career platform for UAE professionals')
    const body = encodeURIComponent(`Hi,\n\nI wanted to share CareerOS GCC with you — it's a free career management platform built specifically for UAE and GCC professionals.\n\nIt includes job search, CV builder, application tracker, interview prep, and much more. All completely free.\n\nhttps://careeros.app\n\nHope it helps!\n\nBest regards`)
    window.open(`mailto:${referralEmail}?subject=${subject}&body=${body}`)
    setReferralSent(true)
    setReferralEmail('')
    setTimeout(() => setReferralSent(false), 3000)
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>Community & Resources</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>GCC salary data, professional communities, UAE resources, and referrals</p>
      </div>

      <Tabs
        tabs={[
          { id: 'salary',    label: '💰 Salary Guide' },
          { id: 'groups',    label: '👥 Communities'  },
          { id: 'resources', label: '🔗 UAE Resources' },
          { id: 'referral',  label: '🎁 Refer a Friend' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div style={{ marginTop: 24 }}>

        {/* SALARY GUIDE */}
        {tab === 'salary' && (
          <div>
            <Card style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--gold-glow)', borderColor: 'var(--border-gold)' }}>
              <p style={{ fontSize: 13, color: 'var(--gold)', margin: 0 }}>
                💡 Salaries shown are approximate market ranges for Dubai, UAE (AED/month). Actual packages vary by company, nationality, experience, and negotiation. Data updated periodically from public sources.
              </p>
            </Card>
            <Input
              value={search}
              onChange={setSearch}
              placeholder="Search role…"
              style={{ marginBottom: 16 }}
            />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    {['Role', 'Experience', 'Min (AED)', 'Max (AED)', 'City'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSalary.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-surface)' : 'transparent' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>{s.role}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{s.exp}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--success)', fontWeight: 600 }}>{s.min.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--gold)', fontWeight: 600 }}>{s.max.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{s.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMMUNITIES */}
        {tab === 'groups' && (
          <div>
            <Card style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--teal-dim)', borderColor: 'rgba(61,188,184,0.3)' }}>
              <p style={{ fontSize: 13, color: 'var(--teal)', margin: 0 }}>
                💡 These are external communities — CareerOS does not host or moderate them. We've curated the most active ones for GCC professionals.
              </p>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {GROUPS.map((g, i) => (
                <Card key={i} style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <h4 style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.3 }}>{g.name}</h4>
                    <Badge variant={g.platform === 'LinkedIn' ? 'teal' : g.platform === 'Telegram' ? 'gold' : 'default'} size="sm">
                      {g.platform}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    👥 {g.members} · 🏷️ {g.focus}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(g.name + ' ' + g.platform)}`, '_blank')}
                  >
                    Find Group →
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* UAE RESOURCES */}
        {tab === 'resources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {UAE_RESOURCES.map((r, i) => (
              <Card key={i} style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{r.title}</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{r.desc}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => window.open(r.url, '_blank')}>
                    Visit →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* REFERRAL */}
        {tab === 'referral' && (
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <Card style={{ textAlign: 'center', background: 'var(--gold-glow)', borderColor: 'var(--border-gold)', marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>Help a Friend Find Their Next Role</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                CareerOS is free. Share it with colleagues, friends, and anyone in your network who is job searching. Every professional in GCC deserves these tools.
              </p>
            </Card>
            <Card>
              <h4 style={{ fontSize: 15, marginBottom: 16 }}>Invite by Email</h4>
              <Input
                label="Friend's Email"
                type="email"
                value={referralEmail}
                onChange={setReferralEmail}
                placeholder="colleague@email.com"
              />
              <Button
                fullWidth
                style={{ marginTop: 14 }}
                onClick={sendReferral}
                disabled={!referralEmail}
              >
                {referralSent ? '✓ Email Opened!' : '📧 Send Invitation'}
              </Button>
            </Card>

            <Card style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 15, marginBottom: 12 }}>Share Your Referral Link</h4>
              <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '10px 14px',
                fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--gold)',
                marginBottom: 12,
              }}>
                https://careeros.app
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText('https://careeros.app')}
                >
                  📋 Copy Link
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Check out CareerOS GCC — a free career management platform built for UAE professionals: https://careeros.app')}`, '_blank')}
                >
                  📱 WhatsApp
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
