import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BUYER_URL_LOCAL } from "@/lib/utils";

function RideDetail({ transactionId, distance, userInfo }) {
    console.log("userInfo is ", userInfo)
    const [rideData, setRideData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // if (!transactionId || !distance) return <div className="p-4 text-center">No ride data available</div>;
    useEffect(() => {
        if (!transactionId) return;

        setIsLoading(true);
        axios
            .post(`${BUYER_URL_LOCAL}/dashboard/api/rideDetail`, { transactionId })
            .then(response => {
                setIsLoading(false)
                console.log(response.data, "response in ride detail");
                if (response.data.success === true) {
                    setRideData(response.data.data);

                }
            })
            .catch((error) => {
                console.error("Error fetching ride details:", error);
                setIsLoading(false);
            });
    }, [transactionId]);

    if (isLoading) return <div className="p-4 text-center">Loading...</div>;
    if (!rideData) return <div className="p-4 text-center">No ride data available</div>;

    const startLocation = rideData.locations.find(loc => loc.type === "START")?.location;
    const endLocation = rideData.locations.find(loc => loc.type === "END")?.location;
    const startCoords = startLocation?.gps.split(",").map(Number) || [0, 0];
    const endCoords = endLocation?.gps.split(",").map(Number) || [0, 0];
    console.log(rideData, "rideData in before driver")
    const driver = rideData?.driverDetails ? rideData?.driverDetails[0] : {} || rideData?.driverDetails || {}



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
                            <Marker position={endCoords}>
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
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Type:</span>
                            <span>{driver?.vehicleDetail?.make || "N/A"}</span>
                        </div>
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

                    {/* Time and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold">Status</p>
                            <p>{rideData.status}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Status Code</p>
                            <p>{rideData.statusCode}</p>
                        </div>
                    </div>

                    {/* Fare */}
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

                    {/* Driver Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold">Driver Name:</p>
                            <p>{driver?.name || "N/A"}</p>
                            <p className="text-sm font-semibold mt-2">Phone Number:</p>
                            <p>{driver?.phone || "N/A"}</p>

                        </div>
                        <div>
                            <p className="text-sm font-semibold">Vehicle Type:</p>
                            <p>{driver?.vehicleDetail?.make || "N/A"}</p>
                            <p className="text-sm font-semibold mt-2">Vehicle Number:</p>
                            <p>{driver?.vehicleDetail?.registration || "N/A"}</p>
                            <p className="text-sm font-semibold mt-2">Ride Status:</p>
                            <p>{rideData.status}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RideDetail;