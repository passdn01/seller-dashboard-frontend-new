import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { Icon } from 'leaflet'
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { SELLER_URL_LOCAL } from "@/lib/utils";

function RideDetail({ transactionId, distance, dataFromTable }) {
    console.log(dataFromTable, "data from table")
    const driverDetails = dataFromTable?.driverDetails
    const driver = driverDetails.length > 0 ? driverDetails[driverDetails.length - 1] : null
    const locations = dataFromTable?.locations
    const [rideData, setRideData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!transactionId) return;

        setIsLoading(true);
        axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/rideDetail`, { transactionId })
            .then(response => {
                setIsLoading(false);
                if (response.data.success) {
                    setRideData(response.data.data);
                    console.log(response.data, "data from api")
                    setStatus(response.data.data.status);
                }
            })
            .catch(error => {
                console.error("Error fetching ride details:", error);
                setIsLoading(false);
            });
    }, [transactionId]);

    const updateRideStatus = async () => {
        if (!rideData) return;

        setErrorMessage("");

        try {
            // Make both requests simultaneously
            const [response1, response2] = await Promise.all([
                axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/rideStatusUpdate`, { transactionId, status }),
                axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/rideStatusUpdate`, { transactionId, status }) // Assuming a second endpoint
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

    if (isLoading) return <div className="p-4 text-center">Loading...</div>;
    if (!rideData) return <div className="p-4 text-center">No ride data available</div>;

    const startLocation = locations.find(loc => loc.type === "START")?.location;
    const endLocation = locations.find(loc => loc.type === "END")?.location;
    const startCoords = startLocation?.gps.split(",").map(Number) || [0, 0];
    const endCoords = endLocation?.gps.split(",").map(Number) || [0, 0];
    const userInfo = rideData.userInfo

    return (
        <div className="p-4 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side - Map */}
                <div className="bg-gray-100 rounded-lg h-[400px]">
                    <MapContainer center={startCoords} zoom={13} className="h-full w-full rounded-lg">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {startLocation && (
                            <Marker position={startCoords}>
                                <Popup>{startLocation.address}</Popup>
                            </Marker>
                        )}
                        {endLocation && (
                            <Marker position={endCoords} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })}>
                                <Popup>{endLocation.address}</Popup>
                            </Marker>
                        )}
                        <Polyline positions={[startCoords, endCoords]} color="blue" />
                    </MapContainer>
                </div>

                {/* Right side - Details */}
                <div className="space-y-4">
                    {/* Ride ID and Type */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Transaction Id:</span>
                            <span className="text-gray-600">{rideData.transaction_id}</span>
                        </div>
                        {driver?.vehicleDetail?.make && (<div className="flex items-center gap-2">
                            <span className="font-semibold">Vehicle Type:</span>
                            <span>{driver?.vehicleDetail?.make || "N/A"}</span>
                        </div>)}
                    </div>

                    {/* Locations */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <MapPin className="text-green-500 mt-1 flex-shrink-0" />
                            <p className="text-sm break-all">{startLocation?.address}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin className="text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm break-all">{endLocation?.address}</p>
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
                            <p className="text-xl font-bold">₹{rideData.fare}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Distance</p>
                            <p className="text-xl font-bold">{distance}km</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Driver Details */}
                        <div>
                            <p className="text-sm font-semibold">User Name</p>
                            <p>{userInfo?.name || "N/A"}</p>
                            <p className="text-sm font-semibold mt-2">Number:</p>
                            <p>{userInfo?.phone || "N/A"}</p>


                        </div>
                        {driver?.name && <div>
                            <p className="text-sm font-semibold">Driver Name:</p>
                            <p>{driver?.name || "N/A"}</p>
                            <p className="text-sm font-semibold mt-2">Phone Number:</p>
                            <p>{driver?.phone || "N/A"}</p>
                        </div>}
                        {driver?.name && <div>
                            <p className="text-sm font-semibold">Vehicle Type:</p>
                            <p>{driver?.vehicleDetail?.make || "N/A"}</p>
                            <p className="text-sm font-semibold mt-2">Vehicle Number:</p>
                            <p>{driver?.vehicleDetail?.registration || "N/A"}</p>
                        </div>}


                    </div>
                </div>
            </div>
        </div>
    );
}

export default RideDetail;
