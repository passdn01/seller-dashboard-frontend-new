import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, MapPin, Calendar, Phone, User, TruckIcon, FileText, DollarSign, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
// import MessagesCard from "./MessagesCard";

const IssueDetailExpandable = ({ issueId, onClose }) => {
  const [issue, setIssue] = useState(null);
  const [ride, setRide] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (issueId) {
      fetchIssueDetails();
    }
  }, [issueId]);

  const fetchIssueDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/${issueId}`
      );
      setIssue(response.data);

      if (response.data?.rideId) {
        fetchRideDetails(response.data.rideId);
      } else {
        setRide(null);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching issue details:", error);
      setError("Failed to fetch issue details");
      setLoading(false);
    }
  };

  const fetchRideDetails = async (rideId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/rideTransaction/${rideId}`
      );
      setRide(response.data.data.ride);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching ride details:", error);
      setError("Failed to fetch ride details");
      setLoading(false);
    }
  };

  const markComplete = async (ticketId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/${ticketId}/solve`
      );
      fetchIssueDetails();
    } catch (err) {
      setError("Failed to mark the ticket as complete");
    }
  };

  const markPending = async (ticketId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/${ticketId}/pending`
      );
      fetchIssueDetails();
    } catch (err) {
      setError("Failed to mark the ticket as pending");
    }
  };
  const navigate = useNavigate()

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'active':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) return (
    <tr>
      <td colSpan="10" className="p-4 bg-gray-50">
        <div className="flex justify-center py-8">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  if (!issue) return null;




  const user = issue?.userId || {};
  console.log(user, "issue.userId")

  const handleUserNameClick = async () => {
    if (user?._id) {
      window.open(`/users/${user?._id}`, "_blank")
    }
  };

  const handleRideClick = async () => {
    if (ride?.transaction_id) {
      window.open(`/rides/allRides/${ride?.transaction_id}`, "_blank")
    }
  };

  const handleDriverClick = async () => {
    if (ride?.driverId) {
      window.open(`/drivers/allDrivers/${ride?.driverId}`, "_blank")
    }
  }
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName}` : "Unknown User";
  const formattedDate = issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : "N/A";

  console.log(ride, "ride")

  return (
    <tr className="border-t border-b border-gray-200">
      <td colSpan="10" className="p-0 w-full">
        <div className="w-full bg-white overflow-hidden">
          {/* Header with action buttons */}
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Ticket #{issue._id}</h3>
              <Badge className={`ml-3 ${getStatusColor(issue.status)}`}>
                {issue.status || "Unknown"}
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => markComplete(issueId)}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
                disabled={issue.status === "Completed"}
              >
                {issue.status === "Completed" ? "Completed" : "Mark Complete"}
              </Button>
              <Button
                onClick={() => markPending(issueId)}
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                disabled={issue.status === "Pending"}
              >
                {issue.status === "Pending" ? "Pending" : "Mark Pending"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 p-3 m-4 rounded-md border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Issue Information */}
              <Card className="rounded-lg shadow-sm border-gray-200">
                <CardHeader className="pb-2 bg-gray-50 border-b">
                  <CardTitle className="text-base font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    Issue Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm pt-3">
                  <div>
                    <p className="text-gray-500 text-xs">CONCERN</p>
                    <p className="font-medium">{issue.concern || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">CREATED ON</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <p>{formattedDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">TRANSACTION ID</p>
                    <p className="font-mono text-gray-700">{issue.rideId || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* User Information */}
              <Card className="rounded-lg shadow-sm border-gray-200">
                <CardHeader className="pb-2 bg-gray-50 border-b">
                  <CardTitle className="text-base font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    <p className={`font-medium ${user?._id ? "cursor-pointer underline" : ""}`} onClick={handleUserNameClick}>User Information</p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm pt-3">
                  <div>
                    <p className="text-gray-500 text-xs">NAME</p>
                    <p className='font-medium'>{displayName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">PHONE</p>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                      <p>{user?.phone || "N/A"}</p>
                    </div>
                  </div>
                  {user?.email && (
                    <div>
                      <p className="text-gray-500 text-xs">EMAIL</p>
                      <p>{user.email}</p>
                    </div>
                  )}
                </CardContent>
                {ride?.driverId && <span className=" cursor-pointer p-2 bg-blue-200 rounded m-4 mt-16" onClick={handleDriverClick}>View Driver Info Page</span>}
              </Card>

              {/* Ride Information */}
              {ride ? (
                <Card className="rounded-lg shadow-sm border-gray-200">
                  <CardHeader className="pb-2 bg-gray-50 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium flex items-center">
                        <TruckIcon className="h-4 w-4 mr-2 text-blue-500" />
                        <p className={`font-medium ${ride?.transaction_id ? "cursor-pointer underline" : ""}`} onClick={handleRideClick}>Ride Information</p>
                      </CardTitle>
                      <Badge className={getStatusColor(ride.status)}>
                        {ride.status || "Unknown"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm pt-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <div className="flex items-start mb-2">
                          <div className="mr-2 mt-1">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <div className="w-0.5 h-8 bg-gray-300 ml-1.5"></div>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">PICKUP</p>
                            <p className="font-medium">{ride.location?.fromLocation?.name || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="mr-2 mt-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">DROP</p>
                            <p className="font-medium">{ride.location?.toLocation?.name || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-100 flex flex-col items-center justify-center">
                        <p className="text-xs text-gray-500">FARE</p>
                        <p className="text-lg font-semibold flex items-center">
                          ₹{ride.fare || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex flex-col items-center justify-center">
                        <p className="text-xs text-gray-500">DISTANCE</p>
                        <p className="text-lg font-semibold flex items-center">
                          <Navigation className="h-4 w-4 text-blue-500" />
                          {ride.distance || "N/A"} km
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="rounded-lg shadow-sm border-gray-200">
                  <CardHeader className="pb-2 bg-gray-50 border-b">
                    <CardTitle className="text-base font-medium flex items-center">
                      <TruckIcon className="h-4 w-4 mr-2 text-blue-500" />
                      Ride Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center py-8 text-sm text-gray-500">
                    No ride information available
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Messages Card would go here */}
            {/* <MessagesCard issue={issue} issueId={issueId}></MessagesCard> */}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default IssueDetailExpandable;