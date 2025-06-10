"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { Icon } from 'leaflet'

interface TravelStop {
  id: string
  date: string
  location: string
  coordinates: { lat: number; lng: number }
  description: string
}

interface MapComponentProps {
  stops: TravelStop[]
  customIcon: Icon
}

export default function MapComponent({ stops, customIcon }: MapComponentProps) {
  // Get coordinates for the polyline
  const routeCoordinates = stops.map(stop => [stop.coordinates.lat, stop.coordinates.lng])

  // Center map on first stop or default to Paris
  const center = stops.length > 0 
    ? [stops[0].coordinates.lat, stops[0].coordinates.lng]
    : [48.8566, 2.3522]

  return (
    <MapContainer
      center={center as [number, number]}
      zoom={4}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Draw route line */}
      <Polyline
        positions={routeCoordinates as [number, number][]}
        color="#000000"
        weight={3}
      />

      {/* Add markers for each stop */}
      {stops.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.coordinates.lat, stop.coordinates.lng]}
          icon={customIcon}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-medium">{stop.location}</h3>
              <p className="text-sm text-gray-600">{new Date(stop.date).toLocaleDateString()}</p>
              <p className="text-sm mt-1">{stop.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
} 