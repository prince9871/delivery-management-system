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

interface MapProps {
  onLocationSelected: (lat: number, lng: number) => void
  steps: Step[]
}

// Define the component as a named function expression
const Map = ({ onLocationSelected, steps }: MapProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const [map, setMap] = useState<L.Map | null>(null)
// Inside your component:

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (map) {
      map.invalidateSize()
    }
  }, [map])

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
      iconUrl: 'leaflet/images/marker-icon.png',
      shadowUrl: 'leaflet/images/marker-shadow.png',
    })
  }, [])

  function LocationMarker({ onLocationSelected }: { onLocationSelected: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null)

    const whenReady = (map: { target: L.Map }) => {
      setMap(map.target);
    };
    
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

  if (!isMounted) {
    return null
  }

  return (
    <MapContainer 
        // center={[20.5937, 78.9629]}
        // zoom={5} 
        style={{ height: '100%', width: '100%' }}
        // whenCreated={setMap}
        center={[0, 0]}  
        zoom={13} 
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

// Export the component
export default Map