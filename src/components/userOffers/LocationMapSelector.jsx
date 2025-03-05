import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Fix Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const CityMapSelector = ({ 
  initialLat = "", 
  initialLng = "", 
  onChange,
  radius = 300
}) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const polygonRef = useRef(null);
  
  const [position, setPosition] = useState({
    lat: initialLat ? parseFloat(initialLat) : 22.994877,
    lng: initialLng ? parseFloat(initialLng) : 72.567367
  });
  
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch cities from the API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('https://vayu-backend-1.onrender.com/admin/city');
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        const data = await response.json();
        setCities(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const defaultPosition = {
        lat: initialLat ? parseFloat(initialLat) : 22.994877,
        lng: initialLng ? parseFloat(initialLng) : 72.567367
      };
      
      // Create map
      mapRef.current = L.map(mapContainerRef.current).setView(
        [defaultPosition.lat, defaultPosition.lng], 
        13
      );
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
      
      // Add marker if initial coordinates are provided
      if (initialLat && initialLng) {
        markerRef.current = L.marker([defaultPosition.lat, defaultPosition.lng], {
          draggable: true
        }).addTo(mapRef.current);
        
        // Add circle to represent radius
        circleRef.current = L.circle([defaultPosition.lat, defaultPosition.lng], {
          radius: radius,
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          color: '#3b82f6',
          weight: 1
        }).addTo(mapRef.current);
        
        // Update position when marker is dragged
        markerRef.current.on('dragend', (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          updatePosition(position.lat, position.lng);
        });
      }
      
      // Add click event to map for placing marker
      mapRef.current.on('click', (e) => {
        updatePosition(e.latlng.lat, e.latlng.lng);
      });
    }
    
    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker and circle position when the radius changes
  useEffect(() => {
    if (mapRef.current && circleRef.current) {
      circleRef.current.setRadius(radius);
    }
  }, [radius]);

  // Update when initial coordinates change
  useEffect(() => {
    if (initialLat && initialLng && mapRef.current) {
      const newLat = parseFloat(initialLat);
      const newLng = parseFloat(initialLng);
      
      if (newLat !== position.lat || newLng !== position.lng) {
        updatePosition(newLat, newLng);
      }
    }
  }, [initialLat, initialLng]);

  // Function to update position and trigger onChange
  const updatePosition = (lat, lng) => {
    setPosition({ lat, lng });
    
    // Update marker position
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], {
        draggable: true
      }).addTo(mapRef.current);
      
      // Add drag event listener
      markerRef.current.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        updatePosition(position.lat, position.lng);
      });
    }
    
    // Update circle position
    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
    } else {
      circleRef.current = L.circle([lat, lng], {
        radius: radius,
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        color: '#3b82f6',
        weight: 1
      }).addTo(mapRef.current);
    }
    
    // Call the onChange callback with updated coordinates
    if (onChange) {
      onChange({
        lat: lat.toFixed(6),
        lng: lng.toFixed(6)
      });
    }
  };

  // Function to get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updatePosition(latitude, longitude);
          mapRef.current.setView([latitude, longitude], 15);
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert("Unable to retrieve your location. Please allow location access or select manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  // Handle city selection
  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
    
    // Find the selected city
    const city = cities.find(c => c._id === cityId);
    
    if (city && city.location && city.location.coordinates) {
      // Navigate to city coordinates
      const [lng, lat] = city.location.coordinates;
      
      // Update marker position and view
      updatePosition(lat, lng);
      mapRef.current.setView([lat, lng], 13);
      
      // Draw city boundaries if available
      if (city.boundaries && city.boundaries.coordinates && city.boundaries.coordinates[0]) {
        // Remove previous polygon if it exists
        if (polygonRef.current) {
          mapRef.current.removeLayer(polygonRef.current);
        }
        
        // Convert coordinates from [lng, lat] to [lat, lng] format for Leaflet
        const convertedCoordinates = city.boundaries.coordinates[0].map(coord => [coord[1], coord[0]]);
        
        // Create new polygon
        polygonRef.current = L.polygon(convertedCoordinates, {
          color: '#10b981',
          weight: 2,
          fillColor: '#10b981',
          fillOpacity: 0.1
        }).addTo(mapRef.current);
        
        // Fit map to polygon bounds
        mapRef.current.fitBounds(polygonRef.current.getBounds());
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
        <div className="w-full sm:w-64">
          <Select 
            value={selectedCity} 
            onValueChange={handleCityChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map(city => (
                <SelectItem key={city._id} value={city._id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={getCurrentLocation}
          className="text-sm"
        >
          Use My Current Location
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Click on map to place marker or drag marker to adjust position
        </div>
      </div>
      
      <div 
        ref={mapContainerRef} 
        className="h-[400px] w-full rounded-md border"
      ></div>
      
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <p className="text-sm font-medium mb-1">Selected Latitude</p>
          <p className="text-sm">{position.lat.toFixed(6)}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Selected Longitude</p>
          <p className="text-sm">{position.lng.toFixed(6)}</p>
        </div>
      </div>
    </div>
  );
};

export default CityMapSelector;