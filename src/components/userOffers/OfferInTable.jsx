import { ChevronDown, ChevronUp, Calendar, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const OfferInTable = ({ 
  table, 
  columns, 
  expandedOfferId,
  expandedTab,
  setExpandedTab,
  toggleExpandOffer,
  handleToggleStatusClick,
  getStatusBadge,
  formatDate,
  getExpandedOfferData 
}) => {
  const expandedOffer = getExpandedOfferData();

  return (
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
  );
};

export default OfferInTable;