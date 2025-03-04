import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, ChevronUp, Calendar, Info } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import CreateOffer from './CreateOffers';
import OfferToggle from './OfferToggle';
import UpdateOffer from './UpdateOffers';

function AllUserOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOfferId, setExpandedOfferId] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [expandedTab, setExpandedTab] = useState('details');

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
      setExpandedTab('details'); // Reset to details tab when expanding a new offer
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
                          <div className="bg-gray-50 p-6">
                            <Tabs value={expandedTab} onValueChange={setExpandedTab}>
                              <TabsList className="mb-4">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="location">Location Info</TabsTrigger>
                                <TabsTrigger value="json">JSON Data</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="details" className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <dl className="space-y-2">
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Title</dt>
                                          <dd>{expandedOffer.title}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Subtitle</dt>
                                          <dd>{expandedOffer.subtitle}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Type</dt>
                                          <dd>
                                            <Badge variant="outline" className="font-mono text-xs">
                                              {expandedOffer.type}
                                            </Badge>
                                          </dd>
                                        </div>
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                                          <dd>
                                            {getStatusBadge(
                                              expandedOffer.status,
                                              expandedOffer.isActive,
                                              expandedOffer.startDate,
                                              expandedOffer.endDate
                                            )}
                                          </dd>
                                        </div>
                                      </dl>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium">Offer Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <dl className="space-y-2">
                                        {expandedOffer.minCoin && (
                                          <div>
                                            <dt className="text-sm font-medium text-gray-500">Min Coin</dt>
                                            <dd>{expandedOffer.minCoin}</dd>
                                          </div>
                                        )}
                                        {expandedOffer.maxCoin && (
                                          <div>
                                            <dt className="text-sm font-medium text-gray-500">Max Coin</dt>
                                            <dd>{expandedOffer.maxCoin}</dd>
                                          </div>
                                        )}
                                        {expandedOffer.percentage && (
                                          <div>
                                            <dt className="text-sm font-medium text-gray-500">Percentage</dt>
                                            <dd>{expandedOffer.percentage}%</dd>
                                          </div>
                                        )}
                                        {expandedOffer.xRideFree > 0 && (
                                          <div>
                                            <dt className="text-sm font-medium text-gray-500">Free after X Rides</dt>
                                            <dd>{expandedOffer.xRideFree}</dd>
                                          </div>
                                        )}
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Main Page</dt>
                                          <dd>{expandedOffer.isMainPage ? 'Yes' : 'No'}</dd>
                                        </div>
                                      </dl>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium">Time Period</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <dl className="space-y-2">
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                                          <dd className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                                            {formatDate(expandedOffer.startDate)}
                                          </dd>
                                        </div>
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">End Date</dt>
                                          <dd className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                                            {formatDate(expandedOffer.endDate)}
                                          </dd>
                                        </div>
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                          <dd>{new Date(expandedOffer.createdAt).toLocaleString()}</dd>
                                        </div>
                                      </dl>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card className="md:col-span-3">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium">Description & Terms</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                                          <p className="bg-white p-3 rounded border">{expandedOffer.description}</p>
                                        </div>
                                        
                                        {expandedOffer.termsAndConditions && (
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">Terms and Conditions</h4>
                                            <div className="bg-white p-3 rounded border whitespace-pre-line">
                                              {expandedOffer.termsAndConditions}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="location" className="mt-0">
                                <div className="bg-white rounded-lg border p-4">
                                  <h3 className="text-lg font-medium mb-2">Location Information</h3>
                                  
                                  {expandedOffer.type === 'LOCATION' && expandedOffer.locationBoundaries ? (
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="text-sm font-medium">Location Boundaries</h4>
                                        {expandedOffer.locationBoundaries.coordinates && 
                                         expandedOffer.locationBoundaries.coordinates[0] && 
                                         expandedOffer.locationBoundaries.coordinates[0].length > 0 ? (
                                          <div className="mt-2">
                                            <div className="text-sm mb-2">
                                              <span className="font-medium">Type:</span> {expandedOffer.locationBoundaries.type}
                                            </div>
                                            <div className="text-sm">
                                              <span className="font-medium">Number of boundary points:</span> {expandedOffer.locationBoundaries.coordinates[0].length}
                                            </div>
                                            <div className="mt-4 bg-gray-100 p-4 rounded-lg border">
                                              <div className="text-sm text-gray-500">
                                                A visualization map would be displayed here with the offer's location boundaries.
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center mt-2 text-amber-600">
                                            <Info className="w-4 h-4 mr-2" />
                                            No location boundaries defined for this offer.
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-gray-500">
                                      <Info className="w-4 h-4 mr-2" />
                                      This offer type ({expandedOffer.type}) does not require location information.
                                    </div>
                                  )}
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="json" className="mt-0">
                                <div className="bg-gray-900 text-white p-4 rounded-lg overflow-auto max-h-[500px]">
                                  <pre className="text-xs">
                                    {JSON.stringify(expandedOffer, null, 2)}
                                  </pre>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
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