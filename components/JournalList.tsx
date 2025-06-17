'use client'

import { useEffect, useState } from 'react'
import { JournalEntry, getJournalEntries, deleteJournalEntry } from '@/lib/database'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function JournalList() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadEntries = async () => {
    setLoading(true)
    try {
      const data = await getJournalEntries()
      console.log('Loaded entries:', data)
      setEntries(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching journal entries:', err)
      setError(err instanceof Error ? err.message : 'Failed to load entries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  const handleDelete = (entry: JournalEntry) => {
    console.log('Setting entry to delete:', entry)
    setEntryToDelete(entry)
  }

  const confirmDelete = async () => {
    if (!entryToDelete) return

    setIsDeleting(true)
    try {
      console.log('Attempting to delete entry:', entryToDelete)
      await deleteJournalEntry(entryToDelete.id)
      
      // Remove the deleted entry from the state
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryToDelete.id))
      setEntryToDelete(null)
      setError(null)
    } catch (err) {
      console.error('Error in confirmDelete:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete entry')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <div style={{color: 'red', fontWeight: 'bold'}}>DEBUG: JournalList is rendering</div>
      <div style={{color: 'blue'}}>DEBUG: entries = {JSON.stringify(entries)}</div>
      {error && <div style={{color: 'orange'}}>DEBUG: error = {error}</div>}
      {entries.map((entry) => (
        <div key={entry.id} className="p-4 border rounded-lg shadow-sm relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => handleDelete(entry)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
          </Button>
          <h2 className="text-xl font-semibold">{entry.title}</h2>
          <p className="text-gray-600">{entry.location?.name}</p>
          <p className="mt-2">{entry.content}</p>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(entry.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}

      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 