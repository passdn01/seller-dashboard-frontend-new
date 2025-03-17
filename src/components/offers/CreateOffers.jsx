import { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

function CreateOffer({ onSuccess }) {
  const [formData, setFormData] = useState({
    offerName: '',
    offerDescription: '',
    startDate: '',
    endDate: '',
    offerCriteria: {
      type: 'rides',
      requiredCount: 1
    },
    terms: '',
    reward: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('offerCriteria')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        offerCriteria: {
          ...prev.offerCriteria,
          [field]: field === 'requiredCount' || field === 'thresholdTime' ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'reward' ? Number(value) : value
      }));
    }
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      offerCriteria: {
        ...prev.offerCriteria,
        type: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/offers`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSuccess();
        // Reset form or close dialog
        document.querySelector('[data-dialog-close]').click();
      } else {
        throw new Error(response.data.message || 'Failed to create offer');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-xl font-semibold">Create New Offer</DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto py-4 -mr-2">
        <div className="grid gap-6 pb-2">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Basic Information</h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="offerName">Offer Name</Label>
                <Input
                  id="offerName"
                  name="offerName"
                  placeholder="Enter offer name"
                  value={formData.offerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="offerDescription">Description</Label>
                <Textarea
                  id="offerDescription"
                  name="offerDescription"
                  placeholder="Describe your offer"
                  value={formData.offerDescription}
                  onChange={handleChange}
                  className="h-20 resize-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Offer Criteria Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Offer Criteria</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="offerCriteria.type">Offer Type</Label>
                <Select
                  value={formData.offerCriteria.type}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger id="offerCriteria.type">
                    <SelectValue placeholder="Select offer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rides">Rides</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="refer">Refer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="offerCriteria.requiredCount">Required Count</Label>
                <Input
                  id="offerCriteria.requiredCount"
                  name="offerCriteria.requiredCount"
                  type="number"
                  min="1"
                  value={formData.offerCriteria.requiredCount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {formData.offerCriteria.type === 'online' && (
              <div className="space-y-1.5">
                <Label htmlFor="offerCriteria.thresholdTime">Threshold Time (ms)</Label>
                <Input
                  id="offerCriteria.thresholdTime"
                  name="offerCriteria.thresholdTime"
                  type="number"
                  min="1"
                  placeholder="Enter time in milliseconds"
                  value={formData.offerCriteria.thresholdTime || ''}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum time users should spend online</p>
              </div>
            )}
          </div>

          {/* Reward Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Reward & Terms</h3>

            <div className="space-y-1.5">
              <Label htmlFor="reward">Reward Amount (₹)</Label>
              <Input
                id="reward"
                name="reward"
                type="number"
                min="0"
                placeholder="Enter reward amount"
                value={formData.reward}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                name="terms"
                placeholder="Enter terms and conditions"
                value={formData.terms}
                onChange={handleChange}
                className="h-24 resize-none"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="pt-4 border-t mt-4">
        <Button type="submit" disabled={loading} className="px-8">
          {loading ? 'Creating...' : 'Create Offer'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default CreateOffer;