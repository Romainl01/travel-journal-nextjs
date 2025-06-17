"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, MapPin, Calendar, Edit3, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import TravelMap from "./components/TravelMap"
import { calculateTotalDistance } from "./utils/distance"
import LocationAutocomplete from "@/components/LocationAutocomplete"
import JournalList from '@/components/JournalList'
import { getLocations, getJournalEntries, createLocation, createJournalEntry, updateJournalEntry, deleteJournalEntry, deleteLocation } from "@/lib/database"

interface TravelStop {
  id: string
  date: string
  location: string
  coordinates: { lat: number; lng: number }
  description: string
}

export default function TravelJournal() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [stops, setStops] = useState<TravelStop[]>([])
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newStop, setNewStop] = useState({
    date: "",
    location: "",
    coordinates: null as null | { lat: number; lng: number },
    description: "",
  })
  const [errors, setErrors] = useState({
    date: false,
    location: false,
    description: false,
    coordinates: false,
  })
  const [stopToDelete, setStopToDelete] = useState<TravelStop | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setIsAuthenticated(false)
      router.push('/auth')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      async function fetchData() {
        setLoading(true)
        try {
          const locations = await getLocations()
          const entries = await getJournalEntries()
          // Only include locations that are referenced by a journal entry
          const stopsData = entries.map(entry => {
            const loc = locations.find(l => l.id === entry.location_id)
            return loc ? {
              id: loc.id,
              date: loc.created_at,
              location: loc.name,
              coordinates: { lat: loc.latitude, lng: loc.longitude },
              description: entry.content
            } : null
          }).filter((x): x is TravelStop => x !== null)
          setStops(stopsData)
          setJournalEntries(entries)
        } catch (e) {
          console.error(e)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [isAuthenticated])

  if (isAuthenticated === null) {
    // Show a loading spinner or nothing while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Optionally, you can return null here since router.push will redirect
    return null
  }

  const handleAddStop = async () => {
    const newErrors = {
      date: !newStop.date,
      location: !newStop.location,
      description: !newStop.description,
      coordinates: !newStop.coordinates,
    }
    setErrors(newErrors as any)

    if (newStop.date && newStop.location && newStop.description && newStop.coordinates) {
      let isMounted = true;
      try {
        console.log('Creating location...')
        const location = await createLocation(newStop.location, newStop.coordinates.lat, newStop.coordinates.lng)
        console.log('Location created:', location)
        console.log('Creating journal entry...')
        const entry = await createJournalEntry(
          newStop.location, // title
          newStop.description, // content
          location.id // locationId
        )
        console.log('Journal entry created:', entry)
        console.log('Fetching locations...')
        const locations = await getLocations()
        if (isMounted) setStops(locations.map(loc => ({
          id: loc.id,
          date: loc.created_at,
          location: loc.name,
          coordinates: { lat: loc.latitude, lng: loc.longitude },
          description: loc.name // Adjust if you have a description field
        })))
        console.log('Fetching journal entries...')
        const entries = await getJournalEntries()
        if (isMounted) setJournalEntries(entries)
        if (isMounted) setNewStop({ date: "", location: "", coordinates: null, description: "" })
        if (isMounted) setShowForm(false)
      } catch (e) {
        if (e && typeof e === 'object' && 'message' in e) {
          // @ts-ignore
          console.error('Error:', e.message)
        } else {
          // Ignore empty object errors
          if (JSON.stringify(e) !== '{}') {
            console.error('Unknown error:', e)
          }
        }
        return
      }
      if (isMounted) setErrors({ date: false, location: false, description: false, coordinates: false })
      return () => { isMounted = false }
    }
  }

  const handleDeleteStop = (stop: TravelStop) => {
    setStopToDelete(stop)
  }

  const confirmDelete = async () => {
    if (stopToDelete) {
      try {
        // Find the corresponding journal entry
        const journalEntry = journalEntries.find(entry => entry.location_id === stopToDelete.id)
        console.log('stopToDelete.id:', stopToDelete.id)
        if (journalEntry) {
          console.log('journalEntry.location_id:', journalEntry.location_id)
          // Delete journal entry in Supabase using the correct ID
          await deleteJournalEntry(journalEntry.id)

          // Check if any other journal entry uses this location
          const otherEntries = journalEntries.filter(entry => entry.location_id === stopToDelete.id && entry.id !== journalEntry.id)
          console.log('otherEntries.length:', otherEntries.length)
          if (otherEntries.length === 0) {
            // No other journal entry uses this location, so delete the location
            console.log('Calling deleteLocation with id:', stopToDelete.id)
            await deleteLocation(stopToDelete.id)
          }

          // Refresh data
          const locations = await getLocations()
          const refreshedEntries = await getJournalEntries()
          const stopsData = refreshedEntries.map(entry => {
            const loc = locations.find(l => l.id === entry.location_id)
            return loc ? {
              id: loc.id,
              date: loc.created_at,
              location: loc.name,
              coordinates: { lat: loc.latitude, lng: loc.longitude },
              description: entry.content
            } : null
          }).filter((x): x is TravelStop => x !== null)
          setStops(stopsData)
          setJournalEntries(refreshedEntries)
        }
        setStopToDelete(null)
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Journey</h1>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-black hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stop
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Journal Entries */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Your Journey</h2>
              <span className="text-sm text-gray-500">{stops.length} stops</span>
            </div>

            {/* Add Stop Form */}
            {showForm && (
              <Card className="p-6 border border-gray-200 rounded-xl">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Edit3 className="w-4 h-4 text-gray-600" />
                    <h3 className="font-medium text-gray-900">New Stop</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={newStop.date}
                        onChange={(e) => {
                          setNewStop({ ...newStop, date: e.target.value })
                          setErrors({ ...errors, date: false })
                        }}
                        className={`mt-1 ${errors.date ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      {errors.date && (
                        <p className="mt-1 text-sm text-red-500">Please select a date</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                        Location
                      </Label>
                      <LocationAutocomplete
                        value={newStop.location}
                        onChange={({ name, lat, lon }) => {
                          setNewStop({ ...newStop, location: name, coordinates: { lat, lng: lon } })
                          setErrors({ ...errors, location: false })
                        }}
                        placeholder="City, Country"
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-500">Please enter a location</p>
                      )}
                      {errors.coordinates && (
                        <p className="mt-1 text-sm text-red-500">Please select a valid location from the list</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="What made this stop special?"
                      value={newStop.description}
                      onChange={(e) => {
                        setNewStop({ ...newStop, description: e.target.value })
                        setErrors({ ...errors, description: false })
                      }}
                      className={`mt-1 resize-none ${errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      rows={3}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">Please enter a description</p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <Button onClick={handleAddStop} className="bg-black hover:bg-gray-800 text-white">
                      Add Stop
                    </Button>
                    <Button variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Journey Timeline */}
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-4">
                {stops.map((stop, index) => (
                  <Card
                    key={stop.id}
                    className="p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors relative group"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleDeleteStop(stop)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </Button>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{stop.location}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(stop.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{stop.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!stopToDelete} onOpenChange={() => setStopToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Stop</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the stop in {stopToDelete?.location}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Right Panel - Map */}
          <div className="lg:sticky lg:top-8">
            <Card className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-900">Route Map</h3>
                <p className="text-sm text-gray-500 mt-1">Your journey visualized</p>
              </div>
              <div className="aspect-square bg-gray-50">
                <TravelMap stops={stops} />
              </div>
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Distance</span>
                  <span className="font-medium text-gray-900">{calculateTotalDistance(stops)} km</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
