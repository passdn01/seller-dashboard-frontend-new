import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Trash, Loader2, Info } from 'lucide-react';

// Import BoundariesMap component
import BoundariesMap from './BoundariesMap';

function CityUpdate({ cityId, onSuccess, onClose }) {
  const [cityData, setCityData] = useState({
    name: '',
    location: {
      type: 'Point',
      coordinates: [0, 0] // [longitude, latitude]
    },
    boundaries: null,
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch city data when component mounts
  useEffect(() => {
    fetchCityData();
  }, [cityId]);

  const fetchCityData = async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get(`https://airshare.co.in/admin/city/${cityId}`);

      if (response.data) {
        // Set city data from fetched city
        setCityData({
          name: response.data.name || '',
          location: response.data.location || {
            type: 'Point',
            coordinates: [0, 0]
          },
          boundaries: response.data.boundaries || null,
          isActive: response.data.isActive !== undefined ? response.data.isActive : true
        });
      } else {
        throw new Error('Failed to fetch city data');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching city data');
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle boundaries change from map
  const handleBoundariesChange = (boundariesData) => {
    setCityData(prev => ({
      ...prev,
      boundaries: boundariesData
    }));
  };

  // Clear boundaries
  const handleClearBoundaries = () => {
    setCityData(prev => ({
      ...prev,
      boundaries: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Format request data - only sending boundaries update
    const requestData = {
      boundaries: cityData.boundaries
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`https://airshare.co.in/admin/city/${cityId}`, requestData, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data) {
        setSuccess('City boundaries updated successfully!');

        // Call the success callback after a short delay to show success message
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1500);
      } else {
        throw new Error('Failed to update city boundaries');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred while updating the city boundaries');
    } finally {
      setLoading(false);
    }
  };

  const hasBoundaries = cityData.boundaries &&
    cityData.boundaries.coordinates &&
    cityData.boundaries.coordinates[0] &&
    cityData.boundaries.coordinates[0].length > 0;

  // Format coordinates as a readable string
  const formatCoordinates = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return 'N/A';
    }
    return `${coordinates[1].toFixed(4)}° N, ${coordinates[0].toFixed(4)}° E`;
  };

  if (fetchLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading city data...</span>
      </div>
    );
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Update City Boundaries</DialogTitle>
        <DialogDescription>
          Update the boundaries for {cityData.name}
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-6">
        {/* City Information Card */}
        <div className="bg-muted/30 p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-2">{cityData.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Location: </span>
              <span>{formatCoordinates(cityData.location.coordinates)}</span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Status: </span>
              <span>{cityData.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <h3 className="text-sm font-medium mb-1">Instructions:</h3>
          <p className="text-sm text-muted-foreground">
            Use the drawing tools on the top right side of the map to update the city boundaries.
            You can edit existing boundaries or create new ones if none exist.
          </p>
        </div>

        {/* Using the Leaflet-based map component */}
        <BoundariesMap
          initialCenter={cityData.location.coordinates}
          boundaries={cityData.boundaries}
          onBoundariesChange={handleBoundariesChange}
        />

        <div className="flex items-center gap-2">
          <div className="flex-1">
            {hasBoundaries ? (
              <Alert className="py-2">
                <AlertDescription className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-green-600" />
                  {cityData.boundaries.coordinates[0].length - 1} boundary points defined
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

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Boundaries'
            )}
          </Button>
        </div>
      </div>

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

export default CityUpdate;