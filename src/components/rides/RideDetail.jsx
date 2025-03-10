import React, { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { Icon } from 'leaflet';
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { SELLER_URL_LOCAL } from "@/lib/utils";

function RideDetail({ dataFromTable = {} }) {
    // Add a default empty object to prevent destructuring errors
    const driverDetails = dataFromTable?.driverDetails || [];
    const driver = driverDetails.length > 0 ? driverDetails[driverDetails.length - 1] : null;
    const locations = dataFromTable?.locations || [];
    const [status, setStatus] = useState(dataFromTable?.status || "PENDING");
    const [errorMessage, setErrorMessage] = useState("");
    const transactionId = dataFromTable?.transaction_id;

    const updateRideStatus = async () => {
        if (!transactionId) {
            setErrorMessage("Transaction ID is missing");
            return;
        }

        setErrorMessage("");

        try {
            // Make both requests simultaneously
            const [response1, response2] = await Promise.all([
                axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/rideStatusUpdate`, { transactionId, status }),
                axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/rideStatusUpdate`, { transactionId, status })
            ]);

            if (response1.data.success && response2.data.success) {
                alert("Ride status updated successfully!");
            } else {
                // Show error messages from both responses
                const errorMessages = [
                    response1.data.success ? "" : response1.data.message,
                    response2.data.success ? "" : response2.data.message
                ].filter(msg => msg).join(" | ");

                setErrorMessage(errorMessages || "Failed to update ride status.");
            }
        } catch (error) {
            console.error("Error updating ride status:", error);
            setErrorMessage("An error occurred while updating the ride status.");
        }
    };

    // Handle missing data gracefully
    if (!dataFromTable || Object.keys(dataFromTable).length === 0) {
        return <div className="p-4 text-center">No ride data available</div>;
    }

    const startLocation = locations.find(loc => loc?.type === "START")?.location;
    const endLocation = locations.find(loc => loc?.type === "END")?.location;
    const startCoords = startLocation?.gps?.split(",").map(Number) || [20.5937, 78.9629]; // Default to India coords
    const endCoords = endLocation?.gps?.split(",").map(Number) || [20.5937, 78.9629];
    const userInfo = dataFromTable.userDetails || {};

    return (
        <div className="p-4 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side - Map */}
                <div className="bg-gray-100 rounded-lg h-[400px] z-20">
                    <MapContainer center={startCoords} zoom={13} className="h-full w-full rounded-lg ">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {startLocation && (
                            <Marker position={startCoords}>
                                <Popup>{startLocation.address || "Start Location"}</Popup>
                            </Marker>
                        )}
                        {endLocation && (
                            <Marker position={endCoords} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })}>
                                <Popup>{endLocation.address || "End Location"}</Popup>
                            </Marker>
                        )}
                        {startLocation && endLocation && (
                            <Polyline positions={[startCoords, endCoords]} color="blue" />
                        )}
                    </MapContainer>
                </div>

                {/* Right side - Details */}
                <div className="space-y-4">
                    {/* Ride ID and Type */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Transaction Id:</span>
                            <span className="text-gray-600">{transactionId || "N/A"}</span>
                        </div>
                        {driver?.vehicleDetail?.make && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Vehicle Type:</span>
                                <span>{driver.vehicleDetail.make}</span>
                            </div>
                        )}
                    </div>

                    {/* Locations */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <MapPin className="text-green-500 mt-1 flex-shrink-0" />
                            <p className="text-sm break-all">{startLocation?.address || "Start address not available"}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin className="text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm break-all">{endLocation?.address || "End address not available"}</p>
                        </div>
                    </div>

                    {/* Status Form */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold">Ride Status</label>
                            <select
                                className="block w-full p-2 border border-gray-300 rounded-lg"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600"
                                onClick={updateRideStatus}
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Display error message if there's any */}
                    {errorMessage && (
                        <div className="text-red-600 text-sm font-semibold p-2 border border-red-400 rounded-lg">
                            {errorMessage}
                        </div>
                    )}

                    {/* Fare & Distance */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold">Fare</p>
                            <p className="text-xl font-bold">₹{dataFromTable.fare || "0"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Distance</p>
                            <p className="text-xl font-bold">{dataFromTable.distance || "0"}km</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* User Details */}
                        <div>
                            <p className="text-sm font-semibold">User Name</p>
                            <p>{userInfo?.firstName && userInfo?.lastName ? `${userInfo.firstName} ${userInfo.lastName}` : "N/A"}</p>
                            <p className="text-sm font-semibold mt-2">Number:</p>
                            <p>{userInfo?.phone || "N/A"}</p>
                        </div>

                        {/* Driver Details - only show if driver exists */}
                        {driver?.name && (
                            <div>
                                <p className="text-sm font-semibold">Driver Name:</p>
                                <p>{driver.name}</p>
                                <p className="text-sm font-semibold mt-2">Phone Number:</p>
                                <p>{driver.phone || "N/A"}</p>
                            </div>
                        )}

                        {/* Vehicle Details - only show if vehicle exists */}
                        {driver?.vehicleDetail && (
                            <div>
                                <p className="text-sm font-semibold">Vehicle Type:</p>
                                <p>{driver.vehicleDetail.make || "N/A"}</p>
                                <p className="text-sm font-semibold mt-2">Vehicle Number:</p>
                                <p>{driver.vehicleDetail.registration || "N/A"}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RideDetail;