import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Trash, Loader2, Search, X } from 'lucide-react';

// Import BoundariesMap component (Leaflet-based)
import BoundariesMap from './BoundariesMap';

// CitySearch Component (unchanged)
const CitySearch = ({ onCitySelect, formData, setFormData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  
  // Handle input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Using OpenStreetMap Nominatim API for geocoding
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en-US,en' } }
        );
        
        const cities = response.data
          .filter(place => place.type === 'city' || place.type === 'administrative')
          .map(place => ({
            id: place.place_id,
            name: place.display_name.split(',')[0],
            fullName: place.display_name,
            lat: parseFloat(place.lat),
            lon: parseFloat(place.lon)
          }));
          
        setSearchResults(cities);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching cities:', error);
      } finally {
        setLoading(false);
      }
    }, 500);
  };
  
  // Handle city selection
  const handleCitySelect = (city) => {
    setFormData(prev => ({
      ...prev,
      name: city.name,
      location: {
        type: 'Point',
        coordinates: [city.lon, city.lat]
      }
    }));
    
    setSearchTerm(city.name);
    setShowResults(false);
    
    if (onCitySelect) {
      onCitySelect(city);
    }
  };
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="space-y-2 relative">
      <Label htmlFor="citySearch">Search City</Label>
      <div className="relative">
        <Input
          id="citySearch"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Type to search cities..."
          className="pr-10"
          onClick={(e) => {
            e.stopPropagation();
            if (searchResults.length > 0) {
              setShowResults(true);
            }
          }}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
          {searchTerm && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setSearchResults([]);
              }}
              className="p-1 hover:bg-muted rounded-full mr-1"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full bg-background border rounded-md shadow-md max-h-60 overflow-y-auto">
          {searchResults.map((city) => (
            <div
              key={city.id}
              className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
              onClick={(e) => {
                e.stopPropagation();
                handleCitySelect(city);
              }}
            >
              <div className="font-medium">{city.name}</div>
              <div className="text-xs text-muted-foreground truncate">{city.fullName}</div>
            </div>
          ))}
        </div>
      )}
      
      {showResults && searchTerm.trim().length >= 2 && searchResults.length === 0 && !loading && (
        <div className="absolute z-10 w-full bg-background border rounded-md shadow-md p-2 text-sm text-muted-foreground">
          No cities found. Try a different search term.
        </div>
      )}
    </div>
  );
};

// Main CityCreate Component
function CityCreate({ onSuccess }) {
    const [formData, setFormData] = useState({
      name: '',
      location: {
        type: 'Point',
        coordinates: [0, 0] // [longitude, latitude]
      },
      boundaries: null,
      isActive: true
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('details');
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    const handleLocationChange = (e) => {
      const { name, value } = e.target;
      const floatValue = parseFloat(value) || 0;
      
      let index = -1;
      if (name === 'longitude') index = 0;
      if (name === 'latitude') index = 1;
      
      if (index !== -1) {
        setFormData(prev => {
          const newCoordinates = [...prev.location.coordinates];
          newCoordinates[index] = floatValue;
          return {
            ...prev,
            location: {
              ...prev.location,
              coordinates: newCoordinates
            }
          };
        });
      }
    };
  
    const handleSelectChange = (name, value) => {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'true'
      }));
    };
  
    // Handle city selection from search
    const handleCitySelect = (cityData) => {
      // The city name and coordinates are already updated in the CitySearch component
      // Just switch to the boundaries tab
      setActiveTab('boundaries');
    };
  
    // Handle boundaries change from map
    const handleBoundariesChange = (boundariesData) => {
      setFormData(prev => ({
        ...prev,
        boundaries: boundariesData
      }));
    };
  
    // Clear boundaries
    const handleClearBoundaries = () => {
      setFormData(prev => ({
        ...prev,
        boundaries: null
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Validate required fields
      if (!formData.name.trim()) {
        setError('City name is required');
        setLoading(false);
        setActiveTab('details');
        return;
      }
      
      // Format request data
      const requestData = {
        name: formData.name,
        location: formData.location,
        isActive: formData.isActive
      };
      
      // Only include boundaries if defined
      if (formData.boundaries) {
        requestData.boundaries = formData.boundaries;
      }
      
      try {
        const response = await axios.post('https://airshare.co.in/admin/city', requestData);
        
        if (response.data) {
          setSuccess('City created successfully!');
          
          // Reset form
          setFormData({
            name: '',
            location: {
              type: 'Point',
              coordinates: [0, 0]
            },
            boundaries: null,
            isActive: true
          });
          
          // Call the success callback after a short delay to show success message
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 1500);
        } else {
          throw new Error('Failed to create city');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
  
    const hasBoundaries = formData.boundaries && 
                          formData.boundaries.coordinates && 
                          formData.boundaries.coordinates[0] && 
                          formData.boundaries.coordinates[0].length > 0;
  
    return (
      <div>
        <DialogHeader>
          <DialogTitle>Add New City</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new city to the system.
          </DialogDescription>
        </DialogHeader>
  
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="py-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">City Details</TabsTrigger>
            <TabsTrigger value="boundaries">City Boundaries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* City Search Component */}
            <CitySearch 
              onCitySelect={handleCitySelect} 
              formData={formData} 
              setFormData={setFormData} 
            />
            
            <div className="space-y-2">
              <Label htmlFor="name">City Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter city name"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.0001"
                  value={formData.location.coordinates[0]}
                  onChange={handleLocationChange}
                  placeholder="Enter longitude (e.g., 72.5714)"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.0001"
                  value={formData.location.coordinates[1]}
                  onChange={handleLocationChange}
                  placeholder="Enter latitude (e.g., 23.0225)"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.isActive.toString()} 
                onValueChange={(value) => handleSelectChange('isActive', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end">
              <Button type="button" onClick={() => setActiveTab('boundaries')}>
                Next: Define Boundaries
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="boundaries" className="space-y-4 mt-4">
            <div className="bg-muted/50 p-3 rounded-md">
              <h3 className="text-sm font-medium mb-1">Instructions:</h3>
              <p className="text-sm text-muted-foreground">
                Use the drawing tools on the top right side of the map to create the city boundaries. 
                Click to add points and close the shape to define the area.
              </p>
            </div>
            
            {/* Using our new Leaflet-based map component */}
            <BoundariesMap 
              initialCenter={formData.location.coordinates} 
              boundaries={formData.boundaries}
              onBoundariesChange={handleBoundariesChange}
            />
            
            <div className="flex items-center gap-2">
              <div className="flex-1">
                {hasBoundaries ? (
                  <Alert className="py-2">
                    <AlertDescription className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-green-600" />
                      {formData.boundaries.coordinates[0].length - 1} boundary points defined
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="py-2">
                    <AlertDescription className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-amber-600" />
                      No boundaries defined yet
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleClearBoundaries}
                disabled={!hasBoundaries}
              >
                <Trash className="w-4 h-4 mr-1" /> Clear
              </Button>
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                Back to Details
              </Button>
              
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create City'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
  
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm mt-4">
            {error}
          </div>
        )}
  
        {success && (
          <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm mt-4">
            {success}
          </div>
        )}
      </div>
    );
  }

  export default CityCreate;