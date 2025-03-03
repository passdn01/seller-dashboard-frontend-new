import React, { useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  FeatureGroup,
  Polygon,
  useMap
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for Leaflet markers not displaying correctly
// This needs to run before any Leaflet code
function fixLeafletMarkers() {
  // Check if window is defined (for SSR)
  if (typeof window !== 'undefined') {
    // Make sure these images are properly imported in your project
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
}

// Helper component to set view when center coordinates change
const SetViewOnChange = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.length === 2 && (center[0] !== 0 || center[1] !== 0)) {
      map.setView([center[1], center[0]], map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

const BoundariesMap = ({ initialCenter, boundaries, onBoundariesChange }) => {
  const mapRef = useRef(null);
  const featureGroupRef = useRef(null);
  
  // Fix Leaflet marker issue on component mount
  useEffect(() => {
    fixLeafletMarkers();
  }, []);
  
  // Handle created geojson
  const handleCreate = (e) => {
    const layer = e.layer;
    
    if (layer instanceof L.Polygon) {
      const latlngs = layer.getLatLngs()[0];
      
      // Convert leaflet LatLngs to GeoJSON coordinates [lng, lat]
      const coordinates = latlngs.map(latlng => [latlng.lng, latlng.lat]);
      
      // Close the polygon by repeating the first point
      coordinates.push([...coordinates[0]]);
      
      const boundariesData = {
        type: 'Polygon',
        coordinates: [coordinates]
      };
      
      onBoundariesChange(boundariesData);
    }
  };
  
  // Handle edited geojson
  const handleEdit = (e) => {
    const layers = e.layers;
    layers.eachLayer(layer => {
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0];
        
        // Convert leaflet LatLngs to GeoJSON coordinates [lng, lat]
        const coordinates = latlngs.map(latlng => [latlng.lng, latlng.lat]);
        
        // Close the polygon by repeating the first point
        coordinates.push([...coordinates[0]]);
        
        const boundariesData = {
          type: 'Polygon',
          coordinates: [coordinates]
        };
        
        onBoundariesChange(boundariesData);
      }
    });
  };
  
  // Handle deleted geojson
  const handleDelete = () => {
    onBoundariesChange(null);
  };
  
  // Get center coordinates
  const center = initialCenter && initialCenter.length === 2 && (initialCenter[0] !== 0 || initialCenter[1] !== 0)
    ? [initialCenter[1], initialCenter[0]] // [lat, lng] for Leaflet
    : [51.505, -0.09]; // Default center (London)
  
  // Convert GeoJSON coordinates to Leaflet LatLngs if boundaries exist
  const polygonPositions = boundaries && 
                          boundaries.coordinates && 
                          boundaries.coordinates[0] && 
                          boundaries.coordinates[0].length > 0
    ? boundaries.coordinates[0].map(coord => [coord[1], coord[0]]) // Convert [lng, lat] to [lat, lng]
    : [];
  
  return (
    <div className="w-full h-96 border rounded-md overflow-hidden">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Update center when coordinates change */}
        <SetViewOnChange center={initialCenter} />
        
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreate}
            onEdited={handleEdit}
            onDeleted={handleDelete}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false
            }}
          />
          
          {/* Render existing polygon if boundaries exist */}
          {polygonPositions.length > 0 && (
            <Polygon positions={polygonPositions} />
          )}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default BoundariesMap;