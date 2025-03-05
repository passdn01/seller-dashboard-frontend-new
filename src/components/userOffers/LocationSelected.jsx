import React, { useEffect, useRef } from 'react';
import { MapPin, Info } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationSelected = ({ location }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    // Clean up function to destroy map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Initialize or update map when location changes
  useEffect(() => {
    if (!location || !location.coordinate || !location.coordinate.lat || !location.coordinate.long) {
      return;
    }

    const lat = parseFloat(location.coordinate.lat);
    const lng = parseFloat(location.coordinate.long);
    const radius = location.radius || 300;

    if (isNaN(lat) || isNaN(lng)) {
      return;
    }

    // If map doesn't exist, create it
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], 15);
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    } else if (mapRef.current) {
      // If map exists, update the view
      mapRef.current.setView([lat, lng], 15);
    }

    // If map exists
    if (mapRef.current) {
      // Add or update marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      }

      // Add or update circle
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lng]);
        circleRef.current.setRadius(radius);
      } else {
        circleRef.current = L.circle([lat, lng], {
          radius: radius,
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          color: '#3b82f6',
          weight: 1
        }).addTo(mapRef.current);
      }
    }
  }, [location]);

  if (!location || !location.coordinate) {
    return (
      <div className="p-6 flex items-center justify-center text-amber-600 bg-amber-50 rounded-lg">
        <Info className="w-5 h-5 mr-2" />
        <p>No location coordinates specified for this offer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">Latitude</p>
              <p className="font-mono text-sm text-blue-800 bg-blue-50 p-2 rounded border border-blue-100">
                {location.coordinate.lat}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">Longitude</p>
              <p className="font-mono text-sm text-blue-800 bg-blue-50 p-2 rounded border border-blue-100">
                {location.coordinate.long}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">Radius</p>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="font-mono text-sm text-green-800 bg-green-50 p-2 rounded border border-green-100">
                  {location.radius || 'Not specified'} meters
                </p>
              </div>
              <div className="ml-2 relative flex items-center justify-center w-12 h-12">
                <div className="absolute w-12 h-12 rounded-full bg-green-100 opacity-20 animate-ping"></div>
                <div className="absolute w-8 h-8 rounded-full bg-green-200 opacity-40"></div>
                <div className="absolute w-4 h-4 rounded-full bg-green-500"></div>
                <div className="absolute w-1 h-1 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-[300px] rounded-lg overflow-hidden border">
          <div 
            ref={mapContainerRef} 
            className="w-full h-full"
          >
            {(!location.coordinate.lat || !location.coordinate.long) && (
              <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400">
                <MapPin className="w-6 h-6 mr-2" />
                <span>No valid coordinates to display</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelected;