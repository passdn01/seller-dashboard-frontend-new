import React, { useState, useEffect } from 'react';
import { Calendar, Info, MapPin, Tag, Clock, Percent, Coins, Users, FileText, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import LocationSelected from './LocationSelected';

const OfferInTable = ({ offer }) => {
  const [expandedTab, setExpandedTab] = useState('details');
  const [availableTabs, setAvailableTabs] = useState(['details', 'json']);

  // Set available tabs based on offer type
  useEffect(() => {
    if (!offer) return;
    
    const tabs = ['details', 'json'];
    if (offer.type === 'LOCATION') {
      tabs.splice(1, 0, 'location'); // Insert location tab between details and json
    }
    
    setAvailableTabs(tabs);
    
    // If previously on location tab but type changed, switch to details
    if (expandedTab === 'location' && offer.type !== 'LOCATION') {
      setExpandedTab('details');
    }
  }, [offer, expandedTab]);

  if (!offer) return null;

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

  // Get status badge with appropriate color
  const getStatusBadge = (status, isActive, startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isActive) {
      return <Badge variant="destructive" className="px-3 py-1">Inactive</Badge>;
    }
    
    if (end < now) {
      return <Badge variant="destructive" className="px-3 py-1">Expired</Badge>;
    }
    
    if (start > now) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">Scheduled</Badge>;
    }
    
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">Active</Badge>;
  };

  // Get appropriate icon for offer type
  const getOfferTypeIcon = (type) => {
    switch (type) {
      case 'CASHBACK_OFFER':
        return <Percent className="w-4 h-4 text-purple-500" />;
      case 'EVERY_RIDE_CASHBACK_RIDE':
        return <Coins className="w-4 h-4 text-blue-500" />;
      case 'LOCATION':
        return <MapPin className="w-4 h-4 text-green-500" />;
      case 'X_RIDE_AFTER_ONE_RIDE_FREE':
        return <Users className="w-4 h-4 text-orange-500" />;
      default:
        return <Tag className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white p-6 border-t border-gray-200 shadow-inner">
      <Tabs value={expandedTab} onValueChange={setExpandedTab} className="w-full">
        <TabsList className={`mb-4 w-full max-w-md mx-auto grid grid-cols-${availableTabs.length} gap-1 bg-gray-100 p-1`}>
          <TabsTrigger value="details" className="rounded-md">
            Details
          </TabsTrigger>
          
          {offer.type === 'LOCATION' && (
            <TabsTrigger value="location" className="rounded-md">
              Location
            </TabsTrigger>
          )}
          
          <TabsTrigger value="json" className="rounded-md">
            JSON
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4 animate-in fade-in-50 duration-300">
          {/* Offer header with title and status */}
          <h2 className="text-lg font-mono ml-2">{offer._id}</h2>
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center mb-2 sm:mb-0">
              {getOfferTypeIcon(offer.type)}
              <h2 className="text-xl font-semibold ml-2">{offer.title}</h2>
            </div>
            {getStatusBadge(
              offer.status,
              offer.isActive,
              offer.startDate,
              offer.endDate
            )}
          </div>
          
          <p className="text-gray-500 mb-6 text-base">{offer.subtitle}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Basic information */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-gray-50 border-b pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <Info className="w-4 h-4 mr-2 text-blue-500" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Type</span>
                    <div className="mt-1 flex items-center">
                      {getOfferTypeIcon(offer.type)}
                      <Badge variant="outline" className="font-mono text-xs ml-2">
                        {offer.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Navigation Link</span>
                    <p className="mt-1 text-sm truncate font-mono bg-gray-50 p-2 rounded text-gray-600">
                      {offer.navigationLink || 'None'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Featured</span>
                    <p className="mt-1 text-sm">
                      {offer.isMainPage ? 
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Featured on Main Page</Badge> : 
                        <span className="text-gray-500">Not featured</span>
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Middle column - Offer details */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-gray-50 border-b pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <Award className="w-4 h-4 mr-2 text-purple-500" />
                  Offer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {offer.minCoin && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Min Coin</span>
                      <p className="mt-1 text-sm font-medium bg-gray-50 p-2 rounded">
                        <span className="font-mono">{offer.minCoin}</span> coins
                      </p>
                    </div>
                  )}
                  
                  {offer.maxCoin && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Max Coin</span>
                      <p className="mt-1 text-sm font-medium bg-gray-50 p-2 rounded">
                        <span className="font-mono">{offer.maxCoin}</span> coins
                      </p>
                    </div>
                  )}
                  
                  {offer.percentage && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Percentage</span>
                      <p className="mt-1 text-sm font-medium bg-gray-50 p-2 rounded flex items-center">
                        <Percent className="w-4 h-4 mr-1 text-green-500" />
                        <span className="font-mono">{offer.percentage}</span>%
                      </p>
                    </div>
                  )}
                  
                  {offer.xRideFree > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Free Ride After</span>
                      <p className="mt-1 text-sm font-medium bg-gray-50 p-2 rounded">
                        Every <span className="font-mono">{offer.xRideFree}</span> rides
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Right column - Time Period */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-gray-50 border-b pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-orange-500" />
                  Time Period
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Start Date</span>
                    <p className="mt-1 flex items-center bg-gray-50 p-2 rounded text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      {formatDate(offer.startDate)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">End Date</span>
                    <p className="mt-1 flex items-center bg-gray-50 p-2 rounded text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-red-500" />
                      {formatDate(offer.endDate)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Created</span>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(offer.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Full width - Description & Terms */}
            <Card className="lg:col-span-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-gray-50 border-b pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-700" />
                  Description & Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Description</span>
                    <div className="mt-2 bg-white p-4 rounded border border-gray-200">
                      {offer.description}
                    </div>
                  </div>
                  
                  {offer.termsAndConditions && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Terms and Conditions</span>
                      <div className="mt-2 bg-white p-4 rounded border border-gray-200 whitespace-pre-line text-sm text-gray-700">
                        {offer.termsAndConditions}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Location Tab - Only shown when offer type is LOCATION */}
        {offer.type === 'LOCATION' && (
          <TabsContent value="location" className="mt-4 animate-in fade-in-50 duration-300">
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b pb-3">
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Location Information
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Use the new LocationSelected component */}
                <LocationSelected location={offer.location} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="json" className="mt-4 animate-in fade-in-50 duration-300">
          <Card className="border border-gray-800 shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-800 text-gray-200 border-b border-gray-700 pb-3">
              <CardTitle className="flex items-center text-sm">
                <FileText className="w-4 h-4 mr-2 text-blue-400" />
                JSON Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-gray-900 text-gray-300 p-4 overflow-auto max-h-[600px] font-mono">
                <pre className="text-xs">
                  {JSON.stringify(offer, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfferInTable;