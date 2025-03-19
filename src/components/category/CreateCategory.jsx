import { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function CreateCategory({ onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://3n8qx2vb-8055.inc1.devtunnels.ms/admin/category`, 
        { name }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(true);
      setName('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <DialogHeader>
        <DialogTitle>Create New Category</DialogTitle>
        <DialogDescription>
          Add a new category for your products.
        </DialogDescription>
      </DialogHeader>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>Category created successfully!</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter category name"
            required
          />
        </div>
        
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Category'}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
}

export default CreateCategory;