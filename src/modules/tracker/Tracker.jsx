import React, { useState } from 'react'
import { useDB } from '../../hooks/useDB.js'
import { Card, Button, Input, Modal, Badge, EmptyState, Select } from '../../components/ui/index.jsx'

const STAGES = [
  { id: 'saved',      label: 'Saved',      color: 'var(--text-muted)', icon: '🔖' },
  { id: 'applied',    label: 'Applied',    color: 'var(--info)',        icon: '📤' },
  { id: 'screening',  label: 'Screening',  color: 'var(--warning)',     icon: '📞' },
  { id: 'interview',  label: 'Interview',  color: 'var(--teal)',        icon: '🎯' },
  { id: 'offer',      label: 'Offer',      color: 'var(--success)',     icon: '🏆' },
  { id: 'rejected',   label: 'Rejected',   color: 'var(--danger)',      icon: '❌' },
]

const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.id, s]))

const EMPTY_APP = {
  title: '', company: '', location: '', url: '',
  salary: '', source: 'Manual', stage: 'applied',
  notes: '', contactName: '', contactEmail: '',
  appliedAt: new Date().toISOString().slice(0, 10),
}

function daysSince(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

function AppCard({ app, onEdit, onDelete, onMove }) {
  const stage   = STAGE_MAP[app.stage] || STAGE_MAP.saved
  const days    = daysSince(app.appliedAt || app.savedAt)
  const needsFollowUp = app.stage === 'applied' && days >= 7

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: `1px solid ${needsFollowUp ? 'var(--warning)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      marginBottom: 10,
      transition: 'all var(--transition)',
      cursor: 'pointer',
    }}
      onClick={() => onEdit(app)}
    >
      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
        {app.title || 'Untitled Role'}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
        {app.company}{app.location && ` · ${app.location}`}
      </div>
      {app.salary && (
        <div style={{ fontSize: 11, color: 'var(--success)', marginBottom: 6 }}>💰 {app.salary}</div>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {days !== null && (
          <span style={{ fontSize: 11, color: needsFollowUp ? 'var(--warning)' : 'var(--text-dim)' }}>
            {needsFollowUp ? '⚠️ Follow up?' : `${days}d ago`}
          </span>
        )}
        {app.source && (
          <span style={{
            fontSize: 10, padding: '1px 7px', borderRadius: 99,
            background: 'var(--bg-card)', color: 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}>{app.source}</span>
        )}
      </div>
      {/* Stage move buttons */}
      <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}
        onClick={e => e.stopPropagation()}
      >
        {STAGES.filter(s => s.id !== app.stage).slice(0, 3).map(s => (
          <button
            key={s.id}
            onClick={() => onMove(app.id, s.id)}
            style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 99,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >→ {s.label}</button>
        ))}
      </div>
    </div>
  )
}

function AppModal({ app, onSave, onClose, onDelete }) {
  const [form, setForm] = useState(app || EMPTY_APP)
  function upd(k, v) { setForm(f => ({ ...f, [k]: v })) }

  return (
    <Modal open title={form.id ? 'Edit Application' : 'Add Application'} onClose={onClose} width={600}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Job Title"   value={form.title}   onChange={v => upd('title', v)}   required />
          <Input label="Company"     value={form.company} onChange={v => upd('company', v)} required />
          <Input label="Location"    value={form.location} onChange={v => upd('location', v)} />
          <Input label="Salary"      value={form.salary}  onChange={v => upd('salary', v)} placeholder="AED 15,000/mo" />
          <Input label="Apply URL"   value={form.url}     onChange={v => upd('url', v)} placeholder="https://..." />
          <Input label="Applied Date" type="date" value={form.appliedAt} onChange={v => upd('appliedAt', v)} />
          <Input label="Contact Name"  value={form.contactName}  onChange={v => upd('contactName', v)}  placeholder="HR / Hiring Manager" />
          <Input label="Contact Email" value={form.contactEmail} onChange={v => upd('contactEmail', v)} placeholder="hr@company.com" />
        </div>
        <Select
          label="Stage"
          value={form.stage}
          onChange={v => upd('stage', v)}
          options={STAGES.map(s => ({ value: s.id, label: `${s.icon} ${s.label}` }))}
        />
        <Input label="Notes" value={form.notes} onChange={v => upd('notes', v)} multiline rows={3} placeholder="Interview notes, key contacts, follow-up actions…" />
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {form.id && (
            <Button variant="danger" size="sm" onClick={() => { onDelete(form.id); onClose() }}>
              Delete
            </Button>
          )}
          <div style={{ flex: 1 }} />
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(form); onClose() }}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Tracker() {
  const { data: apps, save, remove } = useDB('applications')
  const [editApp, setEditApp]   = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStage, setFilterStage] = useState('all')

  function openNew()       { setEditApp({ ...EMPTY_APP }); setShowModal(true) }
  function openEdit(app)   { setEditApp(app);              setShowModal(true) }
  function closeModal()    { setEditApp(null);             setShowModal(false) }

  async function handleSave(form) {
    await save(form)
    closeModal()
  }
  async function handleDelete(id) { await remove(id) }
  async function handleMove(id, stage) {
    const app = apps.find(a => a.id === id)
    if (app) await save({ ...app, stage })
  }

  const filtered = filterStage === 'all' ? apps : apps.filter(a => a.stage === filterStage)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>Application Tracker</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {apps.length} application{apps.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <Button onClick={openNew}>+ Add Application</Button>
      </div>

      {/* Stage filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterStage('all')}
          style={{
            padding: '6px 14px', borderRadius: 99, border: '1px solid var(--border)',
            background: filterStage === 'all' ? 'var(--gold-glow)' : 'transparent',
            color: filterStage === 'all' ? 'var(--gold)' : 'var(--text-muted)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >All ({apps.length})</button>
        {STAGES.map(s => {
          const count = apps.filter(a => a.stage === s.id).length
          return (
            <button key={s.id}
              onClick={() => setFilterStage(s.id)}
              style={{
                padding: '6px 14px', borderRadius: 99, border: '1px solid var(--border)',
                background: filterStage === s.id ? 'var(--gold-glow)' : 'transparent',
                color: filterStage === s.id ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              {s.icon} {s.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Kanban board */}
      {apps.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No applications yet"
          description="Save jobs from the Job Feed, or add applications manually to start tracking."
          action={<Button onClick={openNew}>Add First Application</Button>}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${filterStage === 'all' ? STAGES.length : 1}, minmax(180px, 1fr))`,
          gap: 14,
          overflowX: 'auto',
        }}>
          {(filterStage === 'all' ? STAGES : STAGES.filter(s => s.id === filterStage)).map(stage => {
            const stageApps = (filterStage === 'all' ? apps : filtered).filter(a => a.stage === stage.id)
            return (
              <div key={stage.id}>
                {/* Column header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', marginBottom: 10,
                  background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}>
                  <span>{stage.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: stage.color, flex: 1 }}>{stage.label}</span>
                  <span style={{
                    fontSize: 11, padding: '1px 7px', borderRadius: 99,
                    background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                  }}>{stageApps.length}</span>
                </div>

                {/* Cards */}
                {stageApps.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-dim)', fontSize: 12 }}>
                    No applications
                  </div>
                ) : (
                  stageApps.map(app => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onMove={handleMove}
                    />
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AppModal
          app={editApp}
          onSave={handleSave}
          onClose={closeModal}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
