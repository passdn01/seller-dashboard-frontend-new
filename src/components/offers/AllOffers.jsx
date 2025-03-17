import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

import CreateOffer from './CreateOffers';
import UpdateOffer from './UpdateOffers';
import DeleteOffer from './DeleteOffers';
import OfferInTable from './OfferInTable';

function AllOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [expandedOfferId, setExpandedOfferId] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/offers`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        setOffers(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch offers');
      }
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleDeleteClick = (offerId, e) => {
    e.stopPropagation();
    setSelectedOfferId(offerId);
    setShowDeleteDialog(true);
  };

  const handleDeleteComplete = (deletedOfferId) => {
    setOffers(offers.filter(offer => offer._id !== deletedOfferId));
    setShowDeleteDialog(false);
  };

  const toggleExpandOffer = (offerId) => {
    if (expandedOfferId === offerId) {
      setExpandedOfferId(null);
    } else {
      setExpandedOfferId(offerId);
    }
  };

  // Define columns for Tanstack React Table
  const columns = useMemo(() => [
    {
      accessorKey: 'offerId',
      header: 'Offer ID',
      cell: ({ row }) => <span className="font-medium">{row.original._id}</span>,
    },
    {
      accessorKey: 'offerName',
      header: 'Name',
      cell: ({ row }) => row.original.offerName,
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }) => (
        `${format(new Date(row.original.startDate), 'dd/MM/yyyy')} - ${format(new Date(row.original.endDate), 'dd/MM/yyyy')}`
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <span className="capitalize">{row.original.offerCriteria.type}</span>,
    },
    {
      accessorKey: 'criteria',
      header: 'Criteria',
      cell: ({ row }) => `${row.original.offerCriteria.requiredCount} ${row.original.offerCriteria.type}`,
    },
    {
      accessorKey: 'reward',
      header: 'Reward',
      cell: ({ row }) => `₹${row.original.reward}`,
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
            <DialogContent className="sm:max-w-[800px]">
              <UpdateOffer offer={row.original} onSuccess={fetchOffers} />
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => handleDeleteClick(row.original._id, e)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ], []);

  // Initialize Tanstack Table
  const table = useReactTable({
    data: offers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
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

  return (
    <Card className="mx-4 my-4">
      <CardHeader>
        <CardTitle>Offers</CardTitle>
        <CardDescription>Manage your customer offers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={fetchOffers}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Add New Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
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
                      className={`cursor-pointer ${expandedOfferId === row.original._id ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleExpandOffer(row.original._id)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandedOfferId === row.original._id && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="p-0 border-t-0">
                          <div className="bg-gray-50 p-4">
                            <OfferInTable offer={row.original} />
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <DeleteOffer
          offerId={selectedOfferId}
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onDeleteComplete={handleDeleteComplete}
        />
      )}
    </Card>
  );
}

export default AllOffers;