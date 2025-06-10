"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useEffect, useMemo, useState } from 'react'

interface TravelStop {
  id: string
  date: string
  location: string
  coordinates: { lat: number; lng: number }
  description: string
}

interface MapComponentProps {
  stops: TravelStop[]
}

export default function MapComponent({ stops }: MapComponentProps) {
  // Dynamically import leaflet and leaflet.css only on client for the icon
  const [L, setL] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const leaflet = await import('leaflet');
      if (typeof window !== 'undefined') {
        require('leaflet/dist/leaflet.css');
      }
      setL(leaflet);
    })();
  }, []);

  const customIcon = useMemo(() => {
    if (!L) return undefined;
    return new L.Icon({
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }, [L]);

  if (!L || !customIcon) {
    return <div className="h-full w-full flex items-center justify-center"><p className="text-gray-500">Loading map...</p></div>;
  }

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