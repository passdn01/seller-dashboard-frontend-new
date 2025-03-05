import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, ChevronUp, MapPin, Info } from "lucide-react";
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

import CityCreate from './CityCreate';
import CityToggle from './CityToggle';
// import CityUpdate from './CityUpdate';
import BoundariesDisplayMap from './BoundariesDisplayMap';

function CityTable() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCityId, setExpandedCityId] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [expandedTab, setExpandedTab] = useState('details');

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://vayu-backend-1.onrender.com/admin/city');
      if (response.data && Array.isArray(response.data)) {
        setCities(response.data);
      } else {
        throw new Error('Failed to fetch cities: Invalid response format');
      }
      setLoading(false);
    } catch (error) {
      setError(error.message || 'An error occurred while fetching cities');
      setLoading(false);
    }
  };

  const handleToggleStatusClick = (cityId, e) => {
    e.stopPropagation();
    setSelectedCityId(cityId);
    setShowStatusDialog(true);
  };

  const handleStatusToggleComplete = (updatedCity) => {
    setCities(cities.map(city => 
      city._id === updatedCity._id ? updatedCity : city
    ));
    setShowStatusDialog(false);
  };

  const toggleExpandCity = (cityId) => {
    if (expandedCityId === cityId) {
      setExpandedCityId(null);
    } else {
      setExpandedCityId(cityId);
      setExpandedTab('details'); // Reset to details tab when expanding a new city
    }
  };

  // Format coordinates as a readable string
  const formatCoordinates = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return 'N/A';
    }
    return `${coordinates[1].toFixed(4)}° N, ${coordinates[0].toFixed(4)}° E`;
  };

  // Get expanded city data
  const getExpandedCityData = () => {
    return cities.find(city => city._id === expandedCityId);
  };

  // Define columns for Tanstack React Table
  const columns = useMemo(() => [
    {
      accessorKey: 'cityId',
      header: 'City ID',
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="font-medium">{row.original._id}</span>
          {expandedCityId === row.original._id ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'City Name',
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const coordinates = row.original.location?.coordinates;
        return formatCoordinates(coordinates);
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "success" : "destructive"}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString();
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <CityUpdate 
                cityId={row.original._id}
                onSuccess={fetchCities}
                onClose={() => {}} 
              />
            </DialogContent>
          </Dialog> */}
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
  ], [expandedCityId]);

  // Initialize Tanstack Table
  const table = useReactTable({
    data: cities,
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
          <Button onClick={fetchCities} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const expandedCity = getExpandedCityData();

  return (
    <Card className="mx-4 my-4">
      <CardHeader>
        <CardTitle>Cities</CardTitle>
        <CardDescription>Manage cities for your service</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={fetchCities}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                Add New City
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <CityCreate onSuccess={fetchCities} />
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
                  <TableCell colSpan={columns.length} className="text-center py-6">No cities found</TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map(row => (
                  <>
                    <TableRow 
                      key={row.id} 
                      className={`cursor-pointer hover:bg-gray-50 ${expandedCityId === row.original._id ? 'bg-gray-100' : ''}`}
                      onClick={() => toggleExpandCity(row.original._id)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandedCityId === row.original._id && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="p-0 border-t-0">
                          <div className="bg-gray-50 p-6">
                            <Tabs value={expandedTab} onValueChange={setExpandedTab}>
                              <TabsList className="mb-4">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="map">Map View</TabsTrigger>
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
                                          <dt className="text-sm font-medium text-gray-500">City Name</dt>
                                          <dd>{expandedCity.name}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">City ID</dt>
                                          <dd className="font-mono text-xs">{expandedCity._id}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                                          <dd>
                                            <Badge variant={expandedCity.isActive ? "success" : "destructive"}>
                                              {expandedCity.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                          </dd>
                                        </div>
                                      </dl>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium">Location</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <dl className="space-y-2">
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
                                          <dd className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1 text-red-500" />
                                            {formatCoordinates(expandedCity.location?.coordinates)}
                                          </dd>
                                        </div>
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Latitude</dt>
                                          <dd>{expandedCity.location?.coordinates?.[1]?.toFixed(6) || 'N/A'}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Longitude</dt>
                                          <dd>{expandedCity.location?.coordinates?.[0]?.toFixed(6) || 'N/A'}</dd>
                                        </div>
                                      </dl>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium">Timestamps</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <dl className="space-y-2">
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                          <dd>{new Date(expandedCity.createdAt).toLocaleString()}</dd>
                                        </div>
                                        <div>
                                          <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                          <dd>{new Date(expandedCity.updatedAt).toLocaleString()}</dd>
                                        </div>
                                      </dl>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card className="md:col-span-3">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium">Boundaries Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {expandedCity.boundaries?.coordinates?.[0]?.length > 0 ? (
                                        <div>
                                          <div className="flex items-center mb-2">
                                            <MapPin className="w-4 h-4 mr-2 text-green-600" />
                                            <span className="font-medium">
                                              {expandedCity.boundaries.coordinates[0].length - 1} boundary points defined
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-500">
                                            This city has a defined boundary polygon. Switch to the Map tab to visualize the city boundaries.
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="flex items-center">
                                          <Info className="w-4 h-4 mr-2 text-amber-500" />
                                          <span className="text-amber-700">No boundaries defined for this city</span>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="map" className="mt-0">
                                <div className="bg-white rounded-lg border p-4">
                                  <h3 className="text-lg font-medium mb-2">{expandedCity.name} - Map View</h3>
                                  <div className="h-[500px] w-full">
                                    {expandedCity.location?.coordinates && (
                                      <BoundariesDisplayMap
                                        center={expandedCity.location.coordinates} 
                                        boundaries={expandedCity.boundaries}
                                      />
                                    )}
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="json" className="mt-0">
                                <div className="bg-gray-900 text-white p-4 rounded-lg overflow-auto max-h-[500px]">
                                  <pre className="text-xs">
                                    {JSON.stringify(expandedCity, null, 2)}
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
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, cities.length)} of {cities.length} cities
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
      {showStatusDialog && (
        <CityToggle 
          cityId={selectedCityId} 
          isOpen={showStatusDialog} 
          onClose={() => setShowStatusDialog(false)}
          onToggleComplete={handleStatusToggleComplete}
        />
      )}
    </Card>
  );
}

export default CityTable;