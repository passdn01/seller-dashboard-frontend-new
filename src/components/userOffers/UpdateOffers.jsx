import { useState, useEffect } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

// Offer types based on your API schema
const offerTypes = [
  'EVERY_RIDE_CASHBACK_RIDE',
  'CASHBACK_OFFER',
  'LOCATION',
  'X_RIDE_AFTER_ONE_RIDE_FREE'
];

// Form schema
const formSchema = z.object({
  city: z.string().min(1, "City is required"),
  type: z.enum(offerTypes),
  title: z.string().min(3, "Title must be at least 3 characters"),
  subtitle: z.string().min(3, "Subtitle must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  termsAndConditions: z.string().optional(),
  minCoin: z.number().optional(),
  maxCoin: z.number().min(1, "Maximum coin value is required"),
  percentage: z.number().optional(),
  xRideFree: z.number().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isMainPage: z.boolean().default(false),
  isActive: z.boolean().default(true),
  locationBoundaries: z.object({
    type: z.string().default("Polygon"),
    coordinates: z.array(z.array(z.array(z.number()))).default([[]])
  }).optional(),
  location: z.object({
    radius: z.number().optional(),
    coordinate: z.object({
      lat: z.string().optional(),
      long: z.string().optional(),
    }).optional()
  }).optional(),
  navigationLink: z.string().optional(),
  image: z.string().optional(),
  posterImage: z.string().optional(),
});

const UpdateOffer = ({ offerId, onSuccess, onClose }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: '',
      type: 'EVERY_RIDE_CASHBACK_RIDE',
      title: '',
      subtitle: '',
      description: '',
      termsAndConditions: '',
      minCoin: null,
      maxCoin: null,
      percentage: null,
      xRideFree: null,
      startDate: '',
      endDate: '',
      isMainPage: false,
      isActive: true,
      locationBoundaries: {
        type: "Polygon",
        coordinates: [[]]
      },
      location: {
        radius: 300,
        coordinate: {
          lat: "",
          long: ""
        }
      },
      navigationLink: '',
      image: '',
      posterImage: '',
    },
  });

  // Fetch cities for dropdown
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('https://vayu-backend-1.onrender.com/admin/city');
        setCities(response.data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setFetchError('Failed to load cities. Please try again.');
      }
    };

    fetchCities();
  }, []);

  // Fetch offer data when component mounts
  useEffect(() => {
    if (offerId) {
      fetchOfferData();
    }
  }, [offerId]);

  const fetchOfferData = async () => {
    setFetchLoading(true);
    console.log('Fetching offer data for ID:', offerId);
    try {
      const response = await axios.get(`https://vayu-backend-1.onrender.com/offers/${offerId}`);
      
      if (response.data.data) {
        const offerData = response.data.data;
        
        // Format dates for HTML date input (YYYY-MM-DD)
        const formatDate = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        // Set form values
        form.reset({
          city: offerData.city || '',
          type: offerData.type || 'EVERY_RIDE_CASHBACK_RIDE',
          title: offerData.title || '',
          subtitle: offerData.subtitle || '',
          description: offerData.description || '',
          termsAndConditions: offerData.termsAndConditions || '',
          minCoin: offerData.minCoin || null,
          maxCoin: offerData.maxCoin || null,
          percentage: offerData.percentage || null,
          xRideFree: offerData.xRideFree || null,
          startDate: formatDate(offerData.startDate),
          endDate: formatDate(offerData.endDate),
          isMainPage: offerData.isMainPage || false,
          isActive: offerData.isActive !== undefined ? offerData.isActive : true,
          locationBoundaries: offerData.locationBoundaries || {
            type: "Polygon",
            coordinates: [[]]
          },
          location: offerData.location || {
            radius: 300,
            coordinate: {
              lat: "",
              long: ""
            }
          },
          navigationLink: offerData.navigationLink || '',
          image: offerData.image || '',
          posterImage: offerData.posterImage || '',
        });
      } else {
        throw new Error('Failed to fetch offer data');
      }
    } catch (err) {
      setFetchError(err.response?.data?.message || err.message || 'An error occurred while fetching offer data');
    } finally {
      setFetchLoading(false);
    }
  };

  // Watch for form value changes to conditionally render fields
  const offerType = form.watch('type');

  // Handle form submission
  const onSubmit = async (values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Remove fields that are not needed based on offer type
      const formattedValues = { ...values };
      
      if (offerType !== 'LOCATION') {
        delete formattedValues.locationBoundaries;
        delete formattedValues.location;
      }

      if (offerType !== 'X_RIDE_AFTER_ONE_RIDE_FREE') {
        delete formattedValues.xRideFree;
      }

      if (offerType !== 'CASHBACK_OFFER' && offerType !== 'LOCATION') {
        delete formattedValues.percentage;
      }

      if (offerType !== 'CASHBACK_OFFER' && offerType !== 'EVERY_RIDE_CASHBACK_RIDE') {
        delete formattedValues.minCoin;
      }

      console.log('Updating offer:', formattedValues);

      const response = await axios.put(`https://vayu-backend-1.onrender.com/offers/${offerId}`, formattedValues);
      
      setSuccess(true);
      
      // Call the onSuccess callback from parent
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update offer');
    } finally {
      setLoading(false);
    }
  };

  // Utility to get available tabs based on offer type
  const getAvailableTabs = () => {
    const baseTabs = ["basic", "details", "schedule"];
    return offerType === 'LOCATION' ? [...baseTabs, "location"] : baseTabs;
  };
  
  const availableTabs = getAvailableTabs();

  // Update handleTabNavigation to work with dynamic tabs
  const handleTabNavigation = (direction) => {
    const currentIndex = availableTabs.indexOf(activeTab);
    
    if (direction === 'next' && currentIndex < availableTabs.length - 1) {
      setActiveTab(availableTabs[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(availableTabs[currentIndex - 1]);
    }
  };
  
  // When offer type changes, check if we need to change the active tab
  useEffect(() => {
    // If current active tab is "location" but offer type is not LOCATION
    if (activeTab === "location" && offerType !== 'LOCATION') {
      // Set to a default tab
      setActiveTab("details");
    }
  }, [offerType, activeTab]);

  // Handle manual form submission when Update button is clicked
  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent default form behavior
    if (activeTab === availableTabs[availableTabs.length - 1]) {
      // The problem could be here - this might not be properly invoking the form submission
      // Let's modify it to ensure it calls onSubmit with the form values
      const values = form.getValues();
      onSubmit(values);
    } else {
      handleTabNavigation('next'); // Otherwise just navigate to next tab
    }
  };
  
  
  // // Separate function to handle direct update button click
  // const handleUpdateClick = () => {
  //   // Manually validate and submit the form
  //   form.handleSubmit(onSubmit)();
  // };

  if (fetchLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2">Loading offer data...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fetchError}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Update Offer</CardTitle>
        <CardDescription>
          Modify the details of an existing promotional offer
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <AlertDescription>
              Offer updated successfully!
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert className="mb-6 bg-red-50 text-red-700 border-red-200">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full mb-6 ${offerType === 'LOCATION' ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Offer Details</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            {offerType === 'LOCATION' && (
              <TabsTrigger value="location">Location</TabsTrigger>
            )}
          </TabsList>

          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="mt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city._id} value={city._id}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offer Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select offer type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {offerTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The type of offer determines which fields are required
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="15% Cashback on Every Ride" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                          <Input placeholder="Limited time offer for downtown rides" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enjoy 15% cashback (up to ₹200) on all rides within downtown area..." 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/images/offer.jpg" {...field} />
                          </FormControl>
                          <FormDescription>
                            Main offer image URL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="posterImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Poster Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/images/poster.jpg" {...field} />
                          </FormControl>
                          <FormDescription>
                            Larger promotional image URL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="navigationLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Navigation Link</FormLabel>
                        <FormControl>
                          <Input placeholder="app://offers/cashback-downtown" {...field} />
                        </FormControl>
                        <FormDescription>
                          Deep link for the mobile app
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Offer Details Tab */}
              <TabsContent value="details" className="mt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(offerType === 'EVERY_RIDE_CASHBACK_RIDE' || offerType === 'CASHBACK_OFFER') && (
                    <FormField
                      control={form.control}
                      name="minCoin"
                      render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Minimum Coin</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              {...rest} 
                              value={value === null ? '' : value}
                              onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum coins required to avail this offer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="maxCoin"
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Maximum Coin</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="200" 
                            {...rest}
                            value={value === null ? '' : value}
                            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum coins that can be earned in this offer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(offerType === 'CASHBACK_OFFER' || offerType === 'LOCATION') && (
                    <FormField
                      control={form.control}
                      name="percentage"
                      render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Percentage</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              {...rest}
                              value={value === null ? '' : value}
                              onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Cashback percentage for this offer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  </div>

                  {offerType === 'X_RIDE_AFTER_ONE_RIDE_FREE' && (
                    <FormField
                      control={form.control}
                      name="xRideFree"
                      render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                          <FormLabel>X Rides Free</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5" 
                              {...rest}
                              value={value === null ? '' : value}
                              onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Number of rides after which one ride is free
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms and Conditions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="* Offer valid only for rides starting or ending in downtown area.
* Maximum cashback amount is ₹200 per ride.
* Cashback will be credited to your wallet within 24 hours of completing the ride.
* Offer cannot be combined with other ongoing promotions.
* The company reserves the right to modify or terminate the offer at any time without prior notice." 
                            className="min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isMainPage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured Offer</FormLabel>
                          <FormDescription>
                            Display this offer on the main page
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Location Tab - only rendered when offerType is LOCATION */}
              {offerType === 'LOCATION' && (
                <TabsContent value="location" className="mt-0">
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4">
                      <h3 className="text-base font-medium mb-2">Location Settings</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Define the geographical boundaries for this location-based offer.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name="location.radius"
                          render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                              <FormLabel>Radius (meters)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="300" 
                                  {...rest}
                                  value={value === null ? '300' : value}
                                  onChange={(e) => onChange(e.target.value === '' ? 300 : Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Radius of the offer location in meters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="location.coordinate.lat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="22.994877" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="location.coordinate.long"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="72.567367" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Placeholder for map component */}
                      <div className="bg-slate-200 w-full h-[300px] rounded-md flex items-center justify-center mt-4">
                        <p className="text-slate-500">Map integration would go here</p>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Note: In a production environment, this would include a map component 
                        for selecting coordinates and defining boundaries.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="mt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            When the offer becomes active
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            When the offer expires
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>
                            Toggle whether the offer is currently active
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <div className="flex justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabNavigation('prev');
                  }}
                  disabled={activeTab === availableTabs[0]}
                >
                  Previous
                </Button>
                
                {activeTab !== availableTabs[availableTabs.length - 1] ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabNavigation('next');
                    }}
                  >
                    Next
                  </Button>
                  ) : (
                    <div className="flex space-x-2">
                      {onClose && (
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={onClose}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update Offer"}
                      </Button>
                    </div>
                )}
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UpdateOffer;