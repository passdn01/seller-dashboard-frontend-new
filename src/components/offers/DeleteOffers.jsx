import { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

function DeleteOffer({ offerId, isOpen, onClose, onDeleteComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!offerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/offers/${offerId}`);
      if (response.data.success) {
        onDeleteComplete(offerId);
      } else {
        throw new Error(response.data.message || 'Failed to delete offer');
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Are you sure you want to delete this offer? This action cannot be undone.
          {error && <div className="mt-2 text-red-500">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteOffer;