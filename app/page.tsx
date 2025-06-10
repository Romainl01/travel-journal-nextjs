"use client"

import { useState } from "react"
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

interface TravelStop {
  id: string
  date: string
  location: string
  coordinates: { lat: number; lng: number }
  description: string
}

export default function TravelJournal() {
  const [stops, setStops] = useState<TravelStop[]>([
    {
      id: "1",
      date: "2024-01-15",
      location: "Paris, France",
      coordinates: { lat: 48.8566, lng: 2.3522 },
      description: "Started the journey at the Eiffel Tower. The city of lights never disappoints.",
    },
    {
      id: "2",
      date: "2024-01-18",
      location: "Rome, Italy",
      coordinates: { lat: 41.9028, lng: 12.4964 },
      description: "Explored the Colosseum and Vatican City. Ancient history comes alive here.",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [newStop, setNewStop] = useState({
    date: "",
    location: "",
    description: "",
  })
  const [errors, setErrors] = useState({
    date: false,
    location: false,
    description: false,
  })
  const [stopToDelete, setStopToDelete] = useState<TravelStop | null>(null)

  const handleAddStop = () => {
    const newErrors = {
      date: !newStop.date,
      location: !newStop.location,
      description: !newStop.description,
    }
    setErrors(newErrors)

    if (newStop.date && newStop.location && newStop.description) {
      // In a real app, you'd geocode the location to get coordinates
      const mockCoordinates = {
        lat: 40.7128 + Math.random() * 10,
        lng: -74.006 + Math.random() * 10,
      }

      const stop: TravelStop = {
        id: Date.now().toString(),
        date: newStop.date,
        location: newStop.location,
        coordinates: mockCoordinates,
        description: newStop.description,
      }

      setStops([...stops, stop])
      setNewStop({ date: "", location: "", description: "" })
      setShowForm(false)
      setErrors({ date: false, location: false, description: false })
    }
  }

  const handleDeleteStop = (stop: TravelStop) => {
    setStopToDelete(stop)
  }

  const confirmDelete = () => {
    if (stopToDelete) {
      setStops(stops.filter(stop => stop.id !== stopToDelete.id))
      setStopToDelete(null)
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
                      <Input
                        id="location"
                        placeholder="City, Country"
                        value={newStop.location}
                        onChange={(e) => {
                          setNewStop({ ...newStop, location: e.target.value })
                          setErrors({ ...errors, location: false })
                        }}
                        className={`mt-1 ${errors.location ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-500">Please enter a location</p>
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
