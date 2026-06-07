import React, { useState } from 'react'
import { Card, Button, Input, Tabs, Badge } from '../../components/ui/index.jsx'

const FREE_ZONES = [
  { name: 'TECOM (Dubai Media/Internet City)', cost: 'AED 7,500–12,000/yr', activities: 'Media, Tech, Consulting', processing: '7–14 days', remote: true },
  { name: 'twofour54 (Abu Dhabi)',             cost: 'AED 15,000–20,000/yr', activities: 'Media, Creative',        processing: '10–21 days', remote: false },
  { name: 'Fujairah Creative City',            cost: 'AED 6,000–10,000/yr', activities: 'General Consulting',     processing: '5–10 days', remote: true },
  { name: 'Sharjah Media City (Shams)',        cost: 'AED 5,750–9,000/yr',  activities: 'Media, E-commerce, Consulting', processing: '3–7 days', remote: true },
  { name: 'IFZA (Dubai)',                      cost: 'AED 11,000–16,000/yr', activities: 'All professional activities', processing: '5–10 days', remote: true },
  { name: 'RAK Digital Assets Oasis',         cost: 'AED 5,000–9,000/yr',  activities: 'Tech, Digital, Consulting', processing: '5–7 days', remote: true },
]

const RATE_DATA = [
  { field: 'Marketing & Digital',    junior: '150–250', mid: '300–500', senior: '600–1,200' },
  { field: 'Finance & Accounting',   junior: '200–350', mid: '400–700', senior: '800–1,500' },
  { field: 'Software Development',   junior: '200–400', mid: '450–800', senior: '900–1,800' },
  { field: 'HR & Recruitment',       junior: '150–250', mid: '300–500', senior: '600–1,000' },
  { field: 'Legal & Compliance',     junior: 'N/A',     mid: '500–900', senior: '1,000–2,500' },
  { field: 'Engineering & Projects', junior: '250–400', mid: '500–900', senior: '1,000–2,000' },
  { field: 'Consulting & Strategy',  junior: '300–500', mid: '600–1,000', senior: '1,200–3,000' },
  { field: 'Training & Coaching',    junior: '200–350', mid: '400–700', senior: '800–1,500' },
]

const CHECKLIST = [
  { step: 1, title: 'Choose your free zone',                  detail: 'Compare cost, activities, and proximity. Shams and Fujairah are most cost-effective.' },
  { step: 2, title: 'Select your business activity',          detail: 'Must match what you will actually do. Can add multiple activities (extra cost).' },
  { step: 3, title: 'Prepare documents',                      detail: 'Passport copy, Emirates ID, 2 passport photos, No Objection Certificate (if employed).' },
  { step: 4, title: 'Apply online or through free zone portal', detail: 'Most free zones have fully online applications now. Processing: 3–21 days.' },
  { step: 5, title: 'Pay fees and receive licence',           detail: 'Trade licence + establishment card + visa eligibility (if required).' },
  { step: 6, title: 'Open a business bank account',           detail: 'Required for invoicing. Emirates NBD, Mashreq Neo, or Wio Bank (digital, fastest).' },
  { step: 7, title: 'Register for VAT (if applicable)',       detail: 'Required if turnover exceeds AED 375,000/year. Voluntary registration at AED 187,500.' },
  { step: 8, title: 'Understand UAE Corporate Tax',           detail: '9% corporate tax applies to taxable income above AED 375,000/year from June 2023.' },
]

