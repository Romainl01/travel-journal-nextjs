'use client'

import { useEffect, useState } from 'react'
import { JournalEntry, getJournalEntries } from '@/lib/database'

export default function JournalList() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('DEBUG: JournalList useEffect running!')
    async function loadEntries() {
      console.log('DEBUG: About to call getJournalEntries')
      try {
        const data = await getJournalEntries()
        console.log('Fetched journal entries:', data)
        setEntries(data)
      } catch (err) {
        console.error('Error fetching journal entries:', err)
        setError(err instanceof Error ? err.message : 'Failed to load entries')
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <div style={{color: 'red', fontWeight: 'bold'}}>DEBUG: JournalList is rendering</div>
      <div style={{color: 'blue'}}>DEBUG: entries = {JSON.stringify(entries)}</div>
      {error && <div style={{color: 'orange'}}>DEBUG: error = {error}</div>}
      {entries.map((entry) => (
        <div key={entry.id} className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">{entry.title}</h2>
          <p className="text-gray-600">{entry.location?.name}</p>
          <p className="mt-2">{entry.content}</p>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(entry.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )
} 