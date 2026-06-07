import { useState, useEffect, useCallback } from 'react'
import db from '../services/db/indexedDB.js'

export function useDB(store) {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const result = await db.getAll(store)
      setData(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [store])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (record) => {
    const toSave = record.id ? record : { ...record, id: crypto.randomUUID() }
    await db.put(store, toSave)
    await load()
    return toSave
  }, [store, load])

  const remove = useCallback(async (id) => {
    await db.delete(store, id)
    await load()
  }, [store, load])

  return { data, loading, error, save, remove, reload: load }
}
