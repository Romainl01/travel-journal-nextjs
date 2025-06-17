import { supabase } from './supabase'

// Types
export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  created_at: string
}

export interface JournalEntry {
  id: string
  title: string
  content: string
  location_id: string
  created_at: string
  updated_at: string
  location?: Location
}

// Location functions
export async function getLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Location[]
}

export async function createLocation(name: string, latitude: number, longitude: number) {
  const { data, error } = await supabase
    .from('locations')
    .insert([{ name, latitude, longitude }])
    .select()
    .single()
  
  if (error) throw error
  return data as Location
}

// Journal Entry functions
export async function getJournalEntries() {
  const { data, error } = await supabase
    .from('journal_entries')
    .select(`
      *,
      location:locations(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as JournalEntry[]
}

export async function createJournalEntry(title: string, content: string, locationId: string) {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([{ title, content, location_id: locationId }])
    .select(`
      *,
      location:locations(*)
    `)
    .single()
  
  if (error) throw error
  return data as JournalEntry
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>) {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      location:locations(*)
    `)
    .single()
  
  if (error) throw error
  return data as JournalEntry
}

export async function deleteJournalEntry(id: string) {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
  
  if (error) throw error
} 