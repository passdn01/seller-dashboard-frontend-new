import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SELLER_URL_LOCAL } from "@/lib/utils";
import MessagesCard from "./MessagesCard";

const IssueDetail = () => {
  const [issue, setIssue] = useState(null);
  const [ride, setRide] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } }
      );
      setIssue(response.data);
      console.log(response.data, "issue data")

      if (response.data?.rideId) {
        fetchRideDetails(response.data.rideId);
      } else {
        setRide(null);
      }
    } catch (error) {
      console.error("Error fetching issue details:", error);
      setError("Failed to fetch issue details");
    }
  };

  const fetchRideDetails = async (rideId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/rideTransaction/${rideId}`, {}, { headers: { Authorization: `Bearer ${token}` } }
      );
      setRide(response.data.data.ride);
    } catch (error) {
      console.error("Error fetching ride details:", error);
      setError("Failed to fetch ride details");
    }
  };

  const markComplete = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/${ticketId}/solve`, {}, { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchIssueDetails();
    } catch (err) {
      setError("Failed to mark the ticket as complete");
    }
  };

  const markPending = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/${ticketId}/pending`, {}, { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchIssueDetails();
    } catch (err) {
      setError("Failed to mark the ticket as complete");
    }
  };

  if (!issue) return <div className="text-center py-6 text-gray-600">Loading...</div>;

  const user = issue?.userId || {};
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName}` : "Unknown User";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Issue Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><strong>Transaction Id: </strong>{issue.rideId || "N/A"}</p>
            <p><strong>Concern:</strong> {issue?.concern || issue?.title || "N/A"}</p>
            <p><strong>Description:</strong> {issue?.description || "N/A"}</p>
            <p><strong>Status:</strong> {issue.status || "N/A"}</p>
            <p><strong>User:</strong> {displayName}</p>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => markComplete(id)}
                className="px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700"
              >
                Mark as Complete
              </button>
              <button
                onClick={() => markPending(id)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-sm hover:bg-yellow-700"
              >
                Mark as Pending
              </button>
            </div>
          </CardContent>
        </Card>

        {ride && (
          <Card className="rounded-sm">
            <div className="flex justify-between items-center p-6">
              <p className="text-xl font-semibold">Ride Information</p>
              <p><strong>Status:</strong> {ride.status || "N/A"}</p>
            </div>
            <CardContent className="space-y-3">
              <p><strong>Pickup:</strong> {ride.location?.fromLocation?.name || "N/A"}</p>
              <p><strong>Drop:</strong> {ride.location?.toLocation?.name || "N/A"}</p>
              <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-sm p-4 border">
                  <p className="text-lg font-semibold">Fare</p>
                  <p className="text-2xl">₹{ride.fare || "N/A"}</p>
                </Card>
                <Card className="rounded-sm p-4 border">
                  <p className="text-lg font-semibold">Distance</p>
                  <p className="text-2xl">{ride.distance || "N/A"} km</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p><strong>Name:</strong> {displayName}</p>
          <p><strong>Phone:</strong> {user?.phone || "N/A"}</p>
        </CardContent>
      </Card>

      <MessagesCard issue={issue} issueId={id}></MessagesCard>


    </div>
  );
};

export default IssueDetail;
