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
  status: z.string().default("A"),
});

const CreateOffer = ({ onSuccess }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get date one month from now
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthDate = nextMonth.toISOString().split('T')[0];

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
      startDate: today,
      endDate: nextMonthDate,
      isMainPage: false,
      isActive: true,
      location: {
        radius: 300,
        coordinate: {
          lat: "",
          long: ""
        }
      },
      navigationLink: '',
      image: 'https://example.com/images/offer.jpg',
      posterImage: 'https://example.com/images/poster.jpg',
      status: 'A',
    },
  });

  // Fetch cities for dropdown
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('https://3n8qx2vb-8055.inc1.devtunnels.ms/admin/city');
        setCities(response.data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setError('Failed to load cities. Please try again.');
      }
    };

    fetchCities();
  }, []);

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

      console.log('Submitting offer:', formattedValues);

      const response = await axios.post('https://3n8qx2vb-8055.inc1.devtunnels.ms/offers', formattedValues);
      
      setSuccess(true);
      
      // Call the onSuccess callback from parent
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    form.handleSubmit(onSubmit)(e);
  };

  const handleTabNavigation = (direction) => {
    const tabs = ["basic", "details", "location", "schedule"];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (direction === 'next' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Create New Offer</CardTitle>
        <CardDescription>
          Add a new promotional offer to your platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <AlertDescription>
              Offer created successfully!
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Offer Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form noValidate onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="mt-0">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
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
                          defaultValue={field.value}
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
                  {(offerType === 'CASHBACK_OFFER' || offerType === 'EVERY_RIDE_CASHBACK_RIDE') && (
                    <>
                      <FormField
                        control={form.control}
                        name="minCoin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Coin</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="50" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              Minimum coins required to avail this offer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="maxCoin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Coin</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="200" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} 
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Percentage</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} 
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

                  {offerType === 'X_RIDE_AFTER_ONE_RIDE_FREE' && (
                    <FormField
                      control={form.control}
                      name="xRideFree"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Free After X Rides</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} 
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
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Location Tab */}
              <TabsContent value="location" className="mt-0">
                {offerType === 'LOCATION' ? (
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
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Radius (meters)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="300" 
                                  {...field}
                                  value={field.value || 300}
                                  onChange={(e) => field.onChange(Number(e.target.value))} 
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
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-amber-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <p className="text-muted-foreground mb-2">
                      Location settings are only available for LOCATION type offers.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please change the offer type to LOCATION to configure location-based settings.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="mt-0">
                <div className="space-y-4">
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

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">Active</SelectItem>
                            <SelectItem value="I">Inactive</SelectItem>
                            <SelectItem value="E">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Set the initial status of the offer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            checked={field.value}
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
                  disabled={activeTab === "basic"}
                >
                  Previous
                </Button>
                
                {activeTab !== "schedule" ? (
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
                  <Button 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Offer"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CreateOffer;