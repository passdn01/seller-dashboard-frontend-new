import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, ChevronUp, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Badge } from "@/components/ui/badge";

import CreateOffer from './CreateOffers';
import OfferToggle from './OfferToggle';
import UpdateOffer from './UpdateOffers';
import OfferInTable from './OfferInTable';

function AllUserOffers() {
  const [offers, setOffers] = useState([]);
  const [allOffers, setAllOffers] = useState([]); // Store all offers for extracting unique types
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOfferId, setExpandedOfferId] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Fetch all offers on initial load to extract unique types
  useEffect(() => {
    const fetchAllOffers = async () => {
      try {
        const response = await axios.get('https://vayu-backend-1.onrender.com/offers?limit=1000');
        if (response.data.data && Array.isArray(response.data.data)) {
          setAllOffers(response.data.data);
          
          // Extract unique offer types
          const types = [...new Set(response.data.data.map(offer => offer.type))];
          setUniqueTypes(types);
        }
      } catch (error) {
        console.error('Error fetching all offers:', error);
      }
    };
    
    fetchAllOffers();
  }, []);

  useEffect(() => {
    fetchOffers(pagination.page);
  }, [pagination.page, selectedType]);

  const fetchOffers = async (page = 1) => {
    setLoading(true);
    try {
      // Build URL with query parameters
      let url = `https://vayu-backend-1.onrender.com/offers?page=${page}&limit=${pagination.limit}`;
      
      // Add type filter if selected
      if (selectedType) {
        url += `&type=${selectedType}`;
      }
      
      const response = await axios.get(url);
      console.log('Fetched offers:', response.data);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        setOffers(response.data.data);
        
        // Update pagination state from backend response
        if (response.data.pagination) {
          setPagination({
            total: response.data.pagination.total || 0,
            page: response.data.pagination.page || 1,
            limit: response.data.pagination.limit || 10,
            pages: response.data.pagination.pages || 0
          });
        }
      } else {
        throw new Error('Failed to fetch offers: Invalid response format');
      }
      setLoading(false);
    } catch (error) {
      setError(error.message || 'An error occurred while fetching offers');
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    // Set selectedType to null when "all" is selected
    setSelectedType(type === "all" ? null : type);
    
    // Reset to page 1 when filter changes
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };
  

  const handleToggleStatusClick = (offerId, e) => {
    e.stopPropagation();
    setSelectedOfferId(offerId);
    setShowStatusDialog(true);
  };

  const handleStatusToggleComplete = (updatedOffer) => {
    setOffers(offers.map(offer => 
      offer._id === updatedOffer._id ? updatedOffer : offer
    ));
    setShowStatusDialog(false);
  };

  const toggleExpandOffer = (offerId) => {
    if (expandedOfferId === offerId) {
      setExpandedOfferId(null);
    } else {
      setExpandedOfferId(offerId);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status, isActive, startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    
    if (end < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (start > now) {
      return <Badge variant="warning">Scheduled</Badge>;
    }
    
    return <Badge variant="success">Active</Badge>;
  };

  // Get expanded offer data
  const getExpandedOfferData = () => {
    return offers.find(offer => offer._id === expandedOfferId);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  // Define columns for Tanstack React Table
  const columns = useMemo(() => [
    {
      accessorKey: 'offerId',
      header: 'Offer ID',
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="font-medium ">{row.original._id}</span>
          {expandedOfferId === row.original._id ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => <span className="font-medium">{row.original.cityName}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'dates',
      header: 'Duration',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">From: {formatDate(row.original.startDate)}</span>
          <span className="text-xs text-gray-500">To: {formatDate(row.original.endDate)}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(
        row.original.status, 
        row.original.isActive,
        row.original.startDate,
        row.original.endDate
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <UpdateOffer offerId={row.original._id} onSuccess={() => fetchOffers(pagination.page)} />
            </DialogContent>
          </Dialog>
          <Button 
            variant={row.original.isActive ? "destructive" : "outline"} 
            size="sm"
            onClick={(e) => handleToggleStatusClick(row.original._id, e)}
          >
            {row.original.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ], [expandedOfferId, pagination.page]);

  // Initialize Tanstack Table without internal pagination
  const table = useReactTable({
    data: offers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // We're handling pagination manually with the backend
  });

  if (loading && offers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && offers.length === 0) {
    return (
      <Card className="mx-auto my-8 max-w-4xl">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-700">Error</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p>{error}</p>
          <Button onClick={() => fetchOffers(pagination.page)} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const expandedOffer = getExpandedOfferData();

  // Calculate start and end item numbers for display
  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <Card className="mx-4 my-4">
      <CardHeader>
        <CardTitle>Offers</CardTitle>
        <CardDescription>Manage promotional offers for your service</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => fetchOffers(pagination.page)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-green-500"></div>
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </>
              )}
            </Button>
            
            {/* Type Filter Select */}
            <div className="flex items-center">
            <Select value={selectedType || "all"} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[200px]">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              
            {selectedType && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleTypeChange("all")}
                className="ml-2 text-blue-500"
              >
                Clear
              </Button>
            )}
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                Add New Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <CreateOffer onSuccess={() => fetchOffers(1)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {offers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-6">
                    {loading ? "Loading offers..." : "No offers found"}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map(row => (
                  <>
                    <TableRow 
                      key={row.id} 
                      className={`cursor-pointer hover:bg-gray-50 ${expandedOfferId === row.original._id ? 'bg-gray-100' : ''}`}
                      onClick={() => toggleExpandOffer(row.original._id)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandedOfferId === row.original._id && expandedOffer && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="p-0 border-t-0">
                          <OfferInTable offer={expandedOffer} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {offers.length > 0 ? startItem : 0} to {endItem} of {pagination.total} offers
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1 || loading}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
              >
                Previous
              </Button>
              <span className="mx-2">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || loading}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.pages)}
                disabled={pagination.page === pagination.pages || loading}
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Status Toggle Dialog */}
      {showStatusDialog && selectedOfferId && (
        <OfferToggle 
          offerId={selectedOfferId} 
          isOpen={showStatusDialog} 
          onClose={() => setShowStatusDialog(false)}
          onToggleComplete={(updatedOffer) => {
            handleStatusToggleComplete(updatedOffer);
            fetchOffers(pagination.page);
          }}
        />
      )}
    </Card>
  );
}

export default AllUserOffers;