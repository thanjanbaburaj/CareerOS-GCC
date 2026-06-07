/**
 * CareerOS GCC — Auth Store
 * Pure JS state management. No Redux, no Zustand.
 * Uses browser localStorage for session persistence.
 * IndexedDB for full profile data.
 */

import db from '../services/db/indexedDB.js'

const SESSION_KEY = 'careeros_session'

// ── Internal state ──────────────────────────────────
let _state = {
  user:    null,
  loading: true,
}
const _listeners = new Set()

function notify() {
  _listeners.forEach(fn => fn({ ..._state }))
}

// ── Public API ──────────────────────────────────────
export const authStore = {
  subscribe(fn) {
    _listeners.add(fn)
    fn({ ..._state })                    // immediate snapshot
    return () => _listeners.delete(fn)   // unsubscribe
  },

  getState() {
    return { ..._state }
  },

  async init() {
    try {
      const session = localStorage.getItem(SESSION_KEY)
      if (session) {
        const { userId } = JSON.parse(session)
        const user = await db.get('users', userId)
        _state = { user: user || null, loading: false }
      } else {
        _state = { user: null, loading: false }
      }
    } catch {
      _state = { user: null, loading: false }
    }
    notify()
  },

  async register(data) {
    const id   = crypto.randomUUID()
    const user = {
      id,
      ...data,
      createdAt:        new Date().toISOString(),
      profileComplete:  30,
      careerMode:       'exploring',
      onboardingStep:   1,
    }
    await db.put('users', user)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: id }))
    _state = { user, loading: false }
    notify()
    return user
  },

  async login(email) {
    // Demo: find user by email in local DB
    const all  = await db.getAll('users')
    const user = all.find(u => u.email === email)
    if (!user) throw new Error('No account found with that email.')
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }))
    _state = { user, loading: false }
    notify()
    return user
  },

  async updateUser(updates) {
    if (!_state.user) return
    const updated = { ..._state.user, ...updates }
    await db.put('users', updated)
    _state = { ..._state, user: updated }
    notify()
    return updated
  },

  logout() {
    localStorage.removeItem(SESSION_KEY)
    _state = { user: null, loading: false }
    notify()
  },
}

export default authStore
