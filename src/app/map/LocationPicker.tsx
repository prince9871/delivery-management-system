"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

interface Location {
  lat: number;
  lng: number;
}

const LocationPicker: React.FC = () => {
  const [location, setLocation] = useState<Location>({ lat: 20, lng: 78 });
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const provider = new OpenStreetMapProvider();
      const searchControl =  GeoSearchControl({
        provider: provider,
        style: "bar",
        showMarker: false,
        retainZoomLevel: false,
        autoClose: true,
        keepResult: true,
      });

      const mapContainer = document.querySelector<HTMLDivElement>(".leaflet-container");
      const map = mapContainer && (mapContainer as any)._leaflet_map;

      if (map) {
        map.addControl(searchControl);
        map.on("geosearch/showlocation", (result: any) => {
          const { lat, lng } = result.location;
          setLocation({ lat, lng });
          setMarkerPosition([lat, lng]);
        });
      }

      return () => {
        if (map && map.removeControl) {
          map.removeControl(searchControl);
        }
      };
    }
  }, []);

  const MapClickHandler: React.FC = () => {
    useMapEvents({
      click(e: { latlng: { lat: number; lng: number } }) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setMarkerPosition([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve your location");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Search or Click to Select Location</h1>
        <button 
          onClick={handleCurrentLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Use Current Location
        </button>
        <p className="text-gray-700">
          Selected Location: Latitude: {location.lat.toFixed(4)}, Longitude: {location.lng.toFixed(4)}
        </p>
        <div className="h-[500px] w-full">
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {markerPosition && (
              <Marker position={markerPosition}>
                <Popup>
                  Selected Location <br />
                  Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                </Popup>
              </Marker>
            )}
            <MapClickHandler />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;