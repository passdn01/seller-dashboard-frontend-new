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
import { Alert, AlertDescription } from "@/components/ui/alert";

// Form schema with conditional fields
const formSchema = z.object({
  notification: z.enum(["all", "custom"]),
  title: z.string().min(1, "Title must be at least 1 characters"),
  body: z.string().min(1, "Notification body must be at least 1 characters"),
  city: z.string().optional(),
  // Custom notification fields (optional unless notification type is "custom")
  type: z.string().optional(),
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
}).refine(data => {
  // If notification is "custom", then type, startDate, and endDate are required
  if (data.notification === "custom") {
    return !!data.type && !!data.startDate && !!data.endDate;
  }
  return true;
}, {
  message: "Type, Start Date, and End Date are required for custom notifications",
  path: ["type"], // Show error on the type field
});

// Generate time options in 12-hour format
const generateTimeOptions = () => {
  const timeOptions = [];
  for (let hour = 1; hour <= 12; hour++) {
    // Add hour:00 options
    timeOptions.push({
      value: `${hour}:00 AM`,
      label: `${hour}:00 AM`,
      hour: hour === 12 ? 0 : hour,
      minute: 0,
      period: 'AM'
    });
    
    // Add hour:30 options
    timeOptions.push({
      value: `${hour}:30 AM`,
      label: `${hour}:30 AM`,
      hour: hour === 12 ? 0 : hour,
      minute: 30,
      period: 'AM'
    });
  }
  
  for (let hour = 1; hour <= 12; hour++) {
    // Add hour:00 options for PM
    timeOptions.push({
      value: `${hour}:00 PM`,
      label: `${hour}:00 PM`,
      hour: hour === 12 ? 12 : hour + 12,
      minute: 0,
      period: 'PM'
    });
    
    // Add hour:30 options for PM
    timeOptions.push({
      value: `${hour}:30 PM`,
      label: `${hour}:30 PM`,
      hour: hour === 12 ? 12 : hour + 12,
      minute: 30,
      period: 'PM'
    });
  }
  
  return timeOptions;
};

const timeOptions = generateTimeOptions();

const SendNotification = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Get current date in YYYY-MM-DD format for the form
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize form with defaults
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notification: "all",
      title: "",
      body: "",
      city: "",
      type: "Searched",
      startDate: today,
      startTime: "12:00 PM",
      endDate: today,
      endTime: "1:00 PM",
    },
  });

  // Watch notification type to conditionally render fields
  const notificationType = form.watch('notification');

  // Fetch cities for dropdown
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('https://airshare.co.in/admin/city');
        setCities(response.data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setError('Failed to load cities. Please try again.');
      }
    };

    fetchCities();
  }, []);

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Find the city object from cities array using the city ID
      const selectedCity = cities.find(city => city._id === data.city);
      
      // Create base payload with city name instead of ID
      const payload = {
        notification: data.notification,
        title: data.title,
        body: data.body,
        city: selectedCity ? selectedCity.name : data.city // Use city name instead of ID
      };
      
      // Add custom notification fields if notification type is "custom"
      if (data.notification === "custom") {
        payload.type = data.type;
        payload.startDate = data.startDate;
        payload.startTime = data.startTime;
        payload.endDate = data.endDate;
        payload.endTime = data.endTime;
      }
      
      console.log('Sending notification:', payload);

      // Replace with your actual API endpoint
      const response = await axios.post('https://3n8qx2vb-8055.inc1.devtunnels.ms/admin/sendNotifications', payload);
      
      setSuccess(true);
      form.reset();
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(error.response?.data?.message || error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Send Notification</CardTitle>
        <CardDescription>
          Send push notifications to users or drivers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <AlertDescription>
              Notification sent successfully!
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Notification Type and City Selection in grid */}
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                    control={form.control}
                    name="notification"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notification Type</FormLabel>
                        <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        >
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select who to notify" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {/* City Selection */}
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
              </div>

              {/* Notification Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Vayu Auto - Ek Tap, No Wait!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notification Body */}
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Body</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Sadak pe khade khade murti mat bano! Vayu se auto book karo, bina jhanjhat, bina wait ke!" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional fields for custom notification */}
              {notificationType === "custom" && (
                <>
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ride Status Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || "Searched"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ride status type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cancelled">Cancelled Rides</SelectItem>
                            <SelectItem value="Completed">Completed Rides</SelectItem>
                            <SelectItem value="Assigned">Assigned Rides</SelectItem>
                            <SelectItem value="Searched">Searched Rides</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This determines which users will receive the notification based on their ride status
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeOptions.map((time, index) => (
                                <SelectItem key={index} value={time.value}>
                                  {time.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeOptions.map((time, index) => (
                                <SelectItem key={index} value={time.value}>
                                  {time.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <div className="pt-4">
                <Button 
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Notification"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SendNotification;