/**
 * CareerOS GCC — Auth Store
 * Pure JS state management. No Redux, no Zustand.
 * Password is hashed using Web Crypto API before storage.
 */

import db from '../services/db/indexedDB.js'

const SESSION_KEY = 'careeros_session'

let _state = { user: null, loading: true }
const _listeners = new Set()

function notify() { _listeners.forEach(fn => fn({ ..._state })) }

// Simple hash using Web Crypto (built into every browser — free)
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'careeros_salt_gcc')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const authStore = {
  subscribe(fn) {
    _listeners.add(fn)
    fn({ ..._state })
    return () => _listeners.delete(fn)
  },

  getState() { return { ..._state } },

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

  async register({ password, ...data }) {
    // Check email not already used
    const all = await db.getAll('users')
    if (all.find(u => u.email === data.email)) {
      throw new Error('An account with this email already exists.')
    }

    const id = crypto.randomUUID()
    const passwordHash = await hashPassword(password)
    const user = {
      id,
      ...data,
      passwordHash,
      createdAt: new Date().toISOString(),
      profileComplete: 30,
      careerMode: 'exploring',
      onboardingStep: 1,
    }
    await db.put('users', user)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: id }))
    // Store session (don't expose passwordHash in state)
    const { passwordHash: _, ...safeUser } = user
    _state = { user: safeUser, loading: false }
    notify()
    return safeUser
  },

  async login(email, password) {
    const all = await db.getAll('users')
    const user = all.find(u => u.email === email)
    if (!user) throw new Error('No account found with that email.')

    const hash = await hashPassword(password)
    if (hash !== user.passwordHash) throw new Error('Incorrect password.')

    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }))
    const { passwordHash: _, ...safeUser } = user
    _state = { user: safeUser, loading: false }
    notify()
    return safeUser
  },

  async updateUser(updates) {
    if (!_state.user) return
    // Re-fetch from DB to get passwordHash before saving
    const existing = await db.get('users', _state.user.id)
    const updated = { ...existing, ...updates }
    await db.put('users', updated)
    const { passwordHash: _, ...safeUser } = updated
    _state = { ..._state, user: safeUser }
    notify()
    return safeUser
  },

  logout() {
    localStorage.removeItem(SESSION_KEY)
    _state = { user: null, loading: false }
    notify()
  },

  // Hard delete — wipes account and all data
  async deleteAccount() {
    if (!_state.user) return
    await db.delete('users', _state.user.id)
    // Clear all related data
    await db.clear('applications')
    await db.clear('companies')
    await db.clear('contacts')
    await db.clear('cv_data')
    await db.clear('mood_log')
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem('careeros_access')
    _state = { user: null, loading: false }
    notify()
  },
}

export default authStore
