/**
 * useDatabase — React hook for reactive access to RadonDatabase.
 * Re-renders the component when the watched collection changes.
 */

import { useState, useEffect, useCallback } from 'react'
import db, { type CollectionKey } from './RadonDatabase'

/**
 * Subscribe to a collection and get its current data.
 * The component re-renders whenever the collection is modified.
 */
export function useCollection<T>(key: CollectionKey): T[] {
  const [data, setData] = useState<T[]>(() => db.getAll<T>(key))

  useEffect(() => {
    const unsub = db.subscribe((collection) => {
      if (collection === key) {
        setData(db.getAll<T>(key))
      }
    })
    return unsub
  }, [key])

  return data
}

/**
 * Subscribe to a single item by ID.
 * Returns the item and a function to update it.
 */
export function useDocument<T extends { id: string }>(
  key: CollectionKey,
  id: string | null
): { item: T | undefined; update: (patch: Partial<T>) => void; remove: () => void } {
  const [item, setItem] = useState<T | undefined>(() =>
    id ? db.getById<T>(key, id) : undefined
  )

  useEffect(() => {
    if (!id) { setItem(undefined); return }
    setItem(db.getById<T>(key, id))
    const unsub = db.subscribe((collection, changedId) => {
      if (collection === key && (!changedId || changedId === id)) {
        setItem(db.getById<T>(key, id!))
      }
    })
    return unsub
  }, [key, id])

  const update = useCallback((patch: Partial<T>) => {
    if (id) db.update(key, id, patch)
  }, [key, id])

  const remove = useCallback(() => {
    if (id) db.remove(key, id)
  }, [key, id])

  return { item, update, remove }
}

/**
 * Get aggregated stats across all modules.
 * Re-renders when any collection changes.
 */
export function useAggregatedStats() {
  const [stats, setStats] = useState(() => db.getAggregatedStats())

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setStats(db.getAggregatedStats())
    })
    return unsub
  }, [])

  return stats
}

export { db }
export default db
