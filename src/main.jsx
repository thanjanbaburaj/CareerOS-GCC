import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'
import db from './services/db/indexedDB.js'

/* ── Extension import bridge ──────────────────────────────────
   When the browser extension saves a job, it writes to
   localStorage('careeros_pending_jobs'). We import those into
   IndexedDB here on every page load, then clear the key.
   Also handles chrome.storage pending jobs via URL param.
────────────────────────────────────────────────────────────── */
async function importPendingJobs() {
  try {
    // From extension via localStorage
    const raw = localStorage.getItem('careeros_pending_jobs')
    if (raw) {
      const jobs = JSON.parse(raw)
      if (Array.isArray(jobs) && jobs.length > 0) {
        for (const job of jobs) {
          if (job.id && job.title) {
            await db.put('applications', job)
          }
        }
        localStorage.removeItem('careeros_pending_jobs')
        console.log(`CareerOS: imported ${jobs.length} job(s) from extension`)
      }
    }
  } catch (e) {
    console.warn('CareerOS: import error', e)
  }
}

// Run import on load
importPendingJobs()

// Listen for real-time extension events
window.addEventListener('careeros_import', async function (e) {
  try {
    const job = e.detail
    if (job?.id && job?.title) {
      await db.put('applications', job)
      console.log('CareerOS: imported job from extension event:', job.title)
    }
  } catch {}
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/careeros-gcc">
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
