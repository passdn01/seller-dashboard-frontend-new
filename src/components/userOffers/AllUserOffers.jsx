import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
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
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Badge } from "@/components/ui/badge";

import CreateOffer from './CreateOffers';
import OfferToggle from './OfferToggle';
import UpdateOffer from './UpdateOffers';
import OfferInTable from './OfferInTable'; // Import the new component

function AllUserOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOfferId, setExpandedOfferId] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://3n8qx2vb-8055.inc1.devtunnels.ms/offers');
      console.log(response.data)
      if (response.data.data && Array.isArray(response.data.data)) {
        setOffers(response.data.data);
      } else {
        throw new Error('Failed to fetch offers: Invalid response format');
      }
      setLoading(false);
    } catch (error) {
      setError(error.message || 'An error occurred while fetching offers');
      setLoading(false);
    }
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

  // Define columns for Tanstack React Table
  const columns = useMemo(() => [
    {
      accessorKey: 'offerId',
      header: 'Offer ID',
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="font-medium truncate max-w-[100px]">{row.original._id}</span>
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
              <UpdateOffer offerId={row.original._id} onSuccess={fetchOffers} />
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
  ], [expandedOfferId]);

  // Initialize Tanstack Table
  const table = useReactTable({
    data: offers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto my-8 max-w-4xl">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-700">Error</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p>{error}</p>
          <Button onClick={fetchOffers} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const expandedOffer = getExpandedOfferData();

  return (
    <Card className="mx-4 my-4">
      <CardHeader>
        <CardTitle>Offers</CardTitle>
        <CardDescription>Manage promotional offers for your service</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={fetchOffers}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                Add New Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <CreateOffer onSuccess={fetchOffers} />
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
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-6">No offers found</TableCell>
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
                          {/* Use the new OfferInTable component here */}
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
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, offers.length)} of {offers.length} offers
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Status Toggle Dialog */}
      {showStatusDialog && selectedOfferId && (
        <OfferToggle 
          offerId={selectedOfferId} 
          isOpen={showStatusDialog} 
          onClose={() => setShowStatusDialog(false)}
          onToggleComplete={handleStatusToggleComplete}
        />
      )}
    </Card>
  );
}

export default AllUserOffers;