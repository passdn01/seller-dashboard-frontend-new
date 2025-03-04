import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, MapPin } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function CityToggle({ cityId, isOpen, onClose, onToggleComplete }) {
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && cityId) {
      fetchCityDetails();
    }
  }, [isOpen, cityId]);

  const fetchCityDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://3n8qx2vb-8055.inc1.devtunnels.ms/admin/city/${cityId}`);
      
      if (response.data) {
        setCity(response.data);
      } else {
        throw new Error('Failed to fetch city details');
      }
    } catch (error) {
      setError(error.message || 'An error occurred while fetching city details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setToggling(true);
      const response = await axios.put(
        `https://3n8qx2vb-8055.inc1.devtunnels.ms/admin/city/toggleCityStatus/${cityId}`
      );
      
      if (response.data) {
        // Call the success callback with the updated city
        if (onToggleComplete) {
          onToggleComplete(response.data);
        }
      } else {
        throw new Error('Failed to toggle city status');
      }
    } catch (error) {
      setError(error.message || 'An error occurred while updating city status');
      setToggling(false);
    }
  };

  // Format coordinates as a readable string
  const formatCoordinates = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return 'N/A';
    }
    return `${coordinates[1].toFixed(4)}° N, ${coordinates[0].toFixed(4)}° E`;
  };

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {loading ? 'Loading...' : (city?.isActive ? 'Deactivate City' : 'Activate City')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {loading ? (
              'Fetching city details...'
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : (
              <>
                <div className="space-y-4">
                  <p>
                    Are you sure you want to {city?.isActive ? 'deactivate' : 'activate'} <span className="font-semibold">{city?.name}</span>?
                    {city?.isActive 
                      ? ' This will make the city unavailable for new services.' 
                      : ' This will make the city available for services.'}
                  </p>
                  
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    <h4 className="font-medium mb-2">City Details</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">ID:</p>
                        <p className="truncate">{city?._id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status:</p>
                        <p className={city?.isActive ? 'text-green-600' : 'text-red-600'}>
                          {city?.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Location:</p>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-red-500" />
                          <p>{formatCoordinates(city?.location?.coordinates)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading || toggling}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleToggleStatus();
            }}
            disabled={loading || toggling}
            className={city?.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
          >
            {toggling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              city?.isActive ? 'Yes, Deactivate' : 'Yes, Activate'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CityToggle;