export default function Freelance() {
  const [tab, setTab] = useState('guide')
  const [checklist, setChecklist] = useState({})
  const [hours, setHours] = useState('160')
  const [rate,  setRate]  = useState('400')
  const [expenses, setExpenses] = useState('5000')

  const monthly   = parseInt(hours) * parseInt(rate)
  const annualRev = monthly * 12
  const annualExp = parseInt(expenses) * 12
  const annualNet = annualRev - annualExp
  const vatApplies  = annualRev > 375000
  const corpTaxNet  = annualNet > 375000 ? annualNet - ((annualNet - 375000) * 0.09) : annualNet

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>Freelance in UAE</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Everything you need to go independent in the UAE</p>
      </div>

      <Tabs
        tabs={[
          { id: 'guide',    label: '🗺️ Step-by-Step Guide' },
          { id: 'zones',    label: '🏢 Free Zone Comparison' },
          { id: 'rates',    label: '💰 Rate Calculator'      },
          { id: 'market',   label: '📊 Market Rates'         },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div style={{ marginTop: 24 }}>

        {/* GUIDE */}
        {tab === 'guide' && (
          <div>
            <Card style={{ marginBottom: 20, background: 'var(--gold-glow)', borderColor: 'var(--border-gold)' }}>
              <p style={{ fontSize: 13, color: 'var(--gold)', margin: 0, lineHeight: 1.7 }}>
                💡 UAE is one of the world's best places to freelance. Zero income tax, world-class infrastructure, and growing demand for specialist skills. A freelance permit starts from AED 5,750/year.
              </p>
            </Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CHECKLIST.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', gap: 16,
                    background: 'var(--bg-card)', border: `1px solid ${checklist[i] ? 'var(--success)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                    transition: 'all var(--transition)',
                  }}
                >
                  <div
                    onClick={() => setChecklist(c => ({ ...c, [i]: !c[i] }))}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                      background: checklist[i] ? 'var(--success)' : 'var(--bg-elevated)',
                      border: `2px solid ${checklist[i] ? 'var(--success)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, color: '#fff', fontWeight: 700,
                    }}
                  >
                    {checklist[i] ? '✓' : item.step}
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: 14, color: checklist[i] ? 'var(--success)' : 'var(--text-primary)',
                      marginBottom: 4,
                      textDecoration: checklist[i] ? 'line-through' : 'none',
                    }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FREE ZONES */}
        {tab === 'zones' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
            {FREE_ZONES.map((z, i) => (
              <Card key={i} style={{ padding: '18px' }}>
                <h4 style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.4 }}>{z.name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Annual Cost</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{z.cost}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Processing</span>
                    <span style={{ color: 'var(--teal)' }}>{z.processing}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Remote Friendly</span>
                    <Badge variant={z.remote ? 'success' : 'default'} size="sm">{z.remote ? 'Yes' : 'Requires Office'}</Badge>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.5 }}>
                  Activities: {z.activities}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  style={{ marginTop: 10 }}
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(z.name + ' freelance permit apply')}`, '_blank')}
                >
                  Learn More →
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* RATE CALCULATOR */}
        {tab === 'rates' && (
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <Card style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 20 }}>Freelance Income Calculator</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Input label="Billable Hours per Month" type="number" value={hours} onChange={setHours} placeholder="160" />
                <Input label="Hourly Rate (AED)" type="number" value={rate} onChange={setRate} placeholder="400" />
                <Input label="Monthly Expenses (AED)" type="number" value={expenses} onChange={setExpenses} placeholder="5000" />
              </div>
            </Card>

            <Card style={{ background: 'var(--bg-elevated)' }}>
              <h4 style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20, fontFamily: 'var(--font-body)' }}>Your Projection</h4>
              {[
                { label: 'Monthly Revenue',     value: `AED ${monthly.toLocaleString()}`,     color: 'var(--gold)' },
                { label: 'Annual Revenue',      value: `AED ${annualRev.toLocaleString()}`,   color: 'var(--gold)' },
                { label: 'Annual Expenses',     value: `AED ${annualExp.toLocaleString()}`,   color: 'var(--danger)' },
                { label: 'Annual Net (pre-tax)',value: `AED ${annualNet.toLocaleString()}`,   color: 'var(--success)' },
                { label: 'After Corp Tax (9%)', value: `AED ${Math.round(corpTaxNet).toLocaleString()}`, color: 'var(--teal)' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: r.color, fontFamily: 'var(--font-mono)' }}>{r.value}</span>
                </div>
              ))}
              {vatApplies && (
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--warning-dim)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: 12, color: 'var(--warning)', margin: 0 }}>
                    ⚠️ Your projected revenue exceeds AED 375,000 — VAT registration (5%) is mandatory.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* MARKET RATES */}
        {tab === 'market' && (
          <div>
            <Card style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--info-dim)', borderColor: 'rgba(74,158,214,0.3)' }}>
              <p style={{ fontSize: 13, color: 'var(--info)', margin: 0 }}>
                Rates shown in AED per hour. Senior rates apply to professionals with 10+ years experience. Data is indicative — actual rates vary by client, project complexity, and negotiation.
              </p>
            </Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    {['Field', 'Junior (AED/hr)', 'Mid (AED/hr)', 'Senior (AED/hr)'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RATE_DATA.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-surface)' : 'transparent' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>{r.field}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{r.junior}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--gold)' }}>{r.mid}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--success)', fontWeight: 600 }}>{r.senior}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
