import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Workaround for marker icon issues with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function BoundariesDisplayMap({ center, boundaries }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const boundaryLayerRef = useRef(null);
  const markerLayerRef = useRef(null);

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current && mapRef.current) {
      // Make sure we have valid coordinates (swap for Leaflet which uses [lat, lng])
      const validCenter = Array.isArray(center) && center.length === 2
        ? [center[1], center[0]]  // Convert from [lng, lat] to [lat, lng]
        : [0, 0];
      
      mapInstanceRef.current = L.map(mapRef.current, {
        center: validCenter,
        zoom: 13,
        scrollWheelZoom: true
      });
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }
    
    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  // Update map when center changes
  useEffect(() => {
    if (mapInstanceRef.current && center && Array.isArray(center) && center.length === 2) {
      // Convert from [lng, lat] to [lat, lng]
      mapInstanceRef.current.setView([center[1], center[0]], 13);
      
      // Clear existing marker
      if (markerLayerRef.current) {
        mapInstanceRef.current.removeLayer(markerLayerRef.current);
      }
      
      // Add marker at center
      markerLayerRef.current = L.marker([center[1], center[0]]).addTo(mapInstanceRef.current);
      markerLayerRef.current.bindPopup(`<strong>City Center</strong><br>Lat: ${center[1].toFixed(6)}, Lng: ${center[0].toFixed(6)}`);
    }
  }, [center]);
  
  // Update boundaries when they change
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Clear existing boundary
      if (boundaryLayerRef.current) {
        mapInstanceRef.current.removeLayer(boundaryLayerRef.current);
        boundaryLayerRef.current = null;
      }
      
      // Add new boundary if available
      if (boundaries && 
          boundaries.type === 'Polygon' && 
          boundaries.coordinates && 
          boundaries.coordinates[0] && 
          boundaries.coordinates[0].length > 0) {
        
        // Convert GeoJSON coordinates to Leaflet format
        const latLngs = boundaries.coordinates[0].map(coord => {
          return [coord[1], coord[0]]; // Convert [lng, lat] to [lat, lng]
        });
        
        // Create polygon
        boundaryLayerRef.current = L.polygon(latLngs, {
          color: '#3B82F6',
          weight: 3,
          opacity: 0.7,
          fillColor: '#93C5FD',
          fillOpacity: 0.3
        }).addTo(mapInstanceRef.current);
        
        // Fit bounds to show the entire boundary
        mapInstanceRef.current.fitBounds(boundaryLayerRef.current.getBounds(), {
          padding: [50, 50],
          maxZoom: 16
        });
      }
    }
  }, [boundaries]);
  
  return (
    <div ref={mapRef} className="h-full w-full rounded-md" />
  );
}

export default BoundariesDisplayMap;