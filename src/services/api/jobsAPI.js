/**
 * CareerOS GCC — Job API Service
 * Fetches from free job APIs. Standalone module.
 * Each source is independent — failure of one doesn't break others.
 *
 * Sources:
 *   - Adzuna API (free tier)
 *   - RemoteOK (no auth, open API)
 *   - HN Who's Hiring (Firebase API, free)
 *
 * Note: API keys are user-provided via Settings.
 *       Stored in localStorage (not IndexedDB — small strings).
 */

const CACHE_KEY     = 'careeros_jobs_cache'
const CACHE_TTL_MS  = 6 * 60 * 60 * 1000   // 6 hours

function getKeys() {
  try {
    return JSON.parse(localStorage.getItem('careeros_api_keys') || '{}')
  } catch { return {} }
}

function getCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return data
  } catch { return null }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

// ── Deduplication ────────────────────────────────────
function deduplicateJobs(jobs) {
  const seen = new Set()
  return jobs.filter(job => {
    const key = `${job.title?.toLowerCase().trim()}|${job.company?.toLowerCase().trim()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ── Scam detection ──────────────────────────────────
const SCAM_SIGNALS = [
  'pay to apply', 'training fee', 'upfront payment',
  'send passport', 'wire transfer', 'whatsapp only',
  'no experience needed earn', 'work from home earn',
  'guaranteed income', 'earn $5000 weekly'
]

function scamScore(job) {
  const text = `${job.title} ${job.description}`.toLowerCase()
  const hits  = SCAM_SIGNALS.filter(s => text.includes(s))
  return hits.length
}

// ── Source: RemoteOK ────────────────────────────────
async function fetchRemoteOK(query = '') {
  try {
    const res  = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'CareerOS-GCC/1.0' }
    })
    if (!res.ok) return []
    const data = await res.json()
    return data
      .slice(1)
      .filter(j => j.position)
      .map(j => ({
        id:          `remoteok_${j.id}`,
        title:       j.position || '',
        company:     j.company  || 'Unknown',
        location:    j.location || 'Remote',
        description: (j.description || '').replace(/<[^>]+>/g, ' ').slice(0, 500),
        url:         j.url || j.apply_url || '',
        salary:      j.salary || '',
        posted:      j.date   || '',
        source:      'RemoteOK',
        tags:        j.tags   || [],
        scamScore:   0,
      }))
      .filter(j =>
        !query ||
        j.title.toLowerCase().includes(query.toLowerCase()) ||
        (j.tags || []).some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
  } catch (e) {
    console.warn('RemoteOK fetch failed:', e.message)
    return []
  }
}

// ── Source: Adzuna ──────────────────────────────────
async function fetchAdzuna(query, location, country = 'ae') {
  const keys = getKeys()
  if (!keys.adzunaId || !keys.adzunaKey) return []
  try {
    const params = new URLSearchParams({
      app_id:          keys.adzunaId,
      app_key:         keys.adzunaKey,
      what:            query || 'manager director',
      where:           location || 'dubai',
      results_per_page: 20,
      sort_by:         'date',
      max_days_old:    2,
    })
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`
    const res  = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return (data.results || []).map(j => ({
      id:          `adzuna_${j.id}`,
      title:       j.title || '',
      company:     j.company?.display_name || 'Unknown',
      location:    j.location?.display_name || location || '',
      description: (j.description || '').slice(0, 500),
      url:         j.redirect_url || '',
      salary:      j.salary_min ? `${j.salary_min}–${j.salary_max || ''}` : '',
      posted:      j.created || '',
      source:      `Adzuna (${country.toUpperCase()})`,
      tags:        j.category ? [j.category.label] : [],
      scamScore:   scamScore(j),
    }))
  } catch (e) {
    console.warn('Adzuna fetch failed:', e.message)
    return []
  }
}

// ── Source: HN Who's Hiring ─────────────────────────
async function fetchHNHiring() {
  try {
    const userRes = await fetch(
      'https://hacker-news.firebaseio.com/v0/user/whoishiring/submitted.json'
    )
    if (!userRes.ok) return []
    const ids = await userRes.json()

    for (const id of ids.slice(0, 3)) {
      const postRes  = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      if (!postRes.ok) continue
      const post = await postRes.json()
      if (!post?.title?.toLowerCase().includes('hiring')) continue

      const kids = (post.kids || []).slice(0, 30)
      const jobs = await Promise.all(kids.map(async kid => {
        try {
          const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${kid}.json`)
          const j = await r.json()
          if (!j || j.deleted || j.dead) return null
          const text   = (j.text || '').replace(/<[^>]+>/g, ' ')
          const first  = text.split('|')[0]?.trim().slice(0, 60) || 'Tech Company'
          return {
            id:          `hn_${kid}`,
            title:       'Senior / Technical Role',
            company:     first,
            location:    'Remote / Global',
            description: text.slice(0, 500),
            url:         `https://news.ycombinator.com/item?id=${kid}`,
            salary:      '',
            posted:      '',
            source:      'HN Who\'s Hiring',
            tags:        ['tech', 'remote'],
            scamScore:   0,
          }
        } catch { return null }
      }))
      return jobs.filter(Boolean)
    }
    return []
  } catch (e) {
    console.warn('HN Hiring fetch failed:', e.message)
    return []
  }
}

// ── Keyword CV matching ─────────────────────────────
function matchScore(job, keywords = []) {
  if (!keywords.length) return 0
  const text = `${job.title} ${job.description} ${(job.tags||[]).join(' ')}`.toLowerCase()
  return keywords.filter(k => k && text.includes(k.toLowerCase())).length
}

// ── Main fetch orchestrator ─────────────────────────
export async function fetchJobs({ query, location, keywords, forceRefresh } = {}) {
  if (!forceRefresh) {
    const cached = getCache()
    if (cached) return cached
  }

  const [remoteOK, adzunaAE, adzunaGB, hn] = await Promise.allSettled([
    fetchRemoteOK(query),
    fetchAdzuna(query, location, 'ae'),
    fetchAdzuna(query, location, 'gb'),
    fetchHNHiring(),
  ])

  const all = [
    ...(remoteOK.status === 'fulfilled' ? remoteOK.value : []),
    ...(adzunaAE.status === 'fulfilled' ? adzunaAE.value : []),
    ...(adzunaGB.status === 'fulfilled' ? adzunaGB.value : []),
    ...(hn.status       === 'fulfilled' ? hn.value       : []),
  ]

  const deduped = deduplicateJobs(all)
    .map(j => ({ ...j, matchScore: matchScore(j, keywords) }))
    .filter(j => j.scamScore < 2)
    .sort((a, b) => b.matchScore - a.matchScore || 0)

  setCache(deduped)
  return deduped
}

export { matchScore, scamScore }
