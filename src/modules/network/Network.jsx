import React, { useState } from 'react'
import { useDB } from '../../hooks/useDB.js'
import { Card, Button, Input, Modal, Badge, EmptyState, Tabs } from '../../components/ui/index.jsx'

const HEADHUNTERS_GCC = [
  { name: 'Charterhouse', specialisation: 'Finance, Banking, Real Estate', coverage: 'UAE, GCC', tier: 'Top Tier' },
  { name: 'Michael Page', specialisation: 'All sectors, mid–senior',       coverage: 'UAE, KSA, Qatar', tier: 'Top Tier' },
  { name: 'Robert Half',  specialisation: 'Finance, Tech, Legal',          coverage: 'Dubai, Abu Dhabi', tier: 'Top Tier' },
  { name: 'Heidrick & Struggles', specialisation: 'C-Suite, Board',        coverage: 'GCC-wide', tier: 'Executive' },
  { name: 'Korn Ferry',   specialisation: 'Executive, Leadership',         coverage: 'GCC-wide', tier: 'Executive' },
  { name: 'Spencer Stuart', specialisation: 'Board, C-Suite',              coverage: 'GCC-wide', tier: 'Executive' },
  { name: 'Black Pearl',  specialisation: 'All sectors, UAE-focused',      coverage: 'UAE', tier: 'Regional' },
  { name: 'Nair & Co',    specialisation: 'Tech, Finance',                 coverage: 'GCC', tier: 'Regional' },
  { name: 'Gulf Recruit', specialisation: 'Oil & Gas, Engineering',        coverage: 'GCC', tier: 'Specialist' },
  { name: 'Mackenzie Jones', specialisation: 'Hospitality, Real Estate',   coverage: 'UAE, GCC', tier: 'Specialist' },
]

const OUTREACH_TEMPLATES = {
  'LinkedIn Connection': `Hi [Name],

I noticed your work at [Company] and have been following [something specific].
I'd love to connect — I'm a [Your Title] with [X] years of experience in [Field], currently exploring new opportunities in [Location].

Looking forward to connecting.

Best regards,
[Your Name]`,

  'Headhunter Introduction': `Dear [Name],

I hope this finds you well. I am reaching out as I am currently exploring senior opportunities in [Field] across the GCC market.

Brief profile:
- [X] years of experience in [Industry]
- Most recent role: [Title] at [Company]
- Expertise in: [Key skills]
- Target roles: [Role types]
- Availability: [Notice period / immediately]

I would welcome the opportunity to discuss how my profile aligns with your current mandates.

Warm regards,
[Your Name]`,

  'Warm Introduction Request': `Hi [Connector's Name],

I hope you are well! I wanted to reach out as I know you are connected to [Target Person] at [Company].

I'm currently exploring new opportunities and [Company] is a company I've been following closely. Would you be comfortable making a brief introduction?

I completely understand if it's not the right time — just thought it was worth asking.

Many thanks,
[Your Name]`,
}

