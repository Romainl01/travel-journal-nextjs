declare module 'leaflet' {
  export * from 'leaflet';
  export class Icon {
    constructor(options: any)
  }
  export class LatLng {
    constructor(lat: number, lng: number)
  }
  export class LatLngBounds {
    constructor(southWest: LatLng, northEast: LatLng)
  }
  export class Map {
    constructor(element: string | HTMLElement, options?: any)
  }
}

declare module 'react-leaflet' {
  import { ComponentType } from 'react'
  
  export const MapContainer: ComponentType<any>
  export const TileLayer: ComponentType<any>
  export const Marker: ComponentType<any>
  export const Popup: ComponentType<any>
  export const Polyline: ComponentType<any>
} 