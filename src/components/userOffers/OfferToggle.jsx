import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from 'axios';

const OfferToggle = ({ offerId, isOpen, onClose, onToggleComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    if (isOpen && offerId) {
      fetchOffer();
    }
  }, [isOpen, offerId]);

  const fetchOffer = async () => {
    try {
      const response = await axios.get(`https://vayu-backend-1.onrender.com/offers/${offerId}`);
      setOffer(response.data.data);
    } catch (err) {
      setError('Failed to fetch offer details');
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.patch(`https://vayu-backend-1.onrender.com/offers/${offerId}`);
      onToggleComplete(response.data.data);
      onClose();
    } catch (err) {
      setError('Failed to update offer status');
    } finally {
      setLoading(false);
    }
  };

  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Offer Status</DialogTitle>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="py-4">
            <div className="mb-4">
              <h3 className="font-medium">{offer.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Current status: {offer.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>

            <Alert>
              <AlertDescription>
                Do you want to {offer.isActive ? 'deactivate' : 'activate'} this offer?
              </AlertDescription>
            </Alert>

            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant={offer.isActive ? "destructive" : "default"}
                onClick={handleToggleStatus}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  offer.isActive ? 'Deactivate' : 'Activate'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OfferToggle;