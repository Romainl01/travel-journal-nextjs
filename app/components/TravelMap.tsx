"use client"

import dynamic from 'next/dynamic'

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

// Dynamically import the map with no SSR
const MapWithNoSSR = dynamic(
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

export default function TravelMap({ stops }: TravelMapProps) {
  return (
    <div className="h-full w-full">
      <MapWithNoSSR stops={stops} />
    </div>
  )
} 