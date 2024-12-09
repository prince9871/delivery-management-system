import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface Step {
  location: {
    latitude: number
    longitude: number
  }
  timestamp: string
}

interface MapContentProps {
  onLocationSelected: (lat: number, lng: number) => void
  steps: Step[]
}

function LocationMarker({ onLocationSelected }: { onLocationSelected: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationSelected(e.latlng.lat, e.latlng.lng)
    },
  })

  return position === null ? null : (
    <Marker position={position} />
  )
}

export default function MapContent({ onLocationSelected, steps }: MapContentProps) {
  const [map, setMap] = useState<L.Map | null>(null)

  // Ensure map re-renders properly when container changes
  useEffect(() => {
    if (map) {
      map.invalidateSize()
    }
  }, [map])

  // Fix Leaflet default icon issues
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
      iconUrl: 'leaflet/images/marker-icon.png',
      shadowUrl: 'leaflet/images/marker-shadow.png',
    })
  }, [])

  return (
    <MapContainer 
      center={[20.5937, 78.9629]} // Center of India
      zoom={5} 
      style={{ height: '100%', width: '100%' }}
      ref={setMap}
    >
      <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
      />
      <LocationMarker onLocationSelected={onLocationSelected} />
      {steps.map((step, index) => (
        <Marker 
          key={index} 
          position={[step.location.latitude, step.location.longitude]} 
        />
      ))}
    </MapContainer>
  )
}