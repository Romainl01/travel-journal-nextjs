"use client"

import dynamic from 'next/dynamic'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Icon } from 'leaflet'

interface TravelStop {
  id: string
  date: string
  location: string
  coordinates: { lat: number; lng: number }
  description: string
}

interface TravelMapProps {
  stops: TravelStop[]
}

interface MapComponentProps {
  stops: TravelStop[]
  customIcon: Icon
}

// Dynamically import the map with no SSR
const MapWithNoSSR = dynamic<MapComponentProps>(
  () => import('@/app/components/MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
  }
)

// Fix for default marker icons in Leaflet with Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function TravelMap({ stops }: TravelMapProps) {
  return (
    <div className="h-full w-full">
      <MapWithNoSSR stops={stops} customIcon={customIcon} />
    </div>
  )
} 