function CompanyCard({ company, onEdit, onDelete }) {
  const daysSince = company.lastChecked
    ? Math.floor((Date.now() - new Date(company.lastChecked).getTime()) / 86400000)
    : null

  return (
    <Card style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{company.name}</h4>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {company.industry && <span>{company.industry} · </span>}
            {company.location}
          </div>
          {company.notes && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{company.notes}</p>
          )}
          {daysSince !== null && (
            <div style={{ fontSize: 11, color: daysSince > 14 ? 'var(--warning)' : 'var(--text-dim)', marginTop: 6 }}>
              {daysSince > 14 ? '⚠️ ' : ''}Last checked {daysSince === 0 ? 'today' : `${daysSince} days ago`}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {company.url && (
            <Button size="sm" variant="ghost" onClick={() => window.open(company.url, '_blank')}>
              🔗 Jobs
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onEdit(company)}>Edit</Button>
        </div>
      </div>
    </Card>
  )
}

export default function Network() {
  const { data: companies, save: saveCompany, remove: removeCompany } = useDB('companies')
  const { data: contacts,  save: saveContact,  remove: removeContact } = useDB('contacts')

  const [tab, setTab]   = useState('companies')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(Object.keys(OUTREACH_TEMPLATES)[0])

  const emptyCompany = { name: '', industry: '', location: '', url: '', notes: '', lastChecked: new Date().toISOString() }
  const emptyContact = { name: '', title: '', company: '', email: '', phone: '', relationship: '', notes: '', lastContact: '' }

  function openNew(type) {
    setEditItem(type === 'company' ? emptyCompany : emptyContact)
    setShowModal(type)
  }
  function openEdit(item, type) { setEditItem(item); setShowModal(type) }
  function closeModal() { setEditItem(null); setShowModal(false) }

  async function saveItem(form) {
    if (showModal === 'company') await saveCompany(form)
    else await saveContact(form)
    closeModal()
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>Network & Companies</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Target companies, key contacts, headhunter directory, and outreach templates</p>
      </div>

      <Tabs
        tabs={[
          { id: 'companies',   label: '🏢 Target Companies' },
          { id: 'contacts',    label: '👤 Key Contacts'     },
          { id: 'headhunters', label: '🔍 Headhunter Directory' },
          { id: 'templates',   label: '✍️ Outreach Templates' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div style={{ marginTop: 24 }}>

        {/* COMPANIES */}
        {tab === 'companies' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button onClick={() => openNew('company')}>+ Add Company</Button>
            </div>
            {companies.length === 0 ? (
              <EmptyState icon="🏢" title="No companies tracked" description="Add companies you're targeting to monitor their job postings and news." action={<Button onClick={() => openNew('company')}>Add First Company</Button>} />
            ) : (
              <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {companies.map(c => <CompanyCard key={c.id} company={c} onEdit={item => openEdit(item, 'company')} onDelete={removeCompany} />)}
              </div>
            )}
          </div>
        )}

        {/* CONTACTS */}
        {tab === 'contacts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button onClick={() => openNew('contact')}>+ Add Contact</Button>
            </div>
            {contacts.length === 0 ? (
              <EmptyState icon="👤" title="No contacts yet" description="Add recruiters, hiring managers, and references to keep track of your network." action={<Button onClick={() => openNew('contact')}>Add First Contact</Button>} />
            ) : (
              <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {contacts.map(c => (
                  <Card key={c.id} style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <h4 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>{c.name}</h4>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{c.title} {c.company && `· ${c.company}`}</div>
                        {c.email && <div style={{ fontSize: 12, color: 'var(--teal)' }}>✉️ {c.email}</div>}
                        {c.relationship && <Badge variant="default" size="sm">{c.relationship}</Badge>}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c, 'contact')}>Edit</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HEADHUNTER DIRECTORY */}
        {tab === 'headhunters' && (
          <div>
            <Card style={{ marginBottom: 20, background: 'var(--gold-glow)', borderColor: 'var(--border-gold)', padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--gold)', margin: 0 }}>
                💡 At Director/GM level, 80% of roles are filled through headhunters. Register your profile with multiple firms simultaneously.
              </p>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {HEADHUNTERS_GCC.map((h, i) => (
                <Card key={i} style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h4 style={{ fontSize: 15, color: 'var(--text-primary)' }}>{h.name}</h4>
                    <Badge variant={h.tier === 'Executive' ? 'gold' : h.tier === 'Top Tier' ? 'teal' : 'default'} size="sm">
                      {h.tier}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>📍 {h.coverage}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🎯 {h.specialisation}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    style={{ marginTop: 12 }}
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(h.name + ' recruitment UAE careers')}`, '_blank')}
                  >
                    Find on Google →
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* OUTREACH TEMPLATES */}
        {tab === 'templates' && (
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {Object.keys(OUTREACH_TEMPLATES).map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTemplate(t)}
                  style={{
                    padding: '7px 16px', borderRadius: 99,
                    border: `1px solid ${selectedTemplate === t ? 'var(--gold)' : 'var(--border)'}`,
                    background: selectedTemplate === t ? 'var(--gold-glow)' : 'transparent',
                    color: selectedTemplate === t ? 'var(--gold)' : 'var(--text-muted)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >{t}</button>
              ))}
            </div>
            <Card>
              <h4 style={{ fontSize: 14, color: 'var(--gold)', marginBottom: 16 }}>{selectedTemplate}</h4>
              <pre style={{
                whiteSpace: 'pre-wrap', fontSize: 13,
                color: 'var(--text-secondary)', lineHeight: 1.8,
                fontFamily: 'var(--font-body)',
              }}>
                {OUTREACH_TEMPLATES[selectedTemplate]}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                style={{ marginTop: 16 }}
                onClick={() => navigator.clipboard.writeText(OUTREACH_TEMPLATES[selectedTemplate])}
              >
                📋 Copy Template
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal === 'company' && editItem && (
        <Modal open title={editItem.id ? 'Edit Company' : 'Add Target Company'} onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Company Name" value={editItem.name} onChange={v => setEditItem(e => ({ ...e, name: v }))} required />
            <Input label="Industry" value={editItem.industry || ''} onChange={v => setEditItem(e => ({ ...e, industry: v }))} placeholder="Real Estate, Banking…" />
            <Input label="Location" value={editItem.location || ''} onChange={v => setEditItem(e => ({ ...e, location: v }))} placeholder="Dubai, UAE" />
            <Input label="Careers Page URL" value={editItem.url || ''} onChange={v => setEditItem(e => ({ ...e, url: v }))} placeholder="https://company.com/careers" />
            <Input label="Notes" value={editItem.notes || ''} onChange={v => setEditItem(e => ({ ...e, notes: v }))} multiline rows={2} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button onClick={() => saveItem(editItem)}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {showModal === 'contact' && editItem && (
        <Modal open title={editItem.id ? 'Edit Contact' : 'Add Contact'} onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Full Name" value={editItem.name} onChange={v => setEditItem(e => ({ ...e, name: v }))} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Job Title" value={editItem.title || ''} onChange={v => setEditItem(e => ({ ...e, title: v }))} />
              <Input label="Company" value={editItem.company || ''} onChange={v => setEditItem(e => ({ ...e, company: v }))} />
              <Input label="Email" type="email" value={editItem.email || ''} onChange={v => setEditItem(e => ({ ...e, email: v }))} />
              <Input label="Phone / WhatsApp" value={editItem.phone || ''} onChange={v => setEditItem(e => ({ ...e, phone: v }))} />
            </div>
            <Input label="Relationship" value={editItem.relationship || ''} onChange={v => setEditItem(e => ({ ...e, relationship: v }))} placeholder="Recruiter, Reference, Hiring Manager, Colleague…" />
            <Input label="Notes" value={editItem.notes || ''} onChange={v => setEditItem(e => ({ ...e, notes: v }))} multiline rows={2} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button onClick={() => saveItem(editItem)}>Save</